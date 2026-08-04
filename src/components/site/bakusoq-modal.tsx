"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowIcon } from "@/components/site/icons";

/* ============================================================
   BAKUSOQ 紹介モーダル
   モック構成を HTML で組み、イラストは専用アセットで再現
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
    title: "解体経験がない営業でも作れる、成長が圧倒的",
    body: "誰でも使いこなせるから、新人も早く成長し即戦力に！",
    img: `${ILLUST}/sol-growth.png`,
  },
  {
    title: "根拠がわかるので見積もりチェックが早い",
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

function Sparkle({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path
        fill="#FACC15"
        d="M12 1.5l1.8 6.2L20 9.5l-6.2 1.8L12 17.5l-1.8-6.2L4 9.5l6.2-1.8L12 1.5z"
      />
    </svg>
  );
}

/** 稲妻なし・切れないワードマーク */
function BrandMark({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-block overflow-visible pb-[0.12em] pr-[0.08em] ${className}`}
    >
      <span
        className={`inline-block font-black not-italic tracking-[0.06em] text-[#0A4D9C] ${
          compact ? "leading-[1.2]" : "leading-[1.2]"
        }`}
        style={{
          textShadow: "0 1px 0 rgba(14,165,233,0.15)",
        }}
      >
        BAKUSOQ
      </span>
    </span>
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
      @keyframes baku-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      .baku-in { animation: baku-in 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      .baku-fade { animation: baku-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both; }
      .baku-arrow { animation: baku-bounce-y 1.4s ease-in-out infinite; }
      .baku-float { animation: baku-float 2.8s ease-in-out infinite; }
      .baku-card { transition: transform .2s ease, box-shadow .2s ease; }
      .baku-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px -14px rgba(22,119,230,.45); }
      @media (prefers-reduced-motion: reduce) {
        .baku-in, .baku-fade, .baku-arrow, .baku-float { animation: none !important; }
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

      <div className="baku-in relative flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(94vh,960px)] sm:rounded-2xl sm:ring-1 sm:ring-sky-200 lg:max-w-7xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <header className="overflow-visible border-b border-sky-100 px-5 pb-5 pt-5 sm:px-10 sm:pt-7">
            <BrandMark className="text-[30px] sm:text-[38px]" />
            <h2 className="baku-fade mt-4 text-[26px] font-black leading-tight tracking-tight text-slate-900 sm:text-[34px]">
              こんな悩み、ありませんか？
            </h2>
            <svg
              viewBox="0 0 320 12"
              className="mt-1.5 w-64 text-[#1677E6] sm:w-80"
              aria-hidden
            >
              <path
                d="M2 8 Q40 2 80 8 T160 8 T300 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </header>

          <div className="px-5 py-6 sm:px-10 sm:py-8">
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.9fr]">
              <ul className="space-y-3">
                {WORRIES.map((w, i) => (
                  <li
                    key={w.n}
                    className="baku-fade baku-card flex items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 py-3 shadow-sm sm:gap-4 sm:py-3.5"
                    style={{ animationDelay: `${0.05 + i * 0.06}s` }}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1677E6] text-[14px] font-black text-white shadow-sm shadow-sky-500/30">
                      {w.n}
                    </span>
                    <p className="min-w-0 flex-1 text-[15px] font-bold leading-snug text-slate-800 sm:text-[17px]">
                      {w.before}
                      <span className="text-[#1677E6]">{w.highlight}</span>
                      {w.after}
                    </p>
                    <span className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
                      <Image
                        src={w.img}
                        alt=""
                        fill
                        className="object-contain object-bottom"
                        sizes="80px"
                      />
                    </span>
                  </li>
                ))}
              </ul>

              <aside
                className="baku-fade relative flex flex-col overflow-hidden rounded-2xl border-2 border-[#93C5FD] bg-[#EFF6FF] p-5 sm:p-6"
                style={{ animationDelay: "0.15s" }}
              >
                <p className="text-[20px] font-black text-[#1677E6] sm:text-[22px]">
                  それは仕方ないです。
                </p>
                <p className="mt-1 text-base font-bold text-[#1677E6]">理由は…</p>
                <ul className="mt-4 space-y-2.5">
                  {REASONS.map((r) => (
                    <li
                      key={r}
                      className="flex items-start gap-2.5 text-[15px] font-bold leading-snug text-slate-700 sm:text-[16px]"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1677E6] text-white">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
                <div className="relative mt-auto h-32 w-full sm:h-40">
                  <Image
                    src={`${ILLUST}/reason-worker.png`}
                    alt=""
                    fill
                    className="object-contain object-right-bottom"
                    sizes="420px"
                  />
                </div>
              </aside>
            </div>

            <div className="baku-arrow my-5 flex justify-center" aria-hidden>
              <svg viewBox="0 0 64 40" className="h-10 w-16 text-[#1677E6]">
                <path d="M8 4h48L32 36z" fill="currentColor" />
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 text-center">
              <Sparkle className="baku-float h-6 w-6 shrink-0" />
              <h3 className="flex flex-wrap items-center justify-center gap-2 text-[20px] font-black tracking-tight text-[#1677E6] sm:text-[26px]">
                <span>その悩み、</span>
                <BrandMark compact className="text-[22px] sm:text-[28px]" />
                <span>が解決します！</span>
              </h3>
              <Sparkle
                className="baku-float h-6 w-6 shrink-0"
                style={{ animationDelay: "0.4s" }}
              />
            </div>

            <ul className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {SOLUTIONS.map((s, i) => (
                <li
                  key={s.title}
                  className="baku-fade baku-card overflow-hidden rounded-xl border border-[#93C5FD] bg-white shadow-sm"
                  style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                >
                  <div className="bg-[#1677E6] px-3 py-3">
                    <p className="text-center text-[14px] font-black leading-snug text-white sm:text-[15px]">
                      {s.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2.5 px-3 py-4">
                    <span
                      className="baku-float relative h-24 w-24"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    >
                      <Image
                        src={s.img}
                        alt=""
                        fill
                        className="object-contain"
                        sizes="96px"
                      />
                    </span>
                    <p className="text-center text-[14px] font-bold leading-relaxed text-slate-700 sm:text-[15px]">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-4 rounded-2xl bg-[#EAF4FF] p-4 sm:grid-cols-2 sm:gap-5 sm:p-5">
              {/* LINE */}
              <div className="flex flex-col rounded-2xl border-2 border-[#06C755]/40 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-[#059669]">
                      STEP 1 · まずはここから
                    </p>
                    <p className="mt-1 text-[18px] font-black leading-snug text-slate-900 sm:text-[20px]">
                      LINEで最新情報・限定資料を受け取る
                    </p>
                    <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-slate-600">
                      友だち追加は約30秒。登録後すぐに案内が届きます。
                    </p>
                  </div>
                  <span className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
                    <Image
                      src={`${ILLUST}/cta-phone.png`}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  </span>
                </div>
                <a
                  href={BAKUSOQ_LINE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#06C755] text-[16px] font-black text-white shadow-md shadow-emerald-500/30 transition hover:bg-[#05b34c] active:scale-[0.99]"
                >
                  LINEで友だち追加する
                  <ArrowIcon className="h-4 w-4" />
                </a>
              </div>

              {/* HP */}
              <div className="flex flex-col rounded-2xl border-2 border-[#1677E6]/35 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-[#1677E6]">
                      STEP 2 · 詳しく知りたい方へ
                    </p>
                    <p className="mt-1 text-[18px] font-black leading-snug text-slate-900 sm:text-[20px]">
                      BAKUSOQ 公式サイトを見る
                    </p>
                    <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-slate-600">
                      機能・料金・デモ体験は公式HPで確認できます。
                    </p>
                  </div>
                  <span className="relative h-16 w-24 shrink-0 sm:h-20 sm:w-28">
                    <Image
                      src={`${ILLUST}/cta-dash.png`}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="112px"
                    />
                  </span>
                </div>
                <a
                  href={BAKUSOQ_HP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1677E6] text-[16px] font-black text-white shadow-md shadow-sky-500/30 transition hover:bg-[#1366c9] active:scale-[0.99]"
                >
                  公式HPを開く
                  <ArrowIcon className="h-4 w-4" />
                </a>
                <p className="mt-2 truncate text-center text-[12px] text-slate-500">
                  {BAKUSOQ_HP_URL}
                </p>
              </div>
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
