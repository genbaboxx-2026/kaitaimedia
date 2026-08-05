import { getNumber, loadSettings } from "@/lib/ai/settings";
import { runGenerationBatch } from "@/lib/generation/run-batch";
import type { PipelineResult } from "@/lib/generation/pipeline";
import {
  clearScheduledGenerationDate,
  countTodaysGeneratedArticles,
  countTodaysGenerationAttempts,
  evaluateScheduleGate,
  markScheduledGenerationDate,
  releaseScheduleLock,
  resolveMaxScheduledAttempts,
  tryAcquireScheduleLock,
} from "@/lib/generation/schedule-gate";
import { requestPublicRevalidate } from "@/lib/request-public-revalidate";

export interface RunScheduledOptions {
  /** 1回の起動で生成する最大本数（Vercel timeout 対策。未指定なら不足分全部） */
  maxArticlesPerRun?: number;
  /** ログ用プレフィックス */
  logPrefix?: string;
}

export interface RunScheduledResult {
  ran: boolean;
  reason: string;
  jstDate: string;
  articlesPerDay: number;
  todayCount: number;
  todayAttempts: number;
  maxAttempts: number;
  producedOk: number;
  publishedDrafts: number;
  results: PipelineResult[];
  publishedSlugs: string[];
}

function newLockOwner(): string {
  return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function log(prefix: string, message: string): void {
  console.log(`${prefix} ${message}`);
}

/**
 * 定時生成本体（GitHub Actions / Vercel Cron 共通）。
 * process.exit はしない。呼び出し側で HTTP/CLI 終了コードを決める。
 */
export async function runScheduledGeneration(
  opts: RunScheduledOptions = {},
): Promise<RunScheduledResult> {
  const prefix = opts.logPrefix ?? "[schedule]";
  const gate = await evaluateScheduleGate();
  log(prefix, gate.reason);

  const empty = (reason: string): RunScheduledResult => ({
    ran: false,
    reason,
    jstDate: gate.jstDate,
    articlesPerDay: gate.articlesPerDay,
    todayCount: gate.todayCount,
    todayAttempts: gate.todayAttempts,
    maxAttempts: gate.maxAttempts,
    producedOk: 0,
    publishedDrafts: 0,
    results: [],
    publishedSlugs: [],
  });

  if (!gate.run) {
    return empty(gate.reason);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return empty("ANTHROPIC_API_KEY が未設定です");
  }

  const lockOwner = newLockOwner();
  const lock = await tryAcquireScheduleLock(gate.jstDate, lockOwner);
  if (!lock.ok) {
    log(prefix, lock.reason);
    return empty(lock.reason);
  }

  const settings = await loadSettings();
  const articlesPerDay = Math.max(
    0,
    Math.floor(getNumber(settings, "articles_per_day", 1)),
  );
  const maxAttempts = resolveMaxScheduledAttempts(articlesPerDay);
  let todayCount = await countTodaysGeneratedArticles(gate.jstDate);
  let todayAttempts = await countTodaysGenerationAttempts(gate.jstDate);
  let remaining = Math.max(0, articlesPerDay - todayCount);

  if (remaining === 0) {
    await releaseScheduleLock(lockOwner);
    const reason = `ロック後再確認で本数到達（成功 ${todayCount}/${articlesPerDay}）`;
    log(prefix, reason);
    return empty(reason);
  }
  if (todayAttempts >= maxAttempts) {
    await releaseScheduleLock(lockOwner);
    const reason = `ロック後再確認で試行上限（試行 ${todayAttempts}/${maxAttempts}）`;
    log(prefix, reason);
    return empty(reason);
  }

  const perRun =
    opts.maxArticlesPerRun != null
      ? Math.max(1, Math.floor(opts.maxArticlesPerRun))
      : remaining;
  const toGenerate = Math.min(remaining, perRun);

  log(
    prefix,
    `ロック取得 owner=${lockOwner} / 今回 ${toGenerate}本（不足 ${remaining}・成功 ${todayCount}/${articlesPerDay}・試行 ${todayAttempts}/${maxAttempts}）`,
  );

  const allResults: PipelineResult[] = [];
  let publishedDrafts = 0;
  let producedOk = 0;

  try {
    for (let i = 0; i < toGenerate; i++) {
      todayCount = await countTodaysGeneratedArticles(gate.jstDate);
      todayAttempts = await countTodaysGenerationAttempts(gate.jstDate);
      const left = Math.max(0, articlesPerDay - todayCount);
      if (left === 0) {
        log(
          prefix,
          `生成前再確認で本数到達（成功 ${todayCount}/${articlesPerDay}）。打ち切り`,
        );
        break;
      }
      if (todayAttempts >= maxAttempts) {
        log(
          prefix,
          `生成前再確認で試行上限（試行 ${todayAttempts}/${maxAttempts}）。打ち切り`,
        );
        break;
      }

      const batch = await runGenerationBatch({ count: 1 });
      publishedDrafts += batch.publishedDrafts;
      allResults.push(...batch.results);
      for (const r of batch.results) {
        if (
          (r.status === "published" || r.status === "draft") &&
          r.articleId
        ) {
          producedOk += 1;
        }
      }
    }
  } finally {
    const finalCount = await countTodaysGeneratedArticles(gate.jstDate);
    if (finalCount >= articlesPerDay) {
      await markScheduledGenerationDate(gate.jstDate);
      log(prefix, `本日分完了（成功 ${finalCount}/${articlesPerDay}本）`);
    } else {
      await clearScheduledGenerationDate();
      log(
        prefix,
        `本日 ${finalCount}/${articlesPerDay} 本のため未完了（次の追い上げで再試行）`,
      );
    }
    await releaseScheduleLock(lockOwner);
    todayCount = finalCount;
    todayAttempts = await countTodaysGenerationAttempts(gate.jstDate);
  }

  const publishedSlugs = allResults
    .filter((r) => r.status === "published" && r.slug)
    .map((r) => r.slug as string);

  if (publishedDrafts > 0 || publishedSlugs.length > 0) {
    await requestPublicRevalidate(publishedSlugs);
  }

  for (const [i, result] of allResults.entries()) {
    log(prefix, `(${i + 1}/${allResults.length}) [${result.status}] ${result.message}`);
    if (result.slug) log(prefix, `  slug: ${result.slug}`);
  }

  return {
    ran: producedOk > 0 || publishedDrafts > 0 || allResults.length > 0,
    reason:
      producedOk > 0 || publishedDrafts > 0
        ? `生成実行（成功+${producedOk} / 下書き公開 ${publishedDrafts}）`
        : allResults.length > 0
          ? "生成を試行したが成功記事なし"
          : "生成対象なし",
    jstDate: gate.jstDate,
    articlesPerDay,
    todayCount,
    todayAttempts,
    maxAttempts,
    producedOk,
    publishedDrafts,
    results: allResults,
    publishedSlugs,
  };
}
