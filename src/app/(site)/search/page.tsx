import type { Metadata } from "next";
import Link from "next/link";
import { searchArticles } from "@/lib/site-data";
import { ArticleCard } from "@/components/site/article-card";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { SearchIcon } from "@/components/site/icons";

export const metadata: Metadata = {
  title: "記事検索",
  description: "解体業界の実務に役立つ記事をキーワードで検索します。",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchArticles(query) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs items={[{ label: "ホーム", href: "/" }, { label: "記事検索" }]} />

      <h1 className="mt-4 font-serif text-2xl font-bold text-slate-900">記事検索</h1>

      {/* 検索フォーム（GET） */}
      <form action="/search" method="get" className="mt-5 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-slate-300 px-3 py-2 focus-within:border-navy-600">
          <SearchIcon className="h-4 w-4 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="キーワードで検索（例：見積もり、産廃、法改正）"
            className="w-full text-sm text-slate-800 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-navy-700 px-4 py-2 text-sm font-bold text-white hover:bg-navy-600"
        >
          検索
        </button>
      </form>

      {/* 結果 */}
      {query === "" ? (
        <p className="mt-8 text-sm text-slate-500">
          キーワードを入力して検索してください。
        </p>
      ) : results.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-600">
            「{query}」に一致する記事は見つかりませんでした。
          </p>
          <Link href="/articles" className="mt-3 inline-block text-sm font-semibold text-navy-700 hover:underline">
            記事一覧を見る →
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-slate-500">
            「{query}」の検索結果：{results.length} 件
          </p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
