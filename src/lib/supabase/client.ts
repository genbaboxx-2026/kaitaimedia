import { createBrowserClient } from "@supabase/ssr";

// Client Component 用の Supabase クライアント（ブラウザ）。
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
