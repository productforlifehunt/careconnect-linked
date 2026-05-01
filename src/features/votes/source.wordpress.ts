import { wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

/**
 * CCT cc_vote — live fields: entity_type, entity_id, user_id, vote_type
 *   vote_type: "up" | "down"
 */

type VoteSummary = { score: number; upvotes: number; downvotes: number; userVote: -1 | 0 | 1 };

const stripWp = (v: string | number | null | undefined) =>
  v == null ? "" : String(v).replace(/^wp-/, "");

function voteTypeToDir(vt: any): -1 | 0 | 1 {
  const v = String(vt || "").toLowerCase();
  if (v === "up" || v === "1") return 1;
  if (v === "down" || v === "-1") return -1;
  return 0;
}

function dirToVoteType(dir: -1 | 1): "up" | "down" {
  return dir > 0 ? "up" : "down";
}

export async function fetchVotesWordPress(entityType: string, entityIds: string[]): Promise<Record<string, VoteSummary>> {
  const result: Record<string, VoteSummary> = {};
  for (const eid of entityIds) result[eid] = { score: 0, upvotes: 0, downvotes: 0, userVote: 0 };
  try {
    const me = stripWp(getStoredWPUser()?.user_id);
    const votes = await wordpressCCTFetch<any[]>("cc_vote", {
      params: { entity_type: entityType, _limit: 500 },
    });
    if (!Array.isArray(votes)) return result;
    for (const v of votes) {
      const eid = String(v.entity_id || "");
      if (!eid || !result[eid]) continue;
      const dir = voteTypeToDir(v.vote_type);
      if (dir > 0) result[eid].upvotes++;
      else if (dir < 0) result[eid].downvotes++;
      result[eid].score = result[eid].upvotes - result[eid].downvotes;
      if (me && String(v.user_id) === me) result[eid].userVote = dir;
    }
    return result;
  } catch { return result; }
}

export async function fetchEntityVoteWordPress(entityType: string, entityId: string): Promise<VoteSummary> {
  const summary = await fetchVotesWordPress(entityType, [entityId]);
  return summary[entityId];
}

export async function toggleVoteWordPress(entityType: string, entityId: string, value: -1 | 1): Promise<void> {
  const me = stripWp(getStoredWPUser()?.user_id);
  if (!me) throw new Error("Not authenticated");
  try {
    // Find this user's existing vote
    const existing = await wordpressCCTFetch<any[]>("cc_vote", {
      params: { entity_type: entityType, entity_id: entityId, user_id: me, _limit: 5 },
    });
    const myExisting = Array.isArray(existing)
      ? existing.find((v: any) => String(v.user_id) === me && String(v.entity_id) === String(entityId))
      : null;
    if (myExisting) {
      const currentDir = voteTypeToDir(myExisting.vote_type);
      if (currentDir === value) {
        await wordpressCCTFetch("cc_vote", { id: myExisting.id || myExisting._ID, method: "DELETE" });
      } else {
        await wordpressCCTFetch("cc_vote", {
          id: myExisting.id || myExisting._ID,
          method: "PUT",
          body: { vote_type: dirToVoteType(value) },
        });
      }
    } else {
      await wordpressCCTFetch("cc_vote", {
        method: "POST",
        body: {
          entity_type: entityType,
          entity_id: String(entityId),
          user_id: String(me),
          vote_type: dirToVoteType(value),
        },
      });
    }
  } catch (e) {
    console.warn("toggleVote failed:", e);
  }
}
