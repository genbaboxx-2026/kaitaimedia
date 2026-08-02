import { createElement } from "react";
import { readFileSync } from "node:fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { getCategoryMeta } from "@/lib/categories-meta";
import { estimateImageCostUsd } from "@/lib/ai/pricing";

export interface AiImageResult {
  png: Buffer;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

// アイキャッチ画像生成（satori で SVG → resvg で PNG）。要件定義書 第10章。
// 日本語フォントが必要。EYECATCH_FONT_PATH か assets/fonts/NotoSansJP-Bold.ttf に配置する。
// フォントが無ければ null を返し、パイプラインはアイキャッチ無しとして扱う。

let fontCache: Buffer | null = null;
let fontMissing = false;

function loadFont(): Buffer | null {
  if (fontCache) return fontCache;
  if (fontMissing) return null;
  const path =
    process.env.EYECATCH_FONT_PATH || "assets/fonts/NotoSansJP-Bold.ttf";
  try {
    fontCache = readFileSync(path);
    return fontCache;
  } catch {
    fontMissing = true;
    return null;
  }
}

export async function generateEyecatchPng(
  title: string,
  categorySlug: string,
  categoryName: string,
): Promise<Buffer | null> {
  const font = loadFont();
  if (!font) return null;

  const meta = getCategoryMeta(categorySlug);

  const element = createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "64px",
        color: "white",
        backgroundImage: `linear-gradient(135deg, ${meta.from} 0%, ${meta.to} 100%)`,
        fontFamily: "NotoSansJP",
      },
    },
    createElement("div", { style: { fontSize: 32, opacity: 0.9 } }, categoryName),
    createElement(
      "div",
      { style: { display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.35 } },
      title,
    ),
    createElement(
      "div",
      { style: { fontSize: 28, opacity: 0.85 } },
      "解体ナレッジ | GENBABOXX",
    ),
  );

  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts: [{ name: "NotoSansJP", data: font, weight: 700, style: "normal" }],
  });

  const png = new Resvg(svg).render().asPng();
  return Buffer.from(png);
}

// OpenAI 画像モデル（gpt-image-1）でアイキャッチPNGを生成する。
// トーン：写実的な現場写真は避け、抽象・図解・フラットベクター調（専門性を損なわないため）。
// 文字は入れない（画像モデルは日本語を崩すため）。OPENAI_API_KEY 未設定・失敗時は null。
export interface AiImageOptions {
  quality?: "low" | "medium" | "high";
  /** 画像ごとに構図を変えて重複を避けるためのヒント */
  variantHint?: string;
  /** 記事ごとに変える絵柄（イラスト／写真風など） */
  style?: string;
}

// 記事ごとにランダムで選ぶ絵柄（毎回テイストが変わるように）
export const IMAGE_STYLES: string[] = [
  "refined modern flat vector illustration, crisp clean edges, generous negative space, editorial tone",
  "realistic editorial photograph, natural soft lighting, shallow depth of field, documentary feel",
  "isometric 3D illustration, soft shadows, clean geometric shapes",
  "hand-drawn line illustration with limited flat color accents, sketchbook feel",
  "modern paper-cut / layered collage style with subtle paper texture",
  "cinematic semi-realistic 3D render, dramatic lighting, matte finish",
];

export function pickImageStyle(): string {
  return IMAGE_STYLES[Math.floor(Math.random() * IMAGE_STYLES.length)];
}

export async function generateAiEyecatchPng(
  subject: string,
  categoryName: string,
  opts?: AiImageOptions,
): Promise<AiImageResult | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const quality = opts?.quality ?? "high";
  const style = opts?.style ?? IMAGE_STYLES[0];
  const prompt = [
    "High-quality cover/figure image for a Japanese B2B media about the building demolition industry.",
    `Category: ${categoryName}. This specific image represents: ${subject}.`,
    opts?.variantHint
      ? `Composition for THIS image (make it clearly different from other figures in the article): ${opts.variantHint}.`
      : "",
    `Art style: ${style}.`,
    "Overall palette leans deep navy and slate grays with a single red accent; balanced, professional editorial look.",
    "Depict the concept concretely with distinct, non-repeating subjects relevant to the specific image above.",
    "STRICT: no text, no words, no letters, no numbers, no logos, no watermark. Avoid identifiable real people or brand marks.",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1536x1024",
        quality,
        n: 1,
      }),
    });
    if (!res.ok) {
      console.warn("gpt-image-1 失敗:", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as {
      data?: { b64_json?: string }[];
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) return null;
    const inputTokens = data.usage?.input_tokens ?? 0;
    const outputTokens = data.usage?.output_tokens ?? 0;
    return {
      png: Buffer.from(b64, "base64"),
      inputTokens,
      outputTokens,
      costUsd: estimateImageCostUsd(inputTokens, outputTokens),
    };
  } catch (e) {
    console.warn("gpt-image-1 例外:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

// Supabase Storage の公開バケット 'eyecatch' にアップロードし公開URLを返す。
// バケットが無い・service key 未設定なら null。
export async function uploadEyecatch(
  png: Buffer,
  slug: string,
): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const objectPath = `${slug}.png`;
  try {
    const res = await fetch(
      `${url}/storage/v1/object/eyecatch/${objectPath}`,
      {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "image/png",
          "x-upsert": "true",
        },
        body: new Uint8Array(png),
      },
    );
    if (!res.ok) return null;
    return `${url}/storage/v1/object/public/eyecatch/${objectPath}`;
  } catch {
    return null;
  }
}
