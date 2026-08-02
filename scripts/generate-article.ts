/**
 * 記事生成バッチのエントリポイント。
 *   npm run generate
 * .env.local を読み込み、生成パイプライン（要件5.1）を1回実行する。
 * 実行には ANTHROPIC_API_KEY と、正しい SUPABASE_SERVICE_ROLE_KEY（secretキー）が必要。
 */
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY が未設定です（.env.local）。");
    process.exit(1);
  }

  const { runGenerationBatch } = await import(
    "../src/lib/generation/run-batch"
  );
  const { results, publishedDrafts } = await runGenerationBatch();

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
