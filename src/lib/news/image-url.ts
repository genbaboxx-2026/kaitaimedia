/** Googleニュースが返す汎用ロゴ（記事画像ではない） */
const GOOGLE_NEWS_DEFAULT_IMAGE =
  "J6_coFbogxhRI9iM864NL_liGXvsQp2AupsKei7z0cNNfDvGUmWUy20nuUhkREQyrpY4bEeIBuc";

/** メディア共通のブランド画像・差し替え用ダミー（並ぶと同じ顔になる） */
export function isGenericNewsImageUrl(url: string): boolean {
  const u = url.toLowerCase();
  if (url.includes(GOOGLE_NEWS_DEFAULT_IMAGE)) return true;
  if (u.includes("gnews/logo")) return true;
  if (u.includes("nhk-one-news_eyecatch")) return true;
  if (u.includes("imgu.web.nhk") && u.includes("/common/news/eyecatch"))
    return true;
  if (
    u.includes("ogp_noimage") ||
    u.includes("noimage") ||
    u.includes("no_image")
  )
    return true;
  if (u.includes("123456.png")) return true;
  if (u.includes("/material/images/group/")) return true;
  if (u.includes("default_ogp") || u.includes("default-ogp")) return true;
  if (u.includes("common/ogp") && u.includes("no")) return true;
  if (u.includes("logo.") || u.includes("/logo/")) return true;
  if (u.includes("favicon")) return true;
  return false;
}

export function isUsableNewsImageUrl(url: string): boolean {
  const u = url.toLowerCase();
  if (!/^https?:\/\//i.test(url) && !u.startsWith("//")) return false;
  if (isGenericNewsImageUrl(url)) return false;
  if (u.includes("wp-includes")) return false;
  if (u.includes("1x1") || u.includes("pixel")) return false;
  if (u.includes("gravatar.com")) return false;
  if (u.includes("icon-lock")) return false;
  if (u.includes("/icon-") || u.includes("/icons/")) return false;
  if (u.includes("/common/images/") && !u.includes("/news/thumb")) return false;
  if (u.includes("/common/sfw/")) return false;
  if (u.endsWith(".svg")) return false;
  // 極小サムネ（64m など2桁）を除外。150m以上は許可
  if (/\/\d{1,2}m\//i.test(u)) return false;
  return true;
}
