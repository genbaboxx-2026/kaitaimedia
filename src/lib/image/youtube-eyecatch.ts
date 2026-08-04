/**
 * 表紙アイキャッチ入口。
 * 方針: Nano Banana 図解サムネ（写実YouTube風は廃止）。
 * 関数名はパイプライン互換のため残す。
 */
import { generateDiagramEyecatchPng } from "@/lib/image/diagram-eyecatch";

export interface YoutubeEyecatchResult {
  png: Buffer;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  model?: string;
  styleId?: string;
}

/** @deprecated 名前は互換のため残す。実体は Nano Banana 図解 */
export async function generateYoutubeEyecatchPng(
  title: string,
  categoryName: string,
  opts?: {
    quality?: "low" | "medium" | "high";
    categorySlug?: string;
    seed?: number;
  },
): Promise<YoutubeEyecatchResult | null> {
  const result = await generateDiagramEyecatchPng(title, categoryName, {
    categorySlug: opts?.categorySlug,
    seed: opts?.seed,
  });
  if (!result) return null;

  return {
    png: result.png,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costUsd: result.costUsd,
    model: result.model,
    styleId: result.styleId,
  };
}
