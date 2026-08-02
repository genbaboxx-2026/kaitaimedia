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
  // env 読み込み後に動的import
  // まず未生成テーマを20件まで自動補充（標準運用：常に在庫を保つ）
  try {
    const { replenishThemes } = await import(
      "../src/lib/generation/replenish-themes"
    );
    const added = await replenishThemes(20);
    if (added > 0) console.log(`テーマを${added}件自動補充しました（在庫20件を維持）`);
  } catch (e) {
    console.warn(
      "テーマ自動補充をスキップ:",
      e instanceof Error ? e.message : String(e),
    );
  }

  // 生成本数は settings.articles_per_day に従う（管理画面の「1日の生成本数」）
  const { loadSettings, getNumber } = await import("../src/lib/ai/settings");
  const settings = await loadSettings();
  const perDay = Math.max(0, getNumber(settings, "articles_per_day", 1));
  if (perDay === 0) {
    console.log("articles_per_day=0 のため生成をスキップしました。");
    return;
  }

  const { runGenerationPipeline } = await import("../src/lib/generation/pipeline");
  for (let i = 0; i < perDay; i++) {
    const result = await runGenerationPipeline();
    console.log(`(${i + 1}/${perDay}) [${result.status}] ${result.message}`);
    if (result.slug) console.log(`  slug: ${result.slug}`);
    // 生成停止・予算超過・テーマ切れなどで生成できない場合は打ち切る
    if (result.status === "skipped") {
      console.log("これ以上生成できないため打ち切りました。");
      break;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
