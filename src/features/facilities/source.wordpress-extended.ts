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
  title?: string; name?: string; content?: string; description?: string | null;
  address?: string | null; location?: string | null;
  latitude?: number; longitude?: number; phone?: string | null; email?: string | null; website?: string;
  isOwner?: boolean; ownerRole?: string | null;
  ownershipClaim?: string | null; ownershipAttachmentUrls?: string | string[] | null;
}): Promise<any> {
  const result = await wordpressCCTFetch(CCT_SLUG, {
    method: "POST",
    body: {
      [F.NAME]: input.title ?? input.name ?? "",
      [F.DETAIL]: input.content ?? input.description ?? "",
      [F.LOCATION]: input.location || "",
      [F.ADDRESS]: input.address || "",
      [F.PHONE]: input.phone || "",
      [F.EMAIL]: input.email || "",
      [F.FACILITY_IS_APPROVED]: T.careFacility.opt.FACILITY_IS_APPROVED.NO,
    },
  }) as any;
  const facilityId = String(normalizeWpObjectId(result?.item_id || result?._ID || result?.id) || "");
  if (!facilityId) throw new Error("Care facility was not created");
  if (input.isOwner) {
    const { getStoredWPUser } = await import("@/services/wp-auth");
    const meId = normalizeWpObjectId(getStoredWPUser()?.user_id);
    if (!meId) throw new Error("You must be signed in to claim ownership");
    // Relation 249 records the owner membership; CCT 288 + Relation 291 record
    // the reviewable ownership claim itself.
    await addFacilityMemberWordPress(facilityId, String(meId), { type: "owner", roleLabel: input.ownerRole || undefined });
    await createFacilityOwnershipClaimWordPress({
      facility_id: facilityId,
      claim: input.ownershipClaim || "",
      attachment_urls: input.ownershipAttachmentUrls || [],
      is_dispute: false,
    });
  }
  return { id: facilityId };
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

// ─── Facility Review Summaries ─────────────────────────────
// Facility reviews live in CCT 31 Review, attached through JetEngine
// Relation 294 (215. care facility -> 31. Review). No Dokan store reviews,
// no WordPress native comments.
export async function fetchFacilityReviewSummariesWordPress(facilityIds: string[]): Promise<Record<string, { average: number | null; count: number }>> {
  const result: Record<string, { average: number | null; count: number }> = {};
  const entries = await Promise.all(
    facilityIds.map(async (id) => [id, await fetchRatingSummary(id, "facility")] as const),
  );
  entries.forEach(([id, summary]) => { result[id] = summary; });
  return result;
}


// ─── Facility Ownership Claims (CCT 288 + Relation 291) ─────
// Dictionary CCT 288 "Ownership claim": a55 claim (Text), a56 proof (Gallery),
// a57 status (b55 pending | b56 approved | b57 rejected), a58 is dispute
// (b55 yes | b56 no), a59 reply (Text). Linked to the facility ONLY through
// JetEngine Relation 291 (215 -> 288).
const CLAIM = T.ownershipClaim;
const FC = CLAIM.f;
const REL_FACILITY_CLAIM = R.careFacilityOwnershipClaims;

const CLAIM_STATUS_LABEL: Record<string, "pending" | "approved" | "rejected"> = {
  [CLAIM.opt.STATUS.PENDING]: "pending",
  [CLAIM.opt.STATUS.APPROVED]: "approved",
  [CLAIM.opt.STATUS.REJECTED]: "rejected",
};
const CLAIM_STATUS_CODE: Record<string, string> = {
  pending: CLAIM.opt.STATUS.PENDING,
  approved: CLAIM.opt.STATUS.APPROVED,
  rejected: CLAIM.opt.STATUS.REJECTED,
};

function parseProof(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v)).filter(Boolean);
    } catch { /* not JSON — comma/newline separated */ }
    return value.split(/[\n,]/).map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

function mapClaim(row: any, facilityId: string) {
  const statusCode = String(row[FC.STATUS] || "");
  const status = CLAIM_STATUS_LABEL[statusCode];
  if (!status) throw new Error(`Invalid ownership claim status code: ${statusCode}`);
  return {
    id: String(row.id || row._ID),
    entity_id: facilityId,
    facility_id: facilityId,
    post_id: facilityId,
    claim: row[FC.CLAIM] || null,
    attachment_urls: parseProof(row[FC.PROOF]),
    status,
    is_dispute: String(row[FC.IS_DISPUTE]) === CLAIM.opt.IS_DISPUTE.YES,
    reject_reason: row[FC.REPLY] || null,
    reply: row[FC.REPLY] || null,
    user_id: row.cct_author_id ? `wp-${row.cct_author_id}` : (row.author_id ? `wp-${row.author_id}` : ""),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** All ownership claims/disputes attached to a facility (Relation 291). */
export async function fetchFacilityOwnershipClaimsWordPress(facilityId: string): Promise<any[]> {
  const fid = normalizeWpObjectId(facilityId);
  if (!fid) throw new Error("Invalid facility ID");
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_FACILITY_CLAIM}/children/${fid}`);
  if (!Array.isArray(rels)) throw new Error(`Relation ${REL_FACILITY_CLAIM} returned an invalid response`);
  const rows = await Promise.all(
    rels
      .map((r: any) => String(r.child_object_id || ""))
      .filter(Boolean)
      .map((cid) => wordpressCCTFetch<any>(CLAIM.slug, { id: cid })),
  );
  return rows.filter(Boolean).map((row) => mapClaim(row, facilityId));
}

/** Claims only (is dispute = No). */
export async function fetchFacilityClaimsOnlyWordPress(facilityId: string): Promise<any[]> {
  return (await fetchFacilityOwnershipClaimsWordPress(facilityId)).filter((c) => !c.is_dispute);
}

/** Disputes only (is dispute = Yes). */
export async function fetchFacilityDisputesWordPress(facilityId: string): Promise<any[]> {
  return (await fetchFacilityOwnershipClaimsWordPress(facilityId)).filter((c) => c.is_dispute);
}

/**
 * Submit an ownership claim (or dispute) for a facility.
 * Status always starts pending — approval is an admin action.
 */
export async function createFacilityOwnershipClaimWordPress(input: {
  facility_id: string;
  claim?: string | null;
  attachment_urls?: string[] | string | null;
  is_dispute?: boolean;
  status?: "pending" | "approved" | "rejected";
}): Promise<{ id: string }> {
  const fid = normalizeWpObjectId(input.facility_id);
  if (!fid) throw new Error("Invalid facility ID");
  const proof = parseProof(input.attachment_urls);
  const result = await wordpressCCTFetch<any>(CLAIM.slug, {
    method: "POST",
    body: {
      [FC.CLAIM]: input.claim || "",
      [FC.PROOF]: JSON.stringify(proof),
      [FC.STATUS]: CLAIM_STATUS_CODE[input.status || "pending"],
      [FC.IS_DISPUTE]: input.is_dispute ? CLAIM.opt.IS_DISPUTE.YES : CLAIM.opt.IS_DISPUTE.NO,
      [FC.REPLY]: "",
    },
  });
  const claimId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
  if (!claimId) throw new Error("Ownership claim was not created");
  await wordpressFetch(`jet-rel/${REL_FACILITY_CLAIM}`, {
    method: "POST",
    body: { parent_id: fid, child_id: claimId, context: "parent", store_items_type: "update" },
  });
  return { id: String(claimId) };
}

/** Admin decision on a claim/dispute: status + written reply. */
export async function updateFacilityOwnershipClaimWordPress(
  claimId: string,
  updates: { status?: "pending" | "approved" | "rejected"; reply?: string | null; claim?: string | null; attachment_urls?: string[] | string | null },
): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.status !== undefined) {
    const code = CLAIM_STATUS_CODE[updates.status];
    if (!code) throw new Error(`Invalid ownership claim status: ${updates.status}`);
    body[FC.STATUS] = code;
  }
  if (updates.reply !== undefined) body[FC.REPLY] = updates.reply || "";
  if (updates.claim !== undefined) body[FC.CLAIM] = updates.claim || "";
  if (updates.attachment_urls !== undefined) body[FC.PROOF] = JSON.stringify(parseProof(updates.attachment_urls));
  await wordpressCCTFetch(CLAIM.slug, { id: claimId, method: "PUT", body });
}

export async function deleteFacilityOwnershipClaimWordPress(claimId: string): Promise<void> {
  await wordpressCCTFetch(CLAIM.slug, { id: claimId, method: "DELETE" });
}
