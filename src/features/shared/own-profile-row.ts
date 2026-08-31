/**
 * The current user's one-to-one extended-profile rows.
 *
 * The link is a JetEngine relation — Relation 152 for CCT 151
 * (`users_extended_prof`) and Relation 259 for CCT 258 (`user_ext_profile_2`).
 * Never resolve these rows with a `cct_author_id` query filter: JetEngine
 * silently ignores it on some CCT routes and hands back somebody else's row.
 */
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";

/** Row id of the user's one-to-one child row, or null when none exists yet. */
export async function findOwnRowId(relationId: number): Promise<string | null> {
  const userId = getCurrentUserIdNumber();
  if (!userId) return null;
  const rels = await wordpressFetch<any[]>(`jet-rel/${relationId}/children/${userId}`);
  if (!Array.isArray(rels)) throw new Error(`Relation ${relationId} returned an invalid response`);
  const childId = rels[0]?.child_object_id;
  return childId ? String(childId) : null;
}

/** The user's one-to-one child row, or null when none exists yet. */
export async function findOwnRow(relationId: number, cctSlug: string): Promise<any | null> {
  const id = await findOwnRowId(relationId);
  if (!id) return null;
  return wordpressCCTFetch<any>(cctSlug, { id });
}

/** Links a freshly created child row to the current user over `relationId`. */
export async function linkOwnRow(relationId: number, childId: string | number): Promise<void> {
  const userId = getCurrentUserIdNumber();
  if (!userId) throw new Error("No signed-in user to link the profile row to");
  await wordpressFetch(`jet-rel/${relationId}`, {
    method: "POST",
    body: {
      parent_id: String(userId),
      child_id: String(childId),
      context: "child_object",
      store_items_type: "replace",
    },
  });
}
