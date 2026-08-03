/**
 * Nano Banana（Gemini 画像生成）クライアント。
 * モデル既定: gemini-3.1-flash-image（Nano Banana 2）
 */
import { GoogleGenAI } from "@google/genai";

export const NANOBANANA_MODEL =
  process.env.NANOBANANA_MODEL || "gemini-3.1-flash-image";

export interface NanoBananaImageResult {
  png: Buffer;
  model: string;
  /** 概算（トークン情報が取れない場合の固定見積もり） */
  costUsd: number;
  inputTokens: number;
  outputTokens: number;
}

function getApiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    null
  );
}

/** 図解サムネ用プロンプト（人物なし・編集向けフラット図解） */
export function buildDiagramEyecatchPrompt(
  title: string,
  categoryName: string,
): string {
  return `
Create one finished 16:9 Japanese B2B editorial eye-catch. Draw only the artwork. Do not print this brief, constraints, or English meta text in the image.

SUBJECT
- Header title (exact): ${title}
- Small Japanese category under the title: ${categoryName}
- Theme: site communication that improves foreman management on a demolition job site

LAYOUT
1) Full-width deep navy header with the title in large white Japanese type
2) Soft cream body with ONE horizontal process of 4 equal panels, connected by red arrows
3) Each panel has: Japanese circle number (①②③④) + ONE short Japanese label under a single icon cluster
4) Keep the composition balanced, aligned, and uncluttered

VISUAL LANGUAGE
- Flat vector / textbook infographic
- Symbols only: excavators, buildings, radios, hard hats, checklists, tablets, documents, arrows
- No people, no faces, no photoreal workers
- Palette: navy, slate, cream, muted red accents
- Professional demolition-industry editorial look

ON-IMAGE TEXT RULES
- Japanese only
- Header title once
- Category once
- Each panel: number + one label only (do not repeat the same label twice in one panel)
- Good labels: 情報共有 / 安全確認 / 状況把握 / 成果
- Never draw English words (no Step, no Category, no max, no characters)
- Never draw character-limit notes, parentheses with limits, prompt leftovers, logos, watermarks, URLs
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
      // JPEG 等でも sharp 側で PNG 化する想定。ここでは素のバッファを返す。
      void mime;
      const usage = response.usageMetadata;
      const inputTokens = usage?.promptTokenCount ?? 0;
      const outputTokens = usage?.candidatesTokenCount ?? 0;
      // Flash Image 概算: 画像1枚あたりおおよそ $0.03〜0.07。取れないときは $0.05
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
