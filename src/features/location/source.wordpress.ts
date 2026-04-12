import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

const REL_USER_LOCATION_SHARING = 91;

async function fetchMyLocationShareIds(): Promise<string[]> {
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_id) return [];
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_LOCATION_SHARING}/children/${storedUser.user_id}`);
  if (!Array.isArray(rels)) return [];
  return rels.map((relation: any) => String(relation.child_object_id || "")).filter(Boolean);
}

export async function fetchLocationSharesWordPress(): Promise<any[]> {
  try {
    const itemIds = await fetchMyLocationShareIds();
    const items = await Promise.all(
      itemIds.map(async (itemId) => {
        try {
          return await wordpressCCTFetch<any>("location_sharing", { id: itemId });
        } catch {
          return null;
        }
      }),
    );
    return items
      .filter((item: any) => item && item.is_active !== false && item.is_active !== "no")
      .map((l: any) => ({
        id: l.id,
        user_id: getStoredWPUser()?.user_id ? String(getStoredWPUser()?.user_id) : null,
        latitude: l.last_latitude ?? l.latitude ?? null,
        longitude: l.last_longitude ?? l.longitude ?? null,
        is_sharing_enabled: l.is_active !== false && l.is_active !== "no" && l.is_sharing_enabled !== false && l.is_sharing_enabled !== "no",
        user_name: l.user_name || null,
        user_avatar: l.user_avatar || null,
        created_at: l.created_at,
        updated_at: l.last_updated_at || l.updated_at || l.created_at,
      }));
  } catch {
    return [];
  }
}

export async function updateLocationWordPress(latitude: number, longitude: number): Promise<void> {
  try {
    const storedUser = getStoredWPUser();
    if (!storedUser?.user_id) return;
    const shareIds = await fetchMyLocationShareIds();
    if (shareIds.length > 0) {
      await wordpressCCTFetch("location_sharing", {
        id: shareIds[0],
        method: "PUT",
        body: { last_latitude: String(latitude), last_longitude: String(longitude), last_updated_at: Math.floor(Date.now() / 1000), is_active: "yes" },
      });
    } else {
      const created = await wordpressCCTFetch<any>("location_sharing", {
        method: "POST",
        body: { last_latitude: String(latitude), last_longitude: String(longitude), last_updated_at: Math.floor(Date.now() / 1000), is_active: "yes" },
      });
      await wordpressFetch(`jet-rel/${REL_USER_LOCATION_SHARING}`, {
        method: "POST",
        body: {
          parent_id: Number(storedUser.user_id),
          child_id: Number(created.id || created._ID),
          context: "child",
          store_items_type: "update",
        },
      });
    }
  } catch {
    // silently fail
  }
}
