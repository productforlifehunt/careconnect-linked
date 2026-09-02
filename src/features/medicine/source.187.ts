/**
 * Medicine schedules & logs — Bible-aligned storage
 *
 * SCHEDULE  → JetEngine CCT 187 `users_calendar_event`, rows where
 *             a60 (Custom event type) = b55 "Medicine schedule".
 *             Linked to the cared one through JetEngine Relation 190
 *             (Users → 187). Relation 237 is NOT used any more: a medicine
 *             schedule IS a calendar event, so the user link already exists.
 * LOG       → JetEngine CCT 206 `medicine_log`, one row per dose event,
 *             field-for-field mirror of Apple HKMedicationDoseEvent.
 *             Linked to its schedule through JetEngine Relation 238 (187 → 206).
 *
 * Everything recurrence-related is written as RFC 5545 (RRULE / VALARM) so an
 * Apple / Google calendar sync is a straight hand-off with zero migration.
 */
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { T, R } from "@/integrations/wp-schema";
import { appScopeBody, isInAppScope } from "@/features/shared/app-scope";
import { dedupeRead, fetchRelChildrenMap } from "@/features/shared/rel-batch";

const EV = T.calendarEvent;          // 187
const LOG = T.medicineLog;           // 206
const F = EV.f;
const O = EV.opt as Record<string, Record<string, string>>;
const FL = LOG.f;
const OL = LOG.opt as Record<string, Record<string, string>>;

const REL_USER_EVENT = R.userCalendarEvents;      // 190 Users → 187
const REL_SCHEDULE_LOG = R.medicineScheduleLogs;  // 238 187 → 206

const MED_TYPE = O.CUSTOM_EVENT_TYPE.MEDICINE_SCHEDULE;   // b55
const RXNORM_SYSTEM = "http://www.nlm.nih.gov/research/umls/rxnorm";

const numId = (v: any): number => Number(String(v ?? "").replace(/^wp-/, ""));
/** JetEngine REST rejects non-string scalars (rest_invalid_type). */
const wpStr = (v: any): string => (v === null || v === undefined || v === "" ? "" : String(v));
const numOrNull = (v: any): number | null =>
  v === null || v === undefined || v === "" ? null : Number.isFinite(Number(v)) ? Number(v) : null;

async function linkRel(relId: number, parentId: number, childId: number): Promise<void> {
  await wordpressFetch(`jet-rel/${relId}`, {
    method: "POST",
    body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
  });
}

// ─── Frequency ⇄ RFC 5545 RRULE ──────────────────────────────
export const MED_FREQUENCY_CODES = [
  "once_daily", "twice_daily", "three_daily", "four_daily",
  "every_other_day", "weekly", "as_needed",
] as const;
export type MedFrequencyCode = (typeof MED_FREQUENCY_CODES)[number];

const FREQ_EN: Record<MedFrequencyCode, string> = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  three_daily: "Three times daily",
  four_daily: "Four times daily",
  every_other_day: "Every other day",
  weekly: "Weekly",
  as_needed: "As needed",
};

function pad(n: number): string { return String(n).padStart(2, "0"); }

function slotsToByHourMinute(slots: string[]): string {
  const hours: string[] = [];
  const minutes: string[] = [];
  slots.forEach((s) => {
    const [h = "8", m = "0"] = String(s).split(":");
    if (!hours.includes(String(Number(h)))) hours.push(String(Number(h)));
    if (!minutes.includes(String(Number(m)))) minutes.push(String(Number(m)));
  });
  if (hours.length === 0) return "";
  let out = `BYHOUR=${hours.join(",")}`;
  out += `;BYMINUTE=${(minutes.length ? minutes : ["0"]).join(",")}`;
  return out;
}

/** Build the RFC 5545 RRULE for a schedule. Empty string for as-needed (PRN). */
export function buildRRule(frequency: MedFrequencyCode, slots: string[], endDate?: string | null): string {
  if (frequency === "as_needed") return "";
  const parts: string[] = [];
  if (frequency === "weekly") parts.push("FREQ=WEEKLY");
  else if (frequency === "every_other_day") parts.push("FREQ=DAILY", "INTERVAL=2");
  else parts.push("FREQ=DAILY");
  const byTime = slotsToByHourMinute(slots);
  if (byTime) parts.push(byTime);
  if (endDate) {
    const d = String(endDate).slice(0, 10).replace(/-/g, "");
    if (d.length === 8) parts.push(`UNTIL=${d}T235959Z`);
  }
  return parts.join(";");
}

function parseRRule(rrule: string): Record<string, string> {
  const out: Record<string, string> = {};
  String(rrule || "")
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((p) => {
      const [k, v = ""] = p.split("=");
      out[k.toUpperCase()] = v;
    });
  return out;
}

function rruleToSlots(rrule: string, startAt: string): string[] {
  const r = parseRRule(rrule);
  if (r.BYHOUR) {
    const minutes = (r.BYMINUTE || "0").split(",").map((m) => Number(m) || 0);
    return r.BYHOUR.split(",").map((h, i) => `${pad(Number(h) || 0)}:${pad(minutes[i] ?? minutes[0] ?? 0)}`);
  }
  const t = String(startAt || "").match(/(\d{2}):(\d{2})/);
  return t ? [`${t[1]}:${t[2]}`] : [];
}

function rruleToFrequency(rrule: string, scheduleType: string | null | undefined, slotCount: number): MedFrequencyCode {
  if (!rrule) return "as_needed";
  if (scheduleType === O.MEDICATION_SCHEDULE_TYPE.AS_NEEDED) return "as_needed";
  const r = parseRRule(rrule);
  if (r.FREQ === "WEEKLY") return "weekly";
  if (r.INTERVAL === "2") return "every_other_day";
  if (slotCount >= 4) return "four_daily";
  if (slotCount === 3) return "three_daily";
  if (slotCount === 2) return "twice_daily";
  return "once_daily";
}

function rruleUntil(rrule: string): string | null {
  const until = parseRRule(rrule).UNTIL;
  if (!until || until.length < 8) return null;
  return `${until.slice(0, 4)}-${until.slice(4, 6)}-${until.slice(6, 8)}`;
}

// ─── Reminders ⇄ RFC 5545 VALARM ─────────────────────────────
export function buildValarm(minutesBefore?: number | null): string {
  const m = Number(minutesBefore ?? 0);
  if (!Number.isFinite(m) || m <= 0) return "";
  return `BEGIN:VALARM\nACTION:DISPLAY\nTRIGGER:-PT${Math.round(m)}M\nEND:VALARM`;
}

export function valarmMinutes(valarm: string): number | null {
  const m = String(valarm || "").match(/TRIGGER:-PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!m) return null;
  return (Number(m[1] || 0) * 60) + Number(m[2] || 0) || null;
}

// ─── Dosage text ⇄ quantity + UCUM unit ──────────────────────
/** "1 tablet" / "10 mg" / "2 {tbl}" → { quantity, unit } */
export function splitDosage(dosage?: string | null): { quantity: number | null; unit: string } {
  const raw = String(dosage ?? "").trim();
  if (!raw) return { quantity: null, unit: "" };
  const m = raw.match(/^([\d.]+)\s*(.*)$/);
  if (!m) return { quantity: null, unit: raw };
  return { quantity: Number(m[1]), unit: (m[2] || "").trim() };
}

export function joinDosage(quantity: number | null, unit: string): string {
  if (quantity == null && !unit) return "";
  if (quantity == null) return unit;
  return unit ? `${quantity} ${unit}` : String(quantity);
}

// ─── Fields with no dedicated column in CCT 187 ──────────────
// The Bible's 187 has no columns for pharmacy-side data (stock, refill limit,
// caregiver escalation timers, prescriber, pharmacy, side effects). They are
// written to a90 "Custom data" with named keys until dedicated columns exist.
const EXTRA_KEYS = [
  "stock_count", "refill_threshold", "time_to_send_to_caregiver",
  "time_to_be_considered_missing", "prescribing_doctor", "pharmacy", "side_effects",
] as const;

function encodeExtras(src: Record<string, any>, previous: Record<string, any> = {}): string {
  const obj: Record<string, any> = { ...previous };
  EXTRA_KEYS.forEach((k) => { if (src[k] !== undefined) obj[k] = src[k]; });
  Object.keys(obj).forEach((k) => { if (obj[k] === undefined || obj[k] === null || obj[k] === "") delete obj[k]; });
  return Object.keys(obj).length ? JSON.stringify(obj) : "";
}

function decodeExtras(raw: any): Record<string, any> {
  if (!raw) return {};
  try { const o = JSON.parse(String(raw)); return o && typeof o === "object" ? o : {}; } catch { return {}; }
}

// ─── Schedule reads ──────────────────────────────────────────
function mapSchedule(row: any, caredOneId: string): any {
  const rrule = String(row[F.RRULE] || "");
  const slots = rruleToSlots(rrule, row[F.START_AT]);
  const freqCode = rruleToFrequency(rrule, row[F.MEDICATION_SCHEDULE_TYPE], slots.length);
  const extras = decodeExtras(row[F.CUSTOM_DATA]);
  return {
    id: String(row.id || row._ID),
    user_id: caredOneId,
    name: row[F.TITLE] || "Medicine",
    dosage: joinDosage(numOrNull(row[F.MEDICATION_DOSE_QUANTITY]), row[F.MEDICATION_DOSE_UNIT] || ""),
    dose_quantity: numOrNull(row[F.MEDICATION_DOSE_QUANTITY]),
    dose_unit: row[F.MEDICATION_DOSE_UNIT] || "",
    medication_concept_identifier: row[F.MEDICATION_CONCEPT_IDENTIFIER] || null,
    schedule_type: row[F.MEDICATION_SCHEDULE_TYPE] || null,
    frequency_code: freqCode,
    frequency: FREQ_EN[freqCode],
    rrule,
    time_slot: slots,
    instructions: row[F.AVAILABILITY_NOTE] || null,
    note: row[F.DESCRIPTION] || null,
    start_date: row[F.START_AT] ? String(row[F.START_AT]).slice(0, 10) : null,
    end_date: rruleUntil(rrule),
    is_active: String(row[F.STATUS] || O.STATUS.CONFIRMED) !== O.STATUS.CANCELLED,
    reminder_time_before: valarmMinutes(row[F.REMINDERS]),
    stock_count: numOrNull(extras.stock_count),
    refill_threshold: numOrNull(extras.refill_threshold),
    time_to_send_to_caregiver: numOrNull(extras.time_to_send_to_caregiver),
    time_to_be_considered_missing: numOrNull(extras.time_to_be_considered_missing),
    prescribing_doctor: extras.prescribing_doctor || null,
    pharmacy: extras.pharmacy || null,
    side_effects: extras.side_effects || null,
    check_in_type: [] as string[],
    created_at: row.cct_created || row.created_at,
    _raw_extras: extras,
  };
}

async function fetchScheduleRows(caredOneId: string): Promise<any[]> {
  const userId = numId(caredOneId);
  if (!userId) return [];
  const rels = await dedupeRead(`rel-children-raw:${REL_USER_EVENT}:${userId}`, () =>
    wordpressFetch<any[]>(`jet-rel/${REL_USER_EVENT}/children/${userId}`));
  const ids = (Array.isArray(rels) ? rels : [])
    .map((r: any) => String(r?.child_object_id ?? "").replace(/^wp-/, ""))
    .filter(Boolean);
  if (ids.length === 0) return [];
  const rows = await Promise.all(ids.map((id) =>
    dedupeRead(`cct:${EV.slug}:${id}`, () => wordpressCCTFetch<any>(EV.slug, { id })).catch(() => null)));
  return rows.filter((r: any) =>
    r && String(r[F.CUSTOM_EVENT_TYPE]) === MED_TYPE && isInAppScope("calendarEvent", r));
}

export async function fetchMedicinesWordPress(caredOneId: string): Promise<any[]> {
  const rows = await fetchScheduleRows(caredOneId);
  return rows.map((r) => mapSchedule(r, caredOneId));
}

// ─── Schedule writes ─────────────────────────────────────────
export interface MedicineInput {
  user_id: string;
  name: string;
  dosage?: string;
  dose_quantity?: number | null;
  dose_unit?: string;
  medication_concept_identifier?: string | null;
  frequency?: string;          // code or English label
  time_slot?: string[];
  instructions?: string;
  note?: string;
  start_date?: string;
  end_date?: string;
  stock_count?: number;
  refill_threshold?: number;
  reminder_time_before?: number;
  time_to_send_to_caregiver?: number;
  time_to_be_considered_missing?: number;
  prescribing_doctor?: string;
  pharmacy?: string;
  side_effects?: string;
}

function toFrequencyCode(value?: string): MedFrequencyCode {
  const v = String(value || "once_daily");
  if ((MED_FREQUENCY_CODES as readonly string[]).includes(v)) return v as MedFrequencyCode;
  const hit = (Object.keys(FREQ_EN) as MedFrequencyCode[]).find((k) => FREQ_EN[k].toLowerCase() === v.toLowerCase());
  return hit || "once_daily";
}

function firstSlot(slots?: string[]): string {
  const s = (slots || []).filter(Boolean);
  return s.length ? String(s[0]).slice(0, 5) : "08:00";
}

export async function createMedicineWordPress(med: MedicineInput): Promise<void> {
  const freq = toFrequencyCode(med.frequency);
  const slots = (med.time_slot || []).length ? med.time_slot! : ["08:00"];
  const dose = med.dose_quantity != null || med.dose_unit
    ? { quantity: med.dose_quantity ?? null, unit: med.dose_unit || "" }
    : splitDosage(med.dosage);
  const day = (med.start_date || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const startAt = `${day} ${firstSlot(slots)}:00`;

  const body: Record<string, any> = {
    [F.TITLE]: med.name,
    [F.DESCRIPTION]: med.note || "",
    [F.START_AT]: startAt,
    [F.END_AT]: startAt,
    [F.ALL_DAY]: O.ALL_DAY.NO,
    [F.CUSTOM_EVENT_TYPE]: MED_TYPE,
    [F.STATUS]: O.STATUS.CONFIRMED,
    [F.PRIORITY]: "5",
    [F.RRULE]: buildRRule(freq, slots, med.end_date),
    [F.REMINDERS]: buildValarm(med.reminder_time_before),
    [F.IS_AVAILABILITY]: O.IS_AVAILABILITY.NO,
    [F.AVAILABILITY_NOTE]: med.instructions || "",
    [F.EXTERNAL_SOURCE]: O.EXTERNAL_SOURCE.INTERNAL,
    [F.MEDICATION_CONCEPT_IDENTIFIER]: med.medication_concept_identifier || "",
    [F.MEDICATION_DOSE_QUANTITY]: wpStr(dose.quantity),
    [F.MEDICATION_DOSE_UNIT]: dose.unit || "",
    [F.MEDICATION_SCHEDULE_TYPE]: freq === "as_needed"
      ? O.MEDICATION_SCHEDULE_TYPE.AS_NEEDED
      : O.MEDICATION_SCHEDULE_TYPE.SCHEDULE,
    [F.MEDICINE_LOG_TYPE]: O.MEDICINE_LOG_TYPE.HUMAN,
    [F.CUSTOM_DATA]: encodeExtras(med as any),
    ...appScopeBody("calendarEvent"),
  };
  const created = await wordpressCCTFetch<any>(EV.slug, { method: "POST", body });
  const newId = numId(created?.item_id || created?._ID || created?.id);
  if (newId) await linkRel(REL_USER_EVENT, numId(med.user_id), newId);
}

export async function updateMedicineWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const current = await wordpressCCTFetch<any>(EV.slug, { id });
  const body: Record<string, any> = {};

  if (updates.name !== undefined) body[F.TITLE] = updates.name;
  if (updates.note !== undefined || updates.notes !== undefined) body[F.DESCRIPTION] = updates.note ?? updates.notes;
  if (updates.instructions !== undefined) body[F.AVAILABILITY_NOTE] = updates.instructions;
  if (updates.is_active !== undefined) body[F.STATUS] = updates.is_active ? O.STATUS.CONFIRMED : O.STATUS.CANCELLED;
  if (updates.reminder_time_before !== undefined) body[F.REMINDERS] = buildValarm(updates.reminder_time_before);

  if (updates.dosage !== undefined || updates.dose_quantity !== undefined || updates.dose_unit !== undefined) {
    const dose = updates.dose_quantity !== undefined || updates.dose_unit !== undefined
      ? { quantity: updates.dose_quantity ?? null, unit: updates.dose_unit || "" }
      : splitDosage(updates.dosage);
    body[F.MEDICATION_DOSE_QUANTITY] = wpStr(dose.quantity);
    body[F.MEDICATION_DOSE_UNIT] = dose.unit || "";
  }
  if (updates.medication_concept_identifier !== undefined) {
    body[F.MEDICATION_CONCEPT_IDENTIFIER] = updates.medication_concept_identifier || "";
  }

  const needsRecurrence =
    updates.frequency !== undefined || updates.time_slot !== undefined ||
    updates.end_date !== undefined || updates.start_date !== undefined;
  if (needsRecurrence) {
    const existing = mapSchedule({ ...current, id }, "");
    const freq = updates.frequency !== undefined ? toFrequencyCode(updates.frequency) : existing.frequency_code;
    const slots = updates.time_slot !== undefined
      ? (updates.time_slot.length ? updates.time_slot : ["08:00"])
      : (existing.time_slot.length ? existing.time_slot : ["08:00"]);
    const endDate = updates.end_date !== undefined ? updates.end_date : existing.end_date;
    const day = (updates.start_date ?? existing.start_date ?? new Date().toISOString().slice(0, 10)).slice(0, 10);
    body[F.RRULE] = buildRRule(freq, slots, endDate);
    body[F.START_AT] = `${day} ${firstSlot(slots)}:00`;
    body[F.END_AT] = body[F.START_AT];
    body[F.MEDICATION_SCHEDULE_TYPE] = freq === "as_needed"
      ? O.MEDICATION_SCHEDULE_TYPE.AS_NEEDED
      : O.MEDICATION_SCHEDULE_TYPE.SCHEDULE;
  }

  const touchesExtras = EXTRA_KEYS.some((k) => updates[k] !== undefined);
  if (touchesExtras) body[F.CUSTOM_DATA] = encodeExtras(updates, decodeExtras(current?.[F.CUSTOM_DATA]));

  if (Object.keys(body).length === 0) return;
  await wordpressCCTFetch(EV.slug, { id, method: "PUT", body });
}

export async function deleteMedicineWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(EV.slug, { id, method: "DELETE" });
}

// ─── Logs (CCT 206, Apple HKMedicationDoseEvent) ─────────────
/** UI status → Apple LogStatus code. "missed" = notInteracted (Apple has no missed). */
const LOG_STATUS_CODE: Record<string, string> = {
  taken: OL.DOSE_EVENT_LOG_STATUS.TAKEN,
  skipped: OL.DOSE_EVENT_LOG_STATUS.SKIPPED,
  missed: OL.DOSE_EVENT_LOG_STATUS.NOT_INTERACTED,
  snoozed: OL.DOSE_EVENT_LOG_STATUS.SNOOZED,
  not_logged: OL.DOSE_EVENT_LOG_STATUS.NOT_LOGGED,
  notification_not_sent: OL.DOSE_EVENT_LOG_STATUS.NOTIFICATION_NOT_SENT,
};
const LOG_STATUS_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(LOG_STATUS_CODE).map(([k, v]) => [v, k]),
);

function mapLog(row: any, medicineId: string, fallbackId?: string): any {
  const at = row[FL.DOSE_LOGGED_TIME] || row.cct_created || row.created_at;
  return {
    id: String(row.id || row._ID || fallbackId),
    medicine_id: medicineId,
    status: LOG_STATUS_LABEL[String(row[FL.DOSE_EVENT_LOG_STATUS] || "")] || "taken",
    note: row[FL.DOSE_EVENT_NOTE] || null,
    notes: row[FL.DOSE_EVENT_NOTE] || null,
    dose_quantity: numOrNull(row[FL.DOSE_QUANTITY]),
    scheduled_dose_quantity: numOrNull(row[FL.SCHEDULED_DOSE_QUANTITY]),
    dose_unit: row[FL.DOSE_UNIT] || null,
    scheduled_date: row[FL.SCHEDULED_DATE] || null,
    schedule_type: row[FL.SCHEDULE_TYPE] || null,
    concept_identifier: row[FL.CONCEPT_IDENTIFIER] || null,
    concept_display_text: row[FL.CONCEPT_DISPLAY_TEXT] || null,
    concept_general_form: row[FL.CONCEPT_GENERAL_FORM] || null,
    rxcui: row[FL.CLINICAL_CODING_CODE] || null,
    taken_at: at,
    created_at: at,
    logged_by: row.cct_author_id || null,
  };
}

export async function fetchMedicineLogsWordPress(medicineId: string): Promise<any[]> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_SCHEDULE_LOG}/children/${numId(medicineId)}`);
  const ids = (Array.isArray(rels) ? rels : [])
    .map((r: any) => String(r?.child_object_id ?? "").replace(/^wp-/, ""))
    .filter(Boolean);
  const rows = await Promise.all(ids.map((id) =>
    wordpressCCTFetch<any>(LOG.slug, { id }).then((r) => mapLog(r, medicineId, id)).catch(() => null)));
  return (rows.filter(Boolean) as any[]).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function fetchTodayMedicineLogsWordPress(caredOneId: string): Promise<any[]> {
  const [rows, logMap] = await Promise.all([
    fetchScheduleRows(caredOneId),
    fetchRelChildrenMap(REL_SCHEDULE_LOG),
  ]);
  if (rows.length === 0) return [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const out: any[] = [];
  await Promise.all(rows.map(async (row: any) => {
    const mid = String(row.id || row._ID);
    const logs = logMap.loaded
      ? (await Promise.all((logMap.get(mid) || []).map(async (c) => {
          try {
            const l = await wordpressCCTFetch<any>(LOG.slug, { id: c.childId });
            return mapLog(l, mid, c.childId);
          } catch { return null; }
        }))).filter(Boolean) as any[]
      : await fetchMedicineLogsWordPress(mid);
    logs.forEach((l) => { if (l.created_at && new Date(l.created_at) >= today) out.push(l); });
  }));
  return out;
}

export interface MedicineLogInput {
  medicine_id: string;
  status?: string;
  note?: string;
  user_id?: string;
  /** Apple-aligned dose context, taken from the schedule row. */
  dose_quantity?: number | null;
  scheduled_dose_quantity?: number | null;
  dose_unit?: string | null;
  scheduled_date?: string | null;
  schedule_type?: string | null;
  concept_identifier?: string | null;
  concept_display_text?: string | null;
  concept_general_form?: string | null;
  rxcui?: string | null;
}

export async function logMedicineWordPress(log: MedicineLogInput): Promise<void> {
  const status = LOG_STATUS_CODE[String(log.status || "taken").toLowerCase()] || LOG_STATUS_CODE.taken;
  const now = new Date();
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const body: Record<string, any> = {
    [FL.DOSE_EVENT_LOG_STATUS]: status,
    [FL.DOSE_EVENT_NOTE]: log.note || "",
    [FL.DOSE_QUANTITY]: log.status === "taken" ? wpStr(log.dose_quantity ?? log.scheduled_dose_quantity) : "",
    [FL.SCHEDULED_DOSE_QUANTITY]: wpStr(log.scheduled_dose_quantity),
    [FL.DOSE_UNIT]: log.dose_unit || "",
    [FL.SCHEDULED_DATE]: log.scheduled_date || stamp,
    [FL.SCHEDULE_TYPE]: log.schedule_type || OL.SCHEDULE_TYPE.SCHEDULE,
    [FL.CONCEPT_IDENTIFIER]: log.concept_identifier || "",
    [FL.CONCEPT_DISPLAY_TEXT]: log.concept_display_text || "",
    [FL.CONCEPT_GENERAL_FORM]: log.concept_general_form || "",
    [FL.CLINICAL_CODING_SYSTEM]: log.rxcui ? RXNORM_SYSTEM : "",
    [FL.CLINICAL_CODING_CODE]: log.rxcui || "",
    [FL.DOSE_LOGGED_TIME]: stamp,
  };
  const created = await wordpressCCTFetch<any>(LOG.slug, { method: "POST", body });
  const newId = numId(created?.item_id || created?._ID || created?.id);
  if (newId) await linkRel(REL_SCHEDULE_LOG, numId(log.medicine_id), newId);
}
