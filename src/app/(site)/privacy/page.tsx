import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "株式会社GENBA BOXXが運営するウェブメディア「解体ナレッジ」のプライバシーポリシーです。",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "ホーム", href: "/" },
          { label: "プライバシーポリシー" },
        ]}
      />

      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        プライバシーポリシー
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        株式会社GENBA&nbsp;BOXX（以下「当社」といいます。）は、当社が運営するウェブメディア「解体ナレッジ」（以下「本メディア」といいます。）において取得する個人情報その他の情報について、以下のとおりプライバシーポリシーを定め、適切に取り扱います。
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600">
        <section>
          <h2 className="text-base font-bold text-slate-900">
            1．個人情報の定義
          </h2>
          <p className="mt-2">
            本ポリシーにおける「個人情報」とは、氏名、住所、電話番号、メールアドレス、勤務先その他の記述等により、特定の個人を識別できる情報をいいます。
          </p>
          <p className="mt-2">
            また、他の情報と容易に照合することによって特定の個人を識別できる情報も含みます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            2．取得する情報
          </h2>
          <p className="mt-2">
            当社は、本メディアの運営にあたり、以下の情報を取得することがあります。
          </p>

          <h3 className="mt-4 font-bold text-slate-800">
            お問い合わせ時に取得する情報
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>氏名</li>
            <li>会社名</li>
            <li>メールアドレス</li>
            <li>お問い合わせ種別</li>
            <li>お問い合わせ内容</li>
            <li>その他、お問い合わせフォームに入力された情報</li>
          </ul>
          <p className="mt-2">
            なお、お問い合わせはメール（support@genbaboxx.co.jp）でも受け付けます。その場合も、返信およびご案内に必要な範囲で同様の情報を取得することがあります。
          </p>

          <h3 className="mt-4 font-bold text-slate-800">
            本メディアの利用時に自動的に取得する情報
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>IPアドレス</li>
            <li>Cookieその他の識別情報</li>
            <li>使用している端末、ブラウザおよびOSに関する情報</li>
            <li>閲覧したページ</li>
            <li>閲覧日時</li>
            <li>参照元ページ</li>
            <li>本メディア内での操作履歴</li>
            <li>その他、アクセス解析によって取得される情報</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            3．個人情報の利用目的
          </h2>
          <p className="mt-2">
            当社は、取得した情報を以下の目的で利用します。
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>お問い合わせ、ご相談およびご依頼への回答</li>
            <li>資料の送付および必要なご連絡</li>
            <li>当社の商品、サービスおよび関連サービスの案内</li>
            <li>本メディアの運営、維持および改善</li>
            <li>本メディアの利用状況の把握および分析</li>
            <li>新しい記事、コンテンツ、商品またはサービスの企画および開発</li>
            <li>不正利用、迷惑行為、セキュリティ上の問題の防止および対応</li>
            <li>利用規約その他のルールに違反する行為への対応</li>
            <li>法令上必要な対応</li>
            <li>上記の利用目的に付随する目的</li>
          </ol>
          <p className="mt-2">
            当社は、個人情報を取得した際に示した利用目的またはこれと合理的な関連性を有する範囲を超えて利用する場合、法令により認められる場合を除き、あらかじめ本人の同意を得ます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            4．個人情報の第三者提供
          </h2>
          <p className="mt-2">
            当社は、次の場合を除き、本人の同意なく個人データを第三者に提供しません。
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>法令に基づく場合</li>
            <li>
              人の生命、身体または財産の保護に必要であり、本人の同意を得ることが困難な場合
            </li>
            <li>
              公衆衛生の向上または児童の健全な育成の推進に特に必要であり、本人の同意を得ることが困難な場合
            </li>
            <li>
              国の機関、地方公共団体またはその委託を受けた者が、法令に定める事務を遂行することに協力する必要があり、本人の同意を得ることで当該事務の遂行に支障を及ぼすおそれがある場合
            </li>
            <li>個人情報の取扱いを業務委託先に委託する場合</li>
            <li>
              合併、会社分割、事業譲渡その他の事由によって事業が承継される場合
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            5．個人情報の取扱いの委託
          </h2>
          <p className="mt-2">
            当社は、本メディアの運営、お問い合わせ対応、データの保管、アクセス解析その他の業務を、外部事業者へ委託することがあります。
          </p>
          <p className="mt-2">
            この場合、当社は委託先を適切に選定し、必要な契約を締結するとともに、個人情報が適切に取り扱われるよう必要かつ適切な監督を行います。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            6．アクセス解析ツールについて
          </h2>
          <p className="mt-2">
            本メディアでは、利用状況の把握および改善のため、Googleが提供するアクセス解析ツール「Google
            Analytics」を利用する場合があります。
          </p>
          <p className="mt-2">
            Google Analyticsは、Cookie等を利用して、本メディアの閲覧履歴、使用端末、ブラウザ、参照元、アクセス日時などの情報を収集します。
          </p>
          <p className="mt-2">
            Google Analytics
            4では、IPアドレスが地域情報の判定などに一時的に利用された後、データセンターに記録される前に破棄されるとGoogleは説明しています（
            <a
              href="https://support.google.com/analytics/answer/11598602?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-700 underline-offset-2 hover:underline"
            >
              Googleヘルプ
            </a>
            ）。
          </p>
          <p className="mt-2">
            Googleによる情報の取扱いについては、GoogleのプライバシーポリシーおよびGoogle
            Analyticsの利用規約をご確認ください。
          </p>
          <p className="mt-2">
            利用者は、ブラウザの設定によってCookieを無効にすることで、情報の収集を制限できます。ただし、Cookieを無効にした場合、本メディアの一部の機能が正常に利用できないことがあります。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            7．Cookie等の利用
          </h2>
          <p className="mt-2">
            本メディアでは、以下の目的でCookieその他の類似技術を利用することがあります。
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>本メディアの正常な動作</li>
            <li>利用者の利便性の向上</li>
            <li>アクセス状況および利用状況の分析</li>
            <li>コンテンツおよびサービスの改善</li>
            <li>不正アクセスおよび不正利用の防止</li>
          </ul>
          <p className="mt-2">
            Cookieとは、ウェブサイトの利用情報などを利用者のブラウザに保存する小さなデータです（
            <a
              href="https://policies.google.com/technologies/cookies?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-700 underline-offset-2 hover:underline"
            >
              Google による Cookie の利用方法
            </a>
            ）。
          </p>
          <p className="mt-2">
            利用者は、ブラウザの設定によりCookieの受入れを拒否したり、保存済みのCookieを削除したりできます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            8．外部リンクについて
          </h2>
          <p className="mt-2">
            本メディアには、外部のウェブサイトへのリンクが含まれる場合があります。
          </p>
          <p className="mt-2">
            リンク先のウェブサイトにおける個人情報その他の情報の取扱いについて、当社は責任を負いません。利用者ご自身で、リンク先のプライバシーポリシー等をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            9．個人情報の安全管理
          </h2>
          <p className="mt-2">
            当社は、取得した個人情報について、漏えい、滅失、毀損、不正アクセス、不正利用その他のリスクを防止するため、必要かつ適切な安全管理措置を講じます。
          </p>
          <p className="mt-2">
            また、個人情報を取り扱う従業者および業務委託先に対して、必要かつ適切な監督を行います。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            10．個人情報の保存期間
          </h2>
          <p className="mt-2">
            当社は、個人情報の利用目的を達成するために必要な期間、または法令上保存が必要な期間に限り、個人情報を保存します。
          </p>
          <p className="mt-2">
            個人情報を保有する必要がなくなった場合は、法令上保存が必要な場合を除き、適切な方法で削除または匿名化するよう努めます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            11．開示、訂正、利用停止および削除等
          </h2>
          <p className="mt-2">
            本人から、当社が保有する個人情報について、利用目的の通知、開示、訂正、追加、削除、利用停止、消去または第三者提供の停止等の請求があった場合、当社は本人確認を行ったうえで、法令に従い適切に対応します。
          </p>
          <p className="mt-2">
            なお、法令により開示等を行わないことが認められている場合は、ご希望に沿えないことがあります。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            12．未成年者の個人情報
          </h2>
          <p className="mt-2">
            未成年者が本メディアを通じて個人情報を提供する場合は、必要に応じて保護者の同意を得たうえで提供してください。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            13．法令等の遵守
          </h2>
          <p className="mt-2">
            当社は、個人情報の取扱いに関して適用される法令、個人情報保護委員会のガイドラインその他の規範を遵守します。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            14．プライバシーポリシーの変更
          </h2>
          <p className="mt-2">
            当社は、法令の改正、本メディアの内容または利用するサービスの変更等に応じて、本ポリシーを変更することがあります。
          </p>
          <p className="mt-2">
            重要な変更を行う場合は、本メディア上での掲載その他の適切な方法によってお知らせします。
          </p>
          <p className="mt-2">
            変更後のプライバシーポリシーは、本メディアに掲載した時点から効力を生じます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            15．お問い合わせ窓口
          </h2>
          <p className="mt-2">
            本ポリシーおよび個人情報の取扱いに関するお問い合わせは、以下の窓口までご連絡ください。
          </p>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="font-bold text-slate-800">事業者名</dt>
              <dd className="mt-0.5">株式会社GENBA&nbsp;BOXX</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-800">運営メディア</dt>
              <dd className="mt-0.5">解体ナレッジ</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-800">代表者</dt>
              <dd className="mt-0.5">代表取締役 桑原 優太</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-800">所在地</dt>
              <dd className="mt-0.5">東京都千代田区丸の内2丁目2-1</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-800">お問い合わせ先</dt>
              <dd className="mt-0.5">
                <a
                  href="mailto:support@genbaboxx.co.jp"
                  className="text-navy-700 underline-offset-2 hover:underline"
                >
                  support@genbaboxx.co.jp
                </a>
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <p className="mt-10 text-sm text-slate-500">制定日：2026年8月3日</p>
    </div>
  );
}
