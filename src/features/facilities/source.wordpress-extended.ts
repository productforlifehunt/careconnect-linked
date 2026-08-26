import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";

/**
 * Care Facility extended ops.
 *
 * CCT 64 `care_facility` — opaque field map (per 最新数据字典.md):
 *   a55 name, a56 detail, a57 type, a58 dementia_stage, a59 room_type,
 *   a60 room_facility, a61 community_facility, a62 people_number,
 *   a63 location, a64 address.
 *
 * Facility membership has been migrated from a dedicated `facility_member`
 * CCT to **JetEngine Relation 163** (live ID; dictionary name "107. One
 * care facility can have many related facility members"). Relation meta:
 *   a55 = Facility member type   Checkbox: b55 nothing | b56 owner | b57 admin
 *   a56 = Facility member role   Text (self-described)
 *
 * `facility_claim` and `facility_dispute` CCTs have been REMOVED from the
 * current data dictionary. Those endpoints are stubbed to no-ops below
 * until/unless reintroduced.
 */

const CCT_SLUG = "care_facility";
const REL_FACILITY_MEMBER = 249;

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
      a55: input.title,
      a56: input.content || "",
      a63: input.location || "",
      a64: input.address || "",
    },
  }) as any;
  return { id: result?.id || result?._ID };
}

export async function updateCareFacilityWordPress(id: string, updates: Record<string, any>): Promise<any> {
  const body: Record<string, any> = {};
  if (updates.title !== undefined || updates.name !== undefined) body.a55 = updates.title ?? updates.name;
  if (updates.content !== undefined || updates.description !== undefined) body.a56 = updates.content ?? updates.description;
  if (updates.type !== undefined) body.a57 = updates.type;
  if (updates.dementia_stage !== undefined) body.a58 = updates.dementia_stage;
  if (updates.room_type !== undefined) body.a59 = updates.room_type;
  if (updates.room_facility !== undefined) body.a60 = updates.room_facility;
  if (updates.community_facility !== undefined) body.a61 = updates.community_facility;
  if (updates.people_number !== undefined) body.a62 = updates.people_number;
  if (updates.location !== undefined) body.a63 = updates.location;
  if (updates.address !== undefined) body.a64 = updates.address;
  for (const k of Object.keys(updates)) if (/^a\d+$/.test(k)) body[k] = updates[k];
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
      const typeCode = String(meta.a55 || "b55");
      return {
        id: String(r.id || `${fid}-${userId}`),
        post_id: facilityId,
        user_id: userId ? `wp-${userId}` : null,
        role: MEMBER_CODE_TO_TYPE[typeCode] || "member",
        role_label: meta.a56 || null,
        status: "active",
        created_at: r.created_at || null,
        profile: null,
      };
    });
  } catch { return []; }
}

export async function addFacilityMemberWordPress(
  facilityId: string,
  userId: string,
  opts?: { type?: "member" | "owner" | "admin"; roleLabel?: string },
): Promise<void> {
  const fid = normalizeWpObjectId(facilityId);
  const uid = normalizeWpObjectId(userId);
  if (!fid || !uid) return;
  const typeCode = MEMBER_TYPE_TO_CODE[opts?.type || "member"] || "b55";
  await wordpressFetch(`jet-rel/${REL_FACILITY_MEMBER}`, {
    method: "POST",
    body: {
      parent_id: fid, child_id: uid, context: "child", store_items_type: "update",
      meta: { a55: typeCode, ...(opts?.roleLabel ? { a56: opts.roleLabel } : {}) },
    },
  });
}

// ─── Facility Claims / Disputes — DEPRECATED ───────────────
// `facility_claim` & `facility_dispute` CCTs are not in the current
// data dictionary. Stubbed to keep callers compiling.
export async function fetchFacilityOwnershipClaimsWordPress(_facilityId: string): Promise<any[]> { return []; }
export async function claimFacilityOwnershipWordPress(_facilityId: string, _evidenceText?: string): Promise<void> { /* no-op */ }
export async function fetchFacilityOwnershipDisputesWordPress(_facilityId: string): Promise<any[]> { return []; }
export async function createFacilityOwnershipDisputeWordPress(_facilityId: string, _reason: string): Promise<void> { /* no-op */ }

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
