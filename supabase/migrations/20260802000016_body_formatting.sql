-- 本文プロンプト：太字・マーカー・コールアウトなど読みやすい体裁を必須化

update public.prompts
set is_active = false
where step = 'body'
  and is_active = true;

insert into public.prompts (step, version, content, variables, is_active, note, created_by)
select
  'body',
  coalesce((select max(version) from public.prompts where step = 'body'), 0) + 1,
  E'あなたは解体業界の専門メディアのライターです。以下の見出し構成に沿って本文をMarkdownで書いてください。\n\n見出し構成: {{structure}}\n記事型: {{article_type}}\n文体: {{writing_style}}\n専門用語のレベル: {{expertise_level}}\n文字数: {{min_char_count}}〜{{max_char_count}}字\n禁止表現: {{ng_expressions}}\n推奨表現: {{recommended_expressions}}\n参照マスタ: {{masters}}\nFAQ: {{faq_section}}\n\n最重要の制約（違反厳禁）:\n- 金額（円・万円）、重量・容積（t・kg・m³）、単価（円/t 等）、割合（%・割）、断定的な工期日数を一切書かない。\n- 数量は読者が自分の現場の値を入れる前提で、計算式・考え方・確認項目として示す。\n- 事実と異なる数値を創作しない。不確かな数値は書かない。\n- 禁止表現（{{ng_expressions}}）は使わない。\n- 本文に http/https のURLや外部リンクを書かない。法令・制度は名称と概要のみで示す（読者が公式サイトで確認できるよう案内する程度にとどめる）。\n\n体裁（必ず守る・読みやすさのため）:\n- 大見出しは ## 、小見出しは ### のみ。単独の # は使わない。\n- 重要な用語・手順の要点は **太字** で強調する（各 ## セクションに2〜5箇所）。\n- 特に覚えてほしい一文は ==このように== マーカーで囲む（記事全体で2〜5箇所）。\n- 注意点・現場での要点は引用記法（行頭に > ）でコールアウトにする（記事全体で2〜4個）。例:\n  > ポイント：足場の点検は作業前に必ず行う。\n- 長い段落だけにせず、- の箇条書きを各セクションで使う。\n- 出力はMarkdown本文のみ（前置き不要）。',
  array['structure','article_type','writing_style','expertise_level','min_char_count','max_char_count','ng_expressions','recommended_expressions','faq_section','masters'],
  false,
  '本文に太字・マーカー・コールアウト体裁を必須化',
  'migration'
where not exists (
  select 1 from public.prompts
  where step = 'body' and note = '本文に太字・マーカー・コールアウト体裁を必須化'
);

update public.prompts
set is_active = true
where step = 'body'
  and note = '本文に太字・マーカー・コールアウト体裁を必須化';

-- 修正プロンプト：体裁を削らないよう追記した新版
update public.prompts
set is_active = false
where step = 'fix'
  and is_active = true
  and note is distinct from '本文に太字・マーカー・コールアウト体裁を必須化';

insert into public.prompts (step, version, content, variables, is_active, note, created_by)
select
  'fix',
  coalesce((select max(version) from public.prompts where step = 'fix'), 0) + 1,
  p.content || E'\n\n体裁の維持:\n- **太字**・==マーカー==・引用（>）によるコールアウト・箇条書きは削らない。読みやすさのために適切に使う。\n- 単独の # 見出しは ### に直す。',
  p.variables,
  false,
  '本文に太字・マーカー・コールアウト体裁を必須化',
  'migration'
from public.prompts p
where p.step = 'fix'
  and p.version = (select max(version) from public.prompts where step = 'fix')
  and not exists (
    select 1 from public.prompts
    where step = 'fix' and note = '本文に太字・マーカー・コールアウト体裁を必須化'
  );

update public.prompts
set is_active = true
where step = 'fix'
  and note = '本文に太字・マーカー・コールアウト体裁を必須化';
