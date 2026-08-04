"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowIcon } from "@/components/site/icons";

/* ============================================================
   BAKUSOQ 紹介モーダル（PCはスクロールなしで1画面）
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
  "単価・原価の更新が後回しになる",
  "データが属人化し共有しづらい",
  "新人の育成に時間がかかる",
] as const;

const SOLUTIONS = [
  {
    title: "しっかり爆速",
    body: "見積作成を圧倒的スピードで",
    img: `${ILLUST}/sol-rocket.png`,
  },
  {
    title: "原価積み上げで高精度",
    body: "根拠のある見積が作れる",
    img: `${ILLUST}/sol-blocks.png`,
  },
  {
    title: "未経験でも作れて成長",
    body: "新人も早く即戦力に",
    img: `${ILLUST}/sol-growth.png`,
  },
  {
    title: "チェックが早い",
    body: "根拠が明確で説明もスムーズ",
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
      className={`inline-block overflow-visible pb-[0.08em] pr-[0.06em] font-black tracking-[0.06em] text-[#0A4D9C] ${className}`}
    >
      BAKUSOQ
    </span>
  );
}

function ModalStyles() {
  return (
    <style>{`
      @keyframes baku-in {
        from { opacity: 0; transform: translateY(12px) scale(0.985); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .baku-in { animation: baku-in 0.35s cubic-bezier(0.22,1,0.36,1) both; }
      @media (prefers-reduced-motion: reduce) {
        .baku-in { animation: none !important; }
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
      className="fixed inset-0 z-[100] flex items-stretch justify-center md:items-center md:p-3 lg:p-4"
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

      {/* PC: 100dvh以内・スクロールなし / モバイル: 縦スクロール可 */}
      <div className="baku-in relative flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl md:h-[min(100dvh-1.5rem,860px)] md:rounded-2xl md:ring-1 md:ring-sky-200 lg:max-w-7xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:overflow-hidden">
          {/* ヘッダー（コンパクト） */}
          <header className="shrink-0 border-b border-sky-100 px-4 py-3 pr-12 md:px-6 md:py-3.5">
            <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
              <BrandMark className="text-[22px] leading-none md:text-[26px]" />
              <h2 className="text-[18px] font-black leading-tight tracking-tight text-slate-900 md:text-[22px]">
                こんな悩み、ありませんか？
                <span
                  aria-hidden
                  className="mt-0.5 block h-[3px] w-28 rounded-full bg-[#1677E6] md:w-36"
                />
              </h2>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-3 py-2.5 md:gap-3 md:px-5 md:py-3">
            {/* 悩み + 理由 */}
            <div className="grid min-h-0 shrink gap-2.5 md:grid-cols-[1.25fr_0.9fr] md:gap-3">
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:gap-2">
                {WORRIES.map((w) => (
                  <li
                    key={w.n}
                    className="flex items-center gap-2 rounded-lg border border-sky-100 bg-white px-2.5 py-1.5 shadow-sm md:px-3 md:py-2"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1677E6] text-[11px] font-black text-white md:h-8 md:w-8 md:text-[12px]">
                      {w.n}
                    </span>
                    <p className="min-w-0 flex-1 text-[12px] font-bold leading-snug text-slate-800 md:text-[13px]">
                      {w.before}
                      <span className="text-[#1677E6]">{w.highlight}</span>
                      {w.after}
                    </p>
                    <span className="relative hidden h-11 w-11 shrink-0 sm:block md:h-12 md:w-12">
                      <Image
                        src={w.img}
                        alt=""
                        fill
                        className="object-contain object-bottom"
                        sizes="48px"
                      />
                    </span>
                  </li>
                ))}
              </ul>

              <aside className="flex min-h-0 flex-col rounded-xl border-2 border-[#93C5FD] bg-[#EFF6FF] px-3 py-2.5 md:px-3.5 md:py-3">
                <div className="flex min-h-0 flex-1 gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-black text-[#1677E6] md:text-[15px]">
                      それは仕方ないです。
                      <span className="font-bold">理由は…</span>
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {REASONS.map((r) => (
                        <li
                          key={r}
                          className="flex items-start gap-1.5 text-[11px] font-bold leading-snug text-slate-700 md:text-[12px]"
                        >
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1677E6] text-white">
                            <CheckIcon className="h-2.5 w-2.5" />
                          </span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <span className="relative hidden w-[38%] max-w-[140px] shrink-0 self-stretch md:block">
                    <Image
                      src={`${ILLUST}/reason-worker.png`}
                      alt=""
                      fill
                      className="object-contain object-bottom"
                      sizes="140px"
                    />
                  </span>
                </div>
              </aside>
            </div>

            {/* 解決 */}
            <div className="shrink-0">
              <p className="text-center text-[14px] font-black text-[#1677E6] md:text-[16px]">
                その悩み、<BrandMark className="text-[14px] md:text-[16px]" />{" "}
                が解決します！
              </p>
              <ul className="mt-1.5 grid grid-cols-2 gap-1.5 md:mt-2 md:grid-cols-4 md:gap-2">
                {SOLUTIONS.map((s) => (
                  <li
                    key={s.title}
                    className="overflow-hidden rounded-lg border border-[#93C5FD] bg-white"
                  >
                    <div className="bg-[#1677E6] px-1.5 py-1.5">
                      <p className="text-center text-[11px] font-black leading-snug text-white md:text-[12px]">
                        {s.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 md:flex-col md:gap-1 md:py-2">
                      <span className="relative h-9 w-9 shrink-0 md:h-11 md:w-11">
                        <Image
                          src={s.img}
                          alt=""
                          fill
                          className="object-contain"
                          sizes="44px"
                        />
                      </span>
                      <p className="text-[10px] font-bold leading-snug text-slate-700 md:text-center md:text-[11px]">
                        {s.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA（大きく・わかりやすく・低さ控えめ） */}
            <div className="mt-auto grid shrink-0 gap-2 border-t border-sky-100 pt-2.5 sm:grid-cols-2 md:gap-3 md:pt-3">
              <a
                href={BAKUSOQ_LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-[#06C755] px-3 py-2.5 text-white shadow-md shadow-emerald-500/25 transition hover:bg-[#05b34c] md:px-4 md:py-3"
              >
                <span className="relative h-12 w-12 shrink-0 md:h-14 md:w-14">
                  <Image
                    src={`${ILLUST}/cta-phone.png`}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold text-white/90">
                    STEP 1 · まずはここ
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-[15px] font-black leading-snug md:text-[17px]">
                    LINEで友だち追加
                    <ArrowIcon className="h-4 w-4 shrink-0" />
                  </span>
                </span>
              </a>

              <a
                href={BAKUSOQ_HP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-[#1677E6] px-3 py-2.5 text-white shadow-md shadow-sky-500/25 transition hover:bg-[#1366c9] md:px-4 md:py-3"
              >
                <span className="relative h-10 w-14 shrink-0 md:h-12 md:w-16">
                  <Image
                    src={`${ILLUST}/cta-dash.png`}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="64px"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold text-white/90">
                    STEP 2 · 詳しく見る
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-[15px] font-black leading-snug md:text-[17px]">
                    公式HPを開く
                    <ArrowIcon className="h-4 w-4 shrink-0" />
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
