/**
 * AIアイキャッチの試作。
 *   npx tsx scripts/test-eyecatch.ts
 * gpt-image-1 で1枚生成し、ローカル保存＋（バケットがあれば）Supabaseへアップロードしてurlを表示する。
 */
import { writeFileSync } from "node:fs";
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

async function main(): Promise<void> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY が未設定です（.env.local）。");
    process.exit(1);
  }
  const { generateAiEyecatchPng, uploadEyecatch } = await import(
    "../src/lib/image/eyecatch"
  );

  const title = "解体工事におけるアスベスト事前調査の実施手順";
  const categoryName = "アスベスト対策";

  console.log("gpt-image-1 で生成中…（10〜30秒）");
  const result = await generateAiEyecatchPng(title, categoryName);
  if (!result) {
    console.error("生成に失敗しました。");
    process.exit(1);
  }

  const outPath = process.argv[2] || "eyecatch-test.png";
  writeFileSync(outPath, result.png);
  console.log(`ローカル保存: ${outPath}（${Math.round(result.png.length / 1024)}KB）`);
  console.log(
    `画像トークン: 入力 ${result.inputTokens} / 出力 ${result.outputTokens}・概算コスト $${result.costUsd.toFixed(4)}`,
  );

  const url = await uploadEyecatch(result.png, "eyecatch-test");
  if (url) console.log(`アップロードURL: ${url}`);
  else console.log("アップロードはスキップ（eyecatchバケットが無い/未設定）。ローカルPNGで確認してください。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
