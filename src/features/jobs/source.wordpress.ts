import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

/**
 * Live JetEngine schema (verified from prd-to-wp-mapping.md):
 *   CCT job_posting:    care_group_id, posted_by_user_id, title, description, care_type,
 *                       location, budget, schedule, special_needs, children_ages,
 *                       start_date, status, app_area, language
 *   CCT job_application: job_posting_id, applicant_user_id, cover_message, status,
 *                        reviewed_by_user_id
 *   REL 41 (1:M) users → job_posting       (posted jobs)
 *   REL 42 (1:M) users → job_application   (my applications)
 */

const REL_USER_JOB_POSTING = 41;
const REL_USER_JOB_APPLICATION = 42;

const stripWp = (v: string | number | null | undefined) =>
  v == null ? "" : String(v).replace(/^wp-/, "");
const numId = (v: string | number | null | undefined) => Number(stripWp(v));

function mapJob(j: any) {
  return {
    id: String(j.id || j._ID),
    care_group_id: j.care_group_id || null,
    posted_by: j.posted_by_user_id ? `wp-${j.posted_by_user_id}` : null,
    title: j.title || null,
    description: j.description || null,
    care_type: j.care_type || null,
    location: j.location || null,
    budget: j.budget || null,
    schedule: j.schedule || null,
    special_needs: j.special_needs || null,
    children_ages: j.children_ages || null,
    start_date: j.start_date || null,
    status: j.status || "open",
    app_area: j.app_area || null,
    language: j.language || null,
    created_at: j.created_at,
    updated_at: j.updated_at,
  };
}

function mapApp(a: any) {
  return {
    id: String(a.id || a._ID),
    job_id: a.job_posting_id ? String(a.job_posting_id) : null,
    applicant_id: a.applicant_user_id ? `wp-${a.applicant_user_id}` : (a.author_id || null),
    cover_letter: a.cover_message || null,
    cover_message: a.cover_message || null,
    status: a.status || "pending",
    reviewed_by: a.reviewed_by_user_id ? `wp-${a.reviewed_by_user_id}` : null,
    created_at: a.created_at,
  };
}

export async function fetchJobPostingsWordPress(filters?: {
  source?: string; status?: string; locale?: { area?: string; language?: string };
}): Promise<any[]> {
  try {
    const params: Record<string, any> = { _limit: 100 };
    if (filters?.status) params.status = filters.status;
    if (filters?.locale?.area) params.app_area = filters.locale.area;
    if (filters?.locale?.language) params.language = filters.locale.language;
    const jobs = await wordpressCCTFetch<any[]>("job_posting", { params });
    if (!Array.isArray(jobs)) return [];
    return jobs.map(mapJob);
  } catch { return []; }
}

export async function createJobPostingWordPress(job: {
  title: string; description: string; care_type?: string; location?: string;
  budget?: string; schedule?: string; special_needs?: string; children_ages?: string;
  start_date?: string; care_group_id?: string; app_area?: string; language?: string;
}): Promise<void> {
  const stored = getStoredWPUser();
  const posterId = stored?.user_id ? Number(stored.user_id) : null;
  const created = await wordpressCCTFetch<any>("job_posting", {
    method: "POST",
    body: {
      care_group_id: job.care_group_id ? numId(job.care_group_id) : null,
      posted_by_user_id: posterId,
      title: job.title,
      description: job.description,
      care_type: job.care_type || "",
      location: job.location || "",
      budget: job.budget || "",
      schedule: job.schedule || "",
      special_needs: job.special_needs || "",
      children_ages: job.children_ages || "",
      start_date: job.start_date || null,
      status: "open",
      app_area: job.app_area || "",
      language: job.language || "",
    },
  });
  const jobId = numId(created?.item_id || created?._ID || created?.id);
  if (jobId && posterId) {
    await wordpressFetch(`jet-rel/${REL_USER_JOB_POSTING}`, {
      method: "POST",
      body: { parent_id: posterId, child_id: jobId, context: "child", store_items_type: "update" },
    }).catch(() => {});
  }
}

export async function fetchJobApplicationsWordPress(jobId: string): Promise<any[]> {
  try {
    const normalizedJobId = stripWp(jobId);
    const apps = await wordpressCCTFetch<any[]>("job_application", { params: { _limit: 200 } });
    if (!Array.isArray(apps)) return [];
    return apps
      .filter((a: any) => String(a.job_posting_id) === normalizedJobId)
      .map(mapApp);
  } catch { return []; }
}

export async function applyToJobWordPress(jobId: string, coverLetter?: string): Promise<void> {
  const stored = getStoredWPUser();
  const applicantId = stored?.user_id ? Number(stored.user_id) : null;
  if (!applicantId) throw new Error("Not authenticated");
  const created = await wordpressCCTFetch<any>("job_application", {
    method: "POST",
    body: {
      job_posting_id: numId(jobId),
      applicant_user_id: applicantId,
      cover_message: coverLetter || "",
      status: "pending",
    },
  });
  const appId = numId(created?.item_id || created?._ID || created?.id);
  if (appId) {
    await wordpressFetch(`jet-rel/${REL_USER_JOB_APPLICATION}`, {
      method: "POST",
      body: { parent_id: applicantId, child_id: appId, context: "child", store_items_type: "update" },
    }).catch(() => {});
  }
}

export async function fetchMyJobPostingsWordPress(): Promise<any[]> {
  try {
    const stored = getStoredWPUser();
    if (!stored?.user_id) return [];
    const userId = Number(stored.user_id);
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_JOB_POSTING}/children/${userId}`);
    if (!Array.isArray(rels) || rels.length === 0) {
      // Fallback: filter by posted_by_user_id field
      const all = await wordpressCCTFetch<any[]>("job_posting", { params: { _limit: 200 } });
      if (!Array.isArray(all)) return [];
      return all.filter((j: any) => Number(j.posted_by_user_id) === userId).map(mapJob);
    }
    const ids = rels.map((r: any) => String(r.child_object_id)).filter(Boolean);
    const jobs = await Promise.all(ids.map(async (id) => {
      try { return await wordpressCCTFetch<any>("job_posting", { id }); }
      catch { return null; }
    }));
    return (jobs.filter(Boolean) as any[]).map(mapJob);
  } catch { return []; }
}

export async function fetchMyJobApplicationsWordPress(): Promise<any[]> {
  try {
    const stored = getStoredWPUser();
    if (!stored?.user_id) return [];
    const userId = Number(stored.user_id);
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_JOB_APPLICATION}/children/${userId}`);
    if (!Array.isArray(rels) || rels.length === 0) {
      const all = await wordpressCCTFetch<any[]>("job_application", { params: { _limit: 200 } });
      if (!Array.isArray(all)) return [];
      return all.filter((a: any) => Number(a.applicant_user_id) === userId).map(mapApp);
    }
    const ids = rels.map((r: any) => String(r.child_object_id)).filter(Boolean);
    const apps = await Promise.all(ids.map(async (id) => {
      try { return await wordpressCCTFetch<any>("job_application", { id }); }
      catch { return null; }
    }));
    return (apps.filter(Boolean) as any[]).map(mapApp);
  } catch { return []; }
}

export async function updateJobApplicationWordPress(id: string, status: string): Promise<void> {
  const stored = getStoredWPUser();
  const reviewerId = stored?.user_id ? Number(stored.user_id) : null;
  await wordpressCCTFetch("job_application", {
    id, method: "PUT",
    body: { status, reviewed_by_user_id: reviewerId },
  });
}
