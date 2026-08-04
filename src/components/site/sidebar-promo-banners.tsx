import { ArrowIcon } from "@/components/site/icons";

const NINKUBOXX_URL = "https://genbaboxx.co.jp/ninkuboxx";

/** サイドバー：BAKUSOQ 案内（押下で紹介モーダルを表示） */
export { BakusoqSidebarBanner } from "@/components/site/bakusoq-modal";

/** サイドバー：NiNKUBOXX 案内 */
export function NinkuboxxSidebarBanner() {
  return (
    <div className="rounded-lg border border-slate-200 p-5">
      <p className="font-serif text-lg font-bold leading-snug text-slate-900">
        解体屋の等級制度・評価制度にお困りではないですか？
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        制度対応の整理から運用まで。解体業に特化したサポートをご案内します。
      </p>
      <a
        href={NINKUBOXX_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded bg-navy-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-600"
      >
        NiNKUBOXXを見る
        <ArrowIcon className="h-4 w-4" />
      </a>
    </div>
  );
}
