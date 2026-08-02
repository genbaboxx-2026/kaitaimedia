"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/admin/sign-out-button";

const TITLES: { match: (p: string) => boolean; title: string; back?: string }[] =
  [
    {
      match: (p) => /^\/admin\/articles\/[^/]+$/.test(p),
      title: "記事編集",
      back: "/admin/articles",
    },
    {
      match: (p) => p.startsWith("/admin/articles"),
      title: "記事管理",
    },
    {
      match: (p) => p.startsWith("/admin/published"),
      title: "公開記事",
    },
    {
      match: (p) => p.startsWith("/admin/generation"),
      title: "生成条件",
    },
    {
      match: (p) => p.startsWith("/admin/logs"),
      title: "生成履歴",
    },
  ];

export function AdminMobileHeader() {
  const pathname = usePathname();
  const current =
    TITLES.find((t) => t.match(pathname)) ?? {
      title: "管理コンソール",
      match: () => true,
    };

  return (
    <header
      className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md md:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-12 items-center gap-2 px-3">
        {current.back ? (
          <Link
            href={current.back}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink active:bg-slate-100"
            aria-label="戻る"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
              aria-hidden
            >
              <path
                d="M15 18l-6-6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ) : (
          <span className="w-9" />
        )}

        <h1 className="min-w-0 flex-1 truncate text-center text-[15px] font-black tracking-wide text-ink">
          {current.title}
        </h1>

        <div className="flex w-auto shrink-0 justify-end">
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
