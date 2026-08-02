"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/dummy-data";
import {
  STATUS_LABEL,
  type AdminArticle,
  type AdminStatus,
} from "@/lib/admin-data";
import { detectNumbers } from "@/lib/number-detection";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { updateArticleAction } from "@/app/admin/(app)/articles/actions";

// SEO 上限（本番は settings テーブルから取得する）
const SEO_TITLE_MAX = 32;
const META_DESC_MAX = 120;

interface CheckResult {
  ok: boolean;
  label: string;
  detail: string;
}

export function ArticleEditor({ article }: { article: AdminArticle }) {
  const [title, setTitle] = useState(article.title);
  const [slug, setSlug] = useState(article.slug);
  const [categorySlug, setCategorySlug] = useState(article.categorySlug);
  const [tags, setTags] = useState(article.tags.join(", "));
  const [body, setBody] = useState(article.body);
  const [seoTitle, setSeoTitle] = useState(article.seoTitle);
  const [metaDescription, setMetaDescription] = useState(article.metaDescription);
  const [status, setStatus] = useState<AdminStatus>(article.status);
  const [publishAt, setPublishAt] = useState(
    `${article.publishedAt ?? article.createdAt}T09:00`,
  );
  const [showDiff, setShowDiff] = useState(false);
  const [checks, setChecks] = useState<CheckResult[] | null>(null);
  const [saved, setSaved] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const previewHtml = useMemo(() => renderMarkdownToHtml(body), [body]);

  const diff = useMemo(() => {
    const orig = new Set(article.firstDraftBody.split("\n").map((l) => l.trim()));
    const cur = body.split("\n").map((l) => l.trim());
    const added = cur.filter((l) => l && !orig.has(l));
    const curSet = new Set(cur);
    const removed = article.firstDraftBody
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !curSet.has(l));
    return { added, removed };
  }, [body, article.firstDraftBody]);

  // 選択テキストを before/after で囲む（未選択なら placeholder を入れて選択状態にする）
  function surround(before: string, after: string, placeholder: string) {
    const ta = bodyRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = body.slice(s, e) || placeholder;
    const next = body.slice(0, s) + before + sel + after + body.slice(e);
    setBody(next);
    const caretStart = s + before.length;
    const caretEnd = caretStart + sel.length;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(caretStart, caretEnd);
    });
  }

  // 選択している行（複数可）の先頭に prefix を付ける／既に付いていれば外す（トグル）
  function prefixLines(prefix: string) {
    const ta = bodyRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const lineStart = body.lastIndexOf("\n", s - 1) + 1;
    const nl = body.indexOf("\n", e);
    const lineEnd = nl === -1 ? body.length : nl;
    const block = body.slice(lineStart, lineEnd) || "";
    const lines = block.split("\n");
    const allHave = lines.every((l) => l.startsWith(prefix));
    const newBlock = lines
      .map((l) => (allHave ? l.slice(prefix.length) : prefix + l))
      .join("\n");
    const next = body.slice(0, lineStart) + newBlock + body.slice(lineEnd);
    setBody(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(lineStart, lineStart + newBlock.length);
    });
  }

  function runChecks(): CheckResult[] {
    const results: CheckResult[] = [];
    const hits = detectNumbers(body);
    results.push({
      ok: hits.length === 0,
      label: "数値表現の混入",
      detail:
        hits.length === 0
          ? "検出なし"
          : `検出：${hits.map((h) => `${h.matched}（${h.type}）`).join(" / ")}`,
    });
    results.push({
      ok: seoTitle.length <= SEO_TITLE_MAX,
      label: "SEOタイトル長",
      detail: `${seoTitle.length} / ${SEO_TITLE_MAX} 文字`,
    });
    results.push({
      ok: metaDescription.length <= META_DESC_MAX,
      label: "メタディスクリプション長",
      detail: `${metaDescription.length} / ${META_DESC_MAX} 文字`,
    });
    results.push({
      ok: /^##\s/m.test(body),
      label: "見出し構成（H2の有無）",
      detail: /^##\s/m.test(body) ? "H2あり" : "H2が見つかりません",
    });
    return results;
  }

  const [isSaving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleSave() {
    setChecks(runChecks());
    setSaveError(null);
    startSaving(async () => {
      const res = await updateArticleAction(article.id, {
        title,
        slug,
        categorySlug,
        body,
        excerpt: body.replace(/[#*>\-\n]/g, " ").trim().slice(0, 120),
        seoTitle,
        metaDescription,
        status,
        publishAt,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      if (res.ok) {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2500);
      } else {
        setSaveError(res.error ?? "保存に失敗しました");
      }
    });
  }

  const bodyChars = body.replace(/\s/g, "").length;

  const field =
    "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600";
  const toolBtn =
    "rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100";

  return (
    <div className="mx-auto max-w-6xl">
      {/* ヘッダー */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/articles"
            className="text-sm text-navy-700 hover:underline"
          >
            ← 記事一覧へ
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900">記事編集</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-end justify-end gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
            <label className="text-xs font-semibold text-slate-600">
              ステータス
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AdminStatus)}
                className="mt-1 block rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800 focus:border-navy-600 focus:outline-none"
              >
                {(Object.keys(STATUS_LABEL) as AdminStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">
              公開日時
              <input
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                className="mt-1 block rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800 focus:border-navy-600 focus:outline-none"
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-sm font-semibold text-emerald-700">
                保存しました
              </span>
            )}
            {saveError && (
              <span className="text-sm font-semibold text-red-600">
                保存失敗：{saveError}
              </span>
            )}
            <Link
              href={`/articles/${slug}`}
              target="_blank"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              公開ページを確認
            </Link>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-md bg-navy-700 px-4 py-2 text-sm font-bold text-white hover:bg-navy-600 disabled:opacity-60"
            >
              {isSaving ? "保存中…" : "保存して再チェック"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* 左：編集 */}
        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700">タイトル</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">カテゴリー</label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className={field}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">スラッグ（URL）</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className={field} />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">タグ（カンマ区切り）</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={field} />
          </div>

          {/* 本文 */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">本文</label>
              <span className="text-xs text-slate-400">{bodyChars.toLocaleString()} 文字</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1 rounded-t-md border border-b-0 border-slate-300 bg-slate-50 p-1.5">
              <button type="button" className={toolBtn} title="見出し（大）" onClick={() => prefixLines("## ")}>
                <span className="font-bold">H2</span>
              </button>
              <button type="button" className={toolBtn} title="見出し（小）" onClick={() => prefixLines("### ")}>
                <span className="font-bold">H3</span>
              </button>
              <span className="mx-0.5 w-px self-stretch bg-slate-300" />
              <button type="button" className={`${toolBtn} font-bold`} title="太字" onClick={() => surround("**", "**", "太字")}>B</button>
              <button type="button" className={`${toolBtn} italic`} title="斜体" onClick={() => surround("*", "*", "斜体")}>I</button>
              <span className="mx-0.5 w-px self-stretch bg-slate-300" />
              <button type="button" className={toolBtn} title="箇条書き" onClick={() => prefixLines("- ")}>• リスト</button>
              <button type="button" className={toolBtn} title="番号リスト" onClick={() => prefixLines("1. ")}>1. 番号</button>
              <button type="button" className={toolBtn} title="引用" onClick={() => prefixLines("> ")}>❝ 引用</button>
              <button type="button" className={toolBtn} title="リンク" onClick={() => surround("[", "](https://)", "リンクテキスト")}>🔗 リンク</button>
            </div>
            <textarea
              ref={bodyRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={20}
              className="w-full rounded-b-md border border-slate-300 px-3 py-2 font-mono text-[13px] leading-relaxed text-slate-800 focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600"
            />
            <p className="mt-1 text-xs text-slate-400">
              文字を選んでボタンを押すと書式が付きます。右側「プレビュー」に実際の見た目が出ます。
            </p>
          </div>

          {/* 差分 */}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <button
              onClick={() => setShowDiff((v) => !v)}
              className="text-sm font-semibold text-navy-700 hover:underline"
            >
              {showDiff ? "初稿との差分を隠す" : "初稿との差分を表示"}
            </button>
            {showDiff && (
              <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-emerald-700">
                    追記された行（{diff.added.length}）
                  </p>
                  <ul className="mt-1 space-y-1 text-slate-600">
                    {diff.added.slice(0, 8).map((l, i) => (
                      <li key={i} className="truncate">＋ {l}</li>
                    ))}
                    {diff.added.length === 0 && <li className="text-slate-400">なし</li>}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-red-700">
                    削除された行（{diff.removed.length}）
                  </p>
                  <ul className="mt-1 space-y-1 text-slate-600">
                    {diff.removed.slice(0, 8).map((l, i) => (
                      <li key={i} className="truncate">－ {l}</li>
                    ))}
                    {diff.removed.length === 0 && <li className="text-slate-400">なし</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="space-y-4 rounded-md border border-slate-200 p-4">
            <p className="text-sm font-bold text-slate-800">SEO設定</p>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">SEOタイトル</label>
                <span
                  className={`text-xs ${seoTitle.length > SEO_TITLE_MAX ? "font-bold text-red-600" : "text-slate-400"}`}
                >
                  {seoTitle.length} / {SEO_TITLE_MAX}
                </span>
              </div>
              <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={field} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">メタディスクリプション</label>
                <span
                  className={`text-xs ${metaDescription.length > META_DESC_MAX ? "font-bold text-red-600" : "text-slate-400"}`}
                >
                  {metaDescription.length} / {META_DESC_MAX}
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                className={field}
              />
            </div>
          </div>
        </div>

        {/* 右：プレビュー＋チェック結果（スクロール追従で固定） */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1">
          <div className="rounded-md border border-slate-200 bg-white p-5">
            <p className="mb-3 text-xs font-semibold text-slate-400">プレビュー</p>
            <h2 className="font-serif text-2xl font-bold leading-relaxed text-slate-900">
              {title}
            </h2>
            <div
              className="article-body mt-4"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>

          {checks && (
            <div className="rounded-md border border-slate-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-800">
                品質チェック結果（保存時）
              </p>
              <ul className="mt-3 space-y-2">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${c.ok ? "bg-emerald-500" : "bg-red-500"}`}
                    >
                      {c.ok ? "✓" : "!"}
                    </span>
                    <span>
                      <span className="font-semibold text-slate-800">{c.label}</span>
                      <span className="ml-2 text-slate-500">{c.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-400">
                ※ 類似度（第2層）とAI判定（第3層）はタスク9で接続します。閾値・除外リストは settings/masters から取得予定です。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
