/**
 * 管理画面用のユーザーを作成するスクリプト（開発・初期セットアップ用）。
 *
 * .env.local の NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を読み、
 * Supabase Auth Admin REST API を使って email_confirm 済みユーザーを作成する。
 * supabase-js のフルクライアント（realtime 依存）を避け、fetch のみで完結させる。
 *
 * 使い方:
 *   npm run create-admin -- <email> <password>
 * 例:
 *   npm run create-admin -- admin@example.com 'StrongPassw0rd!'
 */
import { readFileSync } from "node:fs";

function loadEnvLocal(path: string): Record<string, string> {
  const env: Record<string, string> = {};
  let raw = "";
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    throw new Error(`.env.local が見つかりません（${path}）`);
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function main(): Promise<void> {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("使い方: npm run create-admin -- <email> <password>");
    process.exit(1);
  }

  const env = loadEnvLocal(".env.local");
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env.local に設定してください。",
    );
    process.exit(1);
  }

  const projectRef = url.replace(/^https:\/\//, "").split(".")[0];
  console.log(`対象プロジェクト: ${projectRef}`);

  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });

  const body: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      typeof body === "object" && body !== null
        ? JSON.stringify(body)
        : String(body);
    console.error(`ユーザー作成に失敗しました (HTTP ${res.status}): ${msg}`);
    process.exit(1);
  }

  const created = body as { email?: string; id?: string };
  console.log(`✅ 管理ユーザーを作成しました: ${created.email ?? email}`);
  console.log("   /admin/login からログインできます。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
