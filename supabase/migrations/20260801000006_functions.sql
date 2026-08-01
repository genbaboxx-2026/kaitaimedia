-- =============================================================
-- 20260801000006_functions.sql
-- 類似度判定用 RPC（第2層品質チェック）
--
-- pipeline は service_role で呼び出す。search_path を関数側で固定し、
-- 呼び出し元の search_path に依存せず vector 演算子（<=>）を解決する。
-- =============================================================

-- 関数シグネチャの vector 型解決のため、作成時の search_path にも extensions を含める。
set search_path = public, extensions;

-- タイトルの類似記事を返す
create or replace function public.match_articles_by_title(
  query_embedding    vector(1536),
  match_threshold    double precision default 0.90,
  exclude_article_id uuid default null
)
returns table (article_id uuid, similarity double precision)
language sql
stable
set search_path = public, extensions
as $$
  select e.article_id,
         1 - (e.title_embedding <=> query_embedding) as similarity
  from public.article_embeddings e
  where e.title_embedding is not null
    and (exclude_article_id is null or e.article_id <> exclude_article_id)
    and 1 - (e.title_embedding <=> query_embedding) >= match_threshold
  order by e.title_embedding <=> query_embedding;
$$;

-- 本文の類似記事を返す
create or replace function public.match_articles_by_body(
  query_embedding    vector(1536),
  match_threshold    double precision default 0.85,
  exclude_article_id uuid default null
)
returns table (article_id uuid, similarity double precision)
language sql
stable
set search_path = public, extensions
as $$
  select e.article_id,
         1 - (e.body_embedding <=> query_embedding) as similarity
  from public.article_embeddings e
  where e.body_embedding is not null
    and (exclude_article_id is null or e.article_id <> exclude_article_id)
    and 1 - (e.body_embedding <=> query_embedding) >= match_threshold
  order by e.body_embedding <=> query_embedding;
$$;

-- 実行権限はサーバーサイド（service_role）に限定する
revoke all on function public.match_articles_by_title(vector, double precision, uuid) from public, anon, authenticated;
revoke all on function public.match_articles_by_body(vector, double precision, uuid)  from public, anon, authenticated;
grant execute on function public.match_articles_by_title(vector, double precision, uuid) to service_role;
grant execute on function public.match_articles_by_body(vector, double precision, uuid)  to service_role;
