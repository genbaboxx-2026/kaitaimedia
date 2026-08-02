-- news_editorial が enum に無いと prompts 更新が失敗する。
-- ※ SQL Editor ではこのファイルを「単独で」先に実行し、成功後に 00009 を実行すること。
--   （同一トランザクション内では新しい enum 値を使えない環境があるため）

alter type public.prompt_step add value if not exists 'news_editorial';

alter table public.news_items
  add column if not exists editorial_body text,
  add column if not exists editorial_generated_at timestamptz;

insert into public.settings (key, value, value_type, description)
values
  ('news_editorial_enabled', 'true', 'boolean', 'ニュース自社解説文の自動生成'),
  ('news_editorial_max_per_run', '10', 'number', '1回のfetch-newsで生成する解説の上限件数'),
  ('news_editorial_model', 'claude-haiku-4-5', 'string', 'ニュース自社解説に使うAIモデル')
on conflict (key) do nothing;
