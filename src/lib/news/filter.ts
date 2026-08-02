import {
  NEWS_EXCLUDE_KEYWORDS,
  NEWS_INCLUDE_KEYWORDS,
} from "@/lib/news/sources";

/** タイトル（＋任意の本文抜粋）がニュース掲載対象か */
export function passesNewsFilter(
  text: string,
  options: { requireIncludeKeyword: boolean },
): boolean {
  const t = text.trim();
  if (!t) return false;

  for (const word of NEWS_EXCLUDE_KEYWORDS) {
    if (t.includes(word)) return false;
  }

  if (options.requireIncludeKeyword) {
    return NEWS_INCLUDE_KEYWORDS.some((word) => t.includes(word));
  }

  // テーマ寄りのフィードでも、明らかに無関係なものを落とすため緩く必須語を見る
  // （産廃サイトの海外雑報など）。必須語が1つも無ければ除外。
  return NEWS_INCLUDE_KEYWORDS.some((word) => t.includes(word));
}
