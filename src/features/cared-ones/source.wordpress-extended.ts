import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

// Live JetEngine relations (verified from prd-to-wp-mapping.md)
const REL_USER_CARED_ONE_LEGACY = 79;       // M:M users → users (legacy: cared ones as users)
const REL_USER_CARED_ONE_CARD = 126;        // 1:M users → cared_ones_informat (NEW)
const REL_CARED_CARD_EMERGENCY = 127;       // 1:M cared_ones_informat → emergency_contact
const REL_GROUP_MEMBER = 72;                // M:M care_group → users

const REL_USER_MEDICINE = 83;               // 1:M users → medicine
const REL_MEDICINE_LOG = 121;               // 1:M medicine → medicine_log (live: 121, not 84)

const REL_USER_CHECKIN = 150;               // 1:M users → checkin_schedule
const REL_CHECKIN_LOG = 151;                // 1:M checkin_schedule → checkin_log

const REL_USER_CARE_TIP = 88;
const REL_USER_EMERGENCY_CONTACT = 63;
const REL_USER_CARE_NOTE = 92;
const REL_USER_ACTIVITY_LOG = 94;
const REL_USER_CARE_DOCUMENT = 95;
const REL_USER_HEALTH_VITAL = 96;
const REL_USER_CARE_PLAN = 97;
// Note: care_plan_goal links via field `care_plan_id` (no relation in live mapping)

function normalizeWpObjectId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

async function fetchRelatedCctChildren(relationId: number, parentId: string, cctSlug: string): Promise<any[]> {
  const normalizedParentId = normalizeWpObjectId(parentId);
  if (!normalizedParentId) return [];
  const rels = await wordpressFetch<any[]>(`jet-rel/${relationId}/children/${normalizedParentId}`);
  if (!Array.isArray(rels) || rels.length === 0) return [];
  const items = await Promise.all(rels.map(async (rel: any) => {
    try { return await wordpressCCTFetch<any>(cctSlug, { id: rel.child_object_id }); }
    catch { return null; }
  }));
  return items.filter(Boolean);
}

function normalizeTimeSlot(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === "string") {
    if (!value.trim()) return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item)).filter(Boolean);
    } catch {}
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function serializeTimeSlot(value: unknown): string {
  return normalizeTimeSlot(value).join(",");
}

// ─── Cared Ones CRUD (legacy users-as-cared-ones) ───────────
// Personal cared ones via JetEngine relation 79 (users → users) for back-compat
export async function createUserCaredOneWordPress(caredOne: { caredOneId: string; relationship?: string; isPrimary?: boolean }): Promise<void> {
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_id) throw new Error("Not authenticated");
  const childId = normalizeWpObjectId(caredOne.caredOneId);
  if (!childId) throw new Error("Invalid cared one user");
  await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE_LEGACY}`, {
    method: "POST",
    body: {
      parent_id: Number(storedUser.user_id),
      child_id: childId,
      context: "child",
      store_items_type: "update",
    },
  });
}

export async function deleteUserCaredOneWordPress(id: string): Promise<void> {
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_id) throw new Error("Not authenticated");
  const childId = normalizeWpObjectId(id);
  if (!childId) throw new Error("Invalid cared one user");
  await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE_LEGACY}`, {
    method: "DELETE",
    body: { parent_id: Number(storedUser.user_id), child_id: childId },
  });
}

export async function fetchGroupCaredOnesWordPress(groupId: string): Promise<any[]> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizeWpObjectId(groupId)}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    // Dictionary: cared-one identity is stored in Rel 72 meta `care_groups_member_roles`.
    const caredOneRels = rels.filter((r: any) => {
      const roles = Array.isArray(r?.meta?.care_groups_member_roles)
        ? r.meta.care_groups_member_roles
        : String(r?.meta?.care_groups_member_roles || "").split(",").map((s) => s.trim());
      return roles.includes("cared one");
    });
    const userIds = caredOneRels.map((r: any) => Number(r.child_object_id)).filter(Boolean);
    const caredOnes = await Promise.all(
      userIds.map(async (userId) => {
        try {
          const user = await wordpressFetch<any>(`wp/v2/users/${userId}?context=edit`);
          const rel = caredOneRels.find((r: any) => Number(r.child_object_id) === userId);
          const fullName = user.name || user.slug || rel?.meta?.care_groups_member_display_name_ || "Cared One";
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
      })
    );
    return caredOnes.filter(Boolean);
  } catch { return []; }
}

// ─── Cared Ones Information Card (live CCT: cared_ones_informat) ───
// Fields: cared_ones_name, cared_ones_description, cared_ones_information_card_name, status, displays_location
export async function fetchCaredOnesCardsWordPress(): Promise<any[]> {
  try {
    const stored = getStoredWPUser();
    if (!stored?.user_id) return [];
    const cards = await fetchRelatedCctChildren(REL_USER_CARED_ONE_CARD, String(stored.user_id), "cared_ones_informat");
    return cards.map((c: any) => ({
      id: String(c.id || c._ID),
      user_id: `wp-${stored.user_id}`,
      name: c.cared_ones_name || c.cared_ones_information_card_name || "Cared One",
      description: c.cared_ones_description || null,
      card_name: c.cared_ones_information_card_name || null,
      status: c.status || "active",
      displays_location: c.displays_location || null,
      created_at: c.created_at,
    }));
  } catch { return []; }
}

export async function createCaredOnesCardWordPress(card: { name: string; description?: string; card_name?: string; status?: string }): Promise<void> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) throw new Error("Not authenticated");
  const created = await wordpressCCTFetch<any>("cared_ones_informat", {
    method: "POST",
    body: {
      cared_ones_name: card.name,
      cared_ones_description: card.description || "",
      cared_ones_information_card_name: card.card_name || card.name,
      status: card.status || "active",
    },
  });
  const childId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  if (childId) {
    await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE_CARD}`, {
      method: "POST",
      body: { parent_id: Number(stored.user_id), child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

// ─── Check-in Schedule (live CCT: checkin_schedule) ─────────
// Fields per data model: name, detail, frequency, time_slot, instructions, start_date, is_active, note
export async function fetchCheckinsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const items = await fetchRelatedCctChildren(REL_USER_CHECKIN, caredOneId, "checkin_schedule");
    return items.map((i: any) => ({
      id: String(i.id || i._ID),
      user_id: caredOneId,
      name: i.name || "Daily Check-In",
      detail: i.detail || null,
      frequency: i.frequency || "Once daily",
      time_slot: normalizeTimeSlot(i.time_slot),
      instructions: i.instructions || null,
      start_date: i.start_date || null,
      note: i.note || null,
      is_active: i.is_active !== false && i.is_active !== "no" && i.is_active !== "No",
      created_at: i.created_at,
    }));
  } catch { return []; }
}

export async function createCheckinWordPress(checkin: { user_id: string; name: string; detail?: string; frequency?: string; time_slot?: string[]; instructions?: string; start_date?: string; note?: string }): Promise<void> {
  const result = await wordpressCCTFetch<any>("checkin_schedule", {
    method: "POST",
    body: {
      name: checkin.name,
      detail: checkin.detail || "",
      frequency: checkin.frequency || "Once daily",
      time_slot: serializeTimeSlot(checkin.time_slot || ["08:00"]),
      instructions: checkin.instructions || "",
      start_date: checkin.start_date || "",
      note: checkin.note || "",
      is_active: "Yes",
    },
  });
  const newId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
  if (newId) {
    const userId = normalizeWpObjectId(checkin.user_id);
    await wordpressFetch(`jet-rel/${REL_USER_CHECKIN}`, {
      method: "POST",
      body: { parent_id: userId, child_id: newId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateCheckinWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = { ...updates };
  if (updates.time_slot !== undefined) body.time_slot = serializeTimeSlot(updates.time_slot);
  if (updates.is_active !== undefined) body.is_active = updates.is_active ? "Yes" : "No";
  await wordpressCCTFetch("checkin_schedule", { id, method: "PUT", body });
}

export async function deleteCheckinWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("checkin_schedule", { id, method: "DELETE" });
}

// Check-in logs — live CCT: checkin_log | fields per model: status, note
export async function fetchCheckinLogsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const checkins = await fetchCheckinsWordPress(caredOneId);
    const nestedLogs = await Promise.all(
      checkins.map(async (checkin: any) => {
        try {
          const rels = await wordpressFetch<any[]>(`jet-rel/${REL_CHECKIN_LOG}/children/${normalizeWpObjectId(checkin.id)}`);
          if (!Array.isArray(rels) || rels.length === 0) return [];
          const logs = await Promise.all(
            rels.map(async (rel: any) => {
              try {
                const item = await wordpressCCTFetch<any>("checkin_log", { id: rel.child_object_id });
                return {
                  id: String(item.id || item._ID || rel.child_object_id),
                  checkin_id: String(checkin.id),
                  status: (item.status || "checked").toLowerCase(),
                  note: item.note || null,
                  created_at: item.created_at,
                };
              } catch { return null; }
            })
          );
          return logs.filter(Boolean);
        } catch { return []; }
      })
    );
    return nestedLogs.flat().sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch { return []; }
}

export async function fetchTodayCheckinLogsWordPress(caredOneId: string): Promise<any[]> {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const logs = await fetchCheckinLogsWordPress(caredOneId);
  return logs.filter((log: any) => log.created_at && new Date(log.created_at) >= today);
}

export async function logCheckinWordPress(log: { medicine_id?: string; checkin_id?: string; status?: "checked" | "skipped" | "missed"; note?: string }): Promise<void> {
  const statusValue = (log.status || "checked");
  const wpStatus = statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
  const result = await wordpressCCTFetch<any>("checkin_log", {
    method: "POST",
    body: {
      status: wpStatus,
      note: log.note || "",
    },
  });
  const newLogId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
  const parentId = normalizeWpObjectId(log.checkin_id || log.medicine_id);
  if (newLogId && parentId) {
    await wordpressFetch(`jet-rel/${REL_CHECKIN_LOG}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: newLogId, context: "child", store_items_type: "update" },
    });
  }
}

// ─── Medicines ──────────────────────────────────────────────
// CCT slug: medicine | fields: name, dosage, frequency, time_slot, instructions, prescribing_doctor, pharmacy, side_effects, start_date, end_date, is_active, note
export async function fetchMedicinesWordPress(caredOneId: string): Promise<any[]> {
  try {
    const meds = await fetchRelatedCctChildren(REL_USER_MEDICINE, caredOneId, "medicine");
    return meds.map((m: any) => ({
      id: String(m.id || m._ID),
      user_id: caredOneId,
      name: m.name || "Medicine",
      dosage: m.dosage || null,
      frequency: m.frequency || null,
      time_slot: normalizeTimeSlot(m.time_slot),
      instructions: m.instructions || null,
      prescribing_doctor: m.prescribing_doctor || null,
      pharmacy: m.pharmacy || null,
      side_effects: m.side_effects || null,
      start_date: m.start_date || null,
      end_date: m.end_date || null,
      note: m.note || null,
      is_active: m.is_active !== false && m.is_active !== "no",
      created_at: m.created_at,
    }));
  } catch { return []; }
}

export async function createMedicineWordPress(med: { user_id: string; name: string; dosage?: string; frequency?: string; time_slot?: string[]; instructions?: string; prescribing_doctor?: string; pharmacy?: string; side_effects?: string; start_date?: string; end_date?: string; note?: string }): Promise<void> {
  const result = await wordpressCCTFetch<any>("medicine", {
    method: "POST",
    body: {
      name: med.name,
      dosage: med.dosage || "",
      frequency: med.frequency || "",
      time_slot: serializeTimeSlot(med.time_slot || []),
      instructions: med.instructions || "",
      prescribing_doctor: med.prescribing_doctor || "",
      pharmacy: med.pharmacy || "",
      side_effects: med.side_effects || "",
      start_date: med.start_date || "",
      end_date: med.end_date || "",
      note: med.note || "",
      is_active: "yes",
    },
  });
  const newId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
  if (newId) {
    const userId = normalizeWpObjectId(med.user_id);
    await wordpressFetch(`jet-rel/${REL_USER_MEDICINE}`, {
      method: "POST",
      body: { parent_id: userId, child_id: newId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateMedicineWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = { ...updates };
  if (updates.time_slot !== undefined) body.time_slot = serializeTimeSlot(updates.time_slot);
  if (updates.notes !== undefined && body.note === undefined) body.note = updates.notes;
  delete body.notes;
  await wordpressCCTFetch("medicine", { id, method: "PUT", body });
}

export async function deleteMedicineWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("medicine", { id, method: "DELETE" });
}

// ─── Medicine Logs ──────────────────────────────────────────
// CCT slug: medicine_log | fields: status, note | linked via REL 121 (medicine → medicine_log)
export async function fetchMedicineLogsWordPress(medicineId: string): Promise<any[]> {
  try {
    const logs = await fetchRelatedCctChildren(REL_MEDICINE_LOG, medicineId, "medicine_log");
    return logs.map((l: any) => ({
      id: String(l.id || l._ID),
      medicine_id: medicineId,
      taken_at: l.created_at,
      status: l.status || "taken",
      logged_by: l.author_id || null,
      note: l.note || null,
      notes: l.note || null,
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
    await Promise.all(
      medRels.map(async (rel: any) => {
        const mid = String(rel.child_object_id);
        try {
          const logs = await fetchMedicineLogsWordPress(mid);
          for (const l of logs) {
            if (l.created_at && new Date(l.created_at) >= today) allLogs.push(l);
          }
        } catch {}
      })
    );
    return allLogs;
  } catch { return []; }
}

export async function logMedicineWordPress(log: { medicine_id: string; status?: string; note?: string; user_id?: string }): Promise<void> {
  const result = await wordpressCCTFetch<any>("medicine_log", {
    method: "POST",
    body: { status: log.status || "taken", note: log.note || "" },
  });
  const newLogId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
  if (newLogId) {
    await wordpressFetch(`jet-rel/${REL_MEDICINE_LOG}`, {
      method: "POST",
      body: { parent_id: normalizeWpObjectId(log.medicine_id), child_id: newLogId, context: "child", store_items_type: "update" },
    });
  }
}

// ─── Health Vitals ──────────────────────────────────────────
// CCT slug: health_vital | fields: cared_one_id, vital_type, vital_value, vital_unit, recorded_by_user_id, recorded_date, note
export async function fetchHealthVitalsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const vitals = await fetchRelatedCctChildren(REL_USER_HEALTH_VITAL, caredOneId, "health_vital");
    return vitals.map((v: any) => ({
      id: String(v.id || v._ID),
      user_id: caredOneId,
      cared_one_id: v.cared_one_id || caredOneId,
      vital_type: v.vital_type || null,
      value: v.vital_value ?? null,
      unit: v.vital_unit || null,
      notes: v.note || null,
      recorded_by: v.recorded_by_user_id ? `wp-${v.recorded_by_user_id}` : null,
      recorded_at: v.recorded_date || v.created_at,
      created_at: v.created_at,
    }));
  } catch { return []; }
}

export async function createHealthVitalWordPress(vital: { user_id: string; vital_type: string; value: number; unit?: string; notes?: string }): Promise<void> {
  const stored = getStoredWPUser();
  const recorderId = stored?.user_id ? Number(stored.user_id) : null;
  const userIdNum = normalizeWpObjectId(vital.user_id);
  const created = await wordpressCCTFetch<any>("health_vital", {
    method: "POST",
    body: {
      cared_one_id: userIdNum,
      vital_type: vital.vital_type,
      vital_value: vital.value,
      vital_unit: vital.unit || "",
      recorded_by_user_id: recorderId,
      recorded_date: new Date().toISOString(),
      note: vital.notes || "",
    },
  });
  const childId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  if (userIdNum && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_HEALTH_VITAL}`, {
      method: "POST",
      body: { parent_id: userIdNum, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

// ─── Care Tips ──────────────────────────────────────────────
// CCT slug: care_tip | fields: title, content, category, is_pinned
export async function fetchCareTipsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const tips = await fetchRelatedCctChildren(REL_USER_CARE_TIP, caredOneId, "care_tip");
    return tips.map((t: any) => ({
      id: String(t.id || t._ID),
      user_id: caredOneId,
      title: t.title || null,
      content: t.content || null,
      category: t.category || null,
      is_pinned: t.is_pinned === true || t.is_pinned === "yes",
      is_important: t.is_pinned === true || t.is_pinned === "yes",
      created_at: t.created_at,
      updated_at: t.updated_at || t.created_at,
    }));
  } catch { return []; }
}

export async function createCareTipWordPress(tip: { user_id: string; title?: string; content: string; category?: string; is_pinned?: boolean }): Promise<void> {
  const created = await wordpressCCTFetch<any>("care_tip", {
    method: "POST",
    body: {
      title: tip.title || tip.content.substring(0, 50),
      content: tip.content,
      category: tip.category || "",
      is_pinned: tip.is_pinned ? "yes" : "no",
    },
  });
  const parentId = normalizeWpObjectId(tip.user_id);
  const childId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_CARE_TIP}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateCareTipWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = { ...updates };
  if (updates.is_pinned !== undefined) body.is_pinned = updates.is_pinned ? "yes" : "no";
  if (updates.is_important !== undefined) body.is_pinned = updates.is_important ? "yes" : "no";
  delete body.is_important;
  await wordpressCCTFetch("care_tip", { id, method: "PUT", body });
}

export async function deleteCareTipWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_tip", { id, method: "DELETE" });
}

// ─── Care Plans ─────────────────────────────────────────────
// CCT slug: care_plan | fields: title, content, is_pinned
export async function fetchCarePlansWordPress(caredOneId: string): Promise<any[]> {
  try {
    const plans = await fetchRelatedCctChildren(REL_USER_CARE_PLAN, caredOneId, "care_plan");
    return plans.map((p: any) => ({
      id: String(p.id || p._ID),
      user_id: caredOneId,
      title: p.title || null,
      content: p.content || null,
      description: p.content || null,
      is_pinned: p.is_pinned === true || p.is_pinned === "yes",
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
      title: plan.title,
      content: plan.content || plan.description || "",
      is_pinned: plan.is_pinned ? "yes" : "no",
    },
  });
  const parentId = normalizeWpObjectId(plan.user_id);
  const childId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_CARE_PLAN}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateCarePlanWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = { ...updates };
  if (updates.description !== undefined && body.content === undefined) body.content = updates.description;
  if (updates.is_pinned !== undefined) body.is_pinned = updates.is_pinned ? "yes" : "no";
  delete body.description;
  await wordpressCCTFetch("care_plan", { id, method: "PUT", body });
}

export async function deleteCarePlanWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_plan", { id, method: "DELETE" });
}

// ─── Care Plan Goals ────────────────────────────────────────
// CCT slug: care_plan_goal | fields: care_plan_id, title, status, sort_order (linked via field, no relation)
export async function fetchCarePlanGoalsWordPress(planId: string): Promise<any[]> {
  try {
    const all = await wordpressCCTFetch<any[]>("care_plan_goal", { params: { _limit: 200 } });
    if (!Array.isArray(all)) return [];
    const planIdNum = normalizeWpObjectId(planId);
    return all
      .filter((g: any) => Number(g.care_plan_id) === planIdNum)
      .sort((a: any, b: any) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
      .map((g: any) => ({
        id: String(g.id || g._ID),
        care_plan_id: planId,
        title: g.title || null,
        status: g.status || "pending",
        sort_order: Number(g.sort_order) || 0,
        created_at: g.created_at,
      }));
  } catch { return []; }
}

export async function createCarePlanGoalWordPress(goal: { care_plan_id: string; title: string; description?: string; sort_order?: number }): Promise<void> {
  await wordpressCCTFetch("care_plan_goal", {
    method: "POST",
    body: {
      care_plan_id: normalizeWpObjectId(goal.care_plan_id),
      title: goal.title,
      status: "pending",
      sort_order: goal.sort_order ?? 0,
    },
  });
}

export async function updateCarePlanGoalWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const { description: _d, ...body } = updates || {};
  await wordpressCCTFetch("care_plan_goal", { id, method: "PUT", body });
}

// ─── Care Notes ─────────────────────────────────────────────
// CCT slug: care_note | fields: title, content
export async function fetchCareNotesWordPress(caredOneId: string): Promise<any[]> {
  try {
    const notes = await fetchRelatedCctChildren(REL_USER_CARE_NOTE, caredOneId, "care_note");
    return notes.map((n: any) => ({
      id: String(n.id || n._ID),
      user_id: caredOneId,
      title: n.title || null,
      content: n.content || null,
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
      title: note.title || note.content.substring(0, 50),
      content: note.content,
    },
  });
  const parentId = normalizeWpObjectId(note.user_id);
  const childId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_CARE_NOTE}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateCareNoteWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const { category: _c, ...body } = updates || {};
  await wordpressCCTFetch("care_note", { id, method: "PUT", body });
}

export async function deleteCareNoteWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_note", { id, method: "DELETE" });
}

// ─── Emergency Contacts ─────────────────────────────────────
// CCT slug: emergency_contact | fields: name, content, phone, address, relationship, note
// Linked to user via REL 63 (users → emergency_contact) OR card via REL 127 (cared_ones_informat → emergency_contact)
export async function fetchEmergencyContactsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const contacts = await fetchRelatedCctChildren(REL_USER_EMERGENCY_CONTACT, caredOneId, "emergency_contact");
    return contacts.map((c: any) => ({
      id: String(c.id || c._ID),
      user_id: caredOneId,
      name: c.name || null,
      phone: c.phone || null,
      address: c.address || null,
      content: c.content || null,
      email: null,
      relationship: c.relationship || null,
      note: c.note || null,
      is_primary: false,
      created_at: c.created_at,
    }));
  } catch { return []; }
}

export async function createEmergencyContactWordPress(contact: { user_id: string; name: string; phone?: string; email?: string; address?: string; relationship?: string; note?: string; content?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>("emergency_contact", {
    method: "POST",
    body: {
      name: contact.name,
      phone: contact.phone || "",
      address: contact.address || "",
      relationship: contact.relationship || "",
      content: contact.content || "",
      note: contact.note || contact.email || "",
    },
  });
  const parentId = normalizeWpObjectId(contact.user_id);
  const childId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_EMERGENCY_CONTACT}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateEmergencyContactWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const { email: _e, is_primary: _p, ...body } = updates || {};
  await wordpressCCTFetch("emergency_contact", { id, method: "PUT", body });
}

export async function deleteEmergencyContactWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("emergency_contact", { id, method: "DELETE" });
}

// ─── Activity Log ───────────────────────────────────────────
// CCT slug: activity_log | fields: cared_one_id, user_id, activity_type, title, description, duration_minutes, activity_date
export async function fetchActivityLogWordPress(caredOneId: string): Promise<any[]> {
  try {
    const logs = await fetchRelatedCctChildren(REL_USER_ACTIVITY_LOG, caredOneId, "activity_log");
    return logs.map((l: any) => ({
      id: String(l.id || l._ID),
      user_id: caredOneId,
      cared_one_id: l.cared_one_id || caredOneId,
      activity_type: l.activity_type || null,
      title: l.title || null,
      description: l.description || null,
      duration_minutes: l.duration_minutes ?? null,
      activity_date: l.activity_date || l.created_at,
      logged_by: l.user_id ? String(l.user_id) : null,
      created_at: l.created_at,
    }));
  } catch { return []; }
}

export async function createActivityLogWordPress(log: { user_id: string; activity_type?: string; title?: string; description?: string; duration_minutes?: number }): Promise<void> {
  const stored = getStoredWPUser();
  const userIdNum = normalizeWpObjectId(log.user_id);
  const created = await wordpressCCTFetch<any>("activity_log", {
    method: "POST",
    body: {
      cared_one_id: userIdNum,
      user_id: stored?.user_id ? Number(stored.user_id) : null,
      activity_type: log.activity_type || "",
      title: log.title || "",
      description: log.description || "",
      duration_minutes: log.duration_minutes ?? null,
      activity_date: new Date().toISOString(),
    },
  });
  const childId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  if (userIdNum && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_ACTIVITY_LOG}`, {
      method: "POST",
      body: { parent_id: userIdNum, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function deleteActivityLogWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("activity_log", { id, method: "DELETE" });
}

// ─── Symptom Logs (stored as health_vital with vital_type='symptom') ───
export async function fetchSymptomLogsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const all = await fetchHealthVitalsWordPress(caredOneId);
    return all.filter((l: any) => l.vital_type === "symptom").map((l: any) => ({
      id: l.id,
      user_id: l.user_id,
      symptom: l.notes || null,
      severity: l.value ?? null,
      notes: l.notes || null,
      recorded_at: l.recorded_at,
      created_at: l.created_at,
    }));
  } catch { return []; }
}

export async function createSymptomLogWordPress(log: { user_id: string; symptom: string; severity?: number; notes?: string }): Promise<void> {
  await createHealthVitalWordPress({
    user_id: log.user_id,
    vital_type: "symptom",
    value: log.severity ?? 0,
    unit: "",
    notes: log.notes || log.symptom,
  });
}

// ─── Cared One Documents ────────────────────────────────────
// CCT slug: care_document | fields: name, content
export async function fetchCaredOneDocumentsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const docs = await fetchRelatedCctChildren(REL_USER_CARE_DOCUMENT, caredOneId, "care_document");
    return docs.map((d: any) => ({
      id: String(d.id || d._ID),
      user_id: caredOneId,
      title: d.name || null,
      name: d.name || null,
      description: d.content || null,
      content: d.content || null,
      file_url: null,
      document_type: null,
      created_at: d.created_at,
      updated_at: d.updated_at || d.created_at,
    }));
  } catch { return []; }
}

export async function createCaredOneDocumentWordPress(doc: { user_id: string; title: string; description?: string; file_url?: string; document_type?: string }): Promise<void> {
  // Live schema only has name + content; pack URL/type into content if provided
  const contentParts = [doc.description || ""];
  if (doc.file_url) contentParts.push(`URL: ${doc.file_url}`);
  if (doc.document_type) contentParts.push(`Type: ${doc.document_type}`);
  const created = await wordpressCCTFetch<any>("care_document", {
    method: "POST",
    body: { name: doc.title, content: contentParts.filter(Boolean).join("\n") },
  });
  const parentId = normalizeWpObjectId(doc.user_id);
  const childId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_CARE_DOCUMENT}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateCaredOneDocumentWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.title !== undefined) body.name = updates.title;
  if (updates.name !== undefined) body.name = updates.name;
  if (updates.description !== undefined) body.content = updates.description;
  if (updates.content !== undefined) body.content = updates.content;
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
