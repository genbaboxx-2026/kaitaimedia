import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchSnsTrends } from "@/lib/sns/fetch-trends";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await fetchSnsTrends();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[sns-trends/refresh]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
