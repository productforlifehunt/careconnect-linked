/**
 * Per-circle location sharing (Life360 "Location Sharing" per Circle).
 * A REL 330 row user → care group means "my location is paused for this group".
 */
import { wordpressFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { R } from "@/integrations/wp-schema";

const bare = (v: unknown) => String(v ?? "").replace(/^wp-/, "");

export async function fetchPausedGroupIds(userId: string | number): Promise<Set<string>> {
  const rows = await wordpressFetch<any[]>(`jet-rel/${R.userPausedLocationGroups}/children/${bare(userId)}`);
  return new Set((Array.isArray(rows) ? rows : []).map((r) => String(r.child_object_id)));
}

export async function setLocationPausedForGroup(groupId: string, paused: boolean): Promise<void> {
  const me = bare(getStoredWPUser()?.user_id);
  if (!me) throw new Error("Not authenticated");
  await wordpressFetch(`jet-rel/${R.userPausedLocationGroups}`, {
    method: "POST",
    body: { parent_id: Number(me), child_id: Number(bare(groupId)), context: "child", store_items_type: paused ? "update" : "disconnect" },
  });
}

/** Visible when the person shares with at least one circle the viewer has in common. */
export function visibleThroughGroups(sharedGroupIds: Iterable<string>, paused: Set<string>): boolean {
  for (const g of sharedGroupIds) if (!paused.has(String(g))) return true;
  return false;
}
