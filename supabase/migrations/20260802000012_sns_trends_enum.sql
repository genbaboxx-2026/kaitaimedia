-- sns_trends を prompt_step に追加（テーブル／prompts INSERT より先に単独実行推奨）

alter type public.prompt_step add value if not exists 'sns_trends';
