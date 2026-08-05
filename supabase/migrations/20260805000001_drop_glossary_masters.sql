-- 用語集（glossary）は記事内容の偏り（人工・マニフェスト過多）の原因になるため廃止。
-- enum 値自体は残し、行だけ削除する（既存スキーマ互換）。
delete from public.masters
where master_type = 'glossary';
