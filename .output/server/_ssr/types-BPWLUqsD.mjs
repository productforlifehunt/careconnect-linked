import "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/types-BPWLUqsD.js
/** Color palette per event_type — semantic, no hard-coded UI colors */
var EVENT_TYPE_COLORS = {
	personal: "hsl(258 90% 66%)",
	family: "hsl(330 81% 60%)",
	medicine: "hsl(0 72% 51%)",
	task: "hsl(217 91% 60%)",
	appointment: "hsl(173 80% 40%)",
	availability: "hsl(142 71% 45%)",
	birthday: "hsl(45 93% 47%)",
	holiday: "hsl(280 65% 60%)",
	booking: "hsl(199 89% 48%)",
	check_in: "hsl(20 90% 55%)"
};
var EVENT_TYPE_LABELS = {
	personal: "Personal",
	family: "Family",
	medicine: "Medicine",
	task: "Task",
	appointment: "Appointment",
	availability: "Availability",
	birthday: "Birthday",
	holiday: "Holiday",
	booking: "Booking",
	check_in: "Check-in"
};
var EVENT_TYPE_LABELS_ZH = {
	personal: "个人",
	family: "家庭",
	medicine: "用药",
	task: "任务",
	appointment: "约诊",
	availability: "可约时间",
	birthday: "生日",
	holiday: "假期",
	booking: "预约",
	check_in: "签到"
};
function getEventTypeLabel(type, lang) {
	return (lang?.startsWith("zh") ? EVENT_TYPE_LABELS_ZH : EVENT_TYPE_LABELS)[type] || type;
}
//#endregion
export { getEventTypeLabel as n, EVENT_TYPE_COLORS as t };
