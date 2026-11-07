import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dose-slot--5Nbxcmi.js
var dose_slot_exports = /* @__PURE__ */ __exportAll({
	findDoseLog: () => findDoseLog,
	slotOfDatetime: () => slotOfDatetime,
	todayAtSlot: () => todayAtSlot
});
/**
* One dose = one schedule (CCT 187) + one daily time slot. A dose log
* (CCT 161) records which slot it belongs to in a88 Scheduled date, so
* logging the 08:00 dose never marks the 12:00 dose as done.
*/
function pad(n) {
	return String(n).padStart(2, "0");
}
/** "HH:MM" of a stored datetime such as "2026-10-27 08:00:00" or ISO. */
function slotOfDatetime(value) {
	const m = String(value ?? "").match(/[ T](\d{2}):(\d{2})/);
	return m ? `${m[1]}:${m[2]}` : null;
}
/** Today's local date at the slot, in the CCT datetime format. */
function todayAtSlot(slot, now = /* @__PURE__ */ new Date()) {
	const [h = "0", m = "0"] = slot.split(":");
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(Number(h))}:${pad(Number(m))}:00`;
}
/** The log that belongs to this medicine's slot (no slot → any log of the medicine). */
function findDoseLog(logs, medicineId, slot) {
	const mine = logs.filter((l) => String(l.medicine_id) === String(medicineId));
	if (!slot) return mine[0];
	return mine.find((l) => slotOfDatetime(l.scheduled_date) === slot.substring(0, 5));
}
//#endregion
export { findDoseLog as n, todayAtSlot as r, dose_slot_exports as t };
