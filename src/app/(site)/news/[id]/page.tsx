import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getLatestArticles,
  getLatestNews,
  getNewsById,
  searchArticles,
} from "@/lib/site-data";
import { SITE_URL } from "@/lib/site-url";
import { OPERATOR_NAME } from "@/lib/dummy-data";
import { formatJaDateTime } from "@/lib/format";
import {
  buildNewsBriefing,
  newsSearchKeywords,
} from "@/lib/news/briefing";
import { isSameNewsStory } from "@/lib/news/title-key";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ArticleCard } from "@/components/site/article-card";
import { NewsEditorialBody } from "@/components/site/news-editorial-body";
import { NewsListItem } from "@/components/site/news-list-item";
import { JsonLd } from "@/components/site/json-ld";
import type { Article } from "@/lib/types";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getNewsById(id);
  if (!item) return { title: "ニュースが見つかりません" };
  const url = `${SITE_URL}/news/${item.id}`;
  const displaySource = item.sourceName.replace(/^Googleニュース\s*\/\s*/, "");
  const briefing = buildNewsBriefing(item.title, displaySource);
  const description =
    item.editorialBody?.replace(/[#*`>\-\[\]()]/g, "").slice(0, 120) ??
    item.summary ??
    briefing.lead.slice(0, 120);
  const images = item.imageUrl ? [{ url: item.imageUrl }] : undefined;
  return {
    title: item.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: item.title,
      description,
      url,
      siteName: "解体ナレッジ",
      locale: "ja_JP",
      publishedTime: item.publishedAt,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: item.imageUrl ? [item.imageUrl] : undefined,
    },
  };
}

async function collectRelatedArticles(title: string): Promise<Article[]> {
  const keys = newsSearchKeywords(title);
  const found: Article[] = [];
  const seen = new Set<string>();
  for (const key of keys) {
    const hits = await searchArticles(key);
    for (const a of hits) {
      if (seen.has(a.slug)) continue;
      seen.add(a.slug);
      found.push(a);
      if (found.length >= 3) return found;
    }
  }
  if (found.length >= 3) return found;
  const latest = await getLatestArticles(6);
  for (const a of latest) {
    if (seen.has(a.slug)) continue;
    found.push(a);
    if (found.length >= 3) break;
  }
  return found.slice(0, 3);
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getNewsById(id);
  if (!item) notFound();

  const displaySource = item.sourceName.replace(/^Googleニュース\s*\/\s*/, "");
  const briefing = buildNewsBriefing(item.title, displaySource);
  const [relatedArticles, latestNews] = await Promise.all([
    collectRelatedArticles(item.title),
    getLatestNews(8),
  ]);
  const moreNews = latestNews
    .filter((n) => n.id !== item.id && !isSameNewsStory(n.title, item.title))
    .slice(0, 4);

  const pageUrl = `${SITE_URL}/news/${item.id}`;
  const newsDescription =
    item.editorialBody?.replace(/[#*`>\-\[\]()]/g, "").slice(0, 160) ??
    item.summary ??
    briefing.lead.slice(0, 160);
  const newsLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: newsDescription,
    datePublished: item.publishedAt,
    dateModified: item.publishedAt,
    mainEntityOfPage: pageUrl,
    url: pageUrl,
    inLanguage: "ja-JP",
    image: item.imageUrl ? [item.imageUrl] : undefined,
    author: {
      "@type": "Organization",
      name: displaySource || OPERATOR_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: OPERATOR_NAME,
      url: SITE_URL,
    },
    isBasedOn: item.url,
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "ニュース",
        item: `${SITE_URL}/news`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl md:px-4 md:py-6">
      <JsonLd data={newsLd} />
      <JsonLd data={breadcrumbLd} />
      <div className="hidden md:block">
        <Breadcrumbs
          items={[
            { href: "/", label: "トップ" },
            { href: "/news", label: "ニュース" },
            { label: item.title },
          ]}
        />
      </div>

      <header className="px-4 pt-5 md:px-0 md:pt-2">
        <p className="text-[12px] font-medium text-slate-500">
          {displaySource}
          <span aria-hidden className="mx-1.5 text-slate-300">
            ·
          </span>
          <time dateTime={item.publishedAt}>
            {formatJaDateTime(item.publishedAt)}
          </time>
        </p>
        <h1 className="mt-3 text-[24px] font-black leading-snug tracking-tight text-ink md:font-serif md:text-[28px]">
          {item.title}
        </h1>
        {briefing.topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {briefing.topics.map((t) => (
              <span
                key={t}
                className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {item.imageUrl ? (
        <div className="mt-5 px-4 md:px-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=""
            className="aspect-[16/9] w-full rounded-lg object-cover bg-slate-100"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div className="mt-5 px-4 md:px-0">
          <div className="flex aspect-[16/9] w-full flex-col justify-end rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#0f2744] p-5 text-white">
            <p className="text-[12px] font-semibold opacity-80">
              {displaySource}
            </p>
            <p className="mt-2 line-clamp-3 text-[18px] font-bold leading-snug">
              {item.title}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-8 px-4 md:px-0">
        {item.editorialBody ? (
          <section>
            <p className="text-[12px] font-bold tracking-wide text-slate-400">
              解体ナレッジ編集部
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
              転載ではなく、見出しと公開情報をもとにした独自の整理です。
            </p>
            <div className="mt-5">
              <NewsEditorialBody markdown={item.editorialBody} />
            </div>
          </section>
        ) : (
          <section>
            <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
              <h2 className="text-[20px] font-black tracking-tight text-ink">
                わかりやすく解説
              </h2>
              <p className="pb-0.5 text-[12px] font-medium text-slate-400">
                解体ナレッジ編集部
              </p>
            </div>
            <p className="mt-2 text-[16px] leading-8 text-slate-700">
              {briefing.lead}
            </p>
            <h3 className="mt-6 text-[20px] font-black tracking-tight text-ink">
              実務で確認できそうなこと
            </h3>
            <ul className="mt-3 space-y-2.5">
              {briefing.points.map((p) => (
                <li
                  key={p}
                  className="flex gap-2.5 text-[15px] leading-7 text-slate-700"
                >
                  <span
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-600"
                    aria-hidden
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-[13px] leading-relaxed text-slate-500">
            当ページの解説は解体ナレッジ編集部による独自の読み方であり、元記事本文の転載ではありません。内容の正確性・最新性は元記事をご確認ください。
          </p>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex h-12 items-center justify-center rounded-lg bg-navy-700 text-sm font-bold text-white active:bg-navy-800"
          >
            元記事を読む（外部サイト）
          </a>
        </section>

        <section className="rounded-xl border border-navy-200 bg-navy-50/60 p-5">
          <h2 className="text-[15px] font-bold text-ink">
            見積・原価の実務につなげるなら
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
            解体工事の見積精度を上げるなら、BAKUSOQで数量拾いと原価の見える化を検討できます。
          </p>
          <Link
            href="/bakusoq"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-brand-600 px-5 text-sm font-bold text-white active:opacity-90"
          >
            BAKUSOQを見る
          </Link>
        </section>

        {relatedArticles.length > 0 && (
          <section>
            <h2 className="text-[18px] font-bold text-ink">関連する解説記事</h2>
            <p className="mt-1 text-[13px] text-slate-500">
              同じテーマを、解体ナレッジの記事で深く読めます
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {relatedArticles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}

        {moreNews.length > 0 && (
          <section>
            <h2 className="text-[18px] font-bold text-ink">ほかのニュース</h2>
            <div className="mt-2">
              {moreNews.map((n) => (
                <NewsListItem key={n.id} item={n} />
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/news"
                className="text-sm font-bold text-navy-700 hover:underline"
              >
                ニュース一覧へ →
              </Link>
            </div>
          </section>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 px-4 pb-10 text-sm font-semibold text-navy-700 md:px-0">
        <Link href="/news" className="hover:underline">
          ← ニュース一覧へ
        </Link>
        <Link href="/articles" className="hover:underline">
          解説記事をすべて見る →
        </Link>
      </div>
    </article>
  );
}
