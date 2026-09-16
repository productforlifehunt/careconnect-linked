import { wordpressFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { R } from "@/integrations/wp-schema";
import { fetchWPUserProfile } from "@/features/shared/wp-users";
import {
  decodeRel219Status,
  encodeRel219Meta,
  type CaredOneInvitationStatus,
} from "./rel219-meta";

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

  // One row per person; a declined request stays hidden until they ask again.
  const byId = new Map<string, CaredOneInvitationStatus>();
  for (const r of rels) {
    const id = String(r?.parent_object_id ?? r?.parent_id ?? "").replace(/^wp-/, "");
    if (!id || id === me) continue;
    const status = decodeRel219Status(r?.meta);
    if (status === "declined") continue;
    if (!byId.has(id) || status === "accepted") byId.set(id, status);
  }

  const people = await Promise.all(
    Array.from(byId.entries()).map(async ([id, status]) => {
      const u = await fetchWPUserProfile(id);
      return {
        user_id: `wp-${u.id}`,
        full_name: u.full_name ?? null,
        email: (u as any).email ?? null,
        avatar_url: u.avatar_url ?? null,
        invitation_status: status,
      } as MyCaregiver;
    }),
  );
  return people;
}

/**
 * Answer a request: accepting turns sharing on, declining keeps everything
 * hidden. Both write Relation 219 · a58 — the link row itself is untouched, so
 * the same request is never duplicated.
 */
export async function respondToCaregiverRequestWordPress(
  caregiverUserId: string,
  answer: "accepted" | "declined",
): Promise<void> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) throw new Error("Not authenticated");
  const parentId = Number(String(caregiverUserId).replace(/^wp-/, ""));
  const childId = Number(String(stored.user_id).replace(/^wp-/, ""));
  if (!parentId || !childId) throw new Error("Invalid care link");

  await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE}`, {
    method: "POST",
    body: {
      parent_id: parentId,
      child_id: childId,
      context: "child",
      store_items_type: "update",
      meta: encodeRel219Meta(answer),
    },
  });

  try {
    const { sendNotification } = await import("@/features/notifications/dispatch");
    await sendNotification({
      user_id: parentId,
      type: "system",
      title: answer === "accepted" ? "Your care request was accepted" : "Your care request was declined",
      message:
        answer === "accepted"
          ? "You are now listed as their caregiver, so their care information is shared with you."
          : "They declined the request, so none of their care information is shared with you.",
      action_url: "/cared-ones",
    });
  } catch {
    /* best effort */
  }
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
