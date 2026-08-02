import Link from "next/link";
import { CATEGORIES, OPERATOR_NAME, SITE_NAME } from "@/lib/dummy-data";

const NAV_LINKS = [
  { href: "/articles", label: "記事一覧" },
  { href: "/company", label: "運営会社" },
  { href: "/bakusoq", label: "BAKUSOQ紹介" },
  { href: "/contact", label: "お問い合わせ" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/terms", label: "利用規約" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-navy-800 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-base font-bold text-white">
              {SITE_NAME}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              解体業界の実務者向けに、見積もり・原価管理・法改正などの実務情報をお届けします。
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500">
              カテゴリー
            </p>
            <ul className="mt-3 space-y-2">
              {CATEGORIES.slice(0, 7).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500">
              &nbsp;
            </p>
            <ul className="mt-3 space-y-2">
              {CATEGORIES.slice(7).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500">
              サイト情報
            </p>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-400">
          <p>
            当メディアの記事には、生成AIを用いて作成し、品質チェックを経て公開しているものが含まれます。
          </p>
          <p className="mt-2">© {OPERATOR_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
