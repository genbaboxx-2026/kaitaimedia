"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/* ============================================================
   BAKUSOQ 紹介モーダル
   提供デザインを完全再現し、CTAだけクリック可能にする
   ============================================================ */

const BAKUSOQ_HP_URL = "https://bakusoq-hp.vercel.app/";
const BAKUSOQ_LINE_URL =
  process.env.NEXT_PUBLIC_BAKUSOQ_LINE_URL || BAKUSOQ_HP_URL;

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

function ModalStyles() {
  return (
    <style>{`
      @keyframes baku-panel-in {
        from { opacity: 0; transform: translateY(20px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes baku-backdrop-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .baku-panel { animation: baku-panel-in 0.42s cubic-bezier(0.22, 1, 0.36, 1) both; }
      .baku-backdrop { animation: baku-backdrop-in 0.28s ease both; }
      @media (prefers-reduced-motion: reduce) {
        .baku-panel, .baku-backdrop { animation: none !important; }
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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="BAKUSOQ サービス紹介"
    >
      <ModalStyles />
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="baku-backdrop absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
      />

      <div className="baku-panel relative flex h-full w-full max-w-[822px] flex-col overflow-hidden bg-white shadow-2xl shadow-sky-950/25 sm:h-[min(94vh,1024px)] sm:rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-sm ring-1 ring-slate-200/80 transition-colors hover:bg-white hover:text-slate-700 sm:right-3 sm:top-3"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="relative mx-auto w-full">
            <Image
              src="/promo/bakusoq-modal-story.png"
              alt="BAKUSOQ — こんな悩みありませんか？ 原価積み上げで見積を爆速・高精度に。"
              width={822}
              height={1024}
              className="h-auto w-full select-none"
              priority
              sizes="(max-width: 822px) 100vw, 822px"
            />

            {/* デザイン画像の CTA 領域に合わせたクリックホットスポット */}
            <a
              href={BAKUSOQ_LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LINE登録で限定資料や最新情報を受け取る"
              className="absolute left-[2.5%] top-[81.5%] z-10 h-[16.5%] w-[47%] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            />
            <a
              href={BAKUSOQ_HP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="BAKUSOQ 公式HPを開く"
              className="absolute left-[51%] top-[81.5%] z-10 h-[16.5%] w-[46.5%] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            />
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
