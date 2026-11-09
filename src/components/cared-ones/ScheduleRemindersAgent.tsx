import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/contexts/AuthContext";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { useNavigate } from "@/lib/router-compat";
import { getStoredWPUser } from "@/services/wp-auth";
import { currentAppScope } from "@/features/shared/app-scope";
import { localDay } from "@/features/schedules/recurrence";
import { slotOfDatetime } from "@/features/medicine/dose-slot";
import { fetchMedicinesWordPress } from "@/features/medicine/source.medicine";
import {
  fetchCheckinsWordPress,
  fetchTodayCheckinLogsWordPress,
} from "@/features/cared-ones/source.wordpress-extended";
import { syncCareScheduleReminders } from "@/features/schedules/device-reminders";
import { logCheckinWordPress } from "@/features/cared-ones/source.wordpress-extended";
import { todayAtSlot } from "@/features/medicine/dose-slot";

const POLL_MS = 60_000;

export function ScheduleRemindersAgent() {
  const { isAuthenticated, user } = useAuth();
  const { openWriteAssistant } = useAIAssistant();
  const navigate = useNavigate();
  const busy = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.general_user_role?.includes("cared one")) return;
    const caredOneId = String(getStoredWPUser()?.user_id || "").replace(/^wp-/, "");
    if (!caredOneId) return;

    let stopped = false;
    const remindCaregiversForMissedCheckins = async (checkins: any[]) => {
      const logs = await fetchTodayCheckinLogsWordPress(caredOneId);
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const slots = checkins.flatMap((checkin) => (checkin.today_slots || []).map((slot: string) => ({ checkin, slot })));
      for (const { checkin, slot } of slots) {
        if (checkin.is_active === false) continue;
        const delay = Number(checkin.time_to_send_to_caregiver || 0);
        if (delay <= 0) continue;
        const [hour = "0", minute = "0"] = slot.split(":");
        const scheduledMinutes = Number(hour) * 60 + Number(minute);
        if (nowMinutes < scheduledMinutes + delay) continue;
        const hasLog = logs.some((log: any) => {
          if (String(log.checkin_id) !== String(checkin.id)) return false;
          const loggedSlot = slotOfDatetime(log.scheduled_date);
          return loggedSlot ? loggedSlot === slot : slot === checkin.today_slots?.[0];
        });
        if (hasLog) continue;
        const key = `care-checkin-missed:${currentAppScope()}:${caredOneId}:${localDay()}:${checkin.id}:${slot}`;
        if (localStorage.getItem(key)) continue;
        await logCheckinWordPress({
          checkin_id: String(checkin.id),
          cared_one_id: caredOneId,
          checkin_name: checkin.name,
          scheduled_date: todayAtSlot(slot),
          status: "missed",
          checked_by_ai: false,
        });
        localStorage.setItem(key, "1");
      }
    };

    const refresh = async () => {
      if (stopped || busy.current || document.visibilityState !== "visible") return;
      busy.current = true;
      try {
        const [medicines, checkins] = await Promise.all([
          fetchMedicinesWordPress(caredOneId),
          fetchCheckinsWordPress(caredOneId),
        ]);
        await syncCareScheduleReminders({ caredOneId, medicines, checkins });
        await remindCaregiversForMissedCheckins(checkins);
      } catch {
        // The next foreground refresh retries the plan and reminder reads.
      } finally {
        busy.current = false;
      }
    };

    void refresh();
    const interval = window.setInterval(() => void refresh(), POLL_MS);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("care-schedule-updated", onVisible);

    let removeNotificationListener: (() => void) | undefined;
    if (Capacitor.isNativePlatform()) {
      void import("@capacitor/local-notifications").then(async ({ LocalNotifications }) => {
        const listener = await LocalNotifications.addListener("localNotificationActionPerformed", ({ notification }) => {
          const extra = notification.extra;
          if (extra?.source !== "care-schedule" || String(extra?.caredOneId) !== caredOneId) return;
          const isMedicine = extra.kind === "medicine";
          navigate(`/cared-ones?person=${encodeURIComponent(caredOneId)}&card=${isMedicine ? "medicine" : "checkin"}`);
          if (!extra.ai) return;
          openWriteAssistant({
            skill: isMedicine ? "record-medicine-dose" : "record-check-in",
            id: `${extra.kind}-${extra.scheduleId}-${extra.day}-${extra.slot}`,
            target: {
              caredOneId,
              recordId: String(extra.scheduleId),
              label: String(extra.label || ""),
              detail: String(extra.detail || ""),
              slot: String(extra.slot || ""),
              ...(isMedicine ? {
                medicationNote: String(extra.medicationNote || ""),
                doseQuantity: typeof extra.doseQuantity === "number" ? extra.doseQuantity : null,
                doseUnit: String(extra.doseUnit || ""),
                scheduleType: String(extra.scheduleType || ""),
                conceptIdentifier: String(extra.conceptIdentifier || ""),
              } : {}),
            },
          });
        });
        removeNotificationListener = () => { void listener.remove(); };
      });
    }

    return () => {
      stopped = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("care-schedule-updated", onVisible);
      removeNotificationListener?.();
    };
  }, [isAuthenticated, user?.general_user_role, openWriteAssistant, navigate]);

  return null;
}
