/**
 * Nano Banana 図解サムネ（表紙1枚目）。
 * 構図・色はタイトルごとにバリエーションを取る。
 */
import sharp from "sharp";
import {
  buildDiagramEyecatchPrompt,
  generateNanoBananaPng,
} from "@/lib/image/nanobanana";
import { pickDiagramStyle } from "@/lib/image/diagram-styles";

export interface DiagramEyecatchResult {
  png: Buffer;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  styleId: string;
}

const OUT_W = 1280;
const OUT_H = 720;

export async function generateDiagramEyecatchPng(
  title: string,
  categoryName: string,
  opts?: {
    model?: string;
    categorySlug?: string;
    seed?: number;
    paletteId?: string;
  },
): Promise<DiagramEyecatchResult | null> {
  const style = pickDiagramStyle({
    title,
    categorySlug: opts?.categorySlug,
    seed: opts?.seed,
    paletteId: opts?.paletteId,
  });
  const styleId = `${style.layout.id}/${style.palette.id}`;
  console.log(
    `[eyecatch] style=${styleId} seed=${style.seed} title=${title.slice(0, 40)}`,
  );

  const prompt = buildDiagramEyecatchPrompt(title, categoryName, {
    categorySlug: opts?.categorySlug,
    style,
  });
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
    styleId,
  };
}
