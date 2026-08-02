-- ニュース自社解説はコスト優先で Haiku を既定に
insert into public.settings (key, value, value_type, description)
values (
  'news_editorial_model',
  'claude-haiku-4-5',
  'string',
  'ニュース自社解説に使うAIモデル'
)
on conflict (key) do update
set value = excluded.value,
    description = excluded.description,
    updated_at = now();
