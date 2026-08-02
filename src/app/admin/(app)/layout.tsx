import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav";
import { AdminMobileHeader } from "@/components/admin/admin-mobile-header";
import { SignOutButton } from "@/components/admin/sign-out-button";

export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware で getUser 済み。ここでは Cookie のセッションを読むだけ（Auth API 再リクエストしない）
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const email = session.user.email ?? "";

  return (
    <div className="flex min-h-screen bg-white md:bg-slate-100">
      {/* サイドバー（デスクトップ） */}
      <aside className="hidden w-60 shrink-0 flex-col bg-navy-800 md:flex">
        <div className="flex h-16 items-center px-5">
          <Link
            href="/admin"
            className="font-serif text-base font-bold text-white"
          >
            解体メディア管理
          </Link>
        </div>
        <AdminSidebar />
        <div className="mt-auto p-4 text-xs text-slate-400">
          運営：GENBABOXX
        </div>
      </aside>

      {/* メイン */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileHeader />

        {/* デスクトップヘッダー */}
        <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-6 md:flex">
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-slate-500">{email}</span>
            <SignOutButton />
          </div>
        </header>

        <main className="flex-1 px-0 py-0 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:p-6 md:pb-6">
          <div className="px-4 py-4 md:px-0 md:py-0">{children}</div>
        </main>
      </div>

      <AdminBottomNav />
    </div>
  );
}
