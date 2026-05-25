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

const REL_SUBGROUP_MEMBERS = 75;
const REL_POST_SUBGROUPS = 103;
const REL_POST_USERS = 104;
const REL_TASK_USERS = 81;
const REL_TASK_SUBGROUPS = 109;

async function relChildren(rel: number, parentId: number): Promise<number[]> {
  try {
    const r = await wordpressFetch<any[]>(`jet-rel/${rel}/children/${parentId}`);
    return (Array.isArray(r) ? r : []).map((x: any) => Number(x.child_object_id)).filter(Boolean);
  } catch { return []; }
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
      const status = r?.meta?.["care_group_s_private_member_group_member_invitation_status"] || "accepted";
      return status === "accepted";
    });
    return new Set(accepted.map((r: any) => Number(r.parent_object_id)).filter(Boolean));
  } catch { return new Set(); }
}

/** Filter a list of posts to those visible to the current user. */
export async function filterVisiblePosts<T extends { id: string | number }>(posts: T[]): Promise<T[]> {
  if (posts.length === 0) return posts;
  const uid = getCurrentUserIdNumber();
  if (!uid) return [];
  const mySubgroups = await fetchMySubgroupIds();
  const out: T[] = [];
  await Promise.all(posts.map(async (p) => {
    const pid = Number(String(p.id).replace(/^wp-/, ""));
    const [allowedSub, allowedUsers] = await Promise.all([
      relChildren(REL_POST_SUBGROUPS, pid),
      relChildren(REL_POST_USERS, pid),
    ]);
    const hasRestrictions = allowedSub.length > 0 || allowedUsers.length > 0;
    if (!hasRestrictions) { out.push(p); return; }
    if (allowedUsers.includes(uid)) { out.push(p); return; }
    if (allowedSub.some((sg) => mySubgroups.has(sg))) { out.push(p); return; }
  }));
  return out;
}

/** Filter a list of tasks to those visible to the current user. */
export async function filterVisibleTasks<T extends { id: string | number }>(tasks: T[]): Promise<T[]> {
  if (tasks.length === 0) return tasks;
  const uid = getCurrentUserIdNumber();
  if (!uid) return [];
  const mySubgroups = await fetchMySubgroupIds();
  const out: T[] = [];
  await Promise.all(tasks.map(async (t) => {
    const tid = Number(String(t.id).replace(/^wp-/, ""));
    const [allowedSub, allowedUsers] = await Promise.all([
      relChildren(REL_TASK_SUBGROUPS, tid),
      relChildren(REL_TASK_USERS, tid),
    ]);
    const hasRestrictions = allowedSub.length > 0 || allowedUsers.length > 0;
    if (!hasRestrictions) { out.push(t); return; }
    if (allowedUsers.includes(uid)) { out.push(t); return; }
    if (allowedSub.some((sg) => mySubgroups.has(sg))) { out.push(t); return; }
  }));
  return out;
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
