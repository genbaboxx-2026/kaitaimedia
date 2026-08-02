-- 記事の閲覧数（RANKING表示の基準）。
-- この列とRPCを追加すると、公開サイトのRANKINGが「実際の閲覧数の多い順」になる。
-- 未適用の間は、コード側で自動的に「新着順」にフォールバックする。

alter table public.articles
  add column if not exists view_count integer not null default 0;

create index if not exists idx_articles_view_count
  on public.articles (view_count desc);

-- 公開記事の閲覧数を +1 する（匿名からも呼べるよう security definer）。
create or replace function public.increment_article_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.articles
  set view_count = view_count + 1
  where slug = p_slug and status = 'published';
$$;

-- 匿名ロールからRPCを実行可能に（閲覧計測はブラウザから呼ぶ）
grant execute on function public.increment_article_view(text) to anon, authenticated, service_role;
