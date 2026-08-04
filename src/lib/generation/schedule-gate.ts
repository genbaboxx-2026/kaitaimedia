import {
  getBool,
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

export interface ScheduleGateResult {
  run: boolean;
  reason: string;
  jstDate: string;
  generationTime: string;
}

/**
 * 定時トリガー時に「今すぐバッチを回してよいか」を判定する。
 * generation_time 以降で、当日まだ記事が作られていなければ実行する。
 * 失敗ログだけではスキップしない（翌日まで止まり続けない）。
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

  // 記事が実際にできたログだけを「生成済み」とみなす。
  // 失敗・中断ログ（article_id なし）ではスキップしない。
  const dayStartUtc = jstDayStartUtcIso(jst.date);
  const logs = await restSelect<{ id: string }>(
    `generation_logs?select=id&started_at=gte.${encodeURIComponent(dayStartUtc)}&article_id=not.is.null&limit=1`,
    0,
  );
  if (logs && logs.length > 0) {
    return {
      run: false,
      reason: `本日すでに記事生成済み（${jst.date}）`,
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

/** 失敗時にロックを外し、次の cron で再試行できるようにする */
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
