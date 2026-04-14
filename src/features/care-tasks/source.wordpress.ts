import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";

const REL_GROUP_TASK = 48;
const REL_TASK_ASSIGNEE = 81;

function normalizeWpObjectId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

async function fetchAssignedUserId(taskId: string): Promise<string | null> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_TASK_ASSIGNEE}/children/${taskId}`);
    if (!Array.isArray(rels) || rels.length === 0) return null;
    const assignedId = rels.map((r: any) => normalizeWpObjectId(r.child_object_id)).find(Boolean);
    return assignedId ? `wp-${assignedId}` : null;
  } catch {
    return null;
  }
}

// CCT slug: universal_care_task | relations via JetEngine 48 and 81
export async function fetchCareTasksWordPress(groupId?: string | null): Promise<any[]> {
  try {
    const taskIds = groupId
      ? (await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_TASK}/children/${normalizeWpObjectId(groupId)}`))
          .map((r: any) => String(r.child_object_id || ""))
          .filter(Boolean)
      : null;
    if (groupId && (!Array.isArray(taskIds) || taskIds.length === 0)) return [];
    const tasks = groupId
      ? await Promise.all(taskIds!.map(async (taskId) => {
          try {
            return await wordpressCCTFetch("universal_care_task", { id: taskId });
          } catch {
            return null;
          }
        }))
      : await wordpressCCTFetch("universal_care_task", { params: { _limit: 50 } });
    const taskList = Array.isArray(tasks) ? tasks.filter(Boolean) : [];
    const mapped = await Promise.all(taskList.map(async (t: any) => ({
      id: String(t._ID || t.id || ""),
      care_group_id: groupId || null,
      title: t.title || null,
      description: t.description || null,
      status: t.status || "pending",
      assigned_to: await fetchAssignedUserId(String(t._ID || t.id || "")),
      due_date: t.due_date || null,
      completed_at: t.completed_at || null,
      created_by: t.cct_author_id ? `wp-${t.cct_author_id}` : null,
      created_at: t.cct_created || t.created_at,
      updated_at: t.cct_modified || t.updated_at || t.cct_created || t.created_at,
    })));
    return mapped;
  } catch {
    return [];
  }
}

export async function createCareTaskWordPress(task: { care_group_id?: string; group_id?: string; title: string; description?: string; assigned_to?: string; due_date?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>("universal_care_task", {
    method: "POST",
    body: {
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      status: "pending",
    },
  });
  const taskId = normalizeWpObjectId(created?._ID || created?.id);
  const groupId = normalizeWpObjectId(task.group_id || task.care_group_id);
  const assignedUserId = normalizeWpObjectId(task.assigned_to);
  if (taskId && groupId) {
    await wordpressFetch(`jet-rel/${REL_GROUP_TASK}`, {
      method: "POST",
      body: { parent_id: groupId, child_id: taskId, context: "child", store_items_type: "update" },
    });
  }
  if (taskId && assignedUserId) {
    await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
      method: "POST",
      body: { parent_id: taskId, child_id: assignedUserId, context: "child", store_items_type: "replace" },
    });
  }
}

export async function updateCareTaskWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const { care_group_id: _careGroupId, group_id: _groupId, assigned_to, ...safeUpdates } = updates || {};
  await wordpressCCTFetch("universal_care_task", { id, method: "PUT", body: safeUpdates });
  if (assigned_to !== undefined) {
    const taskId = normalizeWpObjectId(id);
    const assignedUserId = normalizeWpObjectId(assigned_to);
    if (taskId && assignedUserId) {
      await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
        method: "POST",
        body: { parent_id: taskId, child_id: assignedUserId, context: "child", store_items_type: "replace" },
      });
    }
  }
}

export async function deleteCareTaskWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("universal_care_task", { id, method: "DELETE" });
}
