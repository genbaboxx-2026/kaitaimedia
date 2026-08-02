import { ArticleTable } from "@/components/admin/article-table";
import { fetchAdminArticles } from "@/lib/admin/fetch-articles";

export const dynamic = "force-dynamic";

export default async function AdminPublishedPage() {
  const articles = await fetchAdminArticles();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-xl font-bold text-slate-900">公開記事管理</h1>
      <p className="mt-1 text-sm text-slate-500">
        サイトに公開中の記事の一覧です。編集・公開停止・削除ができます。タイトルをクリックすると本文冒頭とチェック結果を確認できます。
      </p>
      <div className="mt-5">
        <ArticleTable show="published" articles={articles ?? undefined} />
      </div>
    </div>
  );
}
