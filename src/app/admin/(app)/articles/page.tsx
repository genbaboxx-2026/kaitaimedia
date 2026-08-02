import { ArticleTable } from "@/components/admin/article-table";
import { AutoPublishToggle } from "@/components/admin/auto-publish-toggle";
import { fetchAdminArticles } from "@/lib/admin/fetch-articles";
import { loadSettings } from "@/lib/ai/settings";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const [articles, settings] = await Promise.all([
    fetchAdminArticles(),
    loadSettings(),
  ]);
  const autoPublish = settings["auto_publish_enabled"] === "true";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">記事管理</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            AIが作った記事の確認待ち一覧です。内容を確認して「公開する」で公開、または編集・削除できます。タイトルをクリックすると本文冒頭とチェック結果を確認できます。公開済みの記事は「公開記事管理」で管理します。
          </p>
        </div>
        <div className="shrink-0 text-right">
          <AutoPublishToggle initial={autoPublish} />
          <p className="mt-1 text-xs text-slate-400">
            ON＝品質チェック合格の記事を自動公開／OFF＝すべて確認待ち
          </p>
        </div>
      </div>
      <div className="mt-5">
        <ArticleTable show="review" articles={articles ?? undefined} />
      </div>
    </div>
  );
}
