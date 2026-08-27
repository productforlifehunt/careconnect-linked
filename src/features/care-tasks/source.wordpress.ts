import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { R } from "@/integrations/wp-schema";

/**
 * Care Task — JetEngine CCT "162. Care Task"
 *   slug: care_task_real
 *   fields:
 *     a55 = Title, a56 = Description, a57 = Task type, a58 = People needed
 *     a59 = Location, a60 = Photo, a61 = Date, a62 = Start, a63 = End
 *     a64 = Completed at, a65 = Help status, a66 = Finish status
 *
 * Relations (per data model):
 *   REL 141 → cared ones (care_task → users)            One to Many
 *   REL 108 → assigned caregivers (care_task → users)   One to Many   meta: a55 = b55|b56|b57
 *   REL  48 → care group (care_group → care_task)       Many to Many
 *   REL 109 → private member groups (care_task → group) One to Many   visibility
 *   REL  81 → users (care_task → users)                 Many to Many  visibility
 *   REL  82 → comments
 *   REL 263 → 187. User's calendar event
 */

const CCT_SLUG = "care_task";

const REL_GROUP_TASK = R.careGroupTasks;          // M:M  care_group ↔ care_task
// Dictionary name "108. assigned caregivers" — live ID 164 (old 108 was deleted & recreated)
const REL_TASK_ASSIGNEE = R.careTaskAssignees;      // 1:M  care_task → users (assigned caregivers)
const REL_TASK_COMMENT = R.careTaskComments;
const REL_TASK_USERS = R.careTaskVisibleUsers;          // M:M  care_task ↔ users (visibility)
const REL_TASK_PRIVATE_GROUPS = R.careTaskPrivateMemberGroups;// 1:M  care_task → private_member_group
const REL_TASK_CARED_ONE = R.careTaskCaredOnes;     // 1:M  care_task → users (cared ones)
const REL_TASK_CALENDAR = R.careTaskCalendarEvents;

function normalizeWpObjectId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

// ── Help / Finish status mapping ────────────────────────────────
const HELP_STATUS_TO_LABEL: Record<string, string> = {
  "b55": "no_help_needed",
  "b56": "needs_help",
  "b57": "found_help",
};
const FINISH_STATUS_TO_LABEL: Record<string, string> = {
  "b55": "pending",
  "b56": "completed",
};
const ASSIGNEE_STATUS_TO_CODE: Record<string, string> = { pending: "b55", accepted: "b56", rejected: "b57" };
const ASSIGNEE_CODE_TO_STATUS: Record<string, string> = { b55: "pending", b56: "accepted", b57: "rejected" };
function helpStatusFromLegacy(v: any): string {
  const value = String(v ?? "b55");
  if (value === "1") return "b55";
  if (value === "2") return "b56";
  if (value === "3") return "b57";
  return value;
}
function finishStatusFromLegacy(status: any): string {
  return status === "completed" ? "b56" : "b55";
}

async function fetchAssignedUserIds(taskId: string): Promise<string[]> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_TASK_ASSIGNEE}/children/${normalizeWpObjectId(taskId)}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    return rels.map((r: any) => normalizeWpObjectId(r.child_object_id)).filter(Boolean).map((id) => `wp-${id}`);
  } catch { return []; }
}

/** Returns array of { user_id: "wp-N", response: "pending"|"accepted"|"rejected" } */
function mapAssigneeRows(rows: Array<{ childId: string; meta: Record<string, any> | null }>) {
  return rows
    .map((r) => {
      const id = normalizeWpObjectId(r.childId);
      if (!id) return null;
      const response = ASSIGNEE_CODE_TO_STATUS[String(r.meta?.a55 || "b55")] || "pending";
      return { user_id: `wp-${id}`, response };
    })
    .filter(Boolean) as Array<{ user_id: string; response: string }>;
}

async function fetchAssignees(taskId: string): Promise<Array<{ user_id: string; response: string }>> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_TASK_ASSIGNEE}/children/${normalizeWpObjectId(taskId)}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    return mapAssigneeRows(rels.map((r: any) => ({ childId: String(r.child_object_id), meta: r.meta || r.meta_fields || null })));
  } catch { return []; }
}

async function fetchCaredOneId(taskId: string): Promise<string | null> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_TASK_CARED_ONE}/children/${normalizeWpObjectId(taskId)}`);
    if (!Array.isArray(rels) || rels.length === 0) return null;
    const id = rels.map((r: any) => normalizeWpObjectId(r.child_object_id)).find(Boolean);
    return id ? `wp-${id}` : null;
  } catch { return null; }
}


function mapTask(t: any, groupId?: string | null) {
  const id = String(t._ID || t.id || "");
  const finishCode = String(t.a66 ?? "b55");
  const helpCode = helpStatusFromLegacy(t.a65);
  const taskTypeRaw = t.a57;
  const taskTypes = Array.isArray(taskTypeRaw)
    ? taskTypeRaw.map(String)
    : taskTypeRaw
      ? String(taskTypeRaw).split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  return {
    id,
    care_group_id: groupId || null,
    title: t.a55 || "",
    description: t.a56 || "",
    task_types: taskTypes,
    people_needed: t.a58 ? Number(t.a58) : null,
    location: t.a59 || "",
    photo: t.a60 || "",
    task_date: t.a61 || null,
    start_time: t.a62 || null,
    end_time: t.a63 || null,
    completed_at: t.a64 || null,
    help_status: helpCode,
    help_status_label: HELP_STATUS_TO_LABEL[helpCode] || "no_help_needed",
    finish_status: finishCode,
    // Legacy `status` field for existing UI: completed | pending
    status: FINISH_STATUS_TO_LABEL[finishCode] || "pending",
    due_date: t.a61 || null, // legacy alias
    created_by: t.cct_author_id || t.author_id || null,
    created_at: t.cct_created || t.created_at || null,
    updated_at: t.cct_modified || t.updated_at || t.cct_created || null,
  };
}

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
          try { return await wordpressCCTFetch(CCT_SLUG, { id: taskId }); }
          catch { return null; }
        }))
      : await wordpressCCTFetch<any[]>(CCT_SLUG, { params: { _limit: 100 } });
    const taskList = Array.isArray(tasks) ? tasks.filter(Boolean) : [];
    // Two batched relation reads replace two requests per task (N+1).
    const [assigneeMap, caredOneMap] = await Promise.all([
      fetchRelChildrenMap(REL_TASK_ASSIGNEE),
      fetchRelChildrenMap(REL_TASK_CARED_ONE),
    ]);
    const mapped = await Promise.all(taskList.map(async (t: any) => {
      const base = mapTask(t, groupId);
      const pid = String(normalizeWpObjectId(base.id));
      const assignees = assigneeMap.size > 0
        ? mapAssigneeRows(assigneeMap.get(pid) || [])
        : await fetchAssignees(base.id);
      const caredOneChild = caredOneMap.get(pid)?.map((c) => normalizeWpObjectId(c.childId)).find(Boolean);
      const caredOne = caredOneMap.size > 0
        ? (caredOneChild ? `wp-${caredOneChild}` : null)
        : await fetchCaredOneId(base.id);
      const assignedIds = assignees.map((a) => a.user_id);
      return {
        ...base,
        assigned_to: assignedIds[0] || null,
        assigned_to_ids: assignedIds,
        assignees, // [{ user_id, response: "pending"|"accepted"|"rejected" }]
        cared_one_id: caredOne,
      };
    }));

    return mapped;
  } catch { return []; }
}

export async function createCareTaskWordPress(task: {
  care_group_id?: string; group_id?: string;
  title: string; description?: string;
  assigned_to?: string | string[]; cared_one_id?: string;
  // New fields
  task_types?: string[];
  people_needed?: number;
  location?: string;
  photo?: string;
  task_date?: string;
  start_time?: string;
  end_time?: string;
  help_status?: string; // "1"|"2"|"3"
  // Legacy alias
  due_date?: string;
}): Promise<string | null> {
  const body: Record<string, any> = {
    a55: task.title,
    a56: task.description || "",
    a57: Array.isArray(task.task_types) ? task.task_types : [],
    a58: task.people_needed != null ? String(task.people_needed) : "",
    a59: task.location || "",
    a60: task.photo || "",
    a61: task.task_date || task.due_date || "",
    a62: task.start_time || "",
    a63: task.end_time || "",
    a64: "",
    a65: helpStatusFromLegacy(task.help_status),
    a66: "b55", // not finished
  };
  const created = await wordpressCCTFetch<any>(CCT_SLUG, { method: "POST", body });
  const taskId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  const groupId = normalizeWpObjectId(task.group_id || task.care_group_id);
  const assignedUserIds = (Array.isArray(task.assigned_to) ? task.assigned_to : task.assigned_to ? [task.assigned_to] : [])
    .map(normalizeWpObjectId)
    .filter(Boolean);
  const caredOneId = normalizeWpObjectId(task.cared_one_id);

  const calls: Promise<any>[] = [];
  if (taskId && groupId) {
    calls.push(wordpressFetch(`jet-rel/${REL_GROUP_TASK}`, {
      method: "POST",
      body: { parent_id: groupId, child_id: taskId, context: "child", store_items_type: "update" },
    }));
  }
  assignedUserIds.forEach((assignedUserId) => calls.push(wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
    method: "POST",
    body: { parent_id: taskId, child_id: assignedUserId, context: "child", store_items_type: "update", meta: { a55: "b55" } },
  })));
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
  const {
    care_group_id: _careGroupId, group_id: _groupId,
    assigned_to, cared_one_id,
    title, description, task_types, people_needed, location, photo,
    task_date, due_date, start_time, end_time, completed_at,
    help_status, finish_status, status,
    ...rest
  } = updates || {};

  const body: Record<string, any> = { ...rest };
  if (title !== undefined) body.a55 = title;
  if (description !== undefined) body.a56 = description;
  if (task_types !== undefined) body.a57 = Array.isArray(task_types) ? task_types : [];
  if (people_needed !== undefined) body.a58 = people_needed != null ? String(people_needed) : "";
  if (location !== undefined) body.a59 = location;
  if (photo !== undefined) body.a60 = photo;
  if (task_date !== undefined) body.a61 = task_date || "";
  else if (due_date !== undefined) body.a61 = due_date || "";
  if (start_time !== undefined) body.a62 = start_time || "";
  if (end_time !== undefined) body.a63 = end_time || "";
  if (completed_at !== undefined) body.a64 = completed_at || "";
  if (help_status !== undefined) body.a65 = helpStatusFromLegacy(help_status);
  if (finish_status !== undefined) body.a66 = String(finish_status);
  // Legacy: { status: "completed" | "pending" }
  if (status !== undefined) {
    body.a66 = finishStatusFromLegacy(status);
    if (status === "completed") body.a64 = body.a64 || new Date().toISOString();
  }

  if (Object.keys(body).length > 0) {
    await wordpressCCTFetch(CCT_SLUG, { id, method: "PUT", body });
  }

  const taskId = normalizeWpObjectId(id);
  if (assigned_to !== undefined) {
    const assignedUserIds = (Array.isArray(assigned_to) ? assigned_to : assigned_to ? [assigned_to] : [])
      .map(normalizeWpObjectId).filter(Boolean);
    for (const assignedUserId of assignedUserIds) {
      await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
        method: "POST",
        body: { parent_id: taskId, child_id: assignedUserId, context: "child", store_items_type: "update", meta: { a55: "b55" } },
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
  await wordpressCCTFetch(CCT_SLUG, { id, method: "DELETE" });
}

/**
 * Link a calendar event to a task via REL 263 (204. Care Task → 187. User's
 * calendar event). Relation 263 is defined in the dictionary but not yet
 * registered on the live backend, so a 404 must never break task creation.
 */
export async function linkTaskToCalendarEventWordPress(taskId: string, eventId: string): Promise<void> {
  const tid = normalizeWpObjectId(taskId);
  const eid = normalizeWpObjectId(eventId);
  if (!tid || !eid) return;
  try {
    await wordpressFetch(`jet-rel/${REL_TASK_CALENDAR}`, {
      method: "POST",
      body: { parent_id: tid, child_id: eid, context: "child", store_items_type: "update" },
    });
  } catch {
    /* relation not registered on this install — task itself is already saved */
  }
}


/** Update an assignee's response status (pending/accepted/rejected) on REL 108 meta field `a55`. */
export async function updateAssigneeStatusWordPress(taskId: string, userId: string, status: "pending" | "accepted" | "rejected"): Promise<void> {
  const tid = normalizeWpObjectId(taskId);
  const uid = normalizeWpObjectId(userId);
  if (!tid || !uid) return;
  await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
    method: "POST",
    body: { parent_id: tid, child_id: uid, context: "child", store_items_type: "update", meta: { a55: ASSIGNEE_STATUS_TO_CODE[status] || "b55" } },
  });
}

// Re-export relation IDs for callers that need them
export { REL_TASK_COMMENT, REL_TASK_USERS, REL_TASK_PRIVATE_GROUPS, REL_TASK_CALENDAR, REL_TASK_ASSIGNEE, REL_TASK_CARED_ONE, REL_GROUP_TASK, CCT_SLUG };
