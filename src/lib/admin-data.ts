import type { ArticleType, ArticleSection } from "@/lib/types";
import { ARTICLES, getCategoryName } from "@/lib/dummy-data";

// 管理画面用のダミーデータ（タスク4でDB接続に置き換える）。

export type AdminStatus = "published" | "draft" | "unpublished" | "failed";

export const STATUS_LABEL: Record<AdminStatus, string> = {
  published: "公開",
  draft: "下書き",
  unpublished: "公開停止",
  failed: "生成失敗",
};

export interface AdminArticle {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  articleType: ArticleType;
  status: AdminStatus;
  charCount: number;
  revisionCount: number;
  quality: { layer1: boolean; layer2: boolean; layer3: boolean };
  failedChecks: string[];
  excerpt: string;
  /** 本文（Markdown） */
  body: string;
  /** AIの初稿（差分表示用） */
  firstDraftBody: string;
  seoTitle: string;
  metaDescription: string;
  tags: string[];
  createdAt: string;
  publishedAt: string | null;
}

// 記事のセクション構造を Markdown 文字列へ変換（ダミー本文の生成用）
function sectionsToMarkdown(sections: ArticleSection[]): string {
  const parts: string[] = [];
  for (const s of sections) {
    parts.push(`## ${s.heading}`);
    for (const b of s.blocks) {
      if (b.type === "paragraph") parts.push(b.text);
      else if (b.type === "heading3") parts.push(`### ${b.text}`);
      else if (b.type === "list") {
        parts.push(
          b.items
            .map((it, i) => (b.ordered ? `${i + 1}. ${it}` : `- ${it}`))
            .join("\n"),
        );
      }
    }
  }
  return parts.join("\n\n");
}

const OVERRIDES: Record<
  string,
  Partial<Pick<AdminArticle, "status" | "revisionCount" | "failedChecks" | "quality">>
> = {
  "demolition-estimate-checklist": { status: "published" },
  "cost-breakdown-template": { status: "published", revisionCount: 1 },
  "site-survey-points": { status: "published" },
  "waste-manifest-flow": {
    status: "draft",
    revisionCount: 1,
    quality: { layer1: true, layer2: true, layer3: true },
    failedChecks: [],
  },
  "labor-planning-basics": { status: "published", revisionCount: 1 },
  "schedule-planning": {
    status: "draft",
    revisionCount: 0,
    quality: { layer1: true, layer2: true, layer3: true },
    failedChecks: [],
  },
  "asbestos-pre-survey": { status: "published" },
  "law-amendment-overview": { status: "published" },
  "subsidy-vacant-house": { status: "unpublished" },
  "neighbor-explanation-flow": { status: "published" },
};

const CHAR_COUNTS: Record<string, number> = {
  "demolition-estimate-checklist": 3480,
  "cost-breakdown-template": 4120,
  "site-survey-points": 3180,
  "waste-manifest-flow": 2760,
  "labor-planning-basics": 3020,
  "schedule-planning": 3240,
  "asbestos-pre-survey": 3360,
  "law-amendment-overview": 2980,
  "subsidy-vacant-house": 3060,
  "neighbor-explanation-flow": 3300,
};

export const ADMIN_ARTICLES: AdminArticle[] = ARTICLES.map((a, i) => {
  const o = OVERRIDES[a.slug] ?? {};
  const status: AdminStatus = o.status ?? "draft";
  const quality = o.quality ?? { layer1: true, layer2: true, layer3: true };
  const body = sectionsToMarkdown(a.sections);
  return {
    id: String(i + 1).padStart(4, "0"),
    slug: a.slug,
    title: a.title,
    categorySlug: a.categorySlug,
    categoryName: getCategoryName(a.categorySlug),
    articleType: a.articleType,
    status,
    charCount: CHAR_COUNTS[a.slug] ?? 3000,
    revisionCount: o.revisionCount ?? 0,
    quality,
    failedChecks: o.failedChecks ?? [],
    excerpt: a.excerpt,
    body,
    firstDraftBody: body,
    seoTitle: a.title,
    metaDescription: a.excerpt,
    tags: [getCategoryName(a.categorySlug)],
    createdAt: a.publishedAt,
    publishedAt: status === "published" ? a.publishedAt : null,
  };
});

export function getAdminArticleById(id: string): AdminArticle | undefined {
  return ADMIN_ARTICLES.find((a) => a.id === id);
}

export function qualityPassedCount(q: AdminArticle["quality"]): number {
  return [q.layer1, q.layer2, q.layer3].filter(Boolean).length;
}

/** 運用上OFFにした旧チェック（一覧バッジに出さない） */
const RETIRED_FAILED_CHECK_RE =
  /^(リンク死活|出典URL|タイトル類似度|本文類似度|類似度|AI判定)/;

export function isActiveFailedCheck(item: string): boolean {
  return !RETIRED_FAILED_CHECK_RE.test(item);
}

export function filterActiveFailedChecks(items: string[]): string[] {
  return items.filter(isActiveFailedCheck);
}

/** 一覧用：合格 / 要確認（3層表記は使わない） */
export function qualityStatusLabel(a: Pick<AdminArticle, "failedChecks" | "quality">): {
  ok: boolean;
  label: string;
} {
  const active = filterActiveFailedChecks(a.failedChecks);
  if (active.length === 0) return { ok: true, label: "合格" };
  return { ok: false, label: "要確認" };
}

// ---- テーマ管理 ----
export type ThemePriority = "high" | "medium" | "low";
export type ThemeStatus = "pending" | "generated" | "excluded";

export const PRIORITY_LABEL: Record<ThemePriority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};
export const THEME_STATUS_LABEL: Record<ThemeStatus, string> = {
  pending: "未生成",
  generated: "生成済",
  excluded: "除外",
};

export interface Theme {
  id: string;
  title: string;
  categorySlug: string;
  targetKeyword: string;
  articleType: ArticleType;
  priority: ThemePriority;
  status: ThemeStatus;
}

export const THEMES: Theme[] = [
  { id: "t01", title: "解体工事の追加費用が発生しやすい場面", categorySlug: "estimate", targetKeyword: "解体 追加費用", articleType: "A", priority: "high", status: "pending" },
  { id: "t02", title: "残置物の分別と処分の進め方", categorySlug: "waste", targetKeyword: "残置物 処分", articleType: "A", priority: "high", status: "pending" },
  { id: "t03", title: "解体の相見積もりで確認すべき点", categorySlug: "estimate", targetKeyword: "解体 相見積もり", articleType: "A", priority: "medium", status: "pending" },
  { id: "t04", title: "建設リサイクル法の届出の流れ", categorySlug: "law", targetKeyword: "建設リサイクル法 届出", articleType: "C", priority: "high", status: "pending" },
  { id: "t05", title: "重機が入れない現場の解体工法", categorySlug: "machinery", targetKeyword: "狭小地 解体", articleType: "A", priority: "medium", status: "pending" },
  { id: "t06", title: "解体現場の安全書類の整え方", categorySlug: "safety", targetKeyword: "解体 安全書類", articleType: "A", priority: "low", status: "pending" },
  { id: "t07", title: "空き家の解体前に確認する権利関係", categorySlug: "subsidy", targetKeyword: "空き家 解体 権利", articleType: "A", priority: "medium", status: "generated" },
  { id: "t08", title: "解体会社のホームページ集客の考え方", categorySlug: "management", targetKeyword: "解体 集客", articleType: "A", priority: "low", status: "excluded" },
];

export const THEME_STOCK_WARNING = 20;

// ダッシュボード用の集計（ダミー）
export interface DashboardStats {
  publishedThisMonth: number;
  draftCount: number;
  failedCount: number;
  passRate: number;
  themeStock: number;
  themeStockWarning: number;
  aiCostUsed: number;
  aiCostLimit: number;
  autoPublish: boolean;
}

export const DASHBOARD_STATS: DashboardStats = {
  publishedThisMonth: ADMIN_ARTICLES.filter((a) => a.status === "published").length,
  draftCount: ADMIN_ARTICLES.filter((a) => a.status === "draft").length,
  failedCount: ADMIN_ARTICLES.filter((a) => a.status === "failed").length,
  passRate: 80,
  themeStock: THEMES.filter((t) => t.status === "pending").length,
  themeStockWarning: THEME_STOCK_WARNING,
  aiCostUsed: 4200,
  aiCostLimit: 0,
  autoPublish: false,
};

export interface RecentLog {
  id: string;
  title: string;
  status: AdminStatus;
  revisionCount: number;
  finishedAt: string;
}

export const RECENT_LOGS: RecentLog[] = ADMIN_ARTICLES.slice(0, 8).map((a) => ({
  id: a.id,
  title: a.title,
  status: a.status,
  revisionCount: a.revisionCount,
  finishedAt: a.createdAt,
}));
