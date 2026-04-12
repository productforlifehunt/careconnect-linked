import { wordpressCCTFetch, wordpressFetchRaw } from "@/features/shared/wordpress-client";

// CCT slug: cc_notification | flat fields
export async function fetchNotificationsWordPress(): Promise<any[]> {
  try {
    const response = await wordpressFetchRaw("cc/v1/notifications");
    const text = await response.text();
    const notifs = text ? JSON.parse(text) : [];
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
