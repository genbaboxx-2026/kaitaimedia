-- =============================================================
-- 20260801000004_indexes.sql
-- インデックス（検索・フィルタ・類似度・全文検索）
-- =============================================================

set search_path = public, extensions;

-- articles: 一覧のフィルタ・ソート
create index if not exists idx_articles_status       on public.articles (status);
create index if not exists idx_articles_category     on public.articles (category_id);
create index if not exists idx_articles_type         on public.articles (article_type);
create index if not exists idx_articles_published_at on public.articles (published_at desc);
create index if not exists idx_articles_created_at   on public.articles (created_at desc);
create index if not exists idx_articles_theme        on public.articles (theme_id);

-- articles: 全文検索（日本語の部分一致に強い pg_trgm）
create index if not exists idx_articles_title_trgm
  on public.articles using gin (title gin_trgm_ops);
create index if not exists idx_articles_body_trgm
  on public.articles using gin (body gin_trgm_ops);

-- themes
create index if not exists idx_themes_status   on public.themes (status);
create index if not exists idx_themes_priority on public.themes (priority);
create index if not exists idx_themes_category on public.themes (category_id);
create index if not exists idx_themes_sort     on public.themes (sort_order);

-- generation_logs
create index if not exists idx_genlogs_theme   on public.generation_logs (theme_id);
create index if not exists idx_genlogs_article on public.generation_logs (article_id);
create index if not exists idx_genlogs_status  on public.generation_logs (status);
create index if not exists idx_genlogs_started on public.generation_logs (started_at desc);

-- quality_checks
create index if not exists idx_qc_genlog  on public.quality_checks (generation_log_id);
create index if not exists idx_qc_article on public.quality_checks (article_id);
create index if not exists idx_qc_layer   on public.quality_checks (layer);

-- article_versions
create index if not exists idx_versions_article on public.article_versions (article_id);

-- article_embeddings: コサイン類似度（HNSW）
create index if not exists idx_embeddings_title
  on public.article_embeddings using hnsw (title_embedding vector_cosine_ops);
create index if not exists idx_embeddings_body
  on public.article_embeddings using hnsw (body_embedding vector_cosine_ops);

-- ctas / masters / prompts
create index if not exists idx_ctas_category on public.ctas (category_id);
create index if not exists idx_ctas_active   on public.ctas (is_active);
create index if not exists idx_masters_type  on public.masters (master_type);
create index if not exists idx_prompts_step  on public.prompts (step);

-- audit_logs
create index if not exists idx_audit_created on public.audit_logs (created_at desc);
create index if not exists idx_audit_entity  on public.audit_logs (entity_type, entity_id);
