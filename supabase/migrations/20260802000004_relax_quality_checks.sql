-- 品質チェック方針変更:
--   リンク死活 / 出典URL / 類似度 / AI定性評価 を既定OFF
--   本文は外部URLを原則載せない（プロンプト更新）
-- 数値検出・禁止表現・文字数など第1層の主要チェックは維持

update public.settings
set value = 'false',
    description = case key
      when 'check_link_alive_enabled' then '第1層: リンク死活チェック（URL非掲載方針のため既定OFF）'
      when 'check_source_url_enabled' then '第1層: 出典URLチェック（URL非掲載方針のため既定OFF）'
      when 'check_title_similarity_enabled' then '第2層: タイトル類似度チェック（テーマ選定で重複回避のため既定OFF）'
      when 'check_body_similarity_enabled' then '第2層: 本文類似度チェック（矛盾なければ重複許容のため既定OFF）'
      when 'check_ai_quality_enabled' then '第3層: AI定性評価チェック（運用方針により既定OFF）'
      else description
    end,
    updated_at = now()
where key in (
  'check_link_alive_enabled',
  'check_source_url_enabled',
  'check_title_similarity_enabled',
  'check_body_similarity_enabled',
  'check_ai_quality_enabled'
);

-- 型Cテンプレ: 出典URL必須を撤廃
update public.masters
set value = '一次情報型。法改正・制度・補助金を扱う。法令名・制度名で参照を示し、外部URLは本文に載せない。',
    description = '型Cの構成雛形（URL非掲載）',
    updated_at = now()
where master_type = 'article_template'
  and label = 'C';

-- body プロンプトを新版に切替
update public.prompts
set is_active = false
where step = 'body'
  and is_active = true;

insert into public.prompts (step, version, content, variables, is_active, note, created_by)
select
  'body',
  coalesce((select max(version) from public.prompts where step = 'body'), 0) + 1,
  E'あなたは解体業界の専門メディアのライターです。以下の見出し構成に沿って本文をMarkdownで書いてください。\n\n見出し構成: {{structure}}\n記事型: {{article_type}}\n文体: {{writing_style}}\n専門用語のレベル: {{expertise_level}}\n文字数: {{min_char_count}}〜{{max_char_count}}字\n禁止表現: {{ng_expressions}}\n推奨表現: {{recommended_expressions}}\n参照マスタ: {{masters}}\nFAQ: {{faq_section}}\n\n最重要の制約（違反厳禁）:\n- 金額（円・万円）、重量・容積（t・kg・m³）、単価（円/t 等）、割合（%・割）、断定的な工期日数を一切書かない。\n- 数量は読者が自分の現場の値を入れる前提で、計算式・考え方・確認項目として示す。\n- 事実と異なる数値を創作しない。不確かな数値は書かない。\n- 禁止表現（{{ng_expressions}}）は使わない。\n- 本文に http/https のURLや外部リンクを書かない。法令・制度は名称と概要のみで示す（読者が公式サイトで確認できるよう案内する程度にとどめる）。',
  array['structure','article_type','writing_style','expertise_level','min_char_count','max_char_count','ng_expressions','recommended_expressions','faq_section','masters'],
  false,
  'URL非掲載方針（出典URL必須を撤廃）',
  'migration'
where not exists (
  select 1 from public.prompts
  where step = 'body' and note = 'URL非掲載方針（出典URL必須を撤廃）'
);

update public.prompts
set is_active = true
where step = 'body'
  and note = 'URL非掲載方針（出典URL必須を撤廃）';
