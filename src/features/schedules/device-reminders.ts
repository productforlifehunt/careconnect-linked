import { Capacitor } from "@capacitor/core";
import { occurrencesOn } from "@/features/schedules/recurrence";

const OWNER = "care-schedule";
const WINDOW_DAYS = 14;
const IOS_PENDING_LIMIT = 55;

type Schedule = {
  id: string;
  name: string;
  time_slot?: string[];
  detail?: string | null;
  note?: string | null;
  dosage?: string | null;
  dose_quantity?: number | null;
  dose_unit?: string | null;
  schedule_type?: string | null;
  medication_concept_identifier?: string | null;
  is_active?: boolean;
  reminder_time_before?: number | null;
  check_in_type?: string[];
  recurrence?: { startAt: unknown; rrule: unknown; exdates?: unknown; rdates?: unknown };
};

function notificationId(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) | 0;
  return Math.abs(hash) || 1;
}

function dateAtSlot(day: string, slot: string, minutesBefore: number): Date {
  const [year = 0, month = 1, date = 1] = day.split("-").map(Number);
  const [hour = 0, minute = 0] = slot.split(":").map(Number);
  const value = new Date(year, month - 1, date, hour, minute, 0, 0);
  value.setMinutes(value.getMinutes() - minutesBefore);
  return value;
}

function nextDay(day: string, offset: number): string {
  const [year = 0, month = 1, date = 1] = day.split("-").map(Number);
  const result = new Date(year, month - 1, date + offset);
  return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, "0")}-${String(result.getDate()).padStart(2, "0")}`;
}

/** Called only from a schedule save action, never when the app merely opens. */
export async function requestCareScheduleNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    let permission = await LocalNotifications.checkPermissions();
    if (permission.display === "prompt") permission = await LocalNotifications.requestPermissions();
    return permission.display === "granted";
  } catch {
    return false;
  }
}

function hashPayload(plan: Schedule, kind: "medicine" | "checkin", caredOneId: string, slot: string, day: string) {
  const ai = plan.check_in_type?.includes("ai") ?? false;
  return {
    source: OWNER,
    kind,
    caredOneId,
    scheduleId: String(plan.id),
    label: String(plan.name || ""),
    detail: kind === "medicine" ? [plan.name, plan.dosage, slot].filter(Boolean).join(" · ") : String(plan.detail || ""),
    medicationNote: kind === "medicine" ? String(plan.note || "") : "",
    doseQuantity: kind === "medicine" ? plan.dose_quantity ?? null : null,
    doseUnit: kind === "medicine" ? String(plan.dose_unit || "") : "",
    scheduleType: kind === "medicine" ? String(plan.schedule_type || "") : "",
    conceptIdentifier: kind === "medicine" ? String(plan.medication_concept_identifier || "") : "",
    slot,
    day,
    ai,
  };
}

/** Schedule the next two weeks on the cared one's native device. */
export async function syncCareScheduleReminders(input: {
  caredOneId: string;
  medicines: Schedule[];
  checkins: Schedule[];
}): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const pending = await LocalNotifications.getPending();
  const old = pending.notifications.filter((notification) => notification.extra?.source === OWNER && String(notification.extra?.caredOneId) === String(input.caredOneId));

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const english = typeof navigator !== "undefined" && !navigator.language.toLowerCase().startsWith("zh");
  const candidates: Array<{ at: Date; id: number; title: string; body: string; extra: ReturnType<typeof hashPayload> }> = [];

  const addPlan = (plan: Schedule, kind: "medicine" | "checkin") => {
    if (plan.is_active === false || !plan.recurrence || !plan.time_slot?.length) return;
    for (let offset = 0; offset < WINDOW_DAYS; offset += 1) {
      const day = nextDay(today, offset);
      const slots = occurrencesOn(day, plan.recurrence);
      for (const slot of slots) {
        const extra = hashPayload(plan, kind, input.caredOneId, slot, day);
        const minutesBefore = extra.ai ? 0 : Number(plan.reminder_time_before || 0);
        const at = dateAtSlot(day, slot, minutesBefore);
        if (at.getTime() <= now.getTime()) continue;
        const label = plan.name || (kind === "medicine" ? "Medication" : "Check-in");
        const body = extra.ai
          ? english ? `Tap to start an AI ${kind === "medicine" ? "dose check-in" : "check-in"}.` : "轻点打开 AI 对话，完成本次签到。"
          : english ? `It is time for ${label}.` : `到了 ${label} 的时间。`;
        candidates.push({
          at,
          id: notificationId(`${input.caredOneId}-${kind}-${plan.id}-${day}-${slot}`),
          title: english ? (kind === "medicine" ? "Medication reminder" : "Check-in reminder") : (kind === "medicine" ? "用药提醒" : "探望签到提醒"),
          body,
          extra,
        });
      }
    }
  };

  input.medicines.forEach((plan) => addPlan(plan, "medicine"));
  input.checkins.forEach((plan) => addPlan(plan, "checkin"));
  candidates.sort((a, b) => a.at.getTime() - b.at.getTime());

  const desired = candidates.slice(0, IOS_PENDING_LIMIT);
  const desiredIds = new Set(desired.map(({ id }) => id));
  const stale = old.filter(({ id }) => !desiredIds.has(id));
  if (stale.length) await LocalNotifications.cancel({ notifications: stale.map(({ id }) => ({ id })) });
  if (!desired.length) return;

  const permission = await LocalNotifications.checkPermissions();
  if (permission.display !== "granted") return;

  const pendingIds = new Set(old.filter(({ id }) => desiredIds.has(id)).map(({ id }) => id));
  const notifications = desired.filter(({ id }) => !pendingIds.has(id)).map(({ at, id, title, body, extra }) => ({
    id,
    title,
    body,
    schedule: { at, allowWhileIdle: true },
    extra,
  }));
  if (notifications.length) await LocalNotifications.schedule({ notifications });
}
