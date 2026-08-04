"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, SITE_NAME } from "@/lib/dummy-data";
import { MailIcon, SearchIcon } from "@/components/site/icons";
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

          <Link href="/" className="min-w-0 px-1" aria-label={SITE_NAME}>
            <SiteLogo compact className="mx-auto" />
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

        <div className="border-b border-slate-200">
          <nav
            className="flex h-11 items-stretch gap-0 overflow-x-auto px-2 scrollbar-none"
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

      {/* ========== デスクトップ：ポータル風ヘッダー ========== */}
      <header className="sticky top-0 z-30 hidden border-b border-slate-200/80 bg-white/95 backdrop-blur md:block">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-6 px-4 lg:px-6">
          <Link
            href="/"
            className="shrink-0"
            aria-label={`${SITE_NAME} — 解体業界の今と未来をつなぐメディア`}
          >
            <SiteLogo />
          </Link>

          <Link
            href="/search"
            className="mx-auto flex h-11 w-full max-w-md items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-400 transition-colors hover:border-navy-600 hover:bg-white"
          >
            <SearchIcon className="h-4 w-4 shrink-0" />
            <span>記事を検索</span>
          </Link>

          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <MailIcon className="h-4 w-4" />
            お問い合わせ
          </Link>
        </div>

        <nav
          className="border-t border-slate-100"
          aria-label="メインナビゲーション"
        >
          <div className="mx-auto flex h-12 max-w-7xl items-stretch gap-0.5 overflow-x-auto px-4 lg:px-6">
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
      className={`relative flex shrink-0 items-center px-3 text-[13px] whitespace-nowrap transition-colors lg:px-3.5 lg:text-sm ${
        active
          ? "font-bold text-navy-800"
          : "font-medium text-slate-500 hover:text-navy-700"
      }`}
    >
      {children}
      {active && (
        <span
          aria-hidden
          className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-navy-700"
        />
      )}
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
