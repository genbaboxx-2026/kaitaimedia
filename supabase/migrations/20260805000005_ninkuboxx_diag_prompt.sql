-- 前提: 20260805000004_ninkuboxx_diag_enum.sql を先に適用すること

update public.prompts
set is_active = false
where step = 'ninkuboxx_diag'
  and is_active = true;

insert into public.prompts (step, version, content, variables, is_active, note, created_by)
select
  'ninkuboxx_diag',
  coalesce((select max(version) from public.prompts where step = 'ninkuboxx_diag'), 0) + 1,
  E'あなたは解体会社向け人事制度「NiNKU BOXX」の組織診断アドバイザーです。\n以下の診断スコア（0〜100、高いほど課題が大きい）と回答要約を踏まえ、現状起きうることを日本語でフィードバックしてください。\n\n【診断スコア】\n{{scores}}\n\n【回答要約】\n{{answers_summary}}\n\n【総合コメント】\n{{overall_label}}\n\n要件:\n- 出力は本文のみ。前置きや見出し記号（#）は使わない。\n- ちょうど5文。各文は改行で区切る。\n- 占い口調にしない。実務的で落ち着いた文体。\n- 「〜の可能性があります」「〜になりやすい」など、断定しすぎない表現にする。\n- 金額・割合（%）・人数の具体数値は新たに作らない（スコア数値の再掲も避ける）。\n- NiNKU BOXXや等級・評価制度への自然なつなぎを最後の1文に含めてよい。\n- 無料相談を促す売り込みは控えめに（CTAは別途表示される）。',
  array['scores', 'answers_summary', 'overall_label'],
  false,
  'NiNKU BOXX組織診断フィードバック',
  'migration'
where not exists (
  select 1 from public.prompts
  where step = 'ninkuboxx_diag' and note = 'NiNKU BOXX組織診断フィードバック'
);

update public.prompts
set is_active = true
where step = 'ninkuboxx_diag'
  and note = 'NiNKU BOXX組織診断フィードバック';
