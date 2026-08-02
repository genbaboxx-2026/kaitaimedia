-- =============================================================
-- seed.sql
-- 初期データ（カテゴリー14件 / 生成設定デフォルト / 初期プロンプト / 数値検出除外マスタ）
--
-- 冪等: すべて ON CONFLICT ... DO NOTHING。再実行しても重複しない。
-- 適用先は必ず「解体メディア用プロジェクト」であること（BAKUSOQ本番DBに流さない）。
-- Supabase CLI では `supabase db reset` 時に自動適用される。
-- リモートに投入する場合は SQL Editor か psql でこのファイルを実行する。
-- =============================================================

-- -------------------------------------------------------------
-- カテゴリー 14件
--   1-8: 要件定義書に明記 / 9-14: 解体業界向けに補完（管理画面から編集可）
-- -------------------------------------------------------------
insert into public.categories (slug, name, description, default_article_type, image_template, sort_order) values
  ('estimate',  '見積もり',       '解体工事の見積もりの考え方・チェック項目',            'A', 'estimate',  1),
  ('cost',      '原価管理',       '原価の内訳と管理の実務',                              null, 'cost',      2),
  ('schedule',  '工期',           '工程・工期の組み立てと管理',                          'A', 'schedule',  3),
  ('labor',     '人工',           '人工（にんく）と人員計画の考え方',                    'B', 'labor',     4),
  ('waste',     '産廃',           '産業廃棄物・マニフェストの実務',                      'B', 'waste',     5),
  ('law',       '法改正',         '解体・建設関連の法改正と制度（法令名・制度名で参照）', 'C', 'law',       6),
  ('subsidy',   '補助金',         '解体・空き家関連の補助金・制度（法令名・制度名で参照）', 'C', 'subsidy',   7),
  ('news',      '業界ニュース',   '解体業界の動向・一次情報（外部URLは本文に載せない）',   'C', 'news',      8),
  ('asbestos',  'アスベスト対策', 'アスベスト（石綿）の事前調査・除去・届出の実務',      null, 'asbestos',  9),
  ('license',   '許認可・届出',   '解体工事業登録・建設業許可・各種届出',                null, 'license',   10),
  ('safety',    '安全管理',       '現場の安全管理・KY・災害防止',                        null, 'safety',    11),
  ('machinery', '重機・工法',     '重機・アタッチメント・解体工法の選定',                null, 'machinery', 12),
  ('neighbor',  '近隣対応',       '近隣説明・苦情対応・トラブル防止',                    null, 'neighbor',  13),
  ('management','経営・集客',     '解体会社の経営・集客・人材',                          null, 'management',14)
on conflict (slug) do nothing;

-- -------------------------------------------------------------
-- 生成設定（管理画面仕様 5）
-- -------------------------------------------------------------
insert into public.settings (key, value, value_type, description) values
  -- 自動生成の制御
  ('auto_publish_enabled',        'false',   'boolean', '完全自動公開トグル。ON=合格記事を即公開 / OFF=すべて下書き（初期はOFF推奨）'),
  ('generation_enabled',          'true',    'boolean', '自動生成の有効/無効。OFFで生成自体を停止'),
  ('generation_time',             '03:00',   'string',  '記事生成バッチの実行時刻（JST, HH:MM）'),
  ('articles_per_day',            '1',       'number',  '1日の生成本数'),
  -- 記事生成ルール
  ('min_char_count',              '3000',    'number',  '本文の下限文字数'),
  ('max_char_count',              '4000',    'number',  '本文の上限文字数'),
  ('writing_style',               'desu_masu','string', '文体（desu_masu=です・ます / dearu=だ・である）'),
  ('expertise_level',             'intermediate','string','専門用語のレベル（beginner/intermediate/advanced）'),
  ('heading_count',               '5',       'number',  '見出し数（H2）の目安'),
  ('article_type_ratio',          '{"A":0.4,"B":0.3,"C":0.3}','json','記事型A/B/Cの生成配分比率'),
  ('bakusoq_mention_level',       'medium',  'string',  'BAKUSOQ紹介の分量（low/medium/high）'),
  ('faq_enabled',                 'true',    'boolean', 'FAQセクションの有無'),
  ('max_auto_revisions',          '2',       'number',  '自動修正の上限回数（要件: 最大2回）'),
  -- 品質基準
  ('title_similarity_threshold',  '0.90',    'number',  '第2層: タイトル類似度の不合格閾値（コサイン類似度）'),
  ('body_similarity_threshold',   '0.85',    'number',  '第2層: 本文類似度の不合格閾値（コサイン類似度）'),
  ('ai_quality_pass_score',       '3',       'number',  '第3層: AI定性評価の合格ライン（5段階）'),
  ('seo_title_max_length',        '32',      'number',  'SEOタイトルの上限文字数（全角）'),
  ('meta_description_max_length',  '120',    'number',  'メタディスクリプションの上限文字数（全角）'),
  ('check_number_detection_enabled','true',  'boolean', '第1層: 数値表現検出チェック'),
  ('check_char_count_enabled',    'true',    'boolean', '第1層: 文字数チェック'),
  ('check_heading_enabled',       'true',    'boolean', '第1層: 見出し階層チェック'),
  ('check_ng_expression_enabled', 'true',    'boolean', '第1層: 禁止表現チェック'),
  ('check_cta_enabled',           'false',   'boolean', '第1層: CTA有無チェック（CTA機能は廃止のため既定OFF）'),
  ('check_image_enabled',         'false',   'boolean', '第1層: アイキャッチ有無チェック（公開サイトはSVGで自動表示のため既定OFF）'),
  ('check_seo_length_enabled',    'true',    'boolean', '第1層: SEOタイトル/メタ文字数チェック'),
  ('check_link_alive_enabled',    'false',   'boolean', '第1層: リンク死活チェック（URL非掲載方針のため既定OFF）'),
  ('check_source_url_enabled',    'false',   'boolean', '第1層: 出典URLチェック（URL非掲載方針のため既定OFF）'),
  ('check_title_similarity_enabled','false', 'boolean', '第2層: タイトル類似度チェック（テーマ選定で重複回避のため既定OFF）'),
  ('check_body_similarity_enabled','false',  'boolean', '第2層: 本文類似度チェック（矛盾なければ重複許容のため既定OFF）'),
  ('check_ai_quality_enabled',    'false',   'boolean', '第3層: AI定性評価チェック（運用方針により既定OFF）'),
  ('news_editorial_enabled',      'true',    'boolean', 'ニュース自社解説文の自動生成'),
  ('news_editorial_max_per_run',  '5',       'number',  '1回のfetch-newsで生成する解説の上限件数'),
  ('news_editorial_model',        'claude-haiku-4-5-20251001','string','ニュース自社解説に使うAIモデル'),
  -- コスト制御・モデル
  ('monthly_ai_budget_limit',     '0',       'number',  '月間AI利用料の上限（円）。0=未設定（上限なし）'),
  ('ai_model',                    'claude-sonnet-5','string','記事生成に使用するAIモデル'),
  ('embedding_model',             'text-embedding-3-small','string','埋め込み生成モデル（次元は embedding_dimension と一致させる）'),
  ('embedding_dimension',         '1536',    'number',  '埋め込みベクトルの次元数（article_embeddings の列定義と一致させること）'),
  ('theme_stock_warning_threshold','20',     'number',  'テーマ在庫の警告閾値（要件: 20件未満で通知）')
on conflict (key) do nothing;

-- -------------------------------------------------------------
-- 数値検出の除外リスト（要件定義書 6.1 / 誤検知防止）
-- 第1層チェックはこれをマスタから取得して使う。
-- -------------------------------------------------------------
-- masters には自然キーがないため NOT EXISTS で冪等化（master_type + label で判定）
insert into public.masters (master_type, label, value, description, sort_order)
select v.master_type::public.master_type, v.label, v.value, v.description, v.sort_order
from (values
  ('number_exclusion', '4t車',     '一般名詞化した規格値のため許容',   '運搬車両の一般的な呼称', 1),
  ('number_exclusion', '2t車',     '一般名詞化した規格値のため許容',   '運搬車両の一般的な呼称', 2),
  ('number_exclusion', '0.25m³級', 'バックホウの規格クラスのため許容', '重機の規格表記',         3),
  ('number_exclusion', '0.45m³級', 'バックホウの規格クラスのため許容', '重機の規格表記',         4),
  ('number_exclusion', '第◯条',    '法令の条番号は許容',               '法令参照',               5),
  ('number_exclusion', '令和◯年',  '年号・年月日は許容',               '日付表現',               6),
  ('number_exclusion', '平成◯年',  '年号・年月日は許容',               '日付表現',               7)
) as v(master_type, label, value, description, sort_order)
where not exists (
  select 1 from public.masters m
  where m.master_type = v.master_type::public.master_type and m.label = v.label
);

-- -------------------------------------------------------------
-- 記事型テンプレート（要件定義書 2.2 / A・B・C の構成雛形の初期値）
-- -------------------------------------------------------------
insert into public.masters (master_type, label, value, description, sort_order)
select v.master_type::public.master_type, v.label, v.value, v.description, v.sort_order
from (values
  ('article_template', 'A', '手順・チェックリスト型。実務上の判断順序と確認項目を、番号付きの手順とチェックリストで示す。具体的な単価・金額・数量は書かない。', '型Aの構成雛形', 1),
  ('article_template', 'B', '計算テンプレート型。計算式と項目構成のみを提示し、単価は読者が入力する前提で書く。数値そのものは埋めない。', '型Bの構成雛形', 2),
  ('article_template', 'C', '一次情報型。法改正・制度・補助金を扱う。法令名・制度名で参照を示し、外部URLは本文に載せない。', '型Cの構成雛形', 3)
) as v(master_type, label, value, description, sort_order)
where not exists (
  select 1 from public.masters m
  where m.master_type = v.master_type::public.master_type and m.label = v.label
);

-- -------------------------------------------------------------
-- 初期プロンプト（各ステップ version 1 を active に）
-- 本文は管理画面から編集する前提の暫定値。数値不使用ルールを必ず含める。
-- -------------------------------------------------------------
insert into public.prompts (step, version, content, variables, is_active, note, created_by) values
  ('structure', 1,
E'あなたは解体業界の専門メディアの編集者です。以下のテーマについて、記事の見出し構成をJSONで出力してください。\n\nテーマ: {{theme}}\nカテゴリー: {{category}}\n記事型: {{article_type}}\n狙うキーワード: {{target_keyword}}\n見出し数の目安: H2見出しを{{heading_count}}個程度\n参照マスタ: {{masters}}\n\n制約:\n- 狙うキーワード（{{target_keyword}}）を意識した構成にする。\n- 具体的な単価・金額・重量・容積・割合・断定的な工期日数は絶対に含めない。\n- H2/H3の階層で構成する。\n- 出力は {"headings":[{"level":2,"text":"..."},...]} のJSONのみ。',
   array['theme','category','article_type','target_keyword','heading_count','masters'],
   true, '初期版', 'seed'),

  ('body', 1,
E'あなたは解体業界の専門メディアのライターです。以下の見出し構成に沿って本文をMarkdownで書いてください。\n\n見出し構成: {{structure}}\n記事型: {{article_type}}\n文体: {{writing_style}}\n専門用語のレベル: {{expertise_level}}\n文字数: {{min_char_count}}〜{{max_char_count}}字\n禁止表現: {{ng_expressions}}\n推奨表現: {{recommended_expressions}}\n参照マスタ: {{masters}}\nFAQ: {{faq_section}}\n\n最重要の制約（違反厳禁）:\n- 金額（円・万円）、重量・容積（t・kg・m³）、単価（円/t 等）、割合（%・割）、断定的な工期日数を一切書かない。\n- 数量は読者が自分の現場の値を入れる前提で、計算式・考え方・確認項目として示す。\n- 事実と異なる数値を創作しない。不確かな数値は書かない。\n- 禁止表現（{{ng_expressions}}）は使わない。\n- 本文に http/https のURLや外部リンクを書かない。法令・制度は名称と概要のみで示す（読者が公式サイトで確認できるよう案内する程度にとどめる）。',
   array['structure','article_type','writing_style','expertise_level','min_char_count','max_char_count','ng_expressions','recommended_expressions','faq_section','masters'],
   true, '初期版（URL非掲載）', 'seed'),

  ('seo', 1,
E'次の記事のSEOタイトルとメタディスクリプションを作成してください。\n\n記事タイトル: {{title}}\n狙うキーワード: {{target_keyword}}\n本文冒頭: {{body_excerpt}}\n\n制約:\n- SEOタイトルは全角32文字以内。狙うキーワード（{{target_keyword}}）を自然に含める。\n- メタディスクリプションは全角120文字以内。\n- 数値の断定表現は含めない。\n- 出力は {"seo_title":"...","meta_description":"..."} のJSONのみ。',
   array['title','target_keyword','body_excerpt'],
   true, '初期版', 'seed'),

  ('fix', 1,
E'以下の記事本文には品質チェックで不合格になった項目があります。指摘に沿って本文を修正してください。\n\n本文: {{body}}\n不合格項目: {{failed_items}}\n禁止表現: {{ng_expressions}}\n\n制約:\n- 指摘された箇所のみを最小限で修正し、それ以外の文意は保つ。\n- 金額・重量・単価・割合・断定的な工期日数を新たに追加しない。\n- 出力は修正後の本文（Markdown）のみ。',
   array['body','failed_items','ng_expressions'],
   true, '初期版', 'seed'),

  ('quality', 1,
E'次の記事本文を、以下の3観点のみで5段階評価してください。事実の正誤判定は行わないでください。\n\n本文: {{body}}\n\n観点:\n1. 文章として不自然な箇所がないか\n2. 論理の飛躍や矛盾がないか\n3. 実務者にとって具体性のある内容か\n\n出力は {"naturalness":n,"consistency":n,"specificity":n,"comment":"..."} のJSONのみ（nは1〜5）。',
   array['body'],
   true, '初期版', 'seed'),

  ('news_editorial', 1,
E'あなたは解体業界の専門メディア「解体ナレッジ」の編集者です。次のニュース見出しと、あれば短い要約だけを材料にして、転載ではない独自の解説をMarkdownで出力してください。\n\nニュース見出し: {{title}}\n出典: {{source_name}}\n配信元の短い要約（無い場合あり）: {{summary}}\n関連テーマの目安: {{topics}}\n\n必ず次の3つの見出し（##）だけをこの順番で使い、それ以外の大見出しは作らないでください。\n\n## わかりやすく解説\n- 難しい話をかみ砕いて説明する。おおよそ5行（150〜250字程度）。\n- 専門用語は避け、現場の人がすぐ分かる言い回しにする。\n\n## 実務で確認できそうなこと\n- 解体・産廃・建設の実務者がチェックできそうなことを書く。\n- 箇条書き（3〜5項目）でも、短い段落（合計5行程度）でもよい。1項目だけでもよい。\n\n## 実際の内容\n- 提供された見出しと要約だけを材料に、元のニュースが伝えている内容を普通の記事要約としてまとめる。\n- 材料にない固有の事実・数字・固有名詞の詳細は創作しない。要約が薄い場合は見出しから分かる範囲だけ書く。\n- おおよそ4〜8文。\n\n共通の制約（違反厳禁）:\n- 金額（円・万円）、重量・容積（t・kg・m³）、単価、割合（%・割）、断定的な工期日数は一切書かない。\n- 外部URLは書かない。\n- 「以下が解説です」などの前置きは不要。Markdown本文のみを出力する。',
   array['title','source_name','summary','topics'],
   true, '3部構成', 'seed')
on conflict (step, version) do nothing;
