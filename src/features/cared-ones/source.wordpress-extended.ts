import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { fetchWPUser, fetchWPUserProfile } from "@/features/shared/wp-users";
import { getStoredWPUser } from "@/services/wp-auth";
import { T, R } from "@/integrations/wp-schema";
import { decodeRel72Meta } from "@/features/care-groups/rel-meta";
import { dedupeRead, fetchRelChildrenMap } from "@/features/shared/rel-batch";
import {
  FC, EVENT_TYPE, STATUS_CONFIRMED, STATUS_CANCELLED, APP_CHALLENGED,
  LOG_TYPE_AI as CAL_LOG_TYPE_AI, LOG_TYPE_HUMAN as CAL_LOG_TYPE_HUMAN,
  buildRRule, buildReminders, readReminderMinutes, toFrequencyCode, FREQ_EN,
  decodeSlots, readCustom, writeCustom, fetchEventsOfType,
  createEvent, updateEvent, deleteEvent, readEvent,
} from "@/features/schedules/calendar-schedule";


// ─── Relations (per data bible / live WP) ────────────────────
const REL_USER_CARED_ONE = R.userCaredOnes;
const REL_USER_CARED_ONE_CARD = R.caredOneInfoCards;    // user → cared_ones_informat (CCT 125)
const REL_CARED_CARD_EMERGENCY = R.infoCardEmergencyContacts;   // cared_ones_informat → emergency_contact
const REL_GROUP_MEMBER = R.careGroupMembers;            // care_group → users
// Checkin schedules live in the universal calendar (CCT 187, a60 = b56) since
// the 2026-09-04 bible; ownership is Relation 190, logs are Relation 240 → CCT 161.
const REL_CHECKIN_LOG = R.checkinScheduleLogs;   // 240 (187 → 161)
const REL_USER_CARE_TIP = R.caredOneCareTips;
const REL_USER_EMERGENCY_CONTACT = R.caredOneEmergencyContacts;
const REL_USER_CARE_NOTE = R.caredOneCareNotes;
const REL_USER_CARE_DOCUMENT = R.caredOneCareDocuments;
const REL_USER_CARE_PLAN = R.caredOneCarePlans;

// ─── Opaque field aliases (bible) ────────────────────────────
const F_LOGEVT = T.userLogEvent.f;          // 161 user's other log event
const F_NOTE = T.careNote.f;         // care_note
const F_TIP = T.careTip.f;          // care_tip
const F_PLAN = T.carePlan.f;         // care_plan
const F_EMG = T.emergencyContact.f;          // emergency_contact
const F_DOC = T.careDocument.f;          // care_document
const F_CARD = T.infoCard.f;        // cared_ones_informat

// Boolean radio codes used by JetEngine: b55=Yes, b56=No (across most CCTs)
const YES = "b55";
const NO = "b56";

function normalizeWpObjectId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

function isYes(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === "string") {
    const v = value.toLowerCase();
    return v === "b55" || v === "yes" || v === "1" || v === "true";
  }
  return false;
}

function normalizeTimeSlot(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    if (!value.trim()) return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {}
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
function numOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Check-in type (CCT 187 a97 Checkin log type): AI | Human. */
function encodeCheckinLogType(value: unknown): string {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  const first = list.map((v) => String(v).toLowerCase())[0];
  if (first === "ai" || first === CAL_LOG_TYPE_AI) return CAL_LOG_TYPE_AI;
  if (first === "human" || first === CAL_LOG_TYPE_HUMAN) return CAL_LOG_TYPE_HUMAN;
  return "";
}
function decodeCheckinLogType(value: unknown): string[] {
  const v = String(value ?? "");
  if (v === CAL_LOG_TYPE_AI) return ["ai"];
  if (v === CAL_LOG_TYPE_HUMAN) return ["human"];
  return [];
}

function serializeTimeSlot(value: unknown): string {
  return normalizeTimeSlot(value).join(",");
}

async function fetchRelatedCctChildren(relationId: number, parentId: string, cctSlug: string): Promise<any[]> {
  const pid = normalizeWpObjectId(parentId);
  if (!pid) throw new Error(`Invalid parent ID for relation ${relationId}`);
  // Short-lived dedupe: sibling dashboard widgets asking for the same relation
  // within the same render pass share one round-trip instead of repeating it.
  return dedupeRead(`rel-children:${relationId}:${pid}:${cctSlug}`, async () => {
    const rels = await wordpressFetch<any[]>(`jet-rel/${relationId}/children/${pid}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const rows = await Promise.all(rels.map((r: any) => wordpressCCTFetch<any>(cctSlug, { id: r.child_object_id })));
    // A relation row can outlive the CCT row it points at (JetEngine answers
    // `false` for a deleted item). Drop those instead of failing the whole list.
    return rows.filter((row: any) => row && typeof row === "object");
  });

}

/**
 * Same as fetchRelatedCctChildren, but for relations with many children:
 * pulls the CCT collection in ONE request and indexes it locally instead of
 * issuing one GET per related row (which floods the proxy and thrashes React).
 */
async function fetchRelatedCctChildrenBulk(relationId: number, parentId: string, cctSlug: string): Promise<any[]> {
  const pid = normalizeWpObjectId(parentId);
  if (!pid) return [];
  return dedupeRead(`rel-children-bulk:${relationId}:${pid}:${cctSlug}`, async () => {
    const [rels, all] = await Promise.all([
      wordpressFetch<any[]>(`jet-rel/${relationId}/children/${pid}`),
      wordpressCCTFetch<any[]>(cctSlug),
    ]);
    if (!Array.isArray(rels) || rels.length === 0 || !Array.isArray(all)) return [];
    const wanted = new Set(rels.map((r: any) => String(r.child_object_id)));
    return all.filter((row: any) => wanted.has(String(row.id ?? row._ID)));
  });
}


/** Reads a real WP user (core fields) plus its extended-profile CCTs through
 *  the privileged `wp-admin-ops` proxy. The display name comes from the
 *  per-app column on CCT 151 (a556 ChallengeD / a557 CareCNC) — never from the
 *  shared WordPress user name. */
export async function fetchWPUserSafe(userId: number | string): Promise<any> {
  const u = await fetchWPUserProfile(userId);
  return { ...u, avatar_urls: { "96": u.avatar_url } };
}


async function linkRel(relId: number, parentId: number, childId: number) {
  if (!parentId || !childId) throw new Error(`Invalid object ID for relation ${relId}`);
  await wordpressFetch(`jet-rel/${relId}`, {
    method: "POST",
    body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
  });
}

// ─── Cared Ones (Relation 219, Users → Users, many-to-many) ──
export async function createUserCaredOneWordPress(caredOne: { caredOneId: string; relationship?: string; isPrimary?: boolean }): Promise<void> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) throw new Error("Not authenticated");
  const childId = normalizeWpObjectId(caredOne.caredOneId);
  if (!childId) throw new Error("Invalid cared one user");
  await linkRel(REL_USER_CARED_ONE, Number(stored.user_id), childId);
}

export async function deleteUserCaredOneWordPress(id: string): Promise<void> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) throw new Error("Not authenticated");
  const childId = normalizeWpObjectId(id);
  if (!childId) throw new Error("Invalid cared one user");
  await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE}`, {
    method: "POST",
    body: { parent_id: Number(stored.user_id), child_id: childId, context: "child", store_items_type: "disconnect" },
  });
}

export async function fetchGroupCaredOnesWordPress(groupId: string): Promise<any[]> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizeWpObjectId(groupId)}`);
  if (!Array.isArray(rels) || rels.length === 0) return [];
  const caredOneRels = rels.filter((r: any) => {
    const { memberRoles } = decodeRel72Meta(r?.meta);
    return memberRoles.includes("cared one");
  });
  const userIds = caredOneRels.map((r: any) => Number(r.child_object_id)).filter(Boolean);
  const caredOnes = await Promise.all(userIds.map(async (userId) => {
    const user = await fetchWPUserSafe(userId);
    // Name = this app's own column on CCT 151. Empty until the user sets it;
    // the UI renders initials/placeholder-free empty state, never a fake name.
    const fullName = user.full_name;
    return {
      id: `wp-${userId}`,
      user_id: `wp-${userId}`,
      name: fullName,
      full_name: fullName,
      relationship: null,
      avatar_url: user.avatar_urls?.["96"] || null,
      profile: {
        id: `wp-${userId}`,
        user_id: `wp-${userId}`,
        full_name: fullName,
        email: user.email || null,
        avatar_url: user.avatar_urls?.["96"] || null,
      },
      created_at: null,
    };
  }));
  return caredOnes;
}

// ─── Cared One Information Card (CCT 125) ───────────────────
// a55=name, a56=description, a57=card_name, a58=status(b55/b56/b57), a59=displays_location(b55/b56)
export async function fetchCaredOnesCardsWordPress(): Promise<any[]> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) return [];
  const cards = await fetchRelatedCctChildren(REL_USER_CARED_ONE_CARD, String(stored.user_id), T.infoCard.slug);
  return cards.map((c: any) => ({
    id: String(c.id || c._ID),
    user_id: `wp-${stored.user_id}`,
    name: c[F_CARD.CARED_ONE_S_NAME] || c[F_CARD.CARED_ONE_S_INFORMATION_CARD_NAME] || null,
    description: c[F_CARD.CARED_ONE_S_DESCRIPTION] || null,
    card_name: c[F_CARD.CARED_ONE_S_INFORMATION_CARD_NAME] || null,
    status: c[F_CARD.STATUS] === "b57" ? "paused" : c[F_CARD.STATUS] === "b55" ? "draft" : "active",
    displays_location: c[F_CARD.DISPLAYS_LOCATION] || null,
    created_at: c.created_at,
  }));
}


export async function createCaredOnesCardWordPress(card: { name: string; description?: string; card_name?: string; status?: string }): Promise<void> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) throw new Error("Not authenticated");
  const statusCode = card.status === "paused" ? "b57" : card.status === "draft" ? "b55" : "b56";
  const created = await wordpressCCTFetch<any>(T.infoCard.slug, {
    method: "POST",
    body: {
      [F_CARD.CARED_ONE_S_NAME]: card.name,
      [F_CARD.CARED_ONE_S_DESCRIPTION]: card.description || "",
      [F_CARD.CARED_ONE_S_INFORMATION_CARD_NAME]: card.card_name || card.name,
      [F_CARD.STATUS]: statusCode,
    },
  });
  const childId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  await linkRel(REL_USER_CARED_ONE_CARD, Number(stored.user_id), childId);
}

// ─── Check-in schedule — CCT 187 calendar event, a60 = b56 ────
// Owned through Relation 190 (parent = cared one). Recurrence lives in the
// RFC 5545 columns (a66 RRULE, a73 VALARM); the exact time slots, UI frequency
// code, instructions and missing window live in the a90 Custom data JSON column.
export async function fetchCheckinsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const items = await fetchEventsOfType(caredOneId, EVENT_TYPE.CHECKIN);
    return items.map((i: any) => {
      const custom = readCustom(i[FC.CUSTOM_DATA]);
      const freqCode = toFrequencyCode(custom.frequency_code);
      return {
        id: String(i.id || i._ID),
        user_id: caredOneId,
        name: i[FC.TITLE] || "Daily Check-In",
        detail: i[FC.DESCRIPTION] || null,
        frequency: FREQ_EN[freqCode],
        frequency_code: freqCode,
        time_slot: decodeSlots(custom.time_slot),
        instructions: custom.instructions || null,
        start_date: i[FC.START_AT] ? String(i[FC.START_AT]).slice(0, 10) : null,
        note: custom.note || null,
        is_active: String(i[FC.STATUS] || STATUS_CONFIRMED) !== STATUS_CANCELLED,
        reminder_time_before: readReminderMinutes(i[FC.REMINDERS]),
        time_to_send_to_caregiver: numOrNull(i[FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING]),
        time_to_be_considered_missing: numOrNull(custom.time_to_be_considered_missing),
        check_in_type: decodeCheckinLogType(i[FC.CHECKIN_LOG_TYPE]),
        checked_by_ai: String(i[FC.CHECKIN_LOG_TYPE] || "") === CAL_LOG_TYPE_AI,
        created_at: i.cct_created || i.created_at,
      };
    });
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

/** Assigned check-in persons — JetEngine Relation 241. */
export async function fetchCheckinAssigneeIdsWordPress(checkinId: string): Promise<string[]> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${R.checkinScheduleAssignees}/children/${normalizeWpObjectId(checkinId)}`);
  return Array.isArray(rels) ? rels.map((r: any) => String(r.child_object_id)).filter(Boolean) : [];
}

/** Check-in notification receivers — JetEngine Relation 260. */
export async function fetchCheckinReceiverIdsWordPress(checkinId: string): Promise<string[]> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${R.checkinNotificationReceivers}/children/${normalizeWpObjectId(checkinId)}`);
  return Array.isArray(rels) ? rels.map((r: any) => String(r.child_object_id)).filter(Boolean) : [];
}

async function setCheckinUserRelation(relationId: number, checkinId: string, userIds: Array<string | number>): Promise<void> {
  const parentId = normalizeWpObjectId(checkinId);
  if (!parentId) throw new Error("Invalid check-in schedule");
  const ids = (userIds || []).map((v) => normalizeWpObjectId(v)).filter(Boolean);
  const body = { parent_id: parentId, child_id: ids, context: "parent", store_items_type: "replace" };
  try {
    await wordpressFetch(`jet-rel/${relationId}`, { method: "POST", body });
  } catch (err: any) {
    if (!/40[13]/.test(String(err?.message || ""))) throw err;
    const { wpAdminOps } = await import("@/services/woocommerce-api");
    const res: any = await wpAdminOps("set_relation", {
      relation_id: relationId, parent_id: parentId, child_ids: ids, context: "parent", store_items_type: "replace",
    });
    if (!res?.ok) throw new Error(res?.error || "Could not save check-in people");
  }
}

export function setCheckinAssigneesWordPress(checkinId: string, userIds: Array<string | number>) {
  return setCheckinUserRelation(R.checkinScheduleAssignees, checkinId, userIds);
}
export function setCheckinReceiversWordPress(checkinId: string, userIds: Array<string | number>) {
  return setCheckinUserRelation(R.checkinNotificationReceivers, checkinId, userIds);
}

export async function createCheckinWordPress(checkin: { user_id: string; name: string; detail?: string; frequency?: string; time_slot?: string[]; instructions?: string; start_date?: string; note?: string; reminder_time_before?: number; time_to_send_to_caregiver?: number; time_to_be_considered_missing?: number; check_in_type?: string[]; assignee_ids?: Array<string | number>; receiver_ids?: Array<string | number> }): Promise<void> {
  const freq = toFrequencyCode(checkin.frequency);
  const slots = decodeSlots(checkin.time_slot || ["08:00"]);
  const startDate = checkin.start_date || new Date().toISOString().slice(0, 10);
  const newId = await createEvent({
    [FC.TITLE]: checkin.name,
    [FC.DESCRIPTION]: checkin.detail || "",
    [FC.CUSTOM_EVENT_TYPE]: EVENT_TYPE.CHECKIN,
    [FC.APP]: APP_CHALLENGED,
    [FC.START_AT]: slots[0] ? `${startDate} ${slots[0]}:00` : startDate,
    [FC.STATUS]: STATUS_CONFIRMED,
    [FC.RRULE]: buildRRule(freq, slots),
    [FC.REMINDERS]: buildReminders(checkin.reminder_time_before),
    [FC.CHECKIN_LOG_TYPE]: encodeCheckinLogType(checkin.check_in_type),
    [FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING]: checkin.time_to_send_to_caregiver != null ? String(checkin.time_to_send_to_caregiver) : "",
    [FC.CUSTOM_DATA]: writeCustom({
      frequency_code: freq,
      time_slot: slots,
      instructions: checkin.instructions || "",
      note: checkin.note || "",
      time_to_be_considered_missing: checkin.time_to_be_considered_missing ?? "",
    }),
  }, checkin.user_id);
  if (checkin.assignee_ids?.length) await setCheckinAssigneesWordPress(String(newId), checkin.assignee_ids);
  if (checkin.receiver_ids?.length) await setCheckinReceiversWordPress(String(newId), checkin.receiver_ids);
}

export async function updateCheckinWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.name !== undefined) body[FC.TITLE] = updates.name;
  if (updates.detail !== undefined) body[FC.DESCRIPTION] = updates.detail;
  if (updates.is_active !== undefined) body[FC.STATUS] = updates.is_active ? STATUS_CONFIRMED : STATUS_CANCELLED;
  if (updates.reminder_time_before !== undefined) body[FC.REMINDERS] = buildReminders(updates.reminder_time_before);
  if (updates.time_to_send_to_caregiver !== undefined) {
    body[FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING] =
      updates.time_to_send_to_caregiver != null ? String(updates.time_to_send_to_caregiver) : "";
  }
  if (updates.check_in_type !== undefined) body[FC.CHECKIN_LOG_TYPE] = encodeCheckinLogType(updates.check_in_type);
  else if (updates.checked_by_ai !== undefined) {
    body[FC.CHECKIN_LOG_TYPE] = updates.checked_by_ai ? CAL_LOG_TYPE_AI : CAL_LOG_TYPE_HUMAN;
  }

  const customTouched = ["frequency", "time_slot", "instructions", "note", "time_to_be_considered_missing"]
    .some((k) => updates[k] !== undefined);
  if (customTouched || updates.start_date !== undefined) {
    const row = await readEvent(id);
    const custom = readCustom(row?.[FC.CUSTOM_DATA]);
    const freq = updates.frequency !== undefined ? toFrequencyCode(updates.frequency) : toFrequencyCode(custom.frequency_code);
    const slots = updates.time_slot !== undefined ? decodeSlots(updates.time_slot) : decodeSlots(custom.time_slot);
    const startDate = updates.start_date !== undefined ? (updates.start_date || "") : String(row?.[FC.START_AT] || "").slice(0, 10);
    if (updates.start_date !== undefined || updates.time_slot !== undefined) {
      body[FC.START_AT] = startDate && slots[0] ? `${startDate} ${slots[0]}:00` : startDate;
    }
    if (updates.frequency !== undefined || updates.time_slot !== undefined) body[FC.RRULE] = buildRRule(freq, slots);
    body[FC.CUSTOM_DATA] = writeCustom({
      ...custom,
      frequency_code: freq,
      time_slot: slots,
      instructions: updates.instructions !== undefined ? (updates.instructions || "") : (custom.instructions || ""),
      note: updates.note !== undefined ? (updates.note || "") : (custom.note || ""),
      time_to_be_considered_missing: updates.time_to_be_considered_missing !== undefined
        ? (updates.time_to_be_considered_missing ?? "")
        : (custom.time_to_be_considered_missing ?? ""),
    });
  }

  await updateEvent(id, body);
  if (updates.assignee_ids !== undefined) await setCheckinAssigneesWordPress(id, updates.assignee_ids || []);
  if (updates.receiver_ids !== undefined) await setCheckinReceiversWordPress(id, updates.receiver_ids || []);
}

export async function deleteCheckinWordPress(id: string): Promise<void> {
  await deleteEvent(id);
}

// ─── Check-in log — CCT 161 user's other log event ────────────
// a83 Check type (b55 Taken / b56 Skipped / b57 Missed), a85 Log checkin note,
// a86 Checked by AI, a61 Log event time. Attached to its schedule by Relation 240.
const CHK_STATUS_CODE: Record<string, string> = { checked: "b55", skipped: "b56", missed: "b57" };
const CHK_STATUS_LABEL: Record<string, string> = { b55: "checked", b56: "skipped", b57: "missed" };

export async function fetchCheckinLogsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const [checkins, logMap] = await Promise.all([
      fetchCheckinsWordPress(caredOneId),
      fetchRelChildrenMap(REL_CHECKIN_LOG),
    ]);
    const nestedLogs = await Promise.all(checkins.map(async (checkin: any) => {
      try {
        const pid = String(normalizeWpObjectId(checkin.id));
        const childIds = logMap.loaded
          ? (logMap.get(pid) || []).map((c) => c.childId)
          : ((await wordpressFetch<any[]>(`jet-rel/${REL_CHECKIN_LOG}/children/${pid}`)) || [])
              .map((r: any) => String(r.child_object_id));
        if (!childIds.length) return [];
        const logs = await Promise.all(childIds.map(async (childId) => {
          try {
            const item = await wordpressCCTFetch<any>(T.userLogEvent.slug, { id: childId });
            const statusCode = String(item[F_LOGEVT.CHECK_TYPE] || "b55");
            return {
              id: String(item.id || item._ID || childId),
              checkin_id: String(checkin.id),
              status: CHK_STATUS_LABEL[statusCode] || "checked",
              note: item[F_LOGEVT.LOG_CHECKIN_NOTE] || null,
              checked_by_ai: isYes(item[F_LOGEVT.CHECKED_BY_AI]),
              created_at: item[F_LOGEVT.LOG_EVENT_TIME] || item.cct_created || item.created_at,
            };
          } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
        }));
        return logs.filter(Boolean);
      } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
    }));
    return nestedLogs.flat().sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}


export async function fetchTodayCheckinLogsWordPress(caredOneId: string): Promise<any[]> {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const logs = await fetchCheckinLogsWordPress(caredOneId);
  return logs.filter((log: any) => log.created_at && new Date(log.created_at) >= today);
}

export async function logCheckinWordPress(log: { medicine_id?: string; checkin_id?: string; status?: "checked" | "skipped" | "missed"; note?: string; checked_by_ai?: boolean; cared_one_id?: string; checkin_name?: string }): Promise<void> {
  const statusCode = CHK_STATUS_CODE[log.status || "checked"] || "b55";
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
  const result = await wordpressCCTFetch<any>(T.userLogEvent.slug, {
    method: "POST",
    body: {
      [F_LOGEVT.LOG_EVENT_NAME]: "Check-in",
      [F_LOGEVT.CHECK_TYPE]: statusCode,
      [F_LOGEVT.LOG_CHECKIN_NOTE]: log.note || "",
      [F_LOGEVT.CHECKED_BY_AI]: log.checked_by_ai ? YES : NO,
      [F_LOGEVT.LOG_EVENT_TIME]: stamp,
    },
  });
  const newLogId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
  const parentId = normalizeWpObjectId(log.checkin_id || log.medicine_id);
  await linkRel(REL_CHECKIN_LOG, parentId, newLogId);
}

// ─── Medicine schedules & logs ───────────────────────────────
// CCT 187 calendar event (a60 = b55) + CCT 206 (Apple-shaped dose log).
// Relation 190 links the cared one to the schedule; Relation 238 links logs.
export {
  fetchMedicinesWordPress, createMedicineWordPress, updateMedicineWordPress,
  deleteMedicineWordPress, fetchMedicineLogsWordPress, fetchTodayMedicineLogsWordPress,
  logMedicineWordPress,
} from "@/features/medicine/source.medicine";

// ─── Care Tip (CCT 19) ───────────────────────────────────────
// a55=title, a56=content, a57=category (b55=tip, b56=avoid), a58=is_pinned (b55/b56)
const TIP_CATEGORY_CODE: Record<string, string> = { tip: "b55", avoid: "b56" };
const TIP_CATEGORY_LABEL: Record<string, string> = { b55: "tip", b56: "avoid" };

export async function fetchCareTipsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const tips = await fetchRelatedCctChildren(REL_USER_CARE_TIP, caredOneId, T.careTip.slug);
    return tips.map((t: any) => ({
      id: String(t.id || t._ID),
      user_id: caredOneId,
      title: t[F_TIP.TITLE] || null,
      content: t[F_TIP.CONTENT] || null,
      category: TIP_CATEGORY_LABEL[String(t[F_TIP.CATEGORY] || "")] || t[F_TIP.CATEGORY] || null,
      is_pinned: isYes(t[F_TIP.IS_PINNED]),
      is_important: isYes(t[F_TIP.IS_PINNED]),
      created_at: t.created_at,
      updated_at: t.updated_at || t.created_at,
    }));
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function createCareTipWordPress(tip: { user_id: string; title?: string; content: string; category?: string; is_pinned?: boolean }): Promise<void> {
  const created = await wordpressCCTFetch<any>(T.careTip.slug, {
    method: "POST",
    body: {
      [F_TIP.TITLE]: tip.title || tip.content.substring(0, 50),
      [F_TIP.CONTENT]: tip.content,
      [F_TIP.CATEGORY]: TIP_CATEGORY_CODE[tip.category || "tip"] || "b55",
      [F_TIP.IS_PINNED]: tip.is_pinned ? YES : NO,
    },
  });
  const newId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  await linkRel(REL_USER_CARE_TIP, normalizeWpObjectId(tip.user_id), newId);
}

export async function updateCareTipWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.title !== undefined) body[F_TIP.TITLE] = updates.title;
  if (updates.content !== undefined) body[F_TIP.CONTENT] = updates.content;
  if (updates.category !== undefined) body[F_TIP.CATEGORY] = TIP_CATEGORY_CODE[updates.category] || updates.category;
  const pinned = updates.is_pinned ?? updates.is_important;
  if (pinned !== undefined) body[F_TIP.IS_PINNED] = pinned ? YES : NO;
  await wordpressCCTFetch(T.careTip.slug, { id, method: "PUT", body });
}

export async function deleteCareTipWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(T.careTip.slug, { id, method: "DELETE" });
}

// ─── Care Plan (CCT 20) ──────────────────────────────────────
export async function fetchCarePlansWordPress(caredOneId: string): Promise<any[]> {
  try {
    const plans = await fetchRelatedCctChildren(REL_USER_CARE_PLAN, caredOneId, T.carePlan.slug);
    return plans.map((p: any) => ({
      id: String(p.id || p._ID),
      user_id: caredOneId,
      title: p[F_PLAN.TITLE] || null,
      content: p[F_PLAN.CONTENT] || null,
      description: p[F_PLAN.CONTENT] || null,
      is_pinned: isYes(p[F_PLAN.IS_PINNED]),
      status: "active",
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function createCarePlanWordPress(plan: { user_id: string; title: string; description?: string; content?: string; is_pinned?: boolean }): Promise<void> {
  const created = await wordpressCCTFetch<any>(T.carePlan.slug, {
    method: "POST",
    body: {
      [F_PLAN.TITLE]: plan.title,
      [F_PLAN.CONTENT]: plan.content || plan.description || "",
      [F_PLAN.IS_PINNED]: plan.is_pinned ? YES : NO,
    },
  });
  const newId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  await linkRel(REL_USER_CARE_PLAN, normalizeWpObjectId(plan.user_id), newId);
}

export async function updateCarePlanWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.title !== undefined) body[F_PLAN.TITLE] = updates.title;
  if (updates.content !== undefined || updates.description !== undefined) body[F_PLAN.CONTENT] = updates.content ?? updates.description;
  if (updates.is_pinned !== undefined) body[F_PLAN.IS_PINNED] = updates.is_pinned ? YES : NO;
  await wordpressCCTFetch(T.carePlan.slug, { id, method: "PUT", body });
}

export async function deleteCarePlanWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(T.carePlan.slug, { id, method: "DELETE" });
}

// ─── Care Note (CCT 22) ──────────────────────────────────────
export async function fetchCareNotesWordPress(caredOneId: string): Promise<any[]> {
  try {
    const notes = await fetchRelatedCctChildren(REL_USER_CARE_NOTE, caredOneId, T.careNote.slug);
    return notes.map((n: any) => ({
      id: String(n.id || n._ID),
      user_id: caredOneId,
      title: n[F_NOTE.TITLE] || null,
      content: n[F_NOTE.CONTENT] || null,
      author_id: n.author_id || null,
      created_at: n.created_at,
      updated_at: n.updated_at || n.created_at,
    }));
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function createCareNoteWordPress(note: { user_id: string; title?: string; content: string; category?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>(T.careNote.slug, {
    method: "POST",
    body: {
      [F_NOTE.TITLE]: note.title || note.content.substring(0, 50),
      [F_NOTE.CONTENT]: note.content,
    },
  });
  const newId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  await linkRel(REL_USER_CARE_NOTE, normalizeWpObjectId(note.user_id), newId);
}

export async function updateCareNoteWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.title !== undefined) body[F_NOTE.TITLE] = updates.title;
  if (updates.content !== undefined) body[F_NOTE.CONTENT] = updates.content;
  await wordpressCCTFetch(T.careNote.slug, { id, method: "PUT", body });
}

export async function deleteCareNoteWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(T.careNote.slug, { id, method: "DELETE" });
}

// ─── Emergency Contacts (CCT 211) ────────────────────────────
// a55=name, a56=detail, a57=phone, a58=address, a59=relationship, a60=note
export async function fetchEmergencyContactsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const contacts = await fetchRelatedCctChildren(REL_USER_EMERGENCY_CONTACT, caredOneId, T.emergencyContact.slug);
    return contacts.map((c: any) => ({
      id: String(c.id || c._ID),
      user_id: caredOneId,
      name: c[F_EMG.NAME] || null,
      phone: c[F_EMG.PHONE] || null,
      address: c[F_EMG.ADDRESS] || null,
      content: c[F_EMG.DETAIL] || null,
      email: null,
      relationship: c[F_EMG.RELATIONSHIP] || null,
      note: c[F_EMG.NOTE] || null,
      is_primary: false,
      created_at: c.created_at,
    }));
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function createEmergencyContactWordPress(contact: { user_id: string; name: string; phone?: string; email?: string; address?: string; relationship?: string; note?: string; content?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>(T.emergencyContact.slug, {
    method: "POST",
    body: {
      [F_EMG.NAME]: contact.name,
      [F_EMG.PHONE]: contact.phone || "",
      [F_EMG.ADDRESS]: contact.address || "",
      [F_EMG.RELATIONSHIP]: contact.relationship || "",
      [F_EMG.DETAIL]: contact.content || "",
      [F_EMG.NOTE]: contact.note || contact.email || "",
    },
  });
  const newId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  await linkRel(REL_USER_EMERGENCY_CONTACT, normalizeWpObjectId(contact.user_id), newId);
}

export async function updateEmergencyContactWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.name !== undefined) body[F_EMG.NAME] = updates.name;
  if (updates.phone !== undefined) body[F_EMG.PHONE] = updates.phone;
  if (updates.address !== undefined) body[F_EMG.ADDRESS] = updates.address;
  if (updates.relationship !== undefined) body[F_EMG.RELATIONSHIP] = updates.relationship;
  if (updates.content !== undefined) body[F_EMG.DETAIL] = updates.content;
  if (updates.note !== undefined) body[F_EMG.NOTE] = updates.note;
  await wordpressCCTFetch(T.emergencyContact.slug, { id, method: "PUT", body });
}

export async function deleteEmergencyContactWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(T.emergencyContact.slug, { id, method: "DELETE" });
}

// ─── Cared One Documents (CCT 212) ───────────────────────────
// Attachments live in the CCT's Gallery field (F_DOC.ATTACHMENTS): a
// comma-separated list of WP media IDs, so one document record can carry
// several files (PDF / TXT / images).
export async function fetchCaredOneDocumentsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const docs = await fetchRelatedCctChildren(REL_USER_CARE_DOCUMENT, caredOneId, T.careDocument.slug);
    const { resolveWPMedia, parseMediaIds } = await import("@/lib/wp-media");
    return await Promise.all(docs.map(async (d: any) => {
      const rawIds = d[F_DOC.ATTACHMENTS];
      const attachments = await resolveWPMedia(rawIds);
      return {
        id: String(d.id || d._ID),
        user_id: caredOneId,
        title: d[F_DOC.NAME] || null,
        name: d[F_DOC.NAME] || null,
        description: d[F_DOC.CONTENT] || null,
        content: d[F_DOC.CONTENT] || null,
        attachment_ids: parseMediaIds(rawIds),
        attachments,
        file_url: attachments[0]?.url || null,
        document_type: null,
        created_at: d.created_at,
        updated_at: d.updated_at || d.created_at,
      };
    }));
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function createCaredOneDocumentWordPress(doc: { user_id: string; title: string; description?: string; file_url?: string; document_type?: string; attachment_ids?: Array<number | string> }): Promise<void> {
  const contentParts = [doc.description || ""];
  if (doc.file_url) contentParts.push(`URL: ${doc.file_url}`);
  if (doc.document_type) contentParts.push(`Type: ${doc.document_type}`);
  const { serializeMediaIds } = await import("@/lib/wp-media");
  const created = await wordpressCCTFetch<any>(T.careDocument.slug, {
    method: "POST",
    body: {
      [F_DOC.NAME]: doc.title,
      [F_DOC.CONTENT]: contentParts.filter(Boolean).join("\n"),
      [F_DOC.ATTACHMENTS]: serializeMediaIds(doc.attachment_ids || []),
    },
  });
  const newId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  await linkRel(REL_USER_CARE_DOCUMENT, normalizeWpObjectId(doc.user_id), newId);
}

export async function updateCaredOneDocumentWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.title !== undefined) body[F_DOC.NAME] = updates.title;
  if (updates.name !== undefined) body[F_DOC.NAME] = updates.name;
  if (updates.description !== undefined) body[F_DOC.CONTENT] = updates.description;
  if (updates.content !== undefined) body[F_DOC.CONTENT] = updates.content;
  if (updates.attachment_ids !== undefined) {
    const { serializeMediaIds } = await import("@/lib/wp-media");
    body[F_DOC.ATTACHMENTS] = serializeMediaIds(updates.attachment_ids || []);
  }
  await wordpressCCTFetch(T.careDocument.slug, { id, method: "PUT", body });
}

export async function deleteCaredOneDocumentWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(T.careDocument.slug, { id, method: "DELETE" });
}


// ─── Dementia Stage ─────────────────────────────────────────
export async function updateDementiaStageWordPress(caredOneId: string, stage: string): Promise<void> {
  const userId = normalizeWpObjectId(caredOneId);
  await wordpressFetch(`wp/v2/users/${userId}`, {
    method: "PUT",
    body: { meta: { dementia_stage: stage } },
  });
}

// ─── Visit Log → the check-in system, CCT 208 (checkin_log) ───
// A visit is a check-in entry: status a55 = b55 "Checked", details in the
// note field a56. Entries hang off the cared one's check-in schedule
// (CCT 207) through REL 240; the schedule itself hangs off the cared one
// through REL 239. No extra table, no extra fields.
const VISIT_SCHEDULE_NAME = "Visit log";

async function findVisitSchedule(caredOneId: string): Promise<any | null> {
  const list = await fetchCheckinsWordPress(caredOneId);
  return list.find((c: any) => String(c.name) === VISIT_SCHEDULE_NAME) || null;
}

async function getOrCreateVisitSchedule(caredOneId: string): Promise<any> {
  const existing = await findVisitSchedule(caredOneId);
  if (existing) return existing;
  await createCheckinWordPress({
    user_id: caredOneId,
    name: VISIT_SCHEDULE_NAME,
    detail: "Visits logged by the care circle",
    frequency: "As it happens",
    time_slot: [],
  });
  const created = await findVisitSchedule(caredOneId);
  if (!created) throw new Error("Could not open the visit log");
  return created;
}

export async function fetchVisitLogWordPress(caredOneId: string): Promise<any[]> {
  try {
    const schedule = await findVisitSchedule(caredOneId);
    if (!schedule) return [];
    const logs = await fetchCheckinLogsWordPress(caredOneId);
    return logs
      .filter((l: any) => String(l.checkin_id) === String(schedule.id))
      .map((l: any) => ({
        id: String(l.id),
        user_id: caredOneId,
        description: l.note || null,
        visited_at: l.created_at || null,
        created_at: l.created_at || null,
      }))
      .sort((a: any, b: any) => String(b.visited_at || "").localeCompare(String(a.visited_at || "")));
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function createVisitLogWordPress(visit: {
  user_id: string; description?: string;
}): Promise<void> {
  const schedule = await getOrCreateVisitSchedule(visit.user_id);
  await logCheckinWordPress({
    checkin_id: String(schedule.id),
    status: "checked",
    note: visit.description || "",
    checked_by_ai: false,
  });
}

export async function deleteVisitLogWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(T.userLogEvent.slug, { id, method: "DELETE" });
}

