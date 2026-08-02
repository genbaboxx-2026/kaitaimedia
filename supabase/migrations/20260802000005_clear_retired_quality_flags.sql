-- 廃止した品質チェック（リンク死活・出典URL・類似度・AI定性）の
-- 過去記事バッジ／不合格フラグを掃除し、UI上の旧概念を消す

update public.articles
set failed_check_items = coalesce(
  (
    select array_agg(item order by ord)
    from unnest(failed_check_items) with ordinality as t(item, ord)
    where item is distinct from 'リンク死活'
      and item is distinct from '出典URL'
      and item not like 'タイトル類似度%'
      and item not like '本文類似度%'
      and item not like '類似度%'
      and item not like 'AI判定%'
  ),
  '{}'::text[]
)
where failed_check_items is not null
  and cardinality(failed_check_items) > 0;

-- 残不合格がなければ品質レイヤを合格扱いに
update public.articles
set quality_layers_passed = coalesce(quality_layers_total, 1),
    quality_layers_total = greatest(coalesce(quality_layers_total, 1), 1)
where coalesce(failed_check_items, '{}'::text[]) = '{}'::text[];
