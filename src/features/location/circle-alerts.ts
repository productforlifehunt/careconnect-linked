/**
 * Life360-style circle alerts: "Check in" and low-battery warnings go to every
 * accepted member of every circle I am in. No new storage: notifications only.
 */
import i18n from "i18next";
import { otherMemberIds } from "@/features/location/bubbles";

const Z = (cn: string, en: string) => ((i18n.language || "").startsWith("zh") ? cn : en);
export const LOW_BATTERY_PERCENT = 10;

async function myName(): Promise<string> {
  try { return await (await import("@/features/profile/app-user-name")).fetchMyAppUserName(); } catch { return ""; }
}

async function notifyMyCircles(title: string, message: string): Promise<number> {
  const { fetchMyCareGroupIdsWordPress } = await import("@/features/care-groups/source.wordpress");
  const groups = await fetchMyCareGroupIdsWordPress();
  const ids = [...new Set((await Promise.all(groups.map(otherMemberIds))).flat())];
  if (!ids.length) return 0;
  const { notifyUsers } = await import("@/features/notifications/notify-events");
  await notifyUsers(ids, { type: "location", title, message, action_url: "/gps-tracking" });
  return ids.length;
}

/** "Check in": share where I am right now and tell my circles. */
export async function checkInToCircles(place: string): Promise<number> {
  const who = (await myName()) || Z("成员", "A member");
  return notifyMyCircles(Z(`${who} 签到了`, `${who} checked in`), place);
}

/** True when this reading should raise the alert; resets once charging or above the line. */
export function shouldAlertLowBattery(level: number | null | undefined, charging: boolean | null | undefined, alreadySent: boolean): boolean {
  if (level == null || charging) return false;
  return level <= LOW_BATTERY_PERCENT && !alreadySent;
}

const KEY = "ns_low_battery_sent";
export async function maybeAlertLowBattery(level: number | null | undefined, charging: boolean | null | undefined): Promise<void> {
  if (typeof localStorage === "undefined") return;
  const sent = localStorage.getItem(KEY) === "1";
  if (level != null && (charging || level > LOW_BATTERY_PERCENT)) { if (sent) localStorage.removeItem(KEY); return; }
  if (!shouldAlertLowBattery(level, charging, sent)) return;
  localStorage.setItem(KEY, "1");
  const who = (await myName()) || Z("成员", "A member");
  await notifyMyCircles(Z(`${who} 的手机电量低`, `${who}'s phone battery is low`), Z(`电量 ${level}%`, `Battery ${level}%`)).catch(() => {});
}
