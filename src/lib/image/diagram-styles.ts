/**
 * Nano Banana 図解サムネのレイアウト／パレット多様化。
 * カテゴリで色を寄せない。毎回フル候補から独立に抽選する。
 */

export interface DiagramPalette {
  id: string;
  /** 英語でモデルへ渡す色指定 */
  brief: string;
}

export interface DiagramLayout {
  id: string;
  /** 英語でモデルへ渡す構図指定 */
  brief: string;
  /** タイトル配置の説明 */
  titlePlacement: string;
}

/** 見た目が大きく違うパレット群（カテゴリバイアスなし） */
export const DIAGRAM_PALETTES: DiagramPalette[] = [
  {
    id: "ink-paper",
    brief:
      "STRICT COLORS: near-white paper background, charcoal ink typography, ONE vivid orange accent only. Editorial newspaper. No navy bars, no cream panels, no dark charcoal canvas.",
  },
  {
    id: "charcoal-amber",
    brief:
      "STRICT COLORS: charcoal (#1f2937) canvas, warm amber/gold accents, soft gray cards. Dark dashboard. No cream yellow body, no sky blue.",
  },
  {
    id: "slate-cyan",
    brief:
      "STRICT COLORS: cool slate blue-gray background, white cards, cyan (#06b6d4) accent lines. Tech-editorial. No orange, no amber, no navy title bar.",
  },
  {
    id: "forest-ivory",
    brief:
      "STRICT COLORS: deep forest green bands, ivory body, muted gold accents. Calm professional. No orange, no cyan, no black canvas.",
  },
  {
    id: "construction-hi-vis",
    brief:
      "STRICT COLORS: matte black background, high-vis yellow (#facc15) and white type only. Safety-sign geometry. No orange-amber soft cards, no navy.",
  },
  {
    id: "burgundy-warm",
    brief:
      "STRICT COLORS: deep burgundy / wine background or bands, warm ivory panels, soft gold rules. Magazine feature. No cyan, no charcoal-amber dashboard look.",
  },
  {
    id: "sky-white",
    brief:
      "STRICT COLORS: soft sky-blue gradient background, white content cards, navy text. Airy and light. No dark charcoal, no amber icons, no cream flowchart strip.",
  },
  {
    id: "mono-coral",
    brief:
      "STRICT COLORS: warm off-white background, black typography, single coral (#f43f5e) accent. Minimal Swiss poster. Large empty space. No navy, no amber gold.",
  },
  {
    id: "lilac-ink",
    brief:
      "STRICT COLORS: soft lilac / lavender background, deep ink purple typography, white cards. Gentle editorial. No orange, no charcoal black canvas.",
  },
  {
    id: "mint-graphite",
    brief:
      "STRICT COLORS: mint (#a7f3d0) and soft teal accents on light graphite-white. Fresh modern. No amber, no burgundy, no hi-vis yellow.",
  },
  {
    id: "sand-terracotta",
    brief:
      "STRICT COLORS: warm sand / beige background, terracotta (#c2410c) accents, off-white cards. Earthy. No cyan, no navy header, no neon yellow.",
  },
  {
    id: "electric-magenta",
    brief:
      "STRICT COLORS: near-black background, electric magenta (#e879f9) and white type. Bold poster. No amber gold, no soft cream, no forest green.",
  },
];

/**
 * 構図ファミリー。カテゴリで寄せない。毎回フル候補から抽選。
 */
export const DIAGRAM_LAYOUTS: DiagramLayout[] = [
  {
    id: "split-compare",
    titlePlacement:
      "Title as large Japanese type across the TOP third on a translucent band matching the palette (NOT a fixed navy bar).",
    brief: `
COMPOSITION: Left/right COMPARISON split (約50/50).
- Left column label: short Japanese word derived from the title (例: 従来 / IT側 / 課題)
- Right column label: contrasting short Japanese word (例: 改善 / 現場側 / 打ち手)
- Each side: 2–3 icon+label rows. NO numbered ①②③④ process. NO red arrows between four panels.
- A thin vertical divider or "VS" mark in Japanese 「対」 is OK.
`.trim(),
  },
  {
    id: "grid-2x2",
    titlePlacement:
      "Title in a compact TOP-LEFT block (max ~35% width), not a full-width navy banner.",
    brief: `
COMPOSITION: 2×2 CARD GRID filling most of the frame.
- Four equal rounded cards with different icons and ONE short Japanese label each.
- Labels must be unique and clearly related to the article title theme.
- Soft gutters between cards. NO horizontal arrow chain. NO process flow.
`.trim(),
  },
  {
    id: "big-number",
    titlePlacement:
      "Title stacked on the RIGHT half in large Japanese type. Left side is visual.",
    brief: `
COMPOSITION: BIG NUMBER / KEY POINT hero.
- Left ~40%: one oversized Japanese digit or short keyword (例: 「3」 or 「要点」) with one supporting icon cluster.
- Right ~60%: title + 3 stacked short bullet labels with small icons (not a 4-step arrow process).
- Feels like a magazine opener, not a textbook flowchart.
`.trim(),
  },
  {
    id: "before-after",
    titlePlacement:
      "Title as a slim TOP caption strip (any palette color, not always navy).",
    brief: `
COMPOSITION: BEFORE → AFTER (two large panels only).
- Left panel: 「改善前」 with cluttered/problem icons.
- Right panel: 「改善後」 with ordered/clear icons.
- ONE clear transition mark between them (arrow or 「→」). Do NOT draw four small process boxes.
`.trim(),
  },
  {
    id: "stack-checklist",
    titlePlacement:
      "Title on a LEFT vertical band (~30% width), body on the right.",
    brief: `
COMPOSITION: VERTICAL CHECKLIST.
- Right side: 3 or 4 horizontal rows, each with a check/mark icon + one short Japanese label.
- Rows stacked, not a left-to-right arrow process.
- Generous whitespace. Feels like a practical checklist cover.
`.trim(),
  },
  {
    id: "hub-spoke",
    titlePlacement:
      "Short title centered at TOP; no full-bleed navy header block.",
    brief: `
COMPOSITION: CENTER HUB + 3 SPOKES.
- Center: one main icon in a circle with a short Japanese keyword from the title.
- Three surrounding callout bubbles with unique short labels.
- Connecting thin lines OK. Forbidden: 4 equal panels in a horizontal row with red arrows.
`.trim(),
  },
  {
    id: "type-poster",
    titlePlacement:
      "Title is the HERO — very large Japanese type occupying the center/left. Category is tiny.",
    brief: `
COMPOSITION: TYPOGRAPHY POSTER.
- Dominate with large readable Japanese title (wrap naturally).
- Add only 2–3 small symbolic icons in the margins or corners related to the title.
- Almost no diagram boxes. This should look like a bold editorial poster, NOT an infographic flowchart.
`.trim(),
  },
  {
    id: "diagonal-bands",
    titlePlacement:
      "Title sits in the upper band; secondary labels in lower bands.",
    brief: `
COMPOSITION: DIAGONAL or angled color BANDs (2–3 bands).
- Each band has one short Japanese keyword + one icon.
- Dynamic, modern, poster-like. No rectangular 4-step process with red arrows.
`.trim(),
  },
  {
    id: "process-3",
    titlePlacement:
      "Title in a modest top strip using the palette header color (vary the color; not always navy).",
    brief: `
COMPOSITION: SHORT PROCESS of exactly 3 steps (not 4).
- Three large stages with distinct icons and labels derived from the title.
- Connectors may be chevrons or simple lines — avoid bright red arrow clichés when possible.
- Only use this process style occasionally; keep it visually different from a cream 4-panel strip.
`.trim(),
  },
  {
    id: "stat-callouts",
    titlePlacement: "Title across the bottom third on a solid band.",
    brief: `
COMPOSITION: THREE FLOATING CALLOUT CARDS over a subtle abstract site/blueprint background pattern (no photoreal people).
- Cards have short Japanese labels tied to the article theme.
- Top area is visual/atmosphere; bottom holds the title.
- Not a linear flowchart.
`.trim(),
  },
];

export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickUniform<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)] ?? items[0];
}

export interface PickedDiagramStyle {
  layout: DiagramLayout;
  palette: DiagramPalette;
  seed: number;
}

/**
 * 構図・色をカテゴリに寄せず、毎回フル候補から独立抽選。
 * seed 未指定時はタイトル＋時刻で都度変わる（再生成でも色が固定されない）。
 */
export function pickDiagramStyle(opts: {
  title: string;
  categorySlug?: string;
  seed?: number;
}): PickedDiagramStyle {
  const seed =
    opts.seed ??
    (hashSeed(`${opts.title}|eyecatch-v3`) ^ (Date.now() >>> 0) ^
      ((Math.random() * 0x100000000) >>> 0));
  const rng = mulberry32(seed || 1);

  const layout = pickUniform(DIAGRAM_LAYOUTS, rng);
  const palette = pickUniform(DIAGRAM_PALETTES, rng);

  return { layout, palette, seed };
}
