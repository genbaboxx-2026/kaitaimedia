-- 1記事あたりの推定コスト上限（USD）。超過でその記事の生成を中断する。
insert into public.settings (key, value, value_type, description)
values (
  'per_article_cost_limit_usd',
  '3',
  'number',
  '1記事あたりの推定コスト上限（USD）。0=上限なし。超過で生成中断'
)
on conflict (key) do nothing;
