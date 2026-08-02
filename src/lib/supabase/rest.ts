// 公開サイトのサーバーサイド読み取り用の PostgREST 呼び出しヘルパ。
// service_role キーで RLS をバイパスして読み取る（要件：公開読み取りは service_role）。
// supabase-js の realtime 依存を避けるため fetch で完結させ、Node/Edge/Cloudflare で安定動作する。

function serviceCreds(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

function headers(key: string): Record<string, string> {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export async function restSelect<T>(
  pathAndQuery: string,
  revalidate = 300,
): Promise<T[] | null> {
  const creds = serviceCreds();
  if (!creds) return null;

  try {
    const res = await fetch(`${creds.url}/rest/v1/${pathAndQuery}`, {
      headers: headers(creds.key),
      next: { revalidate },
    });
    if (!res.ok) return null; // 権限不足・未接続などは null（呼び出し側でダミーにフォールバック）
    return (await res.json()) as T[];
  } catch {
    return null;
  }
}

// INSERT。作成した行（representation）を返す。書き込み系はエラーを投げる（パイプラインでログに残すため）。
export async function restInsert<T>(
  table: string,
  body: unknown,
): Promise<T[]> {
  const creds = serviceCreds();
  if (!creds) throw new Error("Supabase接続情報（service role）が未設定です");
  const res = await fetch(`${creds.url}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...headers(creds.key), Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`INSERT失敗 (${table}): HTTP ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as T[];
}

/** UPSERT（on_conflict 列で重複時はマージ）。例: restUpsert("news_items", rows, "url") */
export async function restUpsert<T>(
  table: string,
  body: unknown,
  onConflict: string,
): Promise<T[]> {
  const creds = serviceCreds();
  if (!creds) throw new Error("Supabase接続情報（service role）が未設定です");
  const res = await fetch(
    `${creds.url}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`,
    {
      method: "POST",
      headers: {
        ...headers(creds.key),
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    throw new Error(`UPSERT失敗 (${table}): HTTP ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as T[];
}

// UPDATE（PATCH）。pathAndQuery 例: "articles?id=eq.<uuid>"
export async function restUpdate<T>(
  pathAndQuery: string,
  body: unknown,
): Promise<T[]> {
  const creds = serviceCreds();
  if (!creds) throw new Error("Supabase接続情報（service role）が未設定です");
  const res = await fetch(`${creds.url}/rest/v1/${pathAndQuery}`, {
    method: "PATCH",
    headers: { ...headers(creds.key), Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`UPDATE失敗: HTTP ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as T[];
}

// DELETE。pathAndQuery 例: "articles?id=eq.<uuid>"
export async function restDelete(pathAndQuery: string): Promise<void> {
  const creds = serviceCreds();
  if (!creds) throw new Error("Supabase接続情報（service role）が未設定です");
  const res = await fetch(`${creds.url}/rest/v1/${pathAndQuery}`, {
    method: "DELETE",
    headers: headers(creds.key),
  });
  if (!res.ok) {
    throw new Error(`DELETE失敗: HTTP ${res.status} ${await res.text()}`);
  }
}

// RPC（関数呼び出し）。例: match_articles_by_title
export async function restRpc<T>(
  fn: string,
  args: Record<string, unknown>,
): Promise<T | null> {
  const creds = serviceCreds();
  if (!creds) return null;
  try {
    const res = await fetch(`${creds.url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: headers(creds.key),
      body: JSON.stringify(args),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
