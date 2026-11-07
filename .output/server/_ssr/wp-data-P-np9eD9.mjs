import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wp-data-P-np9eD9.js
var wp_data_exports = /* @__PURE__ */ __exportAll({
	wpFetchBookings: () => wpFetchBookings,
	wpFetchCareGroups: () => wpFetchCareGroups,
	wpFetchCareTasks: () => wpFetchCareTasks,
	wpFetchCaredOnes: () => wpFetchCaredOnes,
	wpFetchConversations: () => wpFetchConversations,
	wpFetchOrders: () => wpFetchOrders,
	wpFetchProviderBookings: () => wpFetchProviderBookings
});
async function wpFetchOrders(perPage = 20) {
	try {
		const { getMyCustomerOrders } = await import("../_libs/_5.mjs").then((n) => n.x);
		return await getMyCustomerOrders(perPage);
	} catch {
		return [];
	}
}
/** Store data comes back HTML-escaped (e.g. "&amp;"); show real characters. */
function decodeEntities(value) {
	if (!value) return "";
	if (typeof document === "undefined") return value;
	const el = document.createElement("textarea");
	el.innerHTML = value;
	return el.value;
}
function getOrderMeta(order, key) {
	return order.meta_data?.find((m) => m.key === key)?.value || "";
}
function mapWcOrderToBooking(o, nativeBookingMap) {
	const wcStatus = o.status;
	let status = wcStatus;
	if (wcStatus === "processing") status = "confirmed";
	else if (wcStatus === "on-hold") status = "pending";
	else if (wcStatus === "completed") status = "completed";
	else if (wcStatus === "cancelled") status = "cancelled";
	else if (wcStatus === "refunded") status = "refunded";
	const nativeBooking = nativeBookingMap?.get(Number(o.id));
	let appointmentDate = "";
	let appointmentTime = "";
	let durationHour = "";
	if (nativeBooking?.start) {
		const d = /* @__PURE__ */ new Date(nativeBooking.start * 1e3);
		const pad = (n) => String(n).padStart(2, "0");
		appointmentDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		appointmentTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
		if (nativeBooking.end > nativeBooking.start) durationHour = String(Math.round((nativeBooking.end - nativeBooking.start) / 3600 * 100) / 100);
	}
	if (!appointmentDate) appointmentDate = getOrderMeta(o, "_appointment_date");
	if (!appointmentTime) appointmentTime = getOrderMeta(o, "_appointment_time");
	if (!durationHour) durationHour = getOrderMeta(o, "_duration_hours") || String(o.line_items?.[0]?.quantity || "");
	const hourlyRate = parseFloat(getOrderMeta(o, "_hourly_rate") || "0");
	const serviceType = decodeEntities(getOrderMeta(o, "_service_type") || o.line_items?.[0]?.name || "Care Service");
	const providerId = getOrderMeta(o, "_provider_id");
	const specialInstruction = getOrderMeta(o, "_special_instructions");
	const providerName = decodeEntities(o.line_items?.[0]?.name?.replace(/ – Care Service$/, "") || "Provider");
	const billingName = `${o.billing?.first_name || ""} ${o.billing?.last_name || ""}`.trim() || o.billing?.email || "Client";
	return {
		id: String(o.id),
		wc_order_id: o.id,
		status,
		appointment_date: appointmentDate || o.date_created?.split("T")[0] || "",
		appointment_time: appointmentTime,
		duration_hour: durationHour,
		service_type: serviceType,
		hourly_rate: hourlyRate,
		total_cost: parseFloat(o.total || "0"),
		special_instruction: specialInstruction,
		provider_id: providerId,
		provider: { full_name: providerName },
		client: {
			full_name: billingName,
			email: o.billing?.email || ""
		},
		payment_status: o.date_paid ? "paid" : "pending",
		refund_status: getOrderMeta(o, "_refund_status"),
		refund_reason: getOrderMeta(o, "_refund_reason"),
		refund_amount: getOrderMeta(o, "_refund_amount"),
		created_at: o.date_created
	};
}
async function wpFetchBookings() {
	try {
		const orders = await wpFetchOrders(50);
		if (!Array.isArray(orders)) return [];
		return orders.map((o) => mapWcOrderToBooking(o));
	} catch {
		return [];
	}
}
async function wpFetchCareTasks() {
	const { fetchCareTasksWordPress } = await import("../_libs/_20.mjs").then((n) => n.a);
	const { filterVisibleTasks } = await import("../_libs/_16.mjs").then((n) => n.a);
	return filterVisibleTasks(await fetchCareTasksWordPress());
}
/**
* Cared ones come from JetEngine Relation 219 only. The old `cared_one` CPT
* never existed on this install (wp/v2/cared_one returns 404), so it is not used.
*/
async function wpFetchCaredOnes() {
	try {
		const { fetchUserCaredOnesWordPress } = await import("../_libs/_9.mjs").then((n) => n.n);
		const rows = await fetchUserCaredOnesWordPress();
		if (!Array.isArray(rows)) return [];
		return rows;
	} catch {
		return [];
	}
}
async function wpFetchCareGroups() {
	const { fetchCareGroupsWordPress } = await import("../_libs/_7.mjs").then((n) => n.a);
	return fetchCareGroupsWordPress();
}
async function wpFetchConversations() {
	const { fetchConversationsWordPress } = await import("../_libs/_21.mjs").then((n) => n.o);
	const { getStoredWPUser } = await import("../_libs/_.mjs").then((n) => n.f);
	const user = getStoredWPUser();
	if (!user?.user_id) return [];
	return fetchConversationsWordPress(`wp-${user.user_id}`);
}
async function wpFetchProviderBookings() {
	try {
		const { getDokanVendorOrders } = await import("../_libs/_5.mjs").then((n) => n.x);
		const orders = await getDokanVendorOrders();
		if (!Array.isArray(orders)) return [];
		return orders.map((o) => mapWcOrderToBooking(o));
	} catch {
		return [];
	}
}
//#endregion
export { wpFetchProviderBookings as n, wp_data_exports as r, wpFetchBookings as t };
