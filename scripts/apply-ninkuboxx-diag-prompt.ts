/**
 * NiNKU BOXX 組織診断プロンプト（AIメッセージ v3 JSON）を本番 prompts に適用する。
 * 使い方: npx tsx scripts/apply-ninkuboxx-diag-prompt.ts
 */
import { loadEnvLocal } from "./load-env-local";
loadEnvLocal();

import { restInsert, restSelect, restUpdate } from "../src/lib/supabase/rest";

const NOTE = "NiNKU BOXX組織診断AIメッセージ v3 JSON";

const CONTENT = `あなたは、建設会社・解体会社向け人事制度サービス「NiNKU BOXX」の組織診断アドバイザーです。

経営者が診断結果を見て30秒以内に、

・今の会社がどのような状態か
・何ができていて、何が不足しているか
・NiNKU BOXXに相談する必要があるか

を理解できるコメントを作成してください。

【組織健全度】
{{health_score}}点 / 100点

【点数帯】
{{band_range}}

【5つの診断指標】
{{scores}}

【回答内容】
{{answers_summary}}

【点数帯ごとの基本方針】

■50点以下
評価・給料・育成の決め方が社長や一部の人の感覚に依存している状態。
社員の不満、離職、社長の負担が大きくなる前に、仕組みを整える必要がある。

■51〜75点
一部のルールや仕組みはあるが、実際の評価・昇給・育成に十分活用されていない状態。
制度を作る、または既存の制度を整理して運用につなげる段階。

■76点以上
基本的な制度や考え方は整っている状態。
社員への浸透、管理職による運用、昇給や育成への反映状況を確認する段階。

今回の点数帯は「{{band_range}}」です。
必ず点数帯と回答内容の両方に合わせてください。

【出力形式】
以下のJSON形式だけで出力してください。
説明文やコードブロックは付けないでください。

{
  "feedbackTitle": "会社の現在地を示す15〜25文字程度の見出し",
  "feedbackBody": "現在の状態と最優先課題を伝える2文、80〜130文字程度",
  "actionTitle": "次に取り組むべき3つ",
  "actions": [
    "最優先で行う具体的な取り組み",
    "次に行う具体的な取り組み",
    "継続して確認する具体的な取り組み"
  ]
}

【feedbackBodyの構成】
1文目：今回の回答から分かる、できている点または現在の状態
2文目：最も優先して見直すべき点と、放置した場合に起きやすい問題

【actionsのルール】
・必ず3件
・1件20〜40文字程度
・回答内容に合ったものにする
・抽象的な助言にしない
・経営者が読んで実行内容を理解できる表現にする
・「検討する」「意識する」だけで終わらせない
・高得点の場合は、制度を新しく作らせるのではなく、共有・確認・改善を中心にする
・低得点の場合は、評価基準、給料、育成のうち課題が大きい順に示す

【文章ルール】
・難しい人事用語を使わない
・経営者が普段使う言葉で書く
・「透明性」「属人性」「処遇」「運用面」などの抽象語を多用しない
・スコアや回答内容と矛盾することを書かない
・回答にない事実を断定しない
・すべてが良好な場合も、無理に不安をあおらない
・営業色を強くしすぎない
・毎回同じ文章にしない`;

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
