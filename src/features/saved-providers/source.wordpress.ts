/**
 * Saved providers (favorites).
 *
 * Backed by JetEngine Relation 295 —
 *   "295. One user can have many related saved/favorite care givers"
 *   Users -> Users (Many to Many)
 * Parent = the signed-in user, Child = the saved care provider.
 * No local storage, no invented table: favorites follow the account.
 */

import { wordpressFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { fetchProviderByIdWordPress } from "@/features/providers/source.wordpress";

/** Relation 295 — user → saved/favorite care givers (verified live on /wp-json/jet-rel/295). */
const REL_SAVED_PROVIDERS = 295;

const stripWp = (v: string | number | null | undefined) =>
  v == null ? "" : String(v).replace(/^wp-/, "");

function requireUserId(): number {
  const stored = getStoredWPUser();
  const id = stored?.user_id ? Number(stored.user_id) : null;
  if (!id) throw new Error("Not authenticated");
  return id;
}

export async function fetchSavedProvidersWordPress(): Promise<any[]> {
  const userId = requireUserId();
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_SAVED_PROVIDERS}/children/${userId}`);
  if (!Array.isArray(rels)) {
    throw new Error(`Relation ${REL_SAVED_PROVIDERS} returned an invalid response`);
  }
  const enriched = await Promise.all(
    rels.map(async (r: any) => {
      const childId = r.child_object_id ?? r.child_id;
      if (!childId) return null;
      let provider: any = null;
      try {
        provider = await fetchProviderByIdWordPress(`wp-${childId}`);
      } catch {
        provider = null;
      }
      if (!provider) return null;
      return {
        id: String(r._ID || r.id || `${userId}-${childId}`),
        provider_id: `wp-${childId}`,
        provider,
        provider_name: provider.full_name ?? null,
        provider_avatar: provider.avatar_url ?? null,
        created_at: r.created_at || null,
      };
    }),
  );
  return enriched.filter(Boolean) as any[];
}

export async function toggleSavedProviderWordPress(providerId: string): Promise<void> {
  const userId = requireUserId();
  const childId = Number(stripWp(providerId));
  if (!childId) throw new Error("Invalid provider id");

  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_SAVED_PROVIDERS}/children/${userId}`);
  const already = Array.isArray(rels)
    && rels.some((r: any) => Number(r.child_object_id ?? r.child_id) === childId);

  await wordpressFetch(`jet-rel/${REL_SAVED_PROVIDERS}`, {
    method: "POST",
    body: {
      parent_id: userId,
      child_id: childId,
      context: "child",
      store_items_type: already ? "disconnect" : "update",
    },
  });
}
