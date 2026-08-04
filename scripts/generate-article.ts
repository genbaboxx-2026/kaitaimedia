/**
 * 記事生成バッチのエントリポイント。
 *   npm run generate
 * .env.local を読み込み、生成パイプライン（要件5.1）を1回実行する。
 *
 * GitHub Actions 定時起動時は GENERATE_SCHEDULED=1 を付与する。
 * その場合、settings.generation_time（JST）以降かつ当日未生成なら本実行する
 * （cron 遅延で枠を逃しても当日中に追いつく）。
 * UI の時刻変更が Actions の YAML 修正なしで効くようにする。
 */
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

async function main(): Promise<void> {
  const scheduled = process.env.GENERATE_SCHEDULED === "1";

  // 定時ポーリングは枠外が多い。APIキー未設定でも枠外スキップは成功終了にする
  // （Secrets 欠落時に Actions が毎15分 red にならないようにする）
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
    // 二重起動防止のため、バッチ前に本日分を記録
    await markScheduledGenerationDate(gate.jstDate);
  }

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
