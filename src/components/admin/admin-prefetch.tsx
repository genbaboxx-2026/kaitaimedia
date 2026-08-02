"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ROUTES = [
  "/admin/articles",
  "/admin/published",
  "/admin/sns-trends",
  "/admin/generation",
  "/admin/logs",
] as const;

/** サイドバー遷移を速くするため、主要ルートを裏で prefetch */
export function AdminPrefetch() {
  const router = useRouter();

  useEffect(() => {
    for (const href of ROUTES) {
      router.prefetch(href);
    }
  }, [router]);

  return null;
}
