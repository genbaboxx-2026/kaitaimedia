import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAdminArticle } from "@/lib/admin/fetch-articles";
import { getCategoryName } from "@/lib/dummy-data";
import { markdownToSections } from "@/lib/markdown-to-sections";
import { ArticleBody } from "@/components/site/article-body";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatJaDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

// 管理画面プレビュー：下書き含む任意ステータスの記事を、公開時と同じ本文レンダリングで確認する。
export default async function AdminArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await fetchAdminArticle(id);
  if (!article) notFound();

  const sections = markdownToSections(article.body);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/articles"
          className="text-sm text-navy-700 hover:underline"
        >
          ← 記事一覧へ
        </Link>
        <div className="flex items-center gap-2">
          <StatusBadge status={article.status} />
          <Link
            href={`/admin/articles/${article.id}`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            編集
          </Link>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
        これは管理画面プレビューです（下書きも表示）。公開サイトに出るのは「公開」状態の記事だけです。
      </div>

      <article className="mt-6">
        <p className="text-xs font-bold text-navy-700">
          {getCategoryName(article.categorySlug)}
        </p>
        <h1 className="mt-2 font-serif text-2xl font-bold leading-relaxed text-slate-900 sm:text-3xl">
          {article.title}
        </h1>
        <p className="mt-3 text-xs text-slate-400">
          {formatJaDateTime(article.createdAt)}・{article.charCount.toLocaleString()} 文字
        </p>

        <div className="mt-6">
          <ArticleBody sections={sections} />
        </div>
      </article>
    </div>
  );
}
