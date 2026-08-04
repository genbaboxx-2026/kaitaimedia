/**
 * Nano Banana 図解サムネのレイアウト／パレット多様化。
 * 同じ「紺ヘッダー＋クリーム＋横矢印4コマ」に固定しない。
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

/** 見た目が大きく違うパレット群 */
export const DIAGRAM_PALETTES: DiagramPalette[] = [
  {
    id: "ink-paper",
    brief:
      "Near-white paper background, charcoal ink typography, single vivid orange accent. Clean newspaper/editorial feel. Avoid navy header bars and cream panels.",
  },
  {
    id: "charcoal-amber",
    brief:
      "Charcoal (#1f2937) canvas, warm amber/gold accents, soft gray cards. Dark modern dashboard feel. No cream yellow body.",
  },
  {
    id: "slate-cyan",
    brief:
      "Cool slate blue-gray background, white cards, cyan accent lines. Tech-editorial. No red arrows, no navy title bar.",
  },
  {
    id: "forest-ivory",
    brief:
      "Deep forest green header or side band, ivory body, muted gold accents. Calm professional. Avoid bright red arrows.",
  },
  {
    id: "construction-hi-vis",
    brief:
      "Matte black background, high-vis yellow and white type, bold safety-sign geometry. High contrast. Not a soft cream infographic.",
  },
  {
    id: "burgundy-warm",
    brief:
      "Deep burgundy / wine tones with warm ivory panels and soft gold rules. Magazine feature look. Avoid flowchart red arrows.",
  },
  {
    id: "sky-white",
    brief:
      "Soft sky-blue gradient background, white content cards, navy text. Airy and light. No dense cream flowchart strip.",
  },
  {
    id: "mono-coral",
    brief:
      "Warm off-white background, black typography, single coral accent for emphasis. Minimal Swiss poster. Large empty space OK.",
  },
];

/**
 * 構図ファミリー。矢印プロセスは少数派にする。
 * 毎回同じ「上タイトル＋横4コマ」に寄せない。
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

/** カテゴリーで少し寄せたいレイアウト優先（強制はしない） */
const CATEGORY_LAYOUT_BIAS: Record<string, string[]> = {
  industry: ["split-compare", "type-poster", "big-number", "diagonal-bands"],
  management: ["split-compare", "stack-checklist", "big-number", "hub-spoke"],
  field: ["stack-checklist", "before-after", "hub-spoke", "process-3"],
  estimate: ["stack-checklist", "grid-2x2", "big-number", "stat-callouts"],
  schedule: ["process-3", "stack-checklist", "grid-2x2"],
  law: ["stack-checklist", "type-poster", "grid-2x2", "split-compare"],
  waste: ["before-after", "hub-spoke", "grid-2x2"],
  asbestos: ["before-after", "stack-checklist", "type-poster"],
  safety: ["stack-checklist", "before-after", "hub-spoke", "type-poster"],
};

const CATEGORY_PALETTE_BIAS: Record<string, string[]> = {
  industry: ["ink-paper", "burgundy-warm", "charcoal-amber", "mono-coral"],
  management: ["charcoal-amber", "slate-cyan", "ink-paper"],
  field: ["slate-cyan", "forest-ivory", "sky-white"],
  estimate: ["ink-paper", "mono-coral", "sky-white"],
  law: ["ink-paper", "slate-cyan", "forest-ivory"],
  waste: ["forest-ivory", "slate-cyan", "mono-coral"],
  asbestos: ["construction-hi-vis", "burgundy-warm", "charcoal-amber"],
  safety: ["construction-hi-vis", "charcoal-amber", "forest-ivory"],
};

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

function pickFrom<T extends { id: string }>(
  items: T[],
  rng: () => number,
  preferredIds?: string[],
): T {
  const preferred = preferredIds
    ?.map((id) => items.find((x) => x.id === id))
    .filter((x): x is T => Boolean(x));
  // カテゴリ寄せは弱め（毎回同じトンマナに固定しない）
  const pool =
    preferred && preferred.length > 0 && rng() < 0.4 ? preferred : items;
  return pool[Math.floor(rng() * pool.length)] ?? items[0];
}

export interface PickedDiagramStyle {
  layout: DiagramLayout;
  palette: DiagramPalette;
  seed: number;
}

export function pickDiagramStyle(opts: {
  title: string;
  categorySlug?: string;
  seed?: number;
}): PickedDiagramStyle {
  const seed =
    opts.seed ??
    hashSeed(`${opts.title}|${opts.categorySlug ?? ""}|eyecatch-v2`);
  const rng = mulberry32(seed);
  const slug = opts.categorySlug ?? "";

  // safety の誤った layout bias を除去した正しいバイアス
  const layoutBias = CATEGORY_LAYOUT_BIAS[slug]?.filter((id) =>
    DIAGRAM_LAYOUTS.some((l) => l.id === id),
  );
  const paletteBias = CATEGORY_PALETTE_BIAS[slug];

  const layout = pickFrom(DIAGRAM_LAYOUTS, rng, layoutBias);
  // レイアウトと独立にパレットを振って「構図は違うのに色が全部同じ」を減らす
  let palette = pickFrom(DIAGRAM_PALETTES, rng, paletteBias);
  if (DIAGRAM_PALETTES.length > 1) {
    // seed 上位ビットでもう一段ずらし、同カテゴリ連投での色被りを緩和
    const alt =
      DIAGRAM_PALETTES[(seed >>> 11) % DIAGRAM_PALETTES.length] ?? palette;
    if (alt.id === palette.id) {
      palette =
        DIAGRAM_PALETTES[(seed >>> 5) % DIAGRAM_PALETTES.length] ?? palette;
    } else if (rng() < 0.5) {
      palette = alt;
    }
  }

  return { layout, palette, seed };
}
