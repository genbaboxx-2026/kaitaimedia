import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runGenerationBatch } from "@/lib/generation/run-batch";
import type { ManualThemeInput } from "@/lib/generation/pipeline";
import type { ArticleType } from "@/lib/types";

export const runtime = "nodejs";
/** 記事1本の生成は長いので上限を伸ばす（Vercel Pro 想定） */
export const maxDuration = 300;

const ARTICLE_TYPES: ArticleType[] = ["A", "B", "C"];
const MODES = ["queue_top", "theme_id", "custom"] as const;

function parseBody(raw: unknown): ManualThemeInput {
  if (!raw || typeof raw !== "object") {
    return { mode: "queue_top" };
  }
  const b = raw as Record<string, unknown>;
  const modeRaw = typeof b.mode === "string" ? b.mode : "queue_top";
  const mode = MODES.includes(modeRaw as (typeof MODES)[number])
    ? (modeRaw as ManualThemeInput["mode"])
    : "queue_top";

  const themeId = typeof b.themeId === "string" ? b.themeId.trim() : "";
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const categorySlug =
    typeof b.categorySlug === "string" ? b.categorySlug.trim() : "";
  const targetKeyword =
    typeof b.targetKeyword === "string" ? b.targetKeyword.trim() : "";
  const note = typeof b.note === "string" ? b.note.trim() : "";
  const articleTypeRaw =
    typeof b.articleType === "string" ? b.articleType : "A";
  const articleType = ARTICLE_TYPES.includes(articleTypeRaw as ArticleType)
    ? (articleTypeRaw as ArticleType)
    : "A";

  if (mode === "theme_id") {
    return { mode, themeId: themeId || undefined };
  }
  if (mode === "custom") {
    return {
      mode,
      title: title || undefined,
      categorySlug: categorySlug || undefined,
      targetKeyword: targetKeyword || undefined,
      articleType,
      note: note || undefined,
    };
  }
  return { mode: "queue_top" };
}

/**
 * 管理画面からの手動記事生成（1本）。
 */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "ANTHROPIC_API_KEY が未設定です" },
      { status: 500 },
    );
  }

  let manualTheme: ManualThemeInput = { mode: "queue_top" };
  try {
    const json: unknown = await req.json();
    manualTheme = parseBody(json);
  } catch {
    manualTheme = { mode: "queue_top" };
  }

  if (manualTheme.mode === "theme_id" && !manualTheme.themeId) {
    return NextResponse.json(
      { ok: false, error: "テーマを選択してください" },
      { status: 400 },
    );
  }
  if (manualTheme.mode === "custom" && !manualTheme.title) {
    return NextResponse.json(
      { ok: false, error: "テーマ・タイトルを入力してください" },
      { status: 400 },
    );
  }

  try {
    const { results } = await runGenerationBatch({
      count: 1,
      force: true,
      drainDraftsFirst: false,
      manualTheme,
    });
    const result = results[0] ?? {
      status: "failed" as const,
      message: "結果が空です",
    };

    revalidatePath("/admin/articles");
    revalidatePath("/admin/published");
    revalidatePath("/admin/logs");
    revalidatePath("/admin/generation");
    revalidatePath("/");

    const ok =
      result.status === "draft" ||
      result.status === "published" ||
      result.status === "skipped";

    return NextResponse.json({
      ok,
      status: result.status,
      message: result.message,
      articleId: result.articleId,
      slug: result.slug,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[admin/generate]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
