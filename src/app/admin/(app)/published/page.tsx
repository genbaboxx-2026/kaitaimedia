import { ArticleTable } from "@/components/admin/article-table";
import { fetchAdminArticles } from "@/lib/admin/fetch-articles";

export const dynamic = "force-dynamic";

export default async function AdminPublishedPage() {
  const articles = await fetchAdminArticles({ status: "eq.published" });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="hidden text-xl font-bold text-slate-900 md:block">
        公開記事管理
      </h1>
      <p className="text-sm text-slate-500 md:mt-1">
        <span className="md:hidden">公開中の記事。タップで詳細・公開停止ができます。</span>
        <span className="hidden md:inline">
          サイトに公開中の記事の一覧です。編集・公開停止・削除ができます。タイトルをクリックすると本文冒頭とチェック結果を確認できます。
        </span>
      </p>
      <div className="mt-5">
        <ArticleTable show="published" articles={articles ?? undefined} />
      </div>
    </div>
  );
}
