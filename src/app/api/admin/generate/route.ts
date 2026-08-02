import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runGenerationBatch } from "@/lib/generation/run-batch";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
/** 記事1本の生成は長いので上限を伸ばす（Vercel Pro 想定） */
export const maxDuration = 300;

/**
 * 管理画面からの手動記事生成（1本）。
 */
export async function POST() {
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

  try {
    const { results } = await runGenerationBatch({
      count: 1,
      force: true,
      drainDraftsFirst: false,
    });
    const result = results[0] ?? {
      status: "failed" as const,
      message: "結果が空です",
    };

    revalidatePath("/admin/articles");
    revalidatePath("/admin/published");
    revalidatePath("/admin/logs");
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
