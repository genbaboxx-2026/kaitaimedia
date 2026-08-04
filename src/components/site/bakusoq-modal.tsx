"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowIcon } from "@/components/site/icons";

/* ============================================================
   BAKUSOQ 紹介モーダル
   モック品質を保ちつつ、PCでは可能な限り1画面に収める
   ============================================================ */

const BAKUSOQ_HP_URL = "https://bakusoq-hp.vercel.app/";
const BAKUSOQ_LINE_URL =
  process.env.NEXT_PUBLIC_BAKUSOQ_LINE_URL || BAKUSOQ_HP_URL;
const ILLUST = "/promo/bakusoq-illust";

const WORRIES = [
  {
    n: "01",
    before: "まだ",
    highlight: "平米単価や坪単価",
    after: "で見積もりを作っていませんか？",
    img: `${ILLUST}/worry-01.png`,
  },
  {
    n: "02",
    before: "その単価、いつから",
    highlight: "前の単価",
    after: "を使っていますか？",
    img: `${ILLUST}/worry-02.png`,
  },
  {
    n: "03",
    before: "",
    highlight: "利益率",
    after: "が見えないまま、値引きしていませんか？",
    img: `${ILLUST}/worry-03.png`,
  },
  {
    n: "04",
    before: "営業が入ったはいいけど、",
    highlight: "教育",
    after: "が難しくありませんか？",
    img: `${ILLUST}/worry-04.png`,
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
    img: `${ILLUST}/sol-rocket.png`,
  },
  {
    title: "原価を積み上げるので精度が高い",
    body: "すべての原価を積み上げるから、根拠のある見積もりが作れる！",
    img: `${ILLUST}/sol-blocks.png`,
  },
  {
    title: "解体経験がない営業でも作れる",
    body: "誰でも使いこなせるから、新人も早く成長し即戦力に！",
    img: `${ILLUST}/sol-growth.png`,
  },
  {
    title: "根拠がわかるのでチェックが早い",
    body: "根拠が明確だから、社内チェックや施主への説明もスムーズ！",
    img: `${ILLUST}/sol-check.png`,
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

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block overflow-visible pb-[0.1em] pr-[0.08em] font-black tracking-[0.08em] text-[#0A4D9C] ${className}`}
    >
      BAKUSOQ
    </span>
  );
}

function ModalStyles() {
  return (
    <style>{`
      @keyframes baku-in {
        from { opacity: 0; transform: translateY(14px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes baku-soft {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .baku-in { animation: baku-in 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      .baku-soft { animation: baku-soft 0.45s cubic-bezier(0.22,1,0.36,1) both; }
      .baku-lift { transition: transform .2s ease, box-shadow .2s ease; }
      .baku-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -12px rgba(22,119,230,.35); }
      @media (prefers-reduced-motion: reduce) {
        .baku-in, .baku-soft { animation: none !important; }
        .baku-lift:hover { transform: none; }
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
      className="fixed inset-0 z-[100] flex items-stretch justify-center lg:items-center lg:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="BAKUSOQ サービス紹介"
    >
      <ModalStyles />
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
      />

      <div className="baku-in relative flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl lg:h-[min(100dvh-2.5rem,880px)] lg:rounded-3xl lg:ring-1 lg:ring-sky-200/80 xl:max-w-7xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-slate-50 hover:text-slate-700"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        {/* 小さい画面はスクロール、lg以上は高さ内に収めて overflow hidden */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain lg:overflow-hidden">
          {/* Header */}
          <header className="shrink-0 border-b border-sky-100/90 bg-gradient-to-b from-[#F7FBFF] to-white px-5 pb-4 pt-5 sm:px-8 lg:px-9 lg:pb-3.5 lg:pt-5">
            <BrandMark className="text-[26px] sm:text-[30px]" />
            <h2 className="baku-soft mt-2 text-[22px] font-black leading-tight tracking-tight text-slate-900 sm:text-[26px] lg:text-[28px]">
              こんな悩み、ありませんか？
            </h2>
            <svg
              viewBox="0 0 280 10"
              className="mt-1 w-52 text-[#1677E6] sm:w-64"
              aria-hidden
            >
              <path
                d="M2 7 Q36 2 72 7 T144 7 T250 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-4 sm:px-7 sm:py-5 lg:gap-3 lg:px-8 lg:py-4">
            {/* Worries + Reasons */}
            <div className="grid min-h-0 gap-3 lg:grid-cols-[1.35fr_0.95fr] lg:gap-4">
              <ul className="grid min-h-0 content-start gap-2 sm:grid-cols-2 lg:gap-2.5">
                {WORRIES.map((w, i) => (
                  <li
                    key={w.n}
                    className="baku-soft baku-lift flex items-center gap-2.5 rounded-2xl border border-sky-100 bg-white px-3 py-2.5 shadow-sm shadow-sky-900/5"
                    style={{ animationDelay: `${0.04 + i * 0.05}s` }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1677E6] text-[12px] font-black text-white shadow-sm shadow-sky-500/30">
                      {w.n}
                    </span>
                    <p className="min-w-0 flex-1 text-[13px] font-bold leading-snug text-slate-800 sm:text-[14px]">
                      {w.before}
                      <span className="text-[#1677E6]">{w.highlight}</span>
                      {w.after}
                    </p>
                    <span className="relative h-[3.4rem] w-[3.4rem] shrink-0 sm:h-16 sm:w-16">
                      <Image
                        src={w.img}
                        alt=""
                        fill
                        className="object-contain object-bottom"
                        sizes="64px"
                      />
                    </span>
                  </li>
                ))}
              </ul>

              <aside className="baku-soft relative flex min-h-0 flex-col overflow-hidden rounded-2xl border-2 border-[#93C5FD] bg-[#EFF6FF] p-3.5 sm:p-4"
                style={{ animationDelay: "0.12s" }}
              >
                <p className="text-[16px] font-black leading-snug text-[#1677E6] sm:text-[17px]">
                  それは仕方ないです。
                </p>
                <p className="mt-0.5 text-[13px] font-bold text-[#1677E6]">
                  理由は…
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {REASONS.map((r) => (
                    <li
                      key={r}
                      className="flex items-start gap-2 text-[12px] font-bold leading-snug text-slate-700 sm:text-[13px]"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1677E6] text-white">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
                <div className="relative mt-2 hidden h-[7.5rem] w-full lg:block">
                  <Image
                    src={`${ILLUST}/reason-worker.png`}
                    alt=""
                    fill
                    className="object-contain object-right-bottom"
                    sizes="320px"
                  />
                </div>
              </aside>
            </div>

            {/* Solution bridge */}
            <div className="shrink-0 text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-[#EAF4FF] px-4 py-1.5 text-[14px] font-black text-[#1677E6] sm:text-[15px]">
                その悩み、
                <BrandMark className="text-[14px] sm:text-[15px]" />
                が解決します！
              </p>
            </div>

            {/* Solutions */}
            <ul className="grid shrink-0 grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
              {SOLUTIONS.map((s, i) => (
                <li
                  key={s.title}
                  className="baku-soft baku-lift overflow-hidden rounded-2xl border border-[#93C5FD] bg-white shadow-sm"
                  style={{ animationDelay: `${0.08 + i * 0.04}s` }}
                >
                  <div className="bg-[#1677E6] px-2.5 py-2">
                    <p className="text-center text-[12px] font-black leading-snug text-white sm:text-[13px]">
                      {s.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 px-2.5 py-2.5">
                    <span className="relative h-14 w-14 sm:h-16 sm:w-16">
                      <Image
                        src={s.img}
                        alt=""
                        fill
                        className="object-contain"
                        sizes="64px"
                      />
                    </span>
                    <p className="text-center text-[11px] font-bold leading-snug text-slate-700 sm:text-[12px]">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-auto grid shrink-0 gap-2.5 border-t border-sky-100 pt-3 sm:grid-cols-2 sm:gap-3">
              <a
                href={BAKUSOQ_LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="baku-lift group flex items-center gap-3 rounded-2xl bg-[#06C755] px-4 py-3 text-white shadow-lg shadow-emerald-500/25 transition hover:bg-[#05b34c]"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/15 p-1">
                  <Image
                    src={`${ILLUST}/cta-phone.png`}
                    alt=""
                    fill
                    className="object-contain p-0.5"
                    sizes="56px"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold tracking-wide text-emerald-50">
                    STEP 1 · まずはここから
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[16px] font-black leading-snug sm:text-[17px]">
                    LINEで友だち追加
                    <ArrowIcon className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium text-emerald-50/90">
                    限定資料・最新情報をお届け
                  </span>
                </span>
              </a>

              <a
                href={BAKUSOQ_HP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="baku-lift group flex items-center gap-3 rounded-2xl bg-[#1677E6] px-4 py-3 text-white shadow-lg shadow-sky-500/25 transition hover:bg-[#1366c9]"
              >
                <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-white/15 p-1">
                  <Image
                    src={`${ILLUST}/cta-dash.png`}
                    alt=""
                    fill
                    className="object-contain p-0.5"
                    sizes="64px"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold tracking-wide text-sky-100">
                    STEP 2 · 詳しく知りたい方へ
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[16px] font-black leading-snug sm:text-[17px]">
                    公式HPを開く
                    <ArrowIcon className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] font-medium text-sky-100/90">
                    機能・料金・デモはこちら
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
