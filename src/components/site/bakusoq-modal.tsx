"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowIcon } from "@/components/site/icons";

/* ============================================================
   BAKUSOQ 紹介モーダル
   悩み → 納得 → 解決 → LINE / HP（アニメーション付き）
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

/** 悩みカード用のフレンドリーなフラットアイコン */
function WorryIcon({
  kind,
}: {
  kind: "ruler" | "clock" | "discount" | "people";
}) {
  const common = "h-5 w-5";
  if (kind === "ruler") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <rect x="4" y="7" width="16" height="10" rx="2" fill="#E0F2FE" stroke="#0EA5E9" strokeWidth="1.6" />
        <path d="M8 10v4M12 10v4M16 10v4" stroke="#0284C7" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "clock") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <circle cx="12" cy="12" r="8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.6" />
        <path d="M12 8v4l2.5 1.5" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "discount") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path d="M5 12l7-7h5l2 2v5l-7 7-7-7z" fill="#FFE4E6" stroke="#F43F5E" strokeWidth="1.5" />
        <circle cx="15" cy="9" r="1.2" fill="#E11D48" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
      <circle cx="9" cy="9" r="3" fill="#CCFBF1" stroke="#14B8A6" strokeWidth="1.4" />
      <circle cx="16" cy="10" r="2.5" fill="#E0F2FE" stroke="#0EA5E9" strokeWidth="1.4" />
      <path d="M4 18c1-2.5 3-3.5 5-3.5s4 1 5 3.5" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 18c.6-1.5 1.8-2.2 3-2.2s2.2.6 2.8 2.2" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const WORRIES = [
  {
    text: "まだ平米単価や坪単価で見積もりを作っていませんか？",
    icon: "ruler" as const,
  },
  {
    text: "その単価、いつから前の単価を使い続けていますか？",
    icon: "clock" as const,
  },
  {
    text: "利益率が見えないまま、値引きしていませんか？",
    icon: "discount" as const,
  },
  {
    text: "営業が入ったのはいいけど、教育が難しくありませんか？",
    icon: "people" as const,
  },
] as const;

const REASONS = [
  {
    title: "現場条件が複雑すぎる",
    body: "構造・搬出・周辺環境・産廃——変数が多く、単価表一枚では現実に追いつきません。",
    tone: "sky" as const,
  },
  {
    title: "単価の更新が後回しになる",
    body: "忙しい現場の合間にマスタを見直す余裕がなく、古い数字が「会社の常識」として残り続けます。",
    tone: "amber" as const,
  },
  {
    title: "値引き判断が感覚頼み",
    body: "原価の内訳が見えないと、どこまで下げてよいかがわからず、利益を削る交渉になりがちです。",
    tone: "rose" as const,
  },
  {
    title: "育成に時間がかかる",
    body: "ベテランの頭の中にある勘と経験を、新人営業に短期間で渡すのはとても難しい。",
    tone: "teal" as const,
  },
] as const;

const TONE_BG: Record<(typeof REASONS)[number]["tone"], string> = {
  sky: "from-sky-100 to-sky-50 text-sky-700",
  amber: "from-amber-100 to-amber-50 text-amber-700",
  rose: "from-rose-100 to-rose-50 text-rose-700",
  teal: "from-teal-100 to-teal-50 text-teal-700",
};

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

const STORY_STEPS = [
  { n: "01", label: "悩み" },
  { n: "02", label: "理由" },
  { n: "03", label: "解決" },
  { n: "04", label: "次へ" },
] as const;

function ModalStyles() {
  return (
    <style>{`
      @keyframes baku-panel-in {
        from { opacity: 0; transform: translateY(18px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes baku-fade-up {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes baku-pop {
        0% { opacity: 0; transform: scale(0.85); }
        70% { transform: scale(1.04); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes baku-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes baku-pulse-soft {
        0%, 100% { box-shadow: 0 0 0 0 rgba(6, 199, 85, 0.35); }
        50% { box-shadow: 0 0 0 10px rgba(6, 199, 85, 0); }
      }
      @keyframes baku-bolt {
        0%, 100% { transform: rotate(-6deg) scale(1); }
        50% { transform: rotate(6deg) scale(1.08); }
      }
      @keyframes baku-draw {
        from { transform: scaleX(0); }
        to { transform: scaleX(1); }
      }
      .baku-panel { animation: baku-panel-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
      .baku-fade { animation: baku-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
      .baku-pop { animation: baku-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
      .baku-float { animation: baku-float 4.5s ease-in-out infinite; }
      .baku-pulse { animation: baku-pulse-soft 2.2s ease-out infinite; }
      .baku-bolt { animation: baku-bolt 2s ease-in-out infinite; display: inline-block; }
      .baku-draw { transform-origin: left; animation: baku-draw 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
      .baku-card {
        transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
      }
      .baku-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 28px -12px rgba(14, 165, 233, 0.35);
        border-color: rgba(14, 165, 233, 0.35);
      }
      @media (prefers-reduced-motion: reduce) {
        .baku-panel, .baku-fade, .baku-pop, .baku-float, .baku-pulse, .baku-bolt, .baku-draw {
          animation: none !important;
        }
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
      <ModalStyles />
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
      />

      <div className="baku-panel relative flex h-full w-full flex-col overflow-hidden bg-[#f7fbff] shadow-2xl shadow-sky-900/20 sm:h-[min(92vh,900px)] sm:max-w-3xl sm:rounded-3xl">
        {/* 装飾バブル */}
        <div
          aria-hidden
          className="baku-float pointer-events-none absolute -right-10 top-16 h-40 w-40 rounded-full bg-sky-300/30 blur-2xl"
        />
        <div
          aria-hidden
          className="baku-float pointer-events-none absolute -left-12 bottom-40 h-44 w-44 rounded-full bg-amber-200/35 blur-2xl"
          style={{ animationDelay: "1.2s" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(251,191,36,0.1), transparent 35%)",
          }}
        />

        {/* ヘッダー */}
        <header className="relative z-10 shrink-0 border-b border-sky-100/80 bg-white/75 px-5 py-5 backdrop-blur-md sm:px-8 sm:py-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-all hover:rotate-90 hover:bg-slate-100 hover:text-slate-700 sm:right-5 sm:top-5"
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          <p className="baku-fade text-[11px] font-bold tracking-[0.16em] text-sky-600">
            BAKUSOQ STORY
          </p>
          <h2
            className="baku-fade mt-1.5 flex flex-wrap items-center gap-2 text-[24px] font-black tracking-tight text-slate-900 sm:text-[30px]"
            style={{ animationDelay: "0.06s" }}
          >
            <span>こんな悩み、ありませんか？</span>
            <span className="baku-bolt text-sky-500">
              <BoltIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
          </h2>
          <p
            className="baku-fade mt-2 max-w-xl text-sm leading-relaxed text-slate-600"
            style={{ animationDelay: "0.12s" }}
          >
            解体見積の「なんとなく」を、根拠とスピードに変える話です。
          </p>

          {/* ストーリー進行バー */}
          <ol
            className="baku-fade mt-4 flex items-center gap-1.5 sm:gap-2"
            style={{ animationDelay: "0.18s" }}
            aria-label="ストーリーの流れ"
          >
            {STORY_STEPS.map((s, i) => (
              <li key={s.n} className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                <span className="baku-pop flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-sky-500 px-2.5 text-[11px] font-bold text-white shadow-sm shadow-sky-500/30 sm:px-3"
                  style={{ animationDelay: `${0.2 + i * 0.08}s` }}
                >
                  <span className="opacity-80">{s.n}</span>
                  <span>{s.label}</span>
                </span>
                {i < STORY_STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="baku-draw h-[2px] flex-1 rounded-full bg-gradient-to-r from-sky-400 to-sky-200"
                    style={{ animationDelay: `${0.35 + i * 0.1}s` }}
                  />
                )}
              </li>
            ))}
          </ol>
        </header>

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
          {/* 1. 悩み */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.16em] text-sky-600">
              WORRIES
            </p>
            <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
              現場の見積、こんな状態になっていませんか
            </h3>
            <ul className="mt-4 space-y-2.5">
              {WORRIES.map((w, i) => (
                <li
                  key={w.text}
                  className="baku-fade baku-card flex gap-3 rounded-2xl border border-sky-100/80 bg-white/90 px-4 py-3.5 shadow-sm shadow-sky-900/5"
                  style={{ animationDelay: `${0.15 + i * 0.07}s` }}
                >
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-white ring-1 ring-sky-100">
                    <WorryIcon kind={w.icon} />
                  </span>
                  <p className="self-center text-[14px] font-bold leading-snug text-slate-800">
                    {w.text}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* 2. 仕方ない理由 */}
          <section className="mt-9 sm:mt-11">
            <div className="mb-4 flex items-center gap-3">
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-200 to-transparent"
              />
              <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-100">
                でも、それって…
              </span>
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-200 to-transparent"
              />
            </div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-amber-600">
              WHY
            </p>
            <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
              それは仕方ないです
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              平米・坪単価に頼ったり、教育が難しかったりするのは、現場のせいでも人のせいでもありません。構造的にこうなりやすいからです。
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {REASONS.map((r, i) => (
                <li
                  key={r.title}
                  className="baku-fade baku-card rounded-2xl border border-amber-100/80 bg-white/90 p-4 shadow-sm shadow-amber-900/5"
                  style={{ animationDelay: `${0.2 + i * 0.07}s` }}
                >
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span
                      aria-hidden
                      className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-[11px] font-black ${TONE_BG[r.tone]}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {r.title}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                    {r.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. 解決 */}
          <section className="mt-9 sm:mt-11">
            <div className="relative overflow-hidden rounded-3xl border border-sky-200/80 bg-gradient-to-br from-sky-500 via-sky-500 to-cyan-500 p-[1px] shadow-lg shadow-sky-500/20">
              <div className="rounded-[1.4rem] bg-white px-4 py-5 sm:px-6 sm:py-6">
                <p className="text-[11px] font-bold tracking-[0.16em] text-sky-600">
                  SOLUTION
                </p>
                <h3 className="mt-1 flex flex-wrap items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
                  そこを、BAKUSOQが解決します
                  <span className="baku-bolt inline-flex text-sky-500">
                    <BoltIcon className="h-5 w-5" />
                  </span>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  原価を積み上げる積算で、速さ・精度・育成・チェックまで一気に変えます。
                </p>
                <ul className="mt-4 space-y-2.5">
                  {SOLUTIONS.map((s, i) => (
                    <li
                      key={s.title}
                      className="baku-fade baku-card flex gap-3 rounded-2xl border border-sky-100 bg-sky-50/50 p-3.5"
                      style={{ animationDelay: `${0.25 + i * 0.07}s` }}
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm shadow-sky-500/40">
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
              </div>
            </div>
          </section>

          {/* 4. CTA */}
          <section className="baku-fade mt-8 rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm sm:mt-10 sm:p-6"
            style={{ animationDelay: "0.35s" }}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#06C755] text-white shadow-md shadow-emerald-500/30"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 3C6.5 3 2 6.6 2 11c0 4 3.4 7.3 8 8.1V22l3.2-2.7c.3 0 .5.05.8.05 5.5 0 10-3.6 10-8.05S17.5 3 12 3z" />
                </svg>
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                  ぜひ LINE 登録して、情報を集めよう
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  最新の使い方や導入のヒントを、LINEでお届けします。公式サイトもあわせてどうぞ。
                </p>
              </div>
            </div>
            <div className="mt-5 hidden gap-3 sm:flex">
              <a
                href={BAKUSOQ_LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="baku-pulse inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#06C755] px-4 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                LINE登録してはじめる
                <ArrowIcon className="h-4 w-4" />
              </a>
              <a
                href={BAKUSOQ_HP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl border border-sky-200 bg-white px-4 text-sm font-bold text-slate-800 transition-all hover:border-sky-400 hover:bg-sky-50"
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
              className="baku-pulse inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-2xl bg-[#06C755] text-sm font-bold text-white"
            >
              LINE登録
            </a>
            <a
              href={BAKUSOQ_HP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sm font-bold text-slate-800"
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
