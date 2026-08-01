-- =============================================================
-- 20260801000001_extensions.sql
-- 拡張機能と共通ヘルパー関数
-- =============================================================

-- 重複判定に使うベクトル型（pgvector）と、日本語を含む部分一致検索用の pg_trgm。
-- Supabase の慣例に従い extensions スキーマにインストールする。
create extension if not exists vector  with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- 以降のマイグレーションで vector 型・演算子・opclass を素の名前で参照できるように
-- search_path に extensions を含める。
set search_path = public, extensions;

-- updated_at を自動更新する共通トリガ関数
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
