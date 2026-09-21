/**
 * ESM study storage on the headless WordPress backend.
 *
 * Created through the JetEngine GUI (90-mode), verified on /afresh:
 *   CCT 302 esm_screening   — a01 app id, a02 role, a03 submitted at,
 *                             a04 answers JSON, a05 voice transcripts JSON
 *   CCT 303 esm_hourly_log  — a01 app id, a06 log date, a07 hour slot,
 *                             a08 when it happened, a04 answers JSON, a05 voice JSON
 *   CCT 304 esm_daily_log   — a01 app id, a06 log date, a09 daily burden,
 *                             a04 answers JSON, a05 voice JSON
 *
 * Every entry belongs to its participant through a JetEngine relation only —
 * never a hand-made id column:
 *   REL 305 One User can have many related esm screening entries
 *   REL 306 One User can have many related esm hourly log entries
 *   REL 307 One User can have many related esm daily log entries
 */
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";
import type { AnswerMap } from "./types";
import { addRecord, markSynced, type EsmRecord, type RecordKind } from "./store";

export const ESM_CCT = {
  screening: "esm_screening",
  hourly: "esm_hourly_log",
  daily: "esm_daily_log",
} as const;

export const ESM_REL = {
  screening: 305,
  hourly: 306,
  daily: 307,
} as const;

/** Value written to a01 on every row so the study data is never mixed with the care apps. */
export const ESM_APP_ID = "esm_survey";

const asWPString = (value: unknown): string =>
  value === undefined || value === null ? "" : String(value);

function targetFor(kind: RecordKind) {
  if (kind === "hourly_log") return { slug: ESM_CCT.hourly, rel: ESM_REL.hourly };
  if (kind === "daily_log") return { slug: ESM_CCT.daily, rel: ESM_REL.daily };
  return { slug: ESM_CCT.screening, rel: ESM_REL.screening };
}

function buildBody(record: EsmRecord): Record<string, string> {
  const answers = JSON.stringify(record.answers ?? {});
  const voice = JSON.stringify(record.voice ?? {});
  const day = record.submittedAt.slice(0, 10);

  if (record.kind === "hourly_log") {
    const hour = record.slot?.split("T")[1] ?? "";
    return {
      a01: ESM_APP_ID,
      a06: record.slot?.split("T")[0] ?? day,
      a07: asWPString(Number(hour) || 0),
      a08: asWPString(record.answers?.h_when ?? ""),
      a04: answers,
      a05: voice,
    };
  }

  if (record.kind === "daily_log") {
    return {
      a01: ESM_APP_ID,
      a06: day,
      a09: asWPString(record.answers?.d_burden ?? 0),
      a04: answers,
      a05: voice,
    };
  }

  return {
    a01: ESM_APP_ID,
    a02: record.kind === "primary_screening" ? "primary" : "other",
    a03: record.submittedAt,
    a04: answers,
    a05: voice,
  };
}

/** Writes one record to its CCT and links it to the signed-in participant. */
export async function pushRecord(record: EsmRecord): Promise<string> {
  const userId = getCurrentUserIdNumber();
  if (!userId) throw new Error("Sign in first so your entries are saved to the study.");

  const { slug, rel } = targetFor(record.kind);
  const created = await wordpressCCTFetch<any>(slug, { method: "POST", body: buildBody(record) });
  const rowId = created?.item_id ?? created?.id ?? created?._ID;
  if (!rowId) throw new Error(`The study table ${slug} did not return a row id`);

  await wordpressFetch(`jet-rel/${rel}`, {
    method: "POST",
    body: {
      parent_id: String(userId),
      child_id: String(rowId),
      context: "child_object",
      store_items_type: "update",
    },
  });

  markSynced(record.id, String(rowId));
  return String(rowId);
}

/**
 * Saves an entry on the device, then uploads it.
 * The device copy is kept either way, so nothing a participant typed is lost.
 */
export async function submitRecord(
  kind: RecordKind,
  answers: AnswerMap,
  options: { slot?: string; voice?: Record<string, string> } = {},
): Promise<{ record: EsmRecord; uploaded: boolean; error?: string }> {
  const record = addRecord(kind, answers, options.slot, options.voice);
  try {
    await pushRecord(record);
    return { record, uploaded: true };
  } catch (err) {
    return { record, uploaded: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Uploads every entry that is still only on the device. */
export async function pushPendingRecords(records: EsmRecord[]): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  for (const record of records.filter((r) => !r.synced)) {
    try {
      await pushRecord(record);
      sent += 1;
    } catch {
      failed += 1;
    }
  }
  return { sent, failed };
}

/** This participant's entries as stored on the backend. */
export async function fetchMyRecords(kind: RecordKind): Promise<Record<string, any>[]> {
  const userId = getCurrentUserIdNumber();
  if (!userId) return [];
  const { slug, rel } = targetFor(kind);
  const links = await wordpressFetch<any[]>(`jet-rel/${rel}/children/${userId}`);
  const ids = Array.isArray(links) ? links.map((l) => String(l.child_object_id)) : [];
  if (ids.length === 0) return [];
  const rows = await wordpressCCTFetch<Record<string, any>[]>(slug);
  return (Array.isArray(rows) ? rows : []).filter((r) => ids.includes(String(r.id)));
}
