/**
 * Job ↔ Task linking — REL 155 (M:M care_job → universal_care_task).
 * Used to share a Care Task to the marketplace by attaching it to a Job posting.
 */
import { wordpressFetch } from "@/features/shared/wordpress-client";
import { R } from "@/integrations/wp-schema";

const REL_JOB_TASK = R.careJobTasks;

function n(id: string | number): number {
  return Number(String(id).replace(/^wp-/, ""));
}

export async function fetchTaskIdsForJob(jobId: string | number): Promise<string[]> {
  const jid = n(jobId);
  if (!jid) return [];
  try {
    const r = await wordpressFetch<any[]>(`jet-rel/${REL_JOB_TASK}/children/${jid}`);
    return (Array.isArray(r) ? r : []).map((x) => String(x.child_object_id)).filter(Boolean);
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function fetchJobIdsForTask(taskId: string | number): Promise<string[]> {
  const tid = n(taskId);
  if (!tid) return [];
  try {
    const r = await wordpressFetch<any[]>(`jet-rel/${REL_JOB_TASK}/parents/${tid}`);
    return (Array.isArray(r) ? r : []).map((x) => String(x.parent_object_id)).filter(Boolean);
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function linkTaskToJob(jobId: string | number, taskId: string | number): Promise<void> {
  const jid = n(jobId), tid = n(taskId);
  if (!jid || !tid) return;
  await wordpressFetch(`jet-rel/${REL_JOB_TASK}`, {
    method: "POST",
    body: { parent_id: jid, child_id: tid, context: "child", store_items_type: "update" },
  });
}

export async function unlinkTaskFromJob(jobId: string | number, taskId: string | number): Promise<void> {
  const jid = n(jobId), tid = n(taskId);
  if (!jid || !tid) return;
  await wordpressFetch(`jet-rel/${REL_JOB_TASK}`, {
    method: "POST",
    body: { parent_id: jid, child_id: tid, context: "child", store_items_type: "disconnect" },
  }).catch(() => undefined);
}
