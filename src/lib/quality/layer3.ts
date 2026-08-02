import { callJson } from "@/lib/ai/client";
import { getActivePrompt, interpolate } from "@/lib/ai/prompts";
import type { CheckResult, QualityInput, QualityThresholds } from "@/lib/quality/types";

interface AiScore {
  naturalness: number;
  consistency: number;
  specificity: number;
  comment?: string;
}

// 第3層：AI定性評価（自然さ・一貫性・具体性の3点のみ）。要件定義書 6.3。
// 事実の正誤判定は行わせない（プロンプト側で担保）。
export async function runLayer3(
  input: QualityInput,
  thr: QualityThresholds,
): Promise<CheckResult[]> {
  if (thr.enabled["ai_quality"] === false) return [];

  const template = await getActivePrompt("quality");
  const prompt = interpolate(template, { body: input.body });

  const { data } = await callJson<AiScore>({
    prompt,
    model: thr.aiModel,
    maxTokens: 1000,
  });

  // 3観点の平均で判定（1項目だけ低くても全体を落とさない）。ただし極端に低い項目(=1)は不可。
  const avg =
    (data.naturalness + data.consistency + data.specificity) / 3;
  const hasCritical =
    Math.min(data.naturalness, data.consistency, data.specificity) <= 1;
  const scoreRounded = Math.round(avg * 10) / 10;
  const passed = avg >= thr.aiPassScore && !hasCritical;

  return [
    {
      layer: 3,
      checkItem: passed ? "AI判定" : `AI判定 平均${scoreRounded}/5`,
      passed,
      detail: `自然さ${data.naturalness} / 一貫性${data.consistency} / 具体性${data.specificity}（平均${scoreRounded}）${
        data.comment ? `／${data.comment}` : ""
      }`,
      score: scoreRounded,
    },
  ];
}
