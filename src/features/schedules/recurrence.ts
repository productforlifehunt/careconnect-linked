/**
 * CCT 187 recurrence, RFC 5545 only — the data dictionary is the source.
 *   a57 Start at  first occurrence (date + first time of day)
 *   a58 End at    end of that first occurrence (a dose is an instant: = a57)
 *   a66 RRULE     FREQ / INTERVAL / BYHOUR / BYMINUTE / BYSETPOS / UNTIL
 *   a68 EXDATES   occurrences removed from the plan
 *   a69 RDATES    extra one-off occurrences
 * a70 Recurrence ID is only for two-way calendar sync and is not used.
 * Times of day and frequency are read back from these columns; nothing else.
 */

export const FREQUENCY_CODES = [
  "once_daily", "twice_daily", "three_daily", "four_daily",
  "every_other_day", "weekly", "monthly", "yearly", "daily", "as_needed",
] as const;
export type FrequencyCode = (typeof FREQUENCY_CODES)[number];

const DAILY_COUNT: Partial<Record<FrequencyCode, number>> = {
  once_daily: 1, twice_daily: 2, three_daily: 3, four_daily: 4,
};
const COUNT_DAILY: Record<number, FrequencyCode> = { 1: "once_daily", 2: "twice_daily", 3: "three_daily", 4: "four_daily" };

/** How many times of day a frequency needs (null = any number, e.g. weekly). */
export function slotsNeeded(freq: FrequencyCode): number | null {
  if (freq === "as_needed") return 0;
  return DAILY_COUNT[freq] ?? null;
}

function pad(n: number): string { return String(n).padStart(2, "0"); }

/** "8:00" / "08:00:00" → "08:00"; unique and sorted. */
export function normalizeSlots(slots: readonly unknown[]): string[] {
  const out = new Set<string>();
  slots.forEach((s) => {
    const m = String(s ?? "").match(/^(\d{1,2}):(\d{2})/);
    if (m && Number(m[1]) < 24 && Number(m[2]) < 60) out.add(`${pad(Number(m[1]))}:${m[2]}`);
  });
  return [...out].sort();
}

/** Daily frequency follows the number of times; other patterns keep their own. */
export function frequencyForSlots(freq: FrequencyCode, slots: readonly string[]): FrequencyCode {
  if (["as_needed", "weekly", "every_other_day", "monthly", "yearly", "daily"].includes(freq)) return freq;
  return COUNT_DAILY[normalizeSlots(slots).length] || freq;
}

/** YYYY-MM-DD → RFC 5545 UNTIL (end of that local day). */
function toUntil(date: string): string {
  return `${date.replace(/-/g, "")}T235959`;
}

export function buildRRule(freq: FrequencyCode, slots: readonly string[], untilDate?: string | null | undefined): string {
  if (freq === "as_needed") return "";
  const times = normalizeSlots(slots);
  const parts: string[] = [];
  if (freq === "weekly") parts.push("FREQ=WEEKLY", "INTERVAL=1");
  else if (freq === "monthly") parts.push("FREQ=MONTHLY", "INTERVAL=1");
  else if (freq === "yearly") parts.push("FREQ=YEARLY", "INTERVAL=1");
  else parts.push("FREQ=DAILY", `INTERVAL=${freq === "every_other_day" ? 2 : 1}`);
  if (times.length) {
    const hours = [...new Set(times.map((t) => Number(t.slice(0, 2))))].sort((a, b) => a - b);
    const minutes = [...new Set(times.map((t) => Number(t.slice(3, 5))))].sort((a, b) => a - b);
    parts.push(`BYHOUR=${hours.join(",")}`, `BYMINUTE=${minutes.join(",")}`);
    // BYHOUR × BYMINUTE expands to every combination; BYSETPOS keeps exactly ours.
    const expanded = hours.flatMap((h) => minutes.map((m) => `${pad(h)}:${pad(m)}`));
    if (expanded.length !== times.length) {
      parts.push(`BYSETPOS=${times.map((t) => expanded.indexOf(t) + 1).join(",")}`);
    }
  }
  if (untilDate) parts.push(`UNTIL=${toUntil(untilDate)}`);
  return parts.join(";");
}

/** Build common daily, weekly, monthly, and yearly RRULE patterns. */
export function buildScheduleRRule(
  freq: FrequencyCode,
  slots: readonly string[],
  startDate: string,
  untilDate?: string | null,
  interval = 1,
  weekdays: readonly string[] = [],
): string {
  if (freq === "as_needed") return "";
  const base = buildRRule(freq, slots, untilDate);
  const parts = base.split(";").filter((part) => !part.startsWith("BYDAY=") && !part.startsWith("BYMONTHDAY=") && !part.startsWith("BYMONTH=") && !part.startsWith("BYSETPOS="));
  const weekdayOrder = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
  const dayCodes = [...new Set(weekdays.filter((day) => weekdayOrder.includes(day)))].sort((a, b) => weekdayOrder.indexOf(a) - weekdayOrder.indexOf(b));
  const intervalIndex = parts.findIndex((part) => part.startsWith("INTERVAL="));
  const intervalPart = `INTERVAL=${freq === "every_other_day" ? 2 : Math.max(1, Math.floor(interval) || 1)}`;
  if (intervalIndex >= 0) parts[intervalIndex] = intervalPart;
  else parts.splice(1, 0, intervalPart);
  const recurrenceStart = parts.findIndex((part) => part.startsWith("BYHOUR=") || part.startsWith("UNTIL="));
  const byDayPart = `BYDAY=${[...new Set(dayCodes)].join(",")}`;
  if (freq === "weekly" && dayCodes.length) parts.splice(recurrenceStart >= 0 ? recurrenceStart : parts.length, 0, byDayPart);
  if (freq === "monthly" || freq === "yearly") {
    const [, month = "1", day = "1"] = startDate.split("-");
    let index = parts.findIndex((part) => part.startsWith("BYHOUR=") || part.startsWith("UNTIL="));
    if (index < 0) index = parts.length;
    parts.splice(index, 0, `BYMONTHDAY=${Number(day)}`);
    if (freq === "yearly") parts.splice(index, 0, `BYMONTH=${Number(month)}`);
  }
  const times = normalizeSlots(slots);
  if (times.length) {
    const hours = [...new Set(times.map((time) => Number(time.slice(0, 2))))].sort((a, b) => a - b);
    const minutes = [...new Set(times.map((time) => Number(time.slice(3, 5))))].sort((a, b) => a - b);
    const expanded = hours.flatMap((hour) => minutes.map((minute) => `${pad(hour)}:${pad(minute)}`));
    if (expanded.length !== times.length) {
      const datesPerPeriod = freq === "weekly" ? Math.max(1, dayCodes.length) : 1;
      const positions = Array.from({ length: datesPerPeriod }, (_, dayIndex) =>
        times.map((time) => dayIndex * expanded.length + expanded.indexOf(time) + 1),
      ).flat();
      const bySetPos = `BYSETPOS=${positions.join(",")}`;
      const untilIndex = parts.findIndex((part) => part.startsWith("UNTIL="));
      if (untilIndex >= 0) parts.splice(untilIndex, 0, bySetPos);
      else parts.push(bySetPos);
    }
  }
  return parts.join(";");
}

export interface ParsedRRule {
  freq: string; interval: number; byhour: number[]; byminute: number[]; bysetpos: number[];
  byday: string[]; bymonthday: number[]; bymonth: number[]; until: string | null;
}

export function parseRRule(raw: unknown): ParsedRRule | null {
  const text = String(raw ?? "").replace(/^RRULE:/i, "").trim();
  if (!text) return null;
  const kv: Record<string, string> = {};
  text.split(";").forEach((p) => { const [k, v] = p.split("="); if (k && v !== undefined) kv[k.trim().toUpperCase()] = v.trim(); });
  if (!kv["FREQ"]) return null;
  const nums = (v?: string) => (v ? v.split(",").map(Number).filter((n) => Number.isFinite(n)) : []);
  const u = kv["UNTIL"]?.match(/^(\d{4})(\d{2})(\d{2})/);
  return {
    freq: kv["FREQ"].toUpperCase(),
    interval: Math.max(1, Number(kv["INTERVAL"] || 1) || 1),
    byhour: nums(kv["BYHOUR"]), byminute: nums(kv["BYMINUTE"]), bysetpos: nums(kv["BYSETPOS"]),
    byday: kv["BYDAY"] ? kv["BYDAY"].split(",").map((v) => v.trim().toUpperCase()) : [],
    bymonthday: nums(kv["BYMONTHDAY"]), bymonth: nums(kv["BYMONTH"]),
    until: u ? `${u[1]}-${u[2]}-${u[3]}` : null,
  };
}

/** Time part "HH:MM" of a stored a57 datetime. */
export function timeOf(datetime: unknown): string | null {
  const m = String(datetime ?? "").match(/[ T](\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : null;
}
export function dateOf(datetime: unknown): string | null {
  const m = String(datetime ?? "").match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1]! : null;
}

/** The times of day an occurrence day has, from a66 (a57's time when BYHOUR is absent). */
export function slotsFromRRule(rrule: unknown, startAt: unknown): string[] {
  const r = parseRRule(rrule);
  const start = timeOf(startAt);
  if (!r || !r.byhour.length) return start ? [start] : [];
  const minutes = r.byminute.length ? r.byminute : [Number((start || "00:00").slice(3, 5))];
  const expanded = r.byhour.slice().sort((a, b) => a - b)
    .flatMap((h) => minutes.slice().sort((a, b) => a - b).map((m) => `${pad(h)}:${pad(m)}`));
  if (!r.bysetpos.length) return expanded;
  const positionsPerDay = expanded.length;
  const periodSize = positionsPerDay * (r.freq === "WEEKLY" ? Math.max(1, r.byday.length) : 1);
  return normalizeSlots(r.bysetpos.map((p) => {
    const index = p > 0 ? p - 1 : periodSize + p;
    return expanded[((index % positionsPerDay) + positionsPerDay) % positionsPerDay];
  }).filter(Boolean));
}

/** UI frequency code read from a66 + a95 (as-needed) + the number of times. */
export function frequencyFromRow(rrule: unknown, asNeeded: boolean, slots: readonly string[]): FrequencyCode {
  if (asNeeded) return "as_needed";
  const r = parseRRule(rrule);
  if (!r) return "as_needed";
  if (r.freq === "WEEKLY") return "weekly";
  if (r.freq === "MONTHLY") return "monthly";
  if (r.freq === "YEARLY") return "yearly";
  if (r.freq === "DAILY" && r.interval === 2) return "every_other_day";
  if (r.freq === "DAILY" && r.interval > 1) return "daily";
  return COUNT_DAILY[slots.length] || "once_daily";
}

/** All YYYYMMDDTHHMMSS / YYYY-MM-DD HH:MM values in an a68/a69 text. */
function listDates(raw: unknown): { date: string; time: string | null }[] {
  const out: { date: string; time: string | null }[] = [];
  const re = /(\d{4})-?(\d{2})-?(\d{2})(?:[T ](\d{2}):?(\d{2}))?/g;
  let m: RegExpExecArray | null;
  const text = String(raw ?? "");
  while ((m = re.exec(text))) out.push({ date: `${m[1]}-${m[2]}-${m[3]}`, time: m[4] ? `${m[4]}:${m[5]}` : null });
  return out;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by!, bm! - 1, bd!) - Date.UTC(ay!, am! - 1, ad!)) / 86400000);
}

/** Times of day the plan has on `day` (YYYY-MM-DD): RRULE − EXDATES + RDATES. */
export function occurrencesOn(day: string, row: { startAt: unknown; rrule: unknown; exdates?: unknown; rdates?: unknown }): string[] {
  const startDate = dateOf(row.startAt);
  const r = parseRRule(row.rrule);
  let slots: string[] = [];
  if (r && startDate && daysBetween(startDate, day) >= 0 && (!r.until || day <= r.until)) {
    const diff = daysBetween(startDate, day);
    const start = new Date(`${startDate}T00:00:00Z`);
    const target = new Date(`${day}T00:00:00Z`);
    const weekStart = (date: Date) => {
      const mondayOffset = (date.getUTCDay() + 6) % 7;
      return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - mondayOffset);
    };
    let occurs = false;
    if (r.freq === "DAILY") occurs = diff % r.interval === 0;
    if (r.freq === "WEEKLY") {
      const weeks = Math.round((weekStart(target) - weekStart(start)) / (7 * 86400000));
      const startDay = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"][(start.getUTCDay() + 6) % 7];
      const targetDay = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"][(target.getUTCDay() + 6) % 7];
      occurs = weeks >= 0 && weeks % r.interval === 0 && (r.byday.length ? r.byday.includes(targetDay!) : targetDay === startDay);
    }
    if (r.freq === "MONTHLY") {
      const months = (target.getUTCFullYear() - start.getUTCFullYear()) * 12 + target.getUTCMonth() - start.getUTCMonth();
      const monthDays = r.bymonthday.length ? r.bymonthday : [start.getUTCDate()];
      occurs = months >= 0 && months % r.interval === 0 && monthDays.includes(target.getUTCDate());
    }
    if (r.freq === "YEARLY") {
      const years = target.getUTCFullYear() - start.getUTCFullYear();
      const months = r.bymonth.length ? r.bymonth : [start.getUTCMonth() + 1];
      const monthDays = r.bymonthday.length ? r.bymonthday : [start.getUTCDate()];
      occurs = years >= 0 && years % r.interval === 0 && months.includes(target.getUTCMonth() + 1) && monthDays.includes(target.getUTCDate());
    }
    if (occurs) slots = slotsFromRRule(row.rrule, row.startAt);
  }
  const ex = listDates(row.exdates).filter((d) => d.date === day);
  if (ex.some((d) => !d.time)) slots = [];
  else slots = slots.filter((s) => !ex.some((d) => d.time === s));
  listDates(row.rdates).filter((d) => d.date === day && d.time).forEach((d) => slots.push(d.time!));
  return normalizeSlots(slots);
}

export function localDay(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
