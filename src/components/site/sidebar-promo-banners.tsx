import { ArrowIcon } from "@/components/site/icons";

const NINKUBOXX_URL = "https://genbaboxx.co.jp/ninkuboxx";

/** サイドバー：BAKUSOQ 案内（押下で紹介モーダルを表示） */
export { BakusoqSidebarBanner } from "@/components/site/bakusoq-modal";

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M9 11a3 3 0 100-6 3 3 0 000 6zM15.5 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3.5 19c.6-2.4 2.7-4 5.5-4s4.9 1.6 5.5 4M14 15c1.8.2 3.4 1.2 4.2 2.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** サイドバー：NiNKUBOXX 案内 */
export function NinkuboxxSidebarBanner() {
  return (
    <a
      href={NINKUBOXX_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-xl border border-sky-300/30 bg-gradient-to-b from-[#1a4f9c] via-[#123a75] to-[#0b2f66] p-5 shadow-[0_8px_28px_rgba(18,58,117,0.28)] transition-transform hover:-translate-y-0.5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(125,211,252,0.35), transparent 45%), radial-gradient(circle at 85% 10%, rgba(56,189,248,0.25), transparent 40%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 h-24 w-[120%] -translate-x-1/2 rounded-full bg-sky-300/20 blur-2xl"
      />

      <div className="relative">
        <p className="text-[11px] font-bold tracking-[0.14em] text-sky-200">
          人事・等級・評価
        </p>
        <p className="mt-1 text-[18px] font-black tracking-tight text-white drop-shadow-[0_0_12px_rgba(125,211,252,0.35)]">
          NiNKU BOXX
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-sky-50/90">
          解体業に特化した等級・評価制度。定着と成長を見える化します。
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/25 bg-white/90 px-2.5 py-2 shadow-sm backdrop-blur">
            <PeopleIcon className="h-4 w-4 text-sky-600" />
            <p className="mt-1 text-[10px] font-bold text-slate-800">等級制度</p>
          </div>
          <div className="rounded-lg border border-white/25 bg-white/90 px-2.5 py-2 shadow-sm backdrop-blur">
            <ChartIcon className="h-4 w-4 text-sky-600" />
            <p className="mt-1 text-[10px] font-bold text-slate-800">評価の見える化</p>
          </div>
        </div>

        <span className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-400 to-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-[0_0_16px_rgba(56,189,248,0.35)] group-hover:brightness-110">
          NiNKUBOXXを見る
          <ArrowIcon className="h-4 w-4" />
        </span>
      </div>
    </a>
  );
}
