/**
 * Nano Banana 図解サムネ試作
 *   npx tsx scripts/test-nanobanana-eyecatch.ts
 *
 * 要: .env.local に GEMINI_API_KEY
 */
import { writeFileSync } from "node:fs";
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

async function main(): Promise<void> {
  if (
    !process.env.GEMINI_API_KEY &&
    !process.env.GOOGLE_API_KEY &&
    !process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ) {
    console.error(
      "GEMINI_API_KEY が未設定です。.env.local に追加してください。\n" +
        "取得: https://aistudio.google.com/apikey",
    );
    process.exit(1);
  }

  const { generateDiagramEyecatchPng } = await import(
    "../src/lib/image/diagram-eyecatch"
  );

  const title =
    process.argv[2] ||
    "職長のマネジメント力を高める現場コミュニケーション術";
  const category = process.argv[3] || "現場運営";

  console.log(`タイトル: ${title}`);
  console.log(`カテゴリ: ${category}`);
  console.log("Nano Banana で図解生成中…");

  const result = await generateDiagramEyecatchPng(title, category);
  if (!result) {
    console.error("生成失敗");
    process.exit(1);
  }

  writeFileSync("eyecatch-yt-test.png", result.png);
  console.log(`保存: eyecatch-yt-test.png (${Math.round(result.png.length / 1024)}KB)`);
  console.log(`model: ${result.model}`);
  console.log(
    `tokens: in ${result.inputTokens} / out ${result.outputTokens}  cost≈$${result.costUsd.toFixed(4)}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
