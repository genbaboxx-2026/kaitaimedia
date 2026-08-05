"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/* ============================================================
   BAKUSOQ 紹介モーダル
   カードの枠線を減らし、薄い水色の面でまとめる（モック1枚目準拠）
   ============================================================ */

const BAKUSOQ_HP_URL = "https://bakusoq-hp.vercel.app/";
const BAKUSOQ_LINE_URL =
  process.env.NEXT_PUBLIC_BAKUSOQ_LINE_URL || BAKUSOQ_HP_URL;
const ILLUST = "/promo/bakusoq-illust";

const WORRIES = [
  {
    text: (
      <>
        まだ
        <span className="font-black text-[#1677E6]">平米単価や坪単価</span>
        で見積もりを作っていませんか？
      </>
    ),
    img: `${ILLUST}/worry-01.png`,
  },
  {
    text: (
      <>
        その単価、いつから
        <span className="font-black text-[#1677E6]">前の単価</span>
        を使っていますか？
      </>
    ),
    img: `${ILLUST}/worry-02.png`,
  },
  {
    text: (
      <>
        <span className="font-black text-[#1677E6]">利益率</span>
        が見えないまま、値引きしていませんか？
      </>
    ),
    img: `${ILLUST}/worry-03.png`,
  },
  {
    text: (
      <>
        営業が入ったはいいけど、
        <span className="font-black text-[#1677E6]">教育</span>
        が難しくありませんか？
      </>
    ),
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
    n: "01",
    title: "しっかり爆速",
    body: "見積もり作成を圧倒的なスピードでサポート！",
    img: `${ILLUST}/sol-rocket.png`,
  },
  {
    n: "02",
    title: "原価を積み上げるので精度が高い",
    body: "すべての原価を積み上げるから、根拠のある見積もりが作れる！",
    img: `${ILLUST}/sol-blocks.png`,
  },
  {
    n: "03",
    title: "解体経験がない営業でも作れる",
    body: "誰でも使いこなせるから、新人も早く成長し即戦力に！",
    img: `${ILLUST}/sol-growth.png`,
  },
  {
    n: "04",
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

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="#F59E0B">
      <path d="M12 2l1.6 6.2L20 10l-6.4 1.8L12 18l-1.6-6.2L4 10l6.4-1.8L12 2z" />
    </svg>
  );
}

function LineMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden>
      <rect width="36" height="36" rx="8" fill="#06C755" />
      <path
        d="M27.5 16.9c0-5.1-5.1-9.2-11.4-9.2S4.7 11.8 4.7 16.9c0 4.4 3.9 8.1 9.2 8.8.36.07.85.22 1 .5.12.26.08.67.04 1l-.18.9c-.06.3-.26 1.16 1.02.63 1.28-.53 6.9-4.07 9.4-6.96 1.73-1.9 2.32-3.8 2.32-5.85z"
        fill="#fff"
      />
    </svg>
  );
}

function GlobeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx="20" cy="20" r="18" fill="#1677E6" />
      <ellipse
        cx="20"
        cy="20"
        rx="7"
        ry="16"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
      />
      <path
        d="M5 20h30M7 13h26M7 27h26"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ModalStyles() {
  return (
    <style>{`
      @keyframes baku-in {
        from { opacity: 0; transform: translateY(14px) scale(0.985); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .baku-in { animation: baku-in 0.4s cubic-bezier(0.22,1,0.36,1) both; }
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
      className="fixed inset-0 z-[100] flex items-stretch justify-center p-0 sm:items-center sm:p-5 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="BAKUSOQ サービス紹介"
    >
      <ModalStyles />
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/45"
      />

      <div className="baku-in relative flex h-full w-full flex-col overflow-hidden bg-[#F4F9FF] shadow-2xl ring-1 ring-[#C7E0FF] sm:h-[min(100dvh-2.5rem,920px)] sm:w-[min(96vw,1200px)] sm:rounded-[28px] lg:w-[min(94vw,1280px)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-400 transition hover:bg-white hover:text-slate-700"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {/* Hero：白面なし、水色の地続き */}
          <header className="px-6 pb-2 pt-6 sm:px-10 sm:pt-8 lg:px-14">
            <p className="text-[26px] font-black tracking-[0.06em] text-[#0A4D9C] sm:text-[30px]">
              BAKUSOQ
            </p>
            <div className="mt-4 grid items-center gap-6 sm:mt-5 sm:grid-cols-[1.15fr_0.85fr] lg:gap-10">
              <div className="min-w-0">
                <h2 className="text-[28px] font-black leading-[1.3] tracking-tight text-slate-900 sm:text-[34px] lg:text-[40px]">
                  こんな悩み、
                  <span className="relative inline-block text-[#1677E6]">
                    ありませんか？
                    <svg
                      viewBox="0 0 240 12"
                      className="absolute -bottom-1 left-0 w-full text-[#1677E6]"
                      aria-hidden
                    >
                      <path
                        d="M2 8 Q50 2 100 8 T200 7 T238 8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h2>
                <p className="mt-4 text-[15px] font-bold leading-relaxed text-slate-600 sm:text-[17px]">
                  見積の
                  <span className="text-slate-800">“なんとなく”</span>
                  を、根拠とスピードに変える。
                </p>
              </div>
              <div className="relative mx-auto h-[190px] w-full max-w-[300px] overflow-hidden rounded-2xl bg-[#E8F3FF] sm:mx-0 sm:h-[210px] sm:max-w-none lg:h-[230px]">
                <Image
                  src={`${ILLUST}/reason-worker.png`}
                  alt=""
                  fill
                  className="object-contain object-bottom p-2"
                  sizes="(max-width: 640px) 300px, 380px"
                  priority
                />
              </div>
            </div>
          </header>

          <div className="space-y-6 px-5 pb-8 pt-5 sm:space-y-7 sm:px-10 sm:pb-10 lg:px-14">
            {/* 悩み／理由：枠線少なめのやわらかい面 */}
            <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4">
              <section className="rounded-3xl bg-[#E8F3FF] px-5 py-5 sm:px-6 sm:py-6">
                <p className="inline-flex rounded-full bg-[#1677E6] px-4 py-1.5 text-[13px] font-black text-white sm:text-[14px]">
                  こんな悩み、ありませんか？
                </p>
                <ul className="mt-4 space-y-3.5">
                  {WORRIES.map((w, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="relative h-11 w-11 shrink-0 sm:h-12 sm:w-12">
                        <Image
                          src={w.img}
                          alt=""
                          fill
                          className="object-contain"
                          sizes="48px"
                        />
                      </span>
                      <p className="min-w-0 text-[13px] font-bold leading-snug text-slate-800 sm:text-[15px]">
                        {w.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>

              <div
                className="flex items-center justify-center text-[#1677E6]"
                aria-hidden
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl font-black text-[#1677E6] shadow-sm">
                  →
                </span>
              </div>

              <section className="rounded-3xl bg-[#E8F3FF] px-5 py-5 sm:px-6 sm:py-6">
                <p className="text-[18px] font-black leading-snug text-[#1677E6] sm:text-[20px]">
                  それは仕方ないです。
                </p>
                <p className="mt-1 text-[14px] font-bold text-[#1677E6]">
                  理由は…
                </p>
                <ul className="mt-4 space-y-3.5">
                  {REASONS.map((r) => (
                    <li
                      key={r}
                      className="flex items-start gap-2.5 text-[13px] font-bold leading-snug text-slate-700 sm:text-[15px]"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1677E6] text-white">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <p className="flex flex-wrap items-center justify-center gap-2 text-center text-[17px] font-black text-slate-800 sm:text-[19px]">
              <Sparkle className="h-5 w-5" />
              そこを{" "}
              <span className="tracking-[0.04em] text-[#0A4D9C]">BAKUSOQ</span>{" "}
              が解決します
              <Sparkle className="h-5 w-5" />
            </p>

            {/* 解決：枠を薄くし、面で並べる */}
            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              {SOLUTIONS.map((s) => (
                <li
                  key={s.n}
                  className="relative rounded-2xl bg-white/90 px-3 pb-5 pt-5 text-center shadow-[0_8px_24px_-16px_rgba(22,119,230,0.45)]"
                >
                  <span className="absolute left-3 top-3 text-[12px] font-black text-[#1677E6]">
                    {s.n}
                  </span>
                  <div className="relative mx-auto h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20">
                    <Image
                      src={s.img}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="80px"
                    />
                  </div>
                  <p className="mt-3 text-[13px] font-black leading-snug text-[#1677E6] sm:text-[14px]">
                    {s.title}
                  </p>
                  <p className="mt-1.5 text-[11px] font-bold leading-snug text-slate-600 sm:text-[12px]">
                    {s.body}
                  </p>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="rounded-2xl bg-[#E7F8EE] px-5 py-5">
                <div className="flex items-center gap-3">
                  <LineMark className="h-11 w-11 shrink-0" />
                  <p className="text-[15px] font-black leading-snug text-slate-800 sm:text-[16px]">
                    ぜひLINE登録して情報を集めよう！
                  </p>
                </div>
                <a
                  href={BAKUSOQ_LINE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-1 rounded-full bg-[#06C755] px-5 py-3 text-[15px] font-black text-white transition hover:bg-[#05b34c]"
                >
                  LINE登録はこちら
                  <span aria-hidden>›</span>
                </a>
              </div>

              <div className="rounded-2xl bg-[#E8F3FF] px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <GlobeMark className="h-10 w-10 shrink-0" />
                      <a
                        href={BAKUSOQ_HP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[16px] font-black text-[#1677E6] underline-offset-2 hover:underline"
                      >
                        HPはこちら ›
                      </a>
                    </div>
                    <p className="mt-2 break-all text-[12px] font-medium text-slate-500">
                      {BAKUSOQ_HP_URL}
                    </p>
                  </div>
                  <span className="relative h-16 w-20 shrink-0 sm:h-[4.5rem] sm:w-24">
                    <Image
                      src={`${ILLUST}/cta-dash.png`}
                      alt=""
                      fill
                      className="object-contain object-right"
                      sizes="96px"
                    />
                  </span>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] leading-relaxed text-slate-400 sm:text-[12px]">
              最新事例やノウハウなど、お役立ち情報をお届けします。登録は30秒で完了、いつでも解除できます。
            </p>
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
