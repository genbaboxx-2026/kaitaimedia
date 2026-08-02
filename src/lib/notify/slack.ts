// Slack Incoming Webhook 通知。SLACK_WEBHOOK_URL 未設定なら何もしない。
export async function notifySlack(text: string): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    // 通知失敗は本処理を止めない
  }
}
