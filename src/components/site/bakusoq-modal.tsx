"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowIcon } from "@/components/site/icons";

/* ============================================================
   BAKUSOQ 紹介モーダル
   PDF営業資料（全12P）を3スライドに凝縮。
   スマホでは縦長パネルを横スワイプ（scroll-snap）で1枚ずつ確認。
   ============================================================ */

const SLIDE_COUNT = 3;

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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function BoltMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12L13 2z" />
    </svg>
  );
}

/* --- スライド内で使う小パーツ ------------------------------- */

function SlideShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full shrink-0 snap-center snap-always flex-col overflow-y-auto px-6 py-7 sm:px-9 sm:py-9">
      {children}
    </div>
  );
}

function ProblemCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
      <p className="text-[13px] font-bold text-cyan-300">{title}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-slate-300">{body}</p>
    </div>
  );
}

function ValueRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
        <CheckIcon className="h-3.5 w-3.5" />
      </span>
      <div>
        <p className="text-[13.5px] font-bold text-white">{title}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-slate-300">{body}</p>
      </div>
    </div>
  );
}

/* --- 3枚のスライド ----------------------------------------- */

function SlideIntro() {
  return (
    <SlideShell>
      <div className="flex items-center gap-2">
        <span className="text-[26px] font-black tracking-tight text-white">
          BAKU
        </span>
        <BoltMark className="h-6 w-6 text-cyan-400" />
        <span className="text-[26px] font-black tracking-tight text-white">
          SOQ
        </span>
      </div>
      <p className="mt-2 text-[15px] font-bold text-cyan-300">
        解体見積に根拠を。そして爆速に。
      </p>
      <span className="mt-3 inline-flex w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold text-cyan-200">
        解体業向け 見積作成サービス
      </span>

      <p className="mt-6 text-[12px] font-bold uppercase tracking-wider text-slate-400">
        解体業界の3つの課題
      </p>
      <div className="mt-3 space-y-2.5">
        <ProblemCard
          title="見積作成が遅い・属人化"
          body="現地調査からExcel／紙への手作業の転記が必要。経験によるバラつきや桁ミスが多発し、担当者依存の業務に。"
        />
        <ProblemCard
          title="社内承認の手戻り"
          body="原価・提案金額のズレや丸め規則の不統一で承認が差し戻し。顧客への提案が遅れるリスクも。"
        />
        <ProblemCard
          title="マスタ・積算ロジック統一の難しさ"
          body="単位表記のゆれや例外処理が部署ごとにバラバラで、会社としての一貫性が保てない。"
        />
      </div>
    </SlideShell>
  );
}

function SlideValue() {
  return (
    <SlideShell>
      <p className="text-[12px] font-bold uppercase tracking-wider text-cyan-400">
        BAKUSOQの提供価値
      </p>
      <h3 className="mt-1 text-[19px] font-black leading-snug text-white">
        入力から見積書まで、
        <br />
        速く・正確に・会社基準で。
      </h3>

      <div className="mt-5 space-y-4">
        <ValueRow
          title="現場情報の標準化・スピード"
          body="標準フォーマットで入力すると自動で積算・計算。スピードと精度を両立し作業時間を大幅短縮。"
        />
        <ValueRow
          title="ステップ式UIで入力ミスを削減"
          body="直感的なステップ入力で抜け・ミスを防止。担当者による差（属人化）も解消。"
        />
        <ValueRow
          title="マスタで会社基準を統一"
          body="単価・丸め・例外ルールを会社基準でマスタ化。部署間のばらつきを解消し社内展開も容易。"
        />
      </div>

      <p className="mt-6 text-[12px] font-bold uppercase tracking-wider text-slate-400">
        Before → After
      </p>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3">
          <p className="text-[11px] font-bold text-rose-300">Before</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-slate-300">
            Excel／紙で手作業。手直し多数・承認遅延で受注機会を損失。
          </p>
        </div>
        <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-3">
          <p className="text-[11px] font-bold text-cyan-300">After</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-slate-300">
            自動積算で計算ミスゼロ。提出用見積を瞬時に生成し提案スピードUP。
          </p>
        </div>
      </div>
    </SlideShell>
  );
}

function SlidePlan() {
  return (
    <SlideShell>
      <p className="text-[12px] font-bold uppercase tracking-wider text-cyan-400">
        導入ステップ & 料金
      </p>
      <h3 className="mt-1 text-[19px] font-black leading-snug text-white">
        まずは1週間の無料トライアルから。
      </h3>

      <ol className="mt-4 space-y-2">
        {[
          ["1週間トライアル", "費用負担なく使い勝手と精度を確認"],
          ["マスタ移行", "既存の単価表・計算ルールを段階的に整備"],
          ["運用テスト", "操作から実務活用までをサポート"],
          ["本稼働サポート", "専任担当が伴走型で立ち上げを支援"],
        ].map(([t, d], i) => (
          <li key={t} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-[12px] font-black text-navy-900">
              {i + 1}
            </span>
            <p className="text-[12.5px] leading-snug text-slate-200">
              <span className="font-bold text-white">{t}</span>
              <span className="text-slate-400"> — {d}</span>
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-cyan-400/10 to-transparent p-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold text-white">BAKUSOQ スタンダード</p>
          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
            期間限定 40% OFF
          </span>
        </div>
        <p className="mt-2 flex items-end gap-1.5">
          <span className="text-[13px] text-slate-500 line-through">¥50,000</span>
          <span className="text-[28px] font-black leading-none text-cyan-300">
            ¥30,000
          </span>
          <span className="text-[12px] font-bold text-slate-300">/ 月</span>
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
          ユーザー数無制限・全機能利用可。別途 初回マスタ設定費用 ¥200,000。
          <br />
          早期導入で正式リリース後も特別価格を継続。
        </p>
      </div>

      <div className="mt-5 space-y-2.5">
        <Link
          href="/contact"
          className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-cyan-400 text-[14px] font-black text-navy-900 transition-colors hover:bg-cyan-300"
        >
          無料で相談・お問い合わせ
          <ArrowIcon className="h-4 w-4" />
        </Link>
        <Link
          href="/bakusoq"
          className="flex h-11 items-center justify-center rounded-lg border border-white/20 text-[13px] font-bold text-white transition-colors hover:bg-white/5"
        >
          サービス紹介ページを見る
        </Link>
      </div>
    </SlideShell>
  );
}

const SLIDES = [SlideIntro, SlideValue, SlidePlan];

/* --- モーダル本体 ------------------------------------------ */

function Modal({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(SLIDE_COUNT - 1, i));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
  }, []);

  // スクロール位置から現在のスライドを算出
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  }, []);

  // Escで閉じる & body スクロールロック
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, goTo, index]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="BAKUSOQ サービス紹介"
    >
      {/* オーバーレイ */}
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
      />

      {/* パネル：スマホは全画面、PCは縦長カード */}
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-navy-900 shadow-2xl sm:h-[min(88vh,720px)] sm:w-[min(92vw,420px)] sm:rounded-3xl">
        {/* 背景の装飾グロー */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-navy-600/40 blur-3xl"
        />

        {/* 閉じるボタン */}
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        {/* スライドトラック（横スワイプ） */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="relative z-10 flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SLIDES.map((Slide, i) => (
            <Slide key={i} />
          ))}
        </div>

        {/* フッター：ドット + 矢印 */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 bg-navy-900/80 px-5 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="前へ"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-25"
          >
            <ChevronIcon className="h-5 w-5 rotate-180" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`スライド${i + 1}へ`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-cyan-400" : "w-2 bg-white/25"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === SLIDE_COUNT - 1}
            aria-label="次へ"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-25"
          >
            <ChevronIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- サイドバー用バナー（トリガー） ------------------------- */

export function BakusoqSidebarBanner() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 p-5">
      <p className="font-serif text-lg font-bold leading-snug text-slate-900">
        見積もり作成を、もっと速く正確に。
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        拾い出しから内訳作成までの手戻りを減らし、担当者ごとのばらつきを抑えます。
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
      >
        資料を見る
        <ArrowIcon className="h-4 w-4" />
      </button>

      {open && <Modal onClose={() => setOpen(false)} />}
    </div>
  );
}
