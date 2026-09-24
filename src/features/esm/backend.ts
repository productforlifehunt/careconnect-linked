/**
 * ESM study storage on the headless WordPress backend.
 *
 * The fixed JetEngine tables use one column per
 * question, exactly as the study document specifies:
  *   CCT 318 esm_screening   — 146 fields (Sections 1 and 2)
  *   CCT 319 esm_hourly_log  — 34 fields (Section 3)
  *   CCT 317 esm_daily_log   — 5 fields (Section 4)
  *   CCT 320 esm_log_person  — 4 fields (people named in an hourly log)
 *
 * Every row belongs to its participant through a JetEngine relation only —
 * never a hand-made id column:
 *   REL 305 user → screening entries
 *   REL 306 user → hourly log entries
 *   REL 307 user → daily log entries
 *   REL 308 hourly log → people, REL 316 user → people (see people.ts)
 */
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";
import { ESM_SPEC } from "./spec.generated";
import { linkPeopleToLog, personName } from "./people";
import { addRecord, markSynced, type EsmRecord, type RecordKind } from "./store";

/** REST slugs currently registered by JetEngine for the fixed tables. */
export const ESM_CCT = {
  screening: "esm_screening_v2",
  hourly: "esm_hourly_log_v2",
  daily: "esm_daily_log_v2",
} as const;

export const ESM_REL = {
  screening: 305,
  hourly: 306,
  daily: 307,
} as const;

export const ESM_APP_ID = "esm_survey";

const asWPString = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join(",");
  return String(value);
};

function targetFor(kind: RecordKind) {
  if (kind === "hourly_log") return { cct: "319", slug: ESM_CCT.hourly, rel: ESM_REL.hourly };
  if (kind === "daily_log") return { cct: "317", slug: ESM_CCT.daily, rel: ESM_REL.daily };
  return { cct: "318", slug: ESM_CCT.screening, rel: ESM_REL.screening };
}

/** Which people the participant picked on an hourly log. */
const pickedPeople = (record: EsmRecord): string[] => {
  const value = record.answers?.c319_a26;
  return Array.isArray(value) ? value.map(String) : [];
};

/** One column per answer: the answer key already names its column. */
function buildBody(record: EsmRecord): Record<string, string> {
  const { cct } = targetFor(record.kind);
  const body: Record<string, string> = {};

  for (const item of ESM_SPEC) {
    if (item.cct !== cct) continue;
    const value = record.answers?.[item.id];
    if (item.id === "c319_a26") {
      // CCT319 a26 stores only "Just Me" (b01); other people go through REL308.
      body[item.column] = pickedPeople(record).includes("just_me") ? "b01" : "";
      continue;
    }
    body[item.column] = asWPString(value);
  }

  if (record.kind === "hourly_log") {
    // "NOW" stamps the moment the entry was written; "other time" uses what was typed.
    body.a02 = record.answers?.c319_a01 === "b01" ? record.submittedAt : "";
  }

  return body;
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

  if (record.kind === "hourly_log") {
    await linkPeopleToLog(String(rowId), pickedPeople(record));
  }

  markSynced(record.id, String(rowId));
  return String(rowId);
}

/**
 * Saves an entry on the device, then uploads it.
 * The device copy is kept either way, so nothing a participant typed is lost.
 */
export async function submitRecord(
  kind: RecordKind,
  answers: Record<string, unknown>,
  options: { slot?: string; voice?: Record<string, string> } = {},
): Promise<{ record: EsmRecord; uploaded: boolean; error?: string }> {
  const record = addRecord(kind, answers as EsmRecord["answers"], options.slot, options.voice);
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
  return (Array.isArray(rows) ? rows : []).filter((r) => ids.includes(String(r._ID ?? r.id)));
}
