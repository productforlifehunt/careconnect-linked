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
import { getStoredWPUser } from "@/services/wp-auth";

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
  const who = stored?.user_display_name || stored?.user_login || "Someone";
  return notifyUsers(recipientIds, {
    type: "chat",
    title: `New message from ${who}`,
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
    title: "You were assigned a care task",
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
  const who = stored?.user_display_name || stored?.user_login || "A caregiver";
  return notifyUsers([posterId], {
    type: "job",
    title: "New application for your job",
    message: `${who} applied to ${clip(jobTitle, 80)}`,
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
    title: isAnnouncement ? "New announcement in your care group" : "New post in your care group",
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
    confirmed: "Your booking was confirmed",
    completed: "Your booking was marked complete",
    pending: "Your booking is awaiting confirmation",
  };
  const title = status.startsWith("cancelled")
    ? "Your booking was cancelled"
    : label[status] || "Your booking was updated";
  return notifyUsers(recipientIds, {
    type: "booking",
    title,
    message: `Booking #${bookingId} is now ${status.replace(/_/g, " ")}.`,
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
    title: "You were invited to a care group",
    message: `${actorName()} invited you to join ${clip(groupName, 80)}.`,
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
    title: accepted ? "Care group invitation accepted" : "Care group invitation declined",
    message: `${actorName()} ${accepted ? "joined" : "declined to join"} ${clip(groupName, 80)}.`,
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
    title: "Your care group role changed",
    message: `${actorName()} set your role to ${clip(roleLabel, 60)}.`,
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
    title: "You were removed from a care group",
    message: `${actorName()} removed you from ${clip(groupName, 80)}.`,
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
    title: "New sub-group join request",
    message: `${actorName()} asked to join your sub-group.`,
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
    title: "Sub-group request approved",
    message: `${actorName()} approved your request to join the sub-group.`,
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
    title: "A care task was updated",
    message: `${actorName()} marked a task as ${clip(statusLabel, 60)}.`,
    action_url: `/care-circle?tab=tasks&id=${taskId}`,
  });
}

