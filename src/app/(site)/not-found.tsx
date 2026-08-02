import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-semibold text-navy-700">404</p>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">
        ページが見つかりません
      </h1>
      <p className="mt-3 leading-relaxed text-slate-600">
        お探しのページは移動または削除された可能性があります。
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          ホームへ戻る
        </Link>
        <Link
          href="/articles"
          className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-navy-700 hover:text-navy-700"
        >
          記事一覧を見る
        </Link>
      </div>
    </div>
  );
}
