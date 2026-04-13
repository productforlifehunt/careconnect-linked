import { wordpressCCTFetch } from "@/features/shared/wordpress-client";

// CCT slugs: job_posting, job_application | flat fields
export async function fetchJobPostingsWordPress(filters?: { source?: string; status?: string; locale?: { area?: string; language?: string } }): Promise<any[]> {
  try {
    const params: Record<string, any> = { _limit: 50 };
    if (filters?.status) params.status = filters.status;
    if (filters?.locale?.area) params.app_area = filters.locale.area;
    if (filters?.locale?.language) params.language = filters.locale.language;
    const jobs = await wordpressCCTFetch("job_posting", { params });
    if (!Array.isArray(jobs)) return [];
    return jobs.map((j: any) => ({
      id: j.id,
      title: j.title || null,
      description: j.description || null,
      location: j.location || null,
      status: j.status || "open",
      start_date: j.start_date || null,
      posted_by: j.posted_by || null,
      created_at: j.created_at,
    }));
  } catch { return []; }
}

export async function createJobPostingWordPress(job: { title: string; description: string; location?: string; start_date?: string }): Promise<void> {
  await wordpressCCTFetch("job_posting", { method: "POST", body: { ...job, status: "open" } });
}

export async function fetchJobApplicationsWordPress(jobId: string): Promise<any[]> {
  try {
    const normalizedJobId = String(jobId).replace(/^wp-/, "");
    const apps = await wordpressCCTFetch<any[]>("job_application", {
      params: { job_id: normalizedJobId, _limit: 50 },
    });
    if (!Array.isArray(apps)) return [];
    return apps.map((a: any) => ({
      id: String(a.id || a._ID),
      job_id: a.job_id || normalizedJobId,
      applicant_id: a.applicant_id || a.author_id || null,
      cover_letter: a.cover_letter || null,
      status: a.status || "pending",
      created_at: a.created_at,
    }));
  } catch { return []; }
}

export async function applyToJobWordPress(jobId: string, coverLetter?: string): Promise<void> {
  await wordpressCCTFetch("job_application", {
    method: "POST",
    body: { job_id: jobId, cover_letter: coverLetter, status: "pending" },
  });
}

export async function fetchMyJobPostingsWordPress(): Promise<any[]> {
  try {
    const jobs = await wordpressCCTFetch("job_posting", { params: { _limit: 50 } });
    if (!Array.isArray(jobs)) return [];
    return jobs.map((j: any) => ({
      id: j.id,
      title: j.title || null,
      description: j.description || null,
      location: j.location || null,
      status: j.status || "open",
      start_date: j.start_date || null,
      created_at: j.created_at,
    }));
  } catch { return []; }
}

export async function fetchMyJobApplicationsWordPress(): Promise<any[]> {
  try {
    const apps = await wordpressCCTFetch<any[]>("job_application", {
      params: { _limit: 50 },
    });
    if (!Array.isArray(apps)) return [];
    return apps.map((a: any) => ({
      id: String(a.id || a._ID),
      job_id: a.job_id || null,
      cover_letter: a.cover_letter || null,
      status: a.status || "pending",
      created_at: a.created_at,
    }));
  } catch { return []; }
}

export async function updateJobApplicationWordPress(id: string, status: string): Promise<void> {
  await wordpressCCTFetch("job_application", { id, method: "PUT", body: { status } });
}
