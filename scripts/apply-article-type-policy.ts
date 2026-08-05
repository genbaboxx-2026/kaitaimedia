/**
 * 本番DBへ記事型方針（A/B/C再定義・法令禁止）を即時適用するワンショット。
 *   npx tsx scripts/apply-article-type-policy.ts
 */
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

const TEMPLATES: Record<"A" | "B" | "C", string> = {
  A: "現場・見積もりの手順型。見積もり・原価・工程・現場運営などの判断順序と確認項目を手順で示す。計算式を全面に出す構成は稀（月1本程度）とし、通常は数値を埋めず確認の観点で書く。法令・条文・許認可手続きの解説はしない。",
  B: "経営・組織・人材型。経営、採用、等級制度、評価制度、広報・採用ブランディング、育成・定着など会社づくりを扱う。計算テンプレートにはしない。法令・条文・許認可手続きの解説はしない。",
  C: "業界動向・視点型。業界の動き、他業種比較、スタートアップ視点など広い視野のテーマを扱う（全体の約1割）。法令・条文・許認可手続きの解説はしない。制度名に触れる場合も概要のみ。",
};

async function main(): Promise<void> {
  const { restSelect, restUpdate } = await import("../src/lib/supabase/rest");

  for (const label of ["A", "B", "C"] as const) {
    await restUpdate(
      `masters?master_type=eq.article_template&label=eq.${label}`,
      { value: TEMPLATES[label], description: `型${label}の構成雛形` },
    );
    console.log(`template ${label} updated`);
  }

  const bodyRows = await restSelect<{ id: string; content: string }>(
    "prompts?select=id,content&step=eq.body&is_active=is.true&limit=1",
    0,
  );
  const body = bodyRows?.[0];
  if (body) {
    const old =
      "法令・制度は名称と概要のみで示す（読者が公式サイトで確認できるよう案内する程度にとどめる）。";
    const next =
      "法令・法律・条文・許認可手続きの解説は一切書かない。制度名に触れる場合も「必要なら公式情報を確認」程度にとどめ、法律解説にしない。";
    let content = body.content.includes(old)
      ? body.content.replace(old, next)
      : body.content;
    if (!content.includes("法令・法律・条文・許認可手続きの解説は一切書かない")) {
      content += `\n- ${next}`;
    }
    await restUpdate(`prompts?id=eq.${body.id}`, { content });
    console.log("body prompt updated");
  }

  const structureRows = await restSelect<{ id: string; content: string }>(
    "prompts?select=id,content&step=eq.structure&is_active=is.true&limit=1",
    0,
  );
  const structure = structureRows?.[0];
  if (structure) {
    const note =
      "追加制約：法令・法律・条文・許認可手続きの解説を見出しに含めない。";
    if (!structure.content.includes("法令・法律・条文・許認可手続きの解説を見出しに含めない")) {
      await restUpdate(`prompts?id=eq.${structure.id}`, {
        content: `${structure.content}\n\n${note}`,
      });
      console.log("structure prompt updated");
    } else {
      console.log("structure prompt already has no-law note");
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
