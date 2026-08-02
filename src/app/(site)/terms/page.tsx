import type { Metadata } from "next";
import { OPERATOR_NAME, SITE_NAME } from "@/lib/dummy-data";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = {
  title: "利用規約",
  description: `${SITE_NAME}の利用規約。`,
};

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "1. 適用",
    body: "本規約は、当メディアの提供する情報・サービスの利用に関する条件を、利用者と当社との間で定めるものです。",
  },
  {
    heading: "2. 情報の位置づけ",
    body: "当メディアの記事は、実務の判断材料の提供を目的とした一般的な情報であり、個別の案件に対する助言を保証するものではありません。実際の判断は、最新の法令・制度および専門家の確認のうえで行ってください。",
  },
  {
    heading: "3. 生成AIの利用",
    body: "記事の一部は生成AIを用いて作成し、当社の品質チェックを経て公開しています。内容の正確性には努めていますが、その完全性を保証するものではありません。",
  },
  {
    heading: "4. 禁止事項",
    body: "利用者は、当メディアの運営を妨げる行為、第三者の権利を侵害する行為、法令に違反する行為を行ってはなりません。",
  },
  {
    heading: "5. 免責",
    body: "当メディアの情報の利用によって生じた損害について、当社は法令の認める範囲で責任を負いません。",
  },
  {
    heading: "6. 著作権",
    body: "当メディアに掲載されたコンテンツの著作権は、当社または正当な権利者に帰属します。無断転載を禁じます。",
  },
  {
    heading: "7. 規約の変更",
    body: "本規約は、必要に応じて予告なく変更することがあります。変更後の利用をもって、変更に同意したものとみなします。",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumbs
        items={[{ label: "ホーム", href: "/" }, { label: "利用規約" }]}
      />

      <h1 className="mt-4 text-2xl font-bold text-slate-900">利用規約</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        {OPERATOR_NAME}（以下「当社」）が運営する{SITE_NAME}（以下「当メディア」）の利用にあたっては、以下の規約に同意いただいたものとします。
      </p>

      <div className="mt-8 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.heading}>
            <h2 className="text-base font-bold text-slate-900">{s.heading}</h2>
            <p className="mt-2 leading-relaxed text-slate-600">{s.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-slate-400">
        ※ 本ページはダミーの雛形です。公開前に正式な内容へ差し替えてください。
      </p>
    </div>
  );
}
