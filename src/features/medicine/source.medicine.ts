/**
 * Medicine schedules & logs — dictionary-aligned storage (bible 2026-09-04)
 *
 * SCHEDULE  → JetEngine CCT 187 `users_calendar_event`, a60 = b55
 *             ("Medicine schedule"), owned through JetEngine Relation 190
 *             (Users → 187) with the cared one as parent.
 *             CCT 205 no longer exists — the calendar event replaced it.
 * LOG       → JetEngine CCT 206 `medicine_log` (a55–a68), a field-for-field
 *             mirror of Apple HKMedicationDoseEvent, linked to its schedule
 *             through JetEngine Relation 238 (187 → 206).
 *
 * Recurrence uses the RFC 5545 columns of the calendar (a66 RRULE, a73 VALARM);
 * values the calendar has no Apple/iCal column for (exact time slots, UI
 * frequency code, instructions, side effects, missing window) live in the
 * dedicated a90 Custom data JSON column. No invented columns, no fallbacks.
 */
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { T, R } from "@/integrations/wp-schema";
import { fetchRelChildrenMap } from "@/features/shared/rel-batch";
import {
  FC, EVENT_TYPE, STATUS_CONFIRMED, STATUS_CANCELLED, APP_CHALLENGED,
  LOG_TYPE_AI, LOG_TYPE_HUMAN, CAL,
  numId, wpStr, numOrNull, linkRel,
  toFrequencyCode, FREQ_EN, buildRRule, buildReminders, readReminderMinutes,
  decodeSlots, readCustom, writeCustom,
  fetchEventsOfType, createEvent, updateEvent, deleteEvent, readEvent,
} from "@/features/schedules/calendar-schedule";

const LOG = T.medicineLog;           // 206
const FL = LOG.f;
const OL = LOG.opt as Record<string, Record<string, string>>;
const OC = CAL.opt as Record<string, Record<string, string>>;

const REL_SCHEDULE_LOG = R.medicineScheduleLogs;       // 238 187 → 206

const RXNORM_SYSTEM = "http://www.nlm.nih.gov/research/umls/rxnorm";

function pad(n: number): string { return String(n).padStart(2, "0"); }

// Re-exported for the UI: the medicine frequency vocabulary.
export const MED_FREQUENCY_CODES = [
  "once_daily", "twice_daily", "three_daily", "four_daily",
  "every_other_day", "weekly", "as_needed",
] as const;
export type MedFrequencyCode = (typeof MED_FREQUENCY_CODES)[number];

// ─── Check-in type (a96 Medicine log type: AI | Human) ───────
function encodeLogType(codes: string[] | undefined): string {
  const first = (codes || []).map((c) => String(c).toLowerCase())[0];
  if (first === "ai") return LOG_TYPE_AI;
  if (first === "human") return LOG_TYPE_HUMAN;
  return "";
}
function decodeLogType(raw: any): string[] {
  const v = String(raw ?? "");
  if (v === LOG_TYPE_AI) return ["ai"];
  if (v === LOG_TYPE_HUMAN) return ["human"];
  return [];
}

// ─── Dosage text ⇄ quantity + UCUM unit ──────────────────────
/** "1 tablet" / "10 mg" → { quantity, unit } */
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

// ─── Schedule reads ──────────────────────────────────────────
function mapSchedule(row: any, caredOneId: string): any {
  const custom = readCustom(row[FC.CUSTOM_DATA]);
  const quantity = numOrNull(row[FC.MEDICATION_DOSE_QUANTITY]);
  const unit = row[FC.MEDICATION_DOSE_UNIT] || "";
  const freqCode = toFrequencyCode(custom.frequency_code);
  return {
    id: String(row.id || row._ID),
    user_id: caredOneId,
    name: row[FC.TITLE] || "",
    dosage: joinDosage(quantity, unit),
    dose_quantity: quantity,
    dose_unit: unit,
    frequency_code: freqCode,
    frequency: FREQ_EN[freqCode],
    time_slot: decodeSlots(custom.time_slot),
    instructions: custom.instructions || null,
    note: row[FC.DESCRIPTION] || null,
    start_date: row[FC.START_AT] ? String(row[FC.START_AT]).slice(0, 10) : null,
    end_date: row[FC.END_AT] ? String(row[FC.END_AT]).slice(0, 10) : null,
    is_active: String(row[FC.STATUS] || STATUS_CONFIRMED) !== STATUS_CANCELLED,
    reminder_time_before: readReminderMinutes(row[FC.REMINDERS]),
    stock_count: numOrNull(row[FC.MEDICINE_STOCK]),
    refill_threshold: numOrNull(row[FC.MEDICINE_REFILL]),
    time_to_send_to_caregiver: numOrNull(row[FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING]),
    time_to_be_considered_missing: numOrNull(custom.time_to_be_considered_missing),
    prescribing_doctor: row[FC.MEDICINE_PRESCRIBER] || null,
    pharmacy: row[FC.MEDICINE_BOUGHT_PHARMACY] || null,
    side_effects: custom.side_effects || null,
    check_in_type: decodeLogType(row[FC.MEDICINE_LOG_TYPE]),
    created_at: row.cct_created || row.created_at,
  };
}

async function fetchScheduleRows(caredOneId: string): Promise<any[]> {
  return fetchEventsOfType(caredOneId, EVENT_TYPE.MEDICINE);
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
  check_in_type?: string[];
}

export async function createMedicineWordPress(med: MedicineInput): Promise<void> {
  const freq = toFrequencyCode(med.frequency);
  const dose = med.dose_quantity != null || med.dose_unit
    ? { quantity: med.dose_quantity ?? null, unit: med.dose_unit || "" }
    : splitDosage(med.dosage);
  const slots = decodeSlots(med.time_slot || []);
  const startDate = med.start_date || new Date().toISOString().slice(0, 10);

  const body: Record<string, any> = {
    [FC.TITLE]: med.name,
    [FC.DESCRIPTION]: med.note || "",
    [FC.CUSTOM_EVENT_TYPE]: EVENT_TYPE.MEDICINE,
    [FC.APP]: APP_CHALLENGED,
    [FC.START_AT]: slots[0] ? `${startDate} ${slots[0]}:00` : startDate,
    [FC.END_AT]: med.end_date || "",
    [FC.STATUS]: STATUS_CONFIRMED,
    [FC.RRULE]: buildRRule(freq, slots),
    [FC.REMINDERS]: buildReminders(med.reminder_time_before),
    [FC.MEDICATION_DOSE_QUANTITY]: wpStr(dose.quantity),
    [FC.MEDICATION_DOSE_UNIT]: dose.unit || "",
    [FC.MEDICATION_SCHEDULE_TYPE]: freq === "as_needed"
      ? OC.MEDICATION_SCHEDULE_TYPE.ASNEEDED
      : OC.MEDICATION_SCHEDULE_TYPE.SCHEDULE,
    [FC.MEDICINE_LOG_TYPE]: encodeLogType(med.check_in_type),
    [FC.MEDICINE_STOCK]: wpStr(med.stock_count),
    [FC.MEDICINE_REFILL]: wpStr(med.refill_threshold),
    [FC.MEDICINE_PRESCRIBER]: med.prescribing_doctor || "",
    [FC.MEDICINE_BOUGHT_PHARMACY]: med.pharmacy || "",
    [FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING]: wpStr(med.time_to_send_to_caregiver),
    [FC.CUSTOM_DATA]: writeCustom({
      frequency_code: freq,
      time_slot: slots,
      instructions: med.instructions || "",
      side_effects: med.side_effects || "",
      time_to_be_considered_missing: med.time_to_be_considered_missing ?? "",
    }),
  };
  await createEvent(body, med.user_id);
}

export async function updateMedicineWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};
  const customKeys = ["frequency", "time_slot", "instructions", "side_effects", "time_to_be_considered_missing"];
  const touchesCustom = customKeys.some((k) => updates[k] !== undefined);

  if (updates.name !== undefined) body[FC.TITLE] = updates.name;
  if (updates.note !== undefined || updates.notes !== undefined) body[FC.DESCRIPTION] = updates.note ?? updates.notes ?? "";
  if (updates.dosage !== undefined || updates.dose_quantity !== undefined || updates.dose_unit !== undefined) {
    const dose = updates.dose_quantity !== undefined || updates.dose_unit !== undefined
      ? { quantity: updates.dose_quantity ?? null, unit: updates.dose_unit || "" }
      : splitDosage(updates.dosage);
    body[FC.MEDICATION_DOSE_QUANTITY] = wpStr(dose.quantity);
    body[FC.MEDICATION_DOSE_UNIT] = dose.unit || "";
  }
  if (updates.end_date !== undefined) body[FC.END_AT] = updates.end_date || "";
  if (updates.is_active !== undefined) body[FC.STATUS] = updates.is_active ? STATUS_CONFIRMED : STATUS_CANCELLED;
  if (updates.reminder_time_before !== undefined) body[FC.REMINDERS] = buildReminders(updates.reminder_time_before);
  if (updates.stock_count !== undefined) body[FC.MEDICINE_STOCK] = wpStr(updates.stock_count);
  if (updates.refill_threshold !== undefined) body[FC.MEDICINE_REFILL] = wpStr(updates.refill_threshold);
  if (updates.prescribing_doctor !== undefined) body[FC.MEDICINE_PRESCRIBER] = updates.prescribing_doctor || "";
  if (updates.pharmacy !== undefined) body[FC.MEDICINE_BOUGHT_PHARMACY] = updates.pharmacy || "";
  if (updates.time_to_send_to_caregiver !== undefined) {
    body[FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING] = wpStr(updates.time_to_send_to_caregiver);
  }
  if (updates.check_in_type !== undefined) body[FC.MEDICINE_LOG_TYPE] = encodeLogType(updates.check_in_type);

  if (touchesCustom || updates.start_date !== undefined) {
    const row = await readEvent(id);
    const custom = readCustom(row?.[FC.CUSTOM_DATA]);
    const freq = updates.frequency !== undefined
      ? toFrequencyCode(updates.frequency)
      : toFrequencyCode(custom.frequency_code);
    const slots = updates.time_slot !== undefined ? decodeSlots(updates.time_slot) : decodeSlots(custom.time_slot);
    const startDate = updates.start_date !== undefined
      ? (updates.start_date || "")
      : String(row?.[FC.START_AT] || "").slice(0, 10);
    if (updates.start_date !== undefined || updates.time_slot !== undefined) {
      body[FC.START_AT] = startDate && slots[0] ? `${startDate} ${slots[0]}:00` : startDate;
    }
    if (updates.frequency !== undefined || updates.time_slot !== undefined) {
      body[FC.RRULE] = buildRRule(freq, slots);
      body[FC.MEDICATION_SCHEDULE_TYPE] = freq === "as_needed"
        ? OC.MEDICATION_SCHEDULE_TYPE.ASNEEDED
        : OC.MEDICATION_SCHEDULE_TYPE.SCHEDULE;
    }
    body[FC.CUSTOM_DATA] = writeCustom({
      ...custom,
      frequency_code: freq,
      time_slot: slots,
      instructions: updates.instructions !== undefined ? (updates.instructions || "") : (custom.instructions || ""),
      side_effects: updates.side_effects !== undefined ? (updates.side_effects || "") : (custom.side_effects || ""),
      time_to_be_considered_missing: updates.time_to_be_considered_missing !== undefined
        ? (updates.time_to_be_considered_missing ?? "")
        : (custom.time_to_be_considered_missing ?? ""),
    });
  }

  await updateEvent(id, body);
}

export async function deleteMedicineWordPress(id: string): Promise<void> {
  await deleteEvent(id);
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
    wordpressCCTFetch<any>(LOG.slug, { id }).then((r) => mapLog(r, medicineId, id))));
  return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
      ? await Promise.all((logMap.get(mid) || []).map(async (c) => {
          const l = await wordpressCCTFetch<any>(LOG.slug, { id: c.childId });
          return mapLog(l, mid, c.childId);
        }))
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
  if (!newId) throw new Error("Dose log was not saved");
  await linkRel(REL_SCHEDULE_LOG, numId(log.medicine_id), newId);
}
