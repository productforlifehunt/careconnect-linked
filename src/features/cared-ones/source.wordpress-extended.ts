import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { WP } from "@/integrations/wp-schema";

// ─── Relations (per data bible / live WP) ────────────────────
const REL_USER_CARED_ONE_LEGACY = 79;   // user → user (legacy)
const REL_USER_CARED_ONE_CARD = 126;    // user → cared_ones_informat (CCT 125)
const REL_CARED_CARD_EMERGENCY = 127;   // cared_ones_informat → emergency_contact
const REL_GROUP_MEMBER = 72;            // care_group → users
const REL_USER_MEDICINE = 83;
const REL_MEDICINE_LOG = 121;
const REL_USER_CHECKIN = 150;           // both 145 and 150 exist on live; existing data is on 150
const REL_CHECKIN_LOG = 151;
const REL_USER_CARE_TIP = 88;
const REL_USER_EMERGENCY_CONTACT = 63;
const REL_USER_CARE_NOTE = 92;
const REL_USER_CARE_DOCUMENT = 95;
const REL_USER_CARE_PLAN = 97;

// ─── Opaque field aliases (bible) ────────────────────────────
const F_MED = WP.cct["15"].fields;          // medicine
const F_MEDLOG = WP.cct["16"].fields;       // medicine_log
const F_CHK = WP.cct["138"].fields;         // checkin_schedule
const F_CHKLOG = WP.cct["17"].fields;       // checkin_log
const F_NOTE = WP.cct["22"].fields;         // care_note
const F_TIP = WP.cct["19"].fields;          // care_tip
const F_PLAN = WP.cct["20"].fields;         // care_plan
const F_EMG = WP.cct["24"].fields;          // emergency_contact
const F_DOC = WP.cct["23"].fields;          // care_document
const F_CARD = WP.cct["125"].fields;        // cared_ones_informat

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
function serializeTimeSlot(value: unknown): string {
  return normalizeTimeSlot(value).join(",");
}

async function fetchRelatedCctChildren(relationId: number, parentId: string, cctSlug: string): Promise<any[]> {
  const pid = normalizeWpObjectId(parentId);
  if (!pid) return [];
  const rels = await wordpressFetch<any[]>(`jet-rel/${relationId}/children/${pid}`);
  if (!Array.isArray(rels) || rels.length === 0) return [];
  const items = await Promise.all(rels.map(async (r: any) => {
    try { return await wordpressCCTFetch<any>(cctSlug, { id: r.child_object_id }); }
    catch { return null; }
  }));
  return items.filter(Boolean);
}

async function linkRel(relId: number, parentId: number, childId: number) {
  if (!parentId || !childId) return;
  await wordpressFetch(`jet-rel/${relId}`, {
    method: "POST",
    body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
  });
}

// ─── Cared Ones (legacy user→user Rel 79) ───────────────────
export async function createUserCaredOneWordPress(caredOne: { caredOneId: string; relationship?: string; isPrimary?: boolean }): Promise<void> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) throw new Error("Not authenticated");
  const childId = normalizeWpObjectId(caredOne.caredOneId);
  if (!childId) throw new Error("Invalid cared one user");
  await linkRel(REL_USER_CARED_ONE_LEGACY, Number(stored.user_id), childId);
}

export async function deleteUserCaredOneWordPress(id: string): Promise<void> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) throw new Error("Not authenticated");
  const childId = normalizeWpObjectId(id);
  if (!childId) throw new Error("Invalid cared one user");
  await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE_LEGACY}`, {
    method: "DELETE",
    body: { parent_id: Number(stored.user_id), child_id: childId },
  });
}

export async function fetchGroupCaredOnesWordPress(groupId: string): Promise<any[]> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizeWpObjectId(groupId)}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const caredOneRels = rels.filter((r: any) => {
      const { memberRoles } = decodeRel72Meta(r?.meta);
      return memberRoles.includes("cared one");
    });
    const userIds = caredOneRels.map((r: any) => Number(r.child_object_id)).filter(Boolean);
    const caredOnes = await Promise.all(userIds.map(async (userId) => {
      try {
        const user = await wordpressFetch<any>(`wp/v2/users/${userId}?context=edit`);
        const rel = caredOneRels.find((r: any) => Number(r.child_object_id) === userId);
        const fullName = user.name || user.slug || decodeRel72Meta(rel?.meta).displayName || "Cared One";
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
      } catch { return null; }
    }));
    return caredOnes.filter(Boolean);
  } catch { return []; }
}

// ─── Cared One Information Card (CCT 125) ───────────────────
// a55=name, a56=description, a57=card_name, a58=status(b55/b56/b57), a59=displays_location(b55/b56)
export async function fetchCaredOnesCardsWordPress(): Promise<any[]> {
  try {
    const stored = getStoredWPUser();
    if (!stored?.user_id) return [];
    const cards = await fetchRelatedCctChildren(REL_USER_CARED_ONE_CARD, String(stored.user_id), "cared_ones_informat");
    return cards.map((c: any) => ({
      id: String(c.id || c._ID),
      user_id: `wp-${stored.user_id}`,
      name: c[F_CARD.CARED_ONE_S_NAME] || c[F_CARD.CARED_ONE_S_INFORMATION_CARD_NAME] || "Cared One",
      description: c[F_CARD.CARED_ONE_S_DESCRIPTION] || null,
      card_name: c[F_CARD.CARED_ONE_S_INFORMATION_CARD_NAME] || null,
      status: c[F_CARD.STATUS] === "b57" ? "paused" : c[F_CARD.STATUS] === "b55" ? "draft" : "active",
      displays_location: c[F_CARD.DISPLAYS_LOCATION] || null,
      created_at: c.created_at,
    }));
  } catch { return []; }
}

export async function createCaredOnesCardWordPress(card: { name: string; description?: string; card_name?: string; status?: string }): Promise<void> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) throw new Error("Not authenticated");
  const statusCode = card.status === "paused" ? "b57" : card.status === "draft" ? "b55" : "b56";
  const created = await wordpressCCTFetch<any>("cared_ones_informat", {
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

// ─── Check-in Schedule (CCT 138) ─────────────────────────────
export async function fetchCheckinsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const items = await fetchRelatedCctChildren(REL_USER_CHECKIN, caredOneId, "checkin_schedule");
    return items.map((i: any) => ({
      id: String(i.id || i._ID),
      user_id: caredOneId,
      name: i[F_CHK.NAME] || "Daily Check-In",
      detail: i[F_CHK.DETAIL] || null,
      frequency: i[F_CHK.FREQUENCY] || "Once daily",
      time_slot: normalizeTimeSlot(i[F_CHK.TIME_SLOT]),
      instructions: i[F_CHK.INSTRUCTIONS] || null,
      start_date: i[F_CHK.START_DATE] || null,
      note: i[F_CHK.NOTE] || null,
      is_active: isYes(i[F_CHK.IS_ACTIVE]),
      created_at: i.created_at,
    }));
  } catch { return []; }
}

export async function createCheckinWordPress(checkin: { user_id: string; name: string; detail?: string; frequency?: string; time_slot?: string[]; instructions?: string; start_date?: string; note?: string }): Promise<void> {
  const result = await wordpressCCTFetch<any>("checkin_schedule", {
    method: "POST",
    body: {
      [F_CHK.NAME]: checkin.name,
      [F_CHK.DETAIL]: checkin.detail || "",
      [F_CHK.FREQUENCY]: checkin.frequency || "Once daily",
      [F_CHK.TIME_SLOT]: serializeTimeSlot(checkin.time_slot || ["08:00"]),
      [F_CHK.INSTRUCTIONS]: checkin.instructions || "",
      [F_CHK.START_DATE]: checkin.start_date || "",
      [F_CHK.NOTE]: checkin.note || "",
      [F_CHK.IS_ACTIVE]: YES,
    },
  });
  const newId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
  await linkRel(REL_USER_CHECKIN, normalizeWpObjectId(checkin.user_id), newId);
}

export async function updateCheckinWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.name !== undefined) body[F_CHK.NAME] = updates.name;
  if (updates.detail !== undefined) body[F_CHK.DETAIL] = updates.detail;
  if (updates.frequency !== undefined) body[F_CHK.FREQUENCY] = updates.frequency;
  if (updates.time_slot !== undefined) body[F_CHK.TIME_SLOT] = serializeTimeSlot(updates.time_slot);
  if (updates.instructions !== undefined) body[F_CHK.INSTRUCTIONS] = updates.instructions;
  if (updates.start_date !== undefined) body[F_CHK.START_DATE] = updates.start_date;
  if (updates.note !== undefined) body[F_CHK.NOTE] = updates.note;
  if (updates.is_active !== undefined) body[F_CHK.IS_ACTIVE] = updates.is_active ? YES : NO;
  await wordpressCCTFetch("checkin_schedule", { id, method: "PUT", body });
}

export async function deleteCheckinWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("checkin_schedule", { id, method: "DELETE" });
}

// ─── Check-in Log (CCT 17) ───────────────────────────────────
// a55=status (b55=Checked, b56=Skipped, b57=Missed), a56=note, a57=checked_by_ai (b55/b56)
const CHK_STATUS_CODE: Record<string, string> = { checked: "b55", skipped: "b56", missed: "b57" };
const CHK_STATUS_LABEL: Record<string, string> = { b55: "checked", b56: "skipped", b57: "missed" };

export async function fetchCheckinLogsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const checkins = await fetchCheckinsWordPress(caredOneId);
    const nestedLogs = await Promise.all(checkins.map(async (checkin: any) => {
      try {
        const rels = await wordpressFetch<any[]>(`jet-rel/${REL_CHECKIN_LOG}/children/${normalizeWpObjectId(checkin.id)}`);
        if (!Array.isArray(rels) || rels.length === 0) return [];
        const logs = await Promise.all(rels.map(async (rel: any) => {
          try {
            const item = await wordpressCCTFetch<any>("checkin_log", { id: rel.child_object_id });
            const statusCode = String(item[F_CHKLOG.STATUS] || "b55");
            return {
              id: String(item.id || item._ID || rel.child_object_id),
              checkin_id: String(checkin.id),
              status: CHK_STATUS_LABEL[statusCode] || "checked",
              note: item[F_CHKLOG.NOTE] || null,
              checked_by_ai: isYes(item[F_CHKLOG.CHECKED_BY_AI]),
              created_at: item.created_at,
            };
          } catch { return null; }
        }));
        return logs.filter(Boolean);
      } catch { return []; }
    }));
    return nestedLogs.flat().sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch { return []; }
}

export async function fetchTodayCheckinLogsWordPress(caredOneId: string): Promise<any[]> {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const logs = await fetchCheckinLogsWordPress(caredOneId);
  return logs.filter((log: any) => log.created_at && new Date(log.created_at) >= today);
}

export async function logCheckinWordPress(log: { medicine_id?: string; checkin_id?: string; status?: "checked" | "skipped" | "missed"; note?: string; checked_by_ai?: boolean }): Promise<void> {
  const statusCode = CHK_STATUS_CODE[log.status || "checked"] || "b55";
  const result = await wordpressCCTFetch<any>("checkin_log", {
    method: "POST",
    body: {
      [F_CHKLOG.STATUS]: statusCode,
      [F_CHKLOG.NOTE]: log.note || "",
      [F_CHKLOG.CHECKED_BY_AI]: log.checked_by_ai ? YES : NO,
    },
  });
  const newLogId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
  const parentId = normalizeWpObjectId(log.checkin_id || log.medicine_id);
  await linkRel(REL_CHECKIN_LOG, parentId, newLogId);
}

// ─── Medicine (CCT 15) ───────────────────────────────────────
export async function fetchMedicinesWordPress(caredOneId: string): Promise<any[]> {
  try {
    const meds = await fetchRelatedCctChildren(REL_USER_MEDICINE, caredOneId, "medicine");
    return meds.map((m: any) => ({
      id: String(m.id || m._ID),
      user_id: caredOneId,
      name: m[F_MED.NAME] || "Medicine",
      dosage: m[F_MED.DOSAGE] || null,
      frequency: m[F_MED.FREQUENCY] || null,
      time_slot: normalizeTimeSlot(m[F_MED.TIME_SLOT]),
      instructions: m[F_MED.INSTRUCTIONS] || null,
      prescribing_doctor: m[F_MED.PRESCRIBING_DOCTOR] || null,
      pharmacy: m[F_MED.PHARMACY] || null,
      side_effects: m[F_MED.SIDE_EFFECTS] || null,
      start_date: m[F_MED.START_DATE] || null,
      end_date: m[F_MED.END_DATE] || null,
      note: m[F_MED.NOTE] || null,
      is_active: isYes(m[F_MED.IS_ACTIVE]),
      stock_count: m[F_MED.STOCK_COUNT] != null && m[F_MED.STOCK_COUNT] !== "" ? Number(m[F_MED.STOCK_COUNT]) : null,
      refill_threshold: m[F_MED.REFILL_THRESHOLD] != null && m[F_MED.REFILL_THRESHOLD] !== "" ? Number(m[F_MED.REFILL_THRESHOLD]) : null,
      created_at: m.created_at,
    }));
  } catch { return []; }
}

export async function createMedicineWordPress(med: { user_id: string; name: string; dosage?: string; frequency?: string; time_slot?: string[]; instructions?: string; prescribing_doctor?: string; pharmacy?: string; side_effects?: string; start_date?: string; end_date?: string; note?: string; stock_count?: number; refill_threshold?: number }): Promise<void> {
  const result = await wordpressCCTFetch<any>("medicine", {
    method: "POST",
    body: {
      [F_MED.NAME]: med.name,
      [F_MED.DOSAGE]: med.dosage || "",
      [F_MED.FREQUENCY]: med.frequency || "",
      [F_MED.TIME_SLOT]: serializeTimeSlot(med.time_slot || []),
      [F_MED.INSTRUCTIONS]: med.instructions || "",
      [F_MED.PRESCRIBING_DOCTOR]: med.prescribing_doctor || "",
      [F_MED.PHARMACY]: med.pharmacy || "",
      [F_MED.SIDE_EFFECTS]: med.side_effects || "",
      [F_MED.START_DATE]: med.start_date || "",
      [F_MED.END_DATE]: med.end_date || "",
      [F_MED.NOTE]: med.note || "",
      [F_MED.IS_ACTIVE]: YES,
      [F_MED.STOCK_COUNT]: med.stock_count ?? "",
      [F_MED.REFILL_THRESHOLD]: med.refill_threshold ?? "",
    },
  });
  const newId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
  await linkRel(REL_USER_MEDICINE, normalizeWpObjectId(med.user_id), newId);
}

export async function updateMedicineWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.name !== undefined) body[F_MED.NAME] = updates.name;
  if (updates.dosage !== undefined) body[F_MED.DOSAGE] = updates.dosage;
  if (updates.frequency !== undefined) body[F_MED.FREQUENCY] = updates.frequency;
  if (updates.time_slot !== undefined) body[F_MED.TIME_SLOT] = serializeTimeSlot(updates.time_slot);
  if (updates.instructions !== undefined) body[F_MED.INSTRUCTIONS] = updates.instructions;
  if (updates.prescribing_doctor !== undefined) body[F_MED.PRESCRIBING_DOCTOR] = updates.prescribing_doctor;
  if (updates.pharmacy !== undefined) body[F_MED.PHARMACY] = updates.pharmacy;
  if (updates.side_effects !== undefined) body[F_MED.SIDE_EFFECTS] = updates.side_effects;
  if (updates.start_date !== undefined) body[F_MED.START_DATE] = updates.start_date;
  if (updates.end_date !== undefined) body[F_MED.END_DATE] = updates.end_date;
  if (updates.note !== undefined || updates.notes !== undefined) body[F_MED.NOTE] = updates.note ?? updates.notes;
  if (updates.is_active !== undefined) body[F_MED.IS_ACTIVE] = updates.is_active ? YES : NO;
  if (updates.stock_count !== undefined) body[F_MED.STOCK_COUNT] = updates.stock_count;
  if (updates.refill_threshold !== undefined) body[F_MED.REFILL_THRESHOLD] = updates.refill_threshold;
  await wordpressCCTFetch("medicine", { id, method: "PUT", body });
}

export async function deleteMedicineWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("medicine", { id, method: "DELETE" });
}

// ─── Medicine Log (CCT 16) ───────────────────────────────────
// a55=status (b55=Taken, b56=Skipped, b57=Missed), a56=note
const MED_STATUS_CODE: Record<string, string> = { taken: "b55", skipped: "b56", missed: "b57" };
const MED_STATUS_LABEL: Record<string, string> = { b55: "taken", b56: "skipped", b57: "missed" };

export async function fetchMedicineLogsWordPress(medicineId: string): Promise<any[]> {
  try {
    const logs = await fetchRelatedCctChildren(REL_MEDICINE_LOG, medicineId, "medicine_log");
    return logs.map((l: any) => ({
      id: String(l.id || l._ID),
      medicine_id: medicineId,
      taken_at: l.created_at,
      status: MED_STATUS_LABEL[String(l[F_MEDLOG.STATUS] || "b55")] || "taken",
      logged_by: l.author_id || null,
      note: l[F_MEDLOG.NOTE] || null,
      notes: l[F_MEDLOG.NOTE] || null,
      created_at: l.created_at,
    }));
  } catch { return []; }
}

export async function fetchTodayMedicineLogsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const userId = normalizeWpObjectId(caredOneId);
    const medRels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_MEDICINE}/children/${userId}`);
    if (!Array.isArray(medRels) || medRels.length === 0) return [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const allLogs: any[] = [];
    await Promise.all(medRels.map(async (rel: any) => {
      const mid = String(rel.child_object_id);
      try {
        const logs = await fetchMedicineLogsWordPress(mid);
        for (const l of logs) if (l.created_at && new Date(l.created_at) >= today) allLogs.push(l);
      } catch {}
    }));
    return allLogs;
  } catch { return []; }
}

export async function logMedicineWordPress(log: { medicine_id: string; status?: string; note?: string; user_id?: string }): Promise<void> {
  const statusCode = MED_STATUS_CODE[(log.status || "taken").toLowerCase()] || "b55";
  const result = await wordpressCCTFetch<any>("medicine_log", {
    method: "POST",
    body: {
      [F_MEDLOG.STATUS]: statusCode,
      [F_MEDLOG.NOTE]: log.note || "",
    },
  });
  const newLogId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
  await linkRel(REL_MEDICINE_LOG, normalizeWpObjectId(log.medicine_id), newLogId);
}

// ─── Care Tip (CCT 19) ───────────────────────────────────────
// a55=title, a56=content, a57=category (b55=tip, b56=avoid), a58=is_pinned (b55/b56)
const TIP_CATEGORY_CODE: Record<string, string> = { tip: "b55", avoid: "b56" };
const TIP_CATEGORY_LABEL: Record<string, string> = { b55: "tip", b56: "avoid" };

export async function fetchCareTipsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const tips = await fetchRelatedCctChildren(REL_USER_CARE_TIP, caredOneId, "care_tip");
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
  } catch { return []; }
}

export async function createCareTipWordPress(tip: { user_id: string; title?: string; content: string; category?: string; is_pinned?: boolean }): Promise<void> {
  const created = await wordpressCCTFetch<any>("care_tip", {
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
  await wordpressCCTFetch("care_tip", { id, method: "PUT", body });
}

export async function deleteCareTipWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_tip", { id, method: "DELETE" });
}

// ─── Care Plan (CCT 20) ──────────────────────────────────────
export async function fetchCarePlansWordPress(caredOneId: string): Promise<any[]> {
  try {
    const plans = await fetchRelatedCctChildren(REL_USER_CARE_PLAN, caredOneId, "care_plan");
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
  } catch { return []; }
}

export async function createCarePlanWordPress(plan: { user_id: string; title: string; description?: string; content?: string; is_pinned?: boolean }): Promise<void> {
  const created = await wordpressCCTFetch<any>("care_plan", {
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
  await wordpressCCTFetch("care_plan", { id, method: "PUT", body });
}

export async function deleteCarePlanWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_plan", { id, method: "DELETE" });
}

// ─── Care Plan Goals (CCT 21 — not in bible field map) ───────
// No fields defined in data dictionary; stub returns [] to keep callers safe.
export async function fetchCarePlanGoalsWordPress(_planId: string): Promise<any[]> { return []; }
export async function createCarePlanGoalWordPress(_goal: { care_plan_id: string; title: string; description?: string; sort_order?: number }): Promise<void> { /* not in bible */ }
export async function updateCarePlanGoalWordPress(_id: string, _updates: Record<string, any>): Promise<void> { /* not in bible */ }

// ─── Care Note (CCT 22) ──────────────────────────────────────
export async function fetchCareNotesWordPress(caredOneId: string): Promise<any[]> {
  try {
    const notes = await fetchRelatedCctChildren(REL_USER_CARE_NOTE, caredOneId, "care_note");
    return notes.map((n: any) => ({
      id: String(n.id || n._ID),
      user_id: caredOneId,
      title: n[F_NOTE.TITLE] || null,
      content: n[F_NOTE.CONTENT] || null,
      author_id: n.author_id || null,
      created_at: n.created_at,
      updated_at: n.updated_at || n.created_at,
    }));
  } catch { return []; }
}

export async function createCareNoteWordPress(note: { user_id: string; title?: string; content: string; category?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>("care_note", {
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
  await wordpressCCTFetch("care_note", { id, method: "PUT", body });
}

export async function deleteCareNoteWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_note", { id, method: "DELETE" });
}

// ─── Emergency Contacts (CCT 24) ─────────────────────────────
// a55=name, a56=content, a57=phone, a58=address, a59=relationship, a60=note
export async function fetchEmergencyContactsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const contacts = await fetchRelatedCctChildren(REL_USER_EMERGENCY_CONTACT, caredOneId, "emergency_contact");
    return contacts.map((c: any) => ({
      id: String(c.id || c._ID),
      user_id: caredOneId,
      name: c[F_EMG.NAME] || null,
      phone: c[F_EMG.PHONE] || null,
      address: c[F_EMG.ADDRESS] || null,
      content: c[F_EMG.CONTENT] || null,
      email: null,
      relationship: c[F_EMG.RELATIONSHIP] || null,
      note: c[F_EMG.NOTE] || null,
      is_primary: false,
      created_at: c.created_at,
    }));
  } catch { return []; }
}

export async function createEmergencyContactWordPress(contact: { user_id: string; name: string; phone?: string; email?: string; address?: string; relationship?: string; note?: string; content?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>("emergency_contact", {
    method: "POST",
    body: {
      [F_EMG.NAME]: contact.name,
      [F_EMG.PHONE]: contact.phone || "",
      [F_EMG.ADDRESS]: contact.address || "",
      [F_EMG.RELATIONSHIP]: contact.relationship || "",
      [F_EMG.CONTENT]: contact.content || "",
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
  if (updates.content !== undefined) body[F_EMG.CONTENT] = updates.content;
  if (updates.note !== undefined) body[F_EMG.NOTE] = updates.note;
  await wordpressCCTFetch("emergency_contact", { id, method: "PUT", body });
}

export async function deleteEmergencyContactWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("emergency_contact", { id, method: "DELETE" });
}

// ─── Activity Log / Health Vital / Symptom Log ───────────────
// Not defined in data bible — stubbed to maintain caller compatibility.
export async function fetchHealthVitalsWordPress(_caredOneId: string): Promise<any[]> { return []; }
export async function createHealthVitalWordPress(_vital: any): Promise<void> { /* not in bible */ }
export async function fetchActivityLogWordPress(_caredOneId: string): Promise<any[]> { return []; }
export async function createActivityLogWordPress(_log: any): Promise<void> { /* not in bible */ }
export async function deleteActivityLogWordPress(_id: string): Promise<void> { /* not in bible */ }
export async function fetchSymptomLogsWordPress(_caredOneId: string): Promise<any[]> { return []; }
export async function createSymptomLogWordPress(_log: any): Promise<void> { /* not in bible */ }

// ─── Cared One Documents (CCT 23) ────────────────────────────
export async function fetchCaredOneDocumentsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const docs = await fetchRelatedCctChildren(REL_USER_CARE_DOCUMENT, caredOneId, "care_document");
    return docs.map((d: any) => ({
      id: String(d.id || d._ID),
      user_id: caredOneId,
      title: d[F_DOC.NAME] || null,
      name: d[F_DOC.NAME] || null,
      description: d[F_DOC.CONTENT] || null,
      content: d[F_DOC.CONTENT] || null,
      file_url: null,
      document_type: null,
      created_at: d.created_at,
      updated_at: d.updated_at || d.created_at,
    }));
  } catch { return []; }
}

export async function createCaredOneDocumentWordPress(doc: { user_id: string; title: string; description?: string; file_url?: string; document_type?: string }): Promise<void> {
  const contentParts = [doc.description || ""];
  if (doc.file_url) contentParts.push(`URL: ${doc.file_url}`);
  if (doc.document_type) contentParts.push(`Type: ${doc.document_type}`);
  const created = await wordpressCCTFetch<any>("care_document", {
    method: "POST",
    body: {
      [F_DOC.NAME]: doc.title,
      [F_DOC.CONTENT]: contentParts.filter(Boolean).join("\n"),
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
  await wordpressCCTFetch("care_document", { id, method: "PUT", body });
}

export async function deleteCaredOneDocumentWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_document", { id, method: "DELETE" });
}

// ─── Dementia Stage ─────────────────────────────────────────
export async function updateDementiaStageWordPress(caredOneId: string, stage: string): Promise<void> {
  const userId = normalizeWpObjectId(caredOneId);
  await wordpressFetch(`wp/v2/users/${userId}`, {
    method: "PUT",
    body: { meta: { dementia_stage: stage } },
  });
}
