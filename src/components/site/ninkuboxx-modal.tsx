"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  type Answers,
  type AnswerValue,
  type IndexScore,
  QUESTIONS,
} from "@/lib/ninkuboxx/diagnosis";

const NINKUBOXX_URL = "https://genbaboxx.co.jp/ninkuboxx";
const TOTAL = QUESTIONS.length;

interface DiagnoseResponse {
  scores: IndexScore[];
  overall: number;
  overallLabel: string;
  feedback: string;
  error?: string;
}

type ChatItem =
  | { kind: "bot-q"; qIndex: number }
  | { kind: "user"; qIndex: number; value: AnswerValue; at: string }
  | { kind: "bot-ack"; qIndex: number }
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

function ScoreBar({ score }: { score: IndexScore }) {
  return (
    <div className="ninku-score">
      <div className="ninku-score-head">
        <span className="ninku-score-label">{score.label}</span>
        <span className="ninku-score-value" style={{ color: score.color }}>
          {score.value}
        </span>
      </div>
      <div className="ninku-score-track">
        <div
          className="ninku-score-fill"
          style={{
            width: `${score.value}%`,
            background: `linear-gradient(90deg, ${score.color}cc, ${score.color})`,
          }}
        />
      </div>
    </div>
  );
}

function nowLabel() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** "1 = A / 5 = B" → 両端ラベル */
function parseScaleEnds(help?: string): { low: string; high: string } {
  if (!help) return { low: "ほとんどない", high: "十分ある" };
  const m = help.match(/1\s*=\s*(.+?)\s*\/\s*5\s*=\s*(.+)\s*$/);
  if (m) return { low: m[1].trim(), high: m[2].trim() };
  return { low: "低い", high: "高い" };
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
        font-size: 20px;
        font-weight: 900;
        letter-spacing: 0.02em;
        color: #0f766e;
      }
      .ninku-close {
        width: 36px;
        height: 36px;
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
        padding: 6px 12px;
        border-radius: 999px;
        background: #e6f7f4;
        color: #0f766e;
        font-size: 12px;
        font-weight: 800;
        margin-bottom: 10px;
      }
      .ninku-title {
        margin: 0 0 4px;
        font-size: 24px;
        font-weight: 900;
        letter-spacing: -0.03em;
        color: #0f172a;
      }
      .ninku-sub {
        margin: 0 0 14px;
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
      }
      .ninku-progress-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 12px;
        font-weight: 800;
        color: #0f766e;
      }
      .ninku-progress-pct { color: #94a3b8; }
      .ninku-progress-track {
        height: 6px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }
      .ninku-progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #2dd4bf, #0f766e);
        transition: width .35s ease;
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
        padding: 10px 12px;
        font-size: 13.5px;
        font-weight: 700;
        line-height: 1.55;
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
        font-size: 11px;
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
        min-width: 44px;
        text-align: center;
        font-size: 17px;
        font-weight: 900;
        padding: 8px 14px;
        box-shadow: 0 4px 12px rgba(15, 118, 110, 0.28);
      }
      .ninku-user-meta {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        margin-top: 2px;
        font-size: 10px;
        font-weight: 700;
        color: #5b7c76;
      }
      .ninku-typing {
        display: inline-flex;
        gap: 4px;
        padding: 10px 14px;
        background: #fff;
        border: 1px solid #b7ddd6;
        border-radius: 4px 16px 16px 16px;
      }
      .ninku-typing i {
        width: 6px;
        height: 6px;
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
        font-size: 13px;
        font-weight: 900;
        color: #0f172a;
      }
      .ninku-remain {
        font-size: 12px;
        font-weight: 800;
        color: #0f766e;
        white-space: nowrap;
      }
      .ninku-scale-wrap {
        width: min(280px, 100%);
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
      .ninku-scale button {
        height: 40px;
        border: none;
        border-right: 1px solid #ccfbf1;
        background: transparent;
        font-size: 15px;
        font-weight: 900;
        color: #0f766e;
        cursor: pointer;
        transition: background .12s ease, color .12s ease;
      }
      .ninku-scale button:last-child { border-right: none; }
      .ninku-scale button:hover:not(:disabled) {
        background: #ccfbf1;
      }
      .ninku-scale button.is-on {
        background: #0f766e;
        color: #fff;
      }
      .ninku-scale button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .ninku-scale-ends {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-top: 7px;
        font-size: 10.5px;
        font-weight: 700;
        color: #64748b;
        line-height: 1.35;
      }
      .ninku-scale-ends span:first-child { text-align: left; max-width: 48%; }
      .ninku-scale-ends span:last-child { text-align: right; max-width: 48%; }
      .ninku-composer-tip {
        margin: 8px 0 0;
        text-align: center;
        font-size: 11px;
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
      }
      .ninku-overall {
        border-radius: 14px;
        padding: 14px;
        margin-bottom: 14px;
        background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
        color: #fff;
      }
      .ninku-overall-num {
        font-size: 36px;
        font-weight: 900;
        line-height: 1;
      }
      .ninku-overall-label {
        margin: 8px 0 0;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.55;
      }
      .ninku-score { margin-bottom: 10px; }
      .ninku-score-head {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      .ninku-score-label { font-size: 12px; font-weight: 800; color: #0f172a; }
      .ninku-score-value { font-size: 16px; font-weight: 900; }
      .ninku-score-track {
        height: 8px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }
      .ninku-score-fill { height: 100%; border-radius: 999px; transition: width .45s ease; }
      .ninku-fb {
        margin: 14px 0;
        padding: 14px;
        border-radius: 14px;
        background: #f0fdfa;
        border: 1px solid #99f6e4;
      }
      .ninku-fb h3 {
        margin: 0 0 8px;
        font-size: 13px;
        font-weight: 900;
        color: #0f766e;
      }
      .ninku-fb p {
        margin: 0 0 7px;
        font-size: 13px;
        font-weight: 600;
        line-height: 1.65;
        color: #1e293b;
      }
      .ninku-fb p:last-child { margin-bottom: 0; }
      .ninku-cta {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 48px;
        border-radius: 999px;
        background: linear-gradient(180deg, #2dd4bf 0%, #0f766e 100%);
        color: #fff;
        font-size: 15px;
        font-weight: 900;
        text-decoration: none;
        box-shadow: 0 8px 18px rgba(15, 118, 110, 0.25);
      }
      .ninku-note {
        margin: 8px 0 0;
        font-size: 11px;
        color: rgba(255,255,255,.7);
        font-weight: 600;
      }
      .ninku-error {
        margin: 8px 0 0;
        font-size: 12px;
        font-weight: 700;
        color: #dc2626;
      }
      @media (max-width: 640px) {
        .ninku-shell {
          width: 100vw;
          height: 100dvh;
          max-height: 100dvh;
          border-radius: 0;
        }
        .ninku-title { font-size: 22px; }
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

    later(420, () => setTyping(true));

    later(1100, () => {
      setTyping(false);
      setItems((prev) => [...prev, { kind: "bot-ack", qIndex }]);
    });

    const isLast = qIndex >= TOTAL - 1;
    if (isLast) {
      later(1500, () => setTyping(true));
      later(2200, () => {
        setTyping(false);
        setItems((prev) => [...prev, { kind: "bot-done" }]);
        setDone(true);
        setCursor(TOTAL);
        setBusy(false);
        void runDiagnosis(nextAnswers);
      });
    } else {
      later(1550, () => setTyping(true));
      later(2300, () => {
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
                        {item.value}
                      </div>
                      <div className="ninku-user-meta">
                        <span>{item.at}</span>
                        <span aria-hidden>✓✓</span>
                      </div>
                    </div>
                  </div>
                );
              }
              if (item.kind === "bot-ack") {
                return (
                  <div key={`a-${item.qIndex}-${i}`} className="ninku-row ninku-row--bot">
                    <BotAvatar />
                    <div className="ninku-bubble ninku-bubble--bot">
                      {item.qIndex >= TOTAL - 1
                        ? "ありがとうございます！結果をまとめますね。"
                        : "ありがとうございます！次の質問に進みますね。"}
                    </div>
                  </div>
                );
              }
              return (
                <div key={`d-${i}`} className="ninku-row ninku-row--bot">
                  <BotAvatar />
                  <div className="ninku-bubble ninku-bubble--bot">
                    {loading
                      ? "回答をもとに組織課題を分析しています…"
                      : "診断が完了しました。下に結果を表示しています。"}
                  </div>
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
                <div className="ninku-overall">
                  <div className="ninku-overall-num">{result.overall}</div>
                  <p className="ninku-overall-label">{result.overallLabel}</p>
                  <p className="ninku-note">
                    ※指数は0〜100。高いほど課題が大きい目安です。
                  </p>
                </div>
                {result.scores.map((s) => (
                  <ScoreBar key={s.id} score={s} />
                ))}
                <div className="ninku-fb">
                  <h3>いま起きうる可能性</h3>
                  {result.feedback.split("\n").filter(Boolean).map((line, i) => (
                    <p key={`${i}-${line.slice(0, 12)}`}>{line}</p>
                  ))}
                </div>
                <a
                  href={NINKUBOXX_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ninku-cta"
                >
                  無料相談はこちら
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
                className="ninku-scale"
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
              {(() => {
                const ends = parseScaleEnds(currentQ?.help);
                return (
                  <div className="ninku-scale-ends">
                    <span>1 … {ends.low}</span>
                    <span>5 … {ends.high}</span>
                  </div>
                );
              })()}
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
