import type { Metadata } from "next";
import { OPERATOR_NAME } from "@/lib/dummy-data";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: `${OPERATOR_NAME}のプライバシーポリシー（個人情報の取り扱いについて）。`,
};

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "1. 個人情報の取得",
    body: "当メディアは、お問い合わせフォームの利用時などに、お名前・会社名・メールアドレス・お問い合わせ内容などの個人情報を取得することがあります。",
  },
  {
    heading: "2. 利用目的",
    body: "取得した個人情報は、お問い合わせへの回答、資料の送付、サービスのご案内、および品質向上のための分析に利用します。",
  },
  {
    heading: "3. 第三者提供",
    body: "法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供することはありません。",
  },
  {
    heading: "4. アクセス解析",
    body: "当メディアでは、利用状況の把握のためにアクセス解析ツールを利用することがあります。取得される情報に個人を特定するものは含まれません。",
  },
  {
    heading: "5. 開示・訂正・削除",
    body: "ご本人からの個人情報の開示・訂正・削除のご請求には、本人確認のうえ、法令に従い対応します。",
  },
  {
    heading: "6. 改定",
    body: "本ポリシーの内容は、法令の変更等に応じて予告なく改定することがあります。",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumbs
        items={[{ label: "ホーム", href: "/" }, { label: "プライバシーポリシー" }]}
      />

      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        プライバシーポリシー
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        {OPERATOR_NAME}（以下「当社」）は、当メディアにおける個人情報の取り扱いについて、以下のとおり定めます。
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
