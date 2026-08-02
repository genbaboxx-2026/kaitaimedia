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
  // テーマ在庫は廃止。生成のたびにパイプライン内でAIがトピックをその場で決める。
  // env 読み込み後に動的import。
  // 生成本数は settings.articles_per_day に従う（管理画面の「1日の生成本数」）
  const { loadSettings, getNumber, getBool } = await import("../src/lib/ai/settings");
  const settings = await loadSettings();
  const perDay = Math.max(0, getNumber(settings, "articles_per_day", 1));
  if (perDay === 0) {
    console.log("articles_per_day=0 のため生成をスキップしました。");
    return;
  }

  // 完全自動公開ONのときは、まず既存の未公開下書きを「古い順（＝一覧の上から）」に公開して在庫を消化する。
  // 下書きが無くなったら新規生成に切り替える。これで「上から順に投稿されていく」挙動になる。
  if (getBool(settings, "auto_publish_enabled", false)) {
    const { restSelect, restUpdate } = await import("../src/lib/supabase/rest");
    const drafts = await restSelect<{ id: string; title: string }>(
      `articles?select=id,title&status=eq.draft&order=created_at.asc&limit=${perDay}`,
      0,
    );
    if (drafts && drafts.length > 0) {
      for (const d of drafts) {
        await restUpdate(`articles?id=eq.${d.id}`, {
          status: "published",
          published_at: new Date().toISOString(),
        });
        console.log(`自動公開（上から順）: ${d.title}`);
      }
      console.log("下書き在庫を消化しました（新規生成は次回以降）。");
      return;
    }
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
