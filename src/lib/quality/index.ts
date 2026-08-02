import { getBool, getNumber, getString } from "@/lib/ai/settings";
import { restInsert } from "@/lib/supabase/rest";
import { loadMasterLabels } from "@/lib/quality/masters";
import { runLayer1 } from "@/lib/quality/layer1";
import { runLayer2 } from "@/lib/quality/layer2";
import { runLayer3 } from "@/lib/quality/layer3";
import type {
  CheckResult,
  QualityInput,
  QualityReport,
  QualityThresholds,
} from "@/lib/quality/types";

export type { CheckResult, QualityInput, QualityReport, QualityThresholds };

const CHECK_KEYS = [
  "number_detection",
  "char_count",
  "heading",
  "ng_expression",
  "cta",
  "image",
  "seo_length",
  "link_alive",
  "source_url",
  "title_similarity",
  "body_similarity",
  "ai_quality",
] as const;

export async function buildThresholds(
  settings: Record<string, string>,
): Promise<QualityThresholds> {
  const enabled: Record<string, boolean> = {};
  for (const key of CHECK_KEYS) {
    enabled[key] = getBool(settings, `check_${key}_enabled`, true);
  }
  const [ngExpressions, numberExclusions] = await Promise.all([
    loadMasterLabels("ng_expression"),
    loadMasterLabels("number_exclusion"),
  ]);

  // プレミアム生成時は長文レンジ（premium_*）で文字数を判定する
  const premium = getBool(settings, "premium_enabled", false);

  return {
    minChar: premium
      ? getNumber(settings, "premium_min_char_count", 9000)
      : getNumber(settings, "min_char_count", 3000),
    maxChar: premium
      ? getNumber(settings, "premium_max_char_count", 11000)
      : getNumber(settings, "max_char_count", 4000),
    seoTitleMax: getNumber(settings, "seo_title_max_length", 32),
    metaDescMax: getNumber(settings, "meta_description_max_length", 120),
    titleSim: getNumber(settings, "title_similarity_threshold", 0.9),
    bodySim: getNumber(settings, "body_similarity_threshold", 0.85),
    aiPassScore: getNumber(settings, "ai_quality_pass_score", 3),
    aiModel: getString(settings, "ai_model", "claude-opus-4-8"),
    enabled,
    ngExpressions,
    numberExclusions,
  };
}

export async function runQualityChecks(
  input: QualityInput,
  settings: Record<string, string>,
): Promise<QualityReport> {
  const thr = await buildThresholds(settings);

  const layer1 = await runLayer1(input, thr);
  const layer2 = await runLayer2(input, thr);
  const layer3 = await runLayer3(input, thr);
  const results = [...layer1, ...layer2, ...layer3];

  const layerPassed = (layer: 1 | 2 | 3): boolean | null => {
    const items = results.filter((r) => r.layer === layer);
    if (items.length === 0) return null; // 実施なし
    return items.every((r) => r.passed);
  };

  let passedLayers = 0;
  let checkedLayers = 0;
  for (const layer of [1, 2, 3] as const) {
    const p = layerPassed(layer);
    if (p === null) continue;
    checkedLayers += 1;
    if (p) passedLayers += 1;
  }

  const passed = results.every((r) => r.passed);
  const failedItems = results.filter((r) => !r.passed).map((r) => r.checkItem);

  return { results, passed, failedItems, passedLayers, checkedLayers };
}

// 結果を quality_checks テーブルに項目単位で保存する。
export async function persistQualityChecks(
  generationLogId: string,
  articleId: string | null,
  revisionNumber: number,
  results: CheckResult[],
): Promise<void> {
  if (results.length === 0) return;
  const rows = results.map((r) => ({
    generation_log_id: generationLogId,
    article_id: articleId,
    revision_number: revisionNumber,
    layer: r.layer,
    check_item: r.checkItem,
    passed: r.passed,
    score: r.score ?? null,
    detail: r.detail,
  }));
  await restInsert("quality_checks", rows);
}
