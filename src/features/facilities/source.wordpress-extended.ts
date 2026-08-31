import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { R, T, WP } from "@/integrations/wp-schema";

/**
 * Care Facility extended ops.
 *
 * CCT 215 `care_facility` — opaque field map:
 *   a55 name, a56 detail, a57 type, a58 dementia_stage, a59 room_type,
 *   a60 room_facility, a61 community_facility, a62 people_number,
 *   a63 location, a64 address.
 *
 * Facility membership uses JetEngine Relation 249. Relation meta:
 *   a55 = Facility member type   Checkbox: b55 nothing | b56 owner | b57 admin
 *   a56 = Facility member role   Text (self-described)
 *
 */

const CCT_SLUG = T.careFacility.slug;
const F = T.careFacility.f;
const REL_FACILITY_MEMBER = R.careFacilityMembers;
const REL249 = WP.rel["249"];
const RF = REL249.f;

const MEMBER_TYPE_TO_CODE: Record<string, string> = {
  member: "b55", nothing: "b55", "nothing special": "b55",
  owner: "b56",
  admin: "b57",
};
const MEMBER_CODE_TO_TYPE: Record<string, string> = { b55: "member", b56: "owner", b57: "admin" };

function normalizeWpObjectId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

// ─── Facility CRUD ──────────────────────────────────────────
export async function createCareFacilityWordPress(input: {
  title: string; content?: string; address?: string; location?: string;
  latitude?: number; longitude?: number; phone?: string; email?: string; website?: string;
}): Promise<any> {
  const result = await wordpressCCTFetch(CCT_SLUG, {
    method: "POST",
    body: {
      [F.NAME]: input.title,
      [F.DETAIL]: input.content || "",
      [F.LOCATION]: input.location || "",
      [F.ADDRESS]: input.address || "",
      [F.PHONE]: input.phone || "",
      [F.EMAIL]: input.email || "",
    },
  }) as any;
  return { id: result?.id || result?._ID };
}

export async function updateCareFacilityWordPress(id: string, updates: Record<string, any>): Promise<any> {
  const body: Record<string, any> = {};
  if (updates.title !== undefined || updates.name !== undefined) body[F.NAME] = updates.title ?? updates.name;
  if (updates.content !== undefined || updates.description !== undefined) body[F.DETAIL] = updates.content ?? updates.description;
  if (updates.type !== undefined) body[F.CARE_FACILITY_TYPE] = updates.type;
  if (updates.dementia_stage !== undefined) body[F.CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE] = updates.dementia_stage;
  if (updates.room_type !== undefined) body[F.CARE_FACILITY_ROOM_TYPE] = updates.room_type;
  if (updates.room_facility !== undefined) body[F.CARE_FACILITY_PROVIDES_ROOM_FACILITY] = updates.room_facility;
  if (updates.community_facility !== undefined) body[F.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY] = updates.community_facility;
  if (updates.people_number !== undefined) body[F.CARE_FACILITY_PEOPLE_NUMBER] = updates.people_number;
  if (updates.location !== undefined) body[F.LOCATION] = updates.location;
  if (updates.address !== undefined) body[F.ADDRESS] = updates.address;
  if (updates.phone !== undefined) body[F.PHONE] = updates.phone;
  if (updates.email !== undefined) body[F.EMAIL] = updates.email;
  const result = await wordpressCCTFetch(CCT_SLUG, { id, method: "PUT", body }) as any;
  return { id: result?.id || id };
}

// ─── Facility Members (REL 163) ─────────────────────────────
export async function fetchFacilityMembersWordPress(facilityId: string): Promise<any[]> {
  try {
    const fid = normalizeWpObjectId(facilityId);
    if (!fid) return [];
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_FACILITY_MEMBER}/children/${fid}`);
    if (!Array.isArray(rels)) return [];
    return rels.map((r: any) => {
      const userId = normalizeWpObjectId(r.child_object_id);
      const meta = r.meta || r.meta_fields || {};
       const typeCode = String(meta[RF.FACILITY_MEMBER_TYPE]);
       if (!MEMBER_CODE_TO_TYPE[typeCode]) throw new Error(`Invalid facility-member type code: ${typeCode}`);
      return {
        id: String(r.id || `${fid}-${userId}`),
        post_id: facilityId,
        user_id: userId ? `wp-${userId}` : null,
         role: MEMBER_CODE_TO_TYPE[typeCode],
         role_label: meta[RF.FACILITY_MEMBER_ROLE] || null,
        created_at: r.created_at || null,
        profile: null,
      };
    });
  } catch (error) { throw new Error(`Failed to fetch facility ${facilityId} members: ${error instanceof Error ? error.message : String(error)}`); }
}

export async function addFacilityMemberWordPress(
  facilityId: string,
  userId: string,
  opts?: { type?: "member" | "owner" | "admin"; roleLabel?: string },
): Promise<void> {
  const fid = normalizeWpObjectId(facilityId);
  const uid = normalizeWpObjectId(userId);
  if (!fid || !uid) throw new Error("Invalid facility or user ID");
  const typeCode = MEMBER_TYPE_TO_CODE[opts?.type || "member"];
  if (!typeCode) throw new Error(`Invalid facility-member type: ${opts?.type}`);
  await wordpressFetch(`jet-rel/${REL_FACILITY_MEMBER}`, {
    method: "POST",
    body: {
      parent_id: fid, child_id: uid, context: "child", store_items_type: "update",
       meta: { [RF.FACILITY_MEMBER_TYPE]: typeCode, ...(opts?.roleLabel ? { [RF.FACILITY_MEMBER_ROLE]: opts.roleLabel } : {}) },
    },
  });
}

// ─── Facility Permissions (derived from REL 163 meta) ──────
export async function getMyFacilityPermissionWordPress(facilityId: string): Promise<{ canEdit: boolean; membership: any | null }> {
  try {
    const { getStoredWPUser } = await import("@/services/wp-auth");
    const meId = normalizeWpObjectId(getStoredWPUser()?.user_id);
    if (!meId) return { canEdit: false, membership: null };
    const members = await fetchFacilityMembersWordPress(facilityId);
    const mine = members.find((m) => normalizeWpObjectId(m.user_id) === meId);
    if (!mine) return { canEdit: false, membership: null };
    return { canEdit: mine.role === "owner" || mine.role === "admin", membership: mine };
  } catch { return { canEdit: false, membership: null }; }
}

// ─── Facility Review Summaries (CCT 65 review via REL 66) ──
export async function fetchFacilityReviewSummariesWordPress(facilityIds: string[]): Promise<Record<string, { average: number | null; count: number }>> {
  const result: Record<string, { average: number | null; count: number }> = {};
  facilityIds.forEach((id) => { result[id] = { average: null, count: 0 }; });
  try {
    const { listWordPressFeature } = await import("@/features/shared/wordpress-adapter");
    for (const fid of facilityIds) {
      try {
        const numericId = parseInt(String(fid).replace("wp-", ""), 10);
        if (isNaN(numericId)) continue;
        const reviews = await listWordPressFeature<any[]>("reviews", { params: { post: numericId, per_page: 100 } });
        if (Array.isArray(reviews) && reviews.length > 0) {
          const ratings = reviews.map((r: any) => Number(r.rating || r.acf?.rating || 0)).filter(n => n > 0);
          result[fid] = {
            average: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
            count: ratings.length,
          };
        }
      } catch { /* skip individual */ }
    }
  } catch { /* adapter unavailable */ }
  return result;
}
