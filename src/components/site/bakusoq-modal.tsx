"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowIcon } from "@/components/site/icons";

/* ============================================================
   BAKUSOQ 紹介モーダル
   提供モックを HTML/CSS で再現（画像ベタ貼りではない）
   ============================================================ */

const BAKUSOQ_HP_URL = "https://bakusoq-hp.vercel.app/";
const BAKUSOQ_LINE_URL =
  process.env.NEXT_PUBLIC_BAKUSOQ_LINE_URL || BAKUSOQ_HP_URL;

const WORRIES = [
  {
    n: "01",
    before: "まだ",
    highlight: "平米単価や坪単価",
    after: "で見積もりを作っていませんか？",
    pose: "think" as const,
  },
  {
    n: "02",
    before: "その単価、いつから",
    highlight: "前の単価",
    after: "を使っていますか？",
    pose: "laptop" as const,
  },
  {
    n: "03",
    before: "",
    highlight: "利益率",
    after: "が見えないまま、値引きしていませんか？",
    pose: "calc" as const,
  },
  {
    n: "04",
    before: "営業が入ったはいいけど、",
    highlight: "教育",
    after: "が難しくありませんか？",
    pose: "worry" as const,
  },
] as const;

const REASONS = [
  "現場ごとに条件が違いすぎる",
  "単価や原価の更新が後回しになる",
  "データが属人化し、共有しづらい",
  "新人が経験を積むには時間がかかる",
] as const;

const SOLUTIONS = [
  {
    title: "しっかり爆速",
    body: "見積もり作成を圧倒的なスピードでサポート！",
    icon: "rocket" as const,
  },
  {
    title: "原価を積み上げるので精度が高い",
    body: "すべての原価を積み上げるから、根拠のある見積もりが作れる！",
    icon: "blocks" as const,
  },
  {
    title: "解体経験がない営業でも作れる、成長が圧倒的",
    body: "誰でも使いこなせるから、新人も早く成長し即戦力に！",
    icon: "growth" as const,
  },
  {
    title: "根拠がわかるので見積もりチェックが早い",
    body: "根拠が明確だから、社内チェックや施主への説明もスムーズ！",
    icon: "checkdoc" as const,
  },
] as const;

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#FACC15"
        d="M12 1.5l1.8 6.2L20 9.5l-6.2 1.8L12 17.5l-1.8-6.2L4 9.5l6.2-1.8L12 1.5z"
      />
    </svg>
  );
}

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-black italic tracking-tight text-[#1677E6] ${className}`}
    >
      BAK
      <span className="relative inline-block px-[0.05em]">
        <span className="invisible">U</span>
        <svg
          viewBox="0 0 20 28"
          className="absolute left-1/2 top-[0.05em] h-[0.95em] w-auto -translate-x-1/2"
          aria-hidden
        >
          <path
            d="M11 1L3 15h6L8 27l9-16h-6L11 1z"
            fill="#1677E6"
            stroke="#fff"
            strokeWidth="1.2"
          />
        </svg>
      </span>
      SOQ
    </span>
  );
}

function PersonSvg({
  pose,
}: {
  pose: "think" | "laptop" | "calc" | "worry" | "worker";
}) {
  // フラットな人物イラスト（モックのトーンに合わせた簡易キャラ）
  if (pose === "worker") {
    return (
      <svg viewBox="0 0 160 140" className="h-full w-full" aria-hidden>
        <ellipse cx="110" cy="118" rx="42" ry="10" fill="#BFDBFE" opacity="0.7" />
        <rect x="20" y="70" width="90" height="40" rx="4" fill="#93C5FD" opacity="0.35" />
        <path d="M30 95 V55 h18 v12 h22 V45 h16 v50" fill="#60A5FA" opacity="0.35" />
        <path d="M95 55 l18-22 6 4-18 22z" fill="#3B82F6" opacity="0.4" />
        <circle cx="78" cy="48" r="16" fill="#FDE68A" />
        <path d="M58 48 h40 v-6 a20 12 0 0 0-40 0z" fill="#F8FAFC" />
        <rect x="54" y="62" width="48" height="40" rx="8" fill="#2563EB" />
        <rect x="62" y="70" width="32" height="18" rx="3" fill="#DBEAFE" />
        <circle cx="70" cy="46" r="1.4" fill="#1E293B" />
        <circle cx="86" cy="46" r="1.4" fill="#1E293B" />
        <path d="M72 52 q6 4 12 0" stroke="#1E293B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M48 78 q-10 4-14 16" stroke="#FDE68A" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  const prop =
    pose === "laptop" ? (
      <g>
        <rect x="78" y="72" width="34" height="22" rx="2" fill="#1E293B" />
        <rect x="80" y="74" width="30" height="16" rx="1" fill="#38BDF8" />
        <circle cx="108" cy="58" r="10" fill="#DBEAFE" />
        <path d="M108 52 v7 M108 52 a5 5 0 0 1 4 4" stroke="#2563EB" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    ) : pose === "calc" ? (
      <g>
        <rect x="86" y="68" width="22" height="28" rx="3" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.2" />
        <rect x="89" y="71" width="16" height="8" rx="1" fill="#94A3B8" />
        <circle cx="92" cy="86" r="1.5" fill="#64748B" />
        <circle cx="97" cy="86" r="1.5" fill="#64748B" />
        <circle cx="102" cy="86" r="1.5" fill="#64748B" />
        <path d="M112 56 c4-6 10-4 8 2" stroke="#64748B" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    ) : pose === "worry" ? (
      <g>
        <path d="M100 48 c6-2 10 2 8 8" stroke="#64748B" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="108" cy="42" r="2" fill="#94A3B8" />
      </g>
    ) : (
      <g>
        <text x="96" y="42" fontSize="22" fill="#3B82F6" fontWeight="700">
          ?
        </text>
      </g>
    );

  return (
    <svg viewBox="0 0 120 110" className="h-full w-full" aria-hidden>
      <ellipse cx="48" cy="98" rx="28" ry="7" fill="#E2E8F0" />
      <circle cx="48" cy="36" r="16" fill="#FDE68A" />
      <path d="M34 78c0-14 6-22 14-22s14 8 14 22v14H34V78z" fill="#1E3A5F" />
      <path d="M30 58 h36 v22 H30z" fill="#2563EB" />
      <circle cx="42" cy="34" r="1.5" fill="#1E293B" />
      <circle cx="54" cy="34" r="1.5" fill="#1E293B" />
      <path d="M42 42 q6 5 12 0" stroke="#1E293B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M28 62 q-8 6-6 18" stroke="#FDE68A" strokeWidth="5" strokeLinecap="round" />
      <path d="M68 62 q8 4 10 16" stroke="#FDE68A" strokeWidth="5" strokeLinecap="round" />
      {prop}
    </svg>
  );
}

function SolutionIcon({
  kind,
}: {
  kind: "rocket" | "blocks" | "growth" | "checkdoc";
}) {
  if (kind === "rocket") {
    return (
      <svg viewBox="0 0 80 80" className="h-16 w-16" aria-hidden>
        <path d="M40 8c12 10 16 28 14 42l-14 6-14-6C24 36 28 18 40 8z" fill="#3B82F6" />
        <circle cx="40" cy="32" r="7" fill="#DBEAFE" />
        <path d="M30 52l-8 14 12-6 6 8 6-8 12 6-8-14" fill="#93C5FD" />
        <path d="M34 58l-4 12M46 58l4 12" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "blocks") {
    return (
      <svg viewBox="0 0 80 80" className="h-16 w-16" aria-hidden>
        <rect x="14" y="48" width="22" height="18" rx="3" fill="#60A5FA" />
        <rect x="30" y="30" width="22" height="18" rx="3" fill="#3B82F6" />
        <rect x="46" y="12" width="22" height="18" rx="3" fill="#2563EB" />
        <path d="M58 40v-10M58 30l-4 4M58 30l4 4" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "growth") {
    return (
      <svg viewBox="0 0 80 80" className="h-16 w-16" aria-hidden>
        <rect x="12" y="52" width="12" height="16" rx="2" fill="#93C5FD" />
        <rect x="28" y="40" width="12" height="28" rx="2" fill="#60A5FA" />
        <rect x="44" y="26" width="12" height="42" rx="2" fill="#3B82F6" />
        <rect x="60" y="14" width="12" height="54" rx="2" fill="#2563EB" />
        <circle cx="50" cy="22" r="7" fill="#FDE68A" />
        <path d="M44 40 h12 v16 H44z" fill="#1E3A5F" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 80" className="h-16 w-16" aria-hidden>
      <rect x="16" y="14" width="36" height="48" rx="4" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2" />
      <path d="M24 28h20M24 36h16M24 44h18" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="52" cy="48" r="14" fill="none" stroke="#2563EB" strokeWidth="4" />
      <path d="M62 58l8 8" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function DashboardMini() {
  return (
    <svg viewBox="0 0 120 80" className="h-16 w-24 drop-shadow-md" aria-hidden>
      <rect width="120" height="80" rx="8" fill="#0F172A" />
      <rect x="8" y="8" width="40" height="28" rx="4" fill="#1E293B" />
      <rect x="54" y="8" width="58" height="28" rx="4" fill="#1E293B" />
      <path d="M14 28 C28 12, 36 30, 46 18" stroke="#38BDF8" strokeWidth="2" fill="none" />
      <rect x="8" y="42" width="104" height="30" rx="4" fill="#1E293B" />
      <rect x="14" y="50" width="18" height="14" rx="2" fill="#2563EB" />
      <rect x="38" y="46" width="18" height="18" rx="2" fill="#0EA5E9" />
      <rect x="62" y="52" width="18" height="12" rx="2" fill="#38BDF8" />
      <rect x="86" y="48" width="18" height="16" rx="2" fill="#60A5FA" />
    </svg>
  );
}

function PhoneLine() {
  return (
    <svg viewBox="0 0 72 96" className="h-20 w-14 drop-shadow-md" aria-hidden>
      <rect x="6" y="2" width="48" height="92" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
      <rect x="12" y="12" width="36" height="72" rx="3" fill="#ECFDF5" />
      <rect x="16" y="20" width="24" height="10" rx="5" fill="#86EFAC" />
      <rect x="20" y="36" width="20" height="10" rx="5" fill="#BBF7D0" />
      <rect x="16" y="52" width="26" height="10" rx="5" fill="#86EFAC" />
      <circle cx="58" cy="70" r="12" fill="#EF4444" />
      <rect x="53" y="64" width="10" height="12" rx="1.5" fill="#FDE68A" />
      <path d="M55 64 h6 v-3 a3 3 0 0 0-6 0z" fill="#FCA5A5" />
    </svg>
  );
}

function ModalStyles() {
  return (
    <style>{`
      @keyframes baku-in {
        from { opacity: 0; transform: translateY(16px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes baku-fade-up {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes baku-bounce-y {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(6px); }
      }
      .baku-in { animation: baku-in 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      .baku-fade { animation: baku-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both; }
      .baku-arrow { animation: baku-bounce-y 1.4s ease-in-out infinite; }
      .baku-card { transition: transform .2s ease, box-shadow .2s ease; }
      .baku-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px -14px rgba(22,119,230,.45); }
      @media (prefers-reduced-motion: reduce) {
        .baku-in, .baku-fade, .baku-arrow { animation: none !important; }
        .baku-card:hover { transform: none; }
      }
    `}</style>
  );
}

function Modal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="BAKUSOQ サービス紹介"
    >
      <ModalStyles />
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />

      <div className="baku-in relative flex h-full w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(94vh,920px)] sm:rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {/* ヘッダー */}
          <header className="border-b border-sky-100 px-5 pb-4 pt-5 sm:px-8 sm:pt-6">
            <BrandMark className="text-[22px] sm:text-[26px]" />
            <h2 className="baku-fade mt-3 text-[22px] font-black leading-tight tracking-tight text-slate-900 sm:text-[28px]">
              こんな悩み、ありませんか？
            </h2>
            <svg
              viewBox="0 0 280 12"
              className="mt-1 w-56 text-[#1677E6] sm:w-72"
              aria-hidden
            >
              <path
                d="M2 8 Q40 2 80 8 T160 8 T260 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </header>

          <div className="px-4 py-5 sm:px-7 sm:py-6">
            {/* 悩み + 理由 */}
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <ul className="space-y-2.5">
                {WORRIES.map((w, i) => (
                  <li
                    key={w.n}
                    className="baku-fade baku-card flex items-center gap-3 rounded-xl border border-sky-100 bg-white px-3 py-2.5 shadow-sm"
                    style={{ animationDelay: `${0.05 + i * 0.06}s` }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1677E6] text-[12px] font-black text-white shadow-sm shadow-sky-500/30">
                      {w.n}
                    </span>
                    <p className="min-w-0 flex-1 text-[13px] font-bold leading-snug text-slate-800 sm:text-[14px]">
                      {w.before}
                      <span className="text-[#1677E6]">{w.highlight}</span>
                      {w.after}
                    </p>
                    <span className="hidden h-16 w-16 shrink-0 sm:block">
                      <PersonSvg pose={w.pose} />
                    </span>
                  </li>
                ))}
              </ul>

              <aside className="baku-fade relative overflow-hidden rounded-2xl border-2 border-[#93C5FD] bg-[#EFF6FF] p-4 sm:p-5"
                style={{ animationDelay: "0.15s" }}
              >
                <p className="text-[17px] font-black text-[#1677E6] sm:text-[18px]">
                  それは仕方ないです。
                </p>
                <p className="mt-0.5 text-sm font-bold text-[#1677E6]">理由は…</p>
                <ul className="mt-3 space-y-2">
                  {REASONS.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-[13px] font-bold text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1677E6] text-white">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 h-28 w-full sm:h-32">
                  <PersonSvg pose="worker" />
                </div>
              </aside>
            </div>

            {/* 矢印 */}
            <div className="baku-arrow my-4 flex justify-center" aria-hidden>
              <svg viewBox="0 0 64 40" className="h-9 w-14 text-[#1677E6]">
                <path d="M8 4h48L32 36z" fill="currentColor" />
              </svg>
            </div>

            {/* 解決見出し */}
            <div className="flex items-center justify-center gap-2 text-center">
              <Sparkle className="h-5 w-5 shrink-0" />
              <h3 className="text-[18px] font-black italic tracking-tight text-[#1677E6] sm:text-[22px]">
                その悩み、<BrandMark className="text-[18px] not-italic sm:text-[22px]" />{" "}
                が解決します！
              </h3>
              <Sparkle className="h-5 w-5 shrink-0" />
            </div>

            {/* 4つの価値 */}
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SOLUTIONS.map((s, i) => (
                <li
                  key={s.title}
                  className="baku-fade baku-card overflow-hidden rounded-xl border border-[#93C5FD] bg-white shadow-sm"
                  style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                >
                  <div className="bg-[#1677E6] px-3 py-2.5">
                    <p className="text-center text-[12px] font-black leading-snug text-white sm:text-[13px]">
                      {s.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 px-3 py-4">
                    <SolutionIcon kind={s.icon} />
                    <p className="text-center text-[12px] font-bold leading-relaxed text-slate-700">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-5 grid gap-3 rounded-2xl bg-[#EAF4FF] p-3 sm:grid-cols-2 sm:p-4">
              <a
                href={BAKUSOQ_LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="baku-card group flex items-center gap-3 rounded-xl border-2 border-[#1677E6]/25 bg-[#F0FDF4] p-3 transition-colors hover:border-[#06C755]"
              >
                <div className="min-w-0 flex-1">
                  <span className="inline-flex rounded-full bg-[#06C755] px-2.5 py-0.5 text-[10px] font-bold text-white">
                    今すぐ情報を手に入れよう！
                  </span>
                  <p className="mt-2 text-[15px] font-black leading-snug text-slate-800">
                    <span className="text-[#06C755]">LINE登録</span>
                    で限定資料や最新情報をお届け！
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                    登録は30秒で完了！
                  </span>
                </div>
                <PhoneLine />
              </a>

              <a
                href={BAKUSOQ_HP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="baku-card flex items-center gap-3 rounded-xl border-2 border-[#93C5FD] bg-white p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-[#1677E6]">
                    詳しいサービス内容はこちら
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[15px] font-black text-[#1677E6]">
                    <span
                      aria-hidden
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1677E6] text-white"
                    >
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
                      </svg>
                    </span>
                    BAKUSOQ 公式HP
                  </p>
                  <span className="mt-2 inline-flex max-w-full items-center gap-1 truncate rounded-full border border-[#93C5FD] bg-white px-3 py-1 text-[11px] font-bold text-[#1677E6] group-hover:bg-sky-50">
                    <span className="truncate">{BAKUSOQ_HP_URL}</span>
                    <ArrowIcon className="h-3.5 w-3.5 shrink-0" />
                  </span>
                </div>
                <DashboardMini />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** サイドバー：BAKUSOQ 案内（左上 PR バッジ。押下で紹介モーダル） */
export function BakusoqSidebarBanner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative block w-full overflow-hidden text-left shadow-sm transition-opacity hover:opacity-95"
        aria-label="BAKUSOQ の資料を見る"
      >
        <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-md bg-navy-800 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm">
          PR
        </span>
        <Image
          src="/promo/bakusoq.png"
          alt="BAKUSOQ — 解体見積に根拠を。そして爆速に。"
          width={819}
          height={1024}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, 360px"
        />
      </button>

      {open && <Modal onClose={() => setOpen(false)} />}
    </>
  );
}
