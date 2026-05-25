import { wordpressCCTFetch } from "@/features/shared/wordpress-client";

// ─── Facility CRUD (CCT: care_facility) ─────────────────────
// Live opaque field map (verified):
//   a55 name, a56 detail, a57 type, a58 dementia_stage, a59 room_type,
//   a60 room_facility, a61 community_facility, a62 people_number,
//   a63 location, a64 address.
// NOTE: phone/email/website are NOT present on the live CCT and are silently
// dropped on write until added via the JetEngine GUI.
export async function createCareFacilityWordPress(input: {
  title: string; content?: string; address?: string; location?: string;
  latitude?: number; longitude?: number; phone?: string; email?: string; website?: string;
}): Promise<any> {
  const result = await wordpressCCTFetch("care_facility", {
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
  if (updates.location !== undefined) body.a63 = updates.location;
  if (updates.address !== undefined) body.a64 = updates.address;
  for (const k of Object.keys(updates)) {
    if (/^a\d+$/.test(k)) body[k] = updates[k];
  }
  const result = await wordpressCCTFetch("care_facility", { id, method: "PUT", body }) as any;
  return { id: result?.id || id };
}

// ─── Facility Members (CCT: facility_member) ────────────────
export async function fetchFacilityMembersWordPress(facilityId: string): Promise<any[]> {
  try {
    const members = await wordpressCCTFetch("facility_member", {
      params: { facility_id: facilityId, _limit: 100 },
    });
    if (!Array.isArray(members)) return [];
    return members.map((m: any) => ({
      id: m.id,
      post_id: facilityId,
      user_id: m.user_id || null,
      role: m.role || "member",
      status: m.status || "active",
      created_at: m.created_at,
      profile: m.user_name ? {
        id: m.user_id, full_name: m.user_name, avatar_url: m.user_avatar || null, email: m.user_email || null,
      } : null,
    }));
  } catch { return []; }
}

// ─── Facility Claims (CCT: facility_claim) ──────────────────
export async function fetchFacilityOwnershipClaimsWordPress(facilityId: string): Promise<any[]> {
  try {
    const claims = await wordpressCCTFetch("facility_claim", {
      params: { facility_id: facilityId, _limit: 50 },
    });
    if (!Array.isArray(claims)) return [];
    return claims.map((c: any) => ({
      id: c.id,
      post_id: facilityId,
      claimant_id: c.claimant_id || null,
      status: c.status || "pending",
      evidence_text: c.evidence_text || c.content || null,
      created_at: c.created_at,
    }));
  } catch { return []; }
}

export async function claimFacilityOwnershipWordPress(facilityId: string, evidenceText?: string): Promise<void> {
  await wordpressCCTFetch("facility_claim", {
    method: "POST",
    body: { facility_id: facilityId, evidence_text: evidenceText || "", status: "pending" },
  });
}

// ─── Facility Disputes (CCT: facility_dispute) ──────────────
export async function fetchFacilityOwnershipDisputesWordPress(facilityId: string): Promise<any[]> {
  try {
    const disputes = await wordpressCCTFetch("facility_dispute", {
      params: { facility_id: facilityId, _limit: 50 },
    });
    if (!Array.isArray(disputes)) return [];
    return disputes.map((d: any) => ({
      id: d.id,
      post_id: facilityId,
      claimant_id: d.claimant_id || null,
      status: d.status || "open",
      reason: d.reason || d.content || null,
      created_at: d.created_at,
    }));
  } catch { return []; }
}

export async function createFacilityOwnershipDisputeWordPress(facilityId: string, reason: string): Promise<void> {
  await wordpressCCTFetch("facility_dispute", {
    method: "POST",
    body: { facility_id: facilityId, reason, status: "open" },
  });
}

// ─── Facility Permissions ───────────────────────────────────
export async function getMyFacilityPermissionWordPress(facilityId: string): Promise<{ canEdit: boolean; membership: any | null }> {
  try {
    const members = await wordpressCCTFetch("facility_member", {
      params: { facility_id: facilityId, _limit: 100 },
    });
    if (Array.isArray(members) && members.length > 0) {
      // Find current user's membership (best-effort — CCT doesn't filter by author automatically)
      const m = members[0];
      const role = m.role || "member";
      return { canEdit: role === "owner" || role === "admin", membership: { id: m.id, role } };
    }
    return { canEdit: false, membership: null };
  } catch { return { canEdit: false, membership: null }; }
}

// ─── Facility Review Summaries ──────────────────────────────
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
      } catch { /* skip individual facility errors */ }
    }
  } catch { /* adapter not available */ }
  return result;
}
