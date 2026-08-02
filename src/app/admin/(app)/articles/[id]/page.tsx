import { notFound } from "next/navigation";
import { getAdminArticleById } from "@/lib/admin-data";
import { fetchAdminArticle } from "@/lib/admin/fetch-articles";
import { ArticleEditor } from "@/components/admin/article-editor";

export const dynamic = "force-dynamic";

export default async function AdminArticleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // まず実DBから取得。無ければダミー（未接続時のフォールバック）。
  const article = (await fetchAdminArticle(id)) ?? getAdminArticleById(id);
  if (!article) notFound();

  return <ArticleEditor article={article} />;
}
