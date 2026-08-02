import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsById } from "@/lib/site-data";
import { SITE_URL } from "@/lib/site-url";
import { formatJaDateTime } from "@/lib/format";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

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
  const description =
    item.summary ??
    `${item.sourceName}のニュース紹介。詳細は元記事をご覧ください。`;
  return {
    title: item.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: item.title,
      description,
      url,
      ...(item.imageUrl ? { images: [{ url: item.imageUrl }] } : {}),
    },
  };
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

  return (
    <article className="mx-auto max-w-3xl md:px-4 md:py-6">
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
      ) : null}

      <div className="mt-6 space-y-5 px-4 leading-relaxed text-slate-700 md:px-0">
        {item.summary ? (
          <p className="text-[16px] leading-8">{item.summary}</p>
        ) : (
          <p className="text-[15px] leading-7 text-slate-600">
            このニュースの詳細本文は、出典元のサイトでご覧いただけます。当サイトでは見出しと概要の紹介のみ行っています。
          </p>
        )}

        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] leading-relaxed text-slate-500">
          当ページは各媒体のニュースを紹介するものであり、記事本文の転載ではありません。内容の正確性・最新性は元記事をご確認ください。
        </p>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center rounded-lg bg-navy-700 text-sm font-bold text-white active:bg-navy-800"
        >
          元記事を読む（外部サイト）
        </a>
      </div>

      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 px-4 pb-10 text-sm font-semibold text-navy-700 md:px-0">
        <Link href="/news" className="hover:underline">
          ← ニュース一覧へ
        </Link>
        <Link href="/articles" className="hover:underline">
          解説記事を見る →
        </Link>
      </div>
    </article>
  );
}
