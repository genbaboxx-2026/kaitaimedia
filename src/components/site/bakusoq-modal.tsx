"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowIcon } from "@/components/site/icons";

/* ============================================================
   BAKUSOQ 紹介モーダル
   サイトの白×ネイビー基調に合わせた縦スクロール。
   スマホは1カラム、PCは広めの2カラム構成。
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
        className="absolute inset-0 bg-slate-900/40"
      />

      {/*
        スマホ: ほぼ全画面・縦スクロール
        PC: 横長パネル（max 720px）・内側を縦スクロール
      */}
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-xl sm:h-[min(90vh,820px)] sm:max-w-3xl sm:rounded-2xl">
        {/* 固定ヘッダー */}
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-8 sm:py-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-wide text-navy-700">
              解体業向け 見積作成サービス
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              BAKUSOQ
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              解体見積に根拠を。そして爆速に。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {/* 本文：縦スクロールのみ */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
          {/* 課題 */}
          <section>
            <h3 className="border-b border-slate-200 pb-2 font-serif text-base font-bold text-slate-900 sm:text-lg">
              解体業界の3つの課題
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {PROBLEMS.map((p) => (
                <li
                  key={p.title}
                  className="rounded-lg border border-slate-200 bg-slate-50/80 p-4"
                >
                  <p className="text-sm font-bold text-slate-900">{p.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                    {p.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* 提供価値 */}
          <section className="mt-8 sm:mt-10">
            <h3 className="border-b border-slate-200 pb-2 font-serif text-base font-bold text-slate-900 sm:text-lg">
              BAKUSOQの提供価値
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
              入力から見積書まで、速く・正確に・会社基準で。
            </p>

            {/* スマホ: 縦並び / PC: 左に価値、右に Before/After */}
            <div className="mt-5 grid gap-5 sm:grid-cols-5 sm:gap-8">
              <ul className="space-y-4 sm:col-span-3">
                {VALUES.map((v) => (
                  <li key={v.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-700 text-white">
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
                <div className="rounded-lg border border-slate-200 p-3.5">
                  <p className="text-[11px] font-bold text-slate-400">Before</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-700">
                    Excel／紙で手作業。手直し多数・承認遅延で受注機会を損失。
                  </p>
                </div>
                <div className="rounded-lg border border-navy-700/20 bg-navy-50 p-3.5">
                  <p className="text-[11px] font-bold text-navy-700">After</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-700">
                    自動積算で計算ミスを抑制。提出用見積をすばやく生成し、提案スピードが上がります。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 導入ステップ & 料金 */}
          <section className="mt-8 sm:mt-10">
            <h3 className="border-b border-slate-200 pb-2 font-serif text-base font-bold text-slate-900 sm:text-lg">
              導入ステップ & 料金
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
              まずは1週間の無料トライアルから。
            </p>

            <div className="mt-5 grid gap-6 sm:grid-cols-2 sm:gap-8">
              <ol className="space-y-3">
                {STEPS.map(([t, d], i) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[12px] font-bold text-navy-700">
                      {i + 1}
                    </span>
                    <p className="text-[13px] leading-snug text-slate-700">
                      <span className="font-bold text-slate-900">{t}</span>
                      <span className="text-slate-500"> — {d}</span>
                    </p>
                  </li>
                ))}
              </ol>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">
                    BAKUSOQ スタンダード
                  </p>
                  <span className="rounded bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    期間限定 40% OFF
                  </span>
                </div>
                <p className="mt-3 flex flex-wrap items-end gap-2">
                  <span className="text-sm text-slate-400 line-through">
                    ¥50,000
                  </span>
                  <span className="text-3xl font-bold leading-none text-slate-900">
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

          {/* PC用：本文末尾のCTA（スマホは下固定バー） */}
          <div className="mt-8 hidden gap-3 sm:flex">
            <Link
              href="/contact"
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md bg-brand-600 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-700"
            >
              無料で相談・お問い合わせ
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/bakusoq"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50"
            >
              サービス紹介ページを見る
            </Link>
          </div>

          {/* スマホで固定バーに隠れないよう余白 */}
          <div className="h-24 sm:hidden" aria-hidden />
        </div>

        {/* スマホ固定CTA */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:hidden">
          <div className="flex gap-2">
            <Link
              href="/contact"
              className="inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-md bg-brand-600 text-sm font-bold text-white"
            >
              無料で相談
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/bakusoq"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-slate-300 text-sm font-bold text-slate-800"
            >
              詳しく見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** サイドバー：BAKUSOQ 案内（押下で紹介モーダルを表示） */
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
