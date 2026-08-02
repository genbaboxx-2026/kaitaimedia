-- ニュース解説を3部構成に変更（わかりやすく解説 / 実務確認 / 実際の内容）

update public.prompts
set is_active = false
where step = 'news_editorial'
  and is_active = true;

insert into public.prompts (step, version, content, variables, is_active, note, created_by)
select
  'news_editorial',
  coalesce((select max(version) from public.prompts where step = 'news_editorial'), 0) + 1,
  E'あなたは解体業界の専門メディア「解体ナレッジ」の編集者です。次のニュース見出しと、あれば短い要約だけを材料にして、転載ではない独自の解説をMarkdownで出力してください。\n\nニュース見出し: {{title}}\n出典: {{source_name}}\n配信元の短い要約（無い場合あり）: {{summary}}\n関連テーマの目安: {{topics}}\n\n必ず次の3つの見出し（##）だけをこの順番で使い、それ以外の大見出しは作らないでください。\n\n## わかりやすく解説\n- 難しい話をかみ砕いて説明する。おおよそ5行（150〜250字程度）。\n- 専門用語は避け、現場の人がすぐ分かる言い回しにする。\n\n## 実務で確認できそうなこと\n- 解体・産廃・建設の実務者がチェックできそうなことを書く。\n- 箇条書き（3〜5項目）でも、短い段落（合計5行程度）でもよい。1項目だけでもよい。\n\n## 実際の内容\n- 提供された見出しと要約だけを材料に、元のニュースが伝えている内容を普通の記事要約としてまとめる。\n- 材料にない固有の事実・数字・固有名詞の詳細は創作しない。要約が薄い場合は見出しから分かる範囲だけ書く。\n- おおよそ4〜8文。\n\n共通の制約（違反厳禁）:\n- 金額（円・万円）、重量・容積（t・kg・m³）、単価、割合（%・割）、断定的な工期日数は一切書かない。\n- 外部URLは書かない。\n- 「以下が解説です」などの前置きは不要。Markdown本文のみを出力する。',
  array['title','source_name','summary','topics'],
  true,
  'ニュース解説3部構成',
  'migration'
where not exists (
  select 1 from public.prompts
  where step = 'news_editorial' and note = 'ニュース解説3部構成'
);

update public.prompts
set is_active = true
where step = 'news_editorial'
  and note = 'ニュース解説3部構成';

-- 旧フォーマットの解説を消し、次回 fetch-news で3部構成を再生成
update public.news_items
set editorial_body = null,
    editorial_generated_at = null
where editorial_body is not null;
