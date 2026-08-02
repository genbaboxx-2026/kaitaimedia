-- =============================================================
-- 20260802000002_news_items.sql
-- 外部RSSから集約する業界ニュース（見出し＋リンク）
-- =============================================================

create table if not exists public.news_items (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  url          text not null,
  source_id    text not null,                 -- mlit / sanpai / google_news など
  source_name  text not null,                 -- 表示用媒体名
  published_at timestamptz,
  fetched_at   timestamptz not null default now(),
  is_visible   boolean not null default true, -- フィルタ通過・手動非表示用
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint news_items_url_unique unique (url)
);

comment on table public.news_items is '外部メディアから取得した解体・建設・産廃ニュース（見出し＋元URL）';

create index if not exists idx_news_items_published_at
  on public.news_items (published_at desc nulls last);

create index if not exists idx_news_items_visible_published
  on public.news_items (is_visible, published_at desc nulls last);

create trigger trg_news_items_updated_at before update on public.news_items
  for each row execute function public.set_updated_at();

-- RLS: 公開読み取りは service_role。管理者は閲覧のみ（書き込みはバッチ）。
alter table public.news_items enable row level security;
revoke all on public.news_items from anon;
grant all on public.news_items to service_role;
grant select on public.news_items to authenticated;

create policy news_items_authenticated_select on public.news_items
  for select to authenticated using (true);
