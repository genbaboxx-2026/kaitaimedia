/**
 * 記事生成バッチのエントリポイント。
 *   npm run generate
 * .env.local を読み込み、生成パイプライン（要件5.1）を1回実行する。
 *
 * GitHub Actions 定時起動時は GENERATE_SCHEDULED=1 を付与する。
 * その場合、settings.generation_time（JST）以降かつ当日未生成なら本実行する
 * （朝を厚く起こし、以降は毎時追い上げ。失敗時はロック解除して再試行）。
 * UI の時刻変更が Actions の YAML 修正なしで効くようにする。
 */
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

async function main(): Promise<void> {
  const scheduled = process.env.GENERATE_SCHEDULED === "1";
  let scheduledJstDate: string | null = null;
  let scheduledRemaining: number | null = null;

  // 定時ポーリングは枠外が多い。APIキー未設定でも枠外スキップは成功終了にする
  // （Secrets 欠落時に Actions が毎時 red にならないようにする）
  if (scheduled) {
    const {
      evaluateScheduleGate,
      markScheduledGenerationDate,
    } = await import("../src/lib/generation/schedule-gate");
    const gate = await evaluateScheduleGate();
    console.log(`[schedule] ${gate.reason}`);
    if (!gate.run) {
      process.exit(0);
    }
    // 二重起動防止のロック。本数未達・失敗時は外して次の cron で再試行する
    await markScheduledGenerationDate(gate.jstDate);
    scheduledJstDate = gate.jstDate;
    scheduledRemaining = gate.remaining;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY が未設定です。ローカルは .env.local、GitHub Actions は Repository secrets を確認してください。",
    );
    if (scheduled && scheduledJstDate) {
      const { clearScheduledGenerationDate } = await import(
        "../src/lib/generation/schedule-gate"
      );
      await clearScheduledGenerationDate();
    }
    process.exit(1);
  }

  const { runGenerationBatch } = await import(
    "../src/lib/generation/run-batch"
  );
  const { requestPublicRevalidate } = await import(
    "../src/lib/request-public-revalidate"
  );
  // 定時は「1日の生成本数」の不足分だけ生成する（既に1本ある日に2本設定なら残り1本）
  const { results, publishedDrafts } = await runGenerationBatch(
    scheduledRemaining != null ? { count: scheduledRemaining } : undefined,
  );

  const publishedSlugs = results
    .filter((r) => r.status === "published" && r.slug)
    .map((r) => r.slug as string);
  const producedCount = results.filter((r) => Boolean(r.articleId)).length;
  const ok = producedCount > 0 || publishedDrafts > 0;

  if (scheduled && scheduledJstDate) {
    const {
      clearScheduledGenerationDate,
      countTodaysGeneratedArticles,
    } = await import("../src/lib/generation/schedule-gate");
    const { getNumber, loadSettings } = await import("../src/lib/ai/settings");
    const settings = await loadSettings();
    const perDay = Math.max(0, Math.floor(getNumber(settings, "articles_per_day", 1)));
    const todayCount = await countTodaysGeneratedArticles(scheduledJstDate);
    if (todayCount < perDay) {
      await clearScheduledGenerationDate();
      console.log(
        `[schedule] 本日 ${todayCount}/${perDay} 本のためロック解除（不足分は次の追い上げで生成）`,
      );
    } else {
      console.log(`[schedule] 本日分完了（${todayCount}/${perDay}本）`);
    }
  }

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

  if (scheduled && !ok) {
    console.error(
      "[schedule] 記事を残せませんでした。次の定時/追い上げで再試行します。",
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
