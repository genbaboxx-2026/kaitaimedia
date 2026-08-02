import { ADMIN_ARTICLES } from "@/lib/admin-data";

// 生成履歴のダミーデータ（タスク4/10でDB接続に置き換える）。
export type GenLogStatus = "published" | "draft" | "failed";

export const GEN_LOG_STATUS_LABEL: Record<GenLogStatus, string> = {
  published: "公開",
  draft: "下書き",
  failed: "失敗",
};

export interface GenLogCheck {
  layer: 1 | 2 | 3;
  checkItem: string;
  passed: boolean;
  detail: string;
}

export interface GenLog {
  id: string;
  title: string;
  status: GenLogStatus;
  revisionCount: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  startedAt: string;
  finishedAt: string;
  promptStructure: string;
  promptBody: string;
  promptFix: string | null;
  draftFirst: string;
  draftFinal: string;
  error: string | null;
  checks: GenLogCheck[];
}

function statusOf(articleStatus: string): GenLogStatus {
  if (articleStatus === "published") return "published";
  if (articleStatus === "failed") return "failed";
  return "draft";
}

export const GEN_LOGS: GenLog[] = ADMIN_ARTICLES.map((a, i) => {
  const status = statusOf(a.status);
  const inputTokens = 3800 + i * 120;
  const outputTokens = 2600 + i * 90;
  const costUsd =
    (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;
  const checks: GenLogCheck[] = [
    {
      layer: 1,
      checkItem: "数値検出 / 文字数 / 見出し / 禁止表現",
      passed: a.quality.layer1,
      detail: a.quality.layer1 ? "第1層 合格" : `不合格：${a.failedChecks.join("、")}`,
    },
    {
      layer: 2,
      checkItem: "タイトル / 本文 類似度",
      passed: a.quality.layer2,
      detail: a.quality.layer2 ? "第2層 合格" : "類似記事を検出",
    },
    {
      layer: 3,
      checkItem: "AI定性評価",
      passed: a.quality.layer3,
      detail: a.quality.layer3 ? "自然さ4 / 一貫性4 / 具体性4" : "自然さ2 / 一貫性3 / 具体性2",
    },
  ];
  return {
    id: a.id,
    title: a.title,
    status,
    revisionCount: a.revisionCount,
    inputTokens,
    outputTokens,
    costUsd,
    startedAt: a.createdAt,
    finishedAt: a.createdAt,
    promptStructure:
      "あなたは解体業界の専門メディアの編集者です。次のテーマの見出し構成をJSONで出力してください。…（構成生成プロンプト v1）",
    promptBody:
      "見出し構成に沿って本文をMarkdownで書いてください。金額・重量・単価・割合・断定的な工期日数を一切書かない。…（本文生成プロンプト v2）",
    promptFix:
      a.revisionCount > 0
        ? "不合格項目に沿って本文を最小限で修正してください。…（自動修正プロンプト v1）"
        : null,
    draftFirst: `${a.excerpt}\n\n（AI初稿の本文がここに入ります）`,
    draftFinal: `${a.excerpt}\n\n（最終稿の本文がここに入ります）`,
    error:
      status === "failed"
        ? `品質チェック不合格：${a.failedChecks.join("、")}（自動修正3回目も不合格のため下書き保存）`
        : null,
    checks,
  };
});
