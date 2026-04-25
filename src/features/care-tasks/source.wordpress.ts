import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";

// Live JetEngine relations (verified from prd-to-wp-mapping.md)
const REL_GROUP_TASK = 48;        // M:M  care_group → universal_care_task
const REL_TASK_ASSIGNEE = 81;     // 1:M  universal_care_task → users (caregivers)
const REL_TASK_COMMENT = 82;      // 1:M  universal_care_task → comment
const REL_TASK_USERS = 108;       // M:M  universal_care_task → users (visibility)
const REL_TASK_PRIVATE_GROUPS = 109; // M:M universal_care_task → private_member_group
const REL_TASK_CARED_ONE = 141;   // 1:M  universal_care_task → users (cared ones) — replaces 105
const REL_TASK_CALENDAR = 131;    // 1:M  universal_care_task → users_calendar_even

function normalizeWpObjectId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

async function fetchAssignedUserId(taskId: string): Promise<string | null> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_TASK_ASSIGNEE}/children/${normalizeWpObjectId(taskId)}`);
    if (!Array.isArray(rels) || rels.length === 0) return null;
    const assignedId = rels.map((r: any) => normalizeWpObjectId(r.child_object_id)).find(Boolean);
    return assignedId ? `wp-${assignedId}` : null;
  } catch { return null; }
}

async function fetchCaredOneId(taskId: string): Promise<string | null> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_TASK_CARED_ONE}/children/${normalizeWpObjectId(taskId)}`);
    if (!Array.isArray(rels) || rels.length === 0) return null;
    const id = rels.map((r: any) => normalizeWpObjectId(r.child_object_id)).find(Boolean);
    return id ? `wp-${id}` : null;
  } catch { return null; }
}

// CCT slug: universal_care_task | fields: title, description, status, category, due_date, completed_at
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
          try { return await wordpressCCTFetch("universal_care_task", { id: taskId }); }
          catch { return null; }
        }))
      : await wordpressCCTFetch<any[]>("universal_care_task", { params: { _limit: 100 } });
    const taskList = Array.isArray(tasks) ? tasks.filter(Boolean) : [];
    const mapped = await Promise.all(taskList.map(async (t: any) => {
      const id = String(t.id || t._ID || "");
      const [assigned, caredOne] = await Promise.all([
        fetchAssignedUserId(id),
        fetchCaredOneId(id),
      ]);
      return {
        id,
        care_group_id: groupId || null,
        title: t.title || null,
        description: t.description || null,
        status: t.status || "pending",
        category: t.category || null,
        assigned_to: assigned,
        cared_one_id: caredOne,
        due_date: t.due_date || null,
        completed_at: t.completed_at || null,
        created_by: t.author_id || null,
        created_at: t.created_at,
        updated_at: t.updated_at || t.created_at,
      };
    }));
    return mapped;
  } catch { return []; }
}

export async function createCareTaskWordPress(task: {
  care_group_id?: string; group_id?: string;
  title: string; description?: string; category?: string;
  assigned_to?: string; cared_one_id?: string; due_date?: string;
}): Promise<string | null> {
  const created = await wordpressCCTFetch<any>("universal_care_task", {
    method: "POST",
    body: {
      title: task.title,
      description: task.description || "",
      due_date: task.due_date || null,
      category: task.category || "",
      status: "pending",
    },
  });
  const taskId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  const groupId = normalizeWpObjectId(task.group_id || task.care_group_id);
  const assignedUserId = normalizeWpObjectId(task.assigned_to);
  const caredOneId = normalizeWpObjectId(task.cared_one_id);

  const calls: Promise<any>[] = [];
  if (taskId && groupId) {
    calls.push(wordpressFetch(`jet-rel/${REL_GROUP_TASK}`, {
      method: "POST",
      body: { parent_id: groupId, child_id: taskId, context: "child", store_items_type: "update" },
    }));
  }
  if (taskId && assignedUserId) {
    calls.push(wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
      method: "POST",
      body: { parent_id: taskId, child_id: assignedUserId, context: "child", store_items_type: "replace" },
    }));
  }
  if (taskId && caredOneId) {
    calls.push(wordpressFetch(`jet-rel/${REL_TASK_CARED_ONE}`, {
      method: "POST",
      body: { parent_id: taskId, child_id: caredOneId, context: "child", store_items_type: "replace" },
    }));
  }
  await Promise.all(calls);
  return taskId ? String(taskId) : null;
}

export async function updateCareTaskWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const { care_group_id: _careGroupId, group_id: _groupId, assigned_to, cared_one_id, ...safeUpdates } = updates || {};
  await wordpressCCTFetch("universal_care_task", { id, method: "PUT", body: safeUpdates });
  const taskId = normalizeWpObjectId(id);
  if (assigned_to !== undefined) {
    const assignedUserId = normalizeWpObjectId(assigned_to);
    if (taskId && assignedUserId) {
      await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
        method: "POST",
        body: { parent_id: taskId, child_id: assignedUserId, context: "child", store_items_type: "replace" },
      });
    }
  }
  if (cared_one_id !== undefined) {
    const caredOneNum = normalizeWpObjectId(cared_one_id);
    if (taskId && caredOneNum) {
      await wordpressFetch(`jet-rel/${REL_TASK_CARED_ONE}`, {
        method: "POST",
        body: { parent_id: taskId, child_id: caredOneNum, context: "child", store_items_type: "replace" },
      });
    }
  }
}

export async function deleteCareTaskWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("universal_care_task", { id, method: "DELETE" });
}

// Re-export relation IDs for callers that need them
export { REL_TASK_COMMENT, REL_TASK_USERS, REL_TASK_PRIVATE_GROUPS, REL_TASK_CALENDAR };
