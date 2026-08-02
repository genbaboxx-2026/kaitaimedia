import { NextResponse } from "next/server";
import { restRpc } from "@/lib/supabase/rest";

// 記事の閲覧数を +1 する。view_count 列/RPC が未適用でも安全に無視される。
export async function POST(req: Request) {
  try {
    const { slug } = (await req.json()) as { slug?: string };
    if (!slug) return NextResponse.json({ ok: false }, { status: 400 });
    await restRpc("increment_article_view", { p_slug: slug });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
