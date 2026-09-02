/**
 * Push notification tokens — JetEngine CCT 186 `users_notif_token`
 * Relation 189: users → user's notification token (1:M)
 * Shared across apps: field APP scopes each token to one app.
 *
 * Live opaque field map (verified):
 *   a55 endpoint_or_token (Text)
 *   a56 notification_provider (Radio: b55 web_push | b56 fcm | b57 apn | b58 jpush | b59 wechat)
 *   a57 device_label (Text)
 *   a58 auth_key (Text)
 *   a59 p256dh (Text)
 *   a60 is_active (Radio: b55 Yes | b56 No)
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";
import { T, R } from "@/integrations/wp-schema";
import { appScopeBody, filterAppScope } from "@/features/shared/app-scope";

const SLUG = T.notificationToken.slug;
const REL_USER_TOKEN = R.userNotificationTokens;
const F = T.notificationToken.f;

export type NotificationProvider = "web_push" | "fcm" | "apn" | "jpush" | "wechat";

const PROVIDER_TO_CODE: Record<NotificationProvider, string> = {
  web_push: "b55", fcm: "b56", apn: "b57", jpush: "b58", wechat: "b59",
};
const PROVIDER_FROM_CODE: Record<string, NotificationProvider> = {
  b55: "web_push", b56: "fcm", b57: "apn", b58: "jpush", b59: "wechat",
};
const YES = "b55", NO = "b56";

export interface NotificationToken {
  id: string;
  endpoint_or_token: string;
  notification_provider: NotificationProvider;
  device_label?: string;
  auth_key?: string;
  p256dh?: string;
  is_active: boolean;
}

function decode(t: any): NotificationToken {
  return {
    id: String(t.id ?? t._ID ?? ""),
    endpoint_or_token: t[F.ENDPOINT_OR_TOKEN] || "",
    notification_provider: PROVIDER_FROM_CODE[String(t[F.NOTIFICATION_PROVIDER])] || "web_push",
    device_label: t[F.DEVICE_LABEL] || "",
    auth_key: t[F.AUTH_KEY] || "",
    p256dh: t[F.P256DH] || "",
    is_active: String(t[F.IS_ACTIVE]) === YES,
  };
}

export async function fetchMyNotificationTokens(): Promise<NotificationToken[]> {
  const userId = getCurrentUserIdNumber();
  if (!userId) return [];
  try {
    const links = await wordpressFetch<any[]>(`jet-rel/${REL_USER_TOKEN}/children/${userId}`);
    if (!Array.isArray(links) || links.length === 0) return [];
    const ids = links.map((l: any) => String(l.child_object_id || "")).filter(Boolean);
    if (ids.length === 0) return [];
    const all = await wordpressCCTFetch<any[]>(SLUG, { params: { _limit: 500 } });
    const byId = new Map((Array.isArray(all) ? all : []).map((r: any) => [String(r.id ?? r._ID), r]));
    const rows = ids.map((id) => byId.get(id)).filter(Boolean) as any[];
    return filterAppScope("notificationToken", rows).map(decode);

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
      await wordpressCCTFetch(SLUG, { id: dup.id, method: "PUT", body: { [F.IS_ACTIVE]: YES } });
    }
    return { ...dup, is_active: true };
  }

  const created: any = await wordpressCCTFetch(SLUG, {
    method: "POST",
    body: {
      [F.ENDPOINT_OR_TOKEN]: input.endpoint_or_token,
      [F.NOTIFICATION_PROVIDER]: PROVIDER_TO_CODE[input.notification_provider] || PROVIDER_TO_CODE.web_push,
      [F.DEVICE_LABEL]: input.device_label || (typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : ""),
      [F.AUTH_KEY]: input.auth_key || "",
      [F.P256DH]: input.p256dh || "",
      [F.IS_ACTIVE]: YES,
      ...appScopeBody("notificationToken"),
    },
  });
  const newId = Number(created?.item_id ?? created?._ID ?? created?.id ?? 0);
  if (!newId) return null;

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
  await wordpressCCTFetch(SLUG, { id, method: "PUT", body: { [F.IS_ACTIVE]: NO } });
}

export async function deleteNotificationToken(id: string): Promise<void> {
  await wordpressCCTFetch(SLUG, { id, method: "DELETE" });
}

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
