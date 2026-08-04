/**
 * 外部プロセス（npm run generate / GitHub Actions）から本番の公開キャッシュを破棄する。
 * next/cache に依存しない（CLI から import 可能）。
 */

function revalidateSecret(): string | null {
  return (
    process.env.REVALIDATE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    null
  );
}

function targetSiteUrl(): string | null {
  const explicit = process.env.REVALIDATE_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  if (site && !site.includes("localhost") && !site.includes("127.0.0.1")) {
    return site;
  }
  // ローカル .env でも本番DBへ公開する運用があるため、既定の本番へ再検証する
  return "https://kaitaimedia.jp";
}

export async function requestPublicRevalidate(
  slugs: string[] = [],
): Promise<void> {
  const siteUrl = targetSiteUrl();
  const secret = revalidateSecret();
  if (!siteUrl || !secret) {
    console.warn(
      "[revalidate] サイトURLまたはシークレットが未設定のためスキップ",
    );
    return;
  }

  try {
    const res = await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ slugs }),
    });
    if (!res.ok) {
      console.warn(
        `[revalidate] 失敗 HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`,
      );
      return;
    }
    console.log(
      `[revalidate] OK ${siteUrl} slugs=${slugs.join(",") || "(home)"}`,
    );
  } catch (e) {
    console.warn(
      `[revalidate] リクエスト失敗: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}
