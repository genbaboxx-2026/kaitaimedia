/**
 * Nano Banana（Gemini 画像生成）クライアント。
 * モデル既定: gemini-3.1-flash-image（Nano Banana 2）
 */
import { GoogleGenAI } from "@google/genai";
import type { PickedDiagramStyle } from "@/lib/image/diagram-styles";
import { pickDiagramStyle } from "@/lib/image/diagram-styles";

export const NANOBANANA_MODEL =
  process.env.NANOBANANA_MODEL || "gemini-3.1-flash-image";

export interface NanoBananaImageResult {
  png: Buffer;
  model: string;
  /** 概算（トークン情報が取れない場合の固定見積もり） */
  costUsd: number;
  inputTokens: number;
  outputTokens: number;
  /** デバッグ用：選ばれた構図/色 */
  styleId?: string;
}

function getApiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    null
  );
}

export interface DiagramPromptOptions {
  categorySlug?: string;
  seed?: number;
  /** 呼び出し側で決定済みのスタイル（二重抽選防止） */
  style?: PickedDiagramStyle;
}

/**
 * 図解サムネ用プロンプト。
 * タイトル／カテゴリから構図・色を毎回変える（固定の紺ヘッダー＋クリーム4コマを禁止）。
 */
export function buildDiagramEyecatchPrompt(
  title: string,
  categoryName: string,
  opts?: DiagramPromptOptions,
): string {
  const style =
    opts?.style ??
    pickDiagramStyle({
      title,
      categorySlug: opts?.categorySlug,
      seed: opts?.seed,
    });
  const { layout, palette, seed } = style;

  return `
Create one finished 16:9 Japanese B2B editorial eye-catch thumbnail. Draw ONLY the artwork. Never print this brief, constraints, English meta, or style IDs in the image.

ARTICLE
- Exact Japanese title to show: ${title}
- Small Japanese category label: ${categoryName}
- Invent icons and short labels FROM THIS TITLE's meaning. Do not reuse generic defaults like 情報共有/安全確認/状況把握/成果 unless the title is truly about those topics.
- Style pick (internal): layout=${layout.id} palette=${palette.id} seed=${seed}

TITLE PLACEMENT
${layout.titlePlacement}

LAYOUT (follow strictly — this must NOT look like a navy-top + cream body + 4 red-arrow panels unless this layout explicitly asks for a short process)
${layout.brief}

COLOR / TONE (MANDATORY — ignore category habits and your default demolition-infographic look)
- Palette id: ${palette.id} (tone=${palette.tone})
${palette.brief}
- Use ONLY this palette. Do NOT fall back to charcoal + amber/orange icons just because the topic is demolition.
- If tone=light: the MAJORITY of the canvas MUST be bright (white / pastel / pale). Dark charcoal/navy fills are forbidden.
- If tone=dark: keep it dark as specified — still do not invent amber unless the brief says amber.

HARD BAN (critical for variety)
- Do NOT default to: full-width deep navy header + soft cream body + 4 equal panels + red arrows
- Do NOT default to: dark charcoal canvas + orange/amber icons (unless palette id is explicitly charcoal-amber)
- Do NOT reuse the same four labels 情報共有 / 安全確認 / 状況把握 / 成果
- Do NOT draw English words (no Step, Category, Before, After in Latin letters — use Japanese 改善前/改善後 if needed)
- No people, no faces, no photoreal workers, no logos, no watermarks, no URLs, no character-count notes

VISUAL LANGUAGE
- Flat vector / editorial illustration, readable at small mobile sizes
- Symbols may include excavators, buildings, documents, tablets, hard hats, charts, checkmarks — choose what fits THIS title
- Keep text large and legible; prefer fewer words over clutter
- Japanese only on the image
`.trim();
}

/**
 * Nano Banana で画像を1枚生成する。
 * GEMINI_API_KEY 未設定時は null。
 */
export async function generateNanoBananaPng(
  prompt: string,
  opts?: { model?: string; aspectRatio?: "16:9" | "1:1" | "4:3" },
): Promise<NanoBananaImageResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn(
      "GEMINI_API_KEY（または GOOGLE_API_KEY）が未設定のため Nano Banana をスキップ",
    );
    return null;
  }

  const model = opts?.model ?? NANOBANANA_MODEL;
  const aspectRatio = opts?.aspectRatio ?? "16:9";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inline = part.inlineData;
      if (!inline?.data) continue;
      const mime = inline.mimeType ?? "image/png";
      const raw = Buffer.from(inline.data, "base64");
      void mime;
      const usage = response.usageMetadata;
      const inputTokens = usage?.promptTokenCount ?? 0;
      const outputTokens = usage?.candidatesTokenCount ?? 0;
      const costUsd =
        inputTokens + outputTokens > 0
          ? (inputTokens / 1_000_000) * 0.3 + (outputTokens / 1_000_000) * 30
          : 0.05;

      return {
        png: raw,
        model,
        costUsd,
        inputTokens,
        outputTokens,
      };
    }

    console.warn("Nano Banana: 画像パートが返りませんでした");
    return null;
  } catch (e) {
    console.warn(
      "Nano Banana 例外:",
      e instanceof Error ? e.message : String(e),
    );
    return null;
  }
}
