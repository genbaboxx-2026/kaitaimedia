# 解体業界特化メディア / 自動記事生成システム

解体業界に特化した専門メディアと、AIによる記事の自動生成・自動公開システム。運営主体は GENBABOXX。検索流入から BAKUSOQ（解体見積もりシステム）への問い合わせにつなげることが目的。

規約は [`CLAUDE.md`](./CLAUDE.md)、要件は [`media/`](./media) を参照。

## 技術スタック

Next.js 15（App Router / TypeScript）・Tailwind CSS v4・Supabase（PostgreSQL + pgvector）・Supabase Auth（管理画面）・Vercel・GitHub Actions（cron）・Anthropic API（本文生成）・OpenAI Embeddings（重複判定）・satori + resvg（アイキャッチ）・Slack Webhook（通知）。

## セットアップ

```bash
npm install
cp .env.local.example .env.local   # 値を設定
npm run dev
```

### 環境変数（`.env.local`）

| 変数 | 用途 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 公開（publishable）キー |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret キー（`sb_secret_…`）**。サーバー読み書き・バッチ用。クライアントに露出させない |
| `ANTHROPIC_API_KEY` | 記事生成（Anthropic） |
| `OPENAI_API_KEY` | 埋め込み（第2層 類似度判定）。未設定なら第2層は自動スキップ |
| `SLACK_WEBHOOK_URL` | 実行結果・警告の通知（任意） |
| `NEXT_PUBLIC_SITE_URL` | 公開URL（OGP / sitemap / robots / 構造化データ） |
| `EYECATCH_FONT_PATH` | アイキャッチ用フォントのパス（既定 `assets/fonts/NotoSansJP-Bold.otf`） |

### DB（Supabase）

マイグレーションは [`supabase/migrations`](./supabase/migrations)。適用手順・注意は [`supabase/README.md`](./supabase/README.md)。適用後に型生成：

```bash
supabase gen types typescript --project-ref <ref> --schema public > src/lib/supabase/database.types.ts
```

初期データ（カテゴリー14件・生成設定・初期プロンプト・マスタ）は `supabase/seed.sql`。

### 管理ユーザー作成 / ログイン

```bash
npm run create-admin -- admin@example.com 'パスワード'   # service(secret)キーが必要
```

`/admin/login` からログイン。開発中はダッシュボードで Email の「Confirm email」をオフにすると、確認メール無しでログインできます。

## コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` / `build` / `start` | 開発 / ビルド / 本番起動 |
| `npm run lint` / `typecheck` | ESLint / 型チェック |
| `npm run generate` | 記事生成バッチを手動実行（要 `ANTHROPIC_API_KEY` ＋ 正しい service キー） |
| `npm run test:ai` | AIラッパーの疎通確認 |
| `npm run create-admin -- <email> <password>` | 管理ユーザー作成 |

## 自動生成

- ロジック：`src/lib/generation/pipeline.ts`（要件5.1）。テーマ選定 → 構成 → 本文 → SEO → 品質チェック3層 → 自動修正（最大2回）→ 公開/下書き保存 → 履歴記録 → 通知。
- 品質チェック：`src/lib/quality`（第1層=機械判定 / 第2層=pgvector類似度 / 第3層=AI定性評価）。
- 定時実行：`.github/workflows/generate.yml`（毎日 18:00 UTC = 03:00 JST、手動トリガー可）。上記環境変数を **GitHub Secrets** に登録すること。

## デプロイ（Vercel + GitHub）

1. このリポジトリを GitHub に push する。
2. [Vercel](https://vercel.com) で **Add New Project** → GitHub リポジトリを Import。
3. Framework Preset は **Next.js** のまま。Build Command `npm run build` / Output は自動検出でよい。
4. **Environment Variables** に以下を Production（必要なら Preview も）へ登録する。

| 変数 | 必須 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ○ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ○ |
| `SUPABASE_SERVICE_ROLE_KEY` | ○（サーバー専用） |
| `NEXT_PUBLIC_SITE_URL` | ○（デプロイ後の本番URL。例 `https://xxx.vercel.app`） |
| `ANTHROPIC_API_KEY` | 管理画面からの生成・提案を使う場合 |
| `OPENAI_API_KEY` | 類似度判定を使う場合（任意） |
| `SLACK_WEBHOOK_URL` | 通知（任意） |

5. Deploy。完了後、発行された URL を `NEXT_PUBLIC_SITE_URL` に反映して再デプロイする。
6. **Supabase Auth** の Redirect URLs / Site URL に本番ドメイン（例 `https://xxx.vercel.app/**`）を追加する。未設定だと管理画面ログインが失敗する。
7. **独自ドメイン**（任意）：Vercel → Project → Settings → Domains で追加し、指示どおり DNS を設定。`NEXT_PUBLIC_SITE_URL` も更新。

> 記事生成バッチ（satori/resvg・Anthropic SDK）は Vercel 上ではなく **GitHub Actions（Node）** で実行します。Vercel は公開サイト＋管理画面の配信を担います。Actions 用の Secrets も上記と同じキーを GitHub に登録してください。

## ディレクトリ

`src/app/(site)` 公開サイト / `src/app/admin` 管理画面 / `src/lib/ai` AIラッパー / `src/lib/quality` 品質チェック / `src/lib/generation` 生成パイプライン / `src/lib/image` アイキャッチ / `src/lib/supabase` DB接続 / `scripts` バッチ。
