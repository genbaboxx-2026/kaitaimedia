import {
  getBool,
  getString,
  loadSettings,
} from "@/lib/ai/settings";
import { restSelect, restUpsert } from "@/lib/supabase/rest";

/** GitHub Actions のポーリング間隔（分）。cron と揃える。 */
export const SCHEDULE_POLL_MINUTES = 15;

const LAST_RUN_KEY = "last_scheduled_generation_date";

interface JstNow {
  date: string; // YYYY-MM-DD
  hour: number;
  minute: number;
  minutesOfDay: number;
}

function jstNow(d = new Date()): JstNow {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "0";
  const year = get("year");
  const month = get("month");
  const day = get("day");
  let hour = Number(get("hour"));
  // en-US の hour12:false で 24 になる環境がある
  if (hour === 24) hour = 0;
  const minute = Number(get("minute"));
  return {
    date: `${year}-${month}-${day}`,
    hour,
    minute,
    minutesOfDay: hour * 60 + minute,
  };
}

function parseGenerationTime(raw: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(raw.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/**
 * いまの JST が、generation_time を含むポーリング枠内か。
 * 例: 23:54 → 23:45〜23:59 の枠（15分間隔のとき）
 * @deprecated 追い上げ判定には hasReachedGenerationTime を使う
 */
export function isInGenerationWindow(
  generationTime: string,
  now = new Date(),
  pollMinutes = SCHEDULE_POLL_MINUTES,
): boolean {
  const target = parseGenerationTime(generationTime);
  if (target === null) return false;
  const jst = jstNow(now);
  const slotStart =
    Math.floor(jst.minutesOfDay / pollMinutes) * pollMinutes;
  const slotEnd = slotStart + pollMinutes;
  return target >= slotStart && target < slotEnd;
}

/** 設定時刻を過ぎているか（GitHub cron の遅延に備えた当日追い上げ用） */
export function hasReachedGenerationTime(
  generationTime: string,
  now = new Date(),
): boolean {
  const target = parseGenerationTime(generationTime);
  if (target === null) return false;
  return jstNow(now).minutesOfDay >= target;
}

export interface ScheduleGateResult {
  run: boolean;
  reason: string;
  jstDate: string;
  generationTime: string;
}

/**
 * 定時トリガー時に「今すぐバッチを回してよいか」を判定する。
 * generation_time 以降で未生成なら実行（cron が15分枠を飛ばしても当日中に追いつく）。
 */
export async function evaluateScheduleGate(
  now = new Date(),
): Promise<ScheduleGateResult> {
  const settings = await loadSettings();
  const generationTime = getString(settings, "generation_time", "03:00");
  const jst = jstNow(now);
  const nowLabel = `${String(jst.hour).padStart(2, "0")}:${String(jst.minute).padStart(2, "0")}`;

  if (!getBool(settings, "generation_enabled", true)) {
    return {
      run: false,
      reason: "generation_enabled=false のためスキップ",
      jstDate: jst.date,
      generationTime,
    };
  }

  if (!hasReachedGenerationTime(generationTime, now)) {
    return {
      run: false,
      reason: `実行時刻前（いま JST ${nowLabel} / 設定 ${generationTime}）`,
      jstDate: jst.date,
      generationTime,
    };
  }

  const last = settings[LAST_RUN_KEY] ?? "";
  if (last === jst.date) {
    return {
      run: false,
      reason: `本日（${jst.date}）は定時生成済み`,
      jstDate: jst.date,
      generationTime,
    };
  }

  // 保険: 本日の生成ログがあれば二重実行しない
  const dayStartUtc = jstDayStartUtcIso(jst.date);
  const logs = await restSelect<{ id: string }>(
    `generation_logs?select=id&started_at=gte.${encodeURIComponent(dayStartUtc)}&limit=1`,
    0,
  );
  if (logs && logs.length > 0) {
    return {
      run: false,
      reason: `本日すでに生成ログあり（${jst.date}）`,
      jstDate: jst.date,
      generationTime,
    };
  }

  const onTime = isInGenerationWindow(generationTime, now);
  return {
    run: true,
    reason: onTime
      ? `定時枠ヒット（設定 ${generationTime} / JST ${jst.date}）`
      : `当日追い上げ（設定 ${generationTime} / いま JST ${nowLabel}）`,
    jstDate: jst.date,
    generationTime,
  };
}

function jstDayStartUtcIso(jstDate: string): string {
  // JST 0:00 = UTC 前日 15:00
  return new Date(`${jstDate}T00:00:00+09:00`).toISOString();
}

/** 定時バッチを試行した日を記録（成功・スキップ結果を問わず二重起動防止） */
export async function markScheduledGenerationDate(jstDate: string): Promise<void> {
  await restUpsert(
    "settings",
    {
      key: LAST_RUN_KEY,
      value: jstDate,
      value_type: "string",
      description: "定時生成を最後に実行した日付（JST YYYY-MM-DD）",
    },
    "key",
  );
}
