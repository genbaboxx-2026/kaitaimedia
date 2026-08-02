/** 無料RSS情報源（取得先URLはインフラ設定に近いのでコード管理） */

export interface NewsSource {
  id: string;
  name: string;
  feedUrl: string;
  /** Shift_JIS など。未指定は UTF-8 */
  encoding?: "utf-8" | "shift_jis";
  /**
   * true: 必須キーワードに一致したものだけ通す（国交省など雑多なフィード向け）
   * false: 除外語に加え、必須語も緩く見る（産廃ニュース向け）
   */
  requireIncludeKeyword: boolean;
  /**
   * false にすると取得対象外。
   * Googleニュースは利用規約リスクがあるため env で切れるようにする。
   */
  enabled: boolean;
}

/** Googleニュース取得のON/OFF（未設定時はON）。問題があれば false にする */
export function isGoogleNewsEnabled(): boolean {
  const v = process.env.NEWS_ENABLE_GOOGLE_NEWS;
  if (v === undefined || v === "") return true;
  return !["0", "false", "off", "no"].includes(v.trim().toLowerCase());
}

const ALL_NEWS_SOURCES: NewsSource[] = [
  {
    id: "mlit",
    name: "国土交通省",
    feedUrl: "https://www.mlit.go.jp/pressrelease.rdf",
    encoding: "shift_jis",
    requireIncludeKeyword: true,
    enabled: true,
  },
  {
    id: "sanpai",
    name: "産業廃棄物ニュース",
    feedUrl: "https://www.sanpai-news.com/feed/",
    requireIncludeKeyword: false,
    enabled: true,
  },
  {
    id: "google_news",
    name: "Googleニュース",
    feedUrl:
      "https://news.google.com/rss/search?q=%E8%A7%A3%E4%BD%93%E5%B7%A5%E4%BA%8B+OR+%E7%94%A3%E6%A5%AD%E5%BB%83%E6%A3%84%E7%89%A9+OR+%E5%BB%BA%E8%A8%AD%E3%83%AA%E3%82%B5%E3%82%A4%E3%82%AF%E3%83%AB&hl=ja&gl=JP&ceid=JP:ja",
    requireIncludeKeyword: true,
    // 実行時に isGoogleNewsEnabled() で上書き判定
    enabled: true,
  },
];

/** 有効な取得ソースのみ（Googleは env で無効化可） */
export function getEnabledNewsSources(): NewsSource[] {
  const googleOn = isGoogleNewsEnabled();
  return ALL_NEWS_SOURCES.filter((s) => {
    if (s.id === "google_news") return googleOn;
    return s.enabled;
  });
}

/** 解体・建設・産廃に関連する必須語（いずれか一致） */
export const NEWS_INCLUDE_KEYWORDS = [
  "解体",
  "建設",
  "産廃",
  "廃棄物",
  "アスベスト",
  "建設リサイクル",
  "建設副産物",
  "分別解体",
  "がれき",
  "不法投棄",
  "廃プラ",
  "建設業",
  "解体工事",
  "産業廃棄物",
  "石綿",
  "マニフェスト",
  "建設廃棄物",
  "解体業",
] as const;

/** 誤爆・ノイズを落とす除外語 */
export const NEWS_EXCLUDE_KEYWORDS = [
  // 比喩・エンタメの「解体」
  "書籍",
  "組織解体",
  "スタートアップ",
  "映画",
  "ドラマ",
  "漫画",
  "小説",
  "アニメ",
  "IT企業",
  "企業文化の解体",
  "固定観念の解体",
  "常識の解体",
  "構造の解体",
  "言説の解体",
  "神話の解体",
  "イメージの解体",
  "ブランドの解体",
  "チームの解体",
  "内閣の解体",
  "派閥の解体",
  // 関係の薄い話題
  "芸能",
  "アイドル",
  "サッカー",
  "野球",
  "競馬",
  "株価",
  "為替",
  "仮想通貨",
  "暗号資産",
  "レシピ",
  "グルメ",
  "旅行先",
  // 建設でも本メディアの主対象外になりやすいもの
  "ゲーム実況",
  "YouTuber",
  "まとめサイト",
] as const;
