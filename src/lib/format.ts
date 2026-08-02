// 日付文字列 (YYYY-MM-DD) を「YYYY年M月D日」に整形する。
// Date を介さず文字列処理するため、タイムゾーンやロケールに依存しない。
export function formatJaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return `${y}年${Number(mo)}月${Number(d)}日`;
}
