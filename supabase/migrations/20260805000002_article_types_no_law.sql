-- 記事型A/B/Cの方針変更 + 法令解説禁止
-- A: 現場・見積もり手順（計算テンプレは稀）
-- B: 経営・組織・人材（旧・計算テンプレから変更）
-- C: 業界動向・視点（旧・法改正一次情報から変更）

update public.masters
set
  value = '現場・見積もりの手順型。見積もり・原価・工程・現場運営などの判断順序と確認項目を手順で示す。計算式を全面に出す構成は稀（月1本程度）とし、通常は数値を埋めず確認の観点で書く。法令・条文・許認可手続きの解説はしない。',
  description = '型Aの構成雛形',
  updated_at = now()
where master_type = 'article_template' and label = 'A';

update public.masters
set
  value = '経営・組織・人材型。経営、採用、等級制度、評価制度、広報・採用ブランディング、育成・定着など会社づくりを扱う。計算テンプレートにはしない。法令・条文・許認可手続きの解説はしない。',
  description = '型Bの構成雛形',
  updated_at = now()
where master_type = 'article_template' and label = 'B';

update public.masters
set
  value = '業界動向・視点型。業界の動き、他業種比較、スタートアップ視点など広い視野のテーマを扱う（全体の約1割）。法令・条文・許認可手続きの解説はしない。制度名に触れる場合も概要のみ。',
  description = '型Cの構成雛形',
  updated_at = now()
where master_type = 'article_template' and label = 'C';

-- 本文プロンプト: 法令は概要のみ → 法令解説禁止
update public.prompts
set content = replace(
  content,
  '法令・制度は名称と概要のみで示す（読者が公式サイトで確認できるよう案内する程度にとどめる）。',
  '法令・法律・条文・許認可手続きの解説は一切書かない。制度名に触れる場合も「必要なら公式情報を確認」程度にとどめ、法律解説にしない。'
)
where step = 'body'
  and is_active = true
  and content like '%法令・制度は名称と概要のみで示す%';

-- 構成プロンプトにも禁止を追記（未追記のものだけ）
update public.prompts
set content = content || E'\n\n追加制約：法令・法律・条文・許認可手続きの解説を見出しに含めない。'
where step = 'structure'
  and is_active = true
  and content not like '%法令・法律・条文・許認可手続きの解説を見出しに含めない%';
