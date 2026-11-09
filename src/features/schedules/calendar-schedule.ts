/**
 * Calendar-backed schedules — CCT 187 "User's calendar event".
 *   a60 event type  b55 = Medicine schedule, b56 = Health checkin
 *   a57/a58 start/end, a66 RRULE, a68 EXDATES, a69 RDATES (RFC 5545)
 *   a73 Reminders   RFC 5545 VALARM TRIGGER
 * a90 Custom data is not used: every schedule value has a dictionary column.
 * Ownership: Relation 190 (Users → 187) — for care schedules the parent is the
 * cared one, not the author.
 */
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { T, R } from "@/integrations/wp-schema";
import { dedupeRead, fetchRelChildrenMap } from "@/features/shared/rel-batch";
import { readLinkedCCTRows } from "@/features/shared/cct-rows";
import { appScopeBody, filterAppScope } from "@/features/shared/app-scope";
import { FREQUENCY_CODES, type FrequencyCode, normalizeSlots, frequencyForSlots, buildScheduleRRule } from "./recurrence";

export const CAL = T.calendarEvent;
export const FC = CAL.f;
const OC = CAL.opt as Record<string, Record<string, string>>;

export const EVENT_TYPE = {
  MEDICINE: OC["CUSTOM_EVENT_TYPE"]!["MEDICINE_SCHEDULE"]!,
  CHECKIN: OC["CUSTOM_EVENT_TYPE"]!["HEALTH_CHECKIN"]!,
  HABIT: OC["CUSTOM_EVENT_TYPE"]!["HABIT"]!,
  TODO: OC["CUSTOM_EVENT_TYPE"]!["TODO"]!,
} as const;

export const STATUS_CONFIRMED = OC["STATUS"]!["CONFIRMED"]!;
export const STATUS_CANCELLED = OC["STATUS"]!["CANCELLED"]!;
// CCT 187 a91 is the app-scope radio. Writes use its dictionary option code;
// reads also accept older lowercase app names through filterAppScope().
export const CALENDAR_APP_SCOPE = () => appScopeBody("calendarEvent");
// Both schedule types share the CCT 187 a96 multi-select checkbox.
export const LOG_TYPE_AI = OC["MEDICINE_LOG_TYPE"]!["AI"]!;
export const LOG_TYPE_HUMAN = OC["MEDICINE_LOG_TYPE"]!["HUMAN"]!;

export const REL_USER_EVENT = R.userCalendarEvents; // 190 Users → 187
export const REL_SCHEDULE_ASSIGNEES = R.checkinScheduleAssignees; // 262 CCT187 → Users
export const REL_SCHEDULE_NOTIFICATION_RECEIVERS = R.checkinNotificationReceivers; // 260 CCT187 → Users

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

export async function fetchSchedulePeople(relationId: number, scheduleId: string): Promise<string[]> {
  const id = numId(scheduleId);
  const rows = await wordpressFetch<any[]>(`jet-rel/${relationId}/children/${id}`);
  return Array.isArray(rows) ? rows.map((row: any) => String(row.child_object_id)).filter(Boolean) : [];
}

export async function setSchedulePeople(relationId: number, scheduleId: string, userIds: Array<string | number>): Promise<void> {
  const parentId = numId(scheduleId);
  if (!parentId) throw new Error("Invalid calendar schedule");
  const ids = userIds.map((value) => numId(value)).filter(Boolean);
  const body = { parent_id: parentId, child_id: ids, context: "parent", store_items_type: "replace" };
  try {
    await wordpressFetch(`jet-rel/${relationId}`, { method: "POST", body });
  } catch (error: any) {
    if (!/40[13]/.test(String(error?.message || error))) throw error;
    const { wpAdminOps } = await import("@/services/woocommerce-api");
    const result: any = await wpAdminOps("set_relation", {
      relation_id: relationId, parent_id: parentId, child_ids: ids, context: "parent", store_items_type: "replace",
    });
    if (!result?.ok) throw new Error(result?.error || "Could not save schedule people");
  }
}

export async function fetchScheduleNotificationReceiverMap(
  scheduleIds: readonly (string | number)[],
): Promise<Map<string, string[]>> {
  const ids = [...new Set(scheduleIds.map(numId).filter((id) => Number.isInteger(id) && id > 0).map(String))];
  const result = new Map<string, string[]>();
  if (!ids.length) return result;

  const relation = await fetchRelChildrenMap(REL_SCHEDULE_NOTIFICATION_RECEIVERS);
  if (relation.loaded) {
    ids.forEach((id) => {
      result.set(
        id,
        [...new Set((relation.get(id) || []).map((row) => String(numId(row.childId))).filter(Boolean))],
      );
    });
    return result;
  }

  const rows = await Promise.all(ids.map(async (id) => {
    const relationRows = await wordpressFetch<any[]>(`jet-rel/${REL_SCHEDULE_NOTIFICATION_RECEIVERS}/children/${id}`);
    const receiverIds = Array.isArray(relationRows)
      ? [...new Set(relationRows.map((row: any) => String(numId(row?.child_object_id))).filter(Boolean))]
      : [];
    return [id, receiverIds] as const;
  }));
  rows.forEach(([id, receiverIds]) => result.set(id, receiverIds));
  return result;
}

export async function fetchCommonScheduleNotificationReceiverIds(
  scheduleIds: readonly (string | number)[],
): Promise<string[]> {
  const ids = [...new Set(scheduleIds.map(numId).filter((id) => Number.isInteger(id) && id > 0).map(String))];
  if (!ids.length) return [];
  const receiverMap = await fetchScheduleNotificationReceiverMap(ids);
  const first = receiverMap.get(ids[0]!) || [];
  return first.filter((receiverId) =>
    ids.every((scheduleId) =>
      (receiverMap.get(scheduleId) || []).some((candidate) => numId(candidate) === numId(receiverId)),
    ),
  );
}

export async function setScheduleNotificationReceiverSubscription(
  scheduleIds: readonly (string | number)[],
  receiverId: string | number,
  receives: boolean,
): Promise<void> {
  const userId = numId(receiverId);
  if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid notification receiver");
  const receiver = String(userId);
  const receiverMap = await fetchScheduleNotificationReceiverMap(scheduleIds);
  await Promise.all([...receiverMap.entries()].map(([scheduleId, currentIds]) => {
    const hasReceiver = currentIds.some((id) => numId(id) === userId);
    if (receives === hasReceiver) return Promise.resolve();
    const nextIds = receives
      ? [...new Set([...currentIds, receiver])]
      : currentIds.filter((id) => numId(id) !== userId);
    return setSchedulePeople(REL_SCHEDULE_NOTIFICATION_RECEIVERS, scheduleId, nextIds);
  }));
}

// ─── Frequency ⇄ RRULE (RFC 5545 columns only, see recurrence.ts) ───
export {
  FREQUENCY_CODES, type FrequencyCode, buildRRule, slotsFromRRule, frequencyFromRow,
  frequencyForSlots, normalizeSlots, occurrencesOn, localDay, parseRRule, dateOf,
} from "./recurrence";

export const FREQ_EN: Record<FrequencyCode, string> = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  three_daily: "Three times daily",
  four_daily: "Four times daily",
  every_other_day: "Every other day",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  daily: "Every few days",
  as_needed: "As needed",
};

export function toFrequencyCode(value?: string | undefined): FrequencyCode {
  const v = String(value || "once_daily");
  if ((FREQUENCY_CODES as readonly string[]).includes(v)) return v as FrequencyCode;
  const hit = (Object.keys(FREQ_EN) as FrequencyCode[]).find(
    (k) => FREQ_EN[k].toLowerCase() === v.toLowerCase());
  return hit || "once_daily";
}

/** Reminder minutes-before ⇄ VALARM TRIGGER (a73). */
export function buildReminders(minutesBefore?: number | null | undefined): string {
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

/** a57 (and a58, a dose being an instant) for a start date and the first time. */
export function startAtFor(startDate: string, slots: readonly string[]): string {
  return slots[0] ? `${startDate} ${slots[0]}:00` : `${startDate} 00:00:00`;
}

/** Both care schedule types use exactly the same dictionary time columns.
 * Exception dates a68/a69 are untouched by an ordinary time edit; a70 is not
 * an ordinary plan field. Never write a90 or a duplicate recurrence payload.
 */
export function scheduleTimeColumns(frequency: string | undefined, times: readonly unknown[], startDate: string, endDate?: string | null, interval = 1, weekdays: readonly string[] = []) {
  const slots = normalizeSlots(times);
  const freq = frequencyForSlots(toFrequencyCode(frequency), slots);
  const startAt = startAtFor(startDate, slots);
  return {
    [FC.START_AT]: startAt,
    [FC.END_AT]: startAt,
    [FC.ALL_DAY]: OC["ALL_DAY"]!["NO"]!,
    [FC.RRULE]: buildScheduleRRule(freq, slots, startDate, endDate, interval, weekdays),
  };
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
  const rows = await readLinkedCCTRows(CAL.slug, ids);
  const rowsById = new Map(
    rows.map((row) => [String(row?.id ?? row?._ID), row]),
  );
  return filterAppScope("calendarEvent", ids
    .map((id) => rowsById.get(id))
    .filter(
      (row) =>
        row &&
        typeof row === "object" &&
        String(row[FC.CUSTOM_EVENT_TYPE]) === eventType,
    ));
}

export async function createEvent(body: Record<string, any>, ownerId: string | number): Promise<number> {
  const created = await wordpressCCTFetch<any>(CAL.slug, { method: "POST", body: { ...body, ...CALENDAR_APP_SCOPE() } });
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

/** Read one event so a partial update keeps its existing recurrence. */
export async function readEvent(id: string): Promise<any> {
  return wordpressCCTFetch<any>(CAL.slug, { id });
}
