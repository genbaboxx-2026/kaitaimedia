import { NextResponse } from "next/server";
import { runScheduledGeneration } from "@/lib/generation/run-scheduled";

export const runtime = "nodejs";
/** 1本生成想定（Vercel Pro）。不足分は15分ごとの Cron で追い上げる */
export const maxDuration = 300;

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = req.headers.get("authorization");
  // Vercel が CRON_SECRET を付与して呼ぶ場合
  if (secret && auth === `Bearer ${secret}`) return true;
  // Cron 本体の識別ヘッダ（secret 未設定・不一致でも定時起動を落とさない）
  if (req.headers.get("x-vercel-cron") === "1") return true;
  if (req.headers.get("x-vercel-cron-schedule")) return true;
  return false;
}

/**
 * Vercel Cron 用の定時生成エンドポイント。
 * GitHub Actions の schedule 遅延に依存しない主系。
 */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await runScheduledGeneration({
      maxArticlesPerRun: 1,
      logPrefix: "[cron/generate]",
    });

    const failedHard =
      result.reason.includes("ANTHROPIC_API_KEY") ||
      (result.results.length > 0 &&
        result.producedOk === 0 &&
        result.publishedDrafts === 0);

    return NextResponse.json(
      {
        ok: !failedHard,
        ...result,
        results: result.results.map((r) => ({
          status: r.status,
          message: r.message,
          slug: r.slug,
        })),
      },
      { status: failedHard ? 500 : 200 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[cron/generate]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
