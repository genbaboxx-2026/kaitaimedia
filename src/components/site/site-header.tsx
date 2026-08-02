"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, SITE_NAME } from "@/lib/dummy-data";
import { SearchIcon } from "@/components/site/icons";
import { BellIcon, MenuIcon } from "@/components/site/nav-icons";
import { SiteMenuDrawer } from "@/components/site/site-menu-drawer";

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
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const primary = PRIMARY_CATEGORY_SLUGS.map((slug) =>
    CATEGORIES.find((c) => c.slug === slug),
  ).filter((c): c is (typeof CATEGORIES)[number] => Boolean(c));

  const isTop = pathname === "/";
  const activeCategory = pathname.startsWith("/category/")
    ? pathname.split("/")[2]
    : null;

  return (
    <>
      {/* ========== モバイル：NewsPicks風アプリヘッダー ========== */}
      <header className="sticky top-0 z-30 bg-white md:hidden">
        <div
          className="flex h-12 items-center justify-between px-2"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex w-20 items-center">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center text-ink active:bg-slate-100"
              aria-label="メニューを開く"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>

          <Link href="/" className="min-w-0 text-center">
            <span className="block truncate text-[15px] font-black tracking-[0.08em] text-ink">
              解体メディア
            </span>
          </Link>

          <div className="flex w-20 items-center justify-end gap-0.5">
            <Link
              href="/search"
              className="flex h-10 w-10 items-center justify-center text-ink active:bg-slate-100"
              aria-label="検索"
            >
              <SearchIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/bakusoq"
              className="flex h-10 w-10 items-center justify-center text-ink active:bg-slate-100"
              aria-label="BAKUSOQ"
            >
              <BellIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* カテゴリタブ（黒アンダーライン） */}
        <div className="border-b border-slate-200">
          <nav
            className="flex h-11 items-stretch gap-0 overflow-x-auto px-2 scrollbar-none"
            aria-label="カテゴリー"
          >
            <TabLink href="/" active={isTop}>
              トップ
            </TabLink>
            {primary.map((c) => (
              <TabLink
                key={c.slug}
                href={`/category/${c.slug}`}
                active={activeCategory === c.slug}
              >
                {c.name}
              </TabLink>
            ))}
            <TabLink
              href="/articles"
              active={pathname === "/articles"}
            >
              記事一覧
            </TabLink>
          </nav>
        </div>
      </header>

      <SiteMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ========== デスクトップ：既存の日経ライクヘッダー ========== */}
      <header className="sticky top-0 z-30 hidden bg-white md:block">
        <div className="border-b border-slate-200">
          <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
            <div className="justify-self-start">
              <Link
                href="/search"
                className="flex w-full max-w-64 items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-navy-600"
              >
                <SearchIcon className="h-4 w-4" />
                <span>記事を検索</span>
              </Link>
            </div>

            <Link href="/" className="justify-self-center text-center">
              <span className="block font-serif text-2xl font-bold tracking-wide text-navy-800">
                {SITE_NAME}
              </span>
              <span className="block text-[10px] tracking-widest text-slate-500">
                運営：GENBABOXX
              </span>
            </Link>

            <div className="flex items-center justify-self-end gap-2">
              <Link
                href="/contact"
                className="rounded bg-brand-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-700"
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

            <div className="ml-auto flex items-center gap-2">
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
    </>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex shrink-0 items-center px-3.5 text-[14px] whitespace-nowrap transition-colors ${
        active
          ? "font-bold text-ink"
          : "font-medium text-slate-400 active:text-ink"
      }`}
    >
      {children}
      {active && (
        <span
          aria-hidden
          className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-ink"
        />
      )}
    </Link>
  );
}
