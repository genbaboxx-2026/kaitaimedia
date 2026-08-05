/** ノールック公開向け：法令・許認可・補助金手続き系は自動生成しない */

const BLOCKED_CATEGORY_SLUGS = new Set(["law", "subsidy"]);

const BLOCKED_TITLE_RE =
  /建設業許可|工事業登録|法改正|許認可|届出|条文|法令|法律|コンプライアンス|補助金の申請|補助金申請|申請実務|申請の流れ|取得手順/;

export function isBlockedTheme(
  title: string,
  categorySlug?: string | null,
): boolean {
  const slug = (categorySlug ?? "").trim();
  if (BLOCKED_CATEGORY_SLUGS.has(slug)) return true;
  return BLOCKED_TITLE_RE.test(title);
}
