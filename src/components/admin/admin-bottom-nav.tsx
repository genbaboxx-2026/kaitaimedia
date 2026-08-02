"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArticleIcon,
  GridIcon,
  HistoryIcon,
  HomeIcon,
  HomeIconFilled,
  SettingsIcon,
} from "@/components/site/nav-icons";

const ITEMS = [
  {
    href: "/admin/articles",
    label: "記事",
    match: (p: string) =>
      p.startsWith("/admin/articles") && !p.includes("published"),
    Icon: HomeIcon,
    ActiveIcon: HomeIconFilled,
  },
  {
    href: "/admin/published",
    label: "公開",
    match: (p: string) => p.startsWith("/admin/published"),
    Icon: ArticleIcon,
    ActiveIcon: ArticleIcon,
  },
  {
    href: "/admin/generation",
    label: "生成",
    match: (p: string) => p.startsWith("/admin/generation"),
    Icon: SettingsIcon,
    ActiveIcon: SettingsIcon,
  },
  {
    href: "/admin/logs",
    label: "履歴",
    match: (p: string) => p.startsWith("/admin/logs"),
    Icon: HistoryIcon,
    ActiveIcon: HistoryIcon,
  },
  {
    href: "/",
    label: "サイト",
    match: () => false,
    Icon: GridIcon,
    ActiveIcon: GridIcon,
    external: true,
  },
] as const;

export function AdminBottomNav() {
  const pathname = usePathname();
  // 記事編集中は保存バー優先のためボトムナビを隠す
  const hideOnEdit = /^\/admin\/articles\/[^/]+$/.test(pathname);

  if (hideOnEdit) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="管理メニュー"
    >
      <ul className="mx-auto grid h-14 max-w-lg grid-cols-5">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = active && item.ActiveIcon ? item.ActiveIcon : item.Icon;
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                target={"external" in item && item.external ? "_blank" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
                  active ? "text-navy-800" : "text-slate-400"
                }`}
              >
                <Icon className="h-[22px] w-[22px]" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
