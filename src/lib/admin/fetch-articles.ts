import "server-only";
import { restSelect } from "@/lib/supabase/rest";
import {
  filterActiveFailedChecks,
  type AdminArticle,
  type AdminStatus,
} from "@/lib/admin-data";
import type { ArticleType } from "@/lib/types";

interface DbArticle {
  id: string;
  slug: string;
  title: string;
  status: string;
  article_type: ArticleType;
  body?: string | null;
  excerpt: string | null;
  seo_title: string | null;
  meta_description: string | null;
  char_count: number | null;
  view_count: number | null;
  revision_count: number | null;
  quality_layers_passed: number | null;
  quality_layers_total: number | null;
  failed_check_items: string[] | null;
  created_at: string;
  published_at: string | null;
  category: { slug: string; name: string } | null;
}

const STATUSES: AdminStatus[] = ["published", "draft", "unpublished", "failed"];

/** 一覧用（本文なし。一覧で body を取ると遷移が遅くなる） */
const LIST_SELECT =
  "id,slug,title,status,article_type,excerpt,seo_title,meta_description," +
  "char_count,view_count,revision_count,quality_layers_passed,quality_layers_total," +
  "failed_check_items,created_at,published_at,category:categories(slug,name)";

/** 編集画面用（本文あり） */
const DETAIL_SELECT = `${LIST_SELECT},body`;

function toAdmin(r: DbArticle): AdminArticle {
  const failedChecks = filterActiveFailedChecks(r.failed_check_items ?? []);
  const allPass = failedChecks.length === 0;
  const status = (STATUSES.includes(r.status as AdminStatus)
    ? r.status
    : "draft") as AdminStatus;
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    categorySlug: r.category?.slug ?? "news",
    categoryName: r.category?.name ?? "未分類",
    articleType: r.article_type ?? "A",
    status,
    charCount: r.char_count ?? 0,
    viewCount: r.view_count ?? 0,
    revisionCount: r.revision_count ?? 0,
    // 3層UIは廃止。互換のため同値で埋める
    quality: { layer1: allPass, layer2: allPass, layer3: allPass },
    failedChecks,
    excerpt: r.excerpt ?? "",
    body: r.body ?? "",
    firstDraftBody: r.body ?? "",
    seoTitle: r.seo_title ?? "",
    metaDescription: r.meta_description ?? "",
    tags: [],
    createdAt: r.created_at ?? "",
    publishedAt: r.published_at ? r.published_at.slice(0, 10) : null,
  };
}

export type FetchAdminArticlesOpts = {
  /** PostgREST の status フィルタ（例: "eq.published" / "neq.published"） */
  status?: string;
};

// 記事一覧をDBから取得。接続不可は null（呼び出し側でダミーへ）。
export async function fetchAdminArticles(
  opts: FetchAdminArticlesOpts = {},
): Promise<AdminArticle[] | null> {
  const statusFilter = opts.status
    ? `&status=${opts.status}`
    : "";
  const rows = await restSelect<DbArticle>(
    `articles?select=${LIST_SELECT}${statusFilter}&order=created_at.desc`,
    0,
  );
  if (!rows) return null;
  return rows.map(toAdmin);
}

// 単一記事をIDで取得（編集画面用）。
export async function fetchAdminArticle(id: string): Promise<AdminArticle | null> {
  const rows = await restSelect<DbArticle>(
    `articles?select=${DETAIL_SELECT}&id=eq.${encodeURIComponent(id)}&limit=1`,
    0,
  );
  if (!rows || rows.length === 0) return null;
  return toAdmin(rows[0]);
}
