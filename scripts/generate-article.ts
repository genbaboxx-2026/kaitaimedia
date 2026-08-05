/**
 * 記事生成バッチのエントリポイント。
 *   npm run generate
 * .env.local を読み込み、生成パイプライン（要件5.1）を1回実行する。
 *
 * GitHub Actions 定時起動時は GENERATE_SCHEDULED=1 を付与する。
 * その場合、settings.generation_time（JST）以降かつ当日の成功数が未達なら本実行する。
 * 品質不合格の下書きは本数に含めず再試行する。実行中ロックで二重生成を防ぐ。
 */
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

function newLockOwner(): string {
  return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function main(): Promise<void> {
  const scheduled = process.env.GENERATE_SCHEDULED === "1";
  let scheduledJstDate: string | null = null;
  let lockOwner: string | null = null;
  let articlesPerDay = 0;

  if (scheduled) {
    const {
      evaluateScheduleGate,
      tryAcquireScheduleLock,
      releaseScheduleLock,
      countTodaysGeneratedArticles,
      countTodaysGenerationAttempts,
      resolveMaxScheduledAttempts,
    } = await import("../src/lib/generation/schedule-gate");
    const { getNumber, loadSettings } = await import("../src/lib/ai/settings");

    const gate = await evaluateScheduleGate();
    console.log(`[schedule] ${gate.reason}`);
    if (!gate.run) {
      process.exit(0);
    }

    lockOwner = newLockOwner();
    const lock = await tryAcquireScheduleLock(gate.jstDate, lockOwner);
    if (!lock.ok) {
      console.log(`[schedule] ${lock.reason}`);
      process.exit(0);
    }

    // ロック取得後に再カウント（同時起動の取りこぼし防止）
    const settings = await loadSettings();
    articlesPerDay = Math.max(
      0,
      Math.floor(getNumber(settings, "articles_per_day", 1)),
    );
    const maxAttempts = resolveMaxScheduledAttempts(articlesPerDay);
    const todayCount = await countTodaysGeneratedArticles(gate.jstDate);
    const todayAttempts = await countTodaysGenerationAttempts(gate.jstDate);
    const remaining = Math.max(0, articlesPerDay - todayCount);
    if (remaining === 0) {
      console.log(
        `[schedule] ロック後再確認で本数到達（成功 ${todayCount}/${articlesPerDay}）`,
      );
      await releaseScheduleLock(lockOwner);
      process.exit(0);
    }
    if (todayAttempts >= maxAttempts) {
      console.log(
        `[schedule] ロック後再確認で試行上限（試行 ${todayAttempts}/${maxAttempts}）`,
      );
      await releaseScheduleLock(lockOwner);
      process.exit(0);
    }

    scheduledJstDate = gate.jstDate;
    console.log(
      `[schedule] ロック取得 owner=${lockOwner} / 不足 ${remaining}本（成功 ${todayCount}/${articlesPerDay}・試行 ${todayAttempts}/${maxAttempts}）`,
    );

    // 不足分を1本ずつ生成し、毎本の前に再カウントする
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error(
        "ANTHROPIC_API_KEY が未設定です。ローカルは .env.local、GitHub Actions は Repository secrets を確認してください。",
      );
      await releaseScheduleLock(lockOwner);
      process.exit(1);
    }

    const { runGenerationBatch } = await import(
      "../src/lib/generation/run-batch"
    );
    const { requestPublicRevalidate } = await import(
      "../src/lib/request-public-revalidate"
    );
    const {
      markScheduledGenerationDate,
      clearScheduledGenerationDate,
    } = await import("../src/lib/generation/schedule-gate");

    const allResults: Awaited<
      ReturnType<typeof runGenerationBatch>
    >["results"] = [];
    let publishedDrafts = 0;
    let producedOk = 0;

    try {
      for (let i = 0; i < remaining; i++) {
        const current = await countTodaysGeneratedArticles(scheduledJstDate);
        const attempts = await countTodaysGenerationAttempts(scheduledJstDate);
        const left = Math.max(0, articlesPerDay - current);
        if (left === 0) {
          console.log(
            `[schedule] 生成前再確認で本数到達（成功 ${current}/${articlesPerDay}）。打ち切り`,
          );
          break;
        }
        if (attempts >= maxAttempts) {
          console.log(
            `[schedule] 生成前再確認で試行上限（試行 ${attempts}/${maxAttempts}）。打ち切り`,
          );
          break;
        }

        const batch = await runGenerationBatch({ count: 1 });
        publishedDrafts += batch.publishedDrafts;
        allResults.push(...batch.results);

        for (const r of batch.results) {
          // 品質不合格（failed）は成功数に入れない
          if (
            (r.status === "published" || r.status === "draft") &&
            r.articleId
          ) {
            producedOk += 1;
          }
        }
      }
    } finally {
      const finalCount = await countTodaysGeneratedArticles(scheduledJstDate);
      if (finalCount >= articlesPerDay) {
        await markScheduledGenerationDate(scheduledJstDate);
        console.log(`[schedule] 本日分完了（成功 ${finalCount}/${articlesPerDay}本）`);
      } else {
        await clearScheduledGenerationDate();
        console.log(
          `[schedule] 本日 ${finalCount}/${articlesPerDay} 本のため未完了（次の追い上げで再試行）`,
        );
      }
      await releaseScheduleLock(lockOwner);
    }

    const publishedSlugs = allResults
      .filter((r) => r.status === "published" && r.slug)
      .map((r) => r.slug as string);

    if (publishedDrafts > 0 || publishedSlugs.length > 0) {
      await requestPublicRevalidate(publishedSlugs);
    }

    if (publishedDrafts > 0) {
      console.log(`下書き在庫を消化しました（${publishedDrafts}件公開）。`);
      return;
    }

    for (const [i, result] of allResults.entries()) {
      console.log(
        `(${i + 1}/${allResults.length}) [${result.status}] ${result.message}`,
      );
      if (result.slug) console.log(`  slug: ${result.slug}`);
      if (result.status === "skipped") {
        console.log("これ以上生成できないため打ち切りました。");
      }
    }

    if (producedOk === 0 && publishedDrafts === 0) {
      console.error(
        "[schedule] 成功記事を残せませんでした。次の定時/追い上げで再試行します。",
      );
      process.exit(1);
    }
    return;
  }

  // ---- 手動 / workflow_dispatch（即時・本数制限の不足計算なし） ----
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY が未設定です。ローカルは .env.local、GitHub Actions は Repository secrets を確認してください。",
    );
    process.exit(1);
  }

  const { runGenerationBatch } = await import(
    "../src/lib/generation/run-batch"
  );
  const { requestPublicRevalidate } = await import(
    "../src/lib/request-public-revalidate"
  );
  const { results, publishedDrafts } = await runGenerationBatch();

  const publishedSlugs = results
    .filter((r) => r.status === "published" && r.slug)
    .map((r) => r.slug as string);

  if (publishedDrafts > 0 || publishedSlugs.length > 0) {
    await requestPublicRevalidate(publishedSlugs);
  }

  if (publishedDrafts > 0) {
    console.log(`下書き在庫を消化しました（${publishedDrafts}件公開）。`);
    return;
  }

  for (const [i, result] of results.entries()) {
    console.log(`(${i + 1}/${results.length}) [${result.status}] ${result.message}`);
    if (result.slug) console.log(`  slug: ${result.slug}`);
    if (result.status === "skipped") {
      console.log("これ以上生成できないため打ち切りました。");
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
