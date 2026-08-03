import { restUpsert } from "@/lib/supabase/rest";
import { passesNewsFilter } from "@/lib/news/filter";
import {
  generateMissingEditorials,
  type GenerateEditorialResult,
} from "@/lib/news/generate-editorial";
import { fillMissingImages } from "@/lib/news/og-image";
import { fetchFeedXml, parseFeedXml } from "@/lib/news/parse-rss";
import {
  getEnabledNewsSources,
  isGoogleNewsEnabled,
  type NewsSource,
} from "@/lib/news/sources";

export interface NewsItemRow {
  title: string;
  url: string;
  source_id: string;
  source_name: string;
  published_at: string | null;
  fetched_at: string;
  is_visible: boolean;
  image_url: string | null;
  summary: string | null;
}

export interface FetchNewsResult {
  sourceId: string;
  fetched: number;
  accepted: number;
  withImage: number;
  upserted: number;
  error?: string;
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString();
  } catch {
    return url.trim();
  }
}

function toRows(
  draft: Array<{
    title: string;
    url: string;
    source_id: string;
    source_name: string;
    published_at: string | null;
    fetched_at: string;
    is_visible: boolean;
    imageUrl: string | null;
    summary: string | null;
  }>,
): NewsItemRow[] {
  return draft.map((r) => ({
    title: r.title,
    url: r.url,
    source_id: r.source_id,
    source_name: r.source_name,
    published_at: r.published_at,
    fetched_at: r.fetched_at,
    is_visible: r.is_visible,
    image_url: r.imageUrl ?? null,
    summary: r.summary ?? null,
  }));
}

/**
 * PostgREST は同一リクエスト内のオブジェクトキー集合が一致しないと
 * PGRST102 ("All object keys must match") で拒否する。
 * image_url / summary を任意送信するため、キー集合ごとにバッチ分割する。
 */
function groupByObjectKeys(
  rows: Record<string, unknown>[],
): Record<string, unknown>[][] {
  const groups = new Map<string, Record<string, unknown>[]>();
  for (const row of rows) {
    const signature = Object.keys(row).sort().join("\0");
    const list = groups.get(signature);
    if (list) list.push(row);
    else groups.set(signature, [row]);
  }
  return [...groups.values()];
}

async function collectFromSource(source: NewsSource): Promise<{
  rows: NewsItemRow[];
  fetched: number;
}> {
  console.log(`[${source.id}] RSS取得中...`);
  const xml = await fetchFeedXml(source.feedUrl, source.encoding ?? "utf-8");
  const items = parseFeedXml(xml);
  const now = new Date().toISOString();
  const draft: Array<{
    title: string;
    url: string;
    source_id: string;
    source_name: string;
    published_at: string | null;
    fetched_at: string;
    is_visible: boolean;
    imageUrl: string | null;
    summary: string | null;
  }> = [];

  for (const item of items) {
    const title = item.title.replace(/\s+/g, " ").trim();
    const url = normalizeUrl(item.url);
    if (!title || !url) continue;

    if (
      !passesNewsFilter(title, {
        requireIncludeKeyword: source.requireIncludeKeyword,
      })
    ) {
      continue;
    }

    const sourceName = item.sourceHint
      ? `${source.name} / ${item.sourceHint}`
      : source.name;

    draft.push({
      title,
      url,
      source_id: source.id,
      source_name: sourceName,
      published_at: item.publishedAt ? item.publishedAt.toISOString() : null,
      fetched_at: now,
      is_visible: true,
      imageUrl: item.imageUrl ?? null,
      summary: item.summary ?? null,
    });
  }

  console.log(`[${source.id}] フィルタ後 ${draft.length}件`);

  // Googleニュースは resolveNewsImageUrl 内で出版社URLへ展開してから OGP 取得する
  const filled = await fillMissingImages(draft, {
    concurrency: source.id === "google_news" ? 2 : 5,
    preferJina: false,
    onProgress: (done, total, ok) => {
      console.log(`[${source.id}] 画像 ${done}/${total}（取得成功 ${ok}）`);
    },
  });

  return { rows: toRows(filled), fetched: items.length };
}

export interface FetchAndStoreNewsResult {
  sources: FetchNewsResult[];
  editorial: GenerateEditorialResult;
}

/** 全ソースを取得して news_items に upsert し、未生成の自社解説を埋める */
export async function fetchAndStoreNews(): Promise<FetchAndStoreNewsResult> {
  const sources = getEnabledNewsSources();
  console.log(
    `取得ソース: ${sources.map((s) => s.id).join(", ")}` +
      (isGoogleNewsEnabled()
        ? ""
        : "（Googleニュースは NEWS_ENABLE_GOOGLE_NEWS=false のため無効）"),
  );

  const results: FetchNewsResult[] = [];

  for (const source of sources) {
    let fetched = 0;
    let accepted = 0;
    let withImage = 0;
    try {
      const collected = await collectFromSource(source);
      fetched = collected.fetched;
      accepted = collected.rows.length;
      withImage = collected.rows.filter((r) => r.image_url).length;
      let upserted = 0;
      if (collected.rows.length > 0) {
        console.log(`[${source.id}] DB保存中...`);
        // null の任意カラムは送らない（既存値を消さない）
        const payload = collected.rows.map((r) => {
          const base: Record<string, unknown> = {
            title: r.title,
            url: r.url,
            source_id: r.source_id,
            source_name: r.source_name,
            published_at: r.published_at,
            fetched_at: r.fetched_at,
            is_visible: r.is_visible,
          };
          if (r.image_url) base.image_url = r.image_url;
          if (r.summary) base.summary = r.summary;
          return base;
        });
        for (const batch of groupByObjectKeys(payload)) {
          const saved = await restUpsert<NewsItemRow>(
            "news_items",
            batch,
            "url",
          );
          upserted += saved.length;
        }
      }
      results.push({
        sourceId: source.id,
        fetched,
        accepted,
        withImage,
        upserted,
      });
      console.log(
        `[${source.id}] 完了 fetched=${fetched} accepted=${accepted} withImage=${withImage} upserted=${upserted}`,
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`[${source.id}] ${message}`);
      results.push({
        sourceId: source.id,
        fetched,
        accepted,
        withImage,
        upserted: 0,
        error: message,
      });
    }
  }

  let editorial: GenerateEditorialResult;
  try {
    editorial = await generateMissingEditorials();
    console.log(
      `[editorial] 完了 AI=${editorial.generated} reuse=${editorial.reused ?? 0}` +
        (editorial.skipped ? ` skipped=${editorial.skipReason ?? ""}` : "") +
        (editorial.errors.length > 0
          ? ` errors=${editorial.errors.length}`
          : ""),
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`[editorial] 一括生成で例外: ${message}`);
    editorial = {
      attempted: 0,
      generated: 0,
      reused: 0,
      skipped: true,
      skipReason: message,
      errors: [message],
    };
  }

  return { sources: results, editorial };
}
