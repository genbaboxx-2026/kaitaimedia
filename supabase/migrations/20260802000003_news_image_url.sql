-- 外部ニュースのサムネイル画像URL
alter table public.news_items
  add column if not exists image_url text;

comment on column public.news_items.image_url is 'RSSまたはOGPから取得したサムネイルURL';
