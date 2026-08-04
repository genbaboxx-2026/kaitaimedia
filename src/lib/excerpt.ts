/** インライン Markdown をプレーンテキストへ */
export function stripMarkdownInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 本文から一覧・トップ用のリード文を作る。
 * Markdown を除去し、文末（。！？）で切る。無理なら「…」で閉じる。
 */
export function excerptFrom(body: string, maxLen = 120): string {
  const firstPara =
    body
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("#") && !l.startsWith("-") && !l.startsWith(">")) ??
    "";

  const clean = stripMarkdownInline(firstPara);
  if (!clean) return "";
  if (clean.length <= maxLen) return clean;

  const slice = clean.slice(0, maxLen);
  const sentenceEnd = Math.max(
    slice.lastIndexOf("。"),
    slice.lastIndexOf("！"),
    slice.lastIndexOf("？"),
  );
  if (sentenceEnd >= 40) return slice.slice(0, sentenceEnd + 1);

  const soft = Math.max(slice.lastIndexOf("、"), slice.lastIndexOf(" "));
  if (soft >= 40) return `${slice.slice(0, soft)}…`;

  return `${slice.replace(/[、,\s]+$/, "")}…`;
}
