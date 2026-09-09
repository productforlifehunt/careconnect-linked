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
import i18n from "i18next";
import { fetchMyAppUserName } from "@/features/profile/app-user-name";

/**
 * The actor's name comes ONLY from this app's own column on CCT 151.
 * The shared WordPress login / display name is never a fallback: when the
 * profile name is empty the message simply omits the name.
 */
let actorNameCache: string | null = null;
async function actorAppName(): Promise<string> {
  if (actorNameCache !== null) return actorNameCache;
  try {
    actorNameCache = await fetchMyAppUserName();
  } catch {
    actorNameCache = "";
  }
  return actorNameCache;
}
export function clearActorNameCache() {
  actorNameCache = null;
}

/** Recipients read notifications in the language of the app they are using. */
const Z = (zh: string, en: string) => ((i18n.language || "").startsWith("zh") ? zh : en);

const strip = (id: string | number | null | undefined): string =>
  id == null ? "" : String(id).replace(/^wp-/, "");

/**
 * Recipients minus the actor, de-duplicated, empty entries dropped.
 * Kept as a thin re-export: the rule itself lives in the notification skill.
 */
export async function recipientsExcludingSelf(
  ids: Array<string | number | null | undefined>,
): Promise<string[]> {
  const { notificationRecipients } = await import("@/lib/ai-dynamic-knowledge");
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
export async function notifyUsers(
  userIds: Array<string | number | null | undefined>,
  payload: { type: string; title: string; message: string; action_url?: string },
): Promise<number> {
  try {
    const { runNotificationSkill } = await import("@/lib/ai-dynamic-knowledge");
    return await runNotificationSkill("send-notification", {
      userIds,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      actionUrl: payload.action_url ?? null,
    });
  } catch {
    /* notifications are best-effort — the primary write already succeeded */
    return 0;
  }
}


const clip = (s: string, n = 140) =>
  (s || "").length > n ? `${(s || "").slice(0, n - 1)}…` : s || "";

/** New chat message → notify the other participant(s). */
export function notifyNewMessage(
  recipientIds: Array<string | number | null | undefined>,
  conversationId: string,
  content: string,
) {
  return actorAppName().then((who) => notifyUsers(recipientIds, {
    type: "chat",
    title: who ? Z(`${who} 给你发来新消息`, `New message from ${who}`) : Z("你有一条新消息", "You have a new message"),
    message: clip(content),
    action_url: `/inbox?tab=messages&conversation=${conversationId}`,
  }));
}

/** Care task assigned → notify each assignee. */
export function notifyTaskAssigned(
  assigneeIds: Array<string | number | null | undefined>,
  taskTitle: string,
  taskId: string,
) {
  return notifyUsers(assigneeIds, {
    type: "task",
    title: Z("有一项照护任务交给你", "You were assigned a care task"),
    message: clip(taskTitle),
    action_url: `/care-circle?tab=tasks&id=${taskId}`,
  });
}

/** Caregiver applied to a job → notify the poster. */
export function notifyTaskHelpOffer(
  posterId: string | number | null | undefined,
  taskTitle: string,
  taskId: string,
) {
  return actorAppName().then((who) => notifyUsers([posterId], {
    type: "task",
    title: Z("有人愿意帮你这件事", "Someone offered to help"),
    message: who
      ? Z(`${who} 想帮你完成「${clip(taskTitle, 80)}」`, `${who} offered to help with ${clip(taskTitle, 80)}`)
      : Z(`有人想帮你完成「${clip(taskTitle, 80)}」`, `Someone offered to help with ${clip(taskTitle, 80)}`),
    action_url: `/shared-tasks?id=${taskId}`,
  }));
}

/** Group announcement/post → notify group members. */
export function notifyGroupPost(
  memberIds: Array<string | number | null | undefined>,
  groupId: string,
  title: string,
  isAnnouncement: boolean,
) {
  return notifyUsers(memberIds, {
    type: "system",
    title: isAnnouncement ? Z("护理小组有新公告", "New announcement in your care group") : Z("护理小组有新帖子", "New post in your care group"),
    message: clip(title),
    action_url: `/care-circle?group=${groupId}&tab=${isAnnouncement ? "announcements" : "posts"}`,
  });
}

/** Booking status changed → notify the counterpart. */
export function notifyBookingStatus(
  recipientIds: Array<string | number | null | undefined>,
  bookingId: string,
  status: string,
) {
  const label: Record<string, string> = {
    confirmed: Z("你的预约已确认", "Your booking was confirmed"),
    completed: Z("你的预约已完成", "Your booking was marked complete"),
    pending: Z("你的预约正在等待确认", "Your booking is awaiting confirmation"),
  };
  const title = status.startsWith("cancelled")
    ? Z("你的预约已取消", "Your booking was cancelled")
    : label[status] || Z("你的预约有更新", "Your booking was updated");
  return notifyUsers(recipientIds, {
    type: "booking",
    title,
    message: Z(`预约 #${bookingId} 现在是「${status.replace(/_/g, " ")}」。`, `Booking #${bookingId} is now ${status.replace(/_/g, " ")}.`),
    action_url: `/bookings?id=${bookingId}`,
  });
}

/**
 * Actor sentence builder. `who` is the CCT 151 app name, or "" when the user
 * has not set it — in that case the sentence drops the name instead of
 * inventing one from the shared WordPress account.
 */
function withActor<T>(build: (who: string) => T): Promise<T> {
  return actorAppName().then((who) => build(who));
}

/**
 * Group invitation created → notify the invited user. The notification carries
 * the invite link itself: accepting means opening the link and finishing the
 * group onboarding popup.
 */
export function notifyGroupInvite(
  inviteeId: string | number | null | undefined,
  groupName: string,
  inviteUrl?: string,
) {
  let path = "/care-circle";
  if (inviteUrl) {
    try { path = new URL(inviteUrl).pathname; } catch { path = inviteUrl; }
  }
  return withActor((who) => notifyUsers([inviteeId], {
    type: "system",
    title: Z("有人邀请你加入护理小组", "You were invited to a care group"),
    message: who
      ? Z(`${who} 邀请你加入「${clip(groupName, 80)}」。`, `${who} invited you to join ${clip(groupName, 80)}.`)
      : Z(`你被邀请加入「${clip(groupName, 80)}」。`, `You were invited to join ${clip(groupName, 80)}.`),
    action_url: path,
  }));
}

/** Invitation accepted / declined → notify the group's owners and admins. */
export function notifyInviteResponse(
  adminIds: Array<string | number | null | undefined>,
  groupId: string,
  groupName: string,
  accepted: boolean,
) {
  return withActor((who) => notifyUsers(adminIds, {
    type: "system",
    title: accepted ? Z("护理小组邀请已被接受", "Care group invitation accepted") : Z("护理小组邀请被拒绝", "Care group invitation declined"),
    message: who
      ? Z(`${who} ${accepted ? "加入了" : "拒绝加入"}「${clip(groupName, 80)}」。`, `${who} ${accepted ? "joined" : "declined to join"} ${clip(groupName, 80)}.`)
      : Z(`有人${accepted ? "加入了" : "拒绝加入"}「${clip(groupName, 80)}」。`, `Someone ${accepted ? "joined" : "declined to join"} ${clip(groupName, 80)}.`),
    action_url: `/care-circle?group=${groupId}&tab=members`,
  }));
}

/** Member role changed → notify that member. */
export function notifyMemberRoleChanged(
  memberId: string | number | null | undefined,
  groupId: string,
  roleLabel: string,
) {
  return withActor((who) => notifyUsers([memberId], {
    type: "system",
    title: Z("你在护理小组里的身份变了", "Your care group role changed"),
    message: who
      ? Z(`${who} 把你的身份设为「${clip(roleLabel, 60)}」。`, `${who} set your role to ${clip(roleLabel, 60)}.`)
      : Z(`你的身份被设为「${clip(roleLabel, 60)}」。`, `Your role was set to ${clip(roleLabel, 60)}.`),
    action_url: `/care-circle?group=${groupId}&tab=members`,
  }));
}

/** Member removed from a group → notify that member. */
export function notifyMemberRemoved(
  memberId: string | number | null | undefined,
  groupName: string,
) {
  return withActor((who) => notifyUsers([memberId], {
    type: "system",
    title: Z("你已被移出护理小组", "You were removed from a care group"),
    message: who
      ? Z(`${who} 把你从「${clip(groupName, 80)}」中移出。`, `${who} removed you from ${clip(groupName, 80)}.`)
      : Z(`你已被移出「${clip(groupName, 80)}」。`, `You were removed from ${clip(groupName, 80)}.`),
    action_url: `/care-circle`,
  }));
}

/** Sub-group request approved → notify the requester. */
export function notifySubgroupApproved(
  userId: string | number | null | undefined,
  subgroupId: string,
) {
  return withActor((who) => notifyUsers([userId], {
    type: "system",
    title: Z("子小组申请已通过", "Sub-group request approved"),
    message: who
      ? Z(`${who} 通过了你加入子小组的申请。`, `${who} approved your request to join the sub-group.`)
      : Z("你加入子小组的申请已通过。", "Your request to join the sub-group was approved."),
    action_url: `/care-circle?subgroup=${subgroupId}`,
  }));
}

/** Task status changed → notify creator and the other assignees. */
export function notifyTaskStatusChanged(
  recipientIds: Array<string | number | null | undefined>,
  taskId: string,
  statusLabel: string,
) {
  return withActor((who) => notifyUsers(recipientIds, {
    type: "task",
    title: Z("一项照护任务有更新", "A care task was updated"),
    message: who
      ? Z(`${who} 把一项任务标记为「${clip(statusLabel, 60)}」。`, `${who} marked a task as ${clip(statusLabel, 60)}.`)
      : Z(`一项任务被标记为「${clip(statusLabel, 60)}」。`, `A task was marked as ${clip(statusLabel, 60)}.`),
    action_url: `/care-circle?tab=tasks&id=${taskId}`,
  }));
}



/**
 * Medicine dose logged → notify the cared one's caregivers.
 * No extra relation is needed: the deep link lives in the notification's
 * action_url text field, so tapping the row opens the medicine card itself.
 */
export function notifyMedicineDose(
  recipientIds: Array<string | number | null | undefined>,
  caredOneId: string | number,
  medicineName: string,
  status: "taken" | "skipped" | "missed",
) {
  const label = status === "taken"
    ? Z("已服用", "taken")
    : status === "skipped" ? Z("已跳过", "skipped") : Z("漏服", "missed");
  return notifyUsers(recipientIds, {
    type: "medicine",
    title: status === "missed"
      ? Z("⚠️ 漏服用药", "⚠️ Missed medication")
      : Z("用药记录已更新", "Medication logged"),
    message: Z(`${clip(medicineName, 60)}：${label}。`, `${clip(medicineName, 60)}: ${label}.`),
    action_url: `/cared-ones?person=${strip(caredOneId)}&card=medicine`,
  });
}

/** Check-in logged → notify the check-in's notification receivers (Relation 260). */
export function notifyCheckIn(
  recipientIds: Array<string | number | null | undefined>,
  caredOneId: string | number,
  checkinName: string,
  status: "checked" | "skipped" | "missed",
) {
  const label = status === "checked"
    ? Z("已完成", "completed")
    : status === "skipped" ? Z("已跳过", "skipped") : Z("未完成", "missed");
  return notifyUsers(recipientIds, {
    type: "check_in",
    title: status === "missed"
      ? Z("⚠️ 签到未完成", "⚠️ Check-in missed")
      : Z("签到已更新", "Check-in updated"),
    message: Z(`${clip(checkinName || "签到", 60)}：${label}。`, `${clip(checkinName || "Check-in", 60)}: ${label}.`),
    action_url: `/cared-ones?person=${strip(caredOneId)}&card=checkin`,
  });
}
