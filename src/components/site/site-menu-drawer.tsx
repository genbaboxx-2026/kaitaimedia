"use client";

import Link from "next/link";
import { CATEGORIES, SITE_NAME } from "@/lib/dummy-data";
import { CloseIcon } from "@/components/site/nav-icons";

const LINKS = [
  { href: "/news", label: "ニュース" },
  { href: "/articles", label: "記事一覧" },
  { href: "/bakusoq", label: "BAKUSOQ紹介" },
  { href: "/company", label: "運営会社" },
  { href: "/contact", label: "お問い合わせ" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/terms", label: "利用規約" },
];

export function SiteMenuDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="メニューを閉じる"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <nav
        className={`absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="サイトメニュー"
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
          <span className="text-[15px] font-bold tracking-wide text-ink">
            {SITE_NAME}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink active:bg-slate-100"
            aria-label="閉じる"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
          <p className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400">
            カテゴリー
          </p>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-3 text-[15px] font-medium text-ink active:bg-slate-50"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-3 border-t border-slate-100" />

          <p className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400">
            サイト情報
          </p>
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-3 text-[15px] font-medium text-ink active:bg-slate-50"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
