-- =============================================================
-- 20260802000013_sns_trend_posts.sql
-- X上のバズ候補（Grok取得）→ 運営が採用／非採用 → 公開サイト右カラム
-- ※ 先に 20260802000012_sns_trends_enum.sql を適用すること
-- =============================================================

create type public.sns_trend_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.sns_trend_posts (
  id              uuid primary key default gen_random_uuid(),
  post_url        text not null,
  author_handle   text not null default '',
  author_name     text,
  text_snippet    text not null,
  like_count      integer not null default 0,
  posted_at       timestamptz,
  relevance_note  text,
  status          public.sns_trend_status not null default 'pending',
  fetched_at      timestamptz not null default now(),
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint sns_trend_posts_url_unique unique (post_url)
);

comment on table public.sns_trend_posts is
  'Grok x_search で取得したX投稿候補。運営が採用したものだけ公開表示する。';
comment on column public.sns_trend_posts.text_snippet is
  '表示用の短文スニペット（全文転載を避ける）';
comment on column public.sns_trend_posts.like_count is
  '取得時点のいいね数（目安。厳密保証はしない）';

create index if not exists idx_sns_trend_posts_status_likes
  on public.sns_trend_posts (status, like_count desc nulls last);

create index if not exists idx_sns_trend_posts_fetched_at
  on public.sns_trend_posts (fetched_at desc);

create trigger trg_sns_trend_posts_updated_at before update on public.sns_trend_posts
  for each row execute function public.set_updated_at();

alter table public.sns_trend_posts enable row level security;
revoke all on public.sns_trend_posts from anon;
grant all on public.sns_trend_posts to service_role;
grant select on public.sns_trend_posts to authenticated;

create policy sns_trend_posts_authenticated_select on public.sns_trend_posts
  for select to authenticated using (true);

-- 設定
insert into public.settings (key, value, value_type, description)
values
  ('sns_trends_model', 'grok-4-1-fast-reasoning', 'string', 'SNSトレンド取得に使うGrokモデル'),
  ('sns_trends_min_likes', '100', 'number', 'いいね数の目安（これ以上を優先）'),
  ('sns_trends_max_candidates', '15', 'number', '1回の更新で取得する候補件数の上限')
on conflict (key) do nothing;

-- プロンプト（コードにハードコードしない）
insert into public.prompts (step, version, content, variables, is_active, note, created_by)
values (
  'sns_trends',
  1,
  E'あなたは解体・建設・産廃業界向けメディアの編集アシスタントです。X（旧Twitter）を検索し、解体工事会社・産廃業者・建設現場の担当者が実務上気になりそうな「いまバズっている話題」を拾ってください。\n\n条件:\n- 直近の投稿を対象にする（おおよそ {{from_date}} 以降）\n- いいねがおおよそ {{min_likes}} 以上の投稿を優先する（厳密でなくてよいが、明らかに低調なものは除外）\n- 解体・建設リサイクル・産廃・アスベスト・建設業法・現場安全・許可・行政指導などに関連するもの\n- 個人攻撃・デマ・露骨な宣伝・アダルト・無関係な炎上は除外\n- 最大 {{max_count}} 件\n\n出力は次のJSON配列のみ（前置き・コードフェンス禁止）:\n[\n  {\n    "post_url": "https://x.com/.../status/...",\n    "author_handle": "username",\n    "author_name": "表示名（任意）",\n    "text_snippet": "投稿本文の要約または抜粋（200字以内）",\n    "like_count": 123,\n    "posted_at": "2026-08-01T12:00:00Z",\n    "relevance_note": "なぜ業界向けか一行"\n  }\n]\n\npost_url は実在する投稿のURLであること。件数が足りなくても捏造しない。該当が無ければ空配列 [] を返す。',
  array['from_date', 'min_likes', 'max_count'],
  true,
  '初期版',
  'migration'
)
on conflict (step, version) do nothing;
