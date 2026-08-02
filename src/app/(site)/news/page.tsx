import type { Metadata } from "next";
import Link from "next/link";
import { getLatestNews } from "@/lib/site-data";
import { FeedSectionHeader } from "@/components/site/feed-section-header";
import { NewsListItem } from "@/components/site/news-list-item";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "ニュース",
  description:
    "解体・建設・産廃に関する業界ニュースを紹介しています。詳細ページから元記事も確認できます。",
};

export default async function NewsPage() {
  const news = await getLatestNews(50);

  return (
    <div className="mx-auto max-w-3xl md:px-4 md:py-6">
      <div className="hidden md:block">
        <Breadcrumbs
          items={[
            { href: "/", label: "トップ" },
            { label: "ニュース" },
          ]}
        />
      </div>

      <FeedSectionHeader title="ニュース" />

      <p className="mt-3 px-4 text-[12px] leading-relaxed text-slate-500 md:px-0">
        当サイトは各媒体のニュースを紹介しています。見出しをタップすると詳細ページが開き、必要に応じて元記事へ移動できます（転載ではありません）。
      </p>

      {news.length === 0 ? (
        <p className="px-4 py-10 text-sm text-slate-500 md:px-0">
          現在表示できるニュースはありません。しばらくしてから再度お試しください。
        </p>
      ) : (
        <div className="mt-2">
          {news.map((item) => (
            <NewsListItem key={item.id} item={item} />
          ))}
        </div>
      )}

      <div className="px-4 py-6 md:px-0">
        <Link
          href="/articles"
          className="flex h-11 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-ink active:bg-slate-50 md:inline-flex md:px-6"
        >
          解説記事を見る
        </Link>
      </div>
    </div>
  );
}
