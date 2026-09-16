import { wordpressFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { R } from "@/integrations/wp-schema";
import { fetchWPUserProfile } from "@/features/shared/wp-users";

const REL_USER_CARED_ONE = R.userCaredOnes; // 219: caregiver (parent) → cared one (child)

export interface MyCaregiver {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  /** Relation 219 · a58 — accepted / pending / declined */
  invitation_status: CaredOneInvitationStatus;
}

/** Everyone who has listed the signed-in user as the person they care for. */
export async function fetchMyCaregiversWordPress(): Promise<MyCaregiver[]> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) return [];
  const me = String(stored.user_id).replace(/^wp-/, "");

  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_CARED_ONE}/parents/${me}`);
  if (!Array.isArray(rels) || rels.length === 0) return [];

  const ids = rels
    .map((r: any) => String(r.parent_object_id ?? r.parent_id ?? ""))
    .map((id) => id.replace(/^wp-/, ""))
    .filter((id) => id && id !== me);

  const unique = Array.from(new Set(ids));
  const people = await Promise.all(
    unique.map(async (id) => {
      const u = await fetchWPUserProfile(id);
      return {
        user_id: `wp-${u.id}`,
        full_name: u.full_name ?? null,
        email: (u as any).email ?? null,
        avatar_url: u.avatar_url ?? null,
      } as MyCaregiver;
    }),
  );
  return people;
}

/** Cut the link from my side: they lose access immediately. */
export async function removeMyCaregiverWordPress(caregiverUserId: string): Promise<void> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) throw new Error("Not authenticated");
  const parentId = Number(String(caregiverUserId).replace(/^wp-/, ""));
  const childId = Number(String(stored.user_id).replace(/^wp-/, ""));
  if (!parentId || !childId) throw new Error("Invalid care link");

  await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE}`, {
    method: "POST",
    body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "disconnect" },
  });

  // Tell them the link ended, so access disappearing is never a mystery.
  try {
    const { sendNotification } = await import("@/features/notifications/dispatch");
    await sendNotification({
      user_id: parentId,
      type: "system",
      title: "A care link was ended",
      message: "The person you listed as the one you care for has ended the link, so their care information is no longer shared with you.",
      action_url: "/cared-ones",
    });
  } catch {
    /* best effort */
  }
}
