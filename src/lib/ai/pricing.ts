// 表示用の概算為替（USD→JPY）。実勢とずれる前提で「約」付きで使う。
export const USD_JPY_RATE = 150;

/** 米ドル概算を円に換算（四捨五入） */
export function usdToJpy(usd: number, rate = USD_JPY_RATE): number {
  return Math.round(usd * rate);
}

/** ログ表示用「$0.2449（約¥37）」 */
export function formatCostUsdJpy(usd: number): string {
  const jpy = usdToJpy(usd);
  return `$${usd.toFixed(4)}（約¥${jpy.toLocaleString("ja-JP")}）`;
}

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
  // xAI Grok（$/1M tokens。x_search 利用料は含まない概算）
  "grok-4-1-fast-reasoning": { input: 0.2, output: 0.5 },
  "grok-4-1-fast-non-reasoning": { input: 0.2, output: 0.5 },
  "grok-4-fast-reasoning": { input: 0.2, output: 0.5 },
  "grok-4-fast-non-reasoning": { input: 0.2, output: 0.5 },
};

const FALLBACK = PRICING["claude-opus-4-8"];

function resolvePricing(model: string): { input: number; output: number } {
  if (PRICING[model]) return PRICING[model]!;
  const lower = model.toLowerCase();
  if (lower.includes("grok") && lower.includes("fast")) {
    return PRICING["grok-4-1-fast-reasoning"]!;
  }
  if (lower.includes("grok")) {
    // 不明な Grok は Fast 単価で概算（高額モデル誤用でも過大表示を避ける）
    return PRICING["grok-4-1-fast-reasoning"]!;
  }
  if (lower.includes("haiku")) return PRICING["claude-haiku-4-5"]!;
  if (lower.includes("sonnet")) return PRICING["claude-sonnet-4-6"]!;
  if (lower.includes("opus")) return PRICING["claude-opus-4-8"]!;
  return FALLBACK;
}

// 概算コスト（米ドル）
export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const p = resolvePricing(model);
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}

// 画像モデル料金（$/100万トークン, 概算）。usage.input_tokens / output_tokens から算出。
// text入力/画像入力/画像出力で単価が異なるが、ここでは入力=テキスト単価、出力=画像出力単価で概算する。
const IMAGE_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-image-1": { input: 5, output: 40 },
  "gpt-image-1.5": { input: 5, output: 32 },
};

export function estimateImageCostUsd(
  inputTokens: number,
  outputTokens: number,
  model = "gpt-image-1",
): number {
  const p = IMAGE_PRICING[model] ?? IMAGE_PRICING["gpt-image-1"]!;
  return (
    (inputTokens / 1_000_000) * p.input +
    (outputTokens / 1_000_000) * p.output
  );
}
