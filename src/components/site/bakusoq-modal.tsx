"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
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
        解体経験がなくても作れて
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

/** 理由パネル下部の薄い街並み・工事シルエット */
function ReasonSkyline() {
  return (
    <svg
      className="baku-reason-skyline"
      viewBox="0 0 480 140"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
    >
      <path
        fill="#9ec8f0"
        opacity="0.55"
        d="M0 140V88h18v-22h14v22h10V60h16v28h12V48h10v12h8V72h14v-18h12v18h8V55h18v33h10V40h14v20h8V70h16v-28h12v38h10V52h20v36h8V64h14v24h10V78h16v-30h12v30h8V58h18v30h10V46h16v42h12V70h14v22h10V88h22v52H0z"
      />
      <path
        fill="#7eb4e8"
        opacity="0.5"
        d="M40 140V70h8v-28h6v8h4v-12h6v32h8V50h10v40h6V62h12v28h8V55h6v-20h5v20h5v35h8V68h14v32h6V78h10v22h8V90h18v50H40z"
      />
      {/* crane */}
      <g fill="#8fbfeb" opacity="0.65">
        <rect x="318" y="48" width="3" height="92" />
        <path d="M250 56h140v3H250z" />
        <path d="M320 48l-8-14h6l6 14h-4z" />
        <path d="M390 56l4 22h-3l-3-22z" />
        <rect x="392" y="76" width="10" height="7" rx="1" />
        <path d="M321 56v40" stroke="#8fbfeb" strokeWidth="1.5" fill="none" />
      </g>
      <path
        fill="#a8d0f2"
        opacity="0.45"
        d="M0 118c40-8 80 6 120 0s70-10 110 2 80 4 120-2 70-2 90 4v18H0v-22z"
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
        padding: 18px 32px 0;
        -webkit-overflow-scrolling: touch;
        --baku-dark: 0;
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
        display: flex;
        flex-direction: column;
        border-radius: 24px;
        background: linear-gradient(180deg, #f5f9ff 0%, #eaf4ff 48%, #dcecff 100%);
        border: 1.5px solid #b9d8ff;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.75);
        padding: 0;
        overflow: hidden;
        min-height: 100%;
        height: 100%;
        box-sizing: border-box;
      }
      .baku-reason-copy {
        position: relative;
        z-index: 2;
        flex: 0 0 auto;
        padding: 16px 16px 6px 18px;
      }
      .baku-reason-title {
        margin: 0;
        font-size: 28px;
        font-weight: 900;
        color: #1674e8;
        letter-spacing: -0.03em;
        line-height: 1.15;
      }
      .baku-reason-sub {
        margin: 8px 0 10px;
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
      }
      .baku-reason-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 100%;
        width: 100%;
      }
      .baku-reason-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.35;
        color: #0f172a;
        white-space: nowrap;
      }
      .baku-check {
        width: 22px;
        height: 22px;
        flex-shrink: 0;
      }
      /* 下半分：街並み背景 + 大きめ人物 */
      .baku-reason-visual {
        position: relative;
        flex: 1 1 auto;
        min-height: 168px;
        margin-top: 2px;
      }
      .baku-reason-skyline {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 78%;
        pointer-events: none;
        z-index: 0;
      }
      .baku-reason-illust {
        position: absolute;
        right: -4%;
        bottom: -6%;
        width: min(78%, 270px);
        height: auto;
        max-height: 100%;
        object-fit: contain;
        object-position: bottom right;
        pointer-events: none;
        z-index: 1;
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

      .baku-flow {
        display: flex;
        justify-content: center;
        padding: 0;
        margin-bottom: -4px;
      }
      .baku-flow-img {
        width: min(100%, 520px);
        height: auto;
        display: block;
      }

      /* Demo — 白→シアン→ダークへスクロール遷移 */
      .baku-demo {
        position: relative;
        margin: 0 -32px 0;
        /* 末尾に約3cmぶんのスクロール余白 */
        padding: 12px 32px 120px;
        overflow: hidden;
        background:
          radial-gradient(
            ellipse 80% 55% at 50% 42%,
            rgba(34, 211, 238, calc(0.22 * var(--baku-dark))) 0%,
            transparent 62%
          ),
          linear-gradient(
            180deg,
            #ffffff 0%,
            #f3faff calc(10% - var(--baku-dark) * 4%),
            #9ad8ff calc(22% - var(--baku-dark) * 4%),
            #123a66 calc(42% + var(--baku-dark) * 4%),
            #06101f 68%,
            #020617 100%
          );
      }
      .baku-demo::before {
        content: "";
        position: absolute;
        inset: 28% 0 0;
        background-image:
          linear-gradient(rgba(34, 211, 238, 0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 211, 238, 0.07) 1px, transparent 1px);
        background-size: 36px 36px;
        opacity: calc(0.25 + 0.75 * var(--baku-dark));
        pointer-events: none;
        mask-image: linear-gradient(180deg, transparent 0%, #000 30%, #000 100%);
      }
      .baku-demo-inner {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .baku-demo-img-wrap {
        position: relative;
        width: min(100%, 640px);
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid rgba(34, 211, 238, calc(0.25 + 0.45 * var(--baku-dark)));
        box-shadow:
          0 0 calc(28px * var(--baku-dark)) rgba(34, 211, 238, calc(0.35 * var(--baku-dark))),
          0 24px 48px rgba(0, 0, 0, 0.45);
        transform: translateY(calc((1 - var(--baku-dark)) * 12px)) scale(calc(0.98 + 0.02 * var(--baku-dark)));
        opacity: calc(0.75 + 0.25 * var(--baku-dark));
      }
      .baku-demo-img {
        width: 100%;
        height: auto;
        display: block;
      }
      /* デモ画像のフォーム枠内 — 発光アニメ */
      .baku-demo-link {
        position: absolute;
        left: 13%;
        right: 13%;
        bottom: 3.2%;
        z-index: 2;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 52px;
        padding: 0 20px;
        border-radius: 999px;
        font-size: 17px;
        font-weight: 900;
        letter-spacing: -0.02em;
        color: #f4f9ff;
        text-decoration: none;
        text-align: center;
        white-space: nowrap;
        border: 1px solid rgba(160, 220, 255, 0.55);
        background:
          linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 38%),
          linear-gradient(180deg, #5eb6ff 0%, #2f8fff 42%, #1674e8 78%, #0b4ea8 100%);
        box-shadow:
          0 0 0 1px rgba(140, 200, 255, 0.28),
          0 0 22px rgba(56, 160, 255, 0.45),
          0 8px 18px rgba(0, 0, 0, 0.4),
          inset 0 -2px 6px rgba(0, 0, 0, 0.22);
        animation: baku-btn-glow 2.4s ease-in-out infinite;
        transition: filter .15s ease, transform .15s ease;
      }
      .baku-demo-link:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
        animation-duration: 1.4s;
      }
      @keyframes baku-btn-glow {
        0%, 100% {
          box-shadow:
            0 0 0 1px rgba(140, 200, 255, 0.28),
            0 0 18px rgba(56, 160, 255, 0.4),
            0 8px 18px rgba(0, 0, 0, 0.4),
            inset 0 -2px 6px rgba(0, 0, 0, 0.22);
        }
        50% {
          box-shadow:
            0 0 0 1px rgba(200, 235, 255, 0.55),
            0 0 36px rgba(80, 190, 255, 0.75),
            0 0 60px rgba(56, 160, 255, 0.35),
            0 8px 18px rgba(0, 0, 0, 0.4),
            inset 0 -2px 6px rgba(0, 0, 0, 0.18);
        }
      }

      @media (max-width: 980px) {
        .baku-shell {
          width: 100vw;
          height: 100dvh;
          max-height: 100dvh;
          border-radius: 0;
        }
        .baku-scroll { padding: 16px 16px 0; }
        .baku-demo {
          margin-left: -16px;
          margin-right: -16px;
          padding: 8px 16px 100px;
        }
        .baku-demo-link {
          left: 10%;
          right: 10%;
          bottom: 2.8%;
          min-height: 46px;
          font-size: 14px;
          padding: 0 12px;
          white-space: normal;
        }
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
        .baku-reason-item { white-space: normal; }
        .baku-reason-visual { min-height: 150px; }
        .baku-reason-illust { width: min(70%, 220px); }
        .baku-sols { grid-template-columns: 1fr 1fr; }
        .baku-sol { height: auto; min-height: 200px; }
        .baku-flow-img { width: min(100%, 360px); }
      }
    `}</style>
  );
}

function Modal({ onClose }: { onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dark, setDark] = useState(0);

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

  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;

    const update = () => {
      const demo = sc.querySelector<HTMLElement>(".baku-demo");
      if (!demo) return;
      const start = demo.offsetTop - sc.clientHeight * 0.95;
      const end = demo.offsetTop + Math.min(220, demo.offsetHeight * 0.35);
      const t = (sc.scrollTop - start) / Math.max(1, end - start);
      setDark(Math.min(1, Math.max(0, t)));
    };

    update();
    sc.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      sc.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

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
        <div
          className="baku-scroll"
          ref={scrollRef}
          style={{ "--baku-dark": dark } as CSSProperties}
        >
          <div className="baku-stack" style={{ paddingBottom: 0 }}>
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
                <div className="baku-reason-copy">
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
                </div>
                <div className="baku-reason-visual" aria-hidden>
                  <ReasonSkyline />
                  <Image
                    src={`${ILLUST}/reason-worker.png`}
                    alt=""
                    width={270}
                    height={180}
                    className="baku-reason-illust"
                    unoptimized
                  />
                </div>
              </aside>
            </section>

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

            <section className="baku-flow" aria-label="ここを変えると">
              <Image
                src={`${ILLUST}/flow-line.png`}
                alt="ここを変えると、見積の不安が減り現場も営業も前に進む。お気軽にお問い合わせください"
                width={1024}
                height={768}
                className="baku-flow-img"
                unoptimized
              />
            </section>

          </div>

          <section className="baku-demo" aria-label="BAKUSOQ 見積もり体験">
            <div className="baku-demo-inner">
              <div className="baku-demo-img-wrap">
                <Image
                  src={`${ILLUST}/demo-ai.png`}
                  alt="BAKUSOQ AI 見積もり体験デモ画面"
                  width={1024}
                  height={1010}
                  className="baku-demo-img"
                  unoptimized
                />
                <a
                  href={BAKUSOQ_HP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="baku-demo-link"
                >
                  BAKUSOQ体験をしてみる
                </a>
              </div>
            </div>
          </section>
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
