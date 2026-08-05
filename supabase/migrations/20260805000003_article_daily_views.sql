-- 記事の日次PV（管理画面で「累計 (昨日)」を出すため）。
-- タイムゾーンは Asia/Tokyo。

create table if not exists public.article_daily_views (
  article_id uuid not null references public.articles (id) on delete cascade,
  view_date date not null,
  view_count integer not null default 0,
  primary key (article_id, view_date)
);

create index if not exists idx_article_daily_views_date
  on public.article_daily_views (view_date desc);

alter table public.article_daily_views enable row level security;
revoke all on public.article_daily_views from anon;
grant all on public.article_daily_views to service_role;
grant select on public.article_daily_views to authenticated;

drop policy if exists article_daily_views_authenticated_select on public.article_daily_views;
create policy article_daily_views_authenticated_select
  on public.article_daily_views
  for select
  to authenticated
  using (true);

-- 累計 + 日次を同時に +1（JST 日付）。
create or replace function public.increment_article_view(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_date date := (timezone('Asia/Tokyo', now()))::date;
begin
  update public.articles
  set view_count = view_count + 1
  where slug = p_slug and status = 'published'
  returning id into v_id;

  if v_id is null then
    return;
  end if;

  insert into public.article_daily_views (article_id, view_date, view_count)
  values (v_id, v_date, 1)
  on conflict (article_id, view_date)
  do update set view_count = public.article_daily_views.view_count + 1;
end;
$$;

grant execute on function public.increment_article_view(text) to anon, authenticated, service_role;
