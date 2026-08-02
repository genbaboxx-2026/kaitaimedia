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
    "mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-serif text-lg font-bold text-navy-800">
            解体業界特化メディア
          </p>
          <p className="mt-1 text-sm text-slate-500">管理画面</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
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
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700"
            >
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
            className="w-full rounded-md bg-navy-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-600 disabled:opacity-60"
          >
            {loading ? "ログイン中…" : "ログイン"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          このページは認証済みの管理者のみ利用できます。
        </p>
      </div>
    </div>
  );
}
