import { callJson, callText } from "@/lib/ai/client";
import { getActivePrompt, interpolate } from "@/lib/ai/prompts";
import { loadSettings, getBool, getModel, getNumber, getString } from "@/lib/ai/settings";
import { embed, toVectorLiteral } from "@/lib/ai/embeddings";
import { loadMasterLabels, loadMasterPairs } from "@/lib/quality/masters";
import { persistQualityChecks, runQualityChecks } from "@/lib/quality";
import type { CheckResult } from "@/lib/quality/types";
import { restInsert, restRpc, restSelect, restUpdate } from "@/lib/supabase/rest";
import {
  generateEyecatchPng,
  generateAiEyecatchPng,
  pickImageStyle,
  uploadEyecatch,
} from "@/lib/image/eyecatch";
import { notifySlack } from "@/lib/notify/slack";
import type { ArticleType } from "@/lib/types";

interface ThemeRow {
  /** テーマ在庫は廃止。その場生成なので id は持たない（null） */
  id: string | null;
  title: string;
  category_id: string | null;
  target_keyword: string | null;
  article_type: ArticleType;
  category: { name: string; slug: string } | null;
}

interface StructureData {
  headings: { level: number; text: string }[];
}

interface SeoData {
  seo_title: string;
  meta_description: string;
}

export interface PipelineResult {
  status: "skipped" | "published" | "draft" | "failed";
  message: string;
  articleId?: string;
  slug?: string;
}

function slugify(categorySlug: string): string {
  return `${categorySlug}-${Date.now().toString(36)}`;
}

function excerptFrom(body: string): string {
  const firstPara =
    body
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("#") && !l.startsWith("-")) ?? "";
  return firstPara.slice(0, 120);
}

// 手動で追加された未生成テーマがあれば、それを優先して1件取り出す（無ければ null）。
async function selectQueuedTheme(): Promise<ThemeRow | null> {
  const rows = await restSelect<{
    id: string;
    title: string;
    category_id: string | null;
    target_keyword: string | null;
    article_type: ArticleType;
    category: { name: string; slug: string } | null;
  }>(
    "themes?select=id,title,category_id,target_keyword,article_type,category:categories(name,slug)&status=eq.pending&order=sort_order.asc,created_at.asc&limit=1",
    0,
  );
  const t = rows?.[0];
  if (!t) return null;
  return {
    id: t.id,
    title: t.title,
    category_id: t.category_id,
    target_keyword: t.target_keyword,
    article_type: t.article_type ?? "A",
    category: t.category,
  };
}

// トピックをその場生成：AIに数件提案させ、既存記事と重複しない最初の1件を採用する。
async function generateTopic(
  instruction: string,
  titleSim: number,
): Promise<ThemeRow | null> {
  const { suggestThemes } = await import("@/lib/generation/theme-suggest");
  const cats = await restSelect<{ id: string; slug: string; name: string }>(
    "categories?select=id,slug,name",
    0,
  );
  const bySlug = new Map((cats ?? []).map((c) => [c.slug, c]));

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { themes } = await suggestThemes(5, instruction);
    for (const s of themes) {
      if (!s?.title) continue;
      if (await isDuplicateTheme(s.title, titleSim)) continue; // 既存と類似なら次の候補へ
      const cat = bySlug.get(s.categorySlug) ?? cats?.[0];
      return {
        id: null,
        title: s.title,
        category_id: cat?.id ?? null,
        target_keyword: s.targetKeyword ?? "",
        article_type: (["A", "B", "C"].includes(s.articleType)
          ? s.articleType
          : "A") as ArticleType,
        category: cat ? { name: cat.name, slug: cat.slug } : null,
      };
    }
  }
  return null;
}

// テーマ重複チェック（タイトル類似度）。重複ならテーマを除外して true を返す。
async function isDuplicateTheme(title: string, threshold: number): Promise<boolean> {
  const vec = await embed(title);
  if (!vec) return false; // 埋め込み未設定ならスキップ
  const rows = await restRpc<{ article_id: string; similarity: number }[]>(
    "match_articles_by_title",
    {
      query_embedding: toVectorLiteral(vec),
      match_threshold: threshold,
      exclude_article_id: null,
    },
  );
  return Boolean(rows && rows.length > 0);
}

export async function runGenerationPipeline(opts?: {
  /** true なら generation_enabled=false でも実行（管理画面の手動生成用） */
  force?: boolean;
}): Promise<PipelineResult> {
  const settings = await loadSettings();

  // 1. 自動生成の有効/無効（手動 force 時はスキップしない）
  if (!opts?.force && !getBool(settings, "generation_enabled", true)) {
    return { status: "skipped", message: "自動生成が無効です（generation_enabled=false）" };
  }

  const model = getModel(settings);
  const autoPublish = getBool(settings, "auto_publish_enabled", false);
  const maxRevisions = getNumber(settings, "max_auto_revisions", 2);
  const titleSim = getNumber(settings, "title_similarity_threshold", 0.9);

  // プレミアム生成モード（拡張思考＋Web検索＋長文＋本文中画像）
  const premium = getBool(settings, "premium_enabled", false);
  const webSearchMaxUses = premium
    ? getNumber(settings, "premium_web_search_max", 5)
    : 0;
  const inBodyImageCount = premium
    ? getNumber(settings, "premium_inbody_image_count", 2)
    : 0;
  const imageQuality = getString(settings, "premium_image_quality", "medium") as
    | "low"
    | "medium"
    | "high";
  // 品質チェック不合格でも下書きとして保存する（生成コストを無駄にしない）。既定ON。
  const keepFailed = getBool(settings, "keep_failed_as_draft", true);
  const bodyMaxTokens = premium ? 32000 : 12000;
  // 文字数は管理画面と同じ設定を使う（プレミアムも共通化）
  const bodyMinChars = getNumber(settings, "min_char_count", 3500);
  const bodyMaxChars = getNumber(settings, "max_char_count", 5000);

  // 1記事あたりのコスト上限（USD）。0 は無効。超過でその記事を中断。
  const perArticleCostLimit = getNumber(settings, "per_article_cost_limit_usd", 3);

  // 月間コスト上限チェック（超過で自動停止）。0 は無効。
  // 注: estimated_cost は USD 概算。上限の単位運用は着手時に確定する（要件13）。
  const budgetLimit = getNumber(settings, "monthly_ai_budget_limit", 0);
  if (budgetLimit > 0) {
    const now = new Date();
    const firstOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    ).toISOString();
    const logs = await restSelect<{ estimated_cost: number | null }>(
      `generation_logs?select=estimated_cost&started_at=gte.${firstOfMonth}`,
      0,
    );
    const spent = (logs ?? []).reduce((s, l) => s + (l.estimated_cost ?? 0), 0);
    if (spent >= budgetLimit) {
      await notifySlack("記事生成：月間コスト上限に達したため自動停止しました。");
      return { status: "skipped", message: "月間コスト上限に達したため停止しました" };
    }
  }

  // 2. トピック決定：手動追加テーマがあれば優先。無ければAIがその場で考案（重複回避）。
  const instruction = getString(settings, "generation_instruction", "");
  const theme =
    (await selectQueuedTheme()) ?? (await generateTopic(instruction, titleSim));
  if (!theme) {
    await notifySlack(
      "記事生成：重複しないトピックを生成できませんでした（既存記事が多い可能性）。",
    );
    return { status: "skipped", message: "重複しない新しいトピックを生成できませんでした" };
  }

  const categoryName = theme.category?.name ?? "";
  const categorySlug = theme.category?.slug ?? "news";

  // トークン/コスト集計
  let inputTokens = 0;
  let outputTokens = 0;
  let cost = 0;
  const assertCostUnderLimit = () => {
    if (perArticleCostLimit > 0 && cost > perArticleCostLimit) {
      throw new Error(
        `1記事あたりのコスト上限（$${perArticleCostLimit}）を超えたため中断しました（概算 $${cost.toFixed(4)}）`,
      );
    }
  };
  const track = (r: { inputTokens: number; outputTokens: number; costUsd: number }) => {
    inputTokens += r.inputTokens;
    outputTokens += r.outputTokens;
    cost += r.costUsd;
    assertCostUnderLimit();
  };

  const [ngList, recommendedList, glossary, templates] = await Promise.all([
    loadMasterLabels("ng_expression"),
    loadMasterLabels("recommended_expression"),
    loadMasterPairs("glossary"),
    loadMasterPairs("article_template"),
  ]);
  const ngStr = ngList.join("、");

  // 参照マスタ（用語集＋この記事型の構成方針）をまとめてプロンプトに渡す
  const templateBlock =
    templates.find((t) => t.label === theme.article_type)?.value ?? "";
  const glossaryBlock = glossary.map((g) => `・${g.label}＝${g.value}`).join("\n");
  const mastersStr = [
    templateBlock ? `【記事型${theme.article_type}の構成方針】\n${templateBlock}` : "",
    glossaryBlock ? `【用語の統一表記】\n${glossaryBlock}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // 専門用語のレベル（設定値→AIへの指示文に変換）
  const EXPERTISE_LABEL: Record<string, string> = {
    beginner: "初級（専門用語はできるだけ噛み砕いて説明する）",
    intermediate: "中級（一般的な専門用語は説明を省いて使ってよい）",
    advanced: "上級（専門用語・条文名は前提知識として使ってよい）",
  };
  const expertiseLevel =
    EXPERTISE_LABEL[getString(settings, "expertise_level", "intermediate")] ??
    EXPERTISE_LABEL.intermediate;

  // generation_log を先に作成（進行中）
  const logRows = await restInsert<{ id: string }>("generation_logs", {
    theme_id: theme.id,
    ai_model: model,
    status: "draft",
  });
  const logId = logRows[0].id;

  try {
    const promptVars: Record<string, string> = {
      theme: theme.title,
      category: categoryName,
      article_type: theme.article_type,
      target_keyword: theme.target_keyword ?? "",
      heading_count: String(getNumber(settings, "heading_count", 5)),
      writing_style: getString(settings, "writing_style", "desu_masu"),
      expertise_level: expertiseLevel,
      min_char_count: String(bodyMinChars),
      max_char_count: String(bodyMaxChars),
      ng_expressions: ngStr,
      recommended_expressions: recommendedList.join("、"),
      faq_section: getBool(settings, "faq_enabled", true)
        ? "記事末尾に「よくある質問」セクションを設ける（3問程度、Q&A形式、数値は書かない）。"
        : "FAQセクションは設けない。",
      masters: mastersStr,
    };

    // 4. 構成生成（プレミアムは拡張思考で構成を練る。JSON安定のため検索は使わない）
    const structurePrompt = interpolate(await getActivePrompt("structure"), promptVars);
    const structureRes = await callJson<StructureData>({
      prompt: structurePrompt,
      model,
      thinking: premium,
    });
    track(structureRes);
    const promptStructure = structurePrompt;

    // 5. 本文生成（プレミアムは拡張思考＋Web検索＋長文）
    const bodyPrompt = interpolate(await getActivePrompt("body"), {
      ...promptVars,
      structure: JSON.stringify(structureRes.data),
    });
    const bodyRes = await callText({
      prompt: bodyPrompt,
      model,
      maxTokens: bodyMaxTokens,
      thinking: premium,
      webSearchMaxUses,
    });
    track(bodyRes);
    let body = bodyRes.text;
    const firstDraft = body;

    // 6. SEO生成
    const seoPrompt = interpolate(await getActivePrompt("seo"), {
      ...promptVars,
      title: theme.title,
      body_excerpt: body.slice(0, 300),
    });
    const seoRes = await callJson<SeoData>({ prompt: seoPrompt, model, maxTokens: 800 });
    track(seoRes);
    const seoTitle = seoRes.data.seo_title ?? theme.title;
    const metaDescription = seoRes.data.meta_description ?? excerptFrom(body);

    // アイキャッチ生成：AI画像（gpt-image-1）を優先し、そのトークン/コストも同じ記事に合算。
    // AIが使えない（キー未設定・課金停止など）ときは satori のSVGにフォールバック。
    const slug = slugify(categorySlug);
    // 記事ごとに絵柄をランダムに選ぶ（サムネと本文中図版で統一）
    const artStyle = pickImageStyle();
    let png: Buffer | null = null;
    const aiImage = await generateAiEyecatchPng(theme.title, categoryName, {
      quality: imageQuality,
      style: artStyle,
      variantHint:
        "記事全体を象徴するヒーロー表紙構図。主役モチーフを大きく中央に配置し、他の図版と重複しない独自の絵にする",
    });
    if (aiImage) {
      png = aiImage.png;
      inputTokens += aiImage.inputTokens;
      outputTokens += aiImage.outputTokens;
      cost += aiImage.costUsd;
      assertCostUnderLimit();
    } else {
      png = await generateEyecatchPng(theme.title, categorySlug, categoryName);
    }
    const eyecatchUrl = png ? await uploadEyecatch(png, slug) : null;

    // 既定CTA（hasCta 判定用）
    const ctaRows = await restSelect<{ id: string }>(
      "ctas?select=id&is_active=is.true&order=sort_order.asc&limit=1",
      0,
    );
    const ctaId = ctaRows && ctaRows.length > 0 ? ctaRows[0].id : null;

    // 7〜9. 品質チェック → 修正ループ（最大 maxRevisions 回）
    let revision = 0;
    let report = await runQualityChecks(
      {
        title: theme.title,
        body,
        seoTitle,
        metaDescription,
        articleType: theme.article_type,
        hasCta: ctaId !== null,
        hasImage: eyecatchUrl !== null,
        sourceUrls: [],
      },
      settings,
    );
    let lastResults: CheckResult[] = report.results;
    let promptFix = "";

    while (!report.passed && revision < maxRevisions) {
      // 次の修正呼び出しで上限を確実に超える見込みでも、呼び出し前に打ち切る
      if (perArticleCostLimit > 0 && cost >= perArticleCostLimit) {
        throw new Error(
          `1記事あたりのコスト上限（$${perArticleCostLimit}）に達したため修正を中断しました（概算 $${cost.toFixed(4)}）`,
        );
      }
      revision += 1;
      promptFix = interpolate(await getActivePrompt("fix"), {
        body,
        failed_items: report.failedItems.join("、"),
        ng_expressions: ngStr,
      });
      // 文字数の過不足は fix プロンプト（既定は“最小限修正”）だけでは直らないため明示指示を足す
      const curChars = body.replace(/\s/g, "").length;
      const needsMore =
        report.failedItems.some((f) => f.includes("文字数")) && curChars < bodyMinChars;
      const needsTrim =
        report.failedItems.some((f) => f.includes("文字数")) && curChars > bodyMaxChars;
      if (needsMore) {
        promptFix +=
          `\n\n【重要】本文が短すぎます（現在約${curChars}字）。各セクションに具体的な手順・確認項目・注意点・背景説明を加筆し、` +
          `全体で${bodyMinChars}〜${bodyMaxChars}字にしてください。既存の主張・見出しは保ち、数値は新たに創作しないこと。`;
      } else if (needsTrim) {
        promptFix +=
          `\n\n【重要】本文が長すぎます（現在約${curChars}字）。冗長な繰り返し・重複説明を削り、` +
          `${bodyMinChars}〜${bodyMaxChars}字に収めてください。見出し構成と要点は保ち、数値は新たに創作しないこと。`;
      }
      const fixRes = await callText({
        prompt: promptFix,
        model,
        maxTokens: bodyMaxTokens,
        thinking: premium && (needsMore || needsTrim),
      });
      track(fixRes);
      body = fixRes.text;
      report = await runQualityChecks(
        {
          title: theme.title,
          body,
          seoTitle,
          metaDescription,
          articleType: theme.article_type,
          hasCta: ctaId !== null,
          hasImage: eyecatchUrl !== null,
          sourceUrls: [],
        },
        settings,
      );
      lastResults = report.results;
    }

    // 10. 不合格の扱い
    // keepFailed=false のときだけ「完全に破棄」（記事を保存せずログのみ）。
    if (!report.passed && !keepFailed) {
      await restUpdate(`generation_logs?id=eq.${logId}`, {
        prompt_structure: promptStructure,
        prompt_body: bodyPrompt,
        prompt_seo: seoPrompt,
        prompt_fix: promptFix || null,
        draft_first: firstDraft,
        draft_final: body,
        revision_count: revision,
        status: "failed",
        error_message: `品質チェック不合格のため破棄：${report.failedItems.join("、")}`,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        estimated_cost: cost,
        finished_at: new Date().toISOString(),
      });
      if (theme.id) {
        await restUpdate(`themes?id=eq.${theme.id}`, {
          status: "generated",
          generated_at: new Date().toISOString(),
        });
      }
      await notifySlack(
        `記事生成：品質チェック不合格のため破棄「${theme.title}」 不合格項目：${report.failedItems.join("、")}`,
      );
      return {
        status: "failed",
        message: `「${theme.title}」は品質チェック不合格のため破棄しました（${report.failedItems.join("、")}）`,
      };
    }

    // 合格 or「不合格でも下書き保存」。不合格は必ず下書き（自動公開しない）＋不合格バッジ付き。
    // プレミアム：本文中の図版を生成して挿入（合格時のみ。不合格の下書きには画像コストをかけない）。
    if (inBodyImageCount > 0 && report.passed) {
      const headingRe = /^##\s+(.+)$/gm;
      const headings: { text: string; index: number }[] = [];
      let hm: RegExpExecArray | null;
      while ((hm = headingRe.exec(body)) !== null) {
        headings.push({ text: hm[1].trim(), index: hm.index + hm[0].length });
      }
      // 先頭と末尾（まとめ/FAQ）を避け、均等に最大 inBodyImageCount 箇所へ
      const candidates = headings.slice(1, Math.max(1, headings.length - 1));
      const picks: { text: string; index: number }[] = [];
      if (candidates.length > 0) {
        const step = Math.max(1, Math.floor(candidates.length / inBodyImageCount));
        for (let i = 0; i < candidates.length && picks.length < inBodyImageCount; i += step) {
          picks.push(candidates[i]);
        }
      }
      // 図版ごとに構図を変えて重複を防ぐ
      const figHints = [
        "手順を表す横方向のフロー図。番号付きのステップを矢印でつなぐ",
        "1つの主要オブジェクトを中心に据えたシンプルな概念アイコン図",
        "対比・チェックリスト風の2カラム構図",
        "俯瞰の現場レイアウト図。建物・重機・区画を配置",
      ];
      // 後ろから挿入して index のズレを防ぐ（hint は元の並び順で割り当て）
      for (let k = picks.length - 1; k >= 0; k--) {
        // 図版は任意のため、上限到達後は追加生成せず本文保存へ進む
        if (perArticleCostLimit > 0 && cost >= perArticleCostLimit) break;
        const p = picks[k];
        const img = await generateAiEyecatchPng(p.text, categoryName, {
          quality: imageQuality,
          style: artStyle,
          variantHint: figHints[k % figHints.length],
        });
        if (!img) continue;
        const url = await uploadEyecatch(img.png, `${slug}-fig${k + 1}`);
        inputTokens += img.inputTokens;
        outputTokens += img.outputTokens;
        cost += img.costUsd;
        if (url) {
          const md = `\n\n![${p.text}](${url})\n`;
          body = body.slice(0, p.index) + md + body.slice(p.index);
        }
      }
    }

    // 不合格の記事は必ず下書き（自動公開しない）。合格＋自動公開ONのときだけ公開。
    // 記事を保存できた時点で「失敗」ではないので、履歴のステータスは記事状態に合わせる（要確認は error_message で示す）。
    const articleStatus =
      report.passed && autoPublish ? "published" : "draft";
    const logStatus = articleStatus;
    const publishedAt = articleStatus === "published" ? new Date().toISOString() : null;

    // 記事を保存
    const articleRows = await restInsert<{ id: string }>("articles", {
      theme_id: theme.id,
      category_id: theme.category_id,
      cta_id: ctaId,
      title: theme.title,
      slug,
      body,
      excerpt: excerptFrom(body),
      article_type: theme.article_type,
      status: articleStatus,
      seo_title: seoTitle.slice(0, 200),
      meta_description: metaDescription.slice(0, 400),
      eyecatch_url: eyecatchUrl,
      char_count: body.replace(/\s/g, "").length,
      revision_count: revision,
      quality_score: report.results.find((r) => r.layer === 3)?.score ?? null,
      quality_layers_passed: report.passedLayers,
      quality_layers_total: report.checkedLayers,
      failed_check_items: report.failedItems,
      published_at: publishedAt,
    });
    const articleId = articleRows[0].id;

    // 版管理（初稿・最終稿）
    const versions: unknown[] = [
      {
        article_id: articleId,
        generation_log_id: logId,
        version_number: 0,
        title: theme.title,
        body: firstDraft,
        is_first_draft: true,
        is_final: revision === 0,
        editor: "ai",
      },
    ];
    if (revision > 0) {
      versions.push({
        article_id: articleId,
        generation_log_id: logId,
        version_number: revision,
        title: theme.title,
        body,
        is_first_draft: false,
        is_final: true,
        editor: "ai",
      });
    }
    await restInsert("article_versions", versions);

    // 品質チェック結果を保存
    await persistQualityChecks(logId, articleId, revision, lastResults);

    // 埋め込みベクトル（重複判定用）
    const [titleVec, bodyVec] = await Promise.all([embed(theme.title), embed(body)]);
    if (titleVec || bodyVec) {
      await restInsert("article_embeddings", {
        article_id: articleId,
        model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
        title_embedding: titleVec ? toVectorLiteral(titleVec) : null,
        body_embedding: bodyVec ? toVectorLiteral(bodyVec) : null,
      });
    }

    // generation_log を更新
    await restUpdate(`generation_logs?id=eq.${logId}`, {
      article_id: articleId,
      prompt_structure: promptStructure,
      prompt_body: bodyPrompt,
      prompt_seo: seoPrompt,
      prompt_fix: promptFix || null,
      draft_first: firstDraft,
      draft_final: body,
      revision_count: revision,
      status: logStatus,
      error_message: report.passed
        ? null
        : `品質チェック不合格（下書き保存）：${report.failedItems.join("、")}`,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost: cost,
      finished_at: new Date().toISOString(),
      published_at: publishedAt,
    });

    // テーマ在庫を使う運用時のみ生成済みに更新（その場生成では id=null でスキップ）
    if (theme.id) {
      await restUpdate(`themes?id=eq.${theme.id}`, {
        status: "generated",
        generated_at: new Date().toISOString(),
      });
    }

    // 通知
    const label = !report.passed
      ? "下書き（要確認）"
      : articleStatus === "published"
        ? "公開"
        : "下書き";
    await notifySlack(
      `記事生成：${label}「${theme.title}」（修正${revision}回）${
        report.passed ? "" : `／不合格項目：${report.failedItems.join("、")}`
      }`,
    );
    return {
      status: report.passed ? articleStatus : "failed",
      message: `「${theme.title}」を${
        !report.passed ? "下書き保存（品質チェック不合格・要確認）" : articleStatus === "published" ? "公開" : "下書き保存"
      }しました`,
      articleId,
      slug,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await restUpdate(`generation_logs?id=eq.${logId}`, {
      status: "failed",
      error_message: msg,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost: cost,
      finished_at: new Date().toISOString(),
    });
    await notifySlack(`記事生成：エラーで失敗「${theme.title}」 ${msg}`);
    return { status: "failed", message: `生成エラー：${msg}` };
  }
}
