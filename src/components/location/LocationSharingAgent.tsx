import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getStoredWPUser } from "@/services/wp-auth";
import { getCurrentPosition } from "@/lib/geolocation";
import { useSite } from "@/contexts/SiteContext";
import { currentAppId } from "@/features/shared/app-profile";

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
  const site = useSite();
  const careSite = !["researcher", "esm_survey", "consent", "sick"].includes(
    site.id,
  );
  const qc = useQueryClient();
  const lastShare = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !careSite) return;
    let stopped = false;

    const tick = async () => {
      if (stopped || busy.current || document.visibilityState !== "visible")
        return;
      const me = getStoredWPUser()?.user_id;
      if (!me) return;
      busy.current = true;
      try {
        const { fetchLocationSharingFlags } =
          await import("@/features/location/sharing-flags");
        const flags = await qc.fetchQuery({
          queryKey: ["locationSharingFlags", Number(me)],
          queryFn: () => fetchLocationSharingFlags(me),
          staleTime: 60_000,
        });

        if (flags.emergencyAllowed) {
          const { runNotificationSkill } =
            await import("@/lib/ai-dynamic-knowledge");
          const notificationKey = ["notifications", me, currentAppId()];
          const notifications = await qc.fetchQuery({
            queryKey: notificationKey,
            queryFn: () => runNotificationSkill("list-notifications"),
            staleTime: 30_000,
          }).catch(() => []);
          const emergencies = notifications.filter(
            (n) =>
              !n.is_read &&
              typeof n.action_url === "string" &&
              n.action_url.includes("emergency=1") &&
              n.action_url.includes("request_from="),
          );
          if (emergencies.length) {
            const locationSource =
              import("@/features/location/source.wordpress-extended");
            const pos = await getCurrentPosition({ timeout: 15000 });
            if (pos) {
              const ext = await locationSource;
              for (const n of emergencies) {
                const requester = new URL(
                  String(n.action_url),
                  window.location.origin,
                ).searchParams.get("request_from");
                if (requester)
                  await ext
                    .answerEmergencyRequestWordPress({
                      requesterId: requester,
                      position: pos,
                    })
                    .catch(() => {});
                await runNotificationSkill("mark-notification-read", {
                  id: n.id,
                }).catch(() => {});
              }
              await qc.invalidateQueries({ queryKey: notificationKey });
              lastShare.current = Date.now();
              qc.invalidateQueries({ queryKey: ["caredOneLocation"] });
            }
          }
        }

        if (flags.shareOn && Date.now() - lastShare.current >= SHARE_EVERY_MS) {
          const locationSource =
            import("@/features/location/source.wordpress-extended");
          const pos = await getCurrentPosition({ timeout: 15000 });
          if (pos) {
            const ext = await locationSource;
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
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [isAuthenticated, careSite, qc]);

  return null;
}
