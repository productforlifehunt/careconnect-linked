/**
 * Medicine schedules & logs — dictionary-aligned storage (bible 2026-09-04)
 *
 * SCHEDULE  → JetEngine CCT 187 `users_calendar_event`, a60 = b55
 *             ("Medicine schedule"), owned through JetEngine Relation 190
 *             (Users → 187) with the cared one as parent.
 *             CCT 205 no longer exists — the calendar event replaced it.
 * LOG       → JetEngine CCT 161 `users_log_event` (a83–a95 + a97/a99/a100), a
 *             field-for-field mirror of Apple HKMedicationDoseEvent, marked
 *             a57 = b69 "Custom medicine", linked to its schedule through
 *             JetEngine Relation 191 (187 → 161) and to the cared one through
 *             Relation 173 (Users → 161). CCT 206 is retired.
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
  slotsFromRRule, frequencyFromRow, frequencyForSlots, normalizeSlots, occurrencesOn,
  localDay, parseRRule, dateOf, startAtFor,
  fetchEventsOfType, createEvent, updateEvent, deleteEvent, readEvent,
} from "@/features/schedules/calendar-schedule";

const LOG = T.userLogEvent;          // 161 user's other log event
const FL = LOG.f;
const OL = LOG.opt as Record<string, Record<string, string>>;
const OC = CAL.opt as Record<string, Record<string, string>>;

const REL_SCHEDULE_LOG = R.medicineScheduleLogs;       // 191 187 → 161 (240 is the retired 207→208 pair)

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
export function splitDosage(dosage?: string | null | undefined): { quantity: number | null; unit: string } {
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
const AS_NEEDED = OC["MEDICATION_SCHEDULE_TYPE"]!["ASNEEDED"]!;
const SCHEDULED = OC["MEDICATION_SCHEDULE_TYPE"]!["SCHEDULE"]!;

function mapSchedule(row: any, caredOneId: string): any {
  const quantity = numOrNull(row[FC.MEDICATION_DOSE_QUANTITY]);
  const unit = row[FC.MEDICATION_DOSE_UNIT] || "";
  const asNeeded = String(row[FC.MEDICATION_SCHEDULE_TYPE] || "") === AS_NEEDED;
  // Times of day and frequency come only from a57 + a66 (RFC 5545).
  const slots = asNeeded ? [] : slotsFromRRule(row[FC.RRULE], row[FC.START_AT]);
  const freqCode = frequencyFromRow(row[FC.RRULE], asNeeded, slots);
  const calendar = { startAt: row[FC.START_AT], rrule: row[FC.RRULE], exdates: row[FC.EXDATES], rdates: row[FC.RDATES] };
  return {
    id: String(row.id || row._ID),
    user_id: caredOneId,
    name: row[FC.TITLE] || "",
    dosage: joinDosage(quantity, unit),
    dose_quantity: quantity,
    dose_unit: unit,
    medication_concept_identifier: row[FC.MEDICATION_CONCEPT_IDENTIFIER] || null,
    schedule_type: asNeeded ? AS_NEEDED : SCHEDULED,
    frequency_code: freqCode,
    frequency: FREQ_EN[freqCode],
    time_slot: slots,
    /** Today's doses after a68 EXDATES / a69 RDATES. */
    today_slots: asNeeded ? [] : occurrencesOn(localDay(), calendar),
    note: row[FC.DESCRIPTION] || null,
    start_date: dateOf(row[FC.START_AT]),
    end_date: parseRRule(row[FC.RRULE])?.until ?? null,
    is_active: String(row[FC.STATUS] || STATUS_CONFIRMED) !== STATUS_CANCELLED,
    reminder_time_before: readReminderMinutes(row[FC.REMINDERS]),
    stock_count: numOrNull(row[FC.MEDICINE_STOCK]),
    refill_threshold: numOrNull(row[FC.MEDICINE_REFILL]),
    time_to_send_to_caregiver: numOrNull(row[FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING]),
    prescribing_doctor: row[FC.MEDICINE_PRESCRIBER] || null,
    pharmacy: row[FC.MEDICINE_BOUGHT_PHARMACY] || null,
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
  dosage?: string | undefined;
  dose_quantity?: number | null | undefined;
  dose_unit?: string | undefined;
  medication_concept_identifier?: string | undefined;
  frequency?: string | undefined;          // code or English label
  time_slot?: string[] | undefined;
  note?: string | undefined;
  start_date?: string | undefined;
  end_date?: string | undefined;
  stock_count?: number | undefined;
  refill_threshold?: number | undefined;
  reminder_time_before?: number | undefined;
  time_to_send_to_caregiver?: number | undefined;
  prescribing_doctor?: string | undefined;
  pharmacy?: string | undefined;
  check_in_type?: string[] | undefined;
}

/** a57, a58, a66, a95 for one plan — the whole recurrence, nothing in a90. */
function recurrenceColumns(freqIn: string | undefined, slotsIn: readonly unknown[], startDate: string, endDate: string | null | undefined) {
  const slots = normalizeSlots(slotsIn);
  const freq = frequencyForSlots(toFrequencyCode(freqIn), slots);
  const startAt = startAtFor(startDate, slots);
  return {
    [FC.START_AT]: startAt,
    [FC.END_AT]: startAt,
    [FC.RRULE]: buildRRule(freq, slots, endDate || null),
    [FC.MEDICATION_SCHEDULE_TYPE]: freq === "as_needed" ? AS_NEEDED : SCHEDULED,
  };
}

export async function createMedicineWordPress(med: MedicineInput): Promise<void> {
  const dose = med.dose_quantity != null || med.dose_unit
    ? { quantity: med.dose_quantity ?? null, unit: med.dose_unit || "" }
    : splitDosage(med.dosage);
  const startDate = med.start_date || localDay();

  const body: Record<string, any> = {
    [FC.TITLE]: med.name,
    [FC.DESCRIPTION]: med.note || "",
    [FC.CUSTOM_EVENT_TYPE]: EVENT_TYPE.MEDICINE,
    [FC.APP]: APP_CHALLENGED,
    ...recurrenceColumns(med.frequency, med.time_slot || [], startDate, med.end_date),
    [FC.STATUS]: STATUS_CONFIRMED,
    [FC.REMINDERS]: buildReminders(med.reminder_time_before),
    [FC.MEDICATION_CONCEPT_IDENTIFIER]: med.medication_concept_identifier || "",
    [FC.MEDICATION_DOSE_QUANTITY]: wpStr(dose.quantity),
    [FC.MEDICATION_DOSE_UNIT]: dose.unit || "",
    [FC.MEDICINE_LOG_TYPE]: encodeLogType(med.check_in_type),
    [FC.MEDICINE_STOCK]: wpStr(med.stock_count),
    [FC.MEDICINE_REFILL]: wpStr(med.refill_threshold),
    [FC.MEDICINE_PRESCRIBER]: med.prescribing_doctor || "",
    [FC.MEDICINE_BOUGHT_PHARMACY]: med.pharmacy || "",
    [FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING]: wpStr(med.time_to_send_to_caregiver),
  };
  await createEvent(body, med.user_id);
}

export async function updateMedicineWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};

  if (updates["name"] !== undefined) body[FC.TITLE] = updates["name"];
  if (updates["note"] !== undefined || updates["notes"] !== undefined) body[FC.DESCRIPTION] = updates["note"] ?? updates["notes"] ?? "";
  if (updates["medication_concept_identifier"] !== undefined) body[FC.MEDICATION_CONCEPT_IDENTIFIER] = updates["medication_concept_identifier"] || "";
  if (updates["dosage"] !== undefined || updates["dose_quantity"] !== undefined || updates["dose_unit"] !== undefined) {
    const dose = updates["dose_quantity"] !== undefined || updates["dose_unit"] !== undefined
      ? { quantity: updates["dose_quantity"] ?? null, unit: updates["dose_unit"] || "" }
      : splitDosage(updates["dosage"]);
    body[FC.MEDICATION_DOSE_QUANTITY] = wpStr(dose.quantity);
    body[FC.MEDICATION_DOSE_UNIT] = dose.unit || "";
  }
  if (updates["is_active"] !== undefined) body[FC.STATUS] = updates["is_active"] ? STATUS_CONFIRMED : STATUS_CANCELLED;
  if (updates["reminder_time_before"] !== undefined) body[FC.REMINDERS] = buildReminders(updates["reminder_time_before"]);
  if (updates["stock_count"] !== undefined) body[FC.MEDICINE_STOCK] = wpStr(updates["stock_count"]);
  if (updates["refill_threshold"] !== undefined) body[FC.MEDICINE_REFILL] = wpStr(updates["refill_threshold"]);
  if (updates["prescribing_doctor"] !== undefined) body[FC.MEDICINE_PRESCRIBER] = updates["prescribing_doctor"] || "";
  if (updates["pharmacy"] !== undefined) body[FC.MEDICINE_BOUGHT_PHARMACY] = updates["pharmacy"] || "";
  if (updates["time_to_send_to_caregiver"] !== undefined) {
    body[FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING] = wpStr(updates["time_to_send_to_caregiver"]);
  }
  if (updates["check_in_type"] !== undefined) body[FC.MEDICINE_LOG_TYPE] = encodeLogType(updates["check_in_type"]);

  if (["frequency", "time_slot", "start_date", "end_date"].some((k) => updates[k] !== undefined)) {
    const current = mapSchedule(await readEvent(id), "");
    Object.assign(body, recurrenceColumns(
      updates["frequency"] ?? current.frequency_code,
      updates["time_slot"] ?? current.time_slot,
      updates["start_date"] || current.start_date || localDay(),
      updates["end_date"] !== undefined ? updates["end_date"] : current.end_date,
    ));
  }

  await updateEvent(id, body);
}

export async function deleteMedicineWordPress(id: string): Promise<void> {
  await deleteEvent(id);
}

// ─── Logs (CCT 161 user's other log event, Apple HKMedicationDoseEvent) ─────
/** UI status → Apple LogStatus code. "missed" = notInteracted (Apple has no missed). */
const LOG_STATUS_CODE: Record<string, string> = {
  taken: OL["DOSE_EVENT_LOG_STATUS"]!["TAKEN"]!,
  skipped: OL["DOSE_EVENT_LOG_STATUS"]!["SKIPPED"]!,
  missed: OL["DOSE_EVENT_LOG_STATUS"]!["NOT_INTERACTED"]!,
  snoozed: OL["DOSE_EVENT_LOG_STATUS"]!["SNOOZED"]!,
  not_logged: OL["DOSE_EVENT_LOG_STATUS"]!["NOT_LOGGED"]!,
  notification_not_sent: OL["DOSE_EVENT_LOG_STATUS"]!["NOTIFICATION_NOT_SENT"]!,
};
const LOG_STATUS_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(LOG_STATUS_CODE).map(([k, v]) => [v, k]),
);

function mapLog(row: any, medicineId: string, fallbackId?: string | undefined): any {
  const at = row[FL.LOG_EVENT_TIME] || row.cct_created || row.created_at;
  const note = row[FL.DOSE_EVENT_NOTE] || row[FL.LOG_MEDICINE_NOTE] || null;
  return {
    id: String(row.id || row._ID || fallbackId),
    medicine_id: medicineId,
    status: LOG_STATUS_LABEL[String(row[FL.DOSE_EVENT_LOG_STATUS] || "")] || "taken",
    note,
    notes: note,
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

/** Only the medicine rows of CCT 161 (a57 = b69 Custom medicine). */
function isMedicineLogRow(row: any): boolean {
  const type = String(row?.[FL.LOG_EVENT_TYPE] ?? "");
  if (!type) return !!row?.[FL.DOSE_EVENT_LOG_STATUS];
  return type === OL["LOG_EVENT_TYPE"]!["CUSTOM_MEDICINE"]!;
}

export async function fetchMedicineLogsWordPress(medicineId: string): Promise<any[]> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_SCHEDULE_LOG}/children/${numId(medicineId)}`);
  const ids = (Array.isArray(rels) ? rels : [])
    .map((r: any) => String(r?.child_object_id ?? "").replace(/^wp-/, ""))
    .filter(Boolean);
  const rows = await Promise.all(ids.map((id) =>
    wordpressCCTFetch<any>(LOG.slug, { id }).then((r) => (isMedicineLogRow(r) ? mapLog(r, medicineId, id) : null))));
  return rows.filter(Boolean).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
          const l = await wordpressCCTFetch<any>(LOG.slug, { id: c.childId });
          return isMedicineLogRow(l) ? mapLog(l, mid, c.childId) : null;
        }))).filter(Boolean)
      : await fetchMedicineLogsWordPress(mid);
    // A log belongs to the day of the dose it answers (a88); a61 only when a88 is empty.
    const day = localDay();
    logs.forEach((l: any) => {
      const doseDay = dateOf(l.scheduled_date);
      if (doseDay ? doseDay === day : (l.created_at && new Date(l.created_at) >= today)) out.push(l);
    });
  }));
  return out;
}

export interface MedicineLogInput {
  medicine_id: string;
  status?: string | undefined;
  note?: string | undefined;
  user_id?: string | undefined;
  logged_by_ai?: boolean | undefined;
  /** Apple-aligned dose context, taken from the schedule row. */
  dose_quantity?: number | null | undefined;
  scheduled_dose_quantity?: number | null | undefined;
  dose_unit?: string | null | undefined;
  scheduled_date?: string | null | undefined;
  schedule_type?: string | null | undefined;
  concept_identifier?: string | null | undefined;
  concept_display_text?: string | null | undefined;
  concept_general_form?: string | null | undefined;
  rxcui?: string | null | undefined;
}

export async function logMedicineWordPress(log: MedicineLogInput): Promise<void> {
  const status = LOG_STATUS_CODE[String(log.status || "taken").toLowerCase()] || LOG_STATUS_CODE["taken"];
  const now = new Date();
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const body: Record<string, any> = {
    [FL.LOG_EVENT_NAME]: log.concept_display_text || "Medication",
    [FL.LOG_EVENT_TYPE]: OL["LOG_EVENT_TYPE"]!["CUSTOM_MEDICINE"]!,
    [FL.DOSE_EVENT_LOG_STATUS]: status,
    [FL.DOSE_EVENT_NOTE]: log.note || "",
    [FL.LOG_MEDICINE_NOTE]: log.note || "",
    [FL.DOSE_QUANTITY]: log.status === "taken" ? wpStr(log.dose_quantity ?? log.scheduled_dose_quantity) : "",
    [FL.SCHEDULED_DOSE_QUANTITY]: wpStr(log.scheduled_dose_quantity),
    [FL.DOSE_UNIT]: log.dose_unit || "",
    [FL.SCHEDULED_DATE]: log.scheduled_date || stamp,
    [FL.SCHEDULE_TYPE]: log.schedule_type || OL["SCHEDULE_TYPE"]!["SCHEDULE"]!,
    [FL.CONCEPT_IDENTIFIER]: log.concept_identifier || "",
    [FL.CONCEPT_DISPLAY_TEXT]: log.concept_display_text || "",
    [FL.CONCEPT_GENERAL_FORM]: log.concept_general_form || "",
    [FL.CLINICAL_CODING_SYSTEM]: log.rxcui ? RXNORM_SYSTEM : "",
    [FL.CLINICAL_CODING_CODE]: log.rxcui || "",
    [FL.CHECKED_BY_AI]: log.logged_by_ai ? OL["CHECKED_BY_AI"]!["YES"]! : OL["CHECKED_BY_AI"]!["NO"]!,
    [FL.LOG_EVENT_TIME]: stamp,
    [FL.FOR_APP]: "challenged",
  };
  const created = await wordpressCCTFetch<any>(LOG.slug, { method: "POST", body });
  const newId = numId(created?.item_id || created?._ID || created?.id);
  if (!newId) throw new Error("Dose log was not saved");
  // Relation 191 attaches the log to its CCT 187 schedule; Relation 173 attaches
  // it to the cared one whose log event it is.
  await linkRel(REL_SCHEDULE_LOG, numId(log.medicine_id), newId);
  if (log.user_id) {
    try { await linkRel(R.userLogEvents, numId(log.user_id), newId); } catch { /* the log itself is saved */ }
  }

  // Tell the cared one's caregivers. Non-blocking: the dose log is already
  // saved, and the tap-through target is just a route string in action_url —
  // no notification↔dose relation is needed.
  if (log.user_id) {
    try {
      const caregiverIds = await wordpressFetch<any[]>(
        `jet-rel/${R.userCaredOnes}/parents/${numId(log.user_id)}`,
      ).then((rows) => (Array.isArray(rows) ? rows.map((r: any) => String(r.parent_object_id)) : []))
        .catch(() => [] as string[]);
      const { notifyMedicineDose } = await import("@/features/notifications/notify-events");
      await notifyMedicineDose(
        caregiverIds,
        String(log.user_id),
        log.concept_display_text || "Medication",
        (String(log.status || "taken").toLowerCase() as "taken" | "skipped" | "missed"),
      );
    } catch { /* notifications never block a saved log */ }
  }
}

