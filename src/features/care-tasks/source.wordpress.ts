import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { fetchRelChildrenMap } from "@/features/shared/rel-batch";
import { R, T } from "@/integrations/wp-schema";


/**
 * Care Task — JetEngine CCT 204 `care_task`
 *   fields:
 *     a55 = Title, a56 = Description, a57 = Task type, a58 = People needed
 *     a59 = Location, a60 = Photo, a61 = Date, a62 = Start, a63 = End
 *     a64 = Completed at, a65 = Help status, a66 = Finish status
 *
 * Relations (per data model):
 *   REL 231 → cared ones; REL 232 → assigned caregivers
 *   REL 233 → care groups; REL 234 → private groups
 *   REL 235 → visible users; REL 236 → comments
 *   REL 263 → 187. User's calendar event
 */

const CCT_SLUG = T.careTask.slug;
const F = T.careTask.f;
const O = T.careTask.opt;
const REL232 = (await import("@/integrations/wp-schema")).WP.rel["232"];
const ASSIGNEE_FIELD = REL232.f.ASSIGNED_CAREGIVER_STATUS;

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
  [O.TASK_HELP_STATUS.TASK_DOESN_T_NEED_HELP]: "no_help_needed",
  [O.TASK_HELP_STATUS.TASK_NEEDS_HELP]: "needs_help",
  [O.TASK_HELP_STATUS.TASK_HAS_FOUND_HELP]: "found_help",
};
const FINISH_STATUS_TO_LABEL: Record<string, string> = {
  [O.TASK_FINISH_STATUS.NOT_FINISHED]: "pending",
  [O.TASK_FINISH_STATUS.FINISHED]: "completed",
};
const ASSIGNEE_STATUS_TO_CODE: Record<string, string> = {
  pending: REL232.opt.ASSIGNED_CAREGIVER_STATUS.PENDING,
  accepted: REL232.opt.ASSIGNED_CAREGIVER_STATUS.ACCEPTED,
  rejected: REL232.opt.ASSIGNED_CAREGIVER_STATUS.REJECTED,
};
const ASSIGNEE_CODE_TO_STATUS = Object.fromEntries(Object.entries(ASSIGNEE_STATUS_TO_CODE).map(([status, code]) => [code, status]));
function helpStatusCode(v: any): string {
  const value = String(v);
  if (!HELP_STATUS_TO_LABEL[value]) throw new Error(`Invalid care-task help status: ${value}`);
  return value;
}
function finishStatusFromLegacy(status: any): string {
  return status === "completed" ? "b56" : "b55";
}


/** Returns array of { user_id: "wp-N", response: "pending"|"accepted"|"rejected" } */
function mapAssigneeRows(rows: Array<{ childId: string; meta: Record<string, any> | null }>) {
  return rows
    .map((r) => {
      const id = normalizeWpObjectId(r.childId);
      if (!id) return null;
       const response = ASSIGNEE_CODE_TO_STATUS[String(r.meta?.[ASSIGNEE_FIELD])];
       if (!response) throw new Error(`Invalid task-assignee response code for user ${id}`);
      return { user_id: `wp-${id}`, response };
    })
    .filter(Boolean) as Array<{ user_id: string; response: string }>;
}

async function fetchAssignees(taskId: string): Promise<Array<{ user_id: string; response: string }>> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_TASK_ASSIGNEE}/children/${normalizeWpObjectId(taskId)}`);
  if (!Array.isArray(rels)) throw new Error(`Relation ${REL_TASK_ASSIGNEE} returned an invalid response`);
  return mapAssigneeRows(rels.map((r: any) => ({ childId: String(r.child_object_id), meta: r.meta || r.meta_fields || null })));
}

async function fetchCaredOneId(taskId: string): Promise<string | null> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_TASK_CARED_ONE}/children/${normalizeWpObjectId(taskId)}`);
  if (!Array.isArray(rels)) throw new Error(`Relation ${REL_TASK_CARED_ONE} returned an invalid response`);
  const id = rels.map((r: any) => normalizeWpObjectId(r.child_object_id)).find(Boolean);
  return id ? `wp-${id}` : null;
}


function mapTask(t: any, groupId?: string | null) {
  const id = String(t._ID || t.id || "");
  const finishCode = String(t[F.TASK_FINISH_STATUS]);
  const helpCode = helpStatusCode(t[F.TASK_HELP_STATUS]);
  if (!FINISH_STATUS_TO_LABEL[finishCode]) throw new Error(`Invalid care-task finish status: ${finishCode}`);
  const taskTypeRaw = t[F.TASK_TYPE];
  const taskTypes = Array.isArray(taskTypeRaw)
    ? taskTypeRaw.map(String)
    : taskTypeRaw
      ? String(taskTypeRaw).split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  return {
    id,
    care_group_id: groupId || null,
    title: t[F.TITLE] || "",
    description: t[F.DESCRIPTION] || "",
    task_types: taskTypes,
    people_needed: t[F.PEOPLE_NEEDED] ? Number(t[F.PEOPLE_NEEDED]) : null,
    location: t[F.LOCATION] || "",
    // a60 is a JetEngine Gallery field: "173,174,175" (WP media IDs).
    photo: t[F.PHOTO] || "",
    photo_ids: String(t[F.PHOTO] ?? "")
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0),
    task_date: t[F.DATE_OF_THE_TASK] || null,
    start_time: t[F.TASK_START_TIME] || null,
    end_time: t[F.TASK_END_TIME] || null,
    completed_at: t[F.TASK_COMPLETED_AT] || null,
    help_status: helpCode,
    help_status_label: HELP_STATUS_TO_LABEL[helpCode],
    finish_status: finishCode,
    // Legacy `status` field for existing UI: completed | pending
    status: FINISH_STATUS_TO_LABEL[finishCode],
    due_date: t[F.DATE_OF_THE_TASK] || null,
    created_by: t.cct_author_id || t.author_id || null,
    created_at: t.cct_created || t.created_at || null,
    updated_at: t.cct_modified || t.updated_at || t.cct_created || null,
  };
}

export async function fetchCareTasksWordPress(groupId?: string | null): Promise<any[]> {
    const taskIds = groupId
      ? (await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_TASK}/children/${normalizeWpObjectId(groupId)}`))
          .map((r: any) => String(r.child_object_id || ""))
          .filter(Boolean)
      : null;
    if (groupId && (!Array.isArray(taskIds) || taskIds.length === 0)) return [];
    const tasks = groupId
      ? await Promise.all(taskIds!.map((taskId) => wordpressCCTFetch(CCT_SLUG, { id: taskId })))
      : await wordpressCCTFetch<any[]>(CCT_SLUG, { params: { _limit: 100 } });
    if (!Array.isArray(tasks)) throw new Error("Care tasks returned an invalid response");
    const taskList = tasks;
    // Two batched relation reads replace two requests per task (N+1).
    const [assigneeMap, caredOneMap] = await Promise.all([
      fetchRelChildrenMap(REL_TASK_ASSIGNEE),
      fetchRelChildrenMap(REL_TASK_CARED_ONE),
    ]);
    const mapped = await Promise.all(taskList.map(async (t: any) => {
      const base = mapTask(t, groupId);
      const pid = String(normalizeWpObjectId(base.id));
      const assignees = assigneeMap.loaded
        ? mapAssigneeRows(assigneeMap.get(pid) || [])
        : await fetchAssignees(base.id);
      const caredOneChild = caredOneMap.get(pid)?.map((c) => normalizeWpObjectId(c.childId)).find(Boolean);
      const caredOne = caredOneMap.loaded
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
  photo_ids?: Array<number | string>;
  task_date?: string;
  start_time?: string;
  end_time?: string;
  help_status?: string; // b55|b56|b57
  // Legacy alias
  due_date?: string;
}): Promise<string | null> {
  const body: Record<string, any> = {
    [F.TITLE]: task.title,
    [F.DESCRIPTION]: task.description || "",
    [F.TASK_TYPE]: Array.isArray(task.task_types) ? task.task_types : [],
    [F.PEOPLE_NEEDED]: task.people_needed != null ? String(task.people_needed) : "",
    [F.LOCATION]: task.location || "",
    [F.PHOTO]: Array.isArray(task.photo_ids) && task.photo_ids.length
      ? task.photo_ids.map((v) => Number(String(v).trim())).filter((n) => Number.isFinite(n) && n > 0).join(",")
      : (task.photo || ""),
    [F.DATE_OF_THE_TASK]: task.task_date || task.due_date || "",
    [F.TASK_START_TIME]: task.start_time || "",
    [F.TASK_END_TIME]: task.end_time || "",
    [F.TASK_COMPLETED_AT]: "",
    [F.TASK_HELP_STATUS]: helpStatusCode(task.help_status ?? O.TASK_HELP_STATUS.TASK_DOESN_T_NEED_HELP),
    [F.TASK_FINISH_STATUS]: T.careTask.opt.TASK_FINISH_STATUS.NOT_FINISHED,
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
    body: { parent_id: taskId, child_id: assignedUserId, context: "child", store_items_type: "update", meta: { [ASSIGNEE_FIELD]: ASSIGNEE_STATUS_TO_CODE.pending } },
  })));
  if (taskId && caredOneId) {
    calls.push(wordpressFetch(`jet-rel/${REL_TASK_CARED_ONE}`, {
      method: "POST",
      body: { parent_id: taskId, child_id: caredOneId, context: "child", store_items_type: "replace" },
    }));
  }
  await Promise.all(calls);

  // Notify assignees — non-blocking, never fails task creation.
  if (taskId && assignedUserIds.length > 0) {
    try {
      const { notifyTaskAssigned } = await import("@/features/notifications/notify-events");
      await notifyTaskAssigned(assignedUserIds, task.title, String(taskId));
    } catch { /* non-blocking */ }
  }

  return taskId ? String(taskId) : null;
}

export async function updateCareTaskWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const {
    care_group_id: _careGroupId, group_id: _groupId,
    assigned_to, cared_one_id,
    title, description, task_types, people_needed, location, photo, photo_ids,
    task_date, due_date, start_time, end_time, completed_at,
    help_status, finish_status, status,
    ...rest
  } = updates || {};

  if (Object.keys(rest).length) throw new Error(`Unsupported care-task fields: ${Object.keys(rest).join(", ")}`);
  const body: Record<string, any> = {};
  if (title !== undefined) body[F.TITLE] = title;
  if (description !== undefined) body[F.DESCRIPTION] = description;
  if (task_types !== undefined) body[F.TASK_TYPE] = Array.isArray(task_types) ? task_types : [];
  if (people_needed !== undefined) body[F.PEOPLE_NEEDED] = people_needed != null ? String(people_needed) : "";
  if (location !== undefined) body[F.LOCATION] = location;
  if (photo_ids !== undefined) {
    body[F.PHOTO] = (Array.isArray(photo_ids) ? photo_ids : [])
      .map((v: any) => Number(String(v).trim()))
      .filter((n: number) => Number.isFinite(n) && n > 0)
      .join(",");
  } else if (photo !== undefined) body[F.PHOTO] = photo;
  if (task_date !== undefined) body[F.DATE_OF_THE_TASK] = task_date || "";
  else if (due_date !== undefined) body[F.DATE_OF_THE_TASK] = due_date || "";
  if (start_time !== undefined) body[F.TASK_START_TIME] = start_time || "";
  if (end_time !== undefined) body[F.TASK_END_TIME] = end_time || "";
  if (completed_at !== undefined) body[F.TASK_COMPLETED_AT] = completed_at || "";
  if (help_status !== undefined) body[F.TASK_HELP_STATUS] = helpStatusCode(help_status);
  if (finish_status !== undefined) {
    const code = String(finish_status);
    if (!FINISH_STATUS_TO_LABEL[code]) throw new Error(`Invalid care-task finish status: ${code}`);
    body[F.TASK_FINISH_STATUS] = code;
  }
  // Legacy: { status: "completed" | "pending" }
  if (status !== undefined) {
    body[F.TASK_FINISH_STATUS] = finishStatusFromLegacy(status);
    if (status === "completed") body[F.TASK_COMPLETED_AT] = body[F.TASK_COMPLETED_AT] || new Date().toISOString();
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
        body: { parent_id: taskId, child_id: assignedUserId, context: "child", store_items_type: "update", meta: { [ASSIGNEE_FIELD]: ASSIGNEE_STATUS_TO_CODE.pending } },
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
 * registered in the data dictionary.
 */
export async function linkTaskToCalendarEventWordPress(taskId: string, eventId: string): Promise<void> {
  const tid = normalizeWpObjectId(taskId);
  const eid = normalizeWpObjectId(eventId);
  if (!tid || !eid) throw new Error("Invalid task or calendar-event ID");
  await wordpressFetch(`jet-rel/${REL_TASK_CALENDAR}`, {
      method: "POST",
      body: { parent_id: tid, child_id: eid, context: "child", store_items_type: "update" },
  });
}


/** Update an assignee's response status (pending/accepted/rejected) on REL 108 meta field `a55`. */
export async function updateAssigneeStatusWordPress(taskId: string, userId: string, status: "pending" | "accepted" | "rejected"): Promise<void> {
  const tid = normalizeWpObjectId(taskId);
  const uid = normalizeWpObjectId(userId);
  if (!tid || !uid) throw new Error("Invalid task or user ID");
  await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
    method: "POST",
    body: { parent_id: tid, child_id: uid, context: "child", store_items_type: "update", meta: { [ASSIGNEE_FIELD]: ASSIGNEE_STATUS_TO_CODE[status] } },
  });
}

// Re-export relation IDs for callers that need them
export { REL_TASK_COMMENT, REL_TASK_USERS, REL_TASK_PRIVATE_GROUPS, REL_TASK_CALENDAR, REL_TASK_ASSIGNEE, REL_TASK_CARED_ONE, REL_GROUP_TASK, CCT_SLUG };
