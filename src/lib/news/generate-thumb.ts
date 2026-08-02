import { createElement } from "react";
import { readFileSync } from "node:fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { uploadEyecatch } from "@/lib/image/eyecatch";

/** 記事ごとに色がバラけるよう、彩度高めのパレット */
const PALETTES = [
  { from: "#1e3a5f", to: "#0f2744" },
  { from: "#3d2914", to: "#1f150a" },
  { from: "#1a3d32", to: "#0d211b" },
  { from: "#3b1f2b", to: "#1f1016" },
  { from: "#2a2a4a", to: "#151528" },
  { from: "#1f3d2e", to: "#0f2118" },
  { from: "#4a2810", to: "#2a1408" },
  { from: "#0f3d4a", to: "#082028" },
  { from: "#3d1f3a", to: "#1f0f1c" },
  { from: "#2c3e1f", to: "#161f0f" },
] as const;

let fontCache: Buffer | null = null;
let fontMissing = false;

function loadFont(): Buffer | null {
  if (fontCache) return fontCache;
  if (fontMissing) return null;
  const candidates = [
    process.env.EYECATCH_FONT_PATH,
    "assets/fonts/NotoSansJP-Bold.otf",
    "assets/fonts/NotoSansJP-Bold.ttf",
  ].filter((p): p is string => Boolean(p));
  for (const path of candidates) {
    try {
      fontCache = readFileSync(path);
      return fontCache;
    } catch {
      // try next
    }
  }
  fontMissing = true;
  return null;
}

function paletteFor(seed: string): (typeof PALETTES)[number] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * 17) % 997;
  return PALETTES[h % PALETTES.length];
}

function shorten(title: string, max = 42): string {
  const t = title.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/** ニュース一覧用の個別サムネPNGを生成（640×400） */
export async function generateNewsThumbPng(
  title: string,
  sourceName: string,
  seed: string,
): Promise<Buffer | null> {
  const font = loadFont();
  if (!font) return null;

  const palette = paletteFor(seed);
  const displaySource = sourceName.replace(/^Googleニュース\s*\/\s*/, "");
  const displayTitle = shorten(title, 48);

  const element = createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "36px 40px",
        color: "white",
        backgroundImage: `linear-gradient(145deg, ${palette.from} 0%, ${palette.to} 100%)`,
        fontFamily: "NotoSansJP",
      },
    },
    createElement(
      "div",
      {
        style: {
          display: "flex",
          fontSize: 22,
          fontWeight: 700,
          opacity: 0.75,
          letterSpacing: "0.04em",
        },
      },
      displaySource || "NEWS",
    ),
    createElement(
      "div",
      {
        style: {
          display: "flex",
          fontSize: 34,
          fontWeight: 700,
          lineHeight: 1.35,
        },
      },
      displayTitle,
    ),
    createElement(
      "div",
      {
        style: {
          display: "flex",
          fontSize: 18,
          opacity: 0.7,
        },
      },
      "解体ナレッジ",
    ),
  );

  const svg = await satori(element, {
    width: 640,
    height: 400,
    fonts: [{ name: "NotoSansJP", data: font, weight: 700, style: "normal" }],
  });

  return Buffer.from(new Resvg(svg).render().asPng());
}

/** 生成して Storage に上げ、公開URLを返す */
export async function createAndUploadNewsThumb(opts: {
  id: string;
  title: string;
  sourceName: string;
}): Promise<string | null> {
  const png = await generateNewsThumbPng(
    opts.title,
    opts.sourceName,
    opts.id + opts.title,
  );
  if (!png) return null;
  return uploadEyecatch(png, `news/${opts.id}`);
}
