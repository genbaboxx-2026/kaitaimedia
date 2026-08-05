"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";

/* ============================================================
   BAKUSOQ 紹介モーダル
   参考完成イメージ準拠（独自再設計なし・寸法固定）
   ============================================================ */

const BAKUSOQ_HP_URL = "https://bakusoq-hp.vercel.app/";
const BAKUSOQ_LINE_URL =
  process.env.NEXT_PUBLIC_BAKUSOQ_LINE_URL || BAKUSOQ_HP_URL;
const ILLUST = "/promo/bakusoq-illust";

const WORRIES: { text: ReactNode; icon: ReactNode }[] = [
  {
    text: (
      <>
        まだ平米単価や坪単価で
        <br />
        見積もりを作っていませんか？
      </>
    ),
    icon: <IconCalc />,
  },
  {
    text: (
      <>
        その単価、いつから
        <br />
        前の単価を使っていますか？
      </>
    ),
    icon: <IconClock />,
  },
  {
    text: (
      <>
        利益率が見えないまま、
        <br />
        値引きしていませんか？
      </>
    ),
    icon: <IconChartDown />,
  },
  {
    text: (
      <>
        営業が入ったはいいけど、
        <br />
        教育が難しい
      </>
    ),
    icon: <IconPerson />,
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
    no: "01",
    title: (
      <>
        しっかり爆速
      </>
    ),
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
    no: "02",
    title: (
      <>
        原価を積み上げるので
        <br />
        精度が高い
      </>
    ),
    body: <>根拠のある見積もりが作れる！</>,
    img: `${ILLUST}/sol-blocks.png`,
  },
  {
    no: "03",
    title: <>解体経験がない営業でも作れる</>,
    body: (
      <>
        新人も早く成長し、
        <br />
        即戦力に！
      </>
    ),
    img: `${ILLUST}/sol-growth.png`,
  },
  {
    no: "04",
    title: (
      <>
        根拠がわかるので
        <br />
        チェックが早い
      </>
    ),
    body: <>社内確認や説明もスムーズ！</>,
    img: `${ILLUST}/sol-check.png`,
  },
];

function IconCalc() {
  return (
    <svg viewBox="0 0 38 38" className="baku-wicon" aria-hidden>
      <circle cx="19" cy="19" r="19" fill="#E8F2FF" />
      <rect x="11" y="9" width="16" height="20" rx="2.5" fill="#1674E8" />
      <rect x="13.5" y="11.5" width="11" height="5" rx="1" fill="#fff" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={13.5 + c * 4}
            y={18.5 + r * 3.2}
            width="2.8"
            height="2.2"
            rx="0.4"
            fill="#fff"
          />
        )),
      )}
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 38 38" className="baku-wicon" aria-hidden>
      <circle cx="19" cy="19" r="19" fill="#E8F2FF" />
      <circle cx="19" cy="19" r="10" fill="#1674E8" />
      <circle cx="19" cy="19" r="7.5" fill="#fff" />
      <path
        d="M19 13.5v6l4 2.5"
        stroke="#1674E8"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function IconChartDown() {
  return (
    <svg viewBox="0 0 38 38" className="baku-wicon" aria-hidden>
      <circle cx="19" cy="19" r="19" fill="#E8F2FF" />
      <path
        d="M10 14l5 5 4-3 9 9"
        stroke="#1674E8"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M22 25h6v-6"
        stroke="#1674E8"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg viewBox="0 0 38 38" className="baku-wicon" aria-hidden>
      <circle cx="19" cy="19" r="19" fill="#E8F2FF" />
      <circle cx="19" cy="14" r="4.5" fill="#1674E8" />
      <path
        d="M10.5 27.5c1.6-5 5-7.5 8.5-7.5s6.9 2.5 8.5 7.5"
        fill="#1674E8"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 21 21" className="h-[18px] w-[18px] shrink-0" aria-hidden>
      <circle cx="10.5" cy="10.5" r="10.5" fill="#1674E8" />
      <path
        d="M6 10.8l3 3 6.2-6.5"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9 shrink-0 text-white" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M3.5 12h17M12 3.5c2.5 2.8 3.8 5.6 3.8 8.5S14.5 17.7 12 20.5M12 3.5C9.5 6.3 8.2 9.1 8.2 12s1.3 5.7 3.8 8.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function LineMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-16 w-16 shrink-0" aria-hidden>
      <circle cx="24" cy="24" r="24" fill="#fff" />
      <path
        d="M24 10.5c-7.3 0-13.2 4.9-13.2 11 0 5.4 4.8 9.9 11.3 10.8.4.1.9.2 1 .5.1.3.1.7 0 1.1l-.2 1.2c0 .4-.2 1.4 1.2.8 0 0 6.6-3.9 9-6.7 1.7-1.8 2.9-3.7 2.9-6.7 0-6.1-5.9-11-13-11z"
        fill="#06C755"
      />
      <text
        x="24"
        y="24.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize="9"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
      >
        LINE
      </text>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M7 7l10 10M17 7L7 17"
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
      .baku-shell {
        width: min(1080px, calc(100vw - 48px));
        height: min(880px, calc(100vh - 32px));
        max-height: calc(100vh - 32px);
        border-radius: 24px;
        overflow: hidden;
        background: #ffffff;
        box-shadow: 0 24px 64px rgba(15, 23, 42, 0.28);
        display: flex;
        flex-direction: column;
      }
      .baku-scroll {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        background: #ffffff;
        padding: 20px 32px 18px;
      }
      .baku-stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .baku-header {
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .baku-logo {
        font-size: 26px;
        font-weight: 800;
        letter-spacing: 0.04em;
        line-height: 1;
        color: #1674e8;
        font-style: italic;
      }
      .baku-close {
        width: 36px;
        height: 36px;
        border-radius: 999px;
        background: #fff;
        color: #334155;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
        border: 1px solid #e2e8f0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .baku-hero {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 24px;
        align-items: center;
        min-height: 132px;
        max-height: 148px;
      }
      .baku-title {
        font-size: 36px;
        line-height: 1.22;
        font-weight: 800;
        letter-spacing: -0.03em;
        margin: 0;
        color: #0f172a;
      }
      .baku-title-blue { color: #1674e8; }
      .baku-sub {
        font-size: 14px;
        line-height: 1.55;
        margin-top: 8px;
        color: #1e293b;
      }
      .baku-hero-visual {
        width: 300px;
        height: 132px;
        max-width: 100%;
        margin-left: auto;
        padding: 8px;
        border-radius: 16px;
        background: #eef7ff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .baku-hero-visual img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .baku-mid {
        display: grid;
        grid-template-columns: 1fr 34px 1fr;
        gap: 14px;
        align-items: stretch;
      }
      .baku-worry, .baku-reason {
        height: 248px;
        min-height: 248px;
        max-height: 248px;
        border-radius: 18px;
        position: relative;
        box-sizing: border-box;
      }
      .baku-worry {
        background: #f4f9ff;
        padding: 14px 18px 12px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .baku-reason {
        background: #eef6ff;
        border: 1px solid #b9d8ff;
        padding: 16px 18px 14px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .baku-pill {
        display: inline-flex;
        align-items: center;
        align-self: flex-start;
        height: 30px;
        padding: 0 14px;
        border-radius: 999px;
        background: #1674e8;
        color: #fff;
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 8px;
        flex-shrink: 0;
      }
      .baku-worry-list {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        min-height: 0;
      }
      .baku-worry-row {
        display: grid;
        grid-template-columns: 34px 1fr;
        align-items: center;
        gap: 10px;
        padding: 5px 0;
        border-bottom: 1px dashed #cbdff5;
      }
      .baku-worry-row:last-child { border-bottom: none; padding-bottom: 0; }
      .baku-wicon {
        width: 32px;
        height: 32px;
        display: block;
      }
      .baku-worry-text {
        font-size: 12.5px;
        line-height: 1.35;
        font-weight: 600;
        color: #0f172a;
      }
      .baku-arrow {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #1674e8;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        align-self: center;
        justify-self: center;
        flex-shrink: 0;
        box-shadow: 0 4px 10px rgba(22, 116, 232, 0.28);
      }
      .baku-reason-title {
        font-size: 18px;
        font-weight: 800;
        color: #1674e8;
        margin: 0 0 4px;
        flex-shrink: 0;
      }
      .baku-reason-sub {
        font-size: 12.5px;
        font-weight: 700;
        color: #1674e8;
        margin: 0 0 10px;
        flex-shrink: 0;
      }
      .baku-reason-list {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        gap: 0;
        flex: 1;
        position: relative;
        z-index: 1;
        max-width: calc(100% - 96px);
        min-height: 0;
        padding-bottom: 4px;
      }
      .baku-reason-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12.5px;
        line-height: 1.4;
        font-weight: 600;
        color: #0f172a;
      }
      .baku-reason-illust {
        position: absolute;
        right: 10px;
        bottom: 10px;
        width: 96px;
        height: 72px;
        object-fit: contain;
        pointer-events: none;
        opacity: 0.92;
      }
      .baku-solve {
        height: 40px;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 20px;
        font-weight: 800;
        color: #0f172a;
      }
      .baku-solve-brand {
        font-size: 26px;
        color: #1269d3;
        font-style: italic;
        font-weight: 800;
        letter-spacing: 0.02em;
      }
      .baku-sols {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }
      .baku-sol {
        height: 168px;
        min-height: 168px;
        max-height: 168px;
        border-radius: 14px;
        padding: 12px 10px 12px;
        border: 1px solid #cfe3fb;
        background: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
      }
      .baku-sol-no {
        position: absolute;
        top: 10px;
        left: 10px;
        width: 24px;
        height: 24px;
        border-radius: 999px;
        background: #1674e8;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .baku-sol-img {
        width: 56px;
        height: 56px;
        margin: 22px auto 8px;
        object-fit: contain;
        flex-shrink: 0;
      }
      .baku-sol-title {
        font-size: 13.5px;
        line-height: 1.35;
        font-weight: 800;
        color: #075bbd;
        text-align: center;
        margin: 0;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .baku-sol-body {
        font-size: 11.5px;
        line-height: 1.4;
        text-align: center;
        color: #1e293b;
        margin: 0;
        flex-shrink: 0;
      }
      .baku-cta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .baku-cta-a, .baku-cta-b {
        height: 96px;
        border-radius: 16px;
        padding: 16px 22px;
        display: flex;
        align-items: center;
        gap: 16px;
        text-decoration: none;
        color: #fff;
        overflow: hidden;
        box-sizing: border-box;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .baku-cta-a:hover, .baku-cta-b:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.16);
      }
      .baku-cta-a {
        background: linear-gradient(135deg, #1ad66a, #06b34f);
      }
      .baku-cta-b {
        background: linear-gradient(135deg, #2d88f0, #0b63cf);
      }
      .baku-cta-copy {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
      }
      .baku-cta-lead {
        font-size: 14px;
        font-weight: 800;
        line-height: 1.3;
        margin: 0;
      }
      .baku-cta-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        align-self: flex-start;
        height: 36px;
        padding: 0 18px;
        border-radius: 999px;
        font-size: 14px;
        font-weight: 800;
        background: #06a849;
        border: none;
        box-shadow: 0 2px 0 rgba(0,0,0,0.08);
      }
      .baku-cta-url {
        display: inline-flex;
        align-items: center;
        align-self: flex-start;
        height: 32px;
        padding: 0 12px;
        border-radius: 8px;
        background: rgba(255,255,255,0.2);
        font-size: 12.5px;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
      .baku-cta-side {
        width: 64px;
        height: 64px;
        object-fit: contain;
        flex-shrink: 0;
      }
      .baku-foot {
        margin: 2px 0 0;
        padding: 0;
        font-size: 11px;
        line-height: 1.45;
        color: #64748b;
        text-align: center;
      }
      @media (max-width: 960px) {
        .baku-shell {
          width: 100vw;
          height: 100dvh;
          max-height: 100dvh;
          border-radius: 0;
        }
        .baku-scroll { padding: 16px; }
        .baku-hero {
          grid-template-columns: 1fr;
          max-height: none;
          min-height: 0;
          gap: 12px;
        }
        .baku-title { font-size: 30px; }
        .baku-hero-visual {
          width: 100%;
          height: 140px;
          margin-left: 0;
        }
        .baku-mid {
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .baku-arrow { display: none; }
        .baku-worry, .baku-reason {
          height: auto;
          min-height: 0;
          max-height: none;
        }
        .baku-reason-list { max-width: 100%; }
        .baku-reason-illust { opacity: 0.35; }
        .baku-sols { grid-template-columns: 1fr 1fr; }
        .baku-sol { height: auto; min-height: 150px; max-height: none; }
        .baku-cta { grid-template-columns: 1fr; }
        .baku-cta-a, .baku-cta-b { height: auto; min-height: 84px; }
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-0 sm:p-4"
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
            {/* 1. Header */}
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

            {/* 2. Hero */}
            <section className="baku-hero">
              <div>
                <h2 className="baku-title">
                  こんな悩み、
                  <br />
                  <span className="baku-title-blue">ありませんか？</span>
                </h2>
                <p className="baku-sub">
                  見積の“なんとなく”を、根拠とスピードに変える。
                </p>
              </div>
              <div className="baku-hero-visual">
                <Image
                  src={`${ILLUST}/hero.png`}
                  alt=""
                  width={340}
                  height={160}
                  unoptimized
                />
              </div>
            </section>

            {/* 3. Worry / Reason */}
            <section className="baku-mid">
              <div className="baku-worry">
                <div className="baku-pill">こんな悩み、ありませんか？</div>
                <div className="baku-worry-list">
                  {WORRIES.map((w, i) => (
                    <div key={i} className="baku-worry-row">
                      {w.icon}
                      <div className="baku-worry-text">{w.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="baku-arrow" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path
                    d="M5 12h12M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>

              <div className="baku-reason">
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
                  width={96}
                  height={72}
                  className="baku-reason-illust"
                  unoptimized
                />
              </div>
            </section>

            {/* 4. Solve message */}
            <div className="baku-solve">
              <span aria-hidden>✦</span>
              <span>
                そこを <span className="baku-solve-brand">BAKUSOQ</span>{" "}
                が解決します
              </span>
              <span aria-hidden>✦</span>
            </div>

            {/* 5. Solutions */}
            <section className="baku-sols">
              {SOLUTIONS.map((s) => (
                <article key={s.no} className="baku-sol">
                  <span className="baku-sol-no">{s.no}</span>
                  <Image
                    src={s.img}
                    alt=""
                    width={55}
                    height={55}
                    className="baku-sol-img"
                    unoptimized
                  />
                  <h4 className="baku-sol-title">{s.title}</h4>
                  <p className="baku-sol-body">{s.body}</p>
                </article>
              ))}
            </section>

            {/* 6. CTA — 参考画像準拠 */}
            <section className="baku-cta">
              <a
                href={BAKUSOQ_LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="baku-cta-a"
              >
                <LineMark />
                <div className="baku-cta-copy">
                  <p className="baku-cta-lead">
                    ぜひLINE登録して情報を集めよう！
                  </p>
                  <span className="baku-cta-btn">LINE登録はこちら &gt;</span>
                </div>
              </a>

              <a
                href={BAKUSOQ_HP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="baku-cta-b"
              >
                <IconGlobe />
                <div className="baku-cta-copy">
                  <p className="baku-cta-lead">HPはこちら &gt;</p>
                  <span className="baku-cta-url">{BAKUSOQ_HP_URL}</span>
                </div>
                <Image
                  src={`${ILLUST}/cta-dash.png`}
                  alt=""
                  width={60}
                  height={60}
                  className="baku-cta-side"
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
