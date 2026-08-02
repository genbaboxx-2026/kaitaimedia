-- SNSトレンド取得プロンプトを広めに更新＋遡及日数設定

insert into public.settings (key, value, value_type, description)
values
  ('sns_trends_lookback_days', '30', 'number', 'SNSトレンド検索の遡及日数')
on conflict (key) do nothing;

update public.prompts
set is_active = false
where step = 'sns_trends'
  and is_active = true;

insert into public.prompts (step, version, content, variables, is_active, note, created_by)
select
  'sns_trends',
  coalesce((select max(version) from public.prompts where step = 'sns_trends'), 0) + 1,
  E'あなたは解体・建設・産廃業界向けメディアの編集アシスタントです。X（旧Twitter）の x_search を必ず使い、日本語の投稿から業界関係者が気になりそうな話題を拾ってください。\n\n検索のヒント（複数回検索してよい）:\n- 解体 / 解体工事 / 産廃 / 産業廃棄物 / 建設リサイクル / アスベスト / 建設業 / 現場監督 / 建設許可\n- 国交省・自治体の建設・産廃関連の話題\n\n条件:\n- {{from_date}} 以降の投稿を優先\n- いいねは目安 {{min_likes}} 以上を優先（届かない場合でも関連が強ければ含めてよい）\n- 最大 {{max_count}} 件\n- 個人攻撃・デマ・露骨な宣伝・アダルト・完全に無関係な炎上は除外\n- 捏造禁止。実在する投稿URLのみ\n\n出力はJSON配列のみ（前置き・コードフェンス禁止）:\n[\n  {\n    "post_url": "https://x.com/user/status/123",\n    "author_handle": "user",\n    "author_name": "表示名",\n    "text_snippet": "本文抜粋または要約（200字以内）",\n    "like_count": 120,\n    "posted_at": "2026-08-01T12:00:00Z",\n    "relevance_note": "関連理由を一行"\n  }\n]\n\nどうしても無いときだけ []。',
  array['from_date', 'min_likes', 'max_count'],
  true,
  '検索ヒント追加・条件緩和',
  'migration'
where not exists (
  select 1 from public.prompts
  where step = 'sns_trends' and note = '検索ヒント追加・条件緩和'
);

update public.prompts
set is_active = true
where step = 'sns_trends'
  and note = '検索ヒント追加・条件緩和';
