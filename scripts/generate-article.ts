/**
 * 記事生成バッチのエントリポイント。
 *
 * 実際の生成パイプラインは /src/lib/generation に実装し、
 * ここから呼び出す（実装タスク10）。
 * 手動実行: `npm run generate`
 */
async function main(): Promise<void> {
  console.log("記事生成バッチは未実装です（タスク10で実装予定）。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
