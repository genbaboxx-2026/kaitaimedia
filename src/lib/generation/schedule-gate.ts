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
const LOCK_KEY = "scheduled_generation_lock";
/** 1バッチ最大時間より少し短く。期限切れ後は他ランナーが奪える */
const LOCK_TTL_MS = 25 * 60 * 1000;

interface JstNow {
  date: string; // YYYY-MM-DD
  hour: number;
  minute: number;
  minutesOfDay: number;
}

interface ScheduleLock {
  jstDate: string;
  owner: string;
  expiresAt: string;
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

function parseLock(raw: string): ScheduleLock | null {
  if (!raw.trim()) return null;
  try {
    const v = JSON.parse(raw) as Partial<ScheduleLock>;
    if (
      typeof v.jstDate === "string" &&
      typeof v.owner === "string" &&
      typeof v.expiresAt === "string"
    ) {
      return { jstDate: v.jstDate, owner: v.owner, expiresAt: v.expiresAt };
    }
  } catch {
    // 旧形式や壊れた値は無効扱い
  }
  return null;
}

function lockActive(lock: ScheduleLock | null, jstDate: string, now = Date.now()): boolean {
  if (!lock || lock.jstDate !== jstDate) return false;
  return new Date(lock.expiresAt).getTime() > now;
}

/**
 * 本日の「成功した生成」だけを数える。
 * 品質不合格で error_message 付きの下書きは成功数に含めない（再試行可能）。
 */
export async function countTodaysGeneratedArticles(
  jstDate: string,
): Promise<number> {
  const dayStartUtc = jstDayStartUtcIso(jstDate);
  const logs = await restSelect<{ id: string }>(
    `generation_logs?select=id&started_at=gte.${encodeURIComponent(dayStartUtc)}&article_id=not.is.null&error_message=is.null&status=in.(published,draft)`,
    0,
  );
  return logs?.length ?? 0;
}

/** 本日の定時・手動を含む生成試行数（不合格下書き・失敗も含む） */
export async function countTodaysGenerationAttempts(
  jstDate: string,
): Promise<number> {
  const dayStartUtc = jstDayStartUtcIso(jstDate);
  const logs = await restSelect<{ id: string }>(
    `generation_logs?select=id&started_at=gte.${encodeURIComponent(dayStartUtc)}`,
    0,
  );
  return logs?.length ?? 0;
}

/** 試行上限。設定が 0 なら成功本数の2倍（最低1） */
export function resolveMaxScheduledAttempts(
  articlesPerDay: number,
  configuredMax: number,
): number {
  if (configuredMax > 0) return configuredMax;
  return Math.max(1, articlesPerDay * 2);
}

export interface ScheduleGateResult {
  run: boolean;
  reason: string;
  jstDate: string;
  generationTime: string;
  /** 本日あと何本生成するか（articles_per_day − 本日成功数） */
  remaining: number;
  articlesPerDay: number;
  todayCount: number;
  todayAttempts: number;
  maxAttempts: number;
}

/**
 * 定時トリガー時に「今すぐバッチを回してよいか」を判定する。
 * generation_time 以降で、本日の成功生成数が articles_per_day 未達なら実行する。
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
  const maxAttempts = resolveMaxScheduledAttempts(
    articlesPerDay,
    Math.floor(getNumber(settings, "max_scheduled_attempts_per_day", 0)),
  );
  const jst = jstNow(now);
  const nowLabel = `${String(jst.hour).padStart(2, "0")}:${String(jst.minute).padStart(2, "0")}`;
  const todayCount = await countTodaysGeneratedArticles(jst.date);
  const todayAttempts = await countTodaysGenerationAttempts(jst.date);
  const remaining = Math.max(0, articlesPerDay - todayCount);

  const base = {
    jstDate: jst.date,
    generationTime,
    remaining,
    articlesPerDay,
    todayCount,
    todayAttempts,
    maxAttempts,
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
      reason: `本日の生成本数に到達（成功 ${todayCount}/${articlesPerDay}本・${jst.date}）`,
    };
  }

  // 不合格下書きは成功数に入れないが、試行自体は上限で止める（無限再試行防止）
  if (todayAttempts >= maxAttempts) {
    return {
      ...base,
      run: false,
      reason: `本日の試行上限に到達（試行 ${todayAttempts}/${maxAttempts}・成功 ${todayCount}/${articlesPerDay}）。不合格続きのため停止`,
    };
  }

  const lock = parseLock(String(settings[LOCK_KEY] ?? ""));
  if (lockActive(lock, jst.date)) {
    return {
      ...base,
      run: false,
      reason: `他の定時生成が実行中のためスキップ（owner=${lock?.owner ?? "?"}）`,
    };
  }

  const onTime = isInGenerationWindow(generationTime, now);
  return {
    ...base,
    run: true,
    reason: onTime
      ? `定時枠ヒット（設定 ${generationTime} / 不足 ${remaining}本・成功 ${todayCount}/${articlesPerDay}・試行 ${todayAttempts}/${maxAttempts}）`
      : `当日追い上げ（設定 ${generationTime} / いま JST ${nowLabel} / 不足 ${remaining}本・成功 ${todayCount}/${articlesPerDay}・試行 ${todayAttempts}/${maxAttempts}）`,
  };
}

/** 二重起動防止ロックを取得。取得後に再読込して所有者一致を確認する */
export async function tryAcquireScheduleLock(
  jstDate: string,
  owner: string,
): Promise<{ ok: boolean; reason: string }> {
  const settings = await loadSettings();
  const existing = parseLock(String(settings[LOCK_KEY] ?? ""));
  if (lockActive(existing, jstDate)) {
    return {
      ok: false,
      reason: `他の定時生成が実行中（owner=${existing?.owner ?? "?"}）`,
    };
  }

  const expiresAt = new Date(Date.now() + LOCK_TTL_MS).toISOString();
  await restUpsert(
    "settings",
    {
      key: LOCK_KEY,
      value: JSON.stringify({ jstDate, owner, expiresAt } satisfies ScheduleLock),
      value_type: "string",
      description: "定時生成の実行中ロック（二重起動防止）",
    },
    "key",
  );

  const again = await loadSettings();
  const locked = parseLock(String(again[LOCK_KEY] ?? ""));
  if (!locked || locked.owner !== owner || !lockActive(locked, jstDate)) {
    return { ok: false, reason: "定時ロックの取得に失敗（競合）" };
  }
  return { ok: true, reason: "lock acquired" };
}

/** 自分が持っているロックだけ解放する */
export async function releaseScheduleLock(owner: string): Promise<void> {
  const settings = await loadSettings();
  const locked = parseLock(String(settings[LOCK_KEY] ?? ""));
  if (!locked || locked.owner !== owner) return;
  await restUpsert(
    "settings",
    {
      key: LOCK_KEY,
      value: "",
      value_type: "string",
      description: "定時生成の実行中ロック（二重起動防止）",
    },
    "key",
  );
}

/** 定時バッチが本数到達した日を記録 */
export async function markScheduledGenerationDate(jstDate: string): Promise<void> {
  await restUpsert(
    "settings",
    {
      key: LAST_RUN_KEY,
      value: jstDate,
      value_type: "string",
      description: "定時生成を最後に完了した日付（JST YYYY-MM-DD）",
    },
    "key",
  );
}

/** 本数未達時などに完了マークを外す */
export async function clearScheduledGenerationDate(): Promise<void> {
  await restUpsert(
    "settings",
    {
      key: LAST_RUN_KEY,
      value: "",
      value_type: "string",
      description: "定時生成を最後に完了した日付（JST YYYY-MM-DD）",
    },
    "key",
  );
}
