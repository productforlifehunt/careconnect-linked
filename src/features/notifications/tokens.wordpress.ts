/**
 * Push notification tokens — JetEngine CCT `users_notification_` (CCT 147)
 * Relation 149: users → users_notification_  (1:M)
 *
 * Live fields: endpoint_or_token, notification_provider (web_push|fcm|apn|jpush|wechat),
 *              device_label, auth_key, p256dh, is_active
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";

const SLUG = "users_notification_";
const REL_USER_TOKEN = 149;

export type NotificationProvider =
  | "web_push"
  | "fcm"
  | "apn"
  | "jpush"
  | "wechat";

export interface NotificationToken {
  id: string;
  endpoint_or_token: string;
  notification_provider: NotificationProvider;
  device_label?: string;
  auth_key?: string;
  p256dh?: string;
  is_active: boolean;
}

function asWPBool(v: boolean | undefined): string {
  return v ? "yes" : "no";
}

function asBool(v: any): boolean {
  return v === true || v === "yes" || v === "1" || v === 1;
}

export async function fetchMyNotificationTokens(): Promise<NotificationToken[]> {
  const userId = getCurrentUserIdNumber();
  if (!userId) return [];
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_TOKEN}/parent/${userId}`).catch(() => []);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    return rels.map((t: any) => ({
      id: String(t.id ?? t._ID ?? ""),
      endpoint_or_token: t.endpoint_or_token || "",
      notification_provider: (t.notification_provider as NotificationProvider) || "web_push",
      device_label: t.device_label || "",
      auth_key: t.auth_key || "",
      p256dh: t.p256dh || "",
      is_active: asBool(t.is_active),
    }));
  } catch {
    return [];
  }
}

export async function registerNotificationToken(input: {
  endpoint_or_token: string;
  notification_provider: NotificationProvider;
  device_label?: string;
  auth_key?: string;
  p256dh?: string;
}): Promise<NotificationToken | null> {
  const userId = getCurrentUserIdNumber();
  if (!userId) return null;

  // De-dupe: don't recreate if same endpoint already registered
  const existing = await fetchMyNotificationTokens();
  const dup = existing.find((t) => t.endpoint_or_token === input.endpoint_or_token);
  if (dup) {
    if (!dup.is_active) {
      await wordpressCCTFetch(SLUG, { id: dup.id, method: "PUT", body: { is_active: "yes" } });
    }
    return { ...dup, is_active: true };
  }

  const created: any = await wordpressCCTFetch(SLUG, {
    method: "POST",
    body: {
      endpoint_or_token: input.endpoint_or_token,
      notification_provider: input.notification_provider,
      device_label: input.device_label || (typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : ""),
      auth_key: input.auth_key || "",
      p256dh: input.p256dh || "",
      is_active: asWPBool(true),
    },
  });
  const newId = Number(created?.item_id ?? created?._ID ?? created?.id ?? 0);
  if (!newId) return null;

  // Link via REL 149
  try {
    await wordpressFetch(`jet-rel/${REL_USER_TOKEN}`, {
      method: "POST",
      body: { parent_id: userId, child_id: newId, context: "child", store_items_type: "update" },
    });
  } catch { /* non-fatal */ }

  return {
    id: String(newId),
    endpoint_or_token: input.endpoint_or_token,
    notification_provider: input.notification_provider,
    device_label: input.device_label,
    auth_key: input.auth_key,
    p256dh: input.p256dh,
    is_active: true,
  };
}

export async function deactivateNotificationToken(id: string): Promise<void> {
  await wordpressCCTFetch(SLUG, { id, method: "PUT", body: { is_active: "no" } });
}

export async function deleteNotificationToken(id: string): Promise<void> {
  await wordpressCCTFetch(SLUG, { id, method: "DELETE" });
}

/**
 * Convenience: subscribe the browser to web push and register the resulting
 * subscription with the backend. Falls back gracefully if push isn't available.
 */
export async function subscribeWebPushAndRegister(vapidPublicKey?: string): Promise<NotificationToken | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }
  if (!vapidPublicKey) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
      });
    }
    const json = sub.toJSON() as any;
    return await registerNotificationToken({
      endpoint_or_token: json.endpoint || sub.endpoint,
      notification_provider: "web_push",
      auth_key: json.keys?.auth || "",
      p256dh: json.keys?.p256dh || "",
    });
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}
