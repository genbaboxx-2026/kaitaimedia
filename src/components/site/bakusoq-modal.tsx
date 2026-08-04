"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowIcon } from "@/components/site/icons";

/* ============================================================
   BAKUSOQ 紹介モーダル
   悩み → 納得（仕方ない理由）→ 解決 → LINE / HP 導線
   ============================================================ */

const BAKUSOQ_HP_URL = "https://bakusoq-hp.vercel.app/";
/** LINE公式のURL。未設定時はHPへフォールバック */
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

const WORRIES = [
  "まだ平米単価や坪単価で見積もりを作っていませんか？",
  "その単価、いつから前の単価を使い続けていますか？",
  "利益率が見えないまま、値引きしていませんか？",
  "営業が入ったのはいいけど、教育が難しくありませんか？",
] as const;

const REASONS = [
  {
    title: "現場条件が複雑すぎる",
    body: "構造・搬出・周辺環境・産廃——変数が多く、単価表一枚では現実に追いつきません。",
  },
  {
    title: "単価の更新が後回しになる",
    body: "忙しい現場の合間にマスタを見直す余裕がなく、古い数字が「会社の常識」として残り続けます。",
  },
  {
    title: "値引き判断が感覚頼み",
    body: "原価の内訳が見えないと、どこまで下げてよいかがわからず、利益を削る交渉になりがちです。",
  },
  {
    title: "育成に時間がかかる",
    body: "ベテランの頭の中にある勘と経験を、新人営業に短期間で渡すのはとても難しい。",
  },
] as const;

const SOLUTIONS = [
  {
    title: "しっかり爆速",
    body: "現場条件を入れるだけで積算が走る。提出までのリードタイムを一気に短縮します。",
  },
  {
    title: "原価を積み上げるから精度が高い",
    body: "単価の丸め込みではなく、原価の積み上げで組むので、根拠のある数字になります。",
  },
  {
    title: "解体経験がなくても作れる",
    body: "手順が標準化されているので、新人営業でも見積が作れる。成長のスピードが変わります。",
  },
  {
    title: "根拠がわかるからチェックが早い",
    body: "なぜその金額なのかが一目でわかるので、上司の確認・承認もスムーズです。",
  },
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

      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f4f8fb] shadow-xl sm:h-[min(90vh,880px)] sm:max-w-3xl sm:rounded-2xl">
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
          <h2 className="mt-1 flex flex-wrap items-center gap-2 text-[24px] font-black tracking-tight text-slate-900 sm:text-[30px]">
            <span>こんな悩み、ありませんか？</span>
            <BoltIcon className="h-6 w-6 text-sky-500 sm:h-7 sm:w-7" />
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            解体見積の「なんとなく」を、根拠とスピードに変える話です。
          </p>
        </header>

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
          {/* 1. 悩み */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] text-sky-600">
              WORRIES
            </p>
            <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
              現場の見積、こんな状態になっていませんか
            </h3>
            <ul className="mt-4 space-y-2.5">
              {WORRIES.map((w) => (
                <li
                  key={w}
                  className="flex gap-3 rounded-xl border border-white bg-white px-4 py-3.5 shadow-sm shadow-sky-900/5"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sm font-black text-sky-600"
                  >
                    ?
                  </span>
                  <p className="text-[14px] font-bold leading-snug text-slate-800">
                    {w}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* 2. 仕方ない理由 */}
          <section className="mt-8 sm:mt-10">
            <p className="text-[11px] font-bold tracking-[0.14em] text-sky-600">
              WHY
            </p>
            <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
              それは仕方ないです
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              平米・坪単価に頼ったり、教育が難しかったりするのは、現場のせいでも人のせいでもありません。構造的にこうなりやすいからです。
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {REASONS.map((r) => (
                <li
                  key={r.title}
                  className="rounded-xl border border-white bg-white p-4 shadow-sm shadow-sky-900/5"
                >
                  <p className="text-sm font-bold text-slate-900">{r.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                    {r.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. 解決 */}
          <section className="mt-8 sm:mt-10">
            <p className="text-[11px] font-bold tracking-[0.14em] text-sky-600">
              SOLUTION
            </p>
            <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
              そこを、BAKUSOQが解決します
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              原価を積み上げる積算で、速さ・精度・育成・チェックまで一気に変えます。
            </p>
            <ul className="mt-4 space-y-3">
              {SOLUTIONS.map((s) => (
                <li
                  key={s.title}
                  className="flex gap-3 rounded-xl border border-sky-100 bg-white p-3.5 shadow-sm shadow-sky-900/5"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{s.title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* 4. CTA */}
          <section className="mt-8 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5 sm:mt-10 sm:p-6">
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              ぜひ LINE 登録して、情報を集めよう
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              最新の使い方や導入のヒントを、LINEでお届けします。公式サイトもあわせてご覧ください。
            </p>
            <div className="mt-5 hidden gap-3 sm:flex">
              <a
                href={BAKUSOQ_LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#06C755] px-4 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-opacity hover:opacity-95"
              >
                LINE登録してはじめる
                <ArrowIcon className="h-4 w-4" />
              </a>
              <a
                href={BAKUSOQ_HP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50"
              >
                <BoltIcon className="h-4 w-4 text-sky-500" />
                公式HPを見る
              </a>
            </div>
            <p className="mt-3 hidden text-[12px] text-slate-500 sm:block">
              HP:{" "}
              <a
                href={BAKUSOQ_HP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sky-700 underline-offset-2 hover:underline"
              >
                {BAKUSOQ_HP_URL}
              </a>
            </p>
          </section>

          <div className="h-24 sm:hidden" aria-hidden />
        </div>

        <div className="relative z-10 shrink-0 border-t border-sky-100 bg-white/95 px-4 py-3 backdrop-blur-sm sm:hidden">
          <div className="flex gap-2">
            <a
              href={BAKUSOQ_LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-xl bg-[#06C755] text-sm font-bold text-white shadow-sm"
            >
              LINE登録
            </a>
            <a
              href={BAKUSOQ_HP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800"
            >
              公式HP
            </a>
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
