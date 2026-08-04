/**
 * 本文中図版のプロンプト構築。
 * 見出しだけでなく、直後の本文抜粋を渡して「その節の内容」に沿った絵にする。
 */

export interface FigureContext {
  /** 記事タイトル */
  articleTitle: string;
  /** 対象 H2 見出し */
  heading: string;
  /** 見出し直後の本文抜粋（日本語） */
  sectionExcerpt: string;
  categoryName: string;
  /** 同一記事内の何枚目か（0-based） */
  figureIndex: number;
  /** 記事内の総図版数 */
  figureCount: number;
}

/** 構図バリエーション（矢印フローは少数派） */
export const FIGURE_COMPOSITIONS: string[] = [
  "single strong focal scene that visualizes the section's main idea (one clear situation, not a multi-step flowchart)",
  "side-by-side contrast of two situations described in the section (problem vs improved approach) without a 4-step process",
  "one hero object or workplace detail from the section, with 2 small supporting icons around it",
  "layered 'cause → effect' with only TWO panels, large and readable",
  "checklist board showing 3 concrete checkpoints taken from the section text",
  "map-like overview of relationships between roles/tools mentioned in the section (hub layout, not a horizontal arrow strip)",
  "before/after vertical split tied to the section's concrete example",
  "quiet editorial still-life of documents, tools, or devices named in the section (no process arrows)",
];

/** トンマナ（クリーム背景＋紺線画の固定をやめる） */
export const FIGURE_STYLES: string[] = [
  "clean modern flat vector, white or light gray background, charcoal and one brand accent color",
  "soft watercolor-adjacent editorial illustration, muted earth tones, airy composition",
  "high-contrast poster illustration on charcoal background with amber/white accents",
  "minimal Swiss-poster style: lots of negative space, limited 2-color palette, bold shapes",
  "isometric soft 3D clay-render look, pastel but not cream-yellow, rounded forms",
  "blueprint / technical schematic style on cool blue-gray paper with white line work",
  "warm paper texture background with ink sketch + limited flat fills (not pale yellow cream)",
  "crisp UI-dashboard illustration style: cards, meters, simple icons, slate and teal",
];

export function pickFigureComposition(index: number, seed = 0): string {
  return FIGURE_COMPOSITIONS[
    (index + seed) % FIGURE_COMPOSITIONS.length
  ] as string;
}

export function pickFigureStyle(index: number, seed = 0): string {
  // 同一記事内でも毎回スタイルをずらす
  return FIGURE_STYLES[(index * 3 + seed) % FIGURE_STYLES.length] as string;
}

/**
 * 見出し直後〜次見出し手前の本文から、画像プロンプト用の抜粋を作る。
 */
export function extractSectionExcerpt(
  body: string,
  sectionStart: number,
  sectionEnd: number,
  maxChars = 480,
): string {
  let chunk = body.slice(sectionStart, sectionEnd);
  chunk = chunk
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\|.+$/gm, " ") // tables
    .replace(/^#{1,6}\s+.+$/gm, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (chunk.length <= maxChars) return chunk;
  return `${chunk.slice(0, maxChars).trim()}…`;
}

export function buildContentAwareFigurePrompt(
  ctx: FigureContext,
  opts?: { composition?: string; style?: string },
): string {
  const composition =
    opts?.composition ?? pickFigureComposition(ctx.figureIndex);
  const style = opts?.style ?? pickFigureStyle(ctx.figureIndex);
  const excerpt =
    ctx.sectionExcerpt.trim() ||
    `（本文抜粋なし。見出し「${ctx.heading}」の意味を正確に視覚化する）`;

  return [
    "Create ONE explanatory illustration for a Japanese B2B demolition-industry media article.",
    "This figure must illustrate THIS section's specific argument — not a generic demolition clip-art scene.",
    `Article title: ${ctx.articleTitle}`,
    `Section heading: ${ctx.heading}`,
    `Category: ${ctx.categoryName}`,
    `Section body excerpt (source of truth for what to draw): ${excerpt}`,
    `Figure ${ctx.figureIndex + 1} of ${ctx.figureCount} in this article — must look visually distinct from the other figures.`,
    `Composition direction: ${composition}`,
    `Art style: ${style}`,
    "Content rules:",
    "- Derive people, tools, documents, and situations FROM the excerpt/heading. If the section is about systems, insurance, IT approaches, or management concepts, show THAT — do not default to excavator + hardhat + dump truck unless the excerpt clearly needs them.",
    "- Prefer concrete metaphors matching the text (documents, dashboards, org charts, calendars, PPE rules, waste manifests, etc.) over generic site montages.",
    "HARD BAN (repetition killers):",
    "- Do NOT use a pale yellow / cream rectangular infographic board as the default background.",
    "- Do NOT use the same navy-line cartoon of suit man + excavator + numbered 1-2-3 arrow flow unless the excerpt explicitly describes a 3-step process.",
    "- Do NOT reuse red X / green check templates as empty decoration.",
    "- No Japanese or English words in the image (digits and simple arrows only if essential).",
    "- No logos, watermarks, photoreal faces, or stock-photo look.",
  ].join("\n");
}
