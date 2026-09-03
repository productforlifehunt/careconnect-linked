/**
 * Medicine schedules & logs — dictionary-aligned storage
 *
 * SCHEDULE  → JetEngine CCT 205 `medicine_schedule` (a55–a72), linked to the
 *             cared one through JetEngine Relation 237
 *             ("One cared one can have many related 205. medicine schedules").
 * LOG       → JetEngine CCT 206 `medicine_log` (a55–a68), a field-for-field
 *             mirror of Apple HKMedicationDoseEvent, linked to its schedule
 *             through JetEngine Relation 238 (205 → 206).
 *
 * Every value lives in its own dedicated column — no JSON blobs, no invented
 * fields, no fallbacks.
 */
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { T, R } from "@/integrations/wp-schema";
import { dedupeRead, fetchRelChildrenMap } from "@/features/shared/rel-batch";

const SCH = T.medicineSchedule;      // 205
const LOG = T.medicineLog;           // 206
const F = SCH.f;
const O = SCH.opt as Record<string, Record<string, string>>;
const FL = LOG.f;
const OL = LOG.opt as Record<string, Record<string, string>>;

const REL_USER_SCHEDULE = R.caredOneMedicineSchedules; // 237 Users → 205
const REL_SCHEDULE_LOG = R.medicineScheduleLogs;       // 238 205 → 206

const RXNORM_SYSTEM = "http://www.nlm.nih.gov/research/umls/rxnorm";

const numId = (v: any): number => Number(String(v ?? "").replace(/^wp-/, ""));
/** JetEngine REST rejects non-string scalars (rest_invalid_type). */
const wpStr = (v: any): string => (v === null || v === undefined || v === "" ? "" : String(v));
const numOrNull = (v: any): number | null =>
  v === null || v === undefined || v === "" ? null : Number.isFinite(Number(v)) ? Number(v) : null;

function pad(n: number): string { return String(n).padStart(2, "0"); }

async function linkRel(relId: number, parentId: number, childId: number): Promise<void> {
  await wordpressFetch(`jet-rel/${relId}`, {
    method: "POST",
    body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
  });
}

// ─── Frequency (CCT 205 a57 is a free Text column) ───────────
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

function toFrequencyCode(value?: string): MedFrequencyCode {
  const v = String(value || "once_daily");
  if ((MED_FREQUENCY_CODES as readonly string[]).includes(v)) return v as MedFrequencyCode;
  const hit = (Object.keys(FREQ_EN) as MedFrequencyCode[]).find(
    (k) => FREQ_EN[k].toLowerCase() === v.toLowerCase());
  return hit || "once_daily";
}

// ─── Time slots (a58 Textarea, one HH:MM per line) ───────────
function encodeSlots(slots: string[]): string {
  return (slots || []).map((s) => String(s).slice(0, 5)).filter(Boolean).join("\n");
}
function decodeSlots(raw: any): string[] {
  return String(raw ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => /^\d{1,2}:\d{2}$/.test(s))
    .map((s) => (s.length === 4 ? `0${s}` : s));
}

// ─── Check-in type (a72 Checkbox, multi-select codes) ────────
function encodeCheckInType(codes: string[]): string {
  const list = (codes || []).filter(Boolean);
  return list.length ? JSON.stringify(list) : "";
}
function decodeCheckInType(raw: any): string[] {
  if (!raw) return [];
  const s = String(raw);
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed.map(String);
    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed).filter(([, v]) => v === true || v === "true" || v === 1 || v === "1").map(([k]) => k);
    }
  } catch { /* not JSON — fall through to CSV */ }
  return s.split(",").map((x) => x.trim()).filter(Boolean);
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
  const dosage = row[F.DOSAGE] || "";
  const dose = splitDosage(dosage);
  const freqCode = toFrequencyCode(row[F.FREQUENCY]);
  return {
    id: String(row.id || row._ID),
    user_id: caredOneId,
    name: row[F.NAME] || "",
    dosage,
    dose_quantity: dose.quantity,
    dose_unit: dose.unit,
    frequency_code: freqCode,
    frequency: row[F.FREQUENCY] || FREQ_EN[freqCode],
    time_slot: decodeSlots(row[F.TIME_SLOT]),
    instructions: row[F.INSTRUCTIONS] || null,
    note: row[F.NOTE] || null,
    start_date: row[F.START_DATE] ? String(row[F.START_DATE]).slice(0, 10) : null,
    end_date: row[F.END_DATE] ? String(row[F.END_DATE]).slice(0, 10) : null,
    is_active: String(row[F.IS_ACTIVE] || O.IS_ACTIVE.YES) === O.IS_ACTIVE.YES,
    reminder_time_before: numOrNull(row[F.REMINDER_TIME_BEFORE]),
    stock_count: numOrNull(row[F.STOCK_COUNT]),
    refill_threshold: numOrNull(row[F.REFILL_THRESHOLD]),
    time_to_send_to_caregiver: numOrNull(row[F.TIME_TO_SEND_TO_CAREGIVER]),
    time_to_be_considered_missing: numOrNull(row[F.TIME_TO_BE_CONSIDERED_AS_MISSING]),
    prescribing_doctor: row[F.PRESCRIBING_DOCTOR] || null,
    pharmacy: row[F.PHARMACY] || null,
    side_effects: row[F.SIDE_EFFECTS] || null,
    check_in_type: decodeCheckInType(row[F.CHECK_IN_TYPE]),
    created_at: row.cct_created || row.created_at,
  };
}

async function fetchScheduleRows(caredOneId: string): Promise<any[]> {
  const userId = numId(caredOneId);
  if (!userId) return [];
  const rels = await dedupeRead(`rel-children-raw:${REL_USER_SCHEDULE}:${userId}`, () =>
    wordpressFetch<any[]>(`jet-rel/${REL_USER_SCHEDULE}/children/${userId}`));
  const ids = (Array.isArray(rels) ? rels : [])
    .map((r: any) => String(r?.child_object_id ?? "").replace(/^wp-/, ""))
    .filter(Boolean);
  if (ids.length === 0) return [];
  const rows = await Promise.all(ids.map((id) =>
    dedupeRead(`cct:${SCH.slug}:${id}`, () => wordpressCCTFetch<any>(SCH.slug, { id }))));
  return rows.filter(Boolean);
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
  const dosage = med.dose_quantity != null || med.dose_unit
    ? joinDosage(med.dose_quantity ?? null, med.dose_unit || "")
    : (med.dosage || "");

  const body: Record<string, any> = {
    [F.NAME]: med.name,
    [F.DOSAGE]: dosage,
    [F.FREQUENCY]: FREQ_EN[freq],
    [F.TIME_SLOT]: encodeSlots(med.time_slot || []),
    [F.INSTRUCTIONS]: med.instructions || "",
    [F.PRESCRIBING_DOCTOR]: med.prescribing_doctor || "",
    [F.PHARMACY]: med.pharmacy || "",
    [F.SIDE_EFFECTS]: med.side_effects || "",
    [F.START_DATE]: med.start_date || new Date().toISOString().slice(0, 10),
    [F.END_DATE]: med.end_date || "",
    [F.IS_ACTIVE]: O.IS_ACTIVE.YES,
    [F.NOTE]: med.note || "",
    [F.STOCK_COUNT]: wpStr(med.stock_count),
    [F.REFILL_THRESHOLD]: wpStr(med.refill_threshold),
    [F.REMINDER_TIME_BEFORE]: wpStr(med.reminder_time_before),
    [F.TIME_TO_SEND_TO_CAREGIVER]: wpStr(med.time_to_send_to_caregiver),
    [F.TIME_TO_BE_CONSIDERED_AS_MISSING]: wpStr(med.time_to_be_considered_missing),
    [F.CHECK_IN_TYPE]: encodeCheckInType(med.check_in_type || []),
  };
  const created = await wordpressCCTFetch<any>(SCH.slug, { method: "POST", body });
  const newId = numId(created?.item_id || created?._ID || created?.id);
  if (!newId) throw new Error("Medicine schedule was not saved");
  await linkRel(REL_USER_SCHEDULE, numId(med.user_id), newId);
}

export async function updateMedicineWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};

  if (updates.name !== undefined) body[F.NAME] = updates.name;
  if (updates.dosage !== undefined || updates.dose_quantity !== undefined || updates.dose_unit !== undefined) {
    body[F.DOSAGE] = updates.dose_quantity !== undefined || updates.dose_unit !== undefined
      ? joinDosage(updates.dose_quantity ?? null, updates.dose_unit || "")
      : (updates.dosage || "");
  }
  if (updates.frequency !== undefined) body[F.FREQUENCY] = FREQ_EN[toFrequencyCode(updates.frequency)];
  if (updates.time_slot !== undefined) body[F.TIME_SLOT] = encodeSlots(updates.time_slot || []);
  if (updates.instructions !== undefined) body[F.INSTRUCTIONS] = updates.instructions || "";
  if (updates.prescribing_doctor !== undefined) body[F.PRESCRIBING_DOCTOR] = updates.prescribing_doctor || "";
  if (updates.pharmacy !== undefined) body[F.PHARMACY] = updates.pharmacy || "";
  if (updates.side_effects !== undefined) body[F.SIDE_EFFECTS] = updates.side_effects || "";
  if (updates.start_date !== undefined) body[F.START_DATE] = updates.start_date || "";
  if (updates.end_date !== undefined) body[F.END_DATE] = updates.end_date || "";
  if (updates.is_active !== undefined) body[F.IS_ACTIVE] = updates.is_active ? O.IS_ACTIVE.YES : O.IS_ACTIVE.NO;
  if (updates.note !== undefined || updates.notes !== undefined) body[F.NOTE] = updates.note ?? updates.notes ?? "";
  if (updates.stock_count !== undefined) body[F.STOCK_COUNT] = wpStr(updates.stock_count);
  if (updates.refill_threshold !== undefined) body[F.REFILL_THRESHOLD] = wpStr(updates.refill_threshold);
  if (updates.reminder_time_before !== undefined) body[F.REMINDER_TIME_BEFORE] = wpStr(updates.reminder_time_before);
  if (updates.time_to_send_to_caregiver !== undefined) body[F.TIME_TO_SEND_TO_CAREGIVER] = wpStr(updates.time_to_send_to_caregiver);
  if (updates.time_to_be_considered_missing !== undefined) body[F.TIME_TO_BE_CONSIDERED_AS_MISSING] = wpStr(updates.time_to_be_considered_missing);
  if (updates.check_in_type !== undefined) body[F.CHECK_IN_TYPE] = encodeCheckInType(updates.check_in_type || []);

  if (Object.keys(body).length === 0) return;
  await wordpressCCTFetch(SCH.slug, { id, method: "PUT", body });
}

export async function deleteMedicineWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(SCH.slug, { id, method: "DELETE" });
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
