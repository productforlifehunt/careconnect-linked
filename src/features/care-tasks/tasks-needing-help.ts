/**
 * Shared care tasks — the marketplace side of JetEngine CCT 204 `care_task`.
 *
 * The 2026-09-04 bible removed CCT 216 "care job": a task IS the job. A task
 * becomes visible to helpers outside the care group when a65 (Task help status)
 * is b56 "Task needs help"; b57 means help was found. Paid help uses a68
 * (Needs payment) + a69 (Price).
 *
 * Relations:
 *   232 care_task → users   applicants / assigned caregivers (meta = response)
 *   236 care_task → comment the applicant's message ("cover letter")
 *   253 care_task → care_task  sub-tasks bundled into a shared task
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { fetchWPUserPublicProfile } from "@/features/shared/wp-users";
import { R, T, WP } from "@/integrations/wp-schema";

const SLUG = T.careTask.slug;
const F = T.careTask.f;
const O = T.careTask.opt;
const REL232 = WP.rel["232"];
const ASSIGNEE_FIELD = REL232.f.ASSIGNED_CAREGIVER_STATUS;
const REL_TASK_ASSIGNEE = R.careTaskAssignees;

const stripWp = (v: any) => (v == null ? "" : String(v).replace(/^wp-/, ""));
const numId = (v: any) => Number(stripWp(v));

const RESPONSE_CODE: Record<string, string> = {
  pending: REL232.opt.ASSIGNED_CAREGIVER_STATUS.PENDING,
  accepted: REL232.opt.ASSIGNED_CAREGIVER_STATUS.ACCEPTED,
  rejected: REL232.opt.ASSIGNED_CAREGIVER_STATUS.REJECTED,
};
const RESPONSE_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(RESPONSE_CODE).map(([k, v]) => [v, k]),
);

function mapShared(t: any) {
  const helpCode = String(t[F.TASK_HELP_STATUS] || "");
  return {
    id: String(t.id || t._ID),
    posted_by: t.cct_author_id ?? t.author_id ?? null,
    title: t[F.TITLE] || "",
    description: t[F.DESCRIPTION] || "",
    location: t[F.LOCATION] || "",
    task_date: t[F.DATE_OF_THE_TASK] || null,
    start_time: t[F.TASK_START_TIME] || null,
    end_time: t[F.TASK_END_TIME] || null,
    people_needed: t[F.PEOPLE_NEEDED] ? Number(t[F.PEOPLE_NEEDED]) : null,
    needs_payment: String(t[F.NEEDS_PAYMENT] || "") === O.NEEDS_PAYMENT.YES,
    price: t[F.PRICE] || "",
    help_status: helpCode,
    /** open = still looking for help, filled = help found */
    status: helpCode === O.TASK_HELP_STATUS.TASK_HAS_FOUND_HELP ? "filled" : "open",
    finished: String(t[F.TASK_FINISH_STATUS] || "") === O.TASK_FINISH_STATUS.FINISHED,
    created_at: t.cct_created || t.created_at || null,
  };
}

/** Every task its owner shared out for help (a65 = b56 or b57). */
export async function fetchHelpTasksWordPress(filters?: { paid?: boolean; status?: "open" | "filled" }): Promise<any[]> {
  const rows = await wordpressCCTFetch<any[]>(SLUG, { params: { _limit: 100 } });
  if (!Array.isArray(rows)) throw new Error("Care tasks returned an invalid response");
  const shared = rows
    .filter((t: any) => {
      const code = String(t[F.TASK_HELP_STATUS] || "");
      return code === O.TASK_HELP_STATUS.TASK_NEEDS_HELP || code === O.TASK_HELP_STATUS.TASK_HAS_FOUND_HELP;
    })
    .map(mapShared)
    .filter((t) => (filters?.paid === undefined ? true : t.needs_payment === filters.paid))
    .filter((t) => (filters?.status ? t.status === filters.status : true));

  const posterIds = [...new Set(shared.map((t) => numId(t.posted_by)).filter(Boolean))];
  const profiles = new Map<number, any>();
  await Promise.all(posterIds.map(async (id) => {
    try { profiles.set(id, await fetchWPUserPublicProfile(id)); } catch { /* poster may be hidden */ }
  }));
  return shared.map((t) => {
    const p = profiles.get(numId(t.posted_by));
    return {
      ...t,
      poster: p ? { id: `wp-${numId(t.posted_by)}`, full_name: p.full_name, avatar_url: p.avatar_url, location: p.location } : null,
    };
  });
}

/** Shared tasks I posted. */
export async function fetchMyHelpTasksWordPress(): Promise<any[]> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) throw new Error("Not authenticated");
  const me = Number(stored.user_id);
  const all = await fetchHelpTasksWordPress();
  return all.filter((t: any) => numId(t.posted_by) === me);
}

/** People who offered to help one shared task — Relation 232 with its status meta. */
export async function fetchTaskApplicantsWordPress(taskId: string): Promise<any[]> {
  const tid = numId(taskId);
  if (!tid) throw new Error("Invalid task id");
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_TASK_ASSIGNEE}/children/${tid}`);
  if (!Array.isArray(rels)) throw new Error(`Relation ${REL_TASK_ASSIGNEE} returned an invalid response`);
  const profiles = await Promise.all(rels.map(async (r: any) => {
    if (!r.child_object_id) return null;
    try { return await fetchWPUserPublicProfile(r.child_object_id); } catch { return null; }
  }));
  return rels.map((r: any, i: number) => {
    const meta = r.meta || r.meta_fields || null;
    return {
      id: `${tid}:${numId(r.child_object_id)}`,
      task_id: String(tid),
      applicant_id: r.child_object_id ? `wp-${numId(r.child_object_id)}` : null,
      applicant: profiles[i] ? { full_name: profiles[i]!.full_name, avatar_url: profiles[i]!.avatar_url } : null,
      status: RESPONSE_LABEL[String(meta?.[ASSIGNEE_FIELD])] || "pending",
      created_at: r.created_at || null,
    };
  });
}

/** Offer to help: Relation 232 link (pending) + the message as a task comment. */
export async function applyToSharedTaskWordPress(taskId: string, message?: string): Promise<void> {
  const stored = getStoredWPUser();
  const me = stored?.user_id ? Number(stored.user_id) : null;
  if (!me) throw new Error("Not authenticated");
  const tid = numId(taskId);
  if (!tid) throw new Error("Invalid task id");

  await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
    method: "POST",
    body: {
      parent_id: tid, child_id: me, context: "child", store_items_type: "update",
      meta: { [ASSIGNEE_FIELD]: RESPONSE_CODE.pending },
    },
  });

  if (message?.trim()) {
    const { createCommentWordPress } = await import("@/features/comments/source.wordpress");
    await createCommentWordPress({ entity_type: "care_task", entity_id: String(tid), content: message.trim() });
  }

  try {
    const task = await wordpressCCTFetch<any>(SLUG, { id: String(tid) });
    const posterId = task?.cct_author_id ?? task?.author_id;
    if (posterId) {
      const { notifyTaskHelpOffer } = await import("@/features/notifications/notify-events");
      await notifyTaskHelpOffer(posterId, String(task?.[F.TITLE] || ""), String(tid));
    }
  } catch { /* non-blocking */ }
}

/** Shared tasks I offered to help with. */
export async function fetchMyTaskApplicationsWordPress(): Promise<any[]> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) throw new Error("Not authenticated");
  const me = Number(stored.user_id);
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_TASK_ASSIGNEE}/parents/${me}`);
  if (!Array.isArray(rels)) throw new Error(`Relation ${REL_TASK_ASSIGNEE} returned an invalid response`);
  const taskIds = [...new Set(rels.map((r: any) => numId(r.parent_object_id)).filter(Boolean))];
  const tasks = await Promise.all(taskIds.map(async (id) => {
    try { return mapShared(await wordpressCCTFetch<any>(SLUG, { id: String(id) })); } catch { return null; }
  }));
  return rels
    .map((r: any) => {
      const tid = numId(r.parent_object_id);
      const task = tasks.find((t: any) => t && Number(t.id) === tid) || null;
      const meta = r.meta || r.meta_fields || null;
      return {
        id: `${tid}:${me}`,
        task_id: String(tid),
        task,
        applicant_id: `wp-${me}`,
        status: RESPONSE_LABEL[String(meta?.[ASSIGNEE_FIELD])] || "pending",
        created_at: r.created_at || null,
      };
    })
    .filter((a) => a.task);
}

/**
 * Task owner decides on a helper. Accepting also moves the task to
 * a65 = b57 "Task has found help"; rejecting unlinks the helper.
 */
export async function decideTaskApplicantWordPress(applicationId: string, status: "accepted" | "rejected"): Promise<void> {
  const [taskId, userId] = applicationId.split(":").map(numId);
  if (!taskId || !userId) throw new Error("An application ID must be taskId:userId");
  if (status === "rejected") {
    await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
      method: "POST",
      body: { parent_id: taskId, child_id: userId, context: "child", store_items_type: "disconnect" },
    });
    return;
  }
  await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
    method: "POST",
    body: {
      parent_id: taskId, child_id: userId, context: "child", store_items_type: "update",
      meta: { [ASSIGNEE_FIELD]: RESPONSE_CODE.accepted },
    },
  });
  await wordpressCCTFetch(SLUG, {
    id: String(taskId), method: "PUT",
    body: { [F.TASK_HELP_STATUS]: O.TASK_HELP_STATUS.TASK_HAS_FOUND_HELP },
  });
}

/** Share an existing task out for help (optionally paid). */
export async function shareTaskWordPress(taskId: string, opts?: { needs_payment?: boolean; price?: string }): Promise<void> {
  const tid = numId(taskId);
  if (!tid) throw new Error("Invalid task id");
  await wordpressCCTFetch(SLUG, {
    id: String(tid), method: "PUT",
    body: {
      [F.TASK_HELP_STATUS]: O.TASK_HELP_STATUS.TASK_NEEDS_HELP,
      [F.NEEDS_PAYMENT]: opts?.needs_payment ? O.NEEDS_PAYMENT.YES : O.NEEDS_PAYMENT.NO,
      [F.PRICE]: opts?.price || "",
    },
  });
}

/** Stop sharing a task (back to "doesn't need help"). */
export async function unshareTaskWordPress(taskId: string): Promise<void> {
  const tid = numId(taskId);
  if (!tid) throw new Error("Invalid task id");
  await wordpressCCTFetch(SLUG, {
    id: String(tid), method: "PUT",
    body: { [F.TASK_HELP_STATUS]: O.TASK_HELP_STATUS.TASK_DOESN_T_NEED_HELP },
  });
}
