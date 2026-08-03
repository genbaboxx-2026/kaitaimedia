import type { Metadata } from "next";
import Link from "next/link";
import { getCategoryName } from "@/lib/dummy-data";
import {
  getApprovedSnsTrends,
  getLatestArticles,
  getLatestNews,
  getRankingArticles,
} from "@/lib/site-data";
import { getCategoryMeta } from "@/lib/categories-meta";
import { SITE_URL } from "@/lib/site-url";
import { SITE_DESCRIPTION } from "@/lib/seo";
import type { Article } from "@/lib/types";
import { Eyecatch } from "@/components/site/eyecatch";
import { NewsListItem } from "@/components/site/news-list-item";
import { SnsTrendList } from "@/components/site/sns-trend-list";
import { FeedSectionHeader } from "@/components/site/feed-section-header";
import { ArrowIcon } from "@/components/site/icons";
import {
  BakusoqSidebarBanner,
  NinkuboxxSidebarBanner,
} from "@/components/site/sidebar-promo-banners";
import { formatJaDate, formatRelativeJa } from "@/lib/format";

export const metadata: Metadata = {
  title: { absolute: "解体ナレッジ | GENBABOXX" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "解体ナレッジ | GENBABOXX",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 border-b-2 border-navy-700 pb-2 font-serif text-lg font-bold tracking-tight text-slate-900">
      {children}
    </h2>
  );
}

function SecondaryArticleCard({ article }: { article: Article }) {
  const categoryName = getCategoryName(article.categorySlug);
  const meta = getCategoryMeta(article.categorySlug);

  return (
    <article>
      <Link href={`/articles/${article.slug}`} className="group block">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <Eyecatch
            categorySlug={article.categorySlug}
            categoryName={categoryName}
            imageUrl={article.imageUrl}
            className="aspect-video"
          />
        </div>
        <span className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-navy-700">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: meta.accent }}
          />
          {categoryName}
        </span>
        <h3 className="mt-1 line-clamp-3 font-serif text-[15px] font-bold leading-snug text-slate-900 decoration-navy-600 decoration-2 underline-offset-4 group-hover:underline">
          {article.title}
        </h3>
        <p className="mt-1.5 text-[11px] text-slate-400">
          {formatRelativeJa(article.publishedAt)}
        </p>
      </Link>
    </article>
  );
}

export const revalidate = 300; // ISR: 5分

export default async function HomePage() {
  const [news, articles, ranking, snsTrends] = await Promise.all([
    getLatestNews(10),
    getLatestArticles(11),
    getRankingArticles(3),
    getApprovedSnsTrends(10),
  ]);

  const [lead, ...rest] = articles;
  const secondary = rest.slice(0, 3);
  const newsRows = news.slice(0, 10);
  const snsRows = snsTrends.slice(0, 10);
  const rankingRows = ranking.slice(0, 3);
  const articleFeed = rest.slice(0, 10); // モバイル「記事」セクション：最新記事の次から公開順に最大10件

  return (
    <>
      {/* ========== モバイル：記事主＋ニュース ========== */}
      <div className="md:hidden">
        {lead && (
          <section className="border-b border-slate-100 px-4 pb-5 pt-5">
            <p className="text-[12px] font-bold text-navy-700">最新記事</p>
            <Link href={`/articles/${lead.slug}`} className="mt-2 block">
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <Eyecatch
                  categorySlug={lead.categorySlug}
                  categoryName={getCategoryName(lead.categorySlug)}
                  imageUrl={lead.imageUrl}
                  className="aspect-video"
                />
              </div>
              <h2 className="mt-3 text-[18px] font-black leading-snug text-ink">
                {lead.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-500">
                {lead.excerpt}
              </p>
              <p className="mt-2 text-[11px] text-slate-400">
                {getCategoryName(lead.categorySlug)} ·{" "}
                {formatRelativeJa(lead.publishedAt)}
              </p>
            </Link>
          </section>
        )}

        {/* 記事一覧を見る */}
        <div className="px-4 py-4">
          <Link
            href="/articles"
            className="flex h-11 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-ink active:bg-slate-50"
          >
            記事一覧を見る
          </Link>
        </div>

        {/* ニュース（最大10件） */}
        <section className="border-t border-slate-100">
          <FeedSectionHeader title="今日のニュース" />
          <div className="mt-1">
            {newsRows.map((item) => (
              <NewsListItem key={item.id} item={item} />
            ))}
          </div>
          <div className="px-4 py-5">
            <Link
              href="/news"
              className="flex h-11 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-ink active:bg-slate-50"
            >
              ニュースをもっと見る
            </Link>
          </div>
        </section>

        {/* 記事（公開した順に最大10件） */}
        {articleFeed.length > 0 && (
          <section className="border-t border-slate-100">
            <FeedSectionHeader title="記事" />
            <ul className="mt-1">
              {articleFeed.map((a) => (
                <li key={a.slug} className="border-b border-slate-100">
                  <Link href={`/articles/${a.slug}`} className="flex gap-3 px-4 py-3.5 active:bg-slate-50">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold text-slate-400">
                        {getCategoryName(a.categorySlug)} · {formatRelativeJa(a.publishedAt)}
                      </span>
                      <span className="mt-0.5 line-clamp-2 text-[14px] font-bold leading-snug text-ink">
                        {a.title}
                      </span>
                    </span>
                    <span className="relative aspect-video w-[7.5rem] shrink-0 overflow-hidden rounded-md border border-slate-200">
                      <Eyecatch
                        categorySlug={a.categorySlug}
                        categoryName={getCategoryName(a.categorySlug)}
                        imageUrl={a.imageUrl}
                        className="h-full w-full"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="px-4 py-5">
              <Link
                href="/articles"
                className="flex h-11 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-ink active:bg-slate-50"
              >
                記事をもっと見る
              </Link>
            </div>
          </section>
        )}

        {/* SNS（最大10件） */}
        {snsRows.length > 0 && (
          <section className="border-t border-slate-100">
            <FeedSectionHeader title="SNSトレンド" />
            <SnsTrendList items={snsRows} />
          </section>
        )}
      </div>

      {/* ========== デスクトップ：記事+ランキング → 全幅でニュース+SNS ========== */}
      <div className="mx-auto hidden max-w-7xl px-4 py-6 md:block">
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
                    className="aspect-video"
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

            {secondary.length > 0 && (
              <div className="mt-8">
                <SectionTitle>注目の記事</SectionTitle>
                <div className="mt-4 grid gap-5 sm:grid-cols-3">
                  {secondary.map((a) => (
                    <SecondaryArticleCard key={a.slug} article={a} />
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside className="space-y-8">
            <div className="space-y-4">
              <BakusoqSidebarBanner />
              <NinkuboxxSidebarBanner />
            </div>

            <div>
              <SectionTitle>RANKING</SectionTitle>
              <ol className="mt-1">
                {rankingRows.map((a, i) => (
                  <li key={a.slug} className="border-b border-slate-200">
                    <Link
                      href={`/articles/${a.slug}`}
                      className="group flex gap-3 py-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-accent text-sm font-bold text-white">
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

        {/* 記事エリアの下：記事一覧リンク → ニュース + SNS */}
        <div className="mt-8 text-right">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-sm font-bold text-navy-700 hover:underline"
          >
            記事一覧をすべて見る
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>

        <section className="mt-6 border-t border-slate-100 pt-8">
          <div
            className={`grid gap-8 xl:gap-10 ${
              snsRows.length > 0 ? "lg:grid-cols-3" : ""
            }`}
          >
            <div className={snsRows.length > 0 ? "lg:col-span-2" : undefined}>
              <FeedSectionHeader title="今日のニュース" />
              <div className="mt-2 grid gap-x-10 sm:grid-cols-2">
                {newsRows.map((item) => (
                  <NewsListItem key={item.id} item={item} />
                ))}
              </div>
              <div className="mt-5 text-right">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-1 text-sm font-bold text-navy-700 hover:underline"
                >
                  ニュースをもっと見る
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
            {snsRows.length > 0 && (
              <aside className="lg:border-l lg:border-slate-100 lg:pl-8">
                <FeedSectionHeader
                  title="SNSトレンド"
                  subtitle="いいね順 · タップで投稿を表示"
                />
                <div className="mt-2">
                  <SnsTrendList items={snsRows} compact />
                </div>
              </aside>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
