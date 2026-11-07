import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { t as instance } from "../_libs/i18next.mjs";
import { s as fetchMyAppUserName } from "./app-profile-DeZHIfiB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notify-events-1KsuTnlc.js
/**
* Event → notification fan-out helpers.
*
* Every user-visible collaboration event (new message, task assignment, job
* application, group announcement, booking status change) routes through here
* so it lands in the recipient's inbox via the single notification edge
* function (`challenged-notify` / `carecnc-notify`).
*
* All helpers are strictly NON-BLOCKING: a notification failure must never
* roll back or fail the underlying write that already succeeded.
*/
var notify_events_exports = /* @__PURE__ */ __exportAll({
	clearActorNameCache: () => clearActorNameCache,
	notifyBookingStatus: () => notifyBookingStatus,
	notifyCheckIn: () => notifyCheckIn,
	notifyGroupInvite: () => notifyGroupInvite,
	notifyGroupPost: () => notifyGroupPost,
	notifyInviteResponse: () => notifyInviteResponse,
	notifyJoinRequest: () => notifyJoinRequest,
	notifyJoinRequestAnswered: () => notifyJoinRequestAnswered,
	notifyMedicineDose: () => notifyMedicineDose,
	notifyMemberRemoved: () => notifyMemberRemoved,
	notifyMemberRoleChanged: () => notifyMemberRoleChanged,
	notifyNewMessage: () => notifyNewMessage,
	notifySubgroupApproved: () => notifySubgroupApproved,
	notifyTaskAssigned: () => notifyTaskAssigned,
	notifyTaskHelpOffer: () => notifyTaskHelpOffer,
	notifyTaskStatusChanged: () => notifyTaskStatusChanged,
	notifyUsers: () => notifyUsers,
	recipientsExcludingSelf: () => recipientsExcludingSelf
});
/**
* The actor's name comes ONLY from this app's own column on CCT 151.
* The shared WordPress login / display name is never a fallback: when the
* profile name is empty the message simply omits the name.
*/
var actorNameCache = null;
async function actorAppName() {
	if (actorNameCache !== null) return actorNameCache;
	try {
		actorNameCache = await fetchMyAppUserName();
	} catch {
		actorNameCache = "";
	}
	return actorNameCache;
}
function clearActorNameCache() {
	actorNameCache = null;
}
/** Recipients read notifications in the language of the app they are using. */
var Z = (zh, en) => (instance.language || "").startsWith("zh") ? zh : en;
var strip = (id) => id == null ? "" : String(id).replace(/^wp-/, "");
/**
* Recipients minus the actor, de-duplicated, empty entries dropped.
* Kept as a thin re-export: the rule itself lives in the notification skill.
*/
async function recipientsExcludingSelf(ids) {
	const { notificationRecipients } = await import("../_libs/_11.mjs").then((n) => n.i);
	return notificationRecipients(ids);
}
/**
* Fire notifications to a list of recipients. Never throws.
*
* This file stores ONLY trigger conditions and wording. The data structure
* (CCT 185, a55–a59, action url a58, user→notification relation, per-app
* branch) and the actual read/write live in the `send-notification` skill in
* `src/lib/ai-dynamic-knowledge.ts`, which AI and non-AI callers share.
*/
async function notifyUsers(userIds, payload) {
	try {
		const { runNotificationSkill } = await import("../_libs/_11.mjs").then((n) => n.i);
		return await runNotificationSkill("send-notification", {
			userIds,
			type: payload.type,
			title: payload.title,
			message: payload.message,
			actionUrl: payload.action_url ?? null
		});
	} catch {
		return 0;
	}
}
var clip = (s, n = 140) => (s || "").length > n ? `${(s || "").slice(0, n - 1)}…` : s || "";
/** New chat message → notify the other participant(s). */
function notifyNewMessage(recipientIds, conversationId, content) {
	return actorAppName().then((who) => notifyUsers(recipientIds, {
		type: "chat",
		title: who ? Z(`${who} 给你发来新消息`, `New message from ${who}`) : Z("你有一条新消息", "You have a new message"),
		message: clip(content),
		action_url: `/inbox?tab=messages&conversation=${conversationId}`
	}));
}
/** Care task assigned → notify each assignee. */
function notifyTaskAssigned(assigneeIds, taskTitle, taskId) {
	return notifyUsers(assigneeIds, {
		type: "task",
		title: Z("有一项照护任务交给你", "You were assigned a care task"),
		message: clip(taskTitle),
		action_url: `/care-circle?tab=tasks&id=${taskId}`
	});
}
/** Caregiver applied to a job → notify the poster. */
function notifyTaskHelpOffer(posterId, taskTitle, taskId) {
	return actorAppName().then((who) => notifyUsers([posterId], {
		type: "task",
		title: Z("有人愿意帮你这件事", "Someone offered to help"),
		message: who ? Z(`${who} 想帮你完成「${clip(taskTitle, 80)}」`, `${who} offered to help with ${clip(taskTitle, 80)}`) : Z(`有人想帮你完成「${clip(taskTitle, 80)}」`, `Someone offered to help with ${clip(taskTitle, 80)}`),
		action_url: `/tasks?id=${taskId}`
	}));
}
/** Group announcement/post → notify group members. */
function notifyGroupPost(memberIds, groupId, title, isAnnouncement) {
	return notifyUsers(memberIds, {
		type: "system",
		title: isAnnouncement ? Z("护理小组有新公告", "New announcement in your care group") : Z("护理小组有新帖子", "New post in your care group"),
		message: clip(title),
		action_url: `/care-circle/${String(groupId).replace(/^wp-/, "")}?tab=${isAnnouncement ? "announcements" : "posts"}`
	});
}
/** Booking status changed → notify the counterpart. */
function notifyBookingStatus(recipientIds, bookingId, status) {
	const label = {
		confirmed: Z("你的预约已确认", "Your booking was confirmed"),
		completed: Z("你的预约已完成", "Your booking was marked complete"),
		pending: Z("你的预约正在等待确认", "Your booking is awaiting confirmation")
	};
	return notifyUsers(recipientIds, {
		type: "booking",
		title: status.startsWith("cancelled") ? Z("你的预约已取消", "Your booking was cancelled") : label[status] || Z("你的预约有更新", "Your booking was updated"),
		message: Z(`预约 #${bookingId} 现在是「${status.replace(/_/g, " ")}」。`, `Booking #${bookingId} is now ${status.replace(/_/g, " ")}.`),
		action_url: `/bookings?id=${bookingId}`
	});
}
/**
* Actor sentence builder. `who` is the CCT 151 app name, or "" when the user
* has not set it — in that case the sentence drops the name instead of
* inventing one from the shared WordPress account.
*/
function withActor(build) {
	return actorAppName().then((who) => build(who));
}
/**
* Group invitation created → notify the invited user. The notification carries
* the invite link itself: accepting means opening the link and finishing the
* group onboarding popup.
*/
function notifyGroupInvite(inviteeId, groupName, inviteUrl) {
	let path = "/care-circle";
	if (inviteUrl) try {
		path = new URL(inviteUrl).pathname;
	} catch {
		path = inviteUrl;
	}
	return withActor((who) => notifyUsers([inviteeId], {
		type: "system",
		title: Z("有人邀请你加入护理小组", "You were invited to a care group"),
		message: who ? Z(`${who} 邀请你加入「${clip(groupName, 80)}」。`, `${who} invited you to join ${clip(groupName, 80)}.`) : Z(`你被邀请加入「${clip(groupName, 80)}」。`, `You were invited to join ${clip(groupName, 80)}.`),
		action_url: path
	}));
}
/** Invitation accepted / declined → notify the group's owners and admins. */
function notifyInviteResponse(adminIds, groupId, groupName, accepted) {
	return withActor((who) => notifyUsers(adminIds, {
		type: "system",
		title: accepted ? Z("护理小组邀请已被接受", "Care group invitation accepted") : Z("护理小组邀请被拒绝", "Care group invitation declined"),
		message: who ? Z(`${who} ${accepted ? "加入了" : "拒绝加入"}「${clip(groupName, 80)}」。`, `${who} ${accepted ? "joined" : "declined to join"} ${clip(groupName, 80)}.`) : Z(`有人${accepted ? "加入了" : "拒绝加入"}「${clip(groupName, 80)}」。`, `Someone ${accepted ? "joined" : "declined to join"} ${clip(groupName, 80)}.`),
		action_url: `/care-circle/${String(groupId).replace(/^wp-/, "")}?tab=members`
	}));
}
/** Someone opened the group link and asked to join → notify owners and admins. */
function notifyJoinRequest(adminIds, groupName, requestPath) {
	return withActor((who) => notifyUsers(adminIds, {
		type: "system",
		title: Z("有人申请加入护理小组", "Someone asked to join your care group"),
		message: who ? Z(`${who} 申请加入「${clip(groupName, 80)}」，点开即可同意或拒绝。`, `${who} asked to join ${clip(groupName, 80)}. Open to accept or decline.`) : Z(`有人申请加入「${clip(groupName, 80)}」，点开即可同意或拒绝。`, `Someone asked to join ${clip(groupName, 80)}. Open to accept or decline.`),
		action_url: requestPath
	}));
}
/** An admin answered a join request → notify the person who asked. */
function notifyJoinRequestAnswered(requesterId, groupName, approved, groupPath) {
	return notifyUsers([requesterId], {
		type: "system",
		title: approved ? Z("你已加入护理小组", "You joined the care group") : Z("加入申请未通过", "Join request declined"),
		message: approved ? Z(`管理员同意了你加入「${clip(groupName, 80)}」的申请。`, `An admin let you into ${clip(groupName, 80)}.`) : Z(`管理员没有同意你加入「${clip(groupName, 80)}」的申请。`, `An admin declined your request to join ${clip(groupName, 80)}.`),
		action_url: groupPath
	});
}
/** Member role changed → notify that member. */
function notifyMemberRoleChanged(memberId, groupId, roleLabel) {
	return withActor((who) => notifyUsers([memberId], {
		type: "system",
		title: Z("你在护理小组里的身份变了", "Your care group role changed"),
		message: who ? Z(`${who} 把你的身份设为「${clip(roleLabel, 60)}」。`, `${who} set your role to ${clip(roleLabel, 60)}.`) : Z(`你的身份被设为「${clip(roleLabel, 60)}」。`, `Your role was set to ${clip(roleLabel, 60)}.`),
		action_url: `/care-circle/${String(groupId).replace(/^wp-/, "")}?tab=members`
	}));
}
/** Member removed from a group → notify that member. */
function notifyMemberRemoved(memberId, groupName) {
	return withActor((who) => notifyUsers([memberId], {
		type: "system",
		title: Z("你已被移出护理小组", "You were removed from a care group"),
		message: who ? Z(`${who} 把你从「${clip(groupName, 80)}」中移出。`, `${who} removed you from ${clip(groupName, 80)}.`) : Z(`你已被移出「${clip(groupName, 80)}」。`, `You were removed from ${clip(groupName, 80)}.`),
		action_url: `/care-circle`
	}));
}
/** Sub-group request approved → notify the requester. */
function notifySubgroupApproved(userId, subgroupId) {
	return withActor((who) => notifyUsers([userId], {
		type: "system",
		title: Z("子小组申请已通过", "Sub-group request approved"),
		message: who ? Z(`${who} 通过了你加入子小组的申请。`, `${who} approved your request to join the sub-group.`) : Z("你加入子小组的申请已通过。", "Your request to join the sub-group was approved."),
		action_url: `/care-circle?subgroup=${subgroupId}`
	}));
}
/** Task status changed → notify creator and the other assignees. */
function notifyTaskStatusChanged(recipientIds, taskId, statusLabel) {
	return withActor((who) => notifyUsers(recipientIds, {
		type: "task",
		title: Z("一项照护任务有更新", "A care task was updated"),
		message: who ? Z(`${who} 把一项任务标记为「${clip(statusLabel, 60)}」。`, `${who} marked a task as ${clip(statusLabel, 60)}.`) : Z(`一项任务被标记为「${clip(statusLabel, 60)}」。`, `A task was marked as ${clip(statusLabel, 60)}.`),
		action_url: `/care-circle?tab=tasks&id=${taskId}`
	}));
}
/**
* Medicine dose logged → notify the cared one's caregivers.
* No extra relation is needed: the deep link lives in the notification's
* action_url text field, so tapping the row opens the medicine card itself.
*/
function notifyMedicineDose(recipientIds, caredOneId, medicineName, status) {
	const label = status === "taken" ? Z("已服用", "taken") : status === "skipped" ? Z("已跳过", "skipped") : Z("漏服", "missed");
	return notifyUsers(recipientIds, {
		type: "medicine",
		title: status === "missed" ? Z("⚠️ 漏服用药", "⚠️ Missed medication") : Z("用药记录已更新", "Medication logged"),
		message: Z(`${clip(medicineName, 60)}：${label}。`, `${clip(medicineName, 60)}: ${label}.`),
		action_url: `/cared-ones?person=${strip(caredOneId)}&card=medicine`
	});
}
/** Check-in logged → notify the check-in's notification receivers (Relation 260). */
function notifyCheckIn(recipientIds, caredOneId, checkinName, status) {
	const label = status === "checked" ? Z("已完成", "completed") : status === "skipped" ? Z("已跳过", "skipped") : Z("未完成", "missed");
	return notifyUsers(recipientIds, {
		type: "check_in",
		title: status === "missed" ? Z("⚠️ 签到未完成", "⚠️ Check-in missed") : Z("签到已更新", "Check-in updated"),
		message: Z(`${clip(checkinName || "签到", 60)}：${label}。`, `${clip(checkinName || "Check-in", 60)}: ${label}.`),
		action_url: `/cared-ones?person=${strip(caredOneId)}&card=checkin`
	});
}
//#endregion
export { notify_events_exports as n, notifySubgroupApproved as t };
