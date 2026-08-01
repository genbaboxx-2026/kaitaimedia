-- =============================================================
-- 20260801000003_tables.sql
-- テーブル定義（依存順に作成）
-- =============================================================

set search_path = public, extensions;

-- -------------------------------------------------------------
-- categories : カテゴリー
-- -------------------------------------------------------------
create table if not exists public.categories (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique,
  name                 text not null,
  description          text,
  default_article_type public.article_type,          -- 主に紐づく記事型（任意）
  image_template       text,                          -- アイキャッチSVGテンプレートのキー
  sort_order           integer not null default 0,    -- 表示順・立ち上げ順
  is_active            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
comment on table public.categories is '記事カテゴリー（初期14件）';

create trigger trg_categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- ctas : CTA（管理画面仕様 8）
-- -------------------------------------------------------------
create table if not exists public.ctas (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  heading      text,
  body         text,
  button_label text,
  link_url     text,
  position     public.cta_position not null default 'bottom',
  category_id  uuid references public.categories(id) on delete set null, -- null=全カテゴリー共通
  is_active    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.ctas is 'CTA（記事中/記事末尾に差し込む誘導ブロック）';

create trigger trg_ctas_updated_at before update on public.ctas
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- themes : テーマ在庫（要件定義書 8, 管理画面仕様 4）
-- -------------------------------------------------------------
create table if not exists public.themes (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  category_id    uuid references public.categories(id) on delete set null,
  target_keyword text,                                   -- 狙うキーワード
  article_type   public.article_type not null,          -- A/B/C
  priority       public.theme_priority not null default 'medium',
  sort_order     integer not null default 0,             -- ドラッグ並べ替え用
  status         public.theme_status not null default 'pending',
  note           text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  generated_at   timestamptz                             -- 記事生成に使われた日時
);
comment on table public.themes is '記事テーマ在庫（事前登録制）';

create trigger trg_themes_updated_at before update on public.themes
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- articles : 記事本体（要件定義書 8, 管理画面仕様 2/3）
-- -------------------------------------------------------------
create table if not exists public.articles (
  id                   uuid primary key default gen_random_uuid(),
  theme_id             uuid references public.themes(id) on delete set null,
  category_id          uuid references public.categories(id) on delete set null,
  cta_id               uuid references public.ctas(id) on delete set null,
  title                text not null,
  slug                 text not null unique,
  body                 text not null default '',        -- Markdown
  excerpt              text,                             -- 冒頭抜粋（一覧・クイックプレビュー用）
  article_type         public.article_type,
  status               public.article_status not null default 'draft',
  tags                 text[] not null default '{}',
  seo_title            text,
  meta_description     text,
  eyecatch_url         text,
  related_article_ids  uuid[] not null default '{}',     -- 関連記事（手動指定）
  source_urls          text[] not null default '{}',     -- 型Cの出典URL
  char_count           integer not null default 0,
  revision_count       integer not null default 0,       -- 自動修正回数 0〜2
  quality_score        numeric,                          -- 第3層AI判定スコア
  quality_layers_passed smallint,                        -- 合格した層数（3/3表示用）
  quality_layers_total  smallint,                        -- 判定した層数
  failed_check_items   text[] not null default '{}',     -- 一覧タグ表示用（最新判定の不合格項目）
  published_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
comment on table public.articles is '記事本体。公開判断・SEO情報・CTA参照を含む';

create trigger trg_articles_updated_at before update on public.articles
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- generation_logs : 生成履歴（要件定義書 8, 管理画面仕様 9）
-- -------------------------------------------------------------
create table if not exists public.generation_logs (
  id                 uuid primary key default gen_random_uuid(),
  theme_id           uuid references public.themes(id) on delete set null,
  article_id         uuid references public.articles(id) on delete set null,
  prompt_structure   text,                               -- 使用した各段階のプロンプト
  prompt_body        text,
  prompt_seo         text,
  prompt_fix         text,
  prompt_quality     text,
  referenced_masters jsonb not null default '{}',        -- 参照したマスタ情報のスナップショット
  draft_first        text,                               -- 初稿
  draft_final        text,                               -- 最終稿
  revision_count     integer not null default 0,
  status             public.generation_status not null default 'draft',
  error_message      text,
  ai_model           text,
  input_tokens       integer,
  output_tokens      integer,
  estimated_cost     numeric,
  started_at         timestamptz not null default now(),
  finished_at        timestamptz,
  published_at       timestamptz,
  published_url      text
);
comment on table public.generation_logs is '1回の記事生成の履歴（プロンプト・初稿・最終稿・トークン・コスト）';

-- -------------------------------------------------------------
-- article_versions : 初稿・修正稿の履歴（管理画面仕様 3 差分表示）
-- -------------------------------------------------------------
create table if not exists public.article_versions (
  id                uuid primary key default gen_random_uuid(),
  article_id        uuid not null references public.articles(id) on delete cascade,
  generation_log_id uuid references public.generation_logs(id) on delete set null,
  version_number    integer not null,                    -- 0=初稿, 1..=修正稿/手動編集
  title             text,
  body              text not null,
  is_first_draft    boolean not null default false,
  is_final          boolean not null default false,
  editor            text,                                -- 'ai' または編集者のメール
  created_at        timestamptz not null default now(),
  unique (article_id, version_number)
);
comment on table public.article_versions is '記事の版管理（初稿とAI/人手による修正稿）';

-- -------------------------------------------------------------
-- quality_checks : 品質チェック結果（要件定義書 6/8）
-- -------------------------------------------------------------
create table if not exists public.quality_checks (
  id                uuid primary key default gen_random_uuid(),
  generation_log_id uuid references public.generation_logs(id) on delete cascade,
  article_id        uuid references public.articles(id) on delete cascade,
  revision_number   integer not null default 0,
  layer             smallint not null check (layer in (1, 2, 3)),  -- 第1/2/3層
  check_item        text not null,                       -- 例: number_detection, char_count, title_similarity
  passed            boolean not null,
  score             numeric,                             -- 第3層のスコアや類似度の実値
  detail            text,
  created_at        timestamptz not null default now()
);
comment on table public.quality_checks is '品質チェックの項目単位の結果（3層）';

-- -------------------------------------------------------------
-- article_embeddings : 重複判定用ベクトル（要件定義書 6.2/8, pgvector）
-- 次元は settings.embedding_dimension と一致させること。
-- -------------------------------------------------------------
create table if not exists public.article_embeddings (
  id              uuid primary key default gen_random_uuid(),
  article_id      uuid not null references public.articles(id) on delete cascade,
  model           text,                                  -- 埋め込みモデル名
  title_embedding vector(1536),
  body_embedding  vector(1536),
  created_at      timestamptz not null default now(),
  unique (article_id)
);
comment on table public.article_embeddings is 'タイトル・本文の埋め込みベクトル（コサイン類似度による重複判定用）';

-- -------------------------------------------------------------
-- settings : 生成設定 key-value（要件定義書 8, 管理画面仕様 5）
-- -------------------------------------------------------------
create table if not exists public.settings (
  key         text primary key,
  value       text,
  value_type  text not null default 'string'
              check (value_type in ('string', 'number', 'boolean', 'json')),
  description text,
  updated_at  timestamptz not null default now()
);
comment on table public.settings is '生成ルール・品質基準・コスト上限などの設定（コードに定数を持たない）';

create trigger trg_settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- prompts : プロンプトとバージョン履歴（管理画面仕様 6）
-- -------------------------------------------------------------
create table if not exists public.prompts (
  id         uuid primary key default gen_random_uuid(),
  step       public.prompt_step not null,
  version    integer not null,
  content    text not null,
  variables  text[] not null default '{}',               -- 差し込み変数の一覧（ドキュメント用）
  is_active  boolean not null default false,              -- 現在有効な版
  note       text,
  created_by text,
  created_at timestamptz not null default now(),
  unique (step, version)
);
comment on table public.prompts is '各生成ステップのプロンプト。バージョン履歴を保持し active な1件を使用';

-- 1ステップにつき active な版は1件のみ
create unique index if not exists uq_prompts_active_per_step
  on public.prompts (step) where is_active;

-- -------------------------------------------------------------
-- masters : マスタ情報（種別で分類, 管理画面仕様 7）
-- -------------------------------------------------------------
create table if not exists public.masters (
  id          uuid primary key default gen_random_uuid(),
  master_type public.master_type not null,
  label       text,                                       -- 用語 / 質問 / 機能名 / 表現 / 型(A/B/C) など
  value       text,                                       -- 正しい表記 / 回答 / 説明 / 理由 / テンプレ本文 など
  description text,
  data        jsonb not null default '{}',                -- 種別ごとの追加項目
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.masters is 'マスタ情報（用語集/FAQ/禁止表現/数値検出除外/記事型テンプレ等）を種別で保持';

create trigger trg_masters_updated_at before update on public.masters
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- audit_logs : 操作ログ（管理画面仕様 共通）
-- -------------------------------------------------------------
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor       text,                                       -- 操作者のメール等
  actor_id    uuid,                                       -- auth.uid()
  action      text not null,                              -- insert/update/delete/publish/login 等
  entity_type text,                                       -- 対象テーブル名
  entity_id   uuid,
  summary     text,
  diff        jsonb,
  created_at  timestamptz not null default now()
);
comment on table public.audit_logs is '管理画面の操作ログ（誰がいつ何を変更したか）';
