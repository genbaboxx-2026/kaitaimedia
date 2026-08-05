"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, SITE_NAME } from "@/lib/dummy-data";
import { SearchIcon } from "@/components/site/icons";
import { BellIcon, MenuIcon } from "@/components/site/nav-icons";
import { SiteMenuDrawer } from "@/components/site/site-menu-drawer";
import { SiteLogo } from "@/components/site/site-logo";

/** ヘッダーに出す統合カテゴリ（CATEGORIES 全件） */
const PRIMARY_CATEGORY_SLUGS = [
  "estimate",
  "schedule",
  "field",
  "waste",
  "law",
  "management",
  "industry",
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const primary = PRIMARY_CATEGORY_SLUGS.map((slug) =>
    CATEGORIES.find((c) => c.slug === slug),
  ).filter((c): c is (typeof CATEGORIES)[number] => Boolean(c));

  const isTop = pathname === "/";
  const isNews = pathname === "/news" || pathname.startsWith("/news/");
  const isArticles = pathname === "/articles" || pathname.startsWith("/articles/");
  const activeCategory = pathname.startsWith("/category/")
    ? pathname.split("/")[2]
    : null;

  return (
    <>
      {/* ========== モバイル ========== */}
      <header className="sticky top-0 z-30 border-b border-brand-100 bg-white md:hidden">
        <div
          className="flex h-12 items-center justify-between bg-white px-2"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex w-20 items-center">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-navy-800 active:bg-brand-50"
              aria-label="メニューを開く"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>

          <Link href="/" className="min-w-0 px-1" aria-label={SITE_NAME}>
            <SiteLogo compact className="mx-auto" />
          </Link>

          <div className="flex w-20 items-center justify-end gap-0.5">
            <Link
              href="/search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-navy-800 active:bg-brand-50"
              aria-label="検索"
            >
              <SearchIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/bakusoq"
              className="flex h-10 w-10 items-center justify-center rounded-full text-brand-600 active:bg-brand-50"
              aria-label="BAKUSOQ"
            >
              <BellIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="border-t border-brand-50 bg-white">
          <nav
            className="flex h-12 items-center gap-1.5 overflow-x-auto px-2.5 scrollbar-none"
            aria-label="カテゴリー"
          >
            <TabLink href="/" active={isTop}>
              トップ
            </TabLink>
            <TabLink href="/news" active={isNews}>
              ニュース
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
            <TabLink href="/articles" active={pathname === "/articles"}>
              記事一覧
            </TabLink>
          </nav>
        </div>
      </header>

      <SiteMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ========== デスクトップ ========== */}
      <header className="sticky top-0 z-50 hidden md:block">
        <div className="border-b border-brand-100 bg-gradient-to-b from-brand-50 via-white to-white">
          <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center gap-6 px-4 lg:px-6">
            <Link
              href="/"
              className="relative z-10 shrink-0"
              aria-label={`${SITE_NAME} — 解体業界の今と未来をつなぐメディア`}
            >
              <SiteLogo />
            </Link>

            <form
              action="/search"
              method="get"
              className="relative z-10 ml-auto flex h-11 w-full max-w-md items-center gap-2.5 rounded-full border-2 border-brand-100 bg-white px-4 shadow-sm transition-colors focus-within:border-brand-500 focus-within:shadow-[0_0_0_3px_rgba(22,116,232,0.12)]"
            >
              <SearchIcon className="h-4 w-4 shrink-0 text-brand-500" />
              <input
                type="search"
                name="q"
                placeholder="記事を検索"
                aria-label="記事を検索"
                className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </form>
          </div>
        </div>

        <nav
          className="relative z-10 border-b border-brand-100 bg-white"
          aria-label="メインナビゲーション"
        >
          <div className="mx-auto flex h-[3.25rem] max-w-7xl items-center gap-1 px-3 lg:gap-1.5 lg:px-6">
            <DesktopNavLink href="/" active={isTop}>
              トップ
            </DesktopNavLink>
            <DesktopNavLink href="/news" active={isNews}>
              ニュース
            </DesktopNavLink>
            {primary.map((c) => (
              <DesktopNavLink
                key={c.slug}
                href={`/category/${c.slug}`}
                active={activeCategory === c.slug}
              >
                {c.name}
              </DesktopNavLink>
            ))}
            <DesktopNavLink href="/articles" active={isArticles && !activeCategory}>
              記事一覧
            </DesktopNavLink>
          </div>
        </nav>
      </header>
    </>
  );
}

function DesktopNavLink({
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
      className={`relative z-10 flex h-9 flex-1 cursor-pointer items-center justify-center rounded-full px-1 text-[12px] whitespace-nowrap transition-all lg:px-2 lg:text-[13px] ${
        active
          ? "bg-brand-500 font-black text-white shadow-[0_4px_12px_rgba(22,116,232,0.28)]"
          : "font-bold text-slate-500 hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      {children}
    </Link>
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
      className={`relative flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] whitespace-nowrap transition-all ${
        active
          ? "bg-brand-500 font-black text-white shadow-sm"
          : "font-bold text-slate-500 active:bg-brand-50 active:text-brand-700"
      }`}
    >
      {children}
    </Link>
  );
}
