-- ニュース詳細用の自社解説文（AI生成）＋プロンプトstep

alter table public.news_items
  add column if not exists editorial_body text,
  add column if not exists editorial_generated_at timestamptz;

comment on column public.news_items.editorial_body is
  'タイトル＋RSS要約から生成した自社オリジナル解説（転載ではない）';
comment on column public.news_items.editorial_generated_at is
  'editorial_body を生成した日時';

-- prompt_step に news_editorial を追加（PostgreSQL 15+）
alter type public.prompt_step add value if not exists 'news_editorial';

insert into public.settings (key, value, value_type, description)
values
  ('news_editorial_enabled', 'true', 'boolean', 'ニュース自社解説文の自動生成'),
  ('news_editorial_max_per_run', '10', 'number', '1回のfetch-newsで生成する解説の上限件数')
on conflict (key) do nothing;

update public.prompts
set is_active = false
where step = 'news_editorial'
  and is_active = true;

insert into public.prompts (step, version, content, variables, is_active, note, created_by)
select
  'news_editorial',
  coalesce((select max(version) from public.prompts where step = 'news_editorial'), 0) + 1,
  E'あなたは解体業界の専門メディア「解体ナレッジ」の編集者です。次のニュース見出し（とあれば短い要約）だけを材料に、転載ではない独自の解説文をMarkdownで書いてください。\n\nニュース見出し: {{title}}\n出典: {{source_name}}\n配信元の短い要約（無い場合あり）: {{summary}}\n関連テーマの目安: {{topics}}\n\n要件:\n- 分量はおおよそ600〜1000字。\n- 元記事本文を想像で書き写さない。事実の断定は避け、「〜という報道がある」「元記事で確認する」など慎重な書き方にする。\n- 解体・建設・産廃の実務者向けに、読み方・確認ポイント・現場への示唆を中心に書く。\n- 金額（円・万円）、重量・容積（t・kg・m³）、単価、割合（%・割）、断定的な工期日数は一切書かない。\n- 外部URLは本文に書かない。\n- 出力は解説本文のMarkdownのみ（前置きや「以下が解説です」等は不要）。見出しを使う場合は ## / ### を使ってよい。',
  array['title','source_name','summary','topics'],
  false,
  'ニュース自社解説（初期）',
  'migration'
where not exists (
  select 1 from public.prompts
  where step = 'news_editorial' and note = 'ニュース自社解説（初期）'
);

update public.prompts
set is_active = true
where step = 'news_editorial'
  and note = 'ニュース自社解説（初期）';
