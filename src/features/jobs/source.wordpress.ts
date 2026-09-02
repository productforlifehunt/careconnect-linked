/**
 * Care Job — JetEngine CCT 216 `care_job`.
 *   Fields:
 *     a55=title, a56=description, a57=Due date, a58=Completed at,
 *     a59=Status (b55 pending | b56 in progress | b57 completed)
 *   Relations:
 *     250: care_job → users  (cared ones)              1:M
 *     251: care_job → users  (assigned caregivers)     1:M
 *     252: care_group → care_job                       M:M
 *     253: care_job → care_task                        M:M
 *     254: care_job → comment                          1:M
 *   The bible does NOT define a separate "application" CCT.
 *   "Apply" = create a Rel 153 link request (caregiver → job).
 *   Author = JetEngine default author (the poster).
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { fetchWPUserPublicProfile } from "@/features/shared/wp-users";
import { R, T } from "@/integrations/wp-schema";

const JOB = T.careJob;
const SLUG = JOB.slug;
const F = JOB.f;
const REL_JOB_CARED_ONES = R.careJobCaredOnes;
const REL_JOB_CAREGIVERS = R.careJobAssignees;
const REL_GROUP_JOBS = R.careGroupJobs;
const REL_JOB_TASKS = R.careJobTasks;

const STATUS_OUT: Record<string, string> = { pending: JOB.opt.STATUS.PENDING, in_progress: JOB.opt.STATUS.IN_PROGRESS, "in progress": JOB.opt.STATUS.IN_PROGRESS, completed: JOB.opt.STATUS.COMPLETED };
const STATUS_IN: Record<string, string>  = { [JOB.opt.STATUS.PENDING]: "pending", [JOB.opt.STATUS.IN_PROGRESS]: "in_progress", [JOB.opt.STATUS.COMPLETED]: "completed" };

const stripWp = (v: string | number | null | undefined) => v == null ? "" : String(v).replace(/^wp-/, "");
const numId = (v: string | number | null | undefined) => Number(stripWp(v));

function mapJob(j: any) {
  const status = STATUS_IN[String(j[F.STATUS])];
  if (!status) throw new Error(`Care job ${j.id || j._ID} has an invalid status code`);
  return {
    id: String(j.id || j._ID),
    posted_by: j.author_id ? `wp-${j.author_id}` : null,
    title: j[F.TITLE] || null,
    description: j[F.DESCRIPTION] || null,
    due_date: j[F.DUE_DATE] || null,
    start_date: j[F.DUE_DATE] || null,
    completed_at: j[F.COMPLETED_AT] || null,
    status,
    created_at: j.cct_created || j.created_at,
    updated_at: j.cct_modified || j.updated_at,
  };
}

export async function fetchJobPostingsWordPress(filters?: {
  source?: string; status?: string; locale?: { area?: string; language?: string };
}): Promise<any[]> {
    const params: Record<string, any> = { _limit: 100 };
    if (filters?.status) {
      const statusCode = STATUS_OUT[filters.status];
      if (!statusCode) throw new Error(`Invalid care-job status: ${filters.status}`);
      params[F.STATUS] = statusCode;
    }
    const jobs = await wordpressCCTFetch<any[]>(SLUG, { params });
    if (!Array.isArray(jobs)) throw new Error("Care jobs returned an invalid response");
    return jobs.map(mapJob);
}

export async function createJobPostingWordPress(job: {
  title: string; description: string; care_type?: string; location?: string;
  budget?: string; schedule?: string; special_needs?: string; children_ages?: string;
  start_date?: string; due_date?: string; care_group_id?: string; app_area?: string; language?: string;
}): Promise<void> {
  const created = await wordpressCCTFetch<any>(SLUG, {
    method: "POST",
    body: {
      [F.TITLE]: job.title,
      [F.DESCRIPTION]: job.description,
      [F.DUE_DATE]: job.due_date || job.start_date || "",
      [F.STATUS]: STATUS_OUT.pending,
    },
  });
  const jobId = numId(created?.item_id || created?._ID || created?.id);
  // Optional link to a care group (Rel 154)
  if (jobId && job.care_group_id) {
    const groupId = numId(job.care_group_id);
    if (groupId) {
      await wordpressFetch(`jet-rel/${REL_GROUP_JOBS}`, {
        method: "POST",
        body: { parent_id: groupId, child_id: jobId, context: "child", store_items_type: "update" },
      });
    }
  }
}

export async function fetchJobApplicationsWordPress(jobId: string): Promise<any[]> {
  // Per bible: "applications" = caregivers linked via Rel 153.
    const normalizedJobId = stripWp(jobId);
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_JOB_CAREGIVERS}/children/${normalizedJobId}`);
    if (!Array.isArray(rels)) throw new Error(`Relation ${REL_JOB_CAREGIVERS} returned an invalid response`);
    const applicants = await Promise.all(
      rels.map(async (r: any) => {
        if (!r.child_object_id) return null;
        try {
          return await fetchWPUserPublicProfile(r.child_object_id);
        } catch {
          return null;
        }
      })
    );
    return rels.map((r: any, i: number) => ({
      id: String(r._ID || r.id || `${normalizedJobId}-${r.child_object_id}`),
      job_id: normalizedJobId,
      applicant_id: r.child_object_id ? `wp-${r.child_object_id}` : null,
      applicant: applicants[i]
        ? { full_name: applicants[i]!.full_name, avatar_url: applicants[i]!.avatar_url }
        : null,
      cover_letter: null,
      cover_message: null,
      created_at: r.created_at || null,
    }));
}

export async function applyToJobWordPress(jobId: string, _coverLetter?: string): Promise<void> {
  const stored = getStoredWPUser();
  const applicantId = stored?.user_id ? Number(stored.user_id) : null;
  if (!applicantId) throw new Error("Not authenticated");
  const jid = numId(jobId);
  if (!jid) throw new Error("Invalid job id");
  // Apply == request to be assigned (Rel 153 caregiver link).
  // Errors surface to the caller so the UI can show a real failure instead of
  // a silent "applied" state.
  await wordpressFetch(`jet-rel/${REL_JOB_CAREGIVERS}`, {
    method: "POST",
    body: { parent_id: jid, child_id: applicantId, context: "child", store_items_type: "update" },
  });

  // Notify the job poster (CCT author) — non-blocking.
  try {
    const job = await wordpressCCTFetch<any>(SLUG, { id: String(jid) });
    const posterId = job?.author_id ?? job?.cct_author_id;
    if (posterId) {
      const { notifyJobApplication } = await import("@/features/notifications/notify-events");
      await notifyJobApplication(posterId, String(job?.[F.TITLE]), String(jid));
    }
  } catch { /* non-blocking */ }
}

export async function fetchMyJobPostingsWordPress(): Promise<any[]> {
    const stored = getStoredWPUser();
    if (!stored?.user_id) throw new Error("Not authenticated");
    const userId = Number(stored.user_id);
    // CCT Author = poster. Filter client-side.
    const all = await wordpressCCTFetch<any[]>(SLUG, { params: { _limit: 200 } });
    if (!Array.isArray(all)) throw new Error("Care jobs returned an invalid response");
    return all.filter((j: any) => Number(j.author_id) === userId).map(mapJob);
}

export async function fetchMyJobApplicationsWordPress(): Promise<any[]> {
    const stored = getStoredWPUser();
    if (!stored?.user_id) throw new Error("Not authenticated");
    const userId = Number(stored.user_id);
    // Jobs where I am linked as caregiver via Rel 153
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_JOB_CAREGIVERS}/parents/${userId}`);
    if (!Array.isArray(rels)) throw new Error(`Relation ${REL_JOB_CAREGIVERS} returned an invalid response`);
    return rels.map((r: any) => ({
      id: String(r._ID || r.id || r.parent_object_id),
      job_id: r.parent_object_id ? String(r.parent_object_id) : null,
      applicant_id: `wp-${userId}`,
      cover_letter: null,
      cover_message: null,
      created_at: r.created_at || null,
    }));
}

export async function updateJobApplicationWordPress(id: string, status: string): Promise<void> {
  // Per bible no application CCT exists. Status changes flow back onto the job
  // itself (Rel 153 link presence = accepted; deletion = rejected).
  if (status !== "rejected") throw new Error("Relation 251 has no application-status field; only rejection by unlinking is supported");
  const [jobId, userId] = id.split(":").map(numId);
  if (!jobId || !userId) throw new Error("A relation-backed application ID must be jobId:userId");
  await wordpressFetch(`jet-rel/${REL_JOB_CAREGIVERS}`, { method: "POST", body: { parent_id: jobId, child_id: userId, context: "child", store_items_type: "disconnect" } });
}

// Convenience link helpers exposed for higher-level UI flows.
export async function linkJobToCaredOne(jobId: string, caredOneUserId: string | number): Promise<void> {
  const jid = numId(jobId); const cid = numId(caredOneUserId);
  if (!jid || !cid) throw new Error("Invalid job or cared-one ID");
  await wordpressFetch(`jet-rel/${REL_JOB_CARED_ONES}`, {
    method: "POST",
    body: { parent_id: jid, child_id: cid, context: "child", store_items_type: "update" },
  });
}

export async function linkJobToTask(jobId: string, taskId: string | number): Promise<void> {
  const jid = numId(jobId); const tid = numId(taskId);
  if (!jid || !tid) throw new Error("Invalid job or task ID");
  await wordpressFetch(`jet-rel/${REL_JOB_TASKS}`, {
    method: "POST",
    body: { parent_id: jid, child_id: tid, context: "child", store_items_type: "update" },
  });
}
