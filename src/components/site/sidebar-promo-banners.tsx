import Link from "next/link";
import { ArrowIcon } from "@/components/site/icons";

const NINKUBOXX_URL = "https://genbaboxx.co.jp/ninkuboxx";

/** サイドバー：BAKUSOQ 案内バナー */
export function BakusoqSidebarBanner() {
  return (
    <Link
      href="/bakusoq"
      className="group relative block overflow-hidden rounded-xl bg-gradient-to-br from-navy-800 via-navy-700 to-[#163a6e] p-5 text-white shadow-sm ring-1 ring-navy-800/40 transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-brand-500/20 blur-2xl transition duration-500 group-hover:bg-brand-500/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent"
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold tracking-[0.18em] text-brand-100">
            解体見積もりシステム
          </p>
          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white/90 ring-1 ring-white/15">
            AD
          </span>
        </div>

        <p className="mt-3 font-sans text-[1.65rem] font-black leading-none tracking-tight">
          BAKUSOQ
        </p>
        <p className="mt-3 text-[15px] font-bold leading-snug text-white">
          見積もり作成を、
          <br />
          もっと速く正確に。
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-white/75">
          拾い出しから内訳作成まで。手戻りとばらつきを抑えます。
        </p>

        <span className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition-colors group-hover:bg-brand-500">
          資料を見る
          <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/** サイドバー：NiNKUBOXX バナー広告 */
export function NinkuboxxSidebarBanner() {
  return (
    <a
      href={NINKUBOXX_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-xl bg-gradient-to-br from-[#1a2332] via-[#243044] to-[#1e3d3a] p-5 text-white shadow-sm ring-1 ring-slate-800/50 transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-emerald-400/15 blur-2xl transition duration-500 group-hover:bg-emerald-400/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-200/90">
            等級・評価制度
          </p>
          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white/90 ring-1 ring-white/15">
            AD
          </span>
        </div>

        <p className="mt-3 font-sans text-[1.45rem] font-black leading-none tracking-tight">
          NiNKUBOXX
        </p>
        <p className="mt-3 text-[15px] font-bold leading-snug text-white">
          解体屋の等級制度・評価制度に
          <br />
          お困りではないですか？
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-white/75">
          制度対応の整理から運用まで。解体業に特化したサポートをご案内します。
        </p>

        <span className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition-colors group-hover:bg-emerald-400">
          詳しく見る
          <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </a>
  );
}
