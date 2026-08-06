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
  /** 課題側の短いラベル（高いほど悪い） */
  short: string;
  /** 健全度側の短いラベル（高いほど良い・レーダー表示用） */
  healthShort: string;
  color: string;
}

/** レーダー表示順（上から時計回り）= 定着率 → 社員満足 → 経営余裕 → 人材育成 → 将来性 */
export const INDEX_DEFS: IndexDef[] = [
  {
    id: "trust",
    label: "経営者の信頼不足指数",
    short: "信頼不足",
    healthShort: "定着率",
    color: "#ea580c",
  },
  {
    id: "dissatisfaction",
    label: "従業員の不満指数",
    short: "不満",
    healthShort: "社員満足",
    color: "#7c3aed",
  },
  {
    id: "exhaustion",
    label: "従業員疲弊指数",
    short: "疲弊",
    healthShort: "経営余裕",
    color: "#0d9488",
  },
  {
    id: "ambiguity",
    label: "評価あいまい指数",
    short: "評価あいまい",
    healthShort: "人材育成",
    color: "#0284c7",
  },
  {
    id: "dependency",
    label: "社長属人依存指数",
    short: "属人依存",
    healthShort: "将来性",
    color: "#be123c",
  },
];

/** 回答スケール（全問共通・1が悪い／5が良い） */
export const ANSWER_LABELS: Record<AnswerValue, string> = {
  1: "かなり問題がある",
  2: "やや問題がある",
  3: "どちらともいえない",
  4: "あまり問題がない",
  5: "問題がない",
};

/** 入力UI用の1行ガイド */
export const ANSWER_SCALE_HINT = "1＝かなり問題がある　　5＝問題がない";

/** 30秒チャット診断用（5問）。各指標に1問対応。5＝問題がない。 */
export const QUESTIONS: DiagnosisQuestion[] = [
  {
    id: "q_retention",
    label:
      "社員が突然辞めたり、採用しても長続きしないことがありますか？",
    help: ANSWER_SCALE_HINT,
    higherIsWorse: false,
    affects: ["trust"],
  },
  {
    id: "q_satisfaction",
    label:
      "給料や評価について、社員から不満や不公平感が出ていますか？",
    help: ANSWER_SCALE_HINT,
    higherIsWorse: false,
    affects: ["dissatisfaction"],
  },
  {
    id: "q_burden",
    label:
      "社員の評価や給料を決めることが、社長の負担になっていますか？",
    help: ANSWER_SCALE_HINT,
    higherIsWorse: false,
    affects: ["exhaustion"],
  },
  {
    id: "q_growth",
    label:
      "新人や若手が、教える人によって育ち方に差が出ていますか？",
    help: ANSWER_SCALE_HINT,
    higherIsWorse: false,
    affects: ["ambiguity"],
  },
  {
    id: "q_future",
    label:
      "社員に「何を頑張れば給料や役職が上がるか」を説明できていますか？",
    help: ANSWER_SCALE_HINT,
    higherIsWorse: false,
    affects: ["dependency"],
  },
];

export type Answers = Record<string, AnswerValue>;

export interface IndexScore {
  id: IndexId;
  label: string;
  short: string;
  healthShort: string;
  color: string;
  /** 0–100。高いほど課題が大きい */
  value: number;
}

export interface DiagnosisResult {
  scores: IndexScore[];
  overall: number;
  overallLabel: string;
}

export type HealthBandKey = "good" | "watch" | "danger";

export interface HealthBand {
  key: HealthBandKey;
  /** バッジ用点数帯 */
  range: string;
  /** AI失敗時の見出し */
  fallbackTitle: string;
  /** AI失敗時の本文 */
  fallbackBody: string;
}

export interface DiagnosisFeedback {
  title: string;
  body: string;
  actionTitle: string;
  actions: string[];
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** 画面に出す課題の下限（回答4相当＝25）。これ未満は「課題あり」扱いしない */
export const RISK_DISPLAY_THRESHOLD = 25;

/** 健全度（0〜100・高いほど良い）から点数帯を判定 */
export function getHealthBand(health: number): HealthBand {
  if (health >= 76) {
    return {
      key: "good",
      range: "76点以上",
      fallbackTitle: "制度の運用状況を確認しましょう",
      fallbackBody:
        "基本的な仕組みは整っています。制度が社員に伝わっているか、実際の昇給や育成に活用されているかを確認しましょう。",
    };
  }
  if (health >= 51) {
    return {
      key: "watch",
      range: "75点以下",
      fallbackTitle: "仕組みを整えるタイミングです",
      fallbackBody:
        "一部のルールはありますが、評価・給与・育成が十分につながっていません。今のうちに整理することで、社員数が増えても組織が回りやすくなります。",
    };
  }
  return {
    key: "danger",
    range: "50点以下",
    fallbackTitle: "今すぐ見直しが必要です",
    fallbackBody:
      "評価や給料の決め方が、社長の感覚やその場の判断に頼っている状態です。社員の不満や離職、給与決定の迷いが起きやすくなっています。",
  };
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
      healthShort: def.healthShort,
      color: def.color,
      value: Math.round(clamp(avg, 0, 100)),
    };
  });

  const overall = Math.round(
    scores.reduce((s, x) => s + x.value, 0) / scores.length,
  );

  const health = 100 - overall;
  const band = getHealthBand(health);
  const overallLabel = `${band.fallbackTitle} ${band.fallbackBody}`;

  return { scores, overall, overallLabel };
}

/** 危険度が閾値以上の指標だけを高い順で返す */
export function elevatedRisks(
  scores: IndexScore[],
  limit = 3,
): IndexScore[] {
  return [...scores]
    .filter((s) => s.value >= RISK_DISPLAY_THRESHOLD)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function summarizeAnswers(answers: Answers): string {
  return QUESTIONS.map((q) => {
    const a = answers[q.id];
    if (a == null) return `- ${q.label} → 未回答`;
    return `- ${q.label} → ${a}/5（${ANSWER_LABELS[a]}）`;
  }).join("\n");
}

/** プロンプト用：健全度指標名と点数（高いほど良い） */
export function formatScoresForPrompt(scores: IndexScore[]): string {
  return scores
    .map((s) => `- ${s.healthShort}: ${100 - s.value}`)
    .join("\n");
}

function fallbackActions(health: number, scores: IndexScore[]): string[] {
  if (health >= 76) {
    return [
      "評価の基準が社員に伝わっているか、現場で聞き取り確認する",
      "直近の昇給・役割変更で、評価が実際に使われたかを振り返る",
      "新人育成の進め方が教える人で差がないか、月次でそろえる",
    ];
  }
  const weak = [...scores]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((s) => s.healthShort);
  return [
    `${weak[0] ?? "評価"}の基準を紙かデータに残し、社長以外も使える形にする`,
    `${weak[1] ?? "給料"}の決め方を、感覚ではなく手順として書き出す`,
    `${weak[2] ?? "育成"}の進め方を誰が教えても同じになるよう型を作る`,
  ];
}

/** AI不可時の固定フォールバック */
export function buildFallbackFeedback(
  result: DiagnosisResult,
): DiagnosisFeedback {
  const health = 100 - result.overall;
  const band = getHealthBand(health);
  return {
    title: band.fallbackTitle,
    body: band.fallbackBody,
    actionTitle:
      health >= 76 ? "次に確認すべき3つ" : "次に取り組むべき3つ",
    actions: fallbackActions(health, result.scores),
  };
}

function asStringArray(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const items = v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);
  return items.length >= 3 ? items.slice(0, 3) : null;
}

/** AI出力（JSON優先、旧2行形式も許容）をパース。失敗時は null */
export function parseDiagnosisFeedback(raw: string): DiagnosisFeedback | null {
  const text = raw.trim();
  if (!text) return null;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const obj = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
      const title =
        typeof obj.feedbackTitle === "string" ? obj.feedbackTitle.trim() : "";
      const body =
        typeof obj.feedbackBody === "string" ? obj.feedbackBody.trim() : "";
      const actionTitle =
        typeof obj.actionTitle === "string" && obj.actionTitle.trim()
          ? obj.actionTitle.trim()
          : "次に取り組むべき3つ";
      const actions = asStringArray(obj.actions);
      if (title && body && actions) {
        return { title, body, actionTitle, actions };
      }
    } catch {
      // JSON以外の形式へフォールバック
    }
  }

  const titleMatch = text.match(/^(?:見出し|タイトル)\s*[:：]\s*(.+)$/m);
  const bodyMatch = text.match(/^(?:本文|コメント)\s*[:：]\s*(.+)$/m);
  if (titleMatch && bodyMatch) {
    const title = titleMatch[1].trim();
    const body = bodyMatch[1].trim();
    if (title && body) {
      return {
        title,
        body,
        actionTitle: "次に取り組むべき3つ",
        actions: fallbackActions(76, []),
      };
    }
  }

  return null;
}

export function isCompleteAnswers(answers: Answers): boolean {
  return QUESTIONS.every((q) => {
    const v = answers[q.id];
    return v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
  });
}
