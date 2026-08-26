/**
 * Day and slot maths for the calendar.
 *
 * Pure functions with no dependencies, so the route loader, the day view and
 * the actions can all import them and the app has exactly one definition of
 * "which day is this" and "where does a slot start".
 */

/** URL search param that pins the day on show. Absent means today. */
export const DAY_PARAM = "date";

/** `YYYY-MM-DD` — the app's stable identifier for a calendar day. */
export type DayKey = string;

/** Minutes covered by one slot. An hour row is two of them. */
export const SLOT_MINUTES = 30;

/** Hour the grid opens on when the day being viewed is not today. */
export const DAY_ANCHOR_HOUR = 7;

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const HOURS_PER_DAY = 24;

// Spelled out rather than formatted through Intl so the server render and the
// browser render are byte-identical regardless of the host locale.
const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const pad = (value: number) => String(value).padStart(2, "0");

/** One row of the grid. `key` is the handle a task will be stored against. */
export interface DaySlot {
  /** `YYYY-MM-DDTHH:mm` — unique, sortable, and free of timezone ambiguity. */
  key: string;
  hour: number;
  minute: number;
  /** `HH:mm`, shown in the gutter on the hour. */
  label: string;
  /** The `:00` half of an hour, which carries the solid rule and the label. */
  startsHour: boolean;
}

/**
 * Rejects malformed input and impossible dates. The round-trip check is the
 * point: `Date` silently rolls `2026-02-31` over into March rather than
 * failing, so parsing alone would let a nonexistent day through.
 */
export function isDayKey(value: unknown): value is DayKey {
  if (typeof value !== "string" || !DAY_KEY_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Today, in the timezone of whoever is asking. */
export function todayKey(): DayKey {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Coerce untrusted input — a URL param, an agent argument — into a day the
 * rest of the app can use. Anything unusable falls back to today rather than
 * throwing, because a bad `?date=` should not blank the screen.
 */
export function resolveDayKey(value: unknown): DayKey {
  return isDayKey(value) ? value : todayKey();
}

/** Day arithmetic in UTC, so a DST boundary can never skip or repeat a day. */
export function shiftDayKey(key: DayKey, days: number): DayKey {
  const date = toUtcDate(key);
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}`;
}

function toUtcDate(key: DayKey): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** "Wednesday, 26 August" */
export function formatDayTitle(key: DayKey): string {
  const date = toUtcDate(key);
  return `${WEEKDAYS[date.getUTCDay()]}, ${date.getUTCDate()} ${
    MONTHS[date.getUTCMonth()]
  }`;
}

/** "Wed, 26 Aug" — the same title where the header is too narrow for the long one. */
export function formatDayTitleShort(key: DayKey): string {
  const date = toUtcDate(key);
  return `${WEEKDAYS[date.getUTCDay()].slice(0, 3)}, ${date.getUTCDate()} ${MONTHS[
    date.getUTCMonth()
  ].slice(0, 3)}`;
}

/** Route to the day view. A bare `/` means today; a key pins the day. */
export function dayPath(key?: unknown): string {
  return isDayKey(key) ? `/?${DAY_PARAM}=${key}` : "/";
}

export function slotKey(key: DayKey, hour: number, minute: number): string {
  return `${key}T${pad(hour)}:${pad(minute)}`;
}

/** Every slot in a day, in order — 48 of them at 30-minute granularity. */
export function buildDaySlots(key: DayKey): DaySlot[] {
  const slots: DaySlot[] = [];
  for (let hour = 0; hour < HOURS_PER_DAY; hour += 1) {
    for (let minute = 0; minute < 60; minute += SLOT_MINUTES) {
      slots.push({
        key: slotKey(key, hour, minute),
        hour,
        minute,
        label: `${pad(hour)}:${pad(minute)}`,
        startsHour: minute === 0,
      });
    }
  }
  return slots;
}

/**
 * Rejects anything that is not a 24-hour `HH:mm`. Times come from the agent as
 * well as the UI, so this is the only thing standing between a typo and a task
 * that exists in the database but sits in no slot on screen.
 */
export function isTimeOfDay(value: unknown): value is string {
  return typeof value === "string" && TIME_PATTERN.test(value);
}

/**
 * The slot an `HH:mm` time belongs to, rounded down.
 *
 * The grid resolves to 30 minutes but a time does not have to: the agent can
 * put a task at 09:15. Rounding down here is what guarantees every task lands
 * in a slot that exists, so nothing is ever written but never shown.
 */
export function slotKeyForTime(day: DayKey, time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  return slotKey(day, hour, Math.floor(minute / SLOT_MINUTES) * SLOT_MINUTES);
}

/**
 * How far a moment sits through its own slot, as a 0–1 fraction. Lets the now
 * indicator land on the exact minute instead of snapping to the slot edge.
 */
export function slotProgressAt(at: Date): number {
  return (at.getMinutes() % SLOT_MINUTES) / SLOT_MINUTES;
}

/** The slot a moment falls in, or null when that moment is on another day. */
export function slotKeyAt(key: DayKey, at: Date): string | null {
  const dayOfMoment = `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(
    at.getDate(),
  )}`;
  if (dayOfMoment !== key) return null;
  const minute = Math.floor(at.getMinutes() / SLOT_MINUTES) * SLOT_MINUTES;
  return slotKey(key, at.getHours(), minute);
}
