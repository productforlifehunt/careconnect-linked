import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getStoredWPUser } from "@/services/wp-auth";
import { getCurrentPosition } from "@/lib/geolocation";

const SHARE_EVERY_MS = 3 * 60 * 1000;
const POLL_EVERY_MS = 30 * 1000;

/**
 * Runs on the signed-in person's own device while the app is open.
 * - CCT 258 a56 = b55 (sharing on): sends a location snapshot every 3 minutes.
 * - An unread emergency location request + a55 = b55: answers it at once,
 *   without asking (a68 b55 when ordinary sharing is off).
 */
export function LocationSharingAgent() {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const lastShare = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let stopped = false;

    const tick = async () => {
      if (stopped || busy.current || document.visibilityState !== "visible") return;
      const me = getStoredWPUser()?.user_id;
      if (!me) return;
      busy.current = true;
      try {
        const [{ fetchLocationSharingFlags }, ext, { runNotificationSkill }] = await Promise.all([
          import("@/features/location/sharing-flags"),
          import("@/features/location/source.wordpress-extended"),
          import("@/lib/ai-dynamic-knowledge"),
        ]);
        const flags = await fetchLocationSharingFlags(me);

        if (flags.emergencyAllowed) {
          const unread = await runNotificationSkill("list-notifications", { unreadOnly: true }).catch(() => []);
          const emergencies = (Array.isArray(unread) ? unread : []).filter(
            (n: any) => typeof n.action_url === "string" && n.action_url.includes("emergency=1") && n.action_url.includes("request_from="),
          );
          if (emergencies.length) {
            const pos = await getCurrentPosition({ timeout: 15000 });
            if (pos) {
              for (const n of emergencies) {
                const requester = new URL(n.action_url, window.location.origin).searchParams.get("request_from");
                if (requester) await ext.answerEmergencyRequestWordPress({ requesterId: requester, position: pos }).catch(() => {});
                await runNotificationSkill("mark-notification-read", { id: n.id }).catch(() => {});
              }
              lastShare.current = Date.now();
              qc.invalidateQueries({ queryKey: ["caredOneLocation"] });
            }
          }
        }

        if (flags.shareOn && Date.now() - lastShare.current >= SHARE_EVERY_MS) {
          const pos = await getCurrentPosition({ timeout: 15000 });
          if (pos) {
            await ext.writeCaredOneSnapshot(pos, false);
            lastShare.current = Date.now();
            qc.invalidateQueries({ queryKey: ["caredOneLocation"] });
          }
        }
      } catch {
        /* a failed round is retried on the next tick */
      } finally {
        busy.current = false;
      }
    };

    tick();
    const id = window.setInterval(tick, POLL_EVERY_MS);
    return () => { stopped = true; window.clearInterval(id); };
  }, [isAuthenticated, qc]);

  return null;
}
