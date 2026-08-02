import { redirect } from "next/navigation";

// ダッシュボードは廃止。管理画面のトップは記事管理に集約する。
export default function AdminHomePage() {
  redirect("/admin/articles");
}
