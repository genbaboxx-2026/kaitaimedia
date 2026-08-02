"use server";

import { revalidatePath } from "next/cache";
import {
  restUpdate,
  restInsert,
  restDelete,
  restSelect,
} from "@/lib/supabase/rest";

export type ActionResult = { ok: boolean; error?: string };

async function categoryIdBySlug(slug: string): Promise<string | null> {
  const rows = await restSelect<{ id: string }>(
    `categories?select=id&slug=eq.${slug}&limit=1`,
    0,
  );
  return rows && rows.length > 0 ? rows[0].id : null;
}

// ---------------- テーマ ----------------
export interface ThemeSavePayload {
  title: string;
  categorySlug: string;
  targetKeyword: string;
  priority: "high" | "medium" | "low";
}

export async function saveThemeAction(
  id: string,
  payload: ThemeSavePayload,
): Promise<ActionResult> {
  try {
    await restUpdate(`themes?id=eq.${id}`, {
      title: payload.title,
      category_id: await categoryIdBySlug(payload.categorySlug),
      target_keyword: payload.targetKeyword,
      priority: payload.priority,
      updated_at: new Date().toISOString(),
    });
    revalidatePath("/admin/generation");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function addThemeAction(payload: {
  title: string;
  categorySlug: string;
  targetKeyword: string;
  articleType: "A" | "B" | "C";
  priority: "high" | "medium" | "low";
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const rows = await restInsert<{ id: string }>("themes", {
      title: payload.title,
      category_id: await categoryIdBySlug(payload.categorySlug),
      target_keyword: payload.targetKeyword,
      article_type: payload.articleType,
      priority: payload.priority,
      status: "pending",
      sort_order: 9999,
    });
    revalidatePath("/admin/generation");
    return { ok: true, id: rows[0]?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteThemeAction(id: string): Promise<ActionResult> {
  try {
    await restDelete(`themes?id=eq.${id}`);
    revalidatePath("/admin/generation");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 並び順を保存（画面の並び順のまま sort_order を 0..n-1 で振り直す）
export async function reorderThemesAction(
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await restUpdate(`themes?id=eq.${orderedIds[i]}`, { sort_order: i });
    }
    revalidatePath("/admin/generation");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------------- ルール（マスタ） ----------------
// 指定種別のルールを丸ごと置き換える（削除→再挿入）。UI一覧の保存に対応。
export async function saveMastersAction(
  groups: { type: string; rows: { label: string; value: string }[] }[],
): Promise<ActionResult> {
  try {
    for (const g of groups) {
      await restDelete(`masters?master_type=eq.${g.type}`);
      const inserts = g.rows
        .filter((r) => r.label.trim() || r.value.trim())
        .map((r, i) => ({
          master_type: g.type,
          label: r.label,
          value: r.value,
          sort_order: i,
          is_active: true,
        }));
      if (inserts.length > 0) await restInsert("masters", inserts);
    }
    revalidatePath("/admin/generation");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 生成ステップのプロンプト本文を保存（有効バージョンを上書き）
export async function savePromptAction(
  step: string,
  content: string,
): Promise<ActionResult> {
  try {
    await restUpdate(`prompts?step=eq.${step}&is_active=is.true`, {
      content,
    });
    revalidatePath("/admin/generation");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 単一設定を保存（settings テーブル・key 指定）
export async function setSettingAction(
  key: string,
  value: string,
): Promise<ActionResult> {
  try {
    await restUpdate(`settings?key=eq.${key}`, {
      value,
      updated_at: new Date().toISOString(),
    });
    revalidatePath("/admin/articles");
    revalidatePath("/admin/generation");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 複数設定をまとめて保存
export async function saveSettingsAction(
  entries: { key: string; value: string }[],
): Promise<ActionResult> {
  try {
    for (const { key, value } of entries) {
      await restUpdate(`settings?key=eq.${key}`, {
        value,
        updated_at: new Date().toISOString(),
      });
    }
    revalidatePath("/admin/generation");
    revalidatePath("/admin/articles");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
