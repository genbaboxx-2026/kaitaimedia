import {
  getBool,
  getNumber,
  getString,
  loadSettings,
} from "@/lib/ai/settings";
import { restSelect, restUpsert } from "@/lib/supabase/rest";

/** 朝の固定枠＋毎時追い上げを想定した表示用（実際の間隔は workflow 側） */
export const SCHEDULE_POLL_MINUTES = 60;

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

export function jstDayStartUtcIso(jstDate: string): string {
  // JST 0:00 = UTC 前日 15:00
  return new Date(`${jstDate}T00:00:00+09:00`).toISOString();
}

/** 本日（JST）に記事まで残った生成ログ件数 */
export async function countTodaysGeneratedArticles(
  jstDate: string,
): Promise<number> {
  const dayStartUtc = jstDayStartUtcIso(jstDate);
  const logs = await restSelect<{ id: string }>(
    `generation_logs?select=id&started_at=gte.${encodeURIComponent(dayStartUtc)}&article_id=not.is.null`,
    0,
  );
  return logs?.length ?? 0;
}

export interface ScheduleGateResult {
  run: boolean;
  reason: string;
  jstDate: string;
  generationTime: string;
  /** 本日あと何本生成するか（articles_per_day − 本日済み） */
  remaining: number;
  articlesPerDay: number;
  todayCount: number;
}

/**
 * 定時トリガー時に「今すぐバッチを回してよいか」を判定する。
 * generation_time 以降で、本日の生成数が articles_per_day 未達なら実行する。
 * 1本でもあると全スキップ、にはしない（不足分を埋める）。
 */
export async function evaluateScheduleGate(
  now = new Date(),
): Promise<ScheduleGateResult> {
  const settings = await loadSettings();
  const generationTime = getString(settings, "generation_time", "03:00");
  const articlesPerDay = Math.max(
    0,
    Math.floor(getNumber(settings, "articles_per_day", 1)),
  );
  const jst = jstNow(now);
  const nowLabel = `${String(jst.hour).padStart(2, "0")}:${String(jst.minute).padStart(2, "0")}`;
  const todayCount = await countTodaysGeneratedArticles(jst.date);
  const remaining = Math.max(0, articlesPerDay - todayCount);

  const base = {
    jstDate: jst.date,
    generationTime,
    remaining,
    articlesPerDay,
    todayCount,
  };

  if (!getBool(settings, "generation_enabled", true)) {
    return {
      ...base,
      run: false,
      reason: "generation_enabled=false のためスキップ",
    };
  }

  if (articlesPerDay === 0) {
    return {
      ...base,
      run: false,
      reason: "articles_per_day=0 のためスキップ",
    };
  }

  if (!hasReachedGenerationTime(generationTime, now)) {
    return {
      ...base,
      run: false,
      reason: `実行時刻前（いま JST ${nowLabel} / 設定 ${generationTime}）`,
    };
  }

  if (remaining === 0) {
    return {
      ...base,
      run: false,
      reason: `本日の生成本数に到達（${todayCount}/${articlesPerDay}本・${jst.date}）`,
    };
  }

  // 実行中ロック：同日ロック中でも本数未達なら不足分を埋める（失敗後の再試行／設定増分）
  const last = settings[LAST_RUN_KEY] ?? "";
  if (last === jst.date && todayCount >= articlesPerDay) {
    return {
      ...base,
      run: false,
      reason: `本日（${jst.date}）は定時生成済み（${todayCount}/${articlesPerDay}）`,
    };
  }

  const onTime = isInGenerationWindow(generationTime, now);
  return {
    ...base,
    run: true,
    reason: onTime
      ? `定時枠ヒット（設定 ${generationTime} / 不足 ${remaining}本・本日 ${todayCount}/${articlesPerDay}）`
      : `当日追い上げ（設定 ${generationTime} / いま JST ${nowLabel} / 不足 ${remaining}本・本日 ${todayCount}/${articlesPerDay}）`,
  };
}

/** 定時バッチ開始時の二重起動防止ロック（成功時はそのまま残す） */
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

/** 失敗時／本数未達時にロックを外し、次の cron で再試行できるようにする */
export async function clearScheduledGenerationDate(): Promise<void> {
  await restUpsert(
    "settings",
    {
      key: LAST_RUN_KEY,
      value: "",
      value_type: "string",
      description: "定時生成を最後に実行した日付（JST YYYY-MM-DD）",
    },
    "key",
  );
}
