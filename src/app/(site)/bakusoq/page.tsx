import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-url";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = {
  title: "BAKUSOQ紹介",
  description:
    "解体工事の見積もり作成を支援するシステム BAKUSOQ の機能と導入メリットをご紹介します。",
  alternates: { canonical: `${SITE_URL}/bakusoq` },
};

const FEATURES: { title: string; body: string }[] = [
  {
    title: "拾い出しの効率化",
    body: "現地情報をもとにした拾い出しを支援し、入力の手戻りを減らします。",
  },
  {
    title: "内訳作成の標準化",
    body: "項目構成を整えることで、担当者ごとの見積もりのばらつきを抑えます。",
  },
  {
    title: "処分・運搬の整理",
    body: "分別と搬出の前提を整理し、後工程との食い違いを防ぎます。",
  },
  {
    title: "見積書の出力",
    body: "整えた内訳から見積書を出力し、提出までの流れをスムーズにします。",
  },
];

const MERITS: string[] = [
  "見積もり作成にかかる時間の短縮",
  "担当者による品質のばらつきの抑制",
  "条件・前提の記録による認識齟齬の防止",
];

export default function BakusoqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumbs
        items={[{ label: "ホーム", href: "/" }, { label: "BAKUSOQ紹介" }]}
      />

      <div className="mt-4">
        <p className="text-sm font-semibold text-brand-700">
          解体見積もりシステム
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          BAKUSOQ（バクソク）
        </h1>
        <p className="mt-4 leading-relaxed text-slate-600">
          BAKUSOQ は、解体工事の見積もり作成を支援するシステムです。拾い出しから内訳作成、見積書の出力までの実務を効率化します。
        </p>
      </div>

      {/* 機能 */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">主な機能</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <p className="font-bold text-slate-900">{f.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 導入メリット */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">導入のメリット</h2>
        <ul className="mt-4 space-y-3">
          {MERITS.map((m) => (
            <li
              key={m}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
            >
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white"
              >
                ✓
              </span>
              <span className="text-sm leading-relaxed text-slate-700">{m}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 資料請求導線 */}
      <section className="mt-10 rounded-lg border border-brand-100 bg-brand-50 p-6 text-center">
        <p className="text-lg font-bold text-slate-900">
          BAKUSOQの資料請求・お問い合わせ
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          導入のご相談や資料のご請求は、お問い合わせフォームより承ります。
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex items-center rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          お問い合わせ・資料請求
          <span aria-hidden className="ml-1">
            →
          </span>
        </Link>
      </section>
    </div>
  );
}
