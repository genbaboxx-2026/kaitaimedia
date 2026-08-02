"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError("メールアドレスまたはパスワードが正しくありません。");
        setLoading(false);
        return;
      }
      // middleware がセッションを検知できるよう、フルリロードで /admin へ
      router.refresh();
      window.location.assign("/admin");
    } catch {
      setError("ログイン処理でエラーが発生しました。時間をおいて再度お試しください。");
      setLoading(false);
    }
  }

  const field =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[16px] text-ink focus:border-navy-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-600";

  return (
    <div
      className="flex min-h-screen flex-col bg-white px-6"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400">
            ADMIN
          </p>
          <h1 className="mt-2 text-[22px] font-black tracking-wide text-ink">
            管理コンソール
          </h1>
          <p className="mt-2 text-sm text-slate-400">解体業界特化メディア</p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm space-y-5">
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="text-sm font-bold text-ink">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-bold text-ink">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-navy-700 px-4 py-3.5 text-[15px] font-bold text-white active:bg-navy-600 disabled:opacity-60"
          >
            {loading ? "ログイン中…" : "ログイン"}
          </button>
        </form>
      </div>

      <p className="pb-6 text-center text-xs text-slate-400">
        認証済みの管理者のみ利用できます
      </p>
    </div>
  );
}
