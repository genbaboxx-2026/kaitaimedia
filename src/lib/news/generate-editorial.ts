import { callText } from "@/lib/ai/client";
import { getActivePrompt, interpolate } from "@/lib/ai/prompts";
import { getBool, getNumber, getString, loadSettings } from "@/lib/ai/settings";
import { extractNewsTopics } from "@/lib/news/briefing";
import { restSelect, restUpdate } from "@/lib/supabase/rest";

interface PendingNewsRow {
  id: string;
  title: string;
  source_name: string;
  summary: string | null;
}

export interface GenerateEditorialResult {
  attempted: number;
  generated: number;
  skipped: boolean;
  skipReason?: string;
  errors: string[];
}

/** 1件あたりの上限（超過したらスキップして次へ）。ハング検知用 */
const EDITORIAL_TIMEOUT_MS = 45_000;

function stripCodeFence(text: string): string {
  const t = text.trim();
  const m = /^```(?:markdown|md)?\s*([\s\S]*?)```$/i.exec(t);
  return (m ? m[1] : t).trim();
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${label} が ${Math.round(ms / 1000)}秒でタイムアウト`));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** 1件分の自社解説を生成して返す（DB未更新） */
export async function generateEditorialBody(input: {
  title: string;
  sourceName: string;
  summary?: string | null;
  model: string;
  /** 呼び出し側で1回取得したプロンプトを渡す（毎回DBしない） */
  template: string;
}): Promise<string> {
  const topics = extractNewsTopics(input.title);
  const prompt = interpolate(input.template, {
    title: input.title,
    source_name: input.sourceName,
    summary: (input.summary ?? "").trim() || "（要約なし）",
    topics: topics.length > 0 ? topics.join("、") : "解体・建設・産廃",
  });

  const res = await withTimeout(
    callText({
      prompt,
      model: input.model,
      // 3部構成の短文なので小さめで応答を早くする
      maxTokens: 1200,
    }),
    EDITORIAL_TIMEOUT_MS,
    `解説生成「${input.title.slice(0, 24)}」`,
  );
  const body = stripCodeFence(res.text);
  if (body.length < 80) {
    throw new Error("生成結果が短すぎます");
  }
  return body;
}

/**
 * editorial_body が空のニュースへ、上限件数まで自社解説を生成して保存する。
 * ANTHROPIC_API_KEY 未設定や設定OFFのときはスキップ（RSS取得自体は成功扱い）。
 */
export async function generateMissingEditorials(): Promise<GenerateEditorialResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      "[editorial] ANTHROPIC_API_KEY 未設定のため自社解説の生成をスキップ",
    );
    return {
      attempted: 0,
      generated: 0,
      skipped: true,
      skipReason: "ANTHROPIC_API_KEY未設定",
      errors: [],
    };
  }

  const settings = await loadSettings();
  if (!getBool(settings, "news_editorial_enabled", true)) {
    console.log("[editorial] news_editorial_enabled=false のためスキップ");
    return {
      attempted: 0,
      generated: 0,
      skipped: true,
      skipReason: "news_editorial_enabled=false",
      errors: [],
    };
  }

  const maxPerRun = Math.max(
    0,
    getNumber(settings, "news_editorial_max_per_run", 5),
  );
  if (maxPerRun === 0) {
    return {
      attempted: 0,
      generated: 0,
      skipped: true,
      skipReason: "news_editorial_max_per_run=0",
      errors: [],
    };
  }

  // 日付付きIDの方が安定。旧キー claude-haiku-4-5 も許容。
  const model = getString(
    settings,
    "news_editorial_model",
    "claude-haiku-4-5-20251001",
  );
  const pending = await restSelect<PendingNewsRow>(
    `news_items?select=id,title,source_name,summary&is_visible=eq.true&editorial_body=is.null&order=published_at.desc.nullslast&limit=${maxPerRun}`,
    0,
  );

  if (!pending || pending.length === 0) {
    console.log("[editorial] 生成待ちなし");
    return { attempted: 0, generated: 0, skipped: false, errors: [] };
  }

  let template: string;
  try {
    template = await getActivePrompt("news_editorial");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`[editorial] プロンプト取得失敗: ${message}`);
    return {
      attempted: 0,
      generated: 0,
      skipped: true,
      skipReason: message,
      errors: [message],
    };
  }

  console.log(
    `[editorial] ${pending.length}件の自社解説を生成します（model=${model}, timeout=${EDITORIAL_TIMEOUT_MS / 1000}s/件）`,
  );
  let generated = 0;
  const errors: string[] = [];

  for (let i = 0; i < pending.length; i++) {
    const row = pending[i];
    const label = `[${i + 1}/${pending.length}]`;
    console.log(
      `[editorial] ${label} 開始… ${row.title.slice(0, 40)}`,
    );
    const started = Date.now();
    try {
      const body = await generateEditorialBody({
        title: row.title,
        sourceName: row.source_name,
        summary: row.summary,
        model,
        template,
      });
      await restUpdate(`news_items?id=eq.${encodeURIComponent(row.id)}`, {
        editorial_body: body,
        editorial_generated_at: new Date().toISOString(),
      });
      generated += 1;
      console.log(
        `[editorial] ${label} OK ${((Date.now() - started) / 1000).toFixed(1)}s ${row.title.slice(0, 40)}`,
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push(`${row.id}: ${message}`);
      console.error(
        `[editorial] ${label} NG ${((Date.now() - started) / 1000).toFixed(1)}s ${message}`,
      );
    }
  }

  return {
    attempted: pending.length,
    generated,
    skipped: false,
    errors,
  };
}
