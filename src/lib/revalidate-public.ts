import { revalidatePath } from "next/cache";

/**
 * 公開サイトの ISR / Data Cache を破棄する（Next.js プロセス内専用）。
 * GitHub Actions 等の外部バッチからは request-public-revalidate を使う。
 */
export function revalidatePublicSite(slugs: string[] = []): void {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/sitemap.xml");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/articles/${slug}`);
  }
}

/** 管理画面＋公開面の両方を破棄 */
export function revalidateAfterArticleChange(
  slugs: string[] = [],
  articleIds: string[] = [],
): void {
  revalidatePublicSite(slugs);
  revalidatePath("/admin/articles");
  revalidatePath("/admin/published");
  revalidatePath("/admin/logs");
  revalidatePath("/admin/generation");
  for (const id of articleIds) {
    if (id) revalidatePath(`/admin/articles/${id}`);
  }
}
