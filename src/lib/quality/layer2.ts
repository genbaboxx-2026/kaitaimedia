import { embed, toVectorLiteral } from "@/lib/ai/embeddings";
import { restRpc } from "@/lib/supabase/rest";
import type { CheckResult, QualityInput, QualityThresholds } from "@/lib/quality/types";

interface MatchRow {
  article_id: string;
  similarity: number;
}

async function similarityCheck(
  checkItem: string,
  rpcFn: "match_articles_by_title" | "match_articles_by_body",
  text: string,
  threshold: number,
  excludeId: string | undefined,
): Promise<CheckResult> {
  const vector = await embed(text);
  if (!vector) {
    return {
      layer: 2,
      checkItem,
      passed: true,
      detail: "埋め込み未設定のためスキップ（OPENAI_API_KEY 未設定）",
    };
  }
  const rows = await restRpc<MatchRow[]>(rpcFn, {
    query_embedding: toVectorLiteral(vector),
    match_threshold: threshold,
    exclude_article_id: excludeId ?? null,
  });
  const top = rows && rows.length > 0 ? rows[0] : null;
  if (!top) {
    return { layer: 2, checkItem, passed: true, detail: "類似記事なし" };
  }
  return {
    layer: 2,
    checkItem: `類似度${top.similarity.toFixed(2)}`,
    passed: false,
    detail: `既存記事と類似（閾値${threshold}）`,
    score: top.similarity,
  };
}

// 第2層：類似度判定（pgvector）。要件定義書 6.2。
export async function runLayer2(
  input: QualityInput,
  thr: QualityThresholds,
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  if (thr.enabled["title_similarity"] !== false) {
    results.push(
      await similarityCheck(
        "タイトル類似度",
        "match_articles_by_title",
        input.title,
        thr.titleSim,
        input.articleId,
      ),
    );
  }
  if (thr.enabled["body_similarity"] !== false) {
    results.push(
      await similarityCheck(
        "本文類似度",
        "match_articles_by_body",
        input.body,
        thr.bodySim,
        input.articleId,
      ),
    );
  }
  return results;
}
