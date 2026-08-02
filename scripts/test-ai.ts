/**
 * AI呼び出しラッパーの疎通確認スクリプト。
 *   npm run test:ai
 * .env.local の ANTHROPIC_API_KEY を使い、簡単なプロンプトで応答・トークン・コストを表示する。
 */
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY が未設定です。.env.local に設定してから再実行してください。",
    );
    process.exit(1);
  }

  // 動的import：env を読み込んでからラッパーを読み込む
  const { callText } = await import("../src/lib/ai/client");

  const result = await callText({
    system: "あなたは簡潔に答えるアシスタントです。",
    prompt: "「解体業界特化メディアの疎通テストです」とだけ返してください。",
    maxTokens: 200,
  });

  console.log("--- 応答 ---");
  console.log(result.text);
  console.log("--- 使用状況 ---");
  console.log(`model: ${result.model}`);
  console.log(`input tokens : ${result.inputTokens}`);
  console.log(`output tokens: ${result.outputTokens}`);
  console.log(`est. cost    : $${result.costUsd.toFixed(6)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
