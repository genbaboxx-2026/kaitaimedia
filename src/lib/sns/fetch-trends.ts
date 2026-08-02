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
}

interface GrokPostRow {
  post_url?: unknown;
  author_handle?: unknown;
  author_name?: unknown;
  text_snippet?: unknown;
  like_count?: unknown;
  posted_at?: unknown;
  relevance_note?: unknown;
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

function normalizeCandidate(
  row: GrokPostRow,
  minLikes: number,
): SnsTrendCandidate | null {
  if (typeof row.post_url !== "string" || !isXPostUrl(row.post_url.trim())) {
    return null;
  }
  const snippet =
    typeof row.text_snippet === "string" ? row.text_snippet.trim() : "";
  if (!snippet) return null;

  const likeRaw =
    typeof row.like_count === "number"
      ? row.like_count
      : Number(row.like_count);
  const likeCount = Number.isFinite(likeRaw) ? Math.max(0, Math.floor(likeRaw)) : 0;
  if (likeCount < minLikes) return null;

  let postedAt: string | null = null;
  if (typeof row.posted_at === "string" && row.posted_at.trim()) {
    const d = new Date(row.posted_at);
    if (!Number.isNaN(d.getTime())) postedAt = d.toISOString();
  }

  const handle =
    typeof row.author_handle === "string"
      ? normalizeHandle(row.author_handle)
      : "";

  return {
    post_url: row.post_url
      .trim()
      .replace("https://twitter.com/", "https://x.com/"),
    author_handle: handle,
    author_name:
      typeof row.author_name === "string"
        ? row.author_name.trim().slice(0, 120)
        : null,
    text_snippet: snippet.slice(0, 400),
    like_count: likeCount,
    posted_at: postedAt,
    relevance_note:
      typeof row.relevance_note === "string"
        ? row.relevance_note.trim().slice(0, 200)
        : null,
  };
}

function fromDateDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function toDateToday(): string {
  return new Date().toISOString().slice(0, 10);
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

  const fromDate = fromDateDaysAgo(7);
  const toDate = toDateToday();

  const template = await getActivePrompt("sns_trends");
  const prompt = interpolate(template, {
    from_date: fromDate,
    min_likes: String(minLikes),
    max_count: String(maxCount),
  });

  const grok = await callGrokXSearch({
    prompt,
    model,
    fromDate,
    toDate,
  });

  let rows: GrokPostRow[];
  try {
    const parsed = parseGrokJson<unknown>(grok.text);
    rows = Array.isArray(parsed)
      ? (parsed as GrokPostRow[])
      : Array.isArray((parsed as { posts?: unknown }).posts)
        ? (parsed as { posts: GrokPostRow[] }).posts
        : [];
  } catch (e) {
    console.error("[sns-trends] JSON parse failed:", grok.text.slice(0, 800));
    throw e instanceof Error ? e : new Error(String(e));
  }

  const candidates: SnsTrendCandidate[] = [];
  const seen = new Set<string>();
  let skipped = 0;
  for (const row of rows) {
    const c = normalizeCandidate(row, minLikes);
    if (!c || seen.has(c.post_url)) {
      skipped += 1;
      continue;
    }
    seen.add(c.post_url);
    candidates.push(c);
    if (candidates.length >= maxCount) break;
  }

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
  };
}
