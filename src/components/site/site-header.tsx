import Link from "next/link";
import { CATEGORIES, SITE_NAME } from "@/lib/dummy-data";
import { SearchIcon } from "@/components/site/icons";

const PRIMARY_CATEGORY_SLUGS = [
  "estimate",
  "cost",
  "schedule",
  "labor",
  "waste",
  "law",
  "subsidy",
  "news",
];

const TRENDING = [
  { slug: "law", label: "#法改正" },
  { slug: "subsidy", label: "#補助金" },
  { slug: "asbestos", label: "#アスベスト" },
];

export function SiteHeader() {
  const primary = PRIMARY_CATEGORY_SLUGS.map((slug) =>
    CATEGORIES.find((c) => c.slug === slug),
  ).filter((c): c is (typeof CATEGORIES)[number] => Boolean(c));

  return (
    <header className="sticky top-0 z-30 bg-white">
      {/* 上段：検索・ロゴ・アクション */}
      <div className="border-b border-slate-200">
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
          {/* 左：検索 */}
          <div className="justify-self-start">
            <Link
              href="/search"
              className="flex w-full max-w-64 items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-navy-600"
            >
              <SearchIcon className="h-4 w-4" />
              <span className="hidden sm:inline">記事を検索</span>
            </Link>
          </div>

          {/* 中央：ロゴ（明朝） */}
          <Link href="/" className="justify-self-center text-center">
            <span className="block font-serif text-lg font-bold tracking-wide text-navy-800 sm:text-2xl">
              {SITE_NAME}
            </span>
            <span className="hidden text-[10px] tracking-widest text-slate-500 sm:block">
              運営：GENBABOXX
            </span>
          </Link>

          {/* 右：アクション */}
          <div className="flex items-center justify-self-end gap-2">
            <Link
              href="/contact"
              className="hidden rounded bg-brand-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-700 sm:inline-block"
            >
              お問い合わせ
            </Link>
            <Link
              href="/bakusoq"
              className="rounded bg-navy-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-navy-600"
            >
              BAKUSOQ
            </Link>
          </div>
        </div>
      </div>

      {/* 下段：ナビ（ネイビー） */}
      <div className="bg-navy-700 text-white">
        <div className="mx-auto flex h-11 max-w-6xl items-center gap-1 overflow-x-auto px-4">
          <Link
            href="/"
            className="whitespace-nowrap rounded px-3 py-1.5 text-sm font-bold hover:bg-white/10"
          >
            トップ
          </Link>
          {primary.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-white/10"
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/articles"
            className="whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-white/10"
          >
            記事一覧
          </Link>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            {TRENDING.map((t) => (
              <Link
                key={t.slug}
                href={`/category/${t.slug}`}
                className="whitespace-nowrap text-sm font-bold text-amber-300 hover:underline"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
