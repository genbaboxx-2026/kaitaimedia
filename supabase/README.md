# Supabase マイグレーション

解体メディア自動記事生成システムのDBスキーマ。要件定義書 第8章／管理画面仕様書 に基づく。

## ⚠️ 適用先プロジェクトの注意

現在このリポジトリの `.env.local` は **`ketkidtugtoliaamqscb`**（解体メディア用）を指しています。
一方、接続中の Supabase MCP は **`hqpliepqzdnrwiswncuk`（BAKUSOQ本番DB）** を指しており、**別プロジェクト**です。

**このマイグレーションは必ず解体メディア用プロジェクト（`ketkidtugtoliaamqscb`）に対して適用してください。**
BAKUSOQ本番DBには絶対に流さないこと。MCP経由の `apply_migration` は接続先が本番のため使用していません。

## ファイル構成（適用順）

| 順 | ファイル | 内容 |
|---|---|---|
| 1 | `migrations/20260801000001_extensions.sql` | pgvector / pg_trgm、updated_at トリガ関数 |
| 2 | `migrations/20260801000002_types.sql` | 列挙型（enum）8種 |
| 3 | `migrations/20260801000003_tables.sql` | テーブル12種 + updated_at トリガ |
| 4 | `migrations/20260801000004_indexes.sql` | 索引（フィルタ / 全文検索 / HNSW） |
| 5 | `migrations/20260801000005_rls_policies.sql` | RLS・アクセス権 |
| 6 | `migrations/20260801000006_functions.sql` | 類似度判定RPC（第2層） |
| - | `seed.sql` | 初期データ（冪等） |

## アクセス制御方針

- **anon**：全テーブルでアクセス権なし（公開サイトの読み取りは service_role でサーバーサイド実行）
- **authenticated**（管理画面ログイン済み＝管理者）：
  - コンテンツ系（categories/ctas/themes/articles/article_versions/settings/prompts/masters）… フル権限
  - ログ系（generation_logs/quality_checks）… 閲覧のみ
  - audit_logs … 閲覧＋追記のみ
  - article_embeddings … アクセス不可（内部処理専用）
- **service_role**：RLSをバイパスし全操作可能（バッチ・公開サイトのサーバーサイド読み取り）

## 適用方法（Supabase CLI）

```bash
# CLI 未導入なら: brew install supabase/tap/supabase
supabase login
supabase link --project-ref ketkidtugtoliaamqscb   # ← 解体メディア用プロジェクト

# マイグレーション適用
supabase db push

# seed 投入（db push は seed を流さないため個別に実行）
#   ローカル開発では `supabase db reset` が seed.sql を自動適用する。
#   リモートへは SQL Editor で seed.sql を貼り付け実行、または psql で流す。
```

または Supabase ダッシュボードの SQL Editor で `migrations/*.sql` を順番に、最後に `seed.sql` を実行する。

## 型定義の生成

適用後、TypeScript 型を生成する（CLAUDE.md 規約）:

```bash
supabase gen types typescript --project-ref ketkidtugtoliaamqscb --schema public \
  > src/lib/supabase/database.types.ts
```

## ローカル検証

本マイグレーションは `pgvector/pgvector:pg16` コンテナ（anon/authenticated/service_role ロールと
extensions スキーマを用意した環境）で適用・検証済み。テーブル12・enum8・ポリシー12・
カテゴリー14・設定36・初期プロンプト5、類似度RPCの動作、seed の冪等性を確認している。
