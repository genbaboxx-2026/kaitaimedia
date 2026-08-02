import type {
  Article,
  ArticleType,
  Category,
  NewsItem,
  SnsTrendPost,
  SnsTrendStatus,
} from "@/lib/types";
import {
  ALL_ARTICLES_NEWEST,
  ARTICLES,
  CATEGORIES,
  DUMMY_NEWS,
  getArticleBySlug as dummyGetArticleBySlug,
  getArticlesByCategory as dummyGetArticlesByCategory,
  getRelatedArticles as dummyGetRelatedArticles,
  sortByNewest,
} from "@/lib/dummy-data";
import { restSelect } from "@/lib/supabase/rest";
import { markdownToSections } from "@/lib/markdown-to-sections";
import { dedupeNewsByStory } from "@/lib/news/title-key";

// 公開サイトのデータ層。
// Supabase（service_role, REST）から公開記事を取得し、未接続・空・失敗時はダミーへフォールバックする。

export const REVALIDATE = 300; // ISR: 5分

interface CategoryRow {
  slug: string;
  name: string;
  description: string | null;
}

// ---- カテゴリー（DB → フォールバック） ----
export async function getCategories(): Promise<Category[]> {
  const rows = await restSelect<CategoryRow>(
    "categories?select=slug,name,description&is_active=eq.true&order=sort_order.asc",
    REVALIDATE,
  );
  if (rows && rows.length > 0) {
    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      description: r.description ?? "",
    }));
  }
  return CATEGORIES;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug);
}

// ---- 記事（DB → フォールバック） ----
interface ArticleRow {
  slug: string;
  title: string;
  article_type: ArticleType | null;
  excerpt: string | null;
  body: string | null;
  seo_title: string | null;
  meta_description: string | null;
  eyecatch_url: string | null;
  published_at: string | null;
  updated_at: string | null;
  source_urls: string[] | null;
  tags: string[] | null;
  related_article_ids: string[] | null;
  category: { slug: string } | null;
}

const ARTICLE_SELECT =
  "slug,title,article_type,excerpt,body,seo_title,meta_description,eyecatch_url,published_at,updated_at,source_urls,tags,related_article_ids,category:categories(slug)";

function estimateReadingMinutes(body: string): number {
  const chars = body.replace(/\s/g, "").length;
  return Math.max(1, Math.round(chars / 600));
}

function mapArticle(r: ArticleRow): Article {
  const body = r.body ?? "";
  return {
    slug: r.slug,
    title: r.title,
    categorySlug: r.category?.slug ?? "news",
    articleType: r.article_type ?? "A",
    excerpt: r.excerpt ?? "",
    seoTitle: r.seo_title?.trim() || undefined,
    metaDescription: r.meta_description?.trim() || undefined,
    imageUrl: r.eyecatch_url ?? undefined,
    publishedAt: (r.published_at ?? "").slice(0, 10),
    updatedAt: r.updated_at ? r.updated_at.slice(0, 10) : undefined,
    readingMinutes: estimateReadingMinutes(body),
    sections: markdownToSections(body),
    sourceUrls: r.source_urls ?? undefined,
    tags: r.tags && r.tags.length > 0 ? r.tags : undefined,
    relatedSlugs: [],
  };
}

// 公開記事の共通取得（status=published のみ）
async function fetchPublished(
  extraQuery: string,
): Promise<Article[] | null> {
  const rows = await restSelect<ArticleRow>(
    `articles?select=${ARTICLE_SELECT}&status=eq.published&${extraQuery}`,
    REVALIDATE,
  );
  if (!rows) return null;
  return rows.map(mapArticle);
}

// 新着（公開日の新しい順）
export async function getLatestArticles(limit?: number): Promise<Article[]> {
  const rows = await fetchPublished(
    `order=published_at.desc.nullslast,created_at.desc${limit ? `&limit=${limit}` : ""}`,
  );
  if (rows && rows.length > 0) return rows;
  const list = ALL_ARTICLES_NEWEST;
  return limit ? list.slice(0, limit) : list;
}

export async function getAllArticles(): Promise<Article[]> {
  const rows = await fetchPublished("order=published_at.desc.nullslast,created_at.desc");
  if (rows && rows.length > 0) return rows;
  return ALL_ARTICLES_NEWEST;
}

// PICK UP（制度・法改正＝記事型C を新着順で）
export async function getPickupArticles(limit = 4): Promise<Article[]> {
  const rows = await fetchPublished(
    `article_type=eq.C&order=published_at.desc.nullslast&limit=${limit}`,
  );
  if (rows) return rows;
  return ALL_ARTICLES_NEWEST.filter((a) => a.articleType === "C").slice(0, limit);
}

// RANKING（閲覧数の多い順。view_count 列が未追加の環境では新着順にフォールバック）
export async function getRankingArticles(limit = 5): Promise<Article[]> {
  const rows = await fetchPublished(
    `order=view_count.desc.nullslast,published_at.desc.nullslast&limit=${limit}`,
  );
  if (rows && rows.length > 0) return rows;
  // view_count 列が無い/未接続 → 新着で代替
  return getLatestArticles(limit);
}

export async function getArticleBySlug(
  slug: string,
): Promise<Article | undefined> {
  const rows = await fetchPublished(`slug=eq.${slug}&limit=1`);
  if (rows && rows.length > 0) return rows[0];
  return dummyGetArticleBySlug(slug);
}

export async function getArticlesByCategory(slug: string): Promise<Article[]> {
  // PostgREST の category.slug=eq.* は埋め込みフィルタとして期待どおり動かず
  // 全件が返ることがあるため、必ず category_id で絞る
  const cats = await restSelect<{ id: string }>(
    `categories?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    REVALIDATE,
  );
  const categoryId = cats?.[0]?.id;
  if (categoryId) {
    const rows = await restSelect<ArticleRow>(
      `articles?select=${ARTICLE_SELECT}&status=eq.published&category_id=eq.${encodeURIComponent(categoryId)}&order=published_at.desc.nullslast`,
      REVALIDATE,
    );
    if (rows) {
      return rows
        .map(mapArticle)
        .filter((a) => a.categorySlug === slug);
    }
  }

  // DB未接続時のみダミー。空カテゴリは空配列のまま（他カテゴリ記事を混ぜない）
  if (cats === null) return dummyGetArticlesByCategory(slug);
  return [];
}

// 関連記事：手動指定 → 同カテゴリ → 新着で最大6件まで埋める（内部リンク強化）
export async function getRelatedArticles(
  article: Article,
  limit = 6,
): Promise<Article[]> {
  const seen = new Set<string>([article.slug]);
  const out: Article[] = [];

  const push = (a: Article | undefined) => {
    if (!a || seen.has(a.slug)) return;
    seen.add(a.slug);
    out.push(a);
  };

  // 手動指定（related_article_ids → slug 解決）
  const idRows = await restSelect<{ id: string; related_article_ids: string[] | null }>(
    `articles?select=id,related_article_ids&slug=eq.${encodeURIComponent(article.slug)}&status=eq.published&limit=1`,
    REVALIDATE,
  );
  const relatedIds = idRows?.[0]?.related_article_ids ?? [];
  if (relatedIds.length > 0) {
    const idFilter = relatedIds
      .slice(0, limit)
      .map((id) => encodeURIComponent(id))
      .join(",");
    const manual = await restSelect<ArticleRow>(
      `articles?select=${ARTICLE_SELECT}&status=eq.published&id=in.(${idFilter})`,
      REVALIDATE,
    );
    for (const r of manual ?? []) push(mapArticle(r));
  }

  if (out.length < limit) {
    const sameCat = await getArticlesByCategory(article.categorySlug);
    for (const a of sameCat) {
      if (out.length >= limit) break;
      push(a);
    }
  }

  if (out.length < limit) {
    const latest = await getLatestArticles(limit * 2);
    for (const a of latest) {
      if (out.length >= limit) break;
      push(a);
    }
  }

  if (out.length > 0) return out.slice(0, limit);
  return dummyGetRelatedArticles(article).slice(0, limit);
}

/** sitemap 用：公開ニュースの id と最終更新相当日時 */
export async function getNewsSitemapEntries(
  limit = 200,
): Promise<{ id: string; lastModified: string }[]> {
  const rows = await restSelect<{
    id: string;
    published_at: string | null;
    fetched_at: string;
  }>(
    `news_items?select=id,published_at,fetched_at&is_visible=eq.true&order=published_at.desc.nullslast,fetched_at.desc&limit=${limit}`,
    REVALIDATE,
  );
  if (!rows) return [];
  return rows.map((r) => ({
    id: r.id,
    lastModified: r.published_at ?? r.fetched_at,
  }));
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const rows = await restSelect<{ slug: string }>(
    "articles?select=slug&status=eq.published",
    REVALIDATE,
  );
  if (rows && rows.length > 0) return rows.map((r) => r.slug);
  return ARTICLES.map((a) => a.slug);
}

// ---- 検索（現状はデータ層上で照合） ----
function searchableText(a: Article): string {
  const body = a.sections
    .map(
      (s) =>
        s.heading +
        s.blocks
          .map((b) =>
            "text" in b ? b.text : "items" in b ? b.items.join(" ") : "",
          )
          .join(" "),
    )
    .join(" ");
  return `${a.title} ${a.excerpt} ${body}`.toLowerCase();
}

export async function searchArticles(query: string): Promise<Article[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = await getAllArticles();
  return sortByNewest(all.filter((a) => searchableText(a).includes(q)));
}

// ---- ニュース（外部RSS集約） ----
interface NewsRow {
  id: string;
  title: string;
  url: string;
  source_id: string;
  source_name: string;
  published_at: string | null;
  fetched_at: string;
  image_url: string | null;
  summary: string | null;
  editorial_body: string | null;
}

function mapNews(r: NewsRow): NewsItem {
  return {
    id: r.id,
    title: r.title,
    url: r.url,
    sourceId: r.source_id,
    sourceName: r.source_name,
    publishedAt: r.published_at ?? r.fetched_at,
    imageUrl: r.image_url ?? undefined,
    summary: r.summary ?? undefined,
    editorialBody: r.editorial_body ?? undefined,
  };
}

const NEWS_SELECT =
  "id,title,url,source_id,source_name,published_at,fetched_at,image_url,summary,editorial_body";

export async function getLatestNews(limit = 30): Promise<NewsItem[]> {
  // 同話題の別メディアが混ざるので多めに取ってから見出し類似で間引く
  const fetchLimit = Math.min(120, Math.max(limit * 4, limit));
  const rows = await restSelect<NewsRow>(
    `news_items?select=${NEWS_SELECT}&is_visible=eq.true&order=published_at.desc.nullslast,fetched_at.desc&limit=${fetchLimit}`,
    REVALIDATE,
  );
  if (rows && rows.length > 0) {
    return dedupeNewsByStory(rows.map(mapNews)).slice(0, limit);
  }
  return DUMMY_NEWS.slice(0, limit);
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  if (!id) return null;
  const rows = await restSelect<NewsRow>(
    `news_items?select=${NEWS_SELECT}&id=eq.${encodeURIComponent(id)}&is_visible=eq.true&limit=1`,
    REVALIDATE,
  );
  if (rows && rows.length > 0) return mapNews(rows[0]);
  return DUMMY_NEWS.find((n) => n.id === id) ?? null;
}

// ---- SNSトレンド（採用済みのみ公開） ----
interface SnsTrendRow {
  id: string;
  post_url: string;
  author_handle: string;
  author_name: string | null;
  text_snippet: string;
  like_count: number;
  posted_at: string | null;
  relevance_note: string | null;
  status: SnsTrendStatus;
  fetched_at: string;
}

const SNS_TREND_SELECT =
  "id,post_url,author_handle,author_name,text_snippet,like_count,posted_at,relevance_note,status,fetched_at";

function mapSnsTrend(r: SnsTrendRow): SnsTrendPost {
  return {
    id: r.id,
    postUrl: r.post_url,
    authorHandle: r.author_handle,
    authorName: r.author_name ?? undefined,
    textSnippet: r.text_snippet,
    likeCount: r.like_count,
    postedAt: r.posted_at ?? undefined,
    relevanceNote: r.relevance_note ?? undefined,
    status: r.status,
    fetchedAt: r.fetched_at,
  };
}

/** 公開サイト用：採用済みをいいね順 */
export async function getApprovedSnsTrends(limit = 8): Promise<SnsTrendPost[]> {
  const rows = await restSelect<SnsTrendRow>(
    `sns_trend_posts?select=${SNS_TREND_SELECT}&status=eq.approved&order=like_count.desc.nullslast,fetched_at.desc&limit=${limit}`,
    REVALIDATE,
  );
  if (rows && rows.length > 0) return rows.map(mapSnsTrend);
  return [];
}
