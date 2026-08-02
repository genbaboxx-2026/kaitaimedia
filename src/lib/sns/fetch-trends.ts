import { callGrokXSearch, parseGrokJson } from "@/lib/ai/grok";
import { getActivePrompt, interpolate } from "@/lib/ai/prompts";
import {
  getNumber,
  getString,
  loadSettings,
} from "@/lib/ai/settings";
import { restInsert, restSelect, restUpdate } from "@/lib/supabase/rest";

export interface SnsTrendCandidate {
  post_url: string;
  author_handle: string;
  author_name: string | null;
  text_snippet: string;
  like_count: number;
  posted_at: string | null;
  relevance_note: string | null;
}

export interface FetchSnsTrendsResult {
  fetched: number;
  upserted: number;
  skipped: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
  /** 0件のとき原因確認用（先頭のみ） */
  preview?: string;
}

interface GrokPostRow {
  post_url?: unknown;
  url?: unknown;
  author_handle?: unknown;
  handle?: unknown;
  username?: unknown;
  author_name?: unknown;
  name?: unknown;
  text_snippet?: unknown;
  text?: unknown;
  content?: unknown;
  like_count?: unknown;
  likes?: unknown;
  favorite_count?: unknown;
  posted_at?: unknown;
  created_at?: unknown;
  relevance_note?: unknown;
  reason?: unknown;
}

function isXPostUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host !== "x.com" && host !== "twitter.com") return false;
    return /\/status\/\d+/i.test(u.pathname);
  } catch {
    return false;
  }
}

function normalizeHandle(raw: string): string {
  return raw.replace(/^@/, "").trim().slice(0, 80);
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function asLikeCount(row: GrokPostRow): number {
  const raw = row.like_count ?? row.likes ?? row.favorite_count;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

function normalizeCandidate(
  row: GrokPostRow,
  minLikes: number,
  softLikes: boolean,
): SnsTrendCandidate | null {
  const urlRaw = asString(row.post_url) ?? asString(row.url);
  if (!urlRaw || !isXPostUrl(urlRaw)) return null;

  const snippet =
    asString(row.text_snippet) ??
    asString(row.text) ??
    asString(row.content) ??
    "";
  if (!snippet) return null;

  const likeCount = asLikeCount(row);
  // soft: いいね不明(0)は通す。明示的に目安未満だけ除外
  if (softLikes) {
    if (likeCount > 0 && likeCount < minLikes) return null;
  } else if (likeCount < minLikes) {
    return null;
  }

  const postedRaw = asString(row.posted_at) ?? asString(row.created_at);
  let postedAt: string | null = null;
  if (postedRaw) {
    const d = new Date(postedRaw);
    if (!Number.isNaN(d.getTime())) postedAt = d.toISOString();
  }

  const handleRaw =
    asString(row.author_handle) ??
    asString(row.handle) ??
    asString(row.username) ??
    "";

  return {
    post_url: urlRaw.replace("https://twitter.com/", "https://x.com/"),
    author_handle: normalizeHandle(handleRaw),
    author_name: asString(row.author_name) ?? asString(row.name),
    text_snippet: snippet.slice(0, 400),
    like_count: likeCount,
    posted_at: postedAt,
    relevance_note: (
      asString(row.relevance_note) ??
      asString(row.reason) ??
      ""
    ).slice(0, 200) || null,
  };
}

function fromDateDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function parseRows(text: string): GrokPostRow[] {
  const parsed = parseGrokJson<unknown>(text);
  if (Array.isArray(parsed)) return parsed as GrokPostRow[];
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    for (const key of ["posts", "items", "results", "data", "tweets"]) {
      if (Array.isArray(obj[key])) return obj[key] as GrokPostRow[];
    }
  }
  return [];
}

function rowsFromCitationUrls(urls: string[]): GrokPostRow[] {
  return urls.filter(isXPostUrl).map((url) => {
    let handle = "";
    try {
      const parts = new URL(url).pathname.split("/").filter(Boolean);
      if (parts[0] && parts[0] !== "i") handle = parts[0];
    } catch {
      // ignore
    }
    return {
      post_url: url,
      author_handle: handle,
      text_snippet: `X投稿（@${handle || "unknown"}）`,
      like_count: 0,
      relevance_note: "citationから自動抽出（本文は要確認）",
    };
  });
}

/**
 * Grok x_search で候補を取得し、sns_trend_posts に保存する。
 * 新規は pending。既存の approved / rejected は status を維持したままメタ更新。
 */
export async function fetchSnsTrends(): Promise<FetchSnsTrendsResult> {
  const settings = await loadSettings();
  const model = getString(
    settings,
    "sns_trends_model",
    "grok-4-1-fast-reasoning",
  );
  const minLikes = Math.max(
    0,
    Math.floor(getNumber(settings, "sns_trends_min_likes", 100)),
  );
  const maxCount = Math.min(
    30,
    Math.max(1, Math.floor(getNumber(settings, "sns_trends_max_candidates", 15))),
  );
  const lookbackDays = Math.min(
    60,
    Math.max(7, Math.floor(getNumber(settings, "sns_trends_lookback_days", 30))),
  );

  const fromDate = fromDateDaysAgo(lookbackDays);

  const template = await getActivePrompt("sns_trends");
  const prompt = interpolate(template, {
    from_date: fromDate,
    min_likes: String(minLikes),
    max_count: String(maxCount),
  });

  // to_date は付けない（当日境界で取りこぼしやすい）
  let grok = await callGrokXSearch({
    prompt,
    model,
    fromDate,
  });

  let rows: GrokPostRow[] = [];
  try {
    rows = parseRows(grok.text);
  } catch (e) {
    console.error("[sns-trends] JSON parse failed:", grok.text.slice(0, 800));
    // JSON失敗でも citation URL があれば salvage
    rows = [];
    if (grok.citationUrls.length === 0) {
      throw e instanceof Error ? e : new Error(String(e));
    }
  }

  // 空なら citation から salvage → それでも空なら条件を緩めて1回だけ再検索
  if (rows.length === 0 && grok.citationUrls.length > 0) {
    rows = rowsFromCitationUrls(grok.citationUrls);
  }

  if (rows.length === 0) {
    const softMin = Math.max(10, Math.floor(minLikes / 2));
    const retryPrompt =
      interpolate(template, {
        from_date: fromDateDaysAgo(Math.max(lookbackDays, 45)),
        min_likes: String(softMin),
        max_count: String(maxCount),
      }) +
      "\n\n前回は該当0件でした。条件を緩め、建設・解体・産廃・現場・許可・アスベスト・産廃処理のいずれかに少しでも関連する日本語の投稿を優先して再検索し、必ず実在URL付きでJSON配列を返してください。空配列は最終手段です。";

    const retry = await callGrokXSearch({
      prompt: retryPrompt,
      model,
      fromDate: fromDateDaysAgo(Math.max(lookbackDays, 45)),
    });
    grok = {
      text: retry.text,
      model: retry.model,
      inputTokens: grok.inputTokens + retry.inputTokens,
      outputTokens: grok.outputTokens + retry.outputTokens,
      citationUrls: [...new Set([...grok.citationUrls, ...retry.citationUrls])],
    };
    try {
      rows = parseRows(retry.text);
    } catch {
      rows = [];
    }
    if (rows.length === 0 && retry.citationUrls.length > 0) {
      rows = rowsFromCitationUrls(retry.citationUrls);
    }
  }

  const candidates: SnsTrendCandidate[] = [];
  const seen = new Set<string>();
  let skipped = 0;
  for (const row of rows) {
    const c = normalizeCandidate(row, minLikes, true);
    if (!c || seen.has(c.post_url)) {
      skipped += 1;
      continue;
    }
    seen.add(c.post_url);
    candidates.push(c);
    if (candidates.length >= maxCount) break;
  }

  // いいね順（不明は後ろ）
  candidates.sort((a, b) => b.like_count - a.like_count);

  const now = new Date().toISOString();
  let upserted = 0;

  for (const c of candidates) {
    const existing = await restSelect<{ id: string; status: string }>(
      `sns_trend_posts?select=id,status&post_url=eq.${encodeURIComponent(c.post_url)}&limit=1`,
      0,
    );

    const meta = {
      author_handle: c.author_handle,
      author_name: c.author_name,
      text_snippet: c.text_snippet,
      like_count: c.like_count,
      posted_at: c.posted_at,
      relevance_note: c.relevance_note,
      fetched_at: now,
    };

    if (existing && existing.length > 0) {
      await restUpdate(`sns_trend_posts?id=eq.${existing[0].id}`, meta);
    } else {
      await restInsert("sns_trend_posts", {
        ...meta,
        post_url: c.post_url,
        status: "pending",
      });
    }
    upserted += 1;
  }

  return {
    fetched: rows.length,
    upserted,
    skipped,
    model: grok.model,
    inputTokens: grok.inputTokens,
    outputTokens: grok.outputTokens,
    ...(upserted === 0
      ? { preview: grok.text.slice(0, 400) }
      : {}),
  };
}
