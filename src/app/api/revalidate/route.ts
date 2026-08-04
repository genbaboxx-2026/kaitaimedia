import { NextResponse } from "next/server";
import { revalidatePublicSite } from "@/lib/revalidate-public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const expected =
    process.env.REVALIDATE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!expected) return false;
  const header = req.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const bodySecret = req.headers.get("x-revalidate-secret") ?? "";
  return bearer === expected || bodySecret === expected;
}

/**
 * 公開サイトの ISR キャッシュ破棄。
 * POST /api/revalidate
 * Authorization: Bearer <REVALIDATE_SECRET or SUPABASE_SERVICE_ROLE_KEY>
 * body: { "slugs": ["article-slug"] }
 */
export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let slugs: string[] = [];
  try {
    const body = (await req.json()) as { slugs?: unknown };
    if (Array.isArray(body.slugs)) {
      slugs = body.slugs.filter((s): s is string => typeof s === "string");
    }
  } catch {
    // body なしでもトップ等は破棄する
  }

  revalidatePublicSite(slugs);
  return NextResponse.json({ ok: true, revalidated: true, slugs });
}
