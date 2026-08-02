import { NextResponse } from "next/server";
import { ensureNewsImageUrl } from "@/lib/news/ensure-image";
import {
  isGenericNewsImageUrl,
  isUsableNewsImageUrl,
} from "@/lib/news/og-image";
import { restSelect, restUpdate } from "@/lib/supabase/rest";

export const runtime = "nodejs";
export const maxDuration = 60;

interface NewsThumbRow {
  id: string;
  url: string;
  title: string;
  source_name: string;
  image_url: string | null;
  is_visible: boolean;
}

/**
 * サムネ解決: 実写OGP（汎用画像は除外）→ ダメなら個別生成サムネ。
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
    `news_items?select=id,url,title,source_name,image_url,is_visible&id=eq.${encodeURIComponent(id)}&limit=1`,
    0,
  );
  const row = rows?.[0];
  if (!row || !row.is_visible) {
    return new NextResponse(null, { status: 404 });
  }

  const existingOk =
    row.image_url &&
    isUsableNewsImageUrl(row.image_url) &&
    !isGenericNewsImageUrl(row.image_url);

  if (existingOk && row.image_url) {
    return NextResponse.redirect(row.image_url, {
      status: 302,
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  try {
    const imageUrl = await ensureNewsImageUrl({
      id: row.id,
      url: row.url,
      title: row.title,
      sourceName: row.source_name,
      existingImageUrl: row.image_url,
      replaceGeneric: true,
    });
    if (!imageUrl) {
      return new NextResponse(null, { status: 404 });
    }
    await restUpdate(`news_items?id=eq.${encodeURIComponent(row.id)}`, {
      image_url: imageUrl,
    });
    return NextResponse.redirect(imageUrl, {
      status: 302,
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch (e) {
    console.error("[news/thumb]", e instanceof Error ? e.message : e);
    return new NextResponse(null, { status: 404 });
  }
}
