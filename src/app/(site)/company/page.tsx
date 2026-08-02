import type { Metadata } from "next";
import { OPERATOR_NAME } from "@/lib/dummy-data";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = {
  title: "運営会社",
  description: `${OPERATOR_NAME}の会社概要・事業内容と、本メディアの編集方針をご紹介します。`,
};

const COMPANY_PROFILE: { label: string; value: string }[] = [
  { label: "会社名", value: "株式会社GENBABOXX（ダミー表記）" },
  { label: "所在地", value: "（設定予定）" },
  { label: "代表者", value: "（設定予定）" },
  { label: "設立", value: "（設定予定）" },
  { label: "事業内容", value: "解体見積もりシステム BAKUSOQ の開発・提供" },
  { label: "お問い合わせ", value: "support@genbaboxx.co.jp" },
];

export default function CompanyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumbs
        items={[{ label: "ホーム", href: "/" }, { label: "運営会社" }]}
      />

      <h1 className="mt-4 text-2xl font-bold text-slate-900">運営会社</h1>
      <p className="mt-3 leading-relaxed text-slate-600">
        本メディアは {OPERATOR_NAME}
        が運営する、解体業界の実務者向け専門メディアです。監修者は置かず、運営会社として編集責任を負います。
      </p>

      {/* 会社概要 */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">会社概要</h2>
        <dl className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {COMPANY_PROFILE.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-4"
            >
              <dt className="text-sm font-semibold text-slate-500">
                {row.label}
              </dt>
              <dd className="text-sm text-slate-800 sm:col-span-3">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 事業内容 */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">事業内容</h2>
        <p className="mt-4 leading-relaxed text-slate-600">
          解体工事の見積もり作成を支援するシステム「BAKUSOQ」を開発・提供しています。拾い出しから内訳作成までの実務を効率化し、担当者ごとのばらつきを抑えることを目指しています。
        </p>
      </section>

      {/* 開発・導入実績 */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">開発・導入実績</h2>
        <p className="mt-4 leading-relaxed text-slate-600">
          解体・建設分野の事業者向けに、見積もり業務の実務に即したシステムを開発してきました（具体的な実績は掲載準備中です）。
        </p>
      </section>

      {/* 編集方針（要件 4.3：権威性の担保） */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">本メディアの編集方針</h2>
        <div className="mt-4 space-y-4 leading-relaxed text-slate-600">
          <p>
            本メディアの記事の一部は、生成AIを用いて作成しています。公開にあたっては、次の品質管理を経ています。
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              金額・単価・重量・割合・断定的な工期日数などの具体的な数値は、原則として記載しません。事実と異なる数値の混入を構造的に防ぐためです。
            </li>
            <li>
              公開前に、機械判定（数値・禁止表現・文字数・リンクなど）と、過去記事との重複判定、文章品質の確認を行っています。
            </li>
            <li>
              制度・法令に関する内容は、公的な一次情報の出典を併記することを基本としています。
            </li>
          </ul>
          <p>
            記載内容にお気づきの点がありましたら、お問い合わせよりご連絡ください。継続的に改善してまいります。
          </p>
        </div>
      </section>
    </div>
  );
}
