-- =============================================================
-- 20260801000002_types.sql
-- 列挙型（enum）。CREATE TYPE は IF NOT EXISTS を持たないため DO ブロックで冪等化。
-- =============================================================

-- 記事型 A/B/C（要件定義書 2.2）
do $$ begin
  create type public.article_type as enum ('A', 'B', 'C');
exception when duplicate_object then null; end $$;

-- 記事ステータス（要件定義書 11.1: 自動公開/下書き/公開停止/生成失敗）
do $$ begin
  create type public.article_status as enum ('published', 'draft', 'unpublished', 'failed');
exception when duplicate_object then null; end $$;

-- テーマステータス（要件定義書 8: 未生成/生成済/除外）
do $$ begin
  create type public.theme_status as enum ('pending', 'generated', 'excluded');
exception when duplicate_object then null; end $$;

-- テーマ優先度（管理画面仕様 4: 高/中/低）
do $$ begin
  create type public.theme_priority as enum ('high', 'medium', 'low');
exception when duplicate_object then null; end $$;

-- 生成履歴ステータス（要件定義書 8: 公開/下書き/失敗）
do $$ begin
  create type public.generation_status as enum ('published', 'draft', 'failed');
exception when duplicate_object then null; end $$;

-- プロンプトのステップ（管理画面仕様 6）
do $$ begin
  create type public.prompt_step as enum ('structure', 'body', 'seo', 'fix', 'quality');
exception when duplicate_object then null; end $$;

-- マスタ種別（管理画面仕様 7）
do $$ begin
  create type public.master_type as enum (
    'glossary',                 -- 用語集
    'faq',                      -- よくある質問
    'bakusoq_feature',          -- BAKUSOQ機能一覧
    'bakusoq_strength',         -- BAKUSOQの強み
    'ng_expression',            -- 禁止表現リスト
    'recommended_expression',   -- 推奨表現リスト
    'number_exclusion',         -- 数値検出の除外リスト
    'article_template'          -- 記事型テンプレート（A/B/C）
  );
exception when duplicate_object then null; end $$;

-- CTAの表示位置（管理画面仕様 8: 記事中/記事末尾/両方）
do $$ begin
  create type public.cta_position as enum ('inline', 'bottom', 'both');
exception when duplicate_object then null; end $$;
