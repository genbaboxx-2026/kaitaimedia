import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/dummy-data";
import { getArticlesByCategory, getCategoryBySlug } from "@/lib/site-data";
import { SITE_URL } from "@/lib/site-url";
import { ArticleCard } from "@/components/site/article-card";
import { ArticleListItem } from "@/components/site/article-list-item";
import { FeedSectionHeader } from "@/components/site/feed-section-header";
import { Pagination } from "@/components/site/pagination";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { getCategoryMeta } from "@/lib/categories-meta";
import { CategoryIcon } from "@/components/site/icons";

const PAGE_SIZE = 6;

export const revalidate = 300; // ISR: 5分

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "カテゴリーが見つかりません" };
  const url = `${SITE_URL}/category/${slug}`;
  const title = `${category.name}の記事`;
  const description =
    category.description ||
    `解体業界の「${category.name}」に関する実務記事一覧。`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `解体ナレッジ | ${title}`,
      description,
      url,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const all = await getArticlesByCategory(slug);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const parsed = Number(page);
  const currentPage =
    Number.isInteger(parsed) && parsed >= 1 && parsed <= totalPages ? parsed : 1;

  const start = (currentPage - 1) * PAGE_SIZE;
  const items = all.slice(start, start + PAGE_SIZE);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "記事一覧", item: `${SITE_URL}/articles` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}/category/${slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbLd} />

      {/* モバイル：フィード型 */}
      <div className="md:hidden">
        <FeedSectionHeader title={category.name} />
        <p className="px-4 pb-2 text-[12px] leading-relaxed text-slate-400">
          {category.description}
        </p>
        {items.length === 0 ? (
          <p className="mx-4 mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            このカテゴリーの記事はまだありません。
          </p>
        ) : (
          <>
            <div>
              {items.map((a) => (
                <ArticleListItem key={a.slug} article={a} />
              ))}
            </div>
            <div className="px-4 pb-6">
              <Pagination
                basePath={`/category/${slug}`}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          </>
        )}
      </div>

      {/* デスクトップ */}
      <div className="mx-auto hidden max-w-5xl px-4 py-8 md:block">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "記事一覧", href: "/articles" },
            { label: category.name },
          ]}
        />

        <div className="mt-4 border-b-2 border-navy-700 pb-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-md text-white"
              style={{ backgroundColor: getCategoryMeta(slug).accent }}
            >
              <CategoryIcon
                icon={getCategoryMeta(slug).icon}
                className="h-6 w-6"
              />
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              {category.name}の記事
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            {category.description}
          </p>
        </div>

        {items.length === 0 ? (
          <p className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            このカテゴリーの記事はまだありません。
          </p>
        ) : (
          <>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
            <Pagination
              basePath={`/category/${slug}`}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </>
        )}
      </div>
    </>
  );
}
