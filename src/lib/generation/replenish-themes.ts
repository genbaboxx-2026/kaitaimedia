import { restInsert, restSelect } from "@/lib/supabase/rest";
import { suggestThemes } from "@/lib/generation/theme-suggest";

// 未生成テーマの在庫を target 件まで自動補充する（標準運用：常に約20件を保つ）。
// 日次バッチの先頭で呼ぶ。service key・AIキー未設定時は 0 を返してスキップ。
export async function replenishThemes(target = 20): Promise<number> {
  const pending = await restSelect<{ id: string }>(
    "themes?select=id&status=eq.pending",
    0,
  );
  if (pending === null) return 0; // DB未接続
  const have = pending.length;
  if (have >= target) return 0;

  const need = target - have;
  const { themes } = await suggestThemes(need);

  const cats = await restSelect<{ id: string; slug: string }>(
    "categories?select=id,slug",
    0,
  );
  const bySlug = new Map((cats ?? []).map((c) => [c.slug, c.id]));

  const rows = themes.map((t) => ({
    title: t.title,
    category_id: bySlug.get(t.categorySlug) ?? null,
    target_keyword: t.targetKeyword,
    article_type: t.articleType,
    priority: t.priority,
    status: "pending",
  }));
  if (rows.length === 0) return 0;

  await restInsert("themes", rows);
  return rows.length;
}
