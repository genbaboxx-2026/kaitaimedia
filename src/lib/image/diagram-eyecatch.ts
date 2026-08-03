/**
 * Nano Banana 図解サムネ（表紙1枚目）。
 * 写実YouTube風ではなく、編集向けフラット図解を生成する。
 */
import sharp from "sharp";
import {
  buildDiagramEyecatchPrompt,
  generateNanoBananaPng,
} from "@/lib/image/nanobanana";

export interface DiagramEyecatchResult {
  png: Buffer;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

const OUT_W = 1280;
const OUT_H = 720;

export async function generateDiagramEyecatchPng(
  title: string,
  categoryName: string,
  opts?: { model?: string },
): Promise<DiagramEyecatchResult | null> {
  const prompt = buildDiagramEyecatchPrompt(title, categoryName);
  const raw = await generateNanoBananaPng(prompt, {
    model: opts?.model,
    aspectRatio: "16:9",
  });
  if (!raw) return null;

  const png = await sharp(raw.png)
    .resize(OUT_W, OUT_H, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  return {
    png,
    model: raw.model,
    inputTokens: raw.inputTokens,
    outputTokens: raw.outputTokens,
    costUsd: raw.costUsd,
  };
}
