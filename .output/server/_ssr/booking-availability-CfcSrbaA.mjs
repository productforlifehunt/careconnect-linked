import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as fetchCalendarEventsForUserWordPress, r as deleteCalendarEventWordPress, t as createCalendarEventForUserWordPress } from "./source.wordpress-AL18NEGx.mjs";
import { n as RRule } from "../_libs/@fullcalendar/rrule+[...].mjs";
import { t as EVENT_TYPE_COLORS } from "./types-BPWLUqsD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/booking-availability-CfcSrbaA.js
var booking_availability_exports = /* @__PURE__ */ __exportAll({
	getAvailabilityConflictMessage: () => getAvailabilityConflictMessage,
	getProviderCalendarAvailability: () => getProviderCalendarAvailability,
	getProviderCalendarBookingConflictMessage: () => getProviderCalendarBookingConflictMessage,
	upsertProviderCalendarAvailability: () => upsertProviderCalendarAvailability
});
function normalizeWPUserId(id) {
	return String(id ?? "").replace(/^wp-/, "");
}
function toDate(date, time) {
	return /* @__PURE__ */ new Date(`${date}T${time}:00`);
}
function addHours(date, hours) {
	return new Date(date.getTime() + hours * 60 * 60 * 1e3);
}
function toTime(value) {
	return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
}
function rangesOverlap(startA, endA, startB, endB) {
	return startA < endB && startB < endA;
}
function isBlockingEvent(event) {
	if (event.status === "cancelled") return false;
	if (event.is_availability) return false;
	return event.show_as !== "free";
}
function expandEventRanges(event, windowStart, windowEnd) {
	const eventStart = new Date(event.start_at);
	const eventEnd = new Date(event.end_at || event.start_at);
	if (Number.isNaN(eventStart.getTime()) || Number.isNaN(eventEnd.getTime())) return [];
	if (!event.rrule) return [{
		start: eventStart,
		end: eventEnd
	}];
	try {
		const duration = Math.max(1, eventEnd.getTime() - eventStart.getTime());
		const options = RRule.parseString(event.rrule);
		const until = event.rrule_until ? new Date(event.rrule_until) : void 0;
		return new RRule({
			...options,
			dtstart: eventStart,
			...until && !Number.isNaN(until.getTime()) ? { until } : {}
		}).between(windowStart, windowEnd, true).map((start) => ({
			start,
			end: new Date(start.getTime() + duration)
		}));
	} catch {
		return [{
			start: eventStart,
			end: eventEnd
		}];
	}
}
function isAvailabilityManagedEvent(event) {
	return event.is_availability || event.event_type === "availability";
}
function calendarEventsToAvailability(events) {
	return events.filter((event) => event.status !== "cancelled" && isAvailabilityManagedEvent(event)).map((event) => ({
		kind: event.rrule?.includes("FREQ=WEEKLY") ? "weekly" : "date",
		type: "calendar-event",
		day_of_week: event.rrule?.includes("FREQ=WEEKLY") ? new Date(event.start_at).getDay() : void 0,
		specific_date: event.rrule?.includes("FREQ=WEEKLY") ? void 0 : event.start_at.slice(0, 10),
		start_time: toTime(new Date(event.start_at)),
		end_time: toTime(new Date(event.end_at || event.start_at)),
		is_available: event.is_availability || event.show_as === "free",
		priority: 10,
		bookable: event.is_availability || event.show_as === "free" ? "yes" : "no",
		from: event.start_at,
		to: event.end_at
	}));
}
function availabilityRangesForDate(events, date) {
	const dayStart = /* @__PURE__ */ new Date(`${date}T00:00:00`);
	const dayEnd = /* @__PURE__ */ new Date(`${date}T23:59:59`);
	return events.filter((event) => event.status !== "cancelled" && isAvailabilityManagedEvent(event)).flatMap((event) => expandEventRanges(event, dayStart, dayEnd).map((range) => ({
		start: range.start,
		end: range.end,
		is_available: event.is_availability || event.show_as === "free"
	})));
}
async function getProviderCalendarAvailability(providerId) {
	return calendarEventsToAvailability(await fetchCalendarEventsForUserWordPress(providerId));
}
async function upsertProviderCalendarAvailability(providerIdInput, slots) {
	const providerId = normalizeWPUserId(providerIdInput);
	if (!providerId) throw new Error("Provider user id is required");
	const existing = await fetchCalendarEventsForUserWordPress(providerId);
	await Promise.all(existing.filter(isAvailabilityManagedEvent).map((event) => deleteCalendarEventWordPress(event.id).catch(() => void 0)));
	const today = /* @__PURE__ */ new Date();
	const startOfWeek = new Date(today);
	startOfWeek.setDate(today.getDate() - today.getDay());
	return (await Promise.all((slots || []).map((slot) => {
		const isAvailable = Boolean(slot.is_available);
		const date = slot.specific_date || (() => {
			const d = new Date(startOfWeek);
			d.setDate(startOfWeek.getDate() + Number(slot.day_of_week || 0));
			return d.toISOString().slice(0, 10);
		})();
		const startTime = slot.start_time || "00:00";
		const endTime = slot.end_time || (isAvailable ? "23:59" : "23:59");
		return createCalendarEventForUserWordPress(providerId, {
			title: isAvailable ? "Available" : "Unavailable",
			start_at: toDate(date, startTime).toISOString(),
			end_at: toDate(date, endTime).toISOString(),
			all_day: !isAvailable && !slot.start_time && !slot.end_time,
			status: "confirmed",
			priority: "normal",
			color: EVENT_TYPE_COLORS.availability,
			event_type: "availability",
			show_as: isAvailable ? "free" : "busy",
			visibility: "public",
			is_availability: isAvailable,
			availability_note: isAvailable ? "Available for care booking" : "Unavailable",
			rrule: slot.specific_date ? void 0 : "FREQ=WEEKLY"
		});
	}))).filter(Boolean);
}
async function getProviderCalendarBookingConflictMessage(providerId, date, time, durationHours = 0) {
	if (!providerId || !date || !time || !durationHours) return null;
	const requestedStart = toDate(date, time);
	const requestedEnd = addHours(requestedStart, durationHours);
	const events = await fetchCalendarEventsForUserWordPress(providerId);
	const availabilityRanges = availabilityRangesForDate(events, date).filter((slot) => slot.is_available);
	if (availabilityRanges.length === 0) return "Caregiver has no available calendar slot for this time.";
	if (!availabilityRanges.some((slot) => {
		return requestedStart >= slot.start && requestedEnd <= slot.end;
	})) {
		const ranges = availabilityRanges.map((slot) => `${toTime(slot.start)}–${toTime(slot.end)}`).join(", ");
		return ranges ? `Caregiver is available: ${ranges}` : "Caregiver is not available at this time.";
	}
	const windowStart = /* @__PURE__ */ new Date(requestedStart.getTime() - 1440 * 60 * 1e3);
	const windowEnd = new Date(requestedEnd.getTime() + 1440 * 60 * 1e3);
	const conflict = events.filter(isBlockingEvent).flatMap((event) => expandEventRanges(event, windowStart, windowEnd)).find((range) => rangesOverlap(requestedStart, requestedEnd, range.start, range.end));
	if (!conflict) return null;
	return `Caregiver already has a calendar event from ${toTime(conflict.start)} to ${toTime(conflict.end)}.`;
}
/**
* Pure check of a requested slot against the caregiver's weekly / date-specific
* availability derived from CCT 187. No WooCommerce involved.
*/
function getAvailabilityConflictMessage(availability = [], date, time, durationHours = 0) {
	if (!date || !time || !availability || availability.length === 0) return null;
	const toMinutes = (v) => {
		const [h, m] = String(v).split(":").map(Number);
		return (h || 0) * 60 + (m || 0);
	};
	const dayOfWeek = (/* @__PURE__ */ new Date(`${date}T12:00:00`)).getDay();
	const specificSlots = availability.filter((slot) => slot.specific_date === date);
	const evaluateDuration = (slot) => {
		if (!durationHours || !slot.end_time) return null;
		const endMinutes = toMinutes(time) + durationHours * 60;
		if (endMinutes > toMinutes(slot.end_time)) return `Session would end at ${Math.floor(endMinutes / 60)}:${String(endMinutes % 60).padStart(2, "0")} but the caregiver is available until ${slot.end_time}.`;
		return null;
	};
	const evaluate = (slots, emptyMessage) => {
		if (slots.some((slot) => !slot.is_available && !slot.start_time && !slot.end_time)) return "Caregiver is not available on this date.";
		const match = slots.find((slot) => slot.is_available && slot.start_time && slot.end_time && time >= slot.start_time && time < slot.end_time);
		if (match) return evaluateDuration(match);
		const ranges = slots.filter((slot) => slot.is_available && slot.start_time && slot.end_time).map((slot) => `${slot.start_time}–${slot.end_time}`).join(", ");
		return ranges ? `Caregiver is available ${ranges}.` : emptyMessage;
	};
	if (specificSlots.length > 0) return evaluate(specificSlots, "Caregiver is not available on this date.");
	const weeklySlots = availability.filter((slot) => slot.day_of_week === dayOfWeek);
	if (weeklySlots.length === 0) return "Caregiver has no availability set for this day.";
	return evaluate(weeklySlots, "Caregiver is not available on this day.");
}
//#endregion
export { getAvailabilityConflictMessage as n, getProviderCalendarBookingConflictMessage as r, booking_availability_exports as t };
