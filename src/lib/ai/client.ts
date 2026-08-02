import Anthropic from "@anthropic-ai/sdk";
import { estimateCostUsd } from "@/lib/ai/pricing";

// Anthropic API 呼び出しラッパー。
// - プロンプトは呼び出し側が prompts テーブルから取得して渡す（このモジュールは直書きしない）
// - SDK の maxRetries で 3 回まで指数バックオフ（要件12: AI APIエラーは3回リトライ）
// - トークン使用量とコストを返す
// - JSON 期待の呼び出しはパース失敗時にフォールバック抽出する

const DEFAULT_MODEL = "claude-opus-4-8";
const DEFAULT_MAX_TOKENS = 12000;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    // ANTHROPIC_API_KEY を環境から解決。maxRetries=3 で 429/5xx/接続エラーを指数バックオフ再試行。
    client = new Anthropic({ maxRetries: 3 });
  }
  return client;
}

export interface AiCallOptions {
  prompt: string;
  system?: string;
  model?: string;
  maxTokens?: number;
  /** 拡張思考（adaptive）を有効化。プレミアム生成で使用 */
  thinking?: boolean;
  /** Web検索ツールを許可する最大回数（0/未指定で無効） */
  webSearchMaxUses?: number;
}

export interface AiResult {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  /** 実行されたWeb検索回数（概算コスト用） */
  webSearchCount: number;
}

// Web検索の従量課金（$10 / 1,000リクエスト）
const WEB_SEARCH_COST_PER_REQUEST = 0.01;

export async function callText(opts: AiCallOptions): Promise<AiResult> {
  const model = opts.model ?? DEFAULT_MODEL;
  const maxTokens = opts.maxTokens ?? DEFAULT_MAX_TOKENS;

  const params: Anthropic.MessageCreateParamsStreaming = {
    model,
    max_tokens: maxTokens,
    stream: true,
    ...(opts.system ? { system: opts.system } : {}),
    ...(opts.thinking ? { thinking: { type: "adaptive" } } : {}),
    ...(opts.webSearchMaxUses && opts.webSearchMaxUses > 0
      ? {
          tools: [
            {
              type: "web_search_20260209",
              name: "web_search",
              max_uses: opts.webSearchMaxUses,
            },
          ],
        }
      : {}),
    messages: [{ role: "user", content: opts.prompt }],
  };

  // 長文・思考・ツール使用に備えてストリーミングし、最終メッセージを取得する
  const res = await getClient().messages.stream(params).finalMessage();

  let text = "";
  for (const block of res.content) {
    if (block.type === "text") text += block.text;
  }

  const inputTokens = res.usage.input_tokens;
  const outputTokens = res.usage.output_tokens;
  const webSearchCount = res.usage.server_tool_use?.web_search_requests ?? 0;

  return {
    text,
    model,
    inputTokens,
    outputTokens,
    webSearchCount,
    costUsd:
      estimateCostUsd(model, inputTokens, outputTokens) +
      webSearchCount * WEB_SEARCH_COST_PER_REQUEST,
  };
}

export interface AiJsonResult<T> extends AiResult {
  data: T;
}

// JSON 期待の呼び出し。パースに失敗したら「JSONのみ」を厳守させて1回だけ再生成する（トークン/コストは合算）。
export async function callJson<T>(opts: AiCallOptions): Promise<AiJsonResult<T>> {
  const first = await callText(opts);
  try {
    return { ...first, data: parseJsonLoose<T>(first.text) };
  } catch {
    const retry = await callText({
      ...opts,
      prompt:
        opts.prompt +
        "\n\n重要：有効なJSONのみを出力してください。前置き・説明・コードフェンス（```）は一切書かないこと。",
    });
    const data = parseJsonLoose<T>(retry.text);
    return {
      ...retry,
      data,
      inputTokens: first.inputTokens + retry.inputTokens,
      outputTokens: first.outputTokens + retry.outputTokens,
      webSearchCount: first.webSearchCount + retry.webSearchCount,
      costUsd: first.costUsd + retry.costUsd,
    };
  }
}

export function parseJsonLoose<T>(text: string): T {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // フォールバック：コードフェンスや前置き文を含む場合に最初のJSONブロックを抽出
    const match = trimmed.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        // fallthrough
      }
    }
    throw new Error("AI応答からJSONを解析できませんでした");
  }
}
