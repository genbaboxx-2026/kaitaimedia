/**
 * NiNKU BOXX 組織診断プロンプト（AIメッセージ v2）を本番 prompts に適用する。
 * 使い方: npx tsx scripts/apply-ninkuboxx-diag-prompt.ts
 */
import { loadEnvLocal } from "./load-env-local";
loadEnvLocal();

import { restInsert, restSelect, restUpdate } from "../src/lib/supabase/rest";

const NOTE = "NiNKU BOXX組織診断AIメッセージ v2";

const CONTENT = `あなたは解体会社向け人事制度「NiNKU BOXX」の組織診断アドバイザーです。
社長が30秒で状況を把握できるよう、健全度スコアに沿った診断コメントを日本語で書いてください。

【健全度スコア】
{{health_score}}点 / 100点（点数帯: {{band_range}}）

【課題指数（0〜100・高いほど課題が大きい）】
{{scores}}

【回答要約】
{{answers_summary}}

【点数帯の方針（コピペ禁止。同じ意図・トーンで、今回の回答に合わせて毎回書き直す）】
- 50点以下「今すぐ見直しが必要」: 評価や給料が社長の感覚・その場判断に寄り、社員の不満・離職・給与決定の迷いが起きやすい、という趣旨。
- 51〜75点「仕組みを整えるタイミング」: 一部ルールはあるが評価・給与・育成が十分につながっていない。今のうちに整理すると人数が増えても回りやすい、という趣旨。
- 76点以上「制度の運用を確認」: 基本的な仕組みは整っている。社員に伝わっているか、昇給・育成に実際に使われているかを確認する、という趣旨。無理に不安を煽らない。

今回の点数帯は「{{band_range}}」です。必ずこの帯の方針に合わせてください。

要件:
- 出力は次の2行だけ。前置き・箇条書き・見出し記号（#）・番号は禁止。
- 1行目: 見出し：短い一文（結論がすぐわかる。方針見出しの丸写しは避け、言い回しを変える）
- 2行目: 本文：2文程度。専門用語を避け、解体業の社長が読んですぐ分かる言葉で。回答内容に触れて具体化する。
- スコアや回答と矛盾する内容は書かない（高得点なのに危機煽り、低得点なのに問題なし、など）。
- 金額・割合（%）・人数の具体数値は新たに作らない。スコア数値の再掲も避ける。
- 売り込み・無料相談の誘導は書かない（CTAは別途表示される）。
- 占い口調にしない。実務的でわかりやすい文体。`;

async function main() {
  const existing = await restSelect<{
    id: string;
    note: string;
    version: number;
    is_active: boolean;
  }>(
    "prompts?select=id,note,version,is_active&step=eq.ninkuboxx_diag&order=version.desc",
    0,
  );
  if (!existing) throw new Error("prompts fetch failed");
  console.log(
    "current:",
    existing.map((r) => ({ v: r.version, active: r.is_active, note: r.note })),
  );

  await restUpdate("prompts?step=eq.ninkuboxx_diag&is_active=eq.true", {
    is_active: false,
  });

  const found = existing.find((r) => r.note === NOTE);
  if (found) {
    await restUpdate(`prompts?id=eq.${found.id}`, {
      content: CONTENT,
      variables: ["health_score", "band_range", "scores", "answers_summary"],
      is_active: true,
    });
    console.log("updated existing", found.id);
  } else {
    const nextVersion = (existing[0]?.version ?? 0) + 1;
    const rows = await restInsert<{ id: string }>("prompts", {
      step: "ninkuboxx_diag",
      version: nextVersion,
      content: CONTENT,
      variables: ["health_score", "band_range", "scores", "answers_summary"],
      is_active: true,
      note: NOTE,
      created_by: "script",
    });
    console.log("inserted", rows[0]?.id, `v${nextVersion}`);
  }

  const after = await restSelect<{
    version: number;
    is_active: boolean;
    note: string;
  }>(
    "prompts?select=version,is_active,note&step=eq.ninkuboxx_diag&is_active=eq.true",
    0,
  );
  console.log("active now:", after);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
