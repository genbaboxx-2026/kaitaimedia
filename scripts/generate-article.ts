/**
 * 記事生成バッチのエントリポイント。
 *   npm run generate
 *
 * GENERATE_SCHEDULED=1 のときは定時判定付き（GitHub Actions / 手動検証用）。
 * 本番の定期実行は Vercel Cron（/api/cron/generate）を主系とする。
 */
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

async function main(): Promise<void> {
  const scheduled = process.env.GENERATE_SCHEDULED === "1";

  if (scheduled) {
    const { runScheduledGeneration } = await import(
      "../src/lib/generation/run-scheduled"
    );
    const result = await runScheduledGeneration();
    if (!result.ran && result.producedOk === 0 && result.publishedDrafts === 0) {
      // 枠外・本数到達・ロック競合は成功終了（Actions を red にしない）
      if (
        result.reason.includes("スキップ") ||
        result.reason.includes("到達") ||
        result.reason.includes("実行中") ||
        result.reason.includes("実行時刻前") ||
        result.reason.includes("上限") ||
        result.reason.includes("generation_enabled")
      ) {
        process.exit(0);
      }
      if (result.reason.includes("ANTHROPIC_API_KEY")) {
        console.error(result.reason);
        process.exit(1);
      }
      if (result.results.length > 0) {
        console.error("[schedule] 成功記事を残せませんでした。次の追い上げで再試行します。");
        process.exit(1);
      }
      process.exit(0);
    }
    return;
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
