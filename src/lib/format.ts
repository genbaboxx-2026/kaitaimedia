// 日付文字列 (YYYY-MM-DD) を「YYYY年M月D日」に整形する。
// Date を介さず文字列処理するため、タイムゾーンやロケールに依存しない。
export function formatJaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return `${y}年${Number(mo)}月${Number(d)}日`;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** フィード見出し用「M月D日(曜)」 */
export function formatFeedDate(date: Date = new Date()): string {
  return `${date.getMonth() + 1}月${date.getDate()}日(${WEEKDAYS[date.getDay()]})`;
}

/**
 * 公開日からの経過表示（NewsPicks風）。
 * 入力は YYYY-MM-DD。当日は「今日」、それ以外は「N日前」。
 */
export function formatRelativeJa(iso: string, now: Date = new Date()): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const published = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    0,
    0,
    0,
    0,
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round(
    (today.getTime() - published.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays <= 0) return "今日";
  if (diffDays === 1) return "1日前";
  if (diffDays < 30) return `${diffDays}日前`;
  return formatJaDate(iso);
}
