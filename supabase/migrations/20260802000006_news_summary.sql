-- ニュース詳細ページ用の要約（RSS description。本文転載ではない）
alter table public.news_items
  add column if not exists summary text;

comment on column public.news_items.summary is
  'RSS等の短い要約。全文転載ではなく紹介ページ表示用';
