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

function stripCodeFence(text: string): string {
  const t = text.trim();
  const m = /^```(?:markdown|md)?\s*([\s\S]*?)```$/i.exec(t);
  return (m ? m[1] : t).trim();
}

/** 1件分の自社解説を生成して返す（DB未更新） */
export async function generateEditorialBody(input: {
  title: string;
  sourceName: string;
  summary?: string | null;
  model: string;
}): Promise<string> {
  const template = await getActivePrompt("news_editorial");
  const topics = extractNewsTopics(input.title);
  const prompt = interpolate(template, {
    title: input.title,
    source_name: input.sourceName,
    summary: (input.summary ?? "").trim() || "（要約なし）",
    topics: topics.length > 0 ? topics.join("、") : "解体・建設・産廃",
  });

  const res = await callText({
    prompt,
    model: input.model,
    maxTokens: 2500,
  });
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
    getNumber(settings, "news_editorial_max_per_run", 10),
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

  const model = getString(settings, "ai_model", "claude-sonnet-5");
  const pending = await restSelect<PendingNewsRow>(
    `news_items?select=id,title,source_name,summary&is_visible=eq.true&editorial_body=is.null&order=published_at.desc.nullslast&limit=${maxPerRun}`,
    0,
  );

  if (!pending || pending.length === 0) {
    console.log("[editorial] 生成待ちなし");
    return { attempted: 0, generated: 0, skipped: false, errors: [] };
  }

  console.log(`[editorial] ${pending.length}件の自社解説を生成します（model=${model}）`);
  let generated = 0;
  const errors: string[] = [];

  for (const row of pending) {
    try {
      const body = await generateEditorialBody({
        title: row.title,
        sourceName: row.source_name,
        summary: row.summary,
        model,
      });
      await restUpdate(`news_items?id=eq.${encodeURIComponent(row.id)}`, {
        editorial_body: body,
        editorial_generated_at: new Date().toISOString(),
      });
      generated += 1;
      console.log(`[editorial] OK ${row.id.slice(0, 8)}… ${row.title.slice(0, 40)}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push(`${row.id}: ${message}`);
      console.error(`[editorial] NG ${row.id}: ${message}`);
    }
  }

  return {
    attempted: pending.length,
    generated,
    skipped: false,
    errors,
  };
}
