import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { suggestThemes } from "@/lib/generation/theme-suggest";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  // 認証チェック（管理者のみ）
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    instruction?: string;
    count?: number;
  };
  const count = body.count ?? 20;
  const instruction = (body.instruction ?? "").slice(0, 500);

  const { themes, source } = await suggestThemes(count, instruction);
  return NextResponse.json({ themes, source });
}
