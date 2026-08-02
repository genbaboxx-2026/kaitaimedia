import Link from "next/link";
import { getCategoryName } from "@/lib/dummy-data";
import {
  getCategories,
  getLatestArticles,
  getPickupArticles,
  getRankingArticles,
} from "@/lib/site-data";
import { getCategoryMeta } from "@/lib/categories-meta";
import { Eyecatch } from "@/components/site/eyecatch";
import { ArticleListItem } from "@/components/site/article-list-item";
import { FeedSectionHeader } from "@/components/site/feed-section-header";
import { ArrowIcon, CategoryIcon } from "@/components/site/icons";
import { formatJaDate } from "@/lib/format";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 border-b-2 border-navy-700 pb-2 font-serif text-lg font-bold tracking-tight text-slate-900">
      {children}
    </h2>
  );
}

export const revalidate = 300; // ISR: 5分

export default async function HomePage() {
  const [articles, categories, pickup, ranking] = await Promise.all([
    getLatestArticles(),
    getCategories(),
    getPickupArticles(4),
    getRankingArticles(5),
  ]);
  const [lead, ...rest] = articles;
  const secondary = rest.slice(0, 6);
  const feed = articles.slice(0, 12);

  return (
    <>
      {/* ========== モバイル：NewsPicks風フィード ========== */}
      <div className="md:hidden">
        <FeedSectionHeader />

        <div className="-mx-0">
          {feed.map((a) => (
            <ArticleListItem key={a.slug} article={a} />
          ))}
        </div>

        <div className="px-4 py-5">
          <Link
            href="/articles"
            className="flex h-11 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-ink active:bg-slate-50"
          >
            記事一覧をすべて見る
          </Link>
        </div>

        {/* ランキング（モバイル簡易） */}
        <section className="border-t border-slate-100 px-4 py-5">
          <h2 className="text-[17px] font-black text-ink">注目ランキング</h2>
          <ol className="mt-3">
            {ranking.map((a, i) => (
              <li key={a.slug} className="border-b border-slate-100">
                <Link href={`/articles/${a.slug}`} className="flex gap-3 py-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-sm font-bold text-white ${
                      i < 3 ? "bg-accent" : "bg-slate-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold text-slate-400">
                      {getCategoryName(a.categorySlug)}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-[14px] font-bold leading-snug text-ink">
                      {a.title}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section id="categories" className="border-t border-slate-100 px-4 py-6">
          <h2 className="text-[17px] font-black text-ink">カテゴリーから探す</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categories.map((c) => {
              const meta = getCategoryMeta(c.slug);
              return (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-3 active:bg-slate-50"
                >
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: meta.accent }}
                  >
                    <CategoryIcon icon={meta.icon} className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-bold text-ink">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* ========== デスクトップ：既存レイアウト ========== */}
      <div className="mx-auto hidden max-w-6xl px-4 py-6 md:block">
        <div className="grid gap-8 lg:grid-cols-3">
          <main className="lg:col-span-2">
            {lead && (
              <article className="grid gap-5 sm:grid-cols-2">
                <Link
                  href={`/articles/${lead.slug}`}
                  className="block overflow-hidden rounded-lg border border-slate-200"
                >
                  <Eyecatch
                    categorySlug={lead.categorySlug}
                    categoryName={getCategoryName(lead.categorySlug)}
                    imageUrl={lead.imageUrl}
                    className="aspect-[16/10]"
                  />
                </Link>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-700">
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: getCategoryMeta(lead.categorySlug)
                          .accent,
                      }}
                    />
                    {getCategoryName(lead.categorySlug)}
                  </span>
                  <h1 className="mt-2 font-serif text-xl font-bold leading-relaxed text-slate-900 sm:text-2xl">
                    <Link
                      href={`/articles/${lead.slug}`}
                      className="decoration-navy-600 decoration-2 underline-offset-4 hover:underline"
                    >
                      {lead.title}
                    </Link>
                  </h1>
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-slate-600">
                    {lead.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-slate-400">
                    {formatJaDate(lead.publishedAt)}
                  </p>
                </div>
              </article>
            )}

            <div className="mt-8">
              <SectionTitle>新着記事</SectionTitle>
              <div className="grid sm:grid-cols-2 sm:gap-x-8">
                {secondary.map((a) => (
                  <ArticleListItem key={a.slug} article={a} />
                ))}
              </div>
              <div className="mt-5 text-right">
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-1 text-sm font-bold text-navy-700 hover:underline"
                >
                  記事一覧をすべて見る
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </main>

          <aside className="space-y-8">
            <div className="rounded-lg border border-slate-200 p-5">
              <p className="inline-flex rounded-sm bg-navy-50 px-2 py-0.5 text-xs font-bold text-navy-700">
                解体見積もりシステム
              </p>
              <p className="mt-3 font-serif text-lg font-bold leading-snug text-slate-900">
                見積もり作成を、もっと速く正確に。
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                拾い出しから内訳作成までの手戻りを減らし、担当者ごとのばらつきを抑えます。
              </p>
              <Link
                href="/bakusoq"
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
              >
                資料を見る
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>

            {pickup.length > 0 && (
              <div>
                <SectionTitle>PICK UP ─ 制度・法改正</SectionTitle>
                <ul className="mt-1">
                  {pickup.map((a) => (
                    <li key={a.slug} className="border-b border-slate-200">
                      <Link
                        href={`/articles/${a.slug}`}
                        className="group block py-3"
                      >
                        <span className="text-xs font-bold text-navy-700">
                          {getCategoryName(a.categorySlug)}
                        </span>
                        <span className="mt-1 block font-serif text-sm font-bold leading-snug text-slate-900 decoration-navy-600 decoration-2 underline-offset-4 group-hover:underline">
                          {a.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <SectionTitle>RANKING</SectionTitle>
              <ol className="mt-1">
                {ranking.map((a, i) => (
                  <li key={a.slug} className="border-b border-slate-200">
                    <Link
                      href={`/articles/${a.slug}`}
                      className="group flex gap-3 py-3"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-sm font-bold text-white ${
                          i < 3 ? "bg-accent" : "bg-slate-400"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-400">
                          {getCategoryName(a.categorySlug)}
                        </span>
                        <span className="line-clamp-2 font-serif text-sm font-bold leading-snug text-slate-800 decoration-navy-600 decoration-2 underline-offset-4 group-hover:underline">
                          {a.title}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>

        <section id="categories-desktop" className="mt-14">
          <SectionTitle>カテゴリーから探す</SectionTitle>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => {
              const meta = getCategoryMeta(c.slug);
              return (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="group flex items-center gap-2.5 rounded-md border border-slate-200 px-3.5 py-3 transition-colors hover:border-navy-600 hover:bg-navy-50"
                >
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: meta.accent }}
                  >
                    <CategoryIcon icon={meta.icon} className="h-4 w-4" />
                  </span>
                  <span className="font-bold text-slate-800 group-hover:text-navy-700">
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
