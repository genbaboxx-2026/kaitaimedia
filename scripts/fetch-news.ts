/**
 * 業界ニュースRSS取得バッチ。
 *   npm run fetch-news
 */
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

async function main(): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      [
        "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です。",
        "ローカル: .env.local を確認",
        "GitHub Actions: Settings → Secrets and variables → Actions に同名の Secrets を登録",
      ].join("\n"),
    );
    process.exit(1);
  }

  const { fetchAndStoreNews } = await import("../src/lib/news/fetch-news");
  const { sources: results, editorial } = await fetchAndStoreNews();
  const failed = results.filter((r) => r.error);
  const totalAccepted = results.reduce((s, r) => s + r.accepted, 0);
  const totalUpserted = results.reduce((s, r) => s + r.upserted, 0);
  const totalWithImage = results.reduce((s, r) => s + r.withImage, 0);

  console.log(
    `完了: accepted=${totalAccepted} withImage=${totalWithImage} upserted=${totalUpserted} errors=${failed.length}` +
      ` / editorial generated=${editorial.generated}` +
      (editorial.skipped ? ` (skip: ${editorial.skipReason ?? ""})` : ""),
  );
  // ソースが0件（全部無効）は設定ミスの可能性が高い
  if (results.length === 0) {
    console.error("有効なニュースソースがありません。NEWS_ENABLE_GOOGLE_NEWS 等を確認してください。");
    process.exit(1);
  }
  if (failed.length === results.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
