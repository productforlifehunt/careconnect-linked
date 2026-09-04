/**
 * Calendar-backed schedules — CCT 187 "User's calendar event".
 *
 * The data bible (2026-09-04) removed CCT 205 (medicine schedule) and CCT 207
 * (checkin schedule). Both now live in the universal calendar event table:
 *   a60 event type  b55 = Medicine schedule, b56 = Health checkin
 *   a66 RRULE       RFC 5545 recurrence (frequency + times of day)
 *   a73 Reminders   RFC 5545 VALARM TRIGGER (the "remind X minutes before")
 *   a90 Custom data our own JSON blob column, for values the calendar has no
 *                   dedicated Apple/iCal column for (exact time slots, the UI
 *                   frequency code, instructions, side effects, missing window)
 * Ownership: Relation 190 (Users → 187) — for care schedules the parent is the
 * cared one, not the author.
 */
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { T, R } from "@/integrations/wp-schema";
import { dedupeRead } from "@/features/shared/rel-batch";

export const CAL = T.calendarEvent;
export const FC = CAL.f;
const OC = CAL.opt as Record<string, Record<string, string>>;

export const EVENT_TYPE = {
  MEDICINE: OC.CUSTOM_EVENT_TYPE.MEDICINE_SCHEDULE,
  CHECKIN: OC.CUSTOM_EVENT_TYPE.HEALTH_CHECKIN,
  HABIT: OC.CUSTOM_EVENT_TYPE.HABIT,
  TODO: OC.CUSTOM_EVENT_TYPE.TODO,
} as const;

export const STATUS_CONFIRMED = OC.STATUS.CONFIRMED;
export const STATUS_CANCELLED = OC.STATUS.CANCELLED;
export const APP_CHALLENGED = OC.APP.CHALLENGED;
export const LOG_TYPE_AI = OC.MEDICINE_LOG_TYPE.AI;
export const LOG_TYPE_HUMAN = OC.MEDICINE_LOG_TYPE.HUMAN;

export const REL_USER_EVENT = R.userCalendarEvents; // 190 Users → 187

export const numId = (v: any): number => Number(String(v ?? "").replace(/^wp-/, ""));
export const wpStr = (v: any): string => (v === null || v === undefined || v === "" ? "" : String(v));
export const numOrNull = (v: any): number | null =>
  v === null || v === undefined || v === "" ? null : Number.isFinite(Number(v)) ? Number(v) : null;

export async function linkRel(relId: number, parentId: number, childId: number): Promise<void> {
  await wordpressFetch(`jet-rel/${relId}`, {
    method: "POST",
    body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
  });
}

// ─── Frequency ⇄ RRULE ───────────────────────────────────────
export const FREQUENCY_CODES = [
  "once_daily", "twice_daily", "three_daily", "four_daily",
  "every_other_day", "weekly", "as_needed",
] as const;
export type FrequencyCode = (typeof FREQUENCY_CODES)[number];

export const FREQ_EN: Record<FrequencyCode, string> = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  three_daily: "Three times daily",
  four_daily: "Four times daily",
  every_other_day: "Every other day",
  weekly: "Weekly",
  as_needed: "As needed",
};

export function toFrequencyCode(value?: string): FrequencyCode {
  const v = String(value || "once_daily");
  if ((FREQUENCY_CODES as readonly string[]).includes(v)) return v as FrequencyCode;
  const hit = (Object.keys(FREQ_EN) as FrequencyCode[]).find(
    (k) => FREQ_EN[k].toLowerCase() === v.toLowerCase());
  return hit || "once_daily";
}

/** RFC 5545 RRULE for a frequency code + the times of day it runs at. */
export function buildRRule(freq: FrequencyCode, slots: string[]): string {
  if (freq === "as_needed") return "";
  const hours = slots.map((s) => Number(String(s).slice(0, 2))).filter((n) => Number.isFinite(n));
  const minutes = slots.map((s) => Number(String(s).slice(3, 5))).filter((n) => Number.isFinite(n));
  const parts: string[] = [];
  if (freq === "weekly") parts.push("FREQ=WEEKLY", "INTERVAL=1");
  else parts.push("FREQ=DAILY", `INTERVAL=${freq === "every_other_day" ? 2 : 1}`);
  if (hours.length) parts.push(`BYHOUR=${[...new Set(hours)].join(",")}`);
  if (minutes.length) parts.push(`BYMINUTE=${[...new Set(minutes)].join(",")}`);
  return parts.join(";");
}

/** Reminder minutes-before ⇄ VALARM TRIGGER. */
export function buildReminders(minutesBefore?: number | null): string {
  const m = Number(minutesBefore);
  if (!Number.isFinite(m) || m <= 0) return "";
  return `BEGIN:VALARM\nTRIGGER:-PT${Math.round(m)}M\nACTION:DISPLAY\nEND:VALARM`;
}
export function readReminderMinutes(raw: any): number | null {
  const m = String(raw ?? "").match(/TRIGGER:-PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!m) return null;
  const mins = (Number(m[1] || 0) * 60) + Number(m[2] || 0);
  return mins > 0 ? mins : null;
}

// ─── Time slots ──────────────────────────────────────────────
export function decodeSlots(raw: any): string[] {
  if (Array.isArray(raw)) return raw.map((s) => String(s).slice(0, 5)).filter(Boolean);
  return String(raw ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => /^\d{1,2}:\d{2}$/.test(s))
    .map((s) => (s.length === 4 ? `0${s}` : s));
}

// ─── a90 Custom data (our own JSON column) ───────────────────
export type CustomData = Record<string, any>;
export function readCustom(raw: any): CustomData {
  if (!raw) return {};
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch { return {}; }
}
export function writeCustom(data: CustomData): string {
  const clean: CustomData = {};
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) return;
    clean[k] = v;
  });
  return Object.keys(clean).length ? JSON.stringify(clean) : "";
}

// ─── Reads ───────────────────────────────────────────────────
/** All calendar events of one user (Relation 190) filtered by a60 event type. */
export async function fetchEventsOfType(userId: string | number, eventType: string): Promise<any[]> {
  const uid = numId(userId);
  if (!uid) return [];
  const rels = await dedupeRead(`rel-children-raw:${REL_USER_EVENT}:${uid}`, () =>
    wordpressFetch<any[]>(`jet-rel/${REL_USER_EVENT}/children/${uid}`));
  const ids = (Array.isArray(rels) ? rels : [])
    .map((r: any) => String(r?.child_object_id ?? "").replace(/^wp-/, ""))
    .filter(Boolean);
  if (!ids.length) return [];
  const rows = await Promise.all(ids.map((id) =>
    dedupeRead(`cct:${CAL.slug}:${id}`, () => wordpressCCTFetch<any>(CAL.slug, { id }))));
  return rows.filter((r: any) => r && typeof r === "object" && String(r[FC.CUSTOM_EVENT_TYPE]) === eventType);
}

export async function createEvent(body: Record<string, any>, ownerId: string | number): Promise<number> {
  const created = await wordpressCCTFetch<any>(CAL.slug, { method: "POST", body });
  const newId = numId(created?.item_id || created?._ID || created?.id);
  if (!newId) throw new Error("Schedule was not saved");
  await linkRel(REL_USER_EVENT, numId(ownerId), newId);
  return newId;
}

export async function updateEvent(id: string, body: Record<string, any>): Promise<void> {
  if (!Object.keys(body).length) return;
  await wordpressCCTFetch(CAL.slug, { id, method: "PUT", body });
}

export async function deleteEvent(id: string): Promise<void> {
  await wordpressCCTFetch(CAL.slug, { id, method: "DELETE" });
}

/** Read one event so a partial update can merge into the a90 JSON blob. */
export async function readEvent(id: string): Promise<any> {
  return wordpressCCTFetch<any>(CAL.slug, { id });
}
