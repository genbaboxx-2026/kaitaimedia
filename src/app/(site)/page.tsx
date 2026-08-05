import type { Metadata } from "next";
import Link from "next/link";
import { getCategoryName } from "@/lib/dummy-data";
import {
  getApprovedSnsTrends,
  getLatestArticles,
  getLatestNews,
  getRankingArticles,
} from "@/lib/site-data";
import { SITE_URL } from "@/lib/site-url";
import { SITE_DESCRIPTION } from "@/lib/seo";
import type { Article } from "@/lib/types";
import { Eyecatch } from "@/components/site/eyecatch";
import { NewsListItem } from "@/components/site/news-list-item";
import { SnsTrendList } from "@/components/site/sns-trend-list";
import { FeedSectionHeader } from "@/components/site/feed-section-header";
import { ArrowIcon } from "@/components/site/icons";
import { SidebarPromoStack } from "@/components/site/sidebar-promo-banners";
import { formatJaDate, formatRelativeJa } from "@/lib/format";

export const metadata: Metadata = {
  title: { absolute: "解体ナレッジ" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "解体ナレッジ",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold tracking-tight text-slate-900">
      {children}
    </h2>
  );
}

function SecondaryArticleCard({ article }: { article: Article }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/articles/${article.slug}`} className="group block">
        <div className="overflow-hidden">
          <Eyecatch
            categorySlug={article.categorySlug}
            categoryName={getCategoryName(article.categorySlug)}
            imageUrl={article.imageUrl}
            className="aspect-[16/10]"
          />
        </div>
        <div className="px-3.5 py-3.5">
          <h3 className="line-clamp-3 text-[16px] font-bold leading-snug text-slate-900 group-hover:text-navy-700">
            {article.title}
          </h3>
          <p className="mt-2 text-[12px] text-slate-400">
            {formatRelativeJa(article.publishedAt)}
          </p>
        </div>
      </Link>
    </article>
  );
}

export const revalidate = 300; // ISR: 5分

export default async function HomePage() {
  const [news, articles, ranking, snsTrends] = await Promise.all([
    getLatestNews(10),
    getLatestArticles(13),
    getRankingArticles(5),
    getApprovedSnsTrends(5),
  ]);

  const [lead, ...rest] = articles;
  const secondary = rest.slice(0, 6); // 注目の記事：3列×2行
  const newsRows = news.slice(0, 10);
  const snsRows = snsTrends.slice(0, 5);
  const rankingRows = ranking.slice(0, 5);
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

        {/* 広告：BAKUSOQ / NiNKUBOXX（記事一覧の下・SNSの前） */}
        <section className="border-t border-slate-100 px-4 py-5">
          <SidebarPromoStack />
        </section>

        {/* SNS（最大10件） */}
        {snsRows.length > 0 && (
          <section className="border-t border-slate-100">
            <FeedSectionHeader title="SNSトレンド" />
            <SnsTrendList items={snsRows} />
          </section>
        )}
      </div>

      {/* ========== デスクトップ：ポータル風レイアウト ========== */}
      <div className="hidden bg-slate-50 md:block">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <main className="min-w-0 space-y-10">
              {lead && (
                <Link
                  href={`/articles/${lead.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative">
                    <Eyecatch
                      categorySlug={lead.categorySlug}
                      categoryName={getCategoryName(lead.categorySlug)}
                      imageUrl={lead.imageUrl}
                      className="aspect-[21/9] sm:aspect-[2.4/1]"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-6 pb-5 pt-16">
                      <h1 className="max-w-3xl text-xl font-bold leading-snug text-white sm:text-2xl">
                        {lead.title}
                      </h1>
                      <p className="mt-2 max-w-2xl line-clamp-2 text-sm leading-relaxed text-white/85">
                        {lead.excerpt}
                      </p>
                      <p className="mt-2 text-xs text-white/65">
                        {formatJaDate(lead.publishedAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {secondary.length > 0 && (
                <section>
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <SectionTitle>注目の記事</SectionTitle>
                    <Link
                      href="/articles"
                      className="inline-flex items-center gap-1 text-sm font-bold text-navy-700 hover:underline"
                    >
                      記事一覧をすべて見る
                      <ArrowIcon className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {secondary.map((a) => (
                      <SecondaryArticleCard key={a.slug} article={a} />
                    ))}
                  </div>
                </section>
              )}

              {newsRows.length > 0 && (
                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                  <FeedSectionHeader title="今日のニュース" />
                  <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
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
                </section>
              )}
            </main>

            <aside className="space-y-6">
              <SidebarPromoStack />

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400">
                  RANKING
                </p>
                <SectionTitle>
                  <span className="text-base">人気記事ランキング</span>
                </SectionTitle>
                <ol className="mt-3 space-y-1">
                  {rankingRows.map((a, i) => (
                    <li key={a.slug}>
                      <Link
                        href={`/articles/${a.slug}`}
                        className="group flex items-start gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-slate-50"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-navy-700 text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="relative aspect-video w-[4.5rem] shrink-0 overflow-hidden rounded-md border border-slate-200">
                          <Eyecatch
                            categorySlug={a.categorySlug}
                            categoryName={getCategoryName(a.categorySlug)}
                            imageUrl={a.imageUrl}
                            className="h-full w-full"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 text-[13px] font-bold leading-snug text-slate-800 group-hover:text-navy-700">
                            {a.title}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>

              {snsRows.length > 0 && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <SectionTitle>
                    <span className="text-base">SNSトレンド</span>
                  </SectionTitle>
                  <p className="mt-1 text-[11px] text-slate-400">
                    2日以内を優先 · いいね順 · タップで投稿を表示
                  </p>
                  <div className="mt-2">
                    <SnsTrendList items={snsRows} compact />
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
