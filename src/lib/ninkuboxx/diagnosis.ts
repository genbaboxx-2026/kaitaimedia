/** NiNKU BOXX 組織診断 — 入力と5指標の決定論的算出 */

export type AnswerValue = 1 | 2 | 3 | 4 | 5;

export interface DiagnosisQuestion {
  id: string;
  label: string;
  help?: string;
  /** 高い回答ほど課題が大きい場合 true（逆転項目は false） */
  higherIsWorse: boolean;
  affects: IndexId[];
}

export type IndexId =
  | "exhaustion"
  | "trust"
  | "dissatisfaction"
  | "ambiguity"
  | "dependency";

export interface IndexDef {
  id: IndexId;
  label: string;
  short: string;
  color: string;
}

export const INDEX_DEFS: IndexDef[] = [
  {
    id: "exhaustion",
    label: "従業員疲弊指数",
    short: "疲弊",
    color: "#0d9488",
  },
  {
    id: "trust",
    label: "経営者の信頼不足指数",
    short: "信頼不足",
    color: "#ea580c",
  },
  {
    id: "dissatisfaction",
    label: "従業員の不満指数",
    short: "不満",
    color: "#7c3aed",
  },
  {
    id: "ambiguity",
    label: "評価あいまい指数",
    short: "評価あいまい",
    color: "#0284c7",
  },
  {
    id: "dependency",
    label: "社長属人依存指数",
    short: "属人依存",
    color: "#be123c",
  },
];

/** 30秒チャット診断用（5問）。各指数に届くよう割り当て。 */
export const QUESTIONS: DiagnosisQuestion[] = [
  {
    id: "q_criteria",
    label: "現場の評価基準は、文書やマニュアルで共有されていますか？",
    help: "1 = ほとんどない / 5 = 十分に共有されている",
    higherIsWorse: false,
    affects: ["ambiguity", "trust", "dependency"],
  },
  {
    id: "q_reflect",
    label: "現場の頑張りは、等級・給与・役割にきちんと反映されていますか？",
    help: "1 = ほとんど反映されない / 5 = よく反映されている",
    higherIsWorse: false,
    affects: ["dissatisfaction", "exhaustion", "trust"],
  },
  {
    id: "q_boss",
    label: "評価や処遇の最終決定は、社長・役員ひとりに依存していませんか？",
    help: "1 = 仕組みで回っている / 5 = ほぼひとりで決めている",
    higherIsWorse: true,
    affects: ["dependency", "ambiguity", "trust"],
  },
  {
    id: "q_growth",
    label: "新人・中堅向けの育成ステップ（研修・OJTの型）はありますか？",
    help: "1 = ほとんどない / 5 = 明確にある",
    higherIsWorse: false,
    affects: ["exhaustion", "dependency", "dissatisfaction"],
  },
  {
    id: "q_career",
    label: "社員は「この会社での将来像」を描けていると感じますか？",
    help: "1 = ほとんど描けていない / 5 = 描けている",
    higherIsWorse: false,
    affects: ["dependency", "dissatisfaction", "ambiguity", "exhaustion"],
  },
];

export type Answers = Record<string, AnswerValue>;

export interface IndexScore {
  id: IndexId;
  label: string;
  short: string;
  color: string;
  /** 0–100。高いほど課題が大きい */
  value: number;
}

export interface DiagnosisResult {
  scores: IndexScore[];
  overall: number;
  overallLabel: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** 回答1–5を「課題度0–100」に正規化 */
function toRisk(answer: AnswerValue, higherIsWorse: boolean): number {
  const raw = higherIsWorse ? answer : 6 - answer;
  return ((raw - 1) / 4) * 100;
}

export function computeDiagnosis(answers: Answers): DiagnosisResult {
  const buckets: Record<IndexId, number[]> = {
    exhaustion: [],
    trust: [],
    dissatisfaction: [],
    ambiguity: [],
    dependency: [],
  };

  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (a == null) continue;
    const risk = toRisk(a, q.higherIsWorse);
    for (const id of q.affects) {
      buckets[id].push(risk);
    }
  }

  const scores: IndexScore[] = INDEX_DEFS.map((def) => {
    const arr = buckets[def.id];
    const avg =
      arr.length === 0 ? 50 : arr.reduce((s, v) => s + v, 0) / arr.length;
    return {
      id: def.id,
      label: def.label,
      short: def.short,
      color: def.color,
      value: Math.round(clamp(avg, 0, 100)),
    };
  });

  const overall = Math.round(
    scores.reduce((s, x) => s + x.value, 0) / scores.length,
  );

  let overallLabel: string;
  if (overall >= 70) {
    overallLabel = "課題が積み上がりやすい状態です。制度の見直しを急いだ方がよさそうです。";
  } else if (overall >= 45) {
    overallLabel = "一部にひずみが出ている状態です。評価・等級の型づくりが効きやすい段階です。";
  } else {
    overallLabel = "比較的落ち着いていますが、属人化の芽は早めに摘んでおくと安心です。";
  }

  return { scores, overall, overallLabel };
}

export function summarizeAnswers(answers: Answers): string {
  return QUESTIONS.map((q) => {
    const a = answers[q.id];
    return `- ${q.label} → ${a ?? "未回答"}/5`;
  }).join("\n");
}

export function formatScoresForPrompt(scores: IndexScore[]): string {
  return scores.map((s) => `- ${s.label}: ${s.value}`).join("\n");
}

/** AI不可時の決定論的フィードバック（プロンプトではないUI向け文面） */
export function buildFallbackFeedback(result: DiagnosisResult): string {
  const sorted = [...result.scores].sort((a, b) => b.value - a.value);
  const top = sorted[0];
  const second = sorted[1];
  const lines = [
    `${top.label}が高めに出ており、現場の納得感や日々の負荷に影響しやすい状態です。`,
    `${second.label}も続いており、評価の見え方と意思決定の集中が重なっている可能性があります。`,
    "基準が曖昧なままだと、頑張りの可視化や育成の優先順位が後回しになりがちです。",
    "等級・キャリアの道筋が見えないと、定着や戦力化にもブレーキがかかりやすくなります。",
    "解体業に合わせた評価・等級の型を整えると、社長依存を減らしながら組織の土台を作れます。",
  ];
  return lines.join("\n");
}

export function isCompleteAnswers(answers: Answers): boolean {
  return QUESTIONS.every((q) => {
    const v = answers[q.id];
    return v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
  });
}
