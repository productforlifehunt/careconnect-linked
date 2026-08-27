/**
 * Sub-group visibility helpers (Care Group private member groups).
 *
 * - REL 75:  care_group_private_member_group → users   (M:M, members of a sub-group)
 * - REL 103: care_group_not_too_special_post → care_group_private_member_group (M:M, post visibility)
 * - REL 104: care_group_not_too_special_post → users   (M:M, direct user visibility)
 * - REL  81: care_task_real → users (M:M, direct user visibility)
 * - REL 109: care_task_real → care_group_private_member_group (M:M, sub-group visibility)
 * (REL 108 = assigned caregivers, NOT visibility)
 *
 * Visibility rule per the PRD:
 *   A post / task is visible to the current user if EITHER
 *     • it has no visibility links at all (i.e. visible to whole group), OR
 *     • the user is directly listed (rel 104 / 108), OR
 *     • the user is a member of any linked sub-group (rel 75 ∩ rel 103/109).
 */
import { wordpressFetch } from "@/features/shared/wordpress-client";
import { decodeRel75Meta } from "./rel-meta";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";
import { R } from "@/integrations/wp-schema";

const REL_SUBGROUP_MEMBERS = R.privateMemberGroupMembers;
const REL_POST_SUBGROUPS = R.careGroupPostPrivateGroups;
const REL_POST_USERS = R.careGroupPostMentionedUsers;
const REL_TASK_USERS = R.careTaskVisibleUsers;
const REL_TASK_SUBGROUPS = R.careTaskPrivateMemberGroups;

async function relChildren(rel: number, parentId: number): Promise<number[]> {
  try {
    const r = await wordpressFetch<any[]>(`jet-rel/${rel}/children/${parentId}`);
    return (Array.isArray(r) ? r : []).map((x: any) => Number(x.child_object_id)).filter(Boolean);
  } catch { return []; }
}

/**
 * Whole-relation map: `{ parentId: [childId, ...] }`.
 * One request replaces the per-item `children/{id}` calls, which turned every
 * feed render into an N+1 storm (~20s for a handful of posts).
 */
async function relMap(rel: number): Promise<Map<number, number[]>> {
  const out = new Map<number, number[]>();
  try {
    const r = await wordpressFetch<any>(`jet-rel/${rel}`);
    if (r && typeof r === "object" && !Array.isArray(r)) {
      for (const [parent, rows] of Object.entries(r as Record<string, any[]>)) {
        out.set(
          Number(parent),
          (Array.isArray(rows) ? rows : []).map((x: any) => Number(x.child_object_id)).filter(Boolean),
        );
      }
    }
  } catch { /* treat as no restrictions */ }
  return out;
}
async function relParents(rel: number, childId: number): Promise<number[]> {
  try {
    const r = await wordpressFetch<any[]>(`jet-rel/${rel}/parents/${childId}`);
    return (Array.isArray(r) ? r : []).map((x: any) => Number(x.parent_object_id)).filter(Boolean);
  } catch { return []; }
}

/** Sub-group ids the current user belongs to (status = accepted only). */
export async function fetchMySubgroupIds(): Promise<Set<number>> {
  const uid = getCurrentUserIdNumber();
  if (!uid) return new Set();
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_SUBGROUP_MEMBERS}/parents/${uid}`);
    const accepted = (Array.isArray(rels) ? rels : []).filter((r: any) => {
      return decodeRel75Meta(r?.meta).status === "accepted";
    });
    return new Set(accepted.map((r: any) => Number(r.parent_object_id)).filter(Boolean));
  } catch { return new Set(); }
}

/** Filter a list of posts to those visible to the current user. */
/**
 * Resolve visibility for a list of entities while PRESERVING input order.
 * (An earlier version pushed into an array from inside `Promise.all`, which made
 * the result order depend on network timing — newest items could fall outside a
 * `slice(0, n)` feed and appear to vanish.)
 */
async function filterVisibleEntities<T extends { id: string | number }>(
  items: T[],
  relSubgroups: number,
  relUsers: number,
): Promise<T[]> {
  if (items.length === 0) return items;
  const uid = getCurrentUserIdNumber();
  if (!uid) return [];
  const [mySubgroups, subMap, userMap] = await Promise.all([
    fetchMySubgroupIds(),
    relMap(relSubgroups),
    relMap(relUsers),
  ]);
  return items.filter((item) => {
    const id = Number(String(item.id).replace(/^wp-/, ""));
    if (!id) return true; // no id to scope by → treat as unrestricted
    const allowedSub = subMap.get(id) || [];
    const allowedUsers = userMap.get(id) || [];
    if (allowedSub.length === 0 && allowedUsers.length === 0) return true;
    if (allowedUsers.includes(uid)) return true;
    return allowedSub.some((sg) => mySubgroups.has(sg));
  });
}

export async function filterVisiblePosts<T extends { id: string | number }>(posts: T[]): Promise<T[]> {
  return filterVisibleEntities(posts, REL_POST_SUBGROUPS, REL_POST_USERS);
}

/** Filter a list of tasks to those visible to the current user. */
export async function filterVisibleTasks<T extends { id: string | number }>(tasks: T[]): Promise<T[]> {
  return filterVisibleEntities(tasks, REL_TASK_SUBGROUPS, REL_TASK_USERS);
}

/** Set the sub-group visibility links for a post (replaces existing). */
export async function setPostVisibility(postId: string | number, subgroupIds: number[], userIds: number[] = []): Promise<void> {
  const pid = Number(String(postId).replace(/^wp-/, ""));
  if (!pid) return;
  await Promise.all([
    ...subgroupIds.map((sg) =>
      wordpressFetch(`jet-rel/${REL_POST_SUBGROUPS}`, {
        method: "POST",
        body: { parent_id: pid, child_id: sg, context: "child", store_items_type: "update" },
      }).catch(() => undefined)
    ),
    ...userIds.map((uid) =>
      wordpressFetch(`jet-rel/${REL_POST_USERS}`, {
        method: "POST",
        body: { parent_id: pid, child_id: uid, context: "child", store_items_type: "update" },
      }).catch(() => undefined)
    ),
  ]);
}

/** Set the sub-group visibility links for a task (replaces existing). */
export async function setTaskVisibility(taskId: string | number, subgroupIds: number[], userIds: number[] = []): Promise<void> {
  const tid = Number(String(taskId).replace(/^wp-/, ""));
  if (!tid) return;
  await Promise.all([
    ...subgroupIds.map((sg) =>
      wordpressFetch(`jet-rel/${REL_TASK_SUBGROUPS}`, {
        method: "POST",
        body: { parent_id: tid, child_id: sg, context: "child", store_items_type: "update" },
      }).catch(() => undefined)
    ),
    ...userIds.map((uid) =>
      wordpressFetch(`jet-rel/${REL_TASK_USERS}`, {
        method: "POST",
        body: { parent_id: tid, child_id: uid, context: "child", store_items_type: "update" },
      }).catch(() => undefined)
    ),
  ]);
}
