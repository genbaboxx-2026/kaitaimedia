import type { Metadata } from "next";
import { getAllArticles } from "@/lib/site-data";
import { ArticleCard } from "@/components/site/article-card";
import { Pagination } from "@/components/site/pagination";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const revalidate = 300; // ISR: 5分

export const metadata: Metadata = {
  title: "記事一覧",
  description:
    "解体業界の実務に役立つ記事の一覧。見積もり・原価管理・工期・産廃・法改正・補助金などのテーマを扱います。",
};

const PAGE_SIZE = 6;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const all = await getAllArticles();
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const parsed = Number(page);
  const currentPage =
    Number.isInteger(parsed) && parsed >= 1 && parsed <= totalPages ? parsed : 1;

  const start = (currentPage - 1) * PAGE_SIZE;
  const items = all.slice(start, start + PAGE_SIZE);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs
        items={[{ label: "ホーム", href: "/" }, { label: "記事一覧" }]}
      />

      <h1 className="mt-4 text-2xl font-bold text-slate-900">記事一覧</h1>
      <p className="mt-2 text-sm text-slate-500">
        全{all.length}件（{currentPage}/{totalPages}ページ）
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>

      <Pagination
        basePath="/articles"
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
