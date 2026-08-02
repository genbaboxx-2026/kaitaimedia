import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryName } from "@/lib/dummy-data";
import {
  getAllArticleSlugs,
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/site-data";
import { SITE_URL } from "@/lib/site-url";
import { OPERATOR_NAME } from "@/lib/dummy-data";
import { formatJaDate } from "@/lib/format";
import { ArticleBody } from "@/components/site/article-body";
import { ViewBeacon } from "@/components/site/view-beacon";
import { TableOfContents } from "@/components/site/table-of-contents";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ArticleTypeBadge, CategoryBadge } from "@/components/site/badges";
import { JsonLd } from "@/components/site/json-ld";
// 記事末尾CTAは削除済み

export const revalidate = 300; // ISR: 5分

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "記事が見つかりません" };
  const url = `${SITE_URL}/articles/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const categoryName = getCategoryName(article.categorySlug);
  const related = await getRelatedArticles(article);

  const articleUrl = `${SITE_URL}/articles/${article.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    mainEntityOfPage: articleUrl,
    author: { "@type": "Organization", name: OPERATOR_NAME },
    publisher: { "@type": "Organization", name: OPERATOR_NAME },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "記事一覧", item: `${SITE_URL}/articles` },
      { "@type": "ListItem", position: 3, name: categoryName, item: `${SITE_URL}/category/${article.categorySlug}` },
      { "@type": "ListItem", position: 4, name: article.title, item: articleUrl },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 md:py-8">
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />
      <ViewBeacon slug={article.slug} />
      <div className="hidden md:block">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "記事一覧", href: "/articles" },
            { label: categoryName, href: `/category/${article.categorySlug}` },
            { label: article.title },
          ]}
        />
      </div>

      {/* 記事ヘッダー */}
      <header className="border-b border-slate-100 pb-5 md:mt-4 md:border-slate-200 md:pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge slug={article.categorySlug} name={categoryName} />
          <ArticleTypeBadge type={article.articleType} />
        </div>
        <h1 className="mt-3 text-[1.35rem] font-black leading-snug tracking-tight text-ink md:font-serif md:text-3xl md:font-bold md:leading-relaxed md:text-slate-900">
          {article.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-slate-400 md:mt-4 md:gap-3 md:text-xs">
          <time dateTime={article.publishedAt}>
            {formatJaDate(article.publishedAt)}
          </time>
          {article.updatedAt && (
            <>
              <span aria-hidden>·</span>
              <time dateTime={article.updatedAt}>
                更新 {formatJaDate(article.updatedAt)}
              </time>
            </>
          )}
          <span aria-hidden>·</span>
          <span>約{article.readingMinutes}分</span>
        </div>
      </header>

      {/* リード文 */}
      <p className="mt-5 text-[15px] font-medium leading-relaxed text-slate-600 md:mt-6 md:border-l-4 md:border-navy-700 md:bg-slate-50 md:px-5 md:py-4 md:text-[1.05rem] md:text-slate-700">
        {article.excerpt}
      </p>

      {/* 本文 ＋ サイドバー（目次・CTA） */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* モバイルでは本文の前に目次を表示 */}
          <div className="mb-8 lg:hidden">
            <TableOfContents sections={article.sections} />
          </div>

          <ArticleBody sections={article.sections} />

          {/* 型C：出典 */}
          {article.sourceUrls && article.sourceUrls.length > 0 && (
            <section className="mt-10 rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900">出典</h2>
              <ul className="mt-3 space-y-1.5">
                {article.sourceUrls.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm text-brand-700 underline underline-offset-2"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* サイドバー（PCでは追従） */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="hidden lg:block">
            <TableOfContents sections={article.sections} />
          </div>
        </aside>
      </div>

      {/* 関連記事 */}
      {related.length > 0 && (
        <section className="mt-14 border-t border-slate-200 pt-8">
          <h2 className="text-xl font-bold text-slate-900">関連記事</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li
                key={r.slug}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <p className="text-xs text-slate-400">
                  {getCategoryName(r.categorySlug)}
                </p>
                <Link
                  href={`/articles/${r.slug}`}
                  className="mt-1 block font-bold leading-snug text-slate-900 hover:text-brand-700"
                >
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
