"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArticleIcon,
  GridIcon,
  HomeIcon,
  HomeIconFilled,
} from "@/components/site/nav-icons";

const ITEMS = [
  {
    href: "/",
    label: "ホーム",
    match: (p: string) => p === "/",
    Icon: HomeIcon,
    ActiveIcon: HomeIconFilled,
  },
  {
    href: "/news",
    label: "ニュース",
    match: (p: string) => p.startsWith("/news"),
    Icon: GridIcon,
    ActiveIcon: GridIcon,
  },
  {
    href: "/articles",
    label: "記事",
    match: (p: string) => p.startsWith("/articles") || p.startsWith("/category"),
    Icon: ArticleIcon,
    ActiveIcon: ArticleIcon,
  },
] as const;

export function SiteBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-white/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="メインメニュー"
    >
      <ul className="mx-auto grid h-14 max-w-lg grid-cols-3">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = active && item.ActiveIcon ? item.ActiveIcon : item.Icon;
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[10px] ${
                  active
                    ? "font-black text-brand-600"
                    : "font-bold text-slate-400"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    active ? "bg-brand-50" : ""
                  }`}
                >
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
