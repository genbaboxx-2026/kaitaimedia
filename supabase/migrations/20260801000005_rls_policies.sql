-- =============================================================
-- 20260801000005_rls_policies.sql
-- RLS とアクセス権
--
-- 方針:
--   * anon           : 一切アクセス権を与えない（公開サイトの読み取りは service_role で行う）
--   * authenticated  : 管理画面ログイン済みユーザー = 管理者。コンテンツ系はフル権限。
--                      ログ系は閲覧のみ。埋め込みベクトルはアクセス不可。
--   * service_role   : サーバーサイド専用。RLS をバイパスし全操作可能。
--
-- 注意: RLS を有効にしつつポリシーを与えない role は「全拒否」になる。
--       service_role は BYPASSRLS のためポリシー不要。
-- =============================================================

-- -------------------------------------------------------------
-- コンテンツ系（管理者はフル権限）
--   categories / ctas / themes / articles / article_versions / settings / prompts / masters
-- -------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'ctas', 'themes', 'articles',
    'article_versions', 'settings', 'prompts', 'masters'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('revoke all on public.%I from anon;', t);
    execute format('grant all on public.%I to service_role;', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated;', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true);',
      t || '_authenticated_all', t
    );
  end loop;
end $$;

-- -------------------------------------------------------------
-- ログ系（管理者は閲覧のみ。書き込みは service_role のみ）
--   generation_logs / quality_checks
-- -------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['generation_logs', 'quality_checks']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('revoke all on public.%I from anon;', t);
    execute format('grant all on public.%I to service_role;', t);
    execute format('grant select on public.%I to authenticated;', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (true);',
      t || '_authenticated_select', t
    );
  end loop;
end $$;

-- -------------------------------------------------------------
-- audit_logs（管理者は閲覧＋追記のみ。更新・削除は不可）
-- -------------------------------------------------------------
alter table public.audit_logs enable row level security;
revoke all on public.audit_logs from anon;
grant all on public.audit_logs to service_role;
grant select, insert on public.audit_logs to authenticated;

create policy audit_logs_authenticated_select on public.audit_logs
  for select to authenticated using (true);
create policy audit_logs_authenticated_insert on public.audit_logs
  for insert to authenticated with check (true);

-- -------------------------------------------------------------
-- article_embeddings（内部処理専用。service_role のみ）
-- authenticated / anon にはポリシーを与えず全拒否。
-- -------------------------------------------------------------
alter table public.article_embeddings enable row level security;
revoke all on public.article_embeddings from anon;
revoke all on public.article_embeddings from authenticated;
grant all on public.article_embeddings to service_role;
