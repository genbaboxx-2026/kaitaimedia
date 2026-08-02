-- SNSトレンド: 1回あたり約10件を目指す設定＋プロンプト

insert into public.settings (key, value, value_type, description)
values
  ('sns_trends_min_likes', '30', 'number', 'いいね数の目安（これ以上を優先）'),
  ('sns_trends_max_candidates', '10', 'number', '1回の更新で取得する候補件数の上限'),
  ('sns_trends_lookback_days', '30', 'number', 'SNSトレンド検索の遡及日数')
on conflict (key) do update
set
  value = excluded.value,
  value_type = excluded.value_type,
  description = excluded.description;

update public.prompts
set is_active = false
where step = 'sns_trends'
  and is_active = true;

insert into public.prompts (step, version, content, variables, is_active, note, created_by)
select
  'sns_trends',
  coalesce((select max(version) from public.prompts where step = 'sns_trends'), 0) + 1,
  E'あなたは解体・建設・産廃業界向けメディアの編集アシスタントです。X（旧Twitter）の x_search を必ず複数回使い、日本語の投稿から業界関係者が気になりそうな話題を集めてください。\n\n目標: できるだけ {{max_count}} 件ちょうどに近い件数を返す（最低でも5件以上を目指す）。1件や2件で打ち切らないこと。\n\n検索クエリ例（別々に検索する）:\n- 解体工事\n- 産廃 OR 産業廃棄物\n- 建設リサイクル\n- アスベスト 除去\n- 建設業 許可\n- 現場 安全 建設\n- 国交省 建設\n\n条件:\n- {{from_date}} 以降を優先\n- いいねは目安 {{min_likes}} 以上を優先。足りなければ関連が強い投稿で件数を埋めてよい（いいね数は分かる範囲で入れる。不明なら 0）\n- 個人攻撃・デマ・露骨な宣伝・アダルト・完全無関係は除外\n- 捏造禁止。実在する post_url のみ。同じ投稿の重複禁止\n\n出力はJSON配列のみ（前置き・コードフェンス禁止）:\n[\n  {\n    "post_url": "https://x.com/user/status/123",\n    "author_handle": "user",\n    "author_name": "表示名",\n    "text_snippet": "本文抜粋または要約（200字以内）",\n    "like_count": 120,\n    "posted_at": "2026-08-01T12:00:00Z",\n    "relevance_note": "関連理由を一行"\n  }\n]',
  array['from_date', 'min_likes', 'max_count'],
  true,
  '約10件取得を目標',
  'migration'
where not exists (
  select 1 from public.prompts
  where step = 'sns_trends' and note = '約10件取得を目標'
);

update public.prompts
set is_active = true
where step = 'sns_trends'
  and note = '約10件取得を目標';
