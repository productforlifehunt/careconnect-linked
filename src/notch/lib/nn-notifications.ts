/**
 * Notch Note — Notifications + Reminders.
 * Backed by nn_notification and nn_reminder CCTs.
 * Local browser-scheduled reminder delivery (no push server needed).
 */
import { cctList, cctCreate, cctUpdate, cctDelete, NN } from "./nn-client";

export type NotificationType =
  | "mention"
  | "reminder"
  | "comment"
  | "invite"
  | "assignment"
  | "share";

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType | string;
  block_id?: string;
  actor_user_id?: string;
  payload?: string;
  read_at?: string | null;
  created_at?: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  block_id: string;
  remind_at: string;
  offset_minutes?: string;
  delivered_at?: string | null;
  channel: "in_app" | "email" | string;
}

/* ─── Notifications ─────────────────────────────────────────── */

export async function listNotifications(userId: string): Promise<AppNotification[]> {
  const all = await cctList<AppNotification>(NN.notification, { user_id: userId });
  return all
    .filter((n: any) => String(n.user_id) === String(userId))
    .sort((a: any, b: any) => (b.created_at || "").localeCompare(a.created_at || ""));
}

export async function unreadCount(userId: string): Promise<number> {
  const all = await listNotifications(userId);
  return all.filter((n) => !n.read_at).length;
}

export async function createNotification(n: Omit<AppNotification, "id" | "created_at">) {
  return cctCreate(NN.notification, {
    user_id: n.user_id,
    type: n.type,
    block_id: n.block_id || "",
    actor_user_id: n.actor_user_id || "",
    payload: typeof n.payload === "string" ? n.payload : JSON.stringify(n.payload || {}),
    read_at: "",
  });
}

export async function markRead(id: string) {
  await cctUpdate(NN.notification, id, { read_at: new Date().toISOString() });
}

export async function markAllRead(userId: string) {
  const list = await listNotifications(userId);
  await Promise.all(list.filter((n) => !n.read_at).map((n) => markRead(n.id)));
}

export async function deleteNotification(id: string) {
  await cctDelete(NN.notification, id);
}

/* ─── Reminders ─────────────────────────────────────────────── */

export async function listReminders(userId: string): Promise<Reminder[]> {
  const all = await cctList<Reminder>(NN.reminder, { user_id: userId });
  return all.filter((r: any) => String(r.user_id) === String(userId));
}

export async function createReminder(
  userId: string,
  blockId: string,
  remindAt: Date,
  channel: "in_app" | "email" = "in_app",
): Promise<string> {
  const { id } = await cctCreate(NN.reminder, {
    user_id: userId,
    block_id: blockId,
    remind_at: remindAt.toISOString(),
    offset_minutes: "0",
    delivered_at: "",
    channel,
  });
  return id;
}

export async function markReminderDelivered(id: string) {
  await cctUpdate(NN.reminder, id, { delivered_at: new Date().toISOString() });
}

export async function deleteReminder(id: string) {
  await cctDelete(NN.reminder, id);
}

/**
 * Poll for due reminders and convert them to notifications.
 * Intended to be called by a top-level poller (e.g., every 60s).
 */
export async function tickReminderQueue(userId: string): Promise<number> {
  const now = Date.now();
  const list = await listReminders(userId);
  const due = list.filter((r) => !r.delivered_at && new Date(r.remind_at).getTime() <= now);
  for (const r of due) {
    // Look up the target page title so the reminder is actionable
    let title = "your page";
    let url: string | undefined;
    try {
      const { cctGet, NN } = await import("./nn-client");
      const b = await cctGet<any>(NN.block, r.block_id);
      if (b?.title) title = b.title;
      url = `${window.location.origin}/?__site=notchnote#/p/${r.block_id}`;
    } catch { /* noop */ }
    await createNotification({
      user_id: userId,
      type: "reminder",
      block_id: r.block_id,
      payload: JSON.stringify({ remind_at: r.remind_at, message: `Reminder: ${title}` }),
    });
    await markReminderDelivered(r.id);
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        const n = new Notification("Notch Note reminder", {
          body: title,
          tag: `nn-reminder-${r.id}`,
        });
        if (url) n.onclick = () => { window.focus(); window.location.href = url!; };
      }
    } catch {
      /* noop */
    }
  }
  return due.length;
}

export async function requestBrowserNotificationPermission() {
  try {
    if (typeof Notification === "undefined") return "unsupported";
    if (Notification.permission === "granted") return "granted";
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

