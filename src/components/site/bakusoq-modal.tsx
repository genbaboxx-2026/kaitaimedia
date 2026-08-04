"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/site/icons";

/* ============================================================
   BAKUSOQ 紹介モーダル
   デモUIのシアン×スピード感を、明るい面で表現。
   縦スクロール。スマホ1カラム / PCは広めの2〜3カラム。
   ============================================================ */

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
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12L13 2z" />
    </svg>
  );
}

const PROBLEMS = [
  {
    title: "見積作成が遅い・属人化",
    body: "現地調査からExcel／紙への手作業の転記が必要。経験によるバラつきや桁ミスが多発し、担当者依存の業務に。",
  },
  {
    title: "社内承認の手戻り",
    body: "原価・提案金額のズレや丸め規則の不統一で承認が差し戻し。顧客への提案が遅れるリスクも。",
  },
  {
    title: "マスタ・積算ロジック統一の難しさ",
    body: "単位表記のゆれや例外処理が部署ごとにバラバラで、会社としての一貫性が保てない。",
  },
] as const;

const VALUES = [
  {
    title: "現場情報の標準化・スピード",
    body: "標準フォーマットで入力すると自動で積算・計算。スピードと精度を両立し作業時間を大幅短縮。",
  },
  {
    title: "ステップ式UIで入力ミスを削減",
    body: "直感的なステップ入力で抜け・ミスを防止。担当者による差（属人化）も解消。",
  },
  {
    title: "マスタで会社基準を統一",
    body: "単価・丸め・例外ルールを会社基準でマスタ化。部署間のばらつきを解消し社内展開も容易。",
  },
] as const;

const STEPS = [
  ["1週間トライアル", "費用負担なく使い勝手と精度を確認"],
  ["マスタ移行", "既存の単価表・計算ルールを段階的に整備"],
  ["運用テスト", "操作から実務活用までをサポート"],
  ["本稼働サポート", "専任担当が伴走型で立ち上げを支援"],
] as const;

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
      className="fixed inset-0 z-[100] flex items-stretch justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="BAKUSOQ サービス紹介"
    >
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/35"
      />

      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f4f8fb] shadow-xl sm:h-[min(90vh,840px)] sm:max-w-3xl sm:rounded-2xl">
        {/* 明るいグリッド雰囲気（暗くしすぎない） */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(14,165,233,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 bottom-24 h-48 w-48 rounded-full bg-cyan-200/30 blur-3xl"
        />

        {/* ヘッダー */}
        <header className="relative z-10 shrink-0 border-b border-sky-100/80 bg-white/80 px-5 py-5 backdrop-blur-sm sm:px-8 sm:py-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 sm:right-5 sm:top-5"
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          <p className="text-[11px] font-bold tracking-[0.14em] text-sky-600">
            BAKUSOQ
          </p>
          <h2 className="mt-1 flex flex-wrap items-center gap-2 text-[26px] font-black tracking-tight text-slate-900 sm:text-[32px]">
            <span>一瞬で見積もりに。</span>
            <BoltIcon className="h-6 w-6 text-sky-500 sm:h-7 sm:w-7" />
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            解体見積に根拠を。そして爆速に。現場条件を入れるだけで、積算ロジックが走ります。
          </p>
          <span className="mt-3 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700">
            解体業向け 見積作成サービス
          </span>
        </header>

        {/* 本文スクロール */}
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
          <section>
            <div className="flex items-end justify-between gap-3 border-b border-sky-100 pb-2">
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                解体業界の3つの課題
              </h3>
              <span className="hidden text-[11px] font-bold tracking-wide text-sky-600 sm:inline">
                CHALLENGES
              </span>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-3.5">
              {PROBLEMS.map((p, i) => (
                <li
                  key={p.title}
                  className="rounded-xl border border-white bg-white p-4 shadow-sm shadow-sky-900/5"
                >
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-sky-50 px-1.5 text-[11px] font-black text-sky-600">
                    0{i + 1}
                  </span>
                  <p className="mt-2.5 text-sm font-bold text-slate-900">{p.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                    {p.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 sm:mt-10">
            <div className="flex items-end justify-between gap-3 border-b border-sky-100 pb-2">
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                BAKUSOQの提供価値
              </h3>
              <span className="hidden text-[11px] font-bold tracking-wide text-sky-600 sm:inline">
                VALUE
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
              入力から見積書まで、速く・正確に・会社基準で。
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-5 sm:gap-6">
              <ul className="space-y-3 sm:col-span-3">
                {VALUES.map((v) => (
                  <li
                    key={v.title}
                    className="flex gap-3 rounded-xl border border-white bg-white p-3.5 shadow-sm shadow-sky-900/5"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{v.title}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">
                        {v.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-2 gap-2.5 sm:col-span-2 sm:grid-cols-1 sm:gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <p className="text-[11px] font-bold tracking-wide text-slate-400">
                    BEFORE
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-700">
                    Excel／紙で手作業。手直し多数・承認遅延で受注機会を損失。
                  </p>
                </div>
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-3.5">
                  <p className="text-[11px] font-bold tracking-wide text-sky-600">
                    AFTER
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-700">
                    自動積算で計算ミスを抑制。提出用見積をすばやく生成し、提案スピードが上がります。
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 sm:mt-10">
            <div className="flex items-end justify-between gap-3 border-b border-sky-100 pb-2">
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                導入ステップ & 料金
              </h3>
              <span className="hidden text-[11px] font-bold tracking-wide text-sky-600 sm:inline">
                PLAN
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
              まずは1週間の無料トライアルから。
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 sm:gap-6">
              <ol className="space-y-2.5 rounded-xl border border-white bg-white p-4 shadow-sm shadow-sky-900/5 sm:p-5">
                {STEPS.map(([t, d], i) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500 text-[12px] font-black text-white">
                      {i + 1}
                    </span>
                    <p className="text-[13px] leading-snug text-slate-700">
                      <span className="font-bold text-slate-900">{t}</span>
                      <span className="text-slate-500"> — {d}</span>
                    </p>
                  </li>
                ))}
              </ol>

              <div className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm shadow-sky-900/5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">
                    BAKUSOQ スタンダード
                  </p>
                  <span className="rounded-full bg-sky-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    期間限定 40% OFF
                  </span>
                </div>
                <p className="mt-3 flex flex-wrap items-end gap-2">
                  <span className="text-sm text-slate-400 line-through">
                    ¥50,000
                  </span>
                  <span className="text-3xl font-black leading-none text-sky-600">
                    ¥30,000
                  </span>
                  <span className="text-sm font-medium text-slate-600">/ 月</span>
                </p>
                <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
                  ユーザー数無制限・全機能利用可。別途 初回マスタ設定費用
                  ¥200,000。早期導入で正式リリース後も特別価格を継続。
                </p>
              </div>
            </div>
          </section>

          <div className="mt-8 hidden gap-3 sm:flex">
            <Link
              href="/contact"
              className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-sky-500 px-4 text-sm font-bold text-white shadow-md shadow-sky-500/25 transition-colors hover:bg-sky-400"
            >
              <BoltIcon className="h-4 w-4" />
              無料で相談・お問い合わせ
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/bakusoq"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50"
            >
              サービス紹介ページを見る
            </Link>
          </div>

          <div className="h-24 sm:hidden" aria-hidden />
        </div>

        {/* スマホ固定CTA */}
        <div className="relative z-10 shrink-0 border-t border-sky-100 bg-white/95 px-4 py-3 backdrop-blur-sm sm:hidden">
          <div className="flex gap-2">
            <Link
              href="/contact"
              className="inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-xl bg-sky-500 text-sm font-bold text-white shadow-sm shadow-sky-500/30"
            >
              <BoltIcon className="h-3.5 w-3.5" />
              無料で相談
            </Link>
            <Link
              href="/bakusoq"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800"
            >
              詳しく見る
            </Link>
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
        className="relative block w-full overflow-hidden rounded-xl text-left shadow-sm transition-opacity hover:opacity-95"
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
