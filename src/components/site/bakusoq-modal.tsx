"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";

/* ============================================================
   BAKUSOQ 紹介モーダル
   参考画像準拠：独立悩みカード / 巨大タイトル / 青ヘッダー解決カード
   ============================================================ */

const BAKUSOQ_HP_URL = "https://bakusoq-hp.vercel.app/";
const BAKUSOQ_LINE_URL =
  process.env.NEXT_PUBLIC_BAKUSOQ_LINE_URL || BAKUSOQ_HP_URL;
const ILLUST = "/promo/bakusoq-illust";

const WORRIES: { no: string; text: ReactNode; img: string }[] = [
  {
    no: "01",
    text: (
      <>
        まだ
        <em>平米単価や坪単価</em>
        で
        <br />
        見積もりを作っていませんか？
      </>
    ),
    img: `${ILLUST}/worry-01.png`,
  },
  {
    no: "02",
    text: (
      <>
        その単価、いつから
        <br />
        <em>前の単価</em>
        を使っていますか？
      </>
    ),
    img: `${ILLUST}/worry-02.png`,
  },
  {
    no: "03",
    text: (
      <>
        <em>利益率</em>
        が見えないまま、
        <br />
        値引きしていませんか？
      </>
    ),
    img: `${ILLUST}/worry-03.png`,
  },
  {
    no: "04",
    text: (
      <>
        営業が入ったはいいけど、
        <br />
        <em>教育</em>
        が難しくありませんか？
      </>
    ),
    img: `${ILLUST}/worry-04.png`,
  },
];

const REASONS = [
  "現場ごとに条件が違いすぎる",
  "単価や原価の更新が後回しになる",
  "データが属人化し、共有しづらい",
  "新人が経験を積むには時間がかかる",
];

const SOLUTIONS = [
  {
    head: "しっかり爆速",
    body: (
      <>
        見積もり作成を
        <br />
        圧倒的なスピードでサポート！
      </>
    ),
    img: `${ILLUST}/sol-rocket.png`,
  },
  {
    head: "精度が高い",
    body: (
      <>
        原価を積み上げるから
        <br />
        根拠のある見積もりが作れる！
      </>
    ),
    img: `${ILLUST}/sol-blocks.png`,
  },
  {
    head: "即戦力に",
    body: (
      <>
        解体経験がなくても作れる
        <br />
        新人も早く成長できる！
      </>
    ),
    img: `${ILLUST}/sol-growth.png`,
  },
  {
    head: "チェックが早い",
    body: (
      <>
        根拠がわかるから
        <br />
        社内確認や説明もスムーズ！
      </>
    ),
    img: `${ILLUST}/sol-check.png`,
  },
];

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="baku-check" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#1674E8" />
      <path
        d="M7 12.2l3.2 3.2L17.5 8"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function Scribble() {
  return (
    <svg
      viewBox="0 0 56 56"
      className="baku-scribble"
      aria-hidden
      fill="none"
    >
      <path
        d="M28 8c10 2 16 10 14 18-2 10-12 14-20 10C12 32 10 20 16 14c5-5 14-3 16 4 2 6-2 12-8 12"
        stroke="#1e293b"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M34 38c6 1 10 5 9 10"
        stroke="#1e293b"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Underline() {
  return (
    <svg viewBox="0 0 320 18" className="baku-underline" aria-hidden>
      <path
        d="M4 10c40-8 80 6 120 0s80-8 120 2 60 2 72-2"
        stroke="#1674E8"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function Spark() {
  return (
    <svg viewBox="0 0 28 28" className="baku-spark" aria-hidden>
      <path
        d="M14 2l2.2 8.2L24 14l-7.8 3.8L14 26l-2.2-8.2L4 14l7.8-3.8L14 2z"
        fill="#F5A623"
      />
    </svg>
  );
}

function DownArrow() {
  return (
    <svg viewBox="0 0 48 48" className="baku-down" aria-hidden>
      <circle cx="24" cy="24" r="24" fill="#1674E8" />
      <path
        d="M24 12v18M16 24l8 10 8-10"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function Globe() {
  return (
    <svg viewBox="0 0 40 40" className="baku-globe" aria-hidden>
      <circle cx="20" cy="20" r="17" stroke="#1674E8" strokeWidth="2.4" fill="#E8F3FF" />
      <ellipse cx="20" cy="20" rx="7" ry="17" stroke="#1674E8" strokeWidth="2" fill="none" />
      <path d="M4 20h32M20 3c5 5 7.5 10 7.5 17S25 32 20 37M20 3c-5 5-7.5 10-7.5 17S15 32 20 37" stroke="#1674E8" strokeWidth="2" fill="none" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ModalStyles() {
  return (
    <style>{`
      .baku-shell {
        width: min(1080px, calc(100vw - 40px));
        max-height: calc(100vh - 24px);
        border-radius: 24px;
        overflow: hidden;
        background: #ffffff;
        box-shadow: 0 28px 70px rgba(15, 23, 42, 0.3);
        display: flex;
        flex-direction: column;
      }
      .baku-scroll {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        background: #fff;
        padding: 18px 32px 28px;
        -webkit-overflow-scrolling: touch;
      }
      .baku-stack {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .baku-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 36px;
        flex-shrink: 0;
      }
      .baku-logo {
        font-size: 26px;
        font-weight: 900;
        font-style: italic;
        letter-spacing: 0.04em;
        color: #1674e8;
        line-height: 1;
      }
      .baku-close {
        width: 38px;
        height: 38px;
        border-radius: 999px;
        background: #fff;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(15,23,42,.12);
        color: #475569;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .baku-title-wrap {
        position: relative;
        display: inline-block;
        padding-right: 52px;
        margin: 0;
        max-width: 100%;
      }
      .baku-title {
        margin: 0;
        font-weight: 900;
        letter-spacing: -0.04em;
        color: #0f172a;
        white-space: nowrap;
        font-size: 48px;
        line-height: 1.1;
      }
      .baku-title-l1 {
        display: inline;
        font-size: inherit;
        line-height: inherit;
      }
      .baku-title-l2 {
        display: inline;
        font-size: inherit;
        line-height: inherit;
        color: #1674e8;
      }
      .baku-underline {
        display: block;
        width: min(420px, 100%);
        height: 14px;
        margin-top: 2px;
      }
      .baku-scribble {
        position: absolute;
        right: 0;
        top: 8px;
        width: 44px;
        height: 44px;
      }

      /* Mid: left = 4 rows vertical, right = reason */
      .baku-mid {
        display: grid;
        grid-template-columns: 1.08fr 0.92fr;
        gap: 16px;
        align-items: stretch;
      }
      .baku-worries {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .baku-worry-card {
        height: 92px;
        min-height: 92px;
        max-height: 92px;
        width: 100%;
        border: 1.5px solid #d7e7fb;
        border-radius: 18px;
        background: #fff;
        box-shadow: 0 2px 8px rgba(22, 116, 232, 0.06);
        display: grid;
        grid-template-columns: 42px auto 72px;
        align-items: center;
        justify-content: start;
        column-gap: 8px;
        padding: 10px 10px 10px 12px;
        box-sizing: border-box;
      }
      .baku-no {
        width: 40px;
        height: 40px;
        border-radius: 999px;
        background: #1674e8;
        color: #fff;
        font-size: 14px;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        letter-spacing: 0.02em;
      }
      .baku-worry-text {
        font-size: 15.5px;
        font-weight: 700;
        line-height: 1.45;
        color: #0f172a;
        letter-spacing: -0.02em;
        min-width: 0;
        max-width: 280px;
        padding-right: 0;
      }
      .baku-worry-text em {
        font-style: normal;
        color: #1674e8;
        font-weight: 900;
      }
      .baku-worry-face {
        width: 72px;
        height: 72px;
        object-fit: contain;
        justify-self: start;
        margin-left: -2px;
      }

      .baku-reason {
        position: relative;
        border-radius: 22px;
        background: #eef6ff;
        border: 1.5px solid #b9d8ff;
        padding: 20px 16px 16px 18px;
        overflow: hidden;
        min-height: 100%;
        box-sizing: border-box;
      }
      .baku-reason-title {
        margin: 0;
        font-size: 26px;
        font-weight: 900;
        color: #1674e8;
        letter-spacing: -0.03em;
        line-height: 1.2;
      }
      .baku-reason-sub {
        margin: 8px 0 12px;
        font-size: 17px;
        font-weight: 800;
        color: #0f172a;
      }
      .baku-reason-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: calc(100% - 108px);
        width: calc(100% - 108px);
        position: relative;
        z-index: 1;
      }
      .baku-reason-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14.5px;
        font-weight: 700;
        line-height: 1.35;
        color: #0f172a;
        white-space: nowrap;
      }
      .baku-check {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
      .baku-reason-illust {
        position: absolute;
        right: -4px;
        bottom: 2px;
        width: 112px;
        height: 98px;
        object-fit: contain;
        pointer-events: none;
      }

      .baku-solve {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 2px 0;
      }
      .baku-down {
        width: 40px;
        height: 40px;
      }
      .baku-solve-line {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        font-size: 30px;
        font-weight: 900;
        color: #0f172a;
        letter-spacing: -0.03em;
        line-height: 1.1;
      }
      .baku-solve-brand {
        font-size: 48px;
        font-weight: 900;
        font-style: italic;
        color: #1269d3;
        letter-spacing: 0.01em;
        margin: 0 4px;
      }
      .baku-spark {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      .baku-sols {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }
      .baku-sol {
        height: 210px;
        min-height: 210px;
        border-radius: 16px;
        overflow: hidden;
        border: 1.5px solid #c5ddf8;
        background: #fff;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 14px rgba(22, 116, 232, 0.08);
      }
      .baku-sol-head {
        background: #0f5ec4;
        color: #fff;
        font-size: 20px;
        font-weight: 800;
        text-align: center;
        padding: 12px 10px;
        letter-spacing: -0.02em;
        line-height: 1.2;
      }
      .baku-sol-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 10px 14px;
      }
      .baku-sol-img {
        width: 84px;
        height: 84px;
        object-fit: contain;
      }
      .baku-sol-text {
        margin: 0;
        font-size: 14.5px;
        font-weight: 700;
        line-height: 1.5;
        text-align: center;
        color: #0f172a;
      }

      /* CTA — 切れ禁止 */
      .baku-cta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        flex-shrink: 0;
      }
      .baku-cta-a, .baku-cta-b {
        min-height: 128px;
        height: auto;
        border-radius: 18px;
        padding: 20px 24px;
        display: flex;
        align-items: center;
        gap: 18px;
        text-decoration: none;
        box-sizing: border-box;
        overflow: visible;
        transition: transform .15s ease, box-shadow .15s ease;
      }
      .baku-cta-a:hover, .baku-cta-b:hover {
        transform: translateY(-2px);
      }
      .baku-cta-a {
        background: linear-gradient(135deg, #19d66a, #06b34f);
        color: #fff;
        box-shadow: 0 10px 24px rgba(6, 179, 79, 0.28);
      }
      .baku-cta-b {
        background: linear-gradient(135deg, #e8f3ff, #d5e9ff);
        color: #0f172a;
        border: 1.5px solid #9ec8f5;
        box-shadow: 0 10px 24px rgba(22, 116, 232, 0.12);
      }
      .baku-cta-side {
        width: 88px;
        height: 88px;
        object-fit: contain;
        flex-shrink: 0;
      }
      .baku-globe {
        width: 64px;
        height: 64px;
        flex-shrink: 0;
      }
      .baku-cta-copy {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
      }
      .baku-cta-kicker {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        opacity: 0.95;
        line-height: 1.3;
      }
      .baku-cta-main {
        margin: 0;
        font-size: 22px;
        font-weight: 900;
        line-height: 1.25;
        letter-spacing: -0.03em;
      }
      .baku-cta-a .baku-cta-main { color: #fff; font-size: 24px; }
      .baku-cta-b .baku-cta-main { color: #0f5ec4; font-size: 26px; }
      .baku-cta-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        align-self: flex-start;
        height: 46px;
        padding: 0 20px;
        border-radius: 999px;
        font-size: 16px;
        font-weight: 800;
        background: #fff;
        color: #06a849;
        white-space: nowrap;
      }
      .baku-cta-url {
        display: inline-flex;
        align-items: center;
        align-self: flex-start;
        height: 36px;
        padding: 0 14px;
        border-radius: 10px;
        background: #1674e8;
        color: #fff;
        font-size: 13px;
        font-weight: 700;
        white-space: nowrap;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .baku-cta-thumb {
        width: 100px;
        height: 82px;
        object-fit: contain;
        flex-shrink: 0;
      }
      .baku-foot {
        margin: 4px 0 0;
        padding-bottom: 4px;
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        line-height: 1.45;
      }

      @media (max-width: 980px) {
        .baku-shell {
          width: 100vw;
          height: 100dvh;
          max-height: 100dvh;
          border-radius: 0;
        }
        .baku-scroll { padding: 16px 16px 28px; }
        .baku-title { font-size: 28px; white-space: nowrap; }
        .baku-scribble { display: none; }
        .baku-mid { grid-template-columns: 1fr; }
        .baku-worry-card {
          height: auto;
          min-height: 88px;
          max-height: none;
          grid-template-columns: 42px 1fr 72px;
        }
        .baku-worry-text { max-width: none; }
        .baku-reason-list {
          max-width: 100%;
          width: 100%;
        }
        .baku-reason-item { white-space: normal; }
        .baku-reason-illust { opacity: 0.3; width: 96px; height: 84px; }
        .baku-solve-line { font-size: 20px; flex-wrap: wrap; }
        .baku-solve-brand { font-size: 32px; }
        .baku-sols { grid-template-columns: 1fr 1fr; }
        .baku-sol { height: auto; min-height: 200px; }
        .baku-cta { grid-template-columns: 1fr; }
        .baku-cta-a, .baku-cta-b { min-height: 120px; }
        .baku-cta-a .baku-cta-main { font-size: 20px; }
        .baku-cta-b .baku-cta-main { font-size: 22px; }
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-0 sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-label="BAKUSOQ サービス紹介"
    >
      <ModalStyles />
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="baku-shell relative z-10">
        <div className="baku-scroll">
          <div className="baku-stack">
            <div className="baku-header">
              <div className="baku-logo">BAKUSOQ</div>
              <button
                type="button"
                onClick={onClose}
                aria-label="閉じる"
                className="baku-close"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Title only — no top-right person */}
            <div className="baku-title-wrap">
              <h2 className="baku-title">
                <span className="baku-title-l1">こんな悩み、</span>
                <span className="baku-title-l2">ありませんか？</span>
              </h2>
              <Underline />
              <Scribble />
            </div>

            <section className="baku-mid">
              <div className="baku-worries">
                {WORRIES.map((w) => (
                  <article key={w.no} className="baku-worry-card">
                    <span className="baku-no">{w.no}</span>
                    <div className="baku-worry-text">{w.text}</div>
                    <Image
                      src={w.img}
                      alt=""
                      width={72}
                      height={72}
                      className="baku-worry-face"
                      unoptimized
                    />
                  </article>
                ))}
              </div>

              <aside className="baku-reason">
                <h3 className="baku-reason-title">それは仕方ないです。</h3>
                <p className="baku-reason-sub">理由は…</p>
                <ul className="baku-reason-list">
                  {REASONS.map((r) => (
                    <li key={r} className="baku-reason-item">
                      <IconCheck />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <Image
                  src={`${ILLUST}/reason-worker.png`}
                  alt=""
                  width={112}
                  height={98}
                  className="baku-reason-illust"
                  unoptimized
                />
              </aside>
            </section>

            <div className="baku-solve">
              <DownArrow />
              <div className="baku-solve-line">
                <Spark />
                <span>
                  その悩み、
                  <span className="baku-solve-brand">BAKUSOQ</span>
                  が解決します！
                </span>
                <Spark />
              </div>
            </div>

            <section className="baku-sols">
              {SOLUTIONS.map((s) => (
                <article key={s.head} className="baku-sol">
                  <div className="baku-sol-head">{s.head}</div>
                  <div className="baku-sol-body">
                    <Image
                      src={s.img}
                      alt=""
                      width={84}
                      height={84}
                      className="baku-sol-img"
                      unoptimized
                    />
                    <p className="baku-sol-text">{s.body}</p>
                  </div>
                </article>
              ))}
            </section>

            <section className="baku-cta">
              <a
                href={BAKUSOQ_LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="baku-cta-a"
              >
                <Image
                  src={`${ILLUST}/cta-phone.png`}
                  alt=""
                  width={88}
                  height={88}
                  className="baku-cta-side"
                  unoptimized
                />
                <div className="baku-cta-copy">
                  <p className="baku-cta-kicker">今すぐ情報を手に入れよう！</p>
                  <p className="baku-cta-main">
                    LINE登録で限定資料や最新情報をお届け！
                  </p>
                  <span className="baku-cta-btn">LINE登録はこちら →</span>
                </div>
              </a>

              <a
                href={BAKUSOQ_HP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="baku-cta-b"
              >
                <Globe />
                <div className="baku-cta-copy">
                  <p className="baku-cta-kicker">詳しいサービス内容はこちら</p>
                  <p className="baku-cta-main">BAKUSOQ 公式HP</p>
                  <span className="baku-cta-url">{BAKUSOQ_HP_URL}</span>
                </div>
                <Image
                  src={`${ILLUST}/cta-dash.png`}
                  alt=""
                  width={100}
                  height={82}
                  className="baku-cta-thumb"
                  unoptimized
                />
              </a>
            </section>

            <p className="baku-foot">
              最新事例や活用ノウハウなど、すぐに役立つ情報をお届けします。登録は30秒で完了・いつでも解除できます。
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
