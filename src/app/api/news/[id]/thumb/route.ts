import { NextResponse } from "next/server";
import { isUsableNewsImageUrl, resolveNewsImageUrl } from "@/lib/news/og-image";
import { restSelect, restUpdate } from "@/lib/supabase/rest";

export const runtime = "nodejs";
export const maxDuration = 30;

interface NewsThumbRow {
  id: string;
  url: string;
  image_url: string | null;
  is_visible: boolean;
}

/**
 * サムネ未取得のニュース向け。OGP/Jina で解決して DB に保存し、画像URLへリダイレクトする。
 * 取得失敗時は 404（フロントはプレースホルダに倒す）。
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const rows = await restSelect<NewsThumbRow>(
    `news_items?select=id,url,image_url,is_visible&id=eq.${encodeURIComponent(id)}&limit=1`,
    0,
  );
  const row = rows?.[0];
  if (!row || !row.is_visible) {
    return new NextResponse(null, { status: 404 });
  }

  if (row.image_url && isUsableNewsImageUrl(row.image_url)) {
    return NextResponse.redirect(row.image_url, 302);
  }

  try {
    const preferJina = /news\.google\.com/i.test(row.url);
    const imageUrl = await resolveNewsImageUrl(row.url, { preferJina });
    if (!imageUrl || !isUsableNewsImageUrl(imageUrl)) {
      return new NextResponse(null, { status: 404 });
    }
    await restUpdate(`news_items?id=eq.${encodeURIComponent(row.id)}`, {
      image_url: imageUrl,
    });
    return NextResponse.redirect(imageUrl, 302);
  } catch (e) {
    console.error("[news/thumb]", e instanceof Error ? e.message : e);
    return new NextResponse(null, { status: 404 });
  }
}
