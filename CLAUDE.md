# CLAUDE.md

このファイルはClaude Codeがプロジェクト作業時に必ず参照する規約です。

---

## プロジェクト概要

解体業界に特化した専門メディアと、AIによる記事の自動生成・自動公開システム。
運営主体はGENBABOXX。検索流入からBAKUSOQ（解体見積もりシステム）への問い合わせにつなげることが目的。

---

## 技術スタック

| 領域 | 採用技術 |
|---|---|
| フレームワーク | Next.js 15（App Router）/ TypeScript |
| スタイリング | Tailwind CSS |
| DB | Supabase（PostgreSQL + pgvector） |
| 認証（管理画面） | Supabase Auth |
| ホスティング | Cloudflare Pages |
| 定時実行 | GitHub Actions（cron） |
| AI | Anthropic API または OpenAI API |
| 画像生成 | satori + resvg（Node.js内で完結） |
| 通知 | Slack Incoming Webhook |

**microCMSは使用しない。** 記事・テーマ・ログはすべてSupabaseで管理する。

---

## ディレクトリ構成

```
/src
  /app
    /(site)              公開サイト
      page.tsx           トップ
      /articles          記事一覧・詳細
      /category          カテゴリー別
      /search            検索
      /company           運営会社
      /bakusoq           BAKUSOQ紹介
      /contact           問い合わせ
    /admin               管理画面（要認証）
      /articles          記事一覧・編集
      /themes            テーマ管理
      /settings          生成設定
      /prompts           プロンプト管理
      /masters           マスタ管理
      /cta               CTA管理
      /logs              生成履歴・エラーログ
    /api
      /generate          記事生成エンドポイント
      /admin             管理画面用API
  /lib
    /supabase            クライアント・型定義
    /ai                  AI API呼び出しラッパー
    /generation          生成パイプライン
    /quality             品質チェック3層
    /image               アイキャッチ生成
  /components
    /site
    /admin
    /ui
/scripts
  generate-article.ts    バッチ実行のエントリポイント
/supabase
  /migrations            SQLマイグレーション
```

---

## 絶対に守るルール

### 1. 記事内に具体的な数値を書かせない

本プロジェクトの根幹。単価・金額・重量・割合をAIに生成させると、事実と異なる数値が公開され、専門メディアとしての信頼を失う。

**禁止**：金額（円、万円）、重量・容積（t、kg、m³）、単価（円/t など）、割合（%、割）、工期の断定日数
**許容**：年月日、法令の条番号、規格名（4t車、0.25m³級バックホウ など）

生成プロンプトにこの制約を必ず含め、かつ生成後に正規表現で機械的に検出すること。プロンプトだけに頼らない。

### 2. プロンプトをコードにハードコードしない

すべての生成プロンプトは `prompts` テーブルから取得する。管理画面から編集できることが要件。
コード内に文字列でプロンプトを書いた時点で要件違反。

### 3. 生成ルール・文言をコードに固定しない

文字数、文体、対象読者、見出し数、CTA文言、免責文、禁止表現リストは、すべてDBから取得する。
`const MIN_LENGTH = 3000` のような定数定義をしない。

### 4. シークレットをコードに書かない

APIキー、service role key はすべて環境変数。`.env.local` はコミットしない。
service role key はサーバーサイドでのみ使用し、クライアントに露出させない。

### 5. 品質チェックの第1層・第2層はAIに判定させない

文字数、禁止表現、数値検出、リンク死活、類似度は決定論的に判定する。
AIに判定させるのは「文章の自然さ」「論理の一貫性」「具体性」の3点のみ。

### 6. 自動修正は最大2回まで

無限ループを防ぐ。3回目の不合格は下書き保存に倒し、必ずログを残す。

---

## コーディング規約

- TypeScriptの `any` を使わない。Supabaseの型は `supabase gen types` で生成したものを使う
- Server Componentsをデフォルトとし、必要な箇所のみ `"use client"`
- DBアクセスは `/lib/supabase` 経由に統一。コンポーネント内で直接クエリを書かない
- エラーは握りつぶさない。必ずログテーブルまたはconsoleに残す
- AI API呼び出しは必ずtry-catchで囲み、3回までリトライ（指数バックオフ）
- 日本語のUIテキストはコンポーネント内に直書きしてよい（i18n対応は不要）

---

## コマンド

```bash
npm run dev          # 開発サーバー
npm run build        # ビルド
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run generate     # 記事生成バッチを手動実行（開発用）
```

コードを変更したら `npm run typecheck` と `npm run lint` を実行して通ることを確認する。

---

## 環境変数

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
SLACK_WEBHOOK_URL=
NEXT_PUBLIC_SITE_URL=
```

---

## 作業時の注意

- 大きな機能は一度に実装せず、タスク単位で区切って動作確認する
- DBスキーマを変更するときは必ず `/supabase/migrations` にSQLを追加する
- 公開サイトのSEO要件（構造化データ、sitemap、meta）を後回しにしない
- 管理画面は認証必須。未認証でアクセスできる状態にしない
