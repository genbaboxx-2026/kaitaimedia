"use server";

import { restSelect, restUpdate, restDelete } from "@/lib/supabase/rest";
import { revalidateAfterArticleChange } from "@/lib/revalidate-public";

export type ActionResult = { ok: boolean; error?: string };

export interface ArticleUpdatePayload {
  title: string;
  slug: string;
  categorySlug: string;
  body: string;
  excerpt: string;
  seoTitle: string;
  metaDescription: string;
  status: "published" | "draft" | "unpublished" | "failed";
  publishAt: string | null; // datetime-local 文字列 or null
  tags: string[];
}

// 記事編集の保存
export async function updateArticleAction(
  id: string,
  payload: ArticleUpdatePayload,
): Promise<ActionResult> {
  try {
    // カテゴリー slug → id
    const cats = await restSelect<{ id: string }>(
      `categories?select=id&slug=eq.${payload.categorySlug}&limit=1`,
      0,
    );
    const categoryId = cats && cats.length > 0 ? cats[0].id : null;

    const publishedAt =
      payload.status === "published" && payload.publishAt
        ? new Date(payload.publishAt).toISOString()
        : payload.status === "published"
          ? new Date().toISOString()
          : null;

    await restUpdate(`articles?id=eq.${id}`, {
      title: payload.title,
      slug: payload.slug,
      category_id: categoryId,
      body: payload.body,
      excerpt: payload.excerpt,
      seo_title: payload.seoTitle,
      meta_description: payload.metaDescription,
      status: payload.status,
      tags: payload.tags,
      char_count: payload.body.replace(/\s/g, "").length,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    });
    revalidateAfterArticleChange([payload.slug], [id]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 記事を公開する
export async function publishArticleAction(id: string): Promise<ActionResult> {
  try {
    const rows = await restSelect<{ slug: string }>(
      `articles?select=slug&id=eq.${encodeURIComponent(id)}&limit=1`,
      0,
    );
    const slug = rows?.[0]?.slug ?? "";
    await restUpdate(`articles?id=eq.${id}`, {
      status: "published",
      published_at: new Date().toISOString(),
    });
    revalidateAfterArticleChange(slug ? [slug] : [], [id]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 記事を公開停止する（下書きに戻す）
export async function unpublishArticleAction(id: string): Promise<ActionResult> {
  try {
    const rows = await restSelect<{ slug: string }>(
      `articles?select=slug&id=eq.${encodeURIComponent(id)}&limit=1`,
      0,
    );
    const slug = rows?.[0]?.slug ?? "";
    await restUpdate(`articles?id=eq.${id}`, {
      status: "unpublished",
      published_at: null,
    });
    revalidateAfterArticleChange(slug ? [slug] : [], [id]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 記事を削除する
export async function deleteArticleAction(id: string): Promise<ActionResult> {
  try {
    const rows = await restSelect<{ slug: string }>(
      `articles?select=slug&id=eq.${encodeURIComponent(id)}&limit=1`,
      0,
    );
    const slug = rows?.[0]?.slug ?? "";
    await restDelete(`articles?id=eq.${id}`);
    revalidateAfterArticleChange(slug ? [slug] : [], [id]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
