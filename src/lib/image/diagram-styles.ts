/**
 * Nano Banana 図解サムネのレイアウト／パレット多様化。
 * カテゴリで色を寄せない。明るい色も暗い色も混ぜて毎回違う見た目にする。
 */

export interface DiagramPalette {
  id: string;
  /** light = 明るい地 / dark = 暗い地 */
  tone: "light" | "dark";
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

/** 見た目が大きく違うパレット群（明るい系を多めに用意） */
export const DIAGRAM_PALETTES: DiagramPalette[] = [
  // —— bright / light ——
  {
    id: "ink-paper",
    tone: "light",
    brief:
      "STRICT COLORS: near-white paper background, charcoal ink typography, ONE vivid orange accent only. Editorial newspaper. ENTIRE canvas stays bright/light. No navy bars, no dark charcoal canvas.",
  },
  {
    id: "sky-white",
    tone: "light",
    brief:
      "STRICT COLORS: soft sky-blue (#bae6fd) gradient background, white content cards, navy text. Airy and BRIGHT. No dark charcoal, no amber icons on black.",
  },
  {
    id: "mono-coral",
    tone: "light",
    brief:
      "STRICT COLORS: warm off-white (#fff7ed) background, black typography, single coral (#f43f5e) accent. Bright Swiss poster. Large empty space. No dark navy fill.",
  },
  {
    id: "lilac-ink",
    tone: "light",
    brief:
      "STRICT COLORS: soft lilac / lavender (#ede9fe) background, deep ink purple typography, white cards. Bright gentle editorial. No charcoal black canvas.",
  },
  {
    id: "mint-graphite",
    tone: "light",
    brief:
      "STRICT COLORS: mint (#a7f3d0) accents on bright white/graphite-white background. Fresh modern. Background must stay LIGHT. No amber, no black canvas.",
  },
  {
    id: "sand-terracotta",
    tone: "light",
    brief:
      "STRICT COLORS: warm sand / beige (#fef3c7) background, terracotta (#c2410c) accents, off-white cards. Bright earthy. No dark navy header.",
  },
  {
    id: "lemon-ink",
    tone: "light",
    brief:
      "STRICT COLORS: bright lemon-yellow (#fef08a) panels or bands on white, black typography. Cheerful high-key. No dark charcoal, no muted brown.",
  },
  {
    id: "ice-blue",
    tone: "light",
    brief:
      "STRICT COLORS: icy pale blue-white (#f0f9ff) background, electric blue (#2563eb) accents, white cards. Crisp bright tech. No orange-amber, no black fill.",
  },
  {
    id: "peach-cream",
    tone: "light",
    brief:
      "STRICT COLORS: soft peach (#ffedd5) background, deep rose accents, white cards. Warm and bright. No navy, no charcoal dashboard.",
  },
  {
    id: "spring-green",
    tone: "light",
    brief:
      "STRICT COLORS: pale spring green (#dcfce7) background, emerald (#059669) accents, white cards. Fresh bright. No black canvas, no gold amber icons.",
  },
  // —— dark (少数派として残す) ——
  {
    id: "charcoal-amber",
    tone: "dark",
    brief:
      "STRICT COLORS: charcoal (#1f2937) canvas, warm amber/gold accents, soft gray cards. Dark dashboard. No sky blue, no white paper look.",
  },
  {
    id: "slate-cyan",
    tone: "dark",
    brief:
      "STRICT COLORS: cool slate blue-gray background, white cards, cyan (#06b6d4) accent lines. Tech-editorial. No orange amber.",
  },
  {
    id: "forest-ivory",
    tone: "dark",
    brief:
      "STRICT COLORS: deep forest green bands, ivory body panels, muted gold accents. No orange, no cyan.",
  },
  {
    id: "construction-hi-vis",
    tone: "dark",
    brief:
      "STRICT COLORS: matte black background, high-vis yellow (#facc15) and white type only. Safety-sign geometry.",
  },
  {
    id: "burgundy-warm",
    tone: "dark",
    brief:
      "STRICT COLORS: deep burgundy / wine background or bands, warm ivory panels, soft gold rules. Magazine feature.",
  },
  {
    id: "electric-magenta",
    tone: "dark",
    brief:
      "STRICT COLORS: near-black background, electric magenta (#e879f9) and white type. Bold poster.",
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
- A thin vertical divider or Japanese 「対」 is OK.
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
`.trim(),
  },
  {
    id: "stat-callouts",
    titlePlacement: "Title across the bottom third on a solid band.",
    brief: `
COMPOSITION: THREE FLOATING CALLOUT CARDS over a subtle abstract pattern (no photoreal people).
- Cards have short Japanese labels tied to the article theme.
- Top area is visual/atmosphere; bottom holds the title.
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
 * 構図・色をカテゴリに寄せず抽選。
 * 明るいパレットを約70%で優先（暗い色も混ぜる）。
 * paletteId 指定時はその色を強制。
 */
export function pickDiagramStyle(opts: {
  title: string;
  categorySlug?: string;
  seed?: number;
  paletteId?: string;
}): PickedDiagramStyle {
  const seed =
    opts.seed ??
    (hashSeed(`${opts.title}|eyecatch-v4`) ^ (Date.now() >>> 0) ^
      ((Math.random() * 0x100000000) >>> 0));
  const rng = mulberry32(seed || 1);

  const layout = pickUniform(DIAGRAM_LAYOUTS, rng);

  let palette: DiagramPalette;
  if (opts.paletteId) {
    palette =
      DIAGRAM_PALETTES.find((p) => p.id === opts.paletteId) ??
      pickUniform(DIAGRAM_PALETTES, rng);
  } else {
    const light = DIAGRAM_PALETTES.filter((p) => p.tone === "light");
    const dark = DIAGRAM_PALETTES.filter((p) => p.tone === "dark");
    // 明るい色を多めに（約70%）
    const pool = rng() < 0.7 && light.length > 0 ? light : dark.length > 0 ? dark : DIAGRAM_PALETTES;
    palette = pickUniform(pool, rng);
  }

  return { layout, palette, seed };
}

export function getPaletteById(id: string): DiagramPalette | undefined {
  return DIAGRAM_PALETTES.find((p) => p.id === id);
}
