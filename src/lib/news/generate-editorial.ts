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

interface ExistingEditorialRow {
  id: string;
  title: string;
  editorial_body: string;
}

export interface GenerateEditorialResult {
  attempted: number;
  generated: number;
  /** AI呼び出しせず既存解説を流用した件数 */
  reused: number;
  skipped: boolean;
  skipReason?: string;
  errors: string[];
}

/** 見出しの表記ゆれを潰して重複判定用キーにする */
export function normalizeNewsTitleKey(title: string): string {
  return title
    .normalize("NFKC")
    .toLowerCase()
    .replace(/【[^】]*】/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/（[^）]*）/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[／/|:：・\-–—_]/g, "")
    .replace(/[\s\u3000「」『』\[\]【】、。,.!?！？]/g, "")
    .slice(0, 48);
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
      reused: 0,
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
      reused: 0,
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
      reused: 0,
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
  // 多めに取り、見出し重複を除いてから上限件数だけAI生成する
  const fetchLimit = Math.min(40, Math.max(maxPerRun * 4, maxPerRun));
  const pendingRaw = await restSelect<PendingNewsRow>(
    `news_items?select=id,title,source_name,summary&is_visible=eq.true&editorial_body=is.null&order=published_at.desc.nullslast&limit=${fetchLimit}`,
    0,
  );

  if (!pendingRaw || pendingRaw.length === 0) {
    console.log("[editorial] 生成待ちなし");
    return { attempted: 0, generated: 0, reused: 0, skipped: false, errors: [] };
  }

  // 既に解説がある記事から流用できるか確認（同じ話題の別URL対策）
  const existing = await restSelect<ExistingEditorialRow>(
    `news_items?select=id,title,editorial_body&is_visible=eq.true&editorial_body=not.is.null&order=editorial_generated_at.desc.nullslast&limit=80`,
    0,
  );
  const bodyByTitleKey = new Map<string, string>();
  for (const row of existing ?? []) {
    const key = normalizeNewsTitleKey(row.title);
    if (key.length >= 8 && !bodyByTitleKey.has(key)) {
      bodyByTitleKey.set(key, row.editorial_body);
    }
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
      reused: 0,
      skipped: true,
      skipReason: message,
      errors: [message],
    };
  }

  console.log(
    `[editorial] 候補${pendingRaw.length}件（AI上限${maxPerRun}件, model=${model}, timeout=${EDITORIAL_TIMEOUT_MS / 1000}s/件）`,
  );
  let generated = 0;
  let reused = 0;
  let aiCalls = 0;
  const errors: string[] = [];

  for (let i = 0; i < pendingRaw.length; i++) {
    const row = pendingRaw[i];
    const label = `[${i + 1}/${pendingRaw.length}]`;
    const titleKey = normalizeNewsTitleKey(row.title);
    const started = Date.now();

    // 既知の同題（DB or 今の実行）があればAIせず流用
    const reusable =
      titleKey.length >= 8 ? bodyByTitleKey.get(titleKey) : undefined;
    if (reusable) {
      try {
        await restUpdate(`news_items?id=eq.${encodeURIComponent(row.id)}`, {
          editorial_body: reusable,
          editorial_generated_at: new Date().toISOString(),
        });
        reused += 1;
        console.log(
          `[editorial] ${label} REUSE ${((Date.now() - started) / 1000).toFixed(1)}s ${row.title.slice(0, 40)}`,
        );
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        errors.push(`${row.id}: ${message}`);
        console.error(`[editorial] ${label} REUSE NG ${message}`);
      }
      continue;
    }

    if (aiCalls >= maxPerRun) {
      // AI枠は使い切った。残りは次回（流用できるものだけ上で処理済み）
      console.log(
        `[editorial] AI上限${maxPerRun}件に達したため残りは次回へ`,
      );
      break;
    }

    console.log(`[editorial] ${label} 開始… ${row.title.slice(0, 40)}`);
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
      aiCalls += 1;
      if (titleKey.length >= 8) {
        bodyByTitleKey.set(titleKey, body);
      }
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

  console.log(
    `[editorial] AI新規=${generated} 同題流用=${reused} エラー=${errors.length}`,
  );

  return {
    attempted: pendingRaw.length,
    generated,
    reused,
    skipped: false,
    errors,
  };
}
