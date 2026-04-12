import { wordpressCCTFetch } from "@/features/shared/wordpress-client";

// CCT slug: cc_notification | flat fields
export async function fetchNotificationsWordPress(): Promise<any[]> {
  try {
    const notifs = await wordpressCCTFetch("cc_notification", { params: { _limit: 100 } });
    if (!Array.isArray(notifs)) return [];
    return notifs.map((n: any) => ({
      id: String(n.id),
      user_id: n.user_id || null,
      type: n.type || "info",
      title: n.title || null,
      message: n.message || null,
      is_read: n.is_read === true || n.is_read === "yes",
      related_id: n.related_id || null,
      related_type: n.related_type || null,
      created_at: n.created_at,
    }));
  } catch {
    return [];
  }
}

export async function markNotificationReadWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("cc_notification", { id, method: "PUT", body: { is_read: "yes" } });
}

export async function markAllNotificationsReadWordPress(): Promise<void> {
  try {
    const notifs = await wordpressCCTFetch("cc_notification", { params: { _limit: 100 } });
    if (!Array.isArray(notifs)) return;
    await Promise.all(
      notifs
        .filter((n: any) => n.is_read !== true && n.is_read !== "yes")
        .map((n: any) => wordpressCCTFetch("cc_notification", { id: n.id, method: "PUT", body: { is_read: "yes" } })),
    );
  } catch {}
}

/** Create a notification in the cc_notification CCT */
export async function createNotificationWordPress(input: {
  user_id: string | number;
  type: string;
  title: string;
  message: string;
  related_id?: string | number | null;
  related_type?: string | null;
}): Promise<void> {
  await wordpressCCTFetch("cc_notification", {
    method: "POST",
    body: {
      user_id: String(input.user_id),
      type: input.type,
      title: input.title,
      message: input.message,
      is_read: "no",
      related_id: input.related_id ? String(input.related_id) : "",
      related_type: input.related_type || "",
    },
  });
}
