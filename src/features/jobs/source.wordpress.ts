/**
 * Care Job — JetEngine CCT 139 `care_job` (bible §17).
 *   Fields:
 *     a55=title, a56=description, a57=Due date, a58=Completed at,
 *     a59=Status (b55 pending | b56 in progress | b57 completed)
 *   Relations:
 *     152: care_job → users  (cared ones)              1:M
 *     153: care_job → users  (assigned caregivers)     1:M
 *     154: care_group → care_job                       M:M
 *     155: care_job → care_task                        M:M
 *     156: care_job → comment                          1:M
 *   The bible does NOT define a separate "application" CCT.
 *   "Apply" = create a Rel 153 link request (caregiver → job).
 *   Author = JetEngine default author (the poster).
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { R } from "@/integrations/wp-schema";

const SLUG = "care_job";
const REL_JOB_CARED_ONES = R.careJobCaredOnes;
const REL_JOB_CAREGIVERS = R.careJobAssignees;
const REL_GROUP_JOBS = R.careGroupJobs;
const REL_JOB_TASKS = R.careJobTasks;

const STATUS_OUT: Record<string, string> = { pending: "b55", in_progress: "b56", "in progress": "b56", completed: "b57", open: "b55" };
const STATUS_IN: Record<string, string>  = { b55: "open", b56: "in_progress", b57: "completed" };

const stripWp = (v: string | number | null | undefined) => v == null ? "" : String(v).replace(/^wp-/, "");
const numId = (v: string | number | null | undefined) => Number(stripWp(v));

function mapJob(j: any) {
  return {
    id: String(j.id || j._ID),
    posted_by: j.author_id ? `wp-${j.author_id}` : null,
    title: j.a55 || null,
    description: j.a56 || null,
    due_date: j.a57 || null,
    start_date: j.a57 || null,           // alias for back-compat
    completed_at: j.a58 || null,
    status: STATUS_IN[String(j.a59)] || j.a59 || "open",
    created_at: j.cct_created || j.created_at,
    updated_at: j.cct_modified || j.updated_at,
    // legacy-shape aliases (kept null; not in bible)
    care_group_id: null,
    care_type: null,
    location: null,
    budget: null,
    schedule: null,
    special_needs: null,
    children_ages: null,
    app_area: null,
    language: null,
  };
}

export async function fetchJobPostingsWordPress(filters?: {
  source?: string; status?: string; locale?: { area?: string; language?: string };
}): Promise<any[]> {
  try {
    const params: Record<string, any> = { _limit: 100 };
    if (filters?.status && STATUS_OUT[filters.status]) params.a59 = STATUS_OUT[filters.status];
    const jobs = await wordpressCCTFetch<any[]>(SLUG, { params });
    if (!Array.isArray(jobs)) return [];
    return jobs.map(mapJob);
  } catch { return []; }
}

export async function createJobPostingWordPress(job: {
  title: string; description: string; care_type?: string; location?: string;
  budget?: string; schedule?: string; special_needs?: string; children_ages?: string;
  start_date?: string; due_date?: string; care_group_id?: string; app_area?: string; language?: string;
}): Promise<void> {
  const created = await wordpressCCTFetch<any>(SLUG, {
    method: "POST",
    body: {
      a55: job.title,
      a56: job.description,
      a57: job.due_date || job.start_date || "",
      a59: STATUS_OUT.pending,
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
      }).catch(() => {});
    }
  }
}

export async function fetchJobApplicationsWordPress(jobId: string): Promise<any[]> {
  // Per bible: "applications" = caregivers linked via Rel 153.
  try {
    const normalizedJobId = stripWp(jobId);
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_JOB_CAREGIVERS}/children/${normalizedJobId}`).catch(() => []);
    if (!Array.isArray(rels)) return [];
    return rels.map((r: any) => ({
      id: String(r._ID || r.id || `${normalizedJobId}-${r.child_object_id}`),
      job_id: normalizedJobId,
      applicant_id: r.child_object_id ? `wp-${r.child_object_id}` : null,
      status: "pending",
      cover_letter: null,
      cover_message: null,
      created_at: r.created_at || null,
    }));
  } catch { return []; }
}

export async function applyToJobWordPress(jobId: string, _coverLetter?: string): Promise<void> {
  const stored = getStoredWPUser();
  const applicantId = stored?.user_id ? Number(stored.user_id) : null;
  if (!applicantId) throw new Error("Not authenticated");
  const jid = numId(jobId);
  if (!jid) return;
  // Apply == request to be assigned (Rel 153 caregiver link)
  await wordpressFetch(`jet-rel/${REL_JOB_CAREGIVERS}`, {
    method: "POST",
    body: { parent_id: jid, child_id: applicantId, context: "child", store_items_type: "update" },
  }).catch(() => {});
}

export async function fetchMyJobPostingsWordPress(): Promise<any[]> {
  try {
    const stored = getStoredWPUser();
    if (!stored?.user_id) return [];
    const userId = Number(stored.user_id);
    // CCT Author = poster. Filter client-side.
    const all = await wordpressCCTFetch<any[]>(SLUG, { params: { _limit: 200 } });
    if (!Array.isArray(all)) return [];
    return all.filter((j: any) => Number(j.author_id) === userId).map(mapJob);
  } catch { return []; }
}

export async function fetchMyJobApplicationsWordPress(): Promise<any[]> {
  try {
    const stored = getStoredWPUser();
    if (!stored?.user_id) return [];
    const userId = Number(stored.user_id);
    // Jobs where I am linked as caregiver via Rel 153
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_JOB_CAREGIVERS}/parents/${userId}`).catch(() => []);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    return rels.map((r: any) => ({
      id: String(r._ID || r.id || r.parent_object_id),
      job_id: r.parent_object_id ? String(r.parent_object_id) : null,
      applicant_id: `wp-${userId}`,
      status: "pending",
      cover_letter: null,
      cover_message: null,
      created_at: r.created_at || null,
    }));
  } catch { return []; }
}

export async function updateJobApplicationWordPress(id: string, status: string): Promise<void> {
  // Per bible no application CCT exists. Status changes flow back onto the job
  // itself (Rel 153 link presence = accepted; deletion = rejected).
  if (status === "rejected") {
    await wordpressFetch(`jet-rel/${REL_JOB_CAREGIVERS}/${id}`, { method: "DELETE" }).catch(() => {});
  }
}

// Convenience link helpers exposed for higher-level UI flows.
export async function linkJobToCaredOne(jobId: string, caredOneUserId: string | number): Promise<void> {
  const jid = numId(jobId); const cid = numId(caredOneUserId);
  if (!jid || !cid) return;
  await wordpressFetch(`jet-rel/${REL_JOB_CARED_ONES}`, {
    method: "POST",
    body: { parent_id: jid, child_id: cid, context: "child", store_items_type: "update" },
  }).catch(() => {});
}

export async function linkJobToTask(jobId: string, taskId: string | number): Promise<void> {
  const jid = numId(jobId); const tid = numId(taskId);
  if (!jid || !tid) return;
  await wordpressFetch(`jet-rel/${REL_JOB_TASKS}`, {
    method: "POST",
    body: { parent_id: jid, child_id: tid, context: "child", store_items_type: "update" },
  }).catch(() => {});
}
