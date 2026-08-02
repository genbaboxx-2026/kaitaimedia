-- 解説生成の安定化: Haikuの日付付きモデルID + 1回あたり件数を抑える
update public.settings
set value = 'claude-haiku-4-5-20251001',
    description = 'ニュース自社解説に使うAIモデル',
    updated_at = now()
where key = 'news_editorial_model';

insert into public.settings (key, value, value_type, description)
values (
  'news_editorial_model',
  'claude-haiku-4-5-20251001',
  'string',
  'ニュース自社解説に使うAIモデル'
)
on conflict (key) do update
set value = excluded.value,
    description = excluded.description,
    updated_at = now();

update public.settings
set value = '5',
    description = '1回のfetch-newsで生成する解説の上限件数（ハング対策で控えめ）',
    updated_at = now()
where key = 'news_editorial_max_per_run';
