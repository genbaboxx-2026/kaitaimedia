"use server";

import { revalidatePath } from "next/cache";
import { restUpdate } from "@/lib/supabase/rest";
import type { SnsTrendStatus } from "@/lib/types";

export type ActionResult = { ok: boolean; error?: string };

async function setStatus(
  id: string,
  status: Extract<SnsTrendStatus, "approved" | "rejected" | "pending">,
): Promise<ActionResult> {
  try {
    await restUpdate(`sns_trend_posts?id=eq.${encodeURIComponent(id)}`, {
      status,
      reviewed_at: new Date().toISOString(),
    });
    revalidatePath("/admin/sns-trends");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function approveSnsTrendAction(id: string): Promise<ActionResult> {
  return setStatus(id, "approved");
}

export async function rejectSnsTrendAction(id: string): Promise<ActionResult> {
  return setStatus(id, "rejected");
}

export async function resetSnsTrendAction(id: string): Promise<ActionResult> {
  return setStatus(id, "pending");
}
