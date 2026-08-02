import "server-only";
import { restSelect } from "@/lib/supabase/rest";
import { loadSettings } from "@/lib/ai/settings";
import { CATEGORIES } from "@/lib/dummy-data";
import {
  DEFAULT_SETTINGS,
  CHECK_ITEMS,
  MASTER_TABS,
  type GenerationSettings,
  type PromptStep,
  type MasterRow,
  type MasterType,
} from "@/lib/admin-config-data";
import type {
  Theme,
  ThemePriority,
  ThemeStatus,
} from "@/lib/admin-data";
import type { ArticleType } from "@/lib/types";

export interface ActivePrompt {
  step: PromptStep;
  content: string;
  variables: string[];
}

// 各生成ステップの「有効な」プロンプトをDBから取得。接続不可なら null。
export async function fetchActivePrompts(): Promise<ActivePrompt[] | null> {
  const rows = await restSelect<{
    step: string;
    content: string;
    variables: string[] | null;
  }>("prompts?select=step,content,variables&is_active=is.true", 0);
  if (!rows) return null;
  return rows.map((r) => ({
    step: r.step as PromptStep,
    content: r.content ?? "",
    variables: r.variables ?? [],
  }));
}

// 生成設定をDBから取得し、画面用の GenerationSettings に組み立てる。
export async function fetchGenerationSettings(): Promise<GenerationSettings> {
  const map = await loadSettings();
  const b = (k: string, d: boolean) => (map[k] !== undefined ? map[k] === "true" : d);
  const n = (k: string, d: number) => (map[k] !== undefined ? Number(map[k]) : d);
  const s = (k: string, d: string) => map[k] ?? d;

  const checks = { ...DEFAULT_SETTINGS.checks };
  for (const item of CHECK_ITEMS) {
    const key = `check_${item.key}_enabled`;
    if (map[key] !== undefined) checks[item.key] = map[key] === "true";
  }

  return {
    ...DEFAULT_SETTINGS,
    autoPublishEnabled: b("auto_publish_enabled", DEFAULT_SETTINGS.autoPublishEnabled),
    generationEnabled: b("generation_enabled", DEFAULT_SETTINGS.generationEnabled),
    generationTime: s("generation_time", DEFAULT_SETTINGS.generationTime),
    articlesPerDay: n("articles_per_day", DEFAULT_SETTINGS.articlesPerDay),
    minCharCount: n("min_char_count", DEFAULT_SETTINGS.minCharCount),
    maxCharCount: n("max_char_count", DEFAULT_SETTINGS.maxCharCount),
    writingStyle: s("writing_style", DEFAULT_SETTINGS.writingStyle) as GenerationSettings["writingStyle"],
    expertiseLevel: s("expertise_level", DEFAULT_SETTINGS.expertiseLevel) as GenerationSettings["expertiseLevel"],
    headingCount: n("heading_count", DEFAULT_SETTINGS.headingCount),
    faqEnabled: b("faq_enabled", DEFAULT_SETTINGS.faqEnabled),
    maxAutoRevisions: n("max_auto_revisions", DEFAULT_SETTINGS.maxAutoRevisions),
    monthlyAiBudgetLimit: n("monthly_ai_budget_limit", DEFAULT_SETTINGS.monthlyAiBudgetLimit),
    aiModel: s("ai_model", DEFAULT_SETTINGS.aiModel),
    checks,
  };
}

// 未生成テーマ（待ち行列）をDBから取得。sort_order 昇順（画面側で優先度順に整列）。
export async function fetchPendingThemes(): Promise<Theme[] | null> {
  const rows = await restSelect<{
    id: string;
    title: string;
    target_keyword: string | null;
    article_type: ArticleType;
    priority: ThemePriority;
    status: ThemeStatus;
    category: { slug: string } | null;
  }>(
    "themes?select=id,title,target_keyword,article_type,priority,status,category:categories(slug)&status=eq.pending&order=sort_order.asc,created_at.asc",
    0,
  );
  if (!rows) return null;
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    categorySlug: r.category?.slug ?? CATEGORIES[0].slug,
    targetKeyword: r.target_keyword ?? "",
    articleType: r.article_type ?? "A",
    priority: r.priority ?? "medium",
    status: r.status ?? "pending",
  }));
}

// ルール（マスタ）を種別ごとにDBから取得。
export async function fetchMasters(): Promise<Record<MasterType, MasterRow[]> | null> {
  const rows = await restSelect<{
    id: string;
    master_type: MasterType;
    label: string | null;
    value: string | null;
  }>(
    "masters?select=id,master_type,label,value&is_active=is.true&order=sort_order.asc,created_at.asc",
    0,
  );
  if (!rows) return null;
  const out = {} as Record<MasterType, MasterRow[]>;
  for (const t of MASTER_TABS) out[t.type] = [];
  for (const r of rows) {
    if (out[r.master_type]) {
      out[r.master_type].push({ id: r.id, label: r.label ?? "", value: r.value ?? "" });
    }
  }
  return out;
}
