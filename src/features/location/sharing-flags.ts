/**
 * Location-sharing switches on CCT 258 (user's extended profile 2), joined to
 * the user through JetEngine Relation 259 (one to one).
 *   a56 LOCATION_SHARE_IS_ON            b55 yes / b56 no
 *   a55 ALLOW_EMERGENCY_LOCATION_REQUEST b55 yes / b56 no
 */
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { T, R } from "@/integrations/wp-schema";

const P2 = T.userProfile2;
const F = P2.f;
const O = P2.opt;
const REL = R.userProfile2Rel;

export interface LocationSharingFlags {
  shareOn: boolean;
  emergencyAllowed: boolean;
}

const bare = (id: string | number) => Number(String(id).replace(/^wp-/, ""));

async function profileRowId(userId: number): Promise<string | null> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL}/children/${userId}`);
  if (!Array.isArray(rels)) throw new Error(`Relation ${REL} returned an invalid response`);
  const id = rels[0]?.child_object_id;
  return id ? String(id) : null;
}

export async function fetchLocationSharingFlags(userId: string | number): Promise<LocationSharingFlags> {
  const uid = bare(userId);
  if (!uid) throw new Error("Invalid user");
  const id = await profileRowId(uid);
  if (!id) return { shareOn: false, emergencyAllowed: false };
  const row = await wordpressCCTFetch<any>(P2.slug, { id });
  return {
    shareOn: row?.[F.LOCATION_SHARE_IS_ON] === O.LOCATION_SHARE_IS_ON.YES,
    emergencyAllowed: row?.[F.ALLOW_EMERGENCY_LOCATION_REQUEST] === O.ALLOW_EMERGENCY_LOCATION_REQUEST.YES,
  };
}

export async function setLocationSharingFlags(
  userId: string | number,
  patch: { shareOn?: boolean | undefined; emergencyAllowed?: boolean | undefined },
): Promise<void> {
  const uid = bare(userId);
  if (!uid) throw new Error("Invalid user");
  const body: Record<string, string> = {};
  if (patch.shareOn !== undefined) {
    body[F.LOCATION_SHARE_IS_ON] = patch.shareOn ? O.LOCATION_SHARE_IS_ON.YES : O.LOCATION_SHARE_IS_ON.NO;
  }
  if (patch.emergencyAllowed !== undefined) {
    body[F.ALLOW_EMERGENCY_LOCATION_REQUEST] = patch.emergencyAllowed
      ? O.ALLOW_EMERGENCY_LOCATION_REQUEST.YES
      : O.ALLOW_EMERGENCY_LOCATION_REQUEST.NO;
  }
  if (!Object.keys(body).length) return;
  const id = await profileRowId(uid);
  if (id) {
    await wordpressCCTFetch(P2.slug, { id, method: "PUT", body });
    return;
  }
  // No CCT 258 row yet: create it and attach it to the user over Relation 259.
  const created = await wordpressCCTFetch<any>(P2.slug, { method: "POST", body });
  const newId = created?.item_id || created?._ID || created?.id;
  if (!newId) throw new Error("Profile row was created without an item ID");
  await wordpressFetch(`jet-rel/${REL}`, {
    method: "POST",
    body: { parent_id: String(uid), child_id: String(newId), context: "child_object", store_items_type: "replace" },
  });
}
