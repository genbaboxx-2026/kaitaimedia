"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.assign("/admin/login");
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 md:px-3 md:py-1.5 md:text-sm"
    >
      ログアウト
    </button>
  );
}
