import "../_runtime.mjs";
import { r as T } from "./wp-schema-Dnlz0TVP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pending-Cmgt3sc7.js
var carePersonId = (value) => String(value ?? "").replace(/^wp-/, "");
function isPendingCareTask(task) {
	if (task.finish_status) return task.finish_status === T.careTask.opt.TASK_FINISH_STATUS.NOT_FINISHED;
	return task.status === "pending";
}
function pendingCareTasks(tasks, personIds) {
	const people = new Set(personIds.map(carePersonId).filter(Boolean));
	return (tasks || []).filter((task) => people.has(carePersonId(task.cared_one_id)) && isPendingCareTask(task));
}
function pendingCareTaskTarget(tasks, fallbackPersonId) {
	const person = carePersonId(tasks[0]?.cared_one_id || fallbackPersonId);
	return person ? `/cared-ones/${person}/tasks` : "/cared-ones";
}
//#endregion
export { pendingCareTasks as n, pendingCareTaskTarget as t };
