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
import { getStoredWPUser } from "@/services/wp-auth";

/** Recipients read notifications in the language of the app they are using. */
const Z = (zh: string, en: string) => ((i18n.language || "").startsWith("zh") ? zh : en);

const strip = (id: string | number | null | undefined): string =>
  id == null ? "" : String(id).replace(/^wp-/, "");

function currentUserId(): string {
  const stored = getStoredWPUser();
  return strip(stored?.user_id);
}

/** Recipients minus the actor, de-duplicated, empty entries dropped. */
export function recipientsExcludingSelf(ids: Array<string | number | null | undefined>): string[] {
  const me = currentUserId();
  return [...new Set(ids.map(strip).filter(Boolean))].filter((id) => id !== me);
}

/**
 * Fire notifications to a list of recipients. Never throws.
 * Returns the number of recipients the dispatch was attempted for.
 */
export async function notifyUsers(
  userIds: Array<string | number | null | undefined>,
  payload: { type: string; title: string; message: string; action_url?: string },
): Promise<number> {
  const targets = recipientsExcludingSelf(userIds);
  if (targets.length === 0) return 0;
  try {
    const { createNotificationWordPress } = await import("./source.wordpress");
    await Promise.all(
      targets.map((user_id) =>
        createNotificationWordPress({
          user_id,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          action_url: payload.action_url ?? null,
        }).catch(() => undefined),
      ),
    );
  } catch {
    /* notifications are best-effort — the primary write already succeeded */
  }
  return targets.length;
}

const clip = (s: string, n = 140) =>
  (s || "").length > n ? `${(s || "").slice(0, n - 1)}…` : s || "";

/** New chat message → notify the other participant(s). */
export function notifyNewMessage(
  recipientIds: Array<string | number | null | undefined>,
  conversationId: string,
  content: string,
) {
  const stored = getStoredWPUser();
  const who = stored?.user_display_name || stored?.user_login || Z("有人", "Someone");
  return notifyUsers(recipientIds, {
    type: "chat",
    title: Z(`${who} 给你发来新消息`, `New message from ${who}`),
    message: clip(content),
    action_url: `/messages?conversation=${conversationId}`,
  });
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
export function notifyJobApplication(
  posterId: string | number | null | undefined,
  jobTitle: string,
  jobId: string,
) {
  const stored = getStoredWPUser();
  const who = stored?.user_display_name || stored?.user_login || Z("一位护理者", "A caregiver");
  return notifyUsers([posterId], {
    type: "job",
    title: Z("有人应聘你的招聘", "New application for your job"),
    message: Z(`${who} 应聘了「${clip(jobTitle, 80)}」`, `${who} applied to ${clip(jobTitle, 80)}`),
    action_url: `/jobs?id=${jobId}`,
  });
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

const actorName = () => {
  const stored = getStoredWPUser();
  return stored?.user_display_name || stored?.user_login || "Someone";
};

/** Group invitation created → notify the invited user. */
export function notifyGroupInvite(
  inviteeId: string | number | null | undefined,
  groupName: string,
) {
  return notifyUsers([inviteeId], {
    type: "system",
    title: Z("有人邀请你加入护理小组", "You were invited to a care group"),
    message: Z(`${actorName()} 邀请你加入「${clip(groupName, 80)}」。`, `${actorName()} invited you to join ${clip(groupName, 80)}.`),
    action_url: `/care-circle?tab=invitations`,
  });
}

/** Invitation accepted / declined → notify the group's owners and admins. */
export function notifyInviteResponse(
  adminIds: Array<string | number | null | undefined>,
  groupId: string,
  groupName: string,
  accepted: boolean,
) {
  return notifyUsers(adminIds, {
    type: "system",
    title: accepted ? Z("护理小组邀请已被接受", "Care group invitation accepted") : Z("护理小组邀请被拒绝", "Care group invitation declined"),
    message: Z(`${actorName()} ${accepted ? "加入了" : "拒绝加入"}「${clip(groupName, 80)}」。`, `${actorName()} ${accepted ? "joined" : "declined to join"} ${clip(groupName, 80)}.`),
    action_url: `/care-circle?group=${groupId}&tab=members`,
  });
}

/** Member role changed → notify that member. */
export function notifyMemberRoleChanged(
  memberId: string | number | null | undefined,
  groupId: string,
  roleLabel: string,
) {
  return notifyUsers([memberId], {
    type: "system",
    title: Z("你在护理小组里的身份变了", "Your care group role changed"),
    message: Z(`${actorName()} 把你的身份设为「${clip(roleLabel, 60)}」。`, `${actorName()} set your role to ${clip(roleLabel, 60)}.`),
    action_url: `/care-circle?group=${groupId}&tab=members`,
  });
}

/** Member removed from a group → notify that member. */
export function notifyMemberRemoved(
  memberId: string | number | null | undefined,
  groupName: string,
) {
  return notifyUsers([memberId], {
    type: "system",
    title: Z("你已被移出护理小组", "You were removed from a care group"),
    message: Z(`${actorName()} 把你从「${clip(groupName, 80)}」中移出。`, `${actorName()} removed you from ${clip(groupName, 80)}.`),
    action_url: `/care-circle`,
  });
}

/** Someone asked to join a sub-group → notify its owners/admins. */
export function notifySubgroupJoinRequest(
  approverIds: Array<string | number | null | undefined>,
  subgroupId: string,
) {
  return notifyUsers(approverIds, {
    type: "system",
    title: Z("有人申请加入子小组", "New sub-group join request"),
    message: Z(`${actorName()} 申请加入你的子小组。`, `${actorName()} asked to join your sub-group.`),
    action_url: `/care-circle?subgroup=${subgroupId}&tab=members`,
  });
}

/** Sub-group request approved → notify the requester. */
export function notifySubgroupApproved(
  userId: string | number | null | undefined,
  subgroupId: string,
) {
  return notifyUsers([userId], {
    type: "system",
    title: Z("子小组申请已通过", "Sub-group request approved"),
    message: Z(`${actorName()} 通过了你加入子小组的申请。`, `${actorName()} approved your request to join the sub-group.`),
    action_url: `/care-circle?subgroup=${subgroupId}`,
  });
}

/** Task status changed → notify creator and the other assignees. */
export function notifyTaskStatusChanged(
  recipientIds: Array<string | number | null | undefined>,
  taskId: string,
  statusLabel: string,
) {
  return notifyUsers(recipientIds, {
    type: "task",
    title: Z("一项照护任务有更新", "A care task was updated"),
    message: Z(`${actorName()} 把一项任务标记为「${clip(statusLabel, 60)}」。`, `${actorName()} marked a task as ${clip(statusLabel, 60)}.`),
    action_url: `/care-circle?tab=tasks&id=${taskId}`,
  });
}

