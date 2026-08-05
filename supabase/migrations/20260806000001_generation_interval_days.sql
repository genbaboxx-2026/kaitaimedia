-- 記事定時生成の間隔（日）。1=毎日、2=2日に1回。
insert into public.settings (key, value, value_type, description)
values
  (
    'generation_interval_days',
    '1',
    'number',
    '定時記事生成の間隔（日）。1=毎日、2=2日に1回。管理画面から変更可'
  )
on conflict (key) do nothing;
