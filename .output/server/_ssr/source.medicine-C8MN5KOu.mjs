import "../_runtime.mjs";
import { n as __name$1, t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { r as fetchRelChildrenOf, t as dedupeRead } from "./rel-batch-97Y7fPM-.mjs";
import { t as readLinkedCCTRows } from "./cct-rows-C0yQLswP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source.medicine-C8MN5KOu.js
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
var FREQUENCY_CODES = [
	"once_daily",
	"twice_daily",
	"three_daily",
	"four_daily",
	"every_other_day",
	"weekly",
	"as_needed"
];
var DAILY_COUNT = {
	once_daily: 1,
	twice_daily: 2,
	three_daily: 3,
	four_daily: 4
};
var COUNT_DAILY = {
	1: "once_daily",
	2: "twice_daily",
	3: "three_daily",
	4: "four_daily"
};
/** How many times of day a frequency needs (null = any number, e.g. weekly). */
function slotsNeeded(freq) {
	if (freq === "as_needed") return 0;
	return DAILY_COUNT[freq] ?? null;
}
function pad$1(n) {
	return String(n).padStart(2, "0");
}
__name$1(pad$1, "pad");
/** "8:00" / "08:00:00" → "08:00"; unique and sorted. */
function normalizeSlots(slots) {
	const out = /* @__PURE__ */ new Set();
	slots.forEach((s) => {
		const m = String(s ?? "").match(/^(\d{1,2}):(\d{2})/);
		if (m && Number(m[1]) < 24 && Number(m[2]) < 60) out.add(`${pad$1(Number(m[1]))}:${m[2]}`);
	});
	return [...out].sort();
}
/** Daily frequency follows the number of times; other patterns keep their own. */
function frequencyForSlots(freq, slots) {
	if (freq === "as_needed" || freq === "weekly" || freq === "every_other_day") return freq;
	return COUNT_DAILY[normalizeSlots(slots).length] || freq;
}
/** YYYY-MM-DD → RFC 5545 UNTIL (end of that local day). */
function toUntil(date) {
	return `${date.replace(/-/g, "")}T235959`;
}
function buildRRule(freq, slots, untilDate) {
	if (freq === "as_needed") return "";
	const times = normalizeSlots(slots);
	const parts = [];
	if (freq === "weekly") parts.push("FREQ=WEEKLY", "INTERVAL=1");
	else parts.push("FREQ=DAILY", `INTERVAL=${freq === "every_other_day" ? 2 : 1}`);
	if (times.length) {
		const hours = [...new Set(times.map((t) => Number(t.slice(0, 2))))].sort((a, b) => a - b);
		const minutes = [...new Set(times.map((t) => Number(t.slice(3, 5))))].sort((a, b) => a - b);
		parts.push(`BYHOUR=${hours.join(",")}`, `BYMINUTE=${minutes.join(",")}`);
		const expanded = hours.flatMap((h) => minutes.map((m) => `${pad$1(h)}:${pad$1(m)}`));
		if (expanded.length !== times.length) parts.push(`BYSETPOS=${times.map((t) => expanded.indexOf(t) + 1).join(",")}`);
	}
	if (untilDate) parts.push(`UNTIL=${toUntil(untilDate)}`);
	return parts.join(";");
}
function parseRRule(raw) {
	const text = String(raw ?? "").replace(/^RRULE:/i, "").trim();
	if (!text) return null;
	const kv = {};
	text.split(";").forEach((p) => {
		const [k, v] = p.split("=");
		if (k && v !== void 0) kv[k.trim().toUpperCase()] = v.trim();
	});
	if (!kv["FREQ"]) return null;
	const nums = (v) => v ? v.split(",").map(Number).filter((n) => Number.isFinite(n)) : [];
	const u = kv["UNTIL"]?.match(/^(\d{4})(\d{2})(\d{2})/);
	return {
		freq: kv["FREQ"].toUpperCase(),
		interval: Math.max(1, Number(kv["INTERVAL"] || 1) || 1),
		byhour: nums(kv["BYHOUR"]),
		byminute: nums(kv["BYMINUTE"]),
		bysetpos: nums(kv["BYSETPOS"]),
		until: u ? `${u[1]}-${u[2]}-${u[3]}` : null
	};
}
/** Time part "HH:MM" of a stored a57 datetime. */
function timeOf(datetime) {
	const m = String(datetime ?? "").match(/[ T](\d{2}):(\d{2})/);
	return m ? `${m[1]}:${m[2]}` : null;
}
function dateOf(datetime) {
	const m = String(datetime ?? "").match(/^(\d{4}-\d{2}-\d{2})/);
	return m ? m[1] : null;
}
/** The times of day an occurrence day has, from a66 (a57's time when BYHOUR is absent). */
function slotsFromRRule(rrule, startAt) {
	const r = parseRRule(rrule);
	const start = timeOf(startAt);
	if (!r || !r.byhour.length) return start ? [start] : [];
	const minutes = r.byminute.length ? r.byminute : [Number((start || "00:00").slice(3, 5))];
	const expanded = r.byhour.slice().sort((a, b) => a - b).flatMap((h) => minutes.slice().sort((a, b) => a - b).map((m) => `${pad$1(h)}:${pad$1(m)}`));
	if (!r.bysetpos.length) return expanded;
	return normalizeSlots(r.bysetpos.map((p) => expanded[p > 0 ? p - 1 : expanded.length + p]).filter(Boolean));
}
/** UI frequency code read from a66 + a95 (as-needed) + the number of times. */
function frequencyFromRow(rrule, asNeeded, slots) {
	if (asNeeded) return "as_needed";
	const r = parseRRule(rrule);
	if (!r) return "as_needed";
	if (r.freq === "WEEKLY") return "weekly";
	if (r.freq === "DAILY" && r.interval === 2) return "every_other_day";
	return COUNT_DAILY[slots.length] || "once_daily";
}
/** All YYYYMMDDTHHMMSS / YYYY-MM-DD HH:MM values in an a68/a69 text. */
function listDates(raw) {
	const out = [];
	const re = /(\d{4})-?(\d{2})-?(\d{2})(?:[T ](\d{2}):?(\d{2}))?/g;
	let m;
	const text = String(raw ?? "");
	while (m = re.exec(text)) out.push({
		date: `${m[1]}-${m[2]}-${m[3]}`,
		time: m[4] ? `${m[4]}:${m[5]}` : null
	});
	return out;
}
function daysBetween(a, b) {
	const [ay, am, ad] = a.split("-").map(Number);
	const [by, bm, bd] = b.split("-").map(Number);
	return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 864e5);
}
/** Times of day the plan has on `day` (YYYY-MM-DD): RRULE − EXDATES + RDATES. */
function occurrencesOn(day, row) {
	const startDate = dateOf(row.startAt);
	const r = parseRRule(row.rrule);
	let slots = [];
	if (r && startDate && daysBetween(startDate, day) >= 0 && (!r.until || day <= r.until)) {
		const diff = daysBetween(startDate, day);
		const step = r.freq === "WEEKLY" ? 7 * r.interval : r.freq === "DAILY" ? r.interval : 0;
		if (step && diff % step === 0) slots = slotsFromRRule(row.rrule, row.startAt);
	}
	const ex = listDates(row.exdates).filter((d) => d.date === day);
	if (ex.some((d) => !d.time)) slots = [];
	else slots = slots.filter((s) => !ex.some((d) => d.time === s));
	listDates(row.rdates).filter((d) => d.date === day && d.time).forEach((d) => slots.push(d.time));
	return normalizeSlots(slots);
}
function localDay(now = /* @__PURE__ */ new Date()) {
	return `${now.getFullYear()}-${pad$1(now.getMonth() + 1)}-${pad$1(now.getDate())}`;
}
/**
* Calendar-backed schedules — CCT 187 "User's calendar event".
*   a60 event type  b55 = Medicine schedule, b56 = Health checkin
*   a57/a58 start/end, a66 RRULE, a68 EXDATES, a69 RDATES (RFC 5545)
*   a73 Reminders   RFC 5545 VALARM TRIGGER
* a90 Custom data is not used: every schedule value has a dictionary column.
* Ownership: Relation 190 (Users → 187) — for care schedules the parent is the
* cared one, not the author.
*/
var CAL = T.calendarEvent;
var FC = CAL.f;
var OC$1 = CAL.opt;
var EVENT_TYPE = {
	MEDICINE: OC$1["CUSTOM_EVENT_TYPE"]["MEDICINE_SCHEDULE"],
	CHECKIN: OC$1["CUSTOM_EVENT_TYPE"]["HEALTH_CHECKIN"],
	HABIT: OC$1["CUSTOM_EVENT_TYPE"]["HABIT"],
	TODO: OC$1["CUSTOM_EVENT_TYPE"]["TODO"]
};
var STATUS_CONFIRMED = OC$1["STATUS"]["CONFIRMED"];
var STATUS_CANCELLED = OC$1["STATUS"]["CANCELLED"];
var APP_CHALLENGED = "challenged";
var LOG_TYPE_HUMAN = "Human";
var REL_USER_EVENT = R.userCalendarEvents;
var numId = (v) => Number(String(v ?? "").replace(/^wp-/, ""));
var wpStr = (v) => v === null || v === void 0 || v === "" ? "" : String(v);
var numOrNull = (v) => v === null || v === void 0 || v === "" ? null : Number.isFinite(Number(v)) ? Number(v) : null;
async function linkRel(relId, parentId, childId) {
	await wordpressFetch(`jet-rel/${relId}`, {
		method: "POST",
		body: {
			parent_id: parentId,
			child_id: childId,
			context: "child",
			store_items_type: "update"
		}
	});
}
var FREQ_EN = {
	once_daily: "Once daily",
	twice_daily: "Twice daily",
	three_daily: "Three times daily",
	four_daily: "Four times daily",
	every_other_day: "Every other day",
	weekly: "Weekly",
	as_needed: "As needed"
};
function toFrequencyCode(value) {
	const v = String(value || "once_daily");
	if (FREQUENCY_CODES.includes(v)) return v;
	return Object.keys(FREQ_EN).find((k) => FREQ_EN[k].toLowerCase() === v.toLowerCase()) || "once_daily";
}
/** Reminder minutes-before ⇄ VALARM TRIGGER (a73). */
function buildReminders(minutesBefore) {
	const m = Number(minutesBefore);
	if (!Number.isFinite(m) || m <= 0) return "";
	return `BEGIN:VALARM\nTRIGGER:-PT${Math.round(m)}M\nACTION:DISPLAY\nEND:VALARM`;
}
function readReminderMinutes(raw) {
	const m = String(raw ?? "").match(/TRIGGER:-PT(?:(\d+)H)?(?:(\d+)M)?/i);
	if (!m) return null;
	const mins = Number(m[1] || 0) * 60 + Number(m[2] || 0);
	return mins > 0 ? mins : null;
}
/** a57 (and a58, a dose being an instant) for a start date and the first time. */
function startAtFor(startDate, slots) {
	return slots[0] ? `${startDate} ${slots[0]}:00` : `${startDate} 00:00:00`;
}
/** Both care schedule types use exactly the same dictionary time columns.
* Exception dates a68/a69 are untouched by an ordinary time edit; a70 is not
* an ordinary plan field. Never write a90 or a duplicate recurrence payload.
*/
function scheduleTimeColumns(frequency, times, startDate, endDate) {
	const slots = normalizeSlots(times);
	const freq = frequencyForSlots(toFrequencyCode(frequency), slots);
	const startAt = startAtFor(startDate, slots);
	return {
		[FC.START_AT]: startAt,
		[FC.END_AT]: startAt,
		[FC.RRULE]: buildRRule(freq, slots, endDate)
	};
}
/** All calendar events of one user (Relation 190) filtered by a60 event type. */
async function fetchEventsOfType(userId, eventType) {
	const uid = numId(userId);
	if (!uid) return [];
	const rels = await dedupeRead(`rel-children-raw:${REL_USER_EVENT}:${uid}`, () => wordpressFetch(`jet-rel/${REL_USER_EVENT}/children/${uid}`));
	const ids = (Array.isArray(rels) ? rels : []).map((r) => String(r?.child_object_id ?? "").replace(/^wp-/, "")).filter(Boolean);
	if (!ids.length) return [];
	return (await Promise.all(ids.map((id) => dedupeRead(`cct:${CAL.slug}:${id}`, () => wordpressCCTFetch(CAL.slug, { id }))))).filter((r) => r && typeof r === "object" && String(r[FC.CUSTOM_EVENT_TYPE]) === eventType);
}
async function createEvent(body, ownerId) {
	const created = await wordpressCCTFetch(CAL.slug, {
		method: "POST",
		body
	});
	const newId = numId(created?.item_id || created?._ID || created?.id);
	if (!newId) throw new Error("Schedule was not saved");
	await linkRel(REL_USER_EVENT, numId(ownerId), newId);
	return newId;
}
async function updateEvent(id, body) {
	if (!Object.keys(body).length) return;
	await wordpressCCTFetch(CAL.slug, {
		id,
		method: "PUT",
		body
	});
}
async function deleteEvent(id) {
	await wordpressCCTFetch(CAL.slug, {
		id,
		method: "DELETE"
	});
}
/** Read one event so a partial update keeps its existing recurrence. */
async function readEvent(id) {
	return wordpressCCTFetch(CAL.slug, { id });
}
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
* Recurrence uses only the calendar's RFC 5545 columns: a57/a58 start/end,
* a66 RRULE (times of day, frequency, UNTIL end date), a68 EXDATES, a69 RDATES,
* a73 VALARM. a90 Custom data is never read or written.
*/
var source_medicine_exports = /* @__PURE__ */ __exportAll({
	createMedicineWordPress: () => createMedicineWordPress,
	deleteMedicineWordPress: () => deleteMedicineWordPress,
	fetchAllMedicineLogsWordPress: () => fetchAllMedicineLogsWordPress,
	fetchMedicineLogsWordPress: () => fetchMedicineLogsWordPress,
	fetchMedicinesWordPress: () => fetchMedicinesWordPress,
	fetchTodayMedicineLogsWordPress: () => fetchTodayMedicineLogsWordPress,
	joinDosage: () => joinDosage,
	logMedicineWordPress: () => logMedicineWordPress,
	splitDosage: () => splitDosage,
	updateMedicineWordPress: () => updateMedicineWordPress
});
var LOG = T.userLogEvent;
var FL = LOG.f;
var OL = LOG.opt;
var OC = CAL.opt;
var REL_SCHEDULE_LOG = R.medicineScheduleLogs;
var RXNORM_SYSTEM = "http://www.nlm.nih.gov/research/umls/rxnorm";
function pad(n) {
	return String(n).padStart(2, "0");
}
function encodeLogType(codes) {
	const first = (codes || []).map((c) => String(c).toLowerCase())[0];
	if (first === "ai") return "AI";
	if (first === "human") return LOG_TYPE_HUMAN;
	return "";
}
function decodeLogType(raw) {
	const v = String(raw ?? "");
	if (v === "AI") return ["ai"];
	if (v === "Human") return ["human"];
	return [];
}
/** "1 tablet" / "10 mg" → { quantity, unit } */
function splitDosage(dosage) {
	const raw = String(dosage ?? "").trim();
	if (!raw) return {
		quantity: null,
		unit: ""
	};
	const m = raw.match(/^([\d.]+)\s*(.*)$/);
	if (!m) return {
		quantity: null,
		unit: raw
	};
	return {
		quantity: Number(m[1]),
		unit: (m[2] || "").trim()
	};
}
function joinDosage(quantity, unit) {
	if (quantity == null && !unit) return "";
	if (quantity == null) return unit;
	return unit ? `${quantity} ${unit}` : String(quantity);
}
var AS_NEEDED = OC["MEDICATION_SCHEDULE_TYPE"]["ASNEEDED"];
var SCHEDULED = OC["MEDICATION_SCHEDULE_TYPE"]["SCHEDULE"];
function mapSchedule(row, caredOneId) {
	const rawQuantity = numOrNull(row[FC.MEDICATION_DOSE_QUANTITY]);
	const quantity = rawQuantity && rawQuantity > 0 ? rawQuantity : null;
	const unit = row[FC.MEDICATION_DOSE_UNIT] || "";
	const asNeeded = String(row[FC.MEDICATION_SCHEDULE_TYPE] || "") === AS_NEEDED;
	const slots = asNeeded ? [] : slotsFromRRule(row[FC.RRULE], row[FC.START_AT]);
	const freqCode = frequencyFromRow(row[FC.RRULE], asNeeded, slots);
	const calendar = {
		startAt: row[FC.START_AT],
		rrule: row[FC.RRULE],
		exdates: row[FC.EXDATES],
		rdates: row[FC.RDATES]
	};
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
		created_at: row.cct_created || row.created_at
	};
}
async function fetchScheduleRows(caredOneId) {
	return fetchEventsOfType(caredOneId, EVENT_TYPE.MEDICINE);
}
async function fetchMedicinesWordPress(caredOneId) {
	return (await fetchScheduleRows(caredOneId)).map((r) => mapSchedule(r, caredOneId));
}
/** a57, a58, a66, a95 for one plan — the whole recurrence, nothing in a90. */
function recurrenceColumns(freqIn, slotsIn, startDate, endDate) {
	const slots = normalizeSlots(slotsIn);
	const freq = frequencyForSlots(toFrequencyCode(freqIn), slots);
	return {
		...scheduleTimeColumns(freq, slots, startDate, endDate),
		[FC.MEDICATION_SCHEDULE_TYPE]: freq === "as_needed" ? AS_NEEDED : SCHEDULED
	};
}
async function createMedicineWordPress(med) {
	const dose = med.dose_quantity != null || med.dose_unit ? {
		quantity: med.dose_quantity ?? null,
		unit: med.dose_unit || ""
	} : splitDosage(med.dosage);
	const startDate = med.start_date || localDay();
	await createEvent({
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
		[FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING]: wpStr(med.time_to_send_to_caregiver)
	}, med.user_id);
}
async function updateMedicineWordPress(id, updates) {
	const body = {};
	if (updates["name"] !== void 0) body[FC.TITLE] = updates["name"];
	if (updates["note"] !== void 0 || updates["notes"] !== void 0) body[FC.DESCRIPTION] = updates["note"] ?? updates["notes"] ?? "";
	if (updates["medication_concept_identifier"] !== void 0) body[FC.MEDICATION_CONCEPT_IDENTIFIER] = updates["medication_concept_identifier"] || "";
	if (updates["dosage"] !== void 0 || updates["dose_quantity"] !== void 0 || updates["dose_unit"] !== void 0) {
		const dose = updates["dose_quantity"] !== void 0 || updates["dose_unit"] !== void 0 ? {
			quantity: updates["dose_quantity"] ?? null,
			unit: updates["dose_unit"] || ""
		} : splitDosage(updates["dosage"]);
		body[FC.MEDICATION_DOSE_QUANTITY] = wpStr(dose.quantity);
		body[FC.MEDICATION_DOSE_UNIT] = dose.unit || "";
	}
	if (updates["is_active"] !== void 0) body[FC.STATUS] = updates["is_active"] ? STATUS_CONFIRMED : STATUS_CANCELLED;
	if (updates["reminder_time_before"] !== void 0) body[FC.REMINDERS] = buildReminders(updates["reminder_time_before"]);
	if (updates["stock_count"] !== void 0) body[FC.MEDICINE_STOCK] = wpStr(updates["stock_count"]);
	if (updates["refill_threshold"] !== void 0) body[FC.MEDICINE_REFILL] = wpStr(updates["refill_threshold"]);
	if (updates["prescribing_doctor"] !== void 0) body[FC.MEDICINE_PRESCRIBER] = updates["prescribing_doctor"] || "";
	if (updates["pharmacy"] !== void 0) body[FC.MEDICINE_BOUGHT_PHARMACY] = updates["pharmacy"] || "";
	if (updates["time_to_send_to_caregiver"] !== void 0) body[FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING] = wpStr(updates["time_to_send_to_caregiver"]);
	if (updates["check_in_type"] !== void 0) body[FC.MEDICINE_LOG_TYPE] = encodeLogType(updates["check_in_type"]);
	if ([
		"frequency",
		"time_slot",
		"start_date",
		"end_date"
	].some((k) => updates[k] !== void 0)) {
		const current = mapSchedule(await readEvent(id), "");
		Object.assign(body, recurrenceColumns(updates["frequency"] ?? current.frequency_code, updates["time_slot"] ?? current.time_slot, updates["start_date"] || current.start_date || localDay(), updates["end_date"] !== void 0 ? updates["end_date"] : current.end_date));
	}
	await updateEvent(id, body);
}
async function deleteMedicineWordPress(id) {
	await deleteEvent(id);
}
/** UI status → Apple LogStatus code. "missed" = notInteracted (Apple has no missed). */
var LOG_STATUS_CODE = {
	taken: OL["DOSE_EVENT_LOG_STATUS"]["TAKEN"],
	skipped: OL["DOSE_EVENT_LOG_STATUS"]["SKIPPED"],
	missed: OL["DOSE_EVENT_LOG_STATUS"]["NOT_INTERACTED"],
	snoozed: OL["DOSE_EVENT_LOG_STATUS"]["SNOOZED"],
	not_logged: OL["DOSE_EVENT_LOG_STATUS"]["NOT_LOGGED"],
	notification_not_sent: OL["DOSE_EVENT_LOG_STATUS"]["NOTIFICATION_NOT_SENT"]
};
var LOG_STATUS_LABEL = Object.fromEntries(Object.entries(LOG_STATUS_CODE).map(([k, v]) => [v, k]));
function mapLog(row, medicineId, fallbackId) {
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
		logged_by: row.cct_author_id || null
	};
}
/** Only the medicine rows of CCT 161 (a57 = b69 Custom medicine). */
function isMedicineLogRow(row) {
	const type = String(row?.[FL.LOG_EVENT_TYPE] ?? "");
	if (!type) return !!row?.[FL.DOSE_EVENT_LOG_STATUS];
	return type === OL["LOG_EVENT_TYPE"]["CUSTOM_MEDICINE"];
}
async function fetchMedicineLogsWordPress(medicineId) {
	const rels = await wordpressFetch(`jet-rel/${REL_SCHEDULE_LOG}/children/${numId(medicineId)}`);
	const ids = (Array.isArray(rels) ? rels : []).map((r) => String(r?.child_object_id ?? "").replace(/^wp-/, "")).filter(Boolean);
	return (await Promise.all(ids.map((id) => wordpressCCTFetch(LOG.slug, { id }).then((r) => isMedicineLogRow(r) ? mapLog(r, medicineId, id) : null)))).filter(Boolean).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
/** One schedule's own dose logs: its REL children, then those rows in one IN read — never the whole relation. */
async function scheduleLogs(mid) {
	const ids = (await fetchRelChildrenOf(REL_SCHEDULE_LOG, mid)).map((c) => c.childId);
	return (await readLinkedCCTRows(LOG.slug, ids)).filter(isMedicineLogRow).map((l) => mapLog(l, mid, String(l.id ?? l._ID)));
}
/** All dose logs for every medicine schedule of this cared one, newest first. */
async function fetchAllMedicineLogsWordPress(caredOneId) {
	const [rows] = await Promise.all([fetchScheduleRows(caredOneId)]);
	if (rows.length === 0) return [];
	const out = [];
	await Promise.all(rows.map(async (row) => {
		const mid = String(row.id || row._ID);
		const medName = row[FC.TITLE] || "";
		(await scheduleLogs(mid)).forEach((l) => out.push({
			...l,
			med_name: medName
		}));
	}));
	return out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
async function fetchTodayMedicineLogsWordPress(caredOneId) {
	const [rows] = await Promise.all([fetchScheduleRows(caredOneId)]);
	if (rows.length === 0) return [];
	const today = /* @__PURE__ */ new Date();
	today.setHours(0, 0, 0, 0);
	const out = [];
	await Promise.all(rows.map(async (row) => {
		const logs = await scheduleLogs(String(row.id || row._ID));
		const day = localDay();
		logs.forEach((l) => {
			const doseDay = dateOf(l.scheduled_date);
			if (doseDay ? doseDay === day : l.created_at && new Date(l.created_at) >= today) out.push(l);
		});
	}));
	return out;
}
async function logMedicineWordPress(log) {
	const status = LOG_STATUS_CODE[String(log.status || "taken").toLowerCase()] || LOG_STATUS_CODE["taken"];
	const now = /* @__PURE__ */ new Date();
	const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
	const body = {
		[FL.LOG_EVENT_NAME]: log.concept_display_text || "Medication",
		[FL.LOG_EVENT_TYPE]: OL["LOG_EVENT_TYPE"]["CUSTOM_MEDICINE"],
		[FL.DOSE_EVENT_LOG_STATUS]: status,
		[FL.DOSE_EVENT_NOTE]: log.note || "",
		[FL.LOG_MEDICINE_NOTE]: log.note || "",
		[FL.DOSE_QUANTITY]: log.status === "taken" ? wpStr(log.dose_quantity ?? log.scheduled_dose_quantity) : "",
		[FL.SCHEDULED_DOSE_QUANTITY]: wpStr(log.scheduled_dose_quantity),
		[FL.DOSE_UNIT]: log.dose_unit || "",
		[FL.SCHEDULED_DATE]: log.scheduled_date || stamp,
		[FL.SCHEDULE_TYPE]: log.schedule_type || OL["SCHEDULE_TYPE"]["SCHEDULE"],
		[FL.CONCEPT_IDENTIFIER]: log.concept_identifier || "",
		[FL.CONCEPT_DISPLAY_TEXT]: log.concept_display_text || "",
		[FL.CONCEPT_GENERAL_FORM]: log.concept_general_form || "",
		[FL.CLINICAL_CODING_SYSTEM]: log.rxcui ? RXNORM_SYSTEM : "",
		[FL.CLINICAL_CODING_CODE]: log.rxcui || "",
		[FL.CHECKED_BY_AI]: log.logged_by_ai ? OL["CHECKED_BY_AI"]["YES"] : OL["CHECKED_BY_AI"]["NO"],
		[FL.LOG_EVENT_TIME]: stamp,
		[FL.FOR_APP]: "challenged"
	};
	const created = await wordpressCCTFetch(LOG.slug, {
		method: "POST",
		body
	});
	const newId = numId(created?.item_id || created?._ID || created?.id);
	if (!newId) throw new Error("Dose log was not saved");
	await linkRel(REL_SCHEDULE_LOG, numId(log.medicine_id), newId);
	if (log.user_id) try {
		await linkRel(R.userLogEvents, numId(log.user_id), newId);
	} catch {}
	if (log.user_id) try {
		const caregiverIds = await wordpressFetch(`jet-rel/${R.userCaredOnes}/parents/${numId(log.user_id)}`).then((rows) => Array.isArray(rows) ? rows.map((r) => String(r.parent_object_id)) : []).catch(() => []);
		const { notifyMedicineDose } = await import("../_libs/_12.mjs").then((n) => n.n);
		await notifyMedicineDose(caregiverIds, String(log.user_id), log.concept_display_text || "Medication", String(log.status || "taken").toLowerCase());
	} catch {}
}
//#endregion
export { slotsNeeded as A, normalizeSlots as C, readReminderMinutes as D, readEvent as E, toFrequencyCode as M, updateEvent as N, scheduleTimeColumns as O, updateMedicineWordPress as P, logMedicineWordPress as S, parseRRule as T, fetchMedicinesWordPress as _, LOG_TYPE_HUMAN as a, frequencyFromRow as b, buildReminders as c, dateOf as d, deleteEvent as f, fetchMedicineLogsWordPress as g, fetchEventsOfType as h, FREQ_EN as i, source_medicine_exports as j, slotsFromRRule as k, createEvent as l, fetchAllMedicineLogsWordPress as m, EVENT_TYPE as n, STATUS_CANCELLED as o, deleteMedicineWordPress as p, FC as r, STATUS_CONFIRMED as s, APP_CHALLENGED as t, createMedicineWordPress as u, fetchTodayMedicineLogsWordPress as v, occurrencesOn as w, localDay as x, frequencyForSlots as y };
