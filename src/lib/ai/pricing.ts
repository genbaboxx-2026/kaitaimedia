// モデル別の料金（$/100万トークン）。コスト概算に使用。
// 参考: claude-api リファレンス（2026-06 時点）。新モデル追加時はここを更新する。
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-4-8": { input: 5, output: 25 },
  "claude-opus-4-7": { input: 5, output: 25 },
  "claude-opus-4-6": { input: 5, output: 25 },
  "claude-sonnet-5": { input: 3, output: 15 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-haiku-4-5-20251001": { input: 1, output: 5 },
  "claude-fable-5": { input: 10, output: 50 },
};

const FALLBACK = PRICING["claude-opus-4-8"];

// 概算コスト（米ドル）
export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const p = PRICING[model] ?? FALLBACK;
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}

// gpt-image-1 の料金（$/100万トークン, 概算）。usage.input_tokens / output_tokens から算出。
// text入力/画像入力/画像出力で単価が異なるが、ここでは入力=テキスト単価、出力=画像出力単価で概算する。
const IMAGE_PRICING = { input: 5, output: 40 };

export function estimateImageCostUsd(
  inputTokens: number,
  outputTokens: number,
): number {
  return (
    (inputTokens / 1_000_000) * IMAGE_PRICING.input +
    (outputTokens / 1_000_000) * IMAGE_PRICING.output
  );
}
