import { parseJsonLoose } from "@/lib/ai/client";

// xAI Grok Responses API（x_search ツール付き）。
// プロンプト本文は呼び出し側が prompts テーブルから渡す。

const XAI_RESPONSES_URL = "https://api.x.ai/v1/responses";
const DEFAULT_MODEL = "grok-4-1-fast-reasoning";
const MAX_ATTEMPTS = 3;

export interface GrokXSearchOptions {
  prompt: string;
  model?: string;
  /** 検索対象の開始日 YYYY-MM-DD */
  fromDate?: string;
  /** 検索対象の終了日 YYYY-MM-DD */
  toDate?: string;
}

export interface GrokXSearchResult {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

interface ResponsesOutputContent {
  type?: string;
  text?: string;
}

interface ResponsesOutputItem {
  type?: string;
  content?: ResponsesOutputContent[];
}

interface ResponsesApiBody {
  status?: string;
  error?: { message?: string } | null;
  model?: string;
  output?: ResponsesOutputItem[];
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractOutputText(body: ResponsesApiBody): string {
  const parts: string[] = [];
  for (const item of body.output ?? []) {
    if (item.type !== "message") continue;
    for (const block of item.content ?? []) {
      if (
        (block.type === "output_text" || block.type === "text") &&
        typeof block.text === "string"
      ) {
        parts.push(block.text);
      }
    }
  }
  return parts.join("\n").trim();
}

/** x_search 付きで Grok を呼び、最終テキストを返す（最大3回リトライ） */
export async function callGrokXSearch(
  opts: GrokXSearchOptions,
): Promise<GrokXSearchResult> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY が未設定です");
  }

  const model = opts.model ?? DEFAULT_MODEL;
  const xSearchTool: Record<string, unknown> = { type: "x_search" };
  if (opts.fromDate) xSearchTool.from_date = opts.fromDate;
  if (opts.toDate) xSearchTool.to_date = opts.toDate;

  const payload = {
    model,
    input: [
      {
        role: "user",
        content: opts.prompt,
      },
    ],
    tools: [xSearchTool],
  };

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(XAI_RESPONSES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      if (!res.ok) {
        throw new Error(`Grok API HTTP ${res.status}: ${raw.slice(0, 500)}`);
      }

      const body = JSON.parse(raw) as ResponsesApiBody;
      if (body.error?.message) {
        throw new Error(`Grok API error: ${body.error.message}`);
      }

      const text = extractOutputText(body);
      if (!text) {
        throw new Error("Grok応答にテキストがありませんでした");
      }

      return {
        text,
        model: body.model ?? model,
        inputTokens: body.usage?.input_tokens ?? 0,
        outputTokens: body.usage?.output_tokens ?? 0,
      };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < MAX_ATTEMPTS) {
        await sleep(500 * 2 ** (attempt - 1));
      }
    }
  }

  throw lastError ?? new Error("Grok API呼び出しに失敗しました");
}

/** Grok応答テキストからJSONをパース（失敗時は1回だけ厳守再生成は呼び出し側で） */
export function parseGrokJson<T>(text: string): T {
  return parseJsonLoose<T>(text);
}
