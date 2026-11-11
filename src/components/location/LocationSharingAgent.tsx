import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getStoredWPUser } from "@/services/wp-auth";
import { getCurrentPosition } from "@/lib/geolocation";
import { useSite } from "@/contexts/SiteContext";
import { currentAppId } from "@/features/shared/app-profile";
import { flushNativePositions, nativeCircleFences, usesNativeLocation } from "@/features/location/native-tracking";
import type { CareLocationPlugin } from "@careconnect/location";
import type { PluginListenerHandle } from "@capacitor/core";

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
    const native = usesNativeLocation();
    let plugin: CareLocationPlugin | undefined;
    let running = false;
    let fencesKey = "";
    let owner: string | undefined;
    const handles: PluginListenerHandle[] = [];

    const tick = async () => {
      if (stopped || busy.current || (!native && document.visibilityState !== "visible"))
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
        if (stopped || String(getStoredWPUser()?.user_id) !== String(me)) return;

        if (native && plugin) {
          if (flags.shareOn) {
            if (!running) {
              await plugin.start({ background: true, collectMotion: true, collectVisits: true });
              if (stopped) { await plugin.stop(); return; }
              running = true;
              owner = String(me);
            }
            const source = await import("@/features/location/source.wordpress");
            const count = await flushNativePositions(plugin, (position) => source.writeLocationAndCheckZones(
              position.latitude, position.longitude, {
                accuracy: position.accuracy, altitude: position.altitude, heading: position.heading,
                speed: position.speed, moving_type: position.moving_type,
                is_cared_one: true,
                battery_level: position.battery_level, phone_is_charging: position.phone_is_charging,
                captured_at: new Date(position.timestamp).toISOString(),
              }), () => !stopped && owner === String(getStoredWPUser()?.user_id));
            if (count > 0) void qc.invalidateQueries({ queryKey: ["caredOneLocation"] });
            const permissions = await plugin.getPermissions();
            if (permissions.location === "always") {
              const { fetchSafeZonesWordPress } = await import("@/features/location/source.wordpress-extended");
              const zones = await qc.fetchQuery({ queryKey: ["nativeSafeZones", me],
                queryFn: () => fetchSafeZonesWordPress(String(me)), staleTime: 60_000 });
              const fences = nativeCircleFences(zones);
              const nextKey = JSON.stringify(fences);
              if (!stopped && nextKey !== fencesKey) {
                await plugin.setGeofences({ fences });
                fencesKey = nextKey;
              }
            }
          } else {
            await plugin.stop();
            await plugin.clearPending();
            running = false;
            fencesKey = "";
          }
        }

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
              await Promise.all(
                emergencies.map(async (n) => {
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
                }),
              );
              await qc.invalidateQueries({ queryKey: notificationKey });
              lastShare.current = Date.now();
              qc.invalidateQueries({ queryKey: ["caredOneLocation"] });
            }
          }
        }

        if (!native && flags.shareOn && Date.now() - lastShare.current >= SHARE_EVERY_MS) {
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
      } catch (error) {
        if (native) console.error("Native location sharing failed", error);
        /* a failed round is retried on the next tick */
      } finally {
        busy.current = false;
      }
    };

    const initialize = async () => {
      if (native) {
        const imported = await import("@careconnect/location");
        if (stopped) return;
        plugin = imported.CareLocation;
        await plugin.stop();
        // Never carry another account's or an earlier session's pending positions into this session.
        await plugin.clearPending();
        for (const event of ["position", "geofence", "visit", "permissions"] as const) {
          const onUpdate = () => { void tick(); };
          const handle = event === "position" ? await plugin.addListener("position", onUpdate)
            : event === "geofence" ? await plugin.addListener("geofence", onUpdate)
            : event === "visit" ? await plugin.addListener("visit", onUpdate)
            : await plugin.addListener("permissions", onUpdate);
          if (stopped) { await handle.remove(); return; }
          handles.push(handle);
        }
        const errorHandle = await plugin.addListener("error", error => console.error("Native location", error.message));
        if (stopped) { await errorHandle.remove(); return; }
        handles.push(errorHandle);
      }
      await tick();
    };
    void initialize().catch(error => console.error("Location initialization failed", error));
    const id = window.setInterval(tick, POLL_EVERY_MS);
    const resume = () => { if (document.visibilityState === "visible") void tick(); };
    document.addEventListener("visibilitychange", resume);
    return () => {
      stopped = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", resume);
      void Promise.all(handles.map(handle => handle.remove()));
      if (plugin) void plugin.stop().then(() => plugin?.clearPending()).catch(error => console.error("Cannot stop native location", error));
    };
  }, [isAuthenticated, careSite, qc]);

  return null;
}
