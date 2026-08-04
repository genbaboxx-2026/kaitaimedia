import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/site-url";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = {
  title: "運営会社",
  description:
    "株式会社GENBA BOXXの会社概要・事業内容と、解体ナレッジの編集方針をご紹介します。",
  alternates: { canonical: `${SITE_URL}/company` },
};

const COMPANY_PROFILE: { label: string; value: ReactNode }[] = [
  { label: "会社名", value: "株式会社GENBA BOXX" },
  { label: "代表者", value: "代表取締役 桑原 優太" },
  { label: "設立", value: "2019年6月" },
  { label: "所在地", value: "東京都千代田区丸の内2丁目2-1" },
  {
    label: "事業内容",
    value:
      "建設業向けシステムの開発・提供、人事制度・採用支援、業務改善支援、専門メディアの運営",
  },
  {
    label: "運営サービス",
    value: "解体見積もり・原価計算システム「BAKUSOQ」、人事・採用支援「NiNKU BOXX」",
  },
  {
    label: "お問い合わせ",
    value: (
      <a
        href="mailto:support@genbaboxx.co.jp"
        className="text-navy-700 underline-offset-2 hover:underline"
      >
        support@genbaboxx.co.jp
      </a>
    ),
  },
];

export default function CompanyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumbs
        items={[{ label: "ホーム", href: "/" }, { label: "運営会社" }]}
      />

      <h1 className="mt-4 text-2xl font-bold text-slate-900">運営会社</h1>
      <div className="mt-3 space-y-3 leading-relaxed text-slate-600">
        <p>
          「解体ナレッジ」は、株式会社GENBA&nbsp;BOXXが運営する、解体業界の経営者・現場担当者・見積担当者に向けた専門メディアです。
        </p>
        <p>
          解体工事の見積もりや原価管理、工程、人員、産業廃棄物、アスベスト、法令・許認可など、解体業務に関わる実務情報を分かりやすく発信しています。
        </p>
      </div>

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

      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">GENBA BOXXについて</h2>
        <div className="mt-4 space-y-3 leading-relaxed text-slate-600">
          <p>
            株式会社GENBA&nbsp;BOXXは、「建設業を魅力ある業界へ」を掲げ、建設会社の生産性向上を支援しています。
          </p>
          <p>
            建設業界では、見積もり、原価管理、人員配置、採用、人事評価など、多くの業務が担当者の経験や感覚に依存しています。
          </p>
          <p>
            GENBA&nbsp;BOXXは、こうした業務を仕組み化・データ化することで、会社ごとの属人性やばらつきを減らし、働く人の生産性と待遇の向上につなげることを目指しています。
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">事業内容</h2>

        <div className="mt-6">
          <h3 className="text-base font-bold text-slate-900">
            解体見積もり・原価計算システム「BAKUSOQ」
          </h3>
          <div className="mt-3 space-y-3 leading-relaxed text-slate-600">
            <p>解体工事の見積もり作成を支援するシステムです。</p>
            <p>
              工事内容や建物情報を入力することで、必要な人工、重機、工期、産業廃棄物量、運搬費、処分費などを算出し、見積もり作成や原価管理の効率化を支援します。
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-base font-bold text-slate-900">
            建設会社向け人事・採用支援「NiNKU BOXX」
          </h3>
          <div className="mt-3 space-y-3 leading-relaxed text-slate-600">
            <p>
              建設会社に合わせた等級制度、評価制度、給与制度、採用体制の構築を支援しています。
            </p>
            <p>
              制度を作るだけでなく、現場で継続的に運用できる状態を目指してサポートしています。
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">
          解体ナレッジの編集方針
        </h2>
        <div className="mt-4 space-y-4 leading-relaxed text-slate-600">
          <p>
            解体ナレッジでは、解体業界で働く方が、日々の業務で活用できる情報を提供することを重視しています。
          </p>
          <p>
            記事の作成に生成AIを活用する場合がありますが、公開にあたっては、情報の確認、表現の調整、内容の審査を行います。
          </p>
          <p>
            法令、制度、許認可などに関する内容については、可能な限り公的機関や一次情報を案内します。
          </p>
          <p>
            数値を掲載する場合は、出典、算出条件、対象地域、調査時点を明記し、参考値として掲載します。
          </p>
          <p>
            ただし、掲載内容は一般的な情報提供を目的としたものであり、個別の工事、契約、法令判断などを保証するものではありません。具体的な判断が必要な場合は、行政機関や各分野の専門家へご確認ください。
          </p>
          <p>
            記載内容にお気づきの点がありましたら、support@genbaboxx.co.jp
            までご連絡ください。継続的に改善してまいります。
          </p>
        </div>
      </section>
    </div>
  );
}
