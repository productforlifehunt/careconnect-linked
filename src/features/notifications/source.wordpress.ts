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

const SLUG = "users_notification";
const REL_USER_NOTIFICATION = 188;

function isRead(v: any): boolean {
  return v === true || v === "yes" || v === "1" || v === 1 || v === "b55";
}

export async function fetchNotificationsWordPress(): Promise<any[]> {
  try {
    const userId = getCurrentUserId();
    let raw: any[] = [];

    if (userId && REL_USER_NOTIFICATION) {
      // Fetch by relation: GET /jet-rel/{rel}/parent/{userId}
      try {
        raw = await wordpressFetch<any[]>(`jet-rel/${REL_USER_NOTIFICATION}/parent/${userId}`);
      } catch {
        raw = [];
      }
    }

    // Fallback: pull all (only if relation lookup empty/disabled)
    if (!Array.isArray(raw) || raw.length === 0) {
      const all = await wordpressCCTFetch(SLUG, { params: { _limit: 100, _orderby: "cct_created", _order: "desc" } });
      raw = Array.isArray(all) ? all : [];
    }

    return raw.map((n: any) => ({
      id: String(n.id ?? n._ID),
      user_id: userId,
      type: n.a55 || "info",
      title: n.a56 || null,
      message: n.a57 || null,
      is_read: isRead(n.a59),
      action_url: n.a58 || null,
      created_at: n.created_at ?? n.cct_created ?? null,
    }));
  } catch {
    return [];
  }
}

export async function markNotificationReadWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(SLUG, {
    id,
    method: "PUT",
    body: { a59: "b55" },
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
 * Create a notification and link it to the recipient via Relation 148.
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
      message: "/messages",
      booking: "/bookings",
      community: "/community",
      job: "/jobs",
      location: "/gps-tracking",
      safe_zone: "/gps-tracking",
    };
    const base = map[input.related_type] || "/notifications";
    url = `${base}?id=${input.related_id}`;
  }

  const created: any = await wordpressCCTFetch(SLUG, {
    method: "POST",
    body: {
      a55: input.type,
      a56: input.title,
      a57: input.message,
      a58: url,
      a59: "b56",
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
