import { ArticleTable } from "@/components/admin/article-table";
import { AutoPublishToggle } from "@/components/admin/auto-publish-toggle";
import { fetchAdminArticles } from "@/lib/admin/fetch-articles";
import { loadSettings } from "@/lib/ai/settings";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const [articles, settings] = await Promise.all([
    // 確認待ち画面：公開済みは別タブなので除外して軽くする
    fetchAdminArticles({ status: "neq.published" }),
    loadSettings(),
  ]);
  const autoPublish = settings["auto_publish_enabled"] === "true";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="hidden text-xl font-bold text-slate-900 md:block">
            記事管理
          </h1>
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
