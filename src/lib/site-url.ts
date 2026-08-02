// 公開URLの基点（OGP・sitemap・構造化データで使用）。
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
