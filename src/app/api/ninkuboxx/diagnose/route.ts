import { NextResponse } from "next/server";
import { callText } from "@/lib/ai/client";
import { getActivePrompt, interpolate } from "@/lib/ai/prompts";
import {
  type Answers,
  type AnswerValue,
  buildFallbackFeedback,
  computeDiagnosis,
  formatScoresForPrompt,
  getHealthBand,
  isCompleteAnswers,
  parseDiagnosisFeedback,
  QUESTIONS,
  summarizeAnswers,
} from "@/lib/ninkuboxx/diagnosis";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseAnswers(raw: unknown): Answers | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const answers: Answers = {};
  for (const q of QUESTIONS) {
    const v = obj[q.id];
    if (v !== 1 && v !== 2 && v !== 3 && v !== 4 && v !== 5) return null;
    answers[q.id] = v as AnswerValue;
  }
  return answers;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { answers?: unknown };
    const answers = parseAnswers(body.answers);
    if (!answers || !isCompleteAnswers(answers)) {
      return NextResponse.json(
        { error: "すべての設問に1〜5で回答してください。" },
        { status: 400 },
      );
    }

    const result = computeDiagnosis(answers);
    const health = 100 - result.overall;
    const band = getHealthBand(health);
    let feedback = buildFallbackFeedback(result);
    let source: "ai" | "fallback" = "fallback";

    try {
      const template = await getActivePrompt("ninkuboxx_diag");
      const prompt = interpolate(template, {
        health_score: String(health),
        band_range: band.range,
        scores: formatScoresForPrompt(result.scores),
        answers_summary: summarizeAnswers(answers),
        // 旧プロンプト互換（未使用変数は残っても害なし）
        overall_label: result.overallLabel,
      });
      const ai = await callText({
        prompt,
        model: "claude-haiku-4-5",
        maxTokens: 500,
      });
      const parsed = parseDiagnosisFeedback(ai.text);
      if (parsed) {
        feedback = parsed;
        source = "ai";
      }
    } catch (err) {
      console.error("[ninkuboxx/diagnose] AI fallback:", err);
    }

    return NextResponse.json({
      scores: result.scores,
      overall: result.overall,
      overallLabel: result.overallLabel,
      feedbackTitle: feedback.title,
      feedbackBody: feedback.body,
      feedback: `${feedback.title}\n${feedback.body}`,
      source,
    });
  } catch (err) {
    console.error("[ninkuboxx/diagnose]", err);
    return NextResponse.json(
      { error: "診断処理に失敗しました。" },
      { status: 500 },
    );
  }
}
