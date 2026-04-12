import { wordpressCCTFetch } from "@/features/shared/wordpress-client";

// CCT slug: cc_vote | flat fields
export async function fetchVotesWordPress(entityType: string, entityIds: string[]): Promise<Record<string, { score: number; upvotes: number; downvotes: number; userVote: -1 | 0 | 1 }>> {
  try {
    const result: Record<string, { score: number; upvotes: number; downvotes: number; userVote: -1 | 0 | 1 }> = {};
    for (const eid of entityIds) {
      result[eid] = { score: 0, upvotes: 0, downvotes: 0, userVote: 0 };
    }
    const votes = await wordpressCCTFetch("cc_vote", {
      params: { entity_type: entityType, _limit: 200 },
    });
    if (!Array.isArray(votes)) return result;
    for (const v of votes) {
      const eid = v.entity_id;
      if (!eid || !result[eid]) continue;
      const dir = Number(v.direction || v.value || 0);
      if (dir > 0) result[eid].upvotes++;
      else if (dir < 0) result[eid].downvotes++;
      result[eid].score = result[eid].upvotes - result[eid].downvotes;
    }
    return result;
  } catch {
    const result: Record<string, { score: number; upvotes: number; downvotes: number; userVote: -1 | 0 | 1 }> = {};
    for (const eid of entityIds) result[eid] = { score: 0, upvotes: 0, downvotes: 0, userVote: 0 };
    return result;
  }
}

export async function fetchEntityVoteWordPress(entityType: string, entityId: string): Promise<{ score: number; upvotes: number; downvotes: number; userVote: -1 | 0 | 1 }> {
  try {
    const votes = await wordpressCCTFetch("cc_vote", {
      params: { entity_type: entityType, entity_id: entityId, _limit: 200 },
    });
    if (!Array.isArray(votes)) return { score: 0, upvotes: 0, downvotes: 0, userVote: 0 };
    let upvotes = 0, downvotes = 0;
    for (const v of votes) {
      const dir = Number(v.direction || v.value || 0);
      if (dir > 0) upvotes++;
      else if (dir < 0) downvotes++;
    }
    return { score: upvotes - downvotes, upvotes, downvotes, userVote: 0 };
  } catch { return { score: 0, upvotes: 0, downvotes: 0, userVote: 0 }; }
}

export async function toggleVoteWordPress(entityType: string, entityId: string, value: -1 | 1): Promise<void> {
  // Try to find existing vote and update, or create new
  try {
    const existing = await wordpressCCTFetch("cc_vote", {
      params: { entity_type: entityType, entity_id: entityId, _limit: 1 },
    });
    if (Array.isArray(existing) && existing.length > 0) {
      const currentDir = Number(existing[0].direction || existing[0].value || 0);
      if (currentDir === value) {
        // Toggle off - delete
        await wordpressCCTFetch("cc_vote", { id: existing[0].id, method: "DELETE" });
      } else {
        // Switch direction
        await wordpressCCTFetch("cc_vote", { id: existing[0].id, method: "PUT", body: { direction: value, value } });
      }
    } else {
      await wordpressCCTFetch("cc_vote", {
        method: "POST",
        body: { entity_type: entityType, entity_id: entityId, direction: value, value },
      });
    }
  } catch {}
}
