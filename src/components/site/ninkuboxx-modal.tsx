"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  type Answers,
  type AnswerValue,
  type IndexId,
  type IndexScore,
  ANSWER_LABELS,
  elevatedRisks,
  QUESTIONS,
} from "@/lib/ninkuboxx/diagnosis";

const NINKUBOXX_URL = "https://genbaboxx.co.jp/ninkuboxx";
const TOTAL = QUESTIONS.length;

interface DiagnoseResponse {
  scores: IndexScore[];
  overall: number;
  overallLabel: string;
  feedbackTitle: string;
  feedbackBody: string;
  feedback: string;
  source?: "ai" | "fallback";
  error?: string;
}

type ChatItem =
  | { kind: "bot-q"; qIndex: number }
  | { kind: "user"; qIndex: number; value: AnswerValue; at: string }
  | { kind: "bot-done" };

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

function BotAvatar() {
  return (
    <div className="ninku-avatar" aria-hidden>
      <svg viewBox="0 0 36 36" width="36" height="36">
        <circle cx="18" cy="18" r="18" fill="#14b8a6" />
        <rect x="10" y="12" width="16" height="12" rx="4" fill="#fff" />
        <circle cx="14.5" cy="17.5" r="1.6" fill="#0f766e" />
        <circle cx="21.5" cy="17.5" r="1.6" fill="#0f766e" />
        <path
          d="M14 21.5c1.2 1.2 6.8 1.2 8 0"
          stroke="#0f766e"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="16.5" y="7" width="3" height="4" rx="1" fill="#99f6e4" />
      </svg>
    </div>
  );
}

/** 5指標を五角形のレーダーチャートで表示（健全度0〜100・外側ほど健全） */
function RadarChart({ scores }: { scores: IndexScore[] }) {
  const cx = 170;
  const cy = 145;
  const R = 94;
  const n = scores.length; // 5指標＝五角形
  const healthOf = (s: IndexScore) => 100 - s.value;
  const angleAt = (i: number) => ((-90 + (360 / n) * i) * Math.PI) / 180;
  const point = (i: number, r: number): [number, number] => {
    const a = angleAt(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const polyPoints = (r: (i: number) => number) =>
    scores
      .map((_, i) =>
        point(i, r(i))
          .map((v) => v.toFixed(1))
          .join(","),
      )
      .join(" ");

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoly = polyPoints((i) => (R * healthOf(scores[i])) / 100);

  return (
    <svg
      viewBox="0 0 340 300"
      className="ninku-radar-svg"
      role="img"
      aria-label="5指標の健全度レーダーチャート"
    >
      {/* グリッド（同心五角形） */}
      {rings.map((f) => (
        <polygon
          key={f}
          points={polyPoints(() => R * f)}
          fill={f === 1 ? "#f8fafc" : "none"}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
      ))}
      {/* 軸線 */}
      {scores.map((s, i) => {
        const [x, y] = point(i, R);
        return (
          <line key={s.id} x1={cx} y1={cy} x2={x} y2={y} stroke="#cbd5e1" strokeWidth="1" />
        );
      })}
      {/* データ多角形（健全度＝100−課題） */}
      <polygon
        className="ninku-radar-poly"
        points={dataPoly}
        fill="rgba(13,148,136,0.20)"
        stroke="#0f766e"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* 頂点ドット */}
      {scores.map((s, i) => {
        const [x, y] = point(i, (R * healthOf(s)) / 100);
        return (
          <circle
            key={`dot-${s.id}`}
            className="ninku-radar-dot"
            cx={x}
            cy={y}
            r="4.5"
            fill={s.color}
            stroke="#fff"
            strokeWidth="1.5"
          />
        );
      })}
      {/* ラベル（健全度名＋数値） */}
      {scores.map((s, i) => {
        const [lx, ly] = point(i, R + 20);
        const anchor =
          Math.abs(lx - cx) < 8 ? "middle" : lx > cx ? "start" : "end";
        const health = healthOf(s);
        return (
          <g key={`lb-${s.id}`}>
            <text x={lx} y={ly - 2} textAnchor={anchor} className="ninku-radar-label">
              {s.healthShort}
            </text>
            <text
              x={lx}
              y={ly + 14}
              textAnchor={anchor}
              className="ninku-radar-num"
              fill={s.color}
            >
              {health}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** 数値を 0 → target までカウントアップ（結果表示の演出用） */
function useCountUp(target: number | null, duration = 1000): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target == null) {
      setVal(0);
      return;
    }
    let raf = 0;
    let startTs = 0;
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min(1, (ts - startTs) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

type TierKey = "good" | "watch" | "danger";

interface Tier {
  key: TierKey;
  min: number;
  /** バッジ用の点数帯 */
  range: string;
  /** 見出し */
  title: string;
  c1: string;
  c2: string;
  accent: string;
  message: string;
}

/**
 * 健全度スコア（0〜100・高いほど良い）
 * 緑: 76以上 / 黄: 51〜75 / 赤: 50以下
 */
const TIERS: Tier[] = [
  {
    key: "good",
    min: 76,
    range: "76点以上",
    title: "制度の運用状況を確認しましょう",
    c1: "#0f766e",
    c2: "#115e59",
    accent: "#0f766e",
    message:
      "基本的な仕組みは整っています。制度が社員に伝わっているか、実際の昇給や育成に活用されているかを確認しましょう。",
  },
  {
    key: "watch",
    min: 51,
    range: "75点以下",
    title: "仕組みを整えるタイミングです",
    c1: "#d97706",
    c2: "#b45309",
    accent: "#d97706",
    message:
      "一部のルールはありますが、評価・給与・育成が十分につながっていません。今のうちに整理することで、社員数が増えても組織が回りやすくなります。",
  },
  {
    key: "danger",
    min: 0,
    range: "50点以下",
    title: "今すぐ見直しが必要です",
    c1: "#dc2626",
    c2: "#991b1b",
    accent: "#dc2626",
    message:
      "評価や給料の決め方が、社長の感覚やその場の判断に頼っている状態です。社員の不満や離職、給与決定の迷いが起きやすくなっています。",
  },
];

/** 健全度（高いほど良い）から段階を判定 */
function tierOf(health: number): Tier {
  return TIERS.find((t) => health >= t.min) ?? TIERS[TIERS.length - 1];
}

/** 各指標が高いときの「状況」と「その結果どうなるか」（解体業のリアル・緊急度順） */
const RISK_TEXT: Record<IndexId, { cause: string; result: string }> = {
  exhaustion: {
    cause: "営業と現場がかみ合わず負担が現場に偏り、すれ違いと疲労が積み重なります。",
    result: "現場が疲弊し、事故・ミスや突然の離職につながります。",
  },
  trust: {
    cause: "社長が“鉛筆なめ”の感覚で給与を決め、判断基準が見えません。",
    result:
      "「何を見て評価されているのか」への不信が広がり、優秀な人ほど会社を見限ります。",
  },
  dissatisfaction: {
    cause: "給料をもらっていても「なぜこの額なのか」の理由が分かりません。",
    result: "金額に関係なく不満が静かに溜まり、やがて離職や職場の空気の悪化を招きます。",
  },
  ambiguity: {
    cause: "「何を頑張れば評価・給料が上がるのか」が示されていません。",
    result: "やる気のある人ほど答えを求めて他社へ流れ、伸びる人材から抜けていきます。",
  },
  dependency: {
    cause: "会社の目標や方針が社長の頭の中だけにあります。",
    result: "社員が向かう先を見失って“会社離れ”が進み、社長が動けないと現場が止まります。",
  },
};

/** 点数に応じて表情・付帯（汗・絆創膏）が変わる病状フェイス */
function HealthFace({ tier }: { tier: Tier }) {
  const { key, accent } = tier;
  const mouth: Record<TierKey, string> = {
    good: "M43 71 Q60 83 77 71",
    watch: "M44 75 H76",
    danger: "M43 82 Q60 66 77 82",
  };
  return (
    <svg
      viewBox="0 0 120 120"
      className="ninku-face"
      role="img"
      aria-label={`組織の状態：${tier.title}`}
    >
      <circle cx="60" cy="60" r="46" fill="rgba(255,255,255,0.92)" stroke={accent} strokeWidth="4" />
      {key === "danger" ? (
        <g stroke={accent} strokeWidth="4" strokeLinecap="round">
          <path d="M40 47l12 10M52 47l-12 10" />
          <path d="M68 47l12 10M80 47l-12 10" />
        </g>
      ) : (
        <g fill={accent}>
          <circle cx="47" cy="52" r="5" />
          <circle cx="73" cy="52" r="5" />
        </g>
      )}
      <path
        d={mouth[key]}
        stroke={accent}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {key !== "good" ? (
        <path
          d="M95 38c0 5-4 7-4 11a4 4 0 008 0c0-4-4-6-4-11z"
          fill={accent}
          opacity="0.85"
        />
      ) : null}
      {key === "danger" ? (
        <g transform="rotate(30 32 32)">
          <rect x="14" y="26" width="30" height="13" rx="6.5" fill={accent} />
          <line x1="22" y1="28" x2="22" y2="37" stroke="#fff" strokeWidth="1.6" />
          <line x1="29" y1="28" x2="29" y2="37" stroke="#fff" strokeWidth="1.6" />
          <line x1="36" y1="28" x2="36" y2="37" stroke="#fff" strokeWidth="1.6" />
        </g>
      ) : null}
    </svg>
  );
}

function nowLabel() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}


function ModalStyles() {
  return (
    <style>{`
      .ninku-shell {
        width: min(520px, calc(100vw - 24px));
        max-height: calc(100vh - 24px);
        border-radius: 24px;
        overflow: hidden;
        background: #fff;
        box-shadow: 0 28px 70px rgba(15, 23, 42, 0.32);
        display: flex;
        flex-direction: column;
      }
      .ninku-top {
        flex-shrink: 0;
        padding: 14px 16px 10px;
        background: #fff;
        border-bottom: 1px solid #e2e8f0;
      }
      .ninku-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .ninku-brand {
        font-size: 22px;
        font-weight: 900;
        letter-spacing: 0.02em;
        color: #0f766e;
      }
      .ninku-close {
        width: 38px;
        height: 38px;
        border-radius: 999px;
        background: #fff;
        border: 1px solid #dbe7ea;
        color: #64748b;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ninku-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 13px;
        border-radius: 999px;
        background: #e6f7f4;
        color: #0f766e;
        font-size: 14px;
        font-weight: 800;
        margin-bottom: 10px;
      }
      .ninku-title {
        margin: 0 0 4px;
        font-size: 27px;
        font-weight: 900;
        letter-spacing: -0.03em;
        color: #0f172a;
      }
      .ninku-sub {
        margin: 0 0 14px;
        font-size: 15px;
        font-weight: 600;
        color: #64748b;
      }
      .ninku-progress-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 800;
        color: #0f766e;
      }
      .ninku-progress-pct { color: #94a3b8; }
      .ninku-progress-track {
        height: 7px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }
      .ninku-progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #2dd4bf, #0f766e);
        transition: width .45s cubic-bezier(.22,1,.36,1);
      }
      /* チャット内（メッセージ帯） */
      .ninku-scroll {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 14px 12px 16px;
        background:
          linear-gradient(180deg, #d9ebe8 0%, #e4f1ef 40%, #dceae7 100%);
        -webkit-overflow-scrolling: touch;
      }
      .ninku-chat { display: flex; flex-direction: column; gap: 10px; }
      .ninku-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        max-width: 92%;
        animation: ninku-rise .32s ease both;
      }
      .ninku-row--bot { align-self: flex-start; }
      .ninku-row--user {
        align-self: flex-end;
        flex-direction: row-reverse;
        justify-content: flex-start;
        align-items: flex-end;
      }
      .ninku-avatar { flex-shrink: 0; }
      .ninku-col {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }
      .ninku-bubble {
        border-radius: 4px 16px 16px 16px;
        padding: 12px 14px;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.6;
        box-shadow: 0 1px 2px rgba(15,23,42,.06);
      }
      .ninku-bubble--bot {
        background: #ffffff;
        border: 1px solid #b7ddd6;
        color: #134e4a;
      }
      .ninku-hint {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 10px;
        border-radius: 12px;
        background: #c7f0e8;
        color: #0f766e;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.35;
        width: fit-content;
        max-width: 100%;
      }
      .ninku-bubble--user {
        background: linear-gradient(180deg, #14b8a6 0%, #0f766e 100%);
        border: none;
        color: #fff;
        border-radius: 16px 16px 4px 16px;
        min-width: 48px;
        text-align: center;
        font-size: 20px;
        font-weight: 900;
        padding: 9px 16px;
        box-shadow: 0 4px 12px rgba(15, 118, 110, 0.28);
      }
      .ninku-user-meta {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        margin-top: 2px;
        font-size: 12px;
        font-weight: 700;
        color: #5b7c76;
      }
      .ninku-typing {
        display: inline-flex;
        gap: 4px;
        padding: 12px 16px;
        background: #fff;
        border: 1px solid #b7ddd6;
        border-radius: 4px 16px 16px 16px;
      }
      .ninku-typing i {
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: #14b8a6;
        animation: ninku-dot 1s ease-in-out infinite;
      }
      .ninku-typing i:nth-child(2) { animation-delay: .15s; }
      .ninku-typing i:nth-child(3) { animation-delay: .3s; }
      @keyframes ninku-dot {
        0%, 80%, 100% { opacity: .35; transform: translateY(0); }
        40% { opacity: 1; transform: translateY(-3px); }
      }
      @keyframes ninku-rise {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      /* 分析中のスキャンバー */
      .ninku-analyzing {
        height: 7px;
        border-radius: 999px;
        background: #cdeee8;
        overflow: hidden;
        margin-top: 2px;
      }
      .ninku-analyzing span {
        display: block;
        height: 100%;
        width: 42%;
        border-radius: 999px;
        background: linear-gradient(90deg, #2dd4bf, #0f766e);
        animation: ninku-scan 1.1s ease-in-out infinite;
      }
      @keyframes ninku-scan {
        0% { transform: translateX(-120%); }
        100% { transform: translateX(320%); }
      }
      /* チャット外：回答バー（クイック返信） */
      .ninku-composer {
        flex-shrink: 0;
        padding: 12px 14px 14px;
        background: #fff;
        border-top: 1px solid #e2e8f0;
        box-shadow: 0 -6px 18px rgba(15, 23, 42, 0.04);
      }
      .ninku-composer-top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 10px;
      }
      .ninku-composer-title {
        margin: 0;
        font-size: 15px;
        font-weight: 900;
        color: #0f172a;
      }
      .ninku-remain {
        font-size: 14px;
        font-weight: 800;
        color: #0f766e;
        white-space: nowrap;
      }
      .ninku-scale-wrap {
        width: min(300px, 100%);
        margin: 0 auto;
      }
      .ninku-scale {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0;
        border: 1.5px solid #99f6e4;
        border-radius: 999px;
        overflow: hidden;
        background: #f0fdfa;
      }
      .ninku-scale.is-active {
        animation: ninku-scale-breathe 2.4s ease-in-out infinite;
      }
      @keyframes ninku-scale-breathe {
        0%, 100% { box-shadow: 0 0 0 0 rgba(20,184,166,0); }
        50% { box-shadow: 0 0 0 5px rgba(20,184,166,.16); }
      }
      .ninku-scale button {
        height: 54px;
        border: none;
        border-right: 1px solid #ccfbf1;
        background: transparent;
        font-size: 21px;
        font-weight: 900;
        color: #0f766e;
        cursor: pointer;
        transition: background .12s ease, color .12s ease, transform .1s ease;
      }
      .ninku-scale button:last-child { border-right: none; }
      .ninku-scale button:hover:not(:disabled) {
        background: #ccfbf1;
      }
      .ninku-scale button:active:not(:disabled) {
        transform: scale(.92);
      }
      .ninku-scale button.is-on {
        background: #0f766e;
        color: #fff;
        animation: ninku-pick .3s ease;
      }
      @keyframes ninku-pick {
        0% { transform: scale(1); }
        45% { transform: scale(1.12); }
        100% { transform: scale(1); }
      }
      .ninku-scale button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .ninku-scale-legend {
        margin: 8px 0 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 3px;
        font-size: 12px;
        font-weight: 700;
        color: #64748b;
        line-height: 1.35;
      }
      .ninku-scale-legend li {
        display: flex;
        gap: 6px;
      }
      .ninku-scale-legend b {
        flex-shrink: 0;
        width: 1.2em;
        color: #0f766e;
      }
      .ninku-composer-tip {
        margin: 8px 0 0;
        text-align: center;
        font-size: 13px;
        font-weight: 700;
        color: #94a3b8;
      }
      .ninku-result {
        margin-top: 4px;
        padding: 16px;
        border-radius: 18px;
        background: #fff;
        border: 1px solid #b7ddd6;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
        scroll-margin-top: 12px;
        align-self: stretch;
        max-width: 100%;
        animation: ninku-pop .5s cubic-bezier(.22,1,.36,1) both;
      }
      @keyframes ninku-pop {
        from { opacity: 0; transform: translateY(10px) scale(.985); }
        to { opacity: 1; transform: none; }
      }
      .ninku-overall {
        position: relative;
        overflow: hidden;
        border-radius: 14px;
        padding: 16px;
        margin-bottom: 14px;
        background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
        color: #fff;
      }
      .ninku-overall::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,.20) 50%, transparent 70%);
        transform: translateX(-100%);
        animation: ninku-sheen 1.5s .25s ease both;
        pointer-events: none;
      }
      @keyframes ninku-sheen { to { transform: translateX(100%); } }
      .ninku-overall-top {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .ninku-overall-main {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }
      .ninku-overall-badge {
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        padding: 4px 13px;
        border-radius: 999px;
        background: rgba(255,255,255,0.24);
        font-size: 13px;
        font-weight: 900;
        letter-spacing: .05em;
        color: #fff;
      }
      .ninku-face-wrap { flex-shrink: 0; }
      .ninku-face {
        width: 82px;
        height: 82px;
        display: block;
        filter: drop-shadow(0 4px 10px rgba(0,0,0,.18));
        animation: ninku-face-in .55s .2s cubic-bezier(.22,1,.36,1) both;
      }
      @keyframes ninku-face-in {
        from { opacity: 0; transform: scale(.4) rotate(-10deg); }
        to { opacity: 1; transform: none; }
      }
      .ninku-overall-score {
        display: flex;
        align-items: baseline;
        gap: 6px;
      }
      .ninku-overall-num {
        font-size: 46px;
        font-weight: 900;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .ninku-overall-unit {
        font-size: 15px;
        font-weight: 800;
        opacity: .8;
      }
      /* レーダーチャート（健全度マップ） */
      .ninku-radar-head {
        margin: 2px 0 0;
        font-size: 15px;
        font-weight: 900;
        color: #0f172a;
        text-align: center;
      }
      .ninku-radar {
        display: flex;
        justify-content: center;
        padding: 2px 0 0;
      }
      .ninku-radar-svg { width: 100%; max-width: 340px; height: auto; }
      .ninku-radar-label { font-size: 12.5px; font-weight: 800; fill: #334155; }
      .ninku-radar-num { font-size: 13.5px; font-weight: 900; }
      .ninku-radar-poly {
        transform-box: fill-box;
        transform-origin: center;
        animation: ninku-radar-in .8s .25s cubic-bezier(.22,1,.36,1) both;
      }
      @keyframes ninku-radar-in {
        from { opacity: 0; transform: scale(.25); }
        to { opacity: 1; transform: scale(1); }
      }
      .ninku-radar-dot { animation: ninku-radar-dot-in .3s .95s ease both; }
      @keyframes ninku-radar-dot-in { from { opacity: 0; } to { opacity: 1; } }
      .ninku-radar-caption {
        margin: 0 0 10px;
        text-align: center;
        font-size: 12.5px;
        font-weight: 700;
        color: #64748b;
      }
      .ninku-overall-title {
        position: relative;
        z-index: 1;
        margin: 12px 0 0;
        font-size: 17px;
        font-weight: 900;
        line-height: 1.45;
      }
      .ninku-overall-label {
        position: relative;
        z-index: 1;
        margin: 6px 0 0;
        font-size: 15px;
        font-weight: 700;
        line-height: 1.6;
        opacity: .95;
      }
      .ninku-score { margin-bottom: 12px; }
      .ninku-score-head {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      .ninku-score-label { font-size: 15px; font-weight: 800; color: #0f172a; }
      .ninku-score-value { font-size: 21px; font-weight: 900; font-variant-numeric: tabular-nums; }
      .ninku-score-track {
        height: 10px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }
      .ninku-score-fill {
        height: 100%;
        border-radius: 999px;
        width: var(--w);
        animation: ninku-fill 1s cubic-bezier(.22,1,.36,1) both;
      }
      @keyframes ninku-fill { from { width: 0; } to { width: var(--w); } }
      .ninku-fb {
        margin: 14px 0;
        padding: 14px 16px;
        border-radius: 14px;
        background: #fff7f6;
        border: 1px solid #fecdd3;
      }
      .ninku-fb--ok {
        background: #f0fdfa;
        border-color: #99f6e4;
      }
      .ninku-fb h3 {
        margin: 0 0 2px;
        font-size: 16px;
        font-weight: 900;
        color: #b91c1c;
      }
      .ninku-fb--ok h3 { color: #0f766e; }
      .ninku-fb-note {
        margin: 0 0 12px;
        font-size: 12px;
        font-weight: 700;
        color: #64748b;
      }
      .ninku-keeps {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .ninku-keep {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        animation: ninku-rise .4s both;
      }
      .ninku-keep-mark {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border-radius: 999px;
        background: #0f766e;
        color: #fff;
        font-size: 13px;
        font-weight: 900;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: 1px;
      }
      .ninku-keep-text {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        line-height: 1.55;
        color: #334155;
      }
      .ninku-risks {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .ninku-risk {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        animation: ninku-rise .4s both;
      }
      .ninku-risk-rank {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border-radius: 999px;
        color: #fff;
        font-size: 13px;
        font-weight: 900;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: 1px;
        box-shadow: 0 2px 5px rgba(0,0,0,.12);
      }
      .ninku-risk-text {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        line-height: 1.55;
        color: #334155;
      }
      .ninku-risk-result {
        margin: 5px 0 0;
        font-size: 15px;
        font-weight: 900;
        line-height: 1.5;
        color: #b91c1c;
      }
      .ninku-risk-arrow {
        margin-right: 5px;
        font-size: 11px;
        vertical-align: 1px;
      }
      .ninku-risk-tag {
        display: inline-block;
        margin-top: 5px;
        font-size: 12px;
        font-weight: 800;
      }
      .ninku-cta {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 54px;
        border-radius: 999px;
        background: linear-gradient(180deg, #2dd4bf 0%, #0f766e 100%);
        color: #fff;
        font-size: 18px;
        font-weight: 900;
        text-decoration: none;
        box-shadow: 0 8px 18px rgba(15, 118, 110, 0.25);
        animation: ninku-cta-pulse 2.6s ease-in-out infinite;
      }
      @keyframes ninku-cta-pulse {
        0%, 100% { box-shadow: 0 8px 18px rgba(15, 118, 110, 0.25); }
        50% { box-shadow: 0 8px 26px rgba(15, 118, 110, 0.45); }
      }
      .ninku-note {
        margin: 8px 0 0;
        font-size: 13px;
        color: rgba(255,255,255,.72);
        font-weight: 600;
        position: relative;
        z-index: 1;
      }
      .ninku-error {
        margin: 8px 0 0;
        font-size: 14px;
        font-weight: 700;
        color: #dc2626;
      }
      @media (prefers-reduced-motion: reduce) {
        .ninku-overall::after,
        .ninku-cta,
        .ninku-scale.is-active { animation: none; }
      }
      @media (max-width: 640px) {
        .ninku-shell {
          width: 100vw;
          height: 100dvh;
          max-height: 100dvh;
          border-radius: 0;
        }
        .ninku-title { font-size: 24px; }
      }
    `}</style>
  );
}

function Modal({ onClose }: { onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const timersRef = useRef<number[]>([]);
  const [cursor, setCursor] = useState(0);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<AnswerValue | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [items, setItems] = useState<ChatItem[]>([{ kind: "bot-q", qIndex: 0 }]);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnoseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / TOTAL) * 100);
  const remaining = Math.max(0, TOTAL - answeredCount);
  const inputLocked = busy || typing || loading || done;
  const currentQ = !done && !inputLocked && cursor < TOTAL ? QUESTIONS[cursor] : null;

  // 健全度スコア（0〜100・高いほど良い）＝ 100 − 課題平均。カウントアップ演出。
  const health = result ? 100 - result.overall : 0;
  const displayHealth = useCountUp(result ? 100 - result.overall : null);

  const clearTimers = () => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  };

  const later = (ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

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
      clearTimers();
    };
  }, [onClose]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [items, typing, result, flash]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const runDiagnosis = async (finalAnswers: Answers) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ninkuboxx/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = (await res.json()) as DiagnoseResponse;
      if (!res.ok) throw new Error(data.error || "診断に失敗しました");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "診断に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  /** 数字タップ → 即チャット進行（次へ不要） */
  const commitAnswer = (value: AnswerValue, qIndex: number) => {
    if (busy || typing || loading || done) return;
    setBusy(true);
    clearTimers();

    const q = QUESTIONS[qIndex];
    const nextAnswers = { ...answers, [q.id]: value };

    setFlash(value);
    later(160, () => {
      setFlash(null);
      setAnswers(nextAnswers);
      setItems((prev) => [
        ...prev,
        { kind: "user", qIndex, value, at: nowLabel() },
      ]);
    });

    later(480, () => setTyping(true));

    const isLast = qIndex >= TOTAL - 1;
    if (isLast) {
      later(1300, () => {
        setTyping(false);
        setItems((prev) => [...prev, { kind: "bot-done" }]);
        setDone(true);
        setCursor(TOTAL);
        setBusy(false);
        void runDiagnosis(nextAnswers);
      });
    } else {
      later(1300, () => {
        setTyping(false);
        setItems((prev) => [...prev, { kind: "bot-q", qIndex: qIndex + 1 }]);
        setCursor(qIndex + 1);
        setBusy(false);
      });
    }
  };

  const onPick = (n: AnswerValue) => {
    if (!currentQ || inputLocked) return;
    commitAnswer(n, cursor);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-0 sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-label="NiNKU BOXX 組織診断"
    >
      <ModalStyles />
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="ninku-shell relative z-10">
        <div className="ninku-top">
          <div className="ninku-header">
            <div className="ninku-brand">NiNKU BOXX</div>
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className="ninku-close"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="ninku-badge">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M8 4.5V8l2.2 1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            30秒でできる かんたん組織診断
          </div>
          <h2 className="ninku-title">チャットで答えるだけ</h2>
          <p className="ninku-sub">
            1問ずつ、会話形式でサクッと診断できます。
          </p>

          <div className="ninku-progress-row">
            <span>
              {done ? TOTAL : cursor + 1} / {TOTAL} 問
            </span>
            <span className="ninku-progress-pct">{progressPct}%</span>
          </div>
          <div className="ninku-progress-track">
            <div
              className="ninku-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="ninku-scroll" ref={scrollRef}>
          <div className="ninku-chat">
            {items.map((item, i) => {
              if (item.kind === "bot-q") {
                const q = QUESTIONS[item.qIndex];
                return (
                  <div key={`q-${item.qIndex}-${i}`} className="ninku-row ninku-row--bot">
                    <BotAvatar />
                    <div className="ninku-col">
                      <div className="ninku-bubble ninku-bubble--bot">{q.label}</div>
                    </div>
                  </div>
                );
              }
              if (item.kind === "user") {
                return (
                  <div key={`u-${item.qIndex}-${i}`} className="ninku-row ninku-row--user">
                    <div>
                      <div className="ninku-bubble ninku-bubble--user">
                        {item.value}｜{ANSWER_LABELS[item.value]}
                      </div>
                      <div className="ninku-user-meta">
                        <span>{item.at}</span>
                        <span aria-hidden>✓✓</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={`d-${i}`} className="ninku-row ninku-row--bot">
                  <BotAvatar />
                  {loading ? (
                    <div className="ninku-col">
                      <div className="ninku-bubble ninku-bubble--bot">
                        回答をもとに組織課題を分析しています…
                      </div>
                      <div className="ninku-analyzing" aria-hidden>
                        <span />
                      </div>
                    </div>
                  ) : (
                    <div className="ninku-bubble ninku-bubble--bot">
                      診断が完了しました。下に結果を表示しています。
                    </div>
                  )}
                </div>
              );
            })}

            {typing ? (
              <div className="ninku-row ninku-row--bot">
                <BotAvatar />
                <div className="ninku-typing" aria-label="入力中">
                  <i /><i /><i />
                </div>
              </div>
            ) : null}

            {error ? <p className="ninku-error">{error}</p> : null}

            {result ? (
              <section className="ninku-result" ref={resultRef} aria-label="診断結果">
                {(() => {
                  const tier = tierOf(health);
                  return (
                    <div
                      className="ninku-overall"
                      style={{
                        background: `linear-gradient(135deg, ${tier.c1} 0%, ${tier.c2} 100%)`,
                      }}
                    >
                      <div className="ninku-overall-top">
                        <div className="ninku-overall-main">
                          <span className="ninku-overall-badge">
                            健全度スコア・{tier.range}
                          </span>
                          <div className="ninku-overall-score">
                            <span className="ninku-overall-num">{displayHealth}</span>
                            <span className="ninku-overall-unit">/ 100点</span>
                          </div>
                        </div>
                        <div className="ninku-face-wrap">
                          <HealthFace tier={tier} />
                        </div>
                      </div>
                      <p className="ninku-overall-title">
                        {result.feedbackTitle || tier.title}
                      </p>
                      <p className="ninku-overall-label">
                        {result.feedbackBody || tier.message}
                      </p>
                      <p className="ninku-note">
                        ※スコアは0〜100点。高いほど組織が健全な状態です。
                      </p>
                    </div>
                  );
                })()}

                <h3 className="ninku-radar-head">健全度マップ（5指標）</h3>
                <div className="ninku-radar">
                  <RadarChart scores={result.scores} />
                </div>
                <p className="ninku-radar-caption">
                  外側に広がるほど健全な状態です。
                </p>
                {(() => {
                  // 緑帯（76点以上）では赤の危険カードは出さない。黄・赤帯のみ課題リストを表示。
                  const risks =
                    health >= 76 ? [] : elevatedRisks(result.scores, 3);
                  if (risks.length === 0) {
                    const keeps = [
                      "評価基準の共有が「書いて終わり」にならないよう、現場で使える状態を保つ",
                      "頑張りが等級・給与・役割に反映される運用を、感覚任せに戻さない",
                      "育成ステップと将来像の言語化を、そのまま仕組みとして残す",
                    ];
                    return (
                      <div className="ninku-fb ninku-fb--ok">
                        <h3>
                          {health >= 76
                            ? "いまは運用確認の段階です"
                            : "重大な課題は検出されませんでした"}
                        </h3>
                        <p className="ninku-fb-note">
                          {health >= 76
                            ? "総合は良好です。細かい指標の差はあっても、赤信号レベルの課題ではありません。"
                            : "回答どおりなら今は土台が整っています。無理に不安を煽る必要はありません。"}
                        </p>
                        <ul className="ninku-keeps">
                          {keeps.map((text, i) => (
                            <li
                              key={text}
                              className="ninku-keep"
                              style={{ animationDelay: `${0.1 + i * 0.12}s` }}
                            >
                              <span className="ninku-keep-mark" aria-hidden>
                                ✓
                              </span>
                              <p className="ninku-keep-text">{text}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return (
                    <div className="ninku-fb">
                      <h3>このまま放置すると起きやすいこと</h3>
                      <p className="ninku-fb-note">
                        危険度が一定以上の指標だけを、高い順に表示しています。
                      </p>
                      <ul className="ninku-risks">
                        {risks.map((s, i) => (
                          <li
                            key={s.id}
                            className="ninku-risk"
                            style={{ animationDelay: `${0.1 + i * 0.12}s` }}
                          >
                            <span
                              className="ninku-risk-rank"
                              style={{ background: s.color }}
                            >
                              {i + 1}
                            </span>
                            <div>
                              <p className="ninku-risk-text">
                                {RISK_TEXT[s.id].cause}
                              </p>
                              <p className="ninku-risk-result">
                                <span aria-hidden className="ninku-risk-arrow">
                                  ▶
                                </span>
                                {RISK_TEXT[s.id].result}
                              </p>
                              <span
                                className="ninku-risk-tag"
                                style={{ color: s.color }}
                              >
                                {s.short}指数 {s.value}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
                <a
                  href={NINKUBOXX_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ninku-cta"
                >
                  {health >= 76
                    ? "仕組みの点検・相談はこちら"
                    : "無料相談はこちら"}
                </a>
              </section>
            ) : null}
          </div>
        </div>

        {!done ? (
          <div className="ninku-composer">
            <div className="ninku-composer-top">
              <p className="ninku-composer-title">この質問への答え</p>
              <span className="ninku-remain">残り {remaining} 問</span>
            </div>
            <div className="ninku-scale-wrap">
              <div
                className={`ninku-scale${currentQ && !inputLocked ? " is-active" : ""}`}
                role="group"
                aria-label="1から5で回答"
              >
                {([1, 2, 3, 4, 5] as AnswerValue[]).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={flash === n ? "is-on" : undefined}
                    disabled={!currentQ || inputLocked}
                    onClick={() => onPick(n)}
                    aria-label={`${n}を選んで送信`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <ul className="ninku-scale-legend" aria-label="回答の意味">
                {([1, 2, 3, 4, 5] as AnswerValue[]).map((n) => (
                  <li key={n}>
                    <b>{n}</b>
                    <span>{ANSWER_LABELS[n]}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="ninku-composer-tip">数字を押すと、すぐチャットに送信されます</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function NinkuboxxSidebarBanner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative block w-full overflow-hidden text-left shadow-sm transition-opacity hover:opacity-95"
        aria-label="NiNKU BOXX の組織診断を開く"
      >
        <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-md bg-navy-800 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm">
          PR
        </span>
        <Image
          src="/promo/ninkuboxx.png"
          alt="NiNKU BOXX — 属人経営を卒業する。解体会社のための人事制度。"
          width={1024}
          height={1536}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, 360px"
        />
      </button>

      {open && <Modal onClose={() => setOpen(false)} />}
    </>
  );
}
