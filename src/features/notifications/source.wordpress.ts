/**
 * Notifications — JetEngine CCT `notification`
 *
 * Live fields: a55=type, a56=title, a57=content, a58=action url, a59=is read
 *
 * Recipient linkage is via JetEngine relation configured in WP admin.
 * Relation ID is read from VITE env so it can change without code edits.
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserId } from "@/features/shared/current-user";
import { T, R } from "@/integrations/wp-schema";
import { appScopeBody, appScopeParams, filterAppScope } from "@/features/shared/app-scope";

const SLUG = T.notification.slug;
const F = T.notification.f;
const READ = T.notification.opt.NOTIFICATION_IS_READ;
const TYPE = T.notification.opt.NOTIFICATION_TYPE;
const REL_USER_NOTIFICATION = R.userNotifications;

/**
 * a55 is a RADIO field: only the dictionary codes below are valid values.
 * Semantic event names used across the app map onto those codes; anything
 * without its own code (task, job, group post) is a SYSTEM notification.
 * Mirrors TYPE_CODE in supabase/functions/_shared/notify-core.ts.
 */
const TYPE_CODE: Record<string, string> = {
  chat: TYPE.USER_CHAT,
  message: TYPE.USER_CHAT,
  booking: TYPE.BOOKING,
  system: TYPE.SYSTEM,
  task: TYPE.SYSTEM,
  job: TYPE.SYSTEM,
  community: TYPE.SYSTEM,
  location: TYPE.LOCATION_ALERT,
  safe_zone: TYPE.LOCATION_ALERT,
  location_alert: TYPE.LOCATION_ALERT,
  check_in: TYPE.CHECK_IN,
  checkin: TYPE.CHECK_IN,
  medicine: TYPE.MEDICINE,
};

/** Radio code → semantic type the UI filters and icons are keyed on. */
const CODE_TYPE: Record<string, string> = {
  [TYPE.USER_CHAT]: "chat",
  [TYPE.BOOKING]: "booking",
  [TYPE.SYSTEM]: "system",
  [TYPE.LOCATION_ALERT]: "location",
  [TYPE.CHECK_IN]: "check_in",
  [TYPE.MEDICINE]: "medicine",
};

function typeToCode(type: string): string {
  return TYPE_CODE[type] ?? TYPE.SYSTEM;
}

function codeToType(code: any): string {
  const raw = String(code ?? "");
  return CODE_TYPE[raw] ?? (raw && !/^b\d+$/.test(raw) ? raw : "system");
}

function isRead(v: any): boolean {
  return v === true || v === "yes" || v === "1" || v === 1 || v === READ.YES;
}

export async function fetchNotificationsWordPress(): Promise<any[]> {
  try {
    const userId = getCurrentUserId();
    if (!userId || !REL_USER_NOTIFICATION) return [];

    // Strictly relation-scoped: notifications belong to the user through the
    // JetEngine relation (user = parent, notification = child). There is NO
    // unscoped "read everything" fallback.
    const links = await wordpressFetch<any[]>(`jet-rel/${REL_USER_NOTIFICATION}/children/${userId}`);
    if (!Array.isArray(links) || links.length === 0) return [];
    const ids = links.map((l: any) => String(l.child_object_id || "")).filter(Boolean);
    if (ids.length === 0) return [];
    const all = await wordpressCCTFetch<any[]>(SLUG, { params: { _limit: 1000 } });
    const byId = new Map((Array.isArray(all) ? all : []).map((r: any) => [String(r.id ?? r._ID), r]));
    const raw = ids.map((id) => byId.get(id)).filter(Boolean) as any[];
    if (raw.length === 0) return [];



    // The notification CCT is shared by every app on the backend — drop rows
    // stamped for Afresh/Adry/Ablocked/BeNotch so no foreign data leaks in.
    return filterAppScope("notification", raw).map((n: any) => ({
      id: String(n.id ?? n._ID),
      user_id: userId,
      type: codeToType(n[F.NOTIFICATION_TYPE]),
      title: n[F.NOTIFICATION_TITLE] || null,
      message: n[F.NOTIFICATION_CONTENT] || null,
      is_read: isRead(n[F.NOTIFICATION_IS_READ]),
      action_url: n[F.ACTION_URL] || null,
      created_at: n.created_at ?? n.cct_created ?? null,
    }));
  } catch (error) {
    // A failed fetch is not "no notifications" — let react-query show the
    // error state instead of a fake empty inbox.
    throw error;
  }
}

export async function markNotificationReadWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(SLUG, {
    id,
    method: "PUT",
    body: { [F.NOTIFICATION_IS_READ]: READ.YES },
  });
}

export async function markAllNotificationsReadWordPress(): Promise<void> {
  try {
    const list = await fetchNotificationsWordPress();
    await Promise.all(
      list
        .filter((n) => !n.is_read)
        .map((n) => markNotificationReadWordPress(n.id)),
    );
  } catch {}
}

/**
 * Create a notification and link it to the recipient via the user→notification relation.
 * `action_url` is a frontend route like "/tasks/123" or "/messages/abc".
 */
export async function createNotificationWordPress(input: {
  user_id: string | number;
  type: string;
  title: string;
  message: string;
  action_url?: string | null;
  /** @deprecated kept for back-compat with old callers — combined into action_url. */
  related_id?: string | number | null;
  /** @deprecated kept for back-compat with old callers — combined into action_url. */
  related_type?: string | null;
}): Promise<void> {
  // Back-compat: synthesize an action_url if old fields supplied
  let url = input.action_url || "";
  if (!url && input.related_type && input.related_id) {
    const map: Record<string, string> = {
      task: "/dashboard?tab=tasks",
      message: "/inbox?tab=messages",
      booking: "/bookings",
      community: "/community",
      shared_task: "/shared-tasks",
      location: "/find",
      safe_zone: "/find",
    };
    const base = map[input.related_type] || "/inbox?tab=notifications";
    url = `${base}?id=${input.related_id}`;
  }

  // Primary path: the app's single notification edge function. It owns every
  // channel (inbox row + push + email + SMS) and enforces user preferences, so
  // nothing can be sent twice or sent against the user's settings.
  const { sendNotification } = await import("./dispatch");
  const dispatched = await sendNotification({
    user_id: input.user_id,
    type: input.type,
    title: input.title,
    message: input.message,
    action_url: url,
  });
  if (dispatched) return;

  // Fallback only if the dispatcher is unreachable: write the inbox row direct
  // so an alert is never silently lost.
  const created: any = await wordpressCCTFetch(SLUG, {
    method: "POST",
    body: {
      [F.NOTIFICATION_TYPE]: typeToCode(input.type),
      [F.NOTIFICATION_TITLE]: input.title,
      [F.NOTIFICATION_CONTENT]: input.message,
      [F.ACTION_URL]: url,
      [F.NOTIFICATION_IS_READ]: READ.NO,
      ...appScopeBody("notification"),
    },
  });

  const newId = created?.item_id ?? created?._ID ?? created?.id;
  if (newId && REL_USER_NOTIFICATION) {
    // Link notification → user via configured relation (parent=user, child=notification)
    try {
      await wordpressFetch(`jet-rel/${REL_USER_NOTIFICATION}`, {
        method: "POST",
        body: {
          parent_id: String(input.user_id),
          child_id: String(newId),
          context: "child_object",
          store_items_type: "replace",
        },
      });
    } catch {
      // Relation API failure is non-fatal — notification still exists
    }
  }
}
