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
  eyecatch_url: string | null;
  published_at: string | null;
  updated_at: string | null;
  source_urls: string[] | null;
  category: { slug: string } | null;
}

const ARTICLE_SELECT =
  "slug,title,article_type,excerpt,body,eyecatch_url,published_at,updated_at,source_urls,category:categories(slug)";

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
    imageUrl: r.eyecatch_url ?? undefined,
    publishedAt: (r.published_at ?? "").slice(0, 10),
    updatedAt: r.updated_at ? r.updated_at.slice(0, 10) : undefined,
    readingMinutes: estimateReadingMinutes(body),
    sections: markdownToSections(body),
    sourceUrls: r.source_urls ?? undefined,
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
  const rows = await restSelect<ArticleRow>(
    `articles?select=${ARTICLE_SELECT}&status=eq.published&category.slug=eq.${slug}&order=published_at.desc.nullslast`,
    REVALIDATE,
  );
  if (rows && rows.length > 0) return rows.map(mapArticle);
  // category.slug フィルタが効かない/空のときは全件から絞り込み
  const all = await getAllArticles();
  const filtered = all.filter((a) => a.categorySlug === slug);
  if (filtered.length > 0) return filtered;
  return dummyGetArticlesByCategory(slug);
}

// 関連記事：同じカテゴリーの新着から自分を除いて最大3件（無ければダミー）
export async function getRelatedArticles(article: Article): Promise<Article[]> {
  const sameCat = await getArticlesByCategory(article.categorySlug);
  const related = sameCat.filter((a) => a.slug !== article.slug).slice(0, 3);
  if (related.length > 0) return related;
  return dummyGetRelatedArticles(article);
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
  const rows = await restSelect<NewsRow>(
    `news_items?select=${NEWS_SELECT}&is_visible=eq.true&order=published_at.desc.nullslast,fetched_at.desc&limit=${limit}`,
    REVALIDATE,
  );
  if (rows && rows.length > 0) return rows.map(mapNews);
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
