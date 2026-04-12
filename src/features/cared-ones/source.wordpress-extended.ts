import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

const REL_USER_CARED_ONE = 79;     // users -> users
const REL_GROUP_MEMBER = 72;        // care_group -> users
// JetEngine Relation IDs for medicine system
const REL_USER_MEDICINE = 83;      // Mix: Users → medicine (one-to-many)
const REL_MEDICINE_LOG = 84;        // medicine → medicine_log (one-to-many)
const REL_USER_CARE_TIP = 88;       // Mix: Users → care_tip (one-to-many)
const REL_USER_EMERGENCY_CONTACT = 63; // Mix: Users → emergency_contact (one-to-many)
const REL_USER_CARE_NOTE = 92;      // Mix: Users → care_note (one-to-many)
const REL_USER_ACTIVITY_LOG = 94;   // Mix: Users → activity_log (one-to-many)
const REL_USER_CARE_DOCUMENT = 95;  // Mix: Users → care_document (one-to-many)
const REL_USER_HEALTH_VITAL = 96;   // Mix: Users → health_vital (one-to-many)
const REL_USER_CARE_PLAN = 97;      // Mix: Users → care_plan (one-to-many)
const REL_CARE_PLAN_GOAL = 98;      // CCT: care_plan → care_plan_goal (one-to-many)

function normalizeWpObjectId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

async function fetchRelatedCctChildren(relationId: number, parentId: string, cctSlug: string): Promise<any[]> {
  const normalizedParentId = normalizeWpObjectId(parentId);
  if (!normalizedParentId) return [];
  const rels = await wordpressFetch<any[]>(`jet-rel/${relationId}/children/${normalizedParentId}`);
  if (!Array.isArray(rels) || rels.length === 0) return [];
  const items = await Promise.all(rels.map(async (rel: any) => {
    try {
      return await wordpressCCTFetch<any>(cctSlug, { id: rel.child_object_id });
    } catch {
      return null;
    }
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
  const slots = normalizeTimeSlot(value);
  return slots.join(",");
}

function isCheckinType(value: unknown): boolean {
  return String(value || "").toLowerCase() === "checkin";
}

function isMedicineType(value: unknown): boolean {
  return !isCheckinType(value);
}

// ─── Cared Ones CRUD ────────────────────────────────────────
// Personal cared ones are managed via JetEngine relation 79 (users -> users)
export async function createUserCaredOneWordPress(caredOne: { caredOneId: string; relationship?: string; isPrimary?: boolean }): Promise<void> {
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_id) throw new Error("Not authenticated");
  const childId = Number(String(caredOne.caredOneId).replace(/^wp-/, ""));
  if (!childId) throw new Error("Invalid cared one user");
  await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE}`, {
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
  const childId = Number(String(id).replace(/^wp-/, ""));
  if (!childId) throw new Error("Invalid cared one user");
  await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE}`, {
    method: "DELETE",
    body: {
      parent_id: Number(storedUser.user_id),
      child_id: childId,
    },
  });
}

export async function fetchGroupCaredOnesWordPress(groupId: string): Promise<any[]> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${groupId}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const userIds = rels.map((r: any) => Number(r.child_object_id)).filter(Boolean);
    const caredOnes = await Promise.all(
      userIds.map(async (userId) => {
        try {
          const user = await wordpressFetch<any>(`wp/v2/users/${userId}?context=edit`);
          const fullName = user.name || user.slug || "Loved One";
          return {
            id: `wp-${userId}`,
            user_id: `wp-${userId}`,
            name: fullName,
            full_name: fullName,
            relationship: null,
            date_of_birth: null,
            medical_conditions: null,
            notes: null,
            avatar_url: user.avatar_urls?.["96"] || null,
            created_at: null,
          };
        } catch {
          return null;
        }
      })
    );
    return caredOnes.filter(Boolean);
  } catch { return []; }
}

export async function fetchCheckinsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const userId = String(caredOneId).replace(/^wp-/, "");
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_MEDICINE}/children/${userId}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const checkinIds = rels.map((r: any) => r.child_object_id).filter(Boolean);
    const items = await Promise.all(
      checkinIds.map(async (id: string) => {
        try {
          const item = await wordpressCCTFetch<any>("medicine", { id });
          if (!isCheckinType(item.medicine_or_checkin)) return null;
          return {
            id: String(item._ID || item.id || id),
            user_id: caredOneId,
            medicine_or_checkin: "checkin",
            name: item.name || "Daily Check-In",
            frequency: item.frequency || "Once daily",
            time_slot: normalizeTimeSlot(item.time_slot),
            note: item.note || item.notes || null,
            is_active: item.is_active !== false && item.is_active !== "no",
            created_at: item.cct_created || item.created_at,
          };
        } catch { return null; }
      })
    );
    return items.filter(Boolean);
  } catch { return []; }
}

export async function createCheckinWordPress(checkin: { user_id: string; name: string; frequency?: string; time_slot?: string[]; note?: string }): Promise<void> {
  const result = await wordpressCCTFetch<any>("medicine", {
    method: "POST",
    body: {
      medicine_or_checkin: "checkin",
      name: checkin.name,
      frequency: checkin.frequency,
      time_slot: serializeTimeSlot(checkin.time_slot || ["08:00"]),
      note: checkin.note || "",
      is_active: "yes",
    },
  });
  const newId = result?._ID || result?.id || result?.item_id;
  if (newId) {
    const userId = String(checkin.user_id).replace(/^wp-/, "");
    await wordpressFetch(`jet-rel/${REL_USER_MEDICINE}`, {
      method: "POST",
      body: { parent_id: Number(userId), child_id: Number(newId), context: "child", store_items_type: "update" },
    });
  }
}

export async function fetchCheckinLogsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const checkins = await fetchCheckinsWordPress(caredOneId);
    const nestedLogs = await Promise.all(
      checkins.map(async (checkin: any) => {
        try {
          const rels = await wordpressFetch<any[]>(`jet-rel/${REL_MEDICINE_LOG}/children/${checkin.id}`);
          if (!Array.isArray(rels) || rels.length === 0) return [];
          const logs = await Promise.all(
            rels.map(async (rel: any) => {
              try {
                const item = await wordpressCCTFetch<any>("medicine_log", { id: rel.child_object_id });
                if (!isCheckinType(item.medicine_or_checkin)) return null;
                const createdAt = item.logged_at || item.cct_created || item.created_at;
                return {
                  id: String(item._ID || item.id || rel.child_object_id),
                  medicine_id: String(checkin.id),
                  checkin_id: String(checkin.id),
                  status: item.status || "taken",
                  note: item.note || null,
                  created_at: createdAt,
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const logs = await fetchCheckinLogsWordPress(caredOneId);
  return logs.filter((log: any) => log.created_at && new Date(log.created_at) >= today);
}

export async function logCheckinWordPress(log: { medicine_id: string; status?: string; note?: string }): Promise<void> {
  const result = await wordpressCCTFetch<any>("medicine_log", {
    method: "POST",
    body: {
      medicine_or_checkin: "checkin",
      logged_at: new Date().toISOString(),
      status: log.status || "taken",
      note: log.note || "",
    },
  });
  const newLogId = result?._ID || result?.id || result?.item_id;
  if (newLogId) {
    await wordpressFetch(`jet-rel/${REL_MEDICINE_LOG}`, {
      method: "POST",
      body: { parent_id: Number(log.medicine_id), child_id: Number(newLogId), context: "child", store_items_type: "update" },
    });
  }
}

// ─── Medicines ──────────────────────────────────────────────
// CCT slug: medicine | linked to WP user via JetEngine relation 83
export async function fetchMedicinesWordPress(caredOneId: string): Promise<any[]> {
  try {
    // caredOneId is a WP user ID (e.g. "wp-3" or "3") — extract numeric ID
    const userId = String(caredOneId).replace(/^wp-/, "");
    // Use JetEngine relation 83 to get medicines for this user
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_MEDICINE}/children/${userId}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const medIds = rels.map((r: any) => r.child_object_id).filter(Boolean);
    // Fetch each medicine CCT item
    const meds = await Promise.all(
      medIds.map(async (mid: string) => {
        try {
          const m = await wordpressCCTFetch<any>("medicine", { id: mid });
          if (!isMedicineType(m.medicine_or_checkin)) return null;
          return {
            id: String(m._ID || m.id || mid),
            user_id: caredOneId,
            medicine_or_checkin: "medicine",
            name: m.name || "Medicine",
            dosage: m.dosage || null,
            frequency: m.frequency || null,
            time_slot: normalizeTimeSlot(m.time_slot),
            note: m.note || m.notes || null,
            is_active: m.is_active !== false && m.is_active !== "no",
            created_at: m.cct_created || m.created_at,
          };
        } catch { return null; }
      })
    );
    return meds.filter(Boolean);
  } catch { return []; }
}

export async function createMedicineWordPress(med: { user_id: string; name: string; dosage?: string; frequency?: string; time_slot?: string[]; note?: string }): Promise<void> {
  // Create the medicine CCT item
  const result = await wordpressCCTFetch<any>("medicine", {
    method: "POST",
    body: {
      medicine_or_checkin: "medicine",
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      time_slot: serializeTimeSlot(med.time_slot || []),
      note: med.note || "",
      is_active: "yes",
    },
  });
  const newId = result?._ID || result?.id || result?.item_id;
  if (newId) {
    // Link medicine to user via JetEngine relation 83
    const userId = String(med.user_id).replace(/^wp-/, "");
    await wordpressFetch(`jet-rel/${REL_USER_MEDICINE}`, {
      method: "POST",
      body: { parent_id: Number(userId), child_id: Number(newId), context: "child", store_items_type: "update" },
    });
  }
}

export async function updateMedicineWordPress(id: string, updates: Record<string, any>): Promise<void> {
  await wordpressCCTFetch("medicine", {
    id,
    method: "PUT",
    body: {
      ...updates,
      time_slot: updates.time_slot !== undefined ? serializeTimeSlot(updates.time_slot) : undefined,
      note: updates.note !== undefined ? updates.note : updates.notes,
    },
  });
}

export async function deleteMedicineWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("medicine", { id, method: "DELETE" });
}

// ─── Medicine Logs ──────────────────────────────────────────
// CCT slug: medicine_log | linked to medicine via JetEngine relation 84
export async function fetchMedicineLogsWordPress(medicineId: string): Promise<any[]> {
  try {
    // Use JetEngine relation 84 to get logs for this medicine
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_MEDICINE_LOG}/children/${medicineId}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const logIds = rels.map((r: any) => r.child_object_id).filter(Boolean);
    const logs = await Promise.all(
      logIds.map(async (lid: string) => {
        try {
          const l = await wordpressCCTFetch<any>("medicine_log", { id: lid });
          if (!isMedicineType(l.medicine_or_checkin)) return null;
          return {
            id: String(l._ID || l.id || lid),
            medicine_id: medicineId,
            taken_at: l.logged_at || l.taken_at || l.cct_created || l.created_at,
            status: l.status || "taken",
            logged_by: l.cct_author_id ? String(l.cct_author_id) : null,
            note: l.note || l.notes || null,
            notes: l.note || l.notes || null,
            created_at: l.logged_at || l.cct_created || l.created_at,
          };
        } catch { return null; }
      })
    );
    return logs.filter(Boolean);
  } catch { return []; }
}

export async function fetchTodayMedicineLogsWordPress(caredOneId: string): Promise<any[]> {
  try {
    // First get user's medicines via relation 83
    const userId = String(caredOneId).replace(/^wp-/, "");
    const medRels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_MEDICINE}/children/${userId}`);
    if (!Array.isArray(medRels) || medRels.length === 0) return [];
    const medIds = medRels.map((r: any) => r.child_object_id).filter(Boolean);
    // Then get today's logs for each medicine via relation 84
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const allLogs: any[] = [];
    await Promise.all(
      medIds.map(async (mid: string) => {
        try {
          const logRels = await wordpressFetch<any[]>(`jet-rel/${REL_MEDICINE_LOG}/children/${mid}`);
          if (!Array.isArray(logRels)) return;
          for (const rel of logRels) {
            try {
              const l = await wordpressCCTFetch<any>("medicine_log", { id: rel.child_object_id });
              if (!isMedicineType(l.medicine_or_checkin)) continue;
              const createdAt = l.logged_at || l.cct_created || l.created_at;
              if (createdAt && new Date(createdAt) >= today) {
                allLogs.push({
                  id: String(l._ID || l.id || rel.child_object_id),
                  medicine_id: mid,
                  taken_at: l.logged_at || l.taken_at || createdAt,
                  status: l.status || "taken",
                  note: l.note || l.notes || null,
                  created_at: createdAt,
                });
              }
            } catch {}
          }
        } catch {}
      })
    );
    return allLogs;
  } catch { return []; }
}

export async function logMedicineWordPress(log: { medicine_id: string; status?: string; note?: string; user_id?: string }): Promise<void> {
  // Create the medicine_log CCT item
  const result = await wordpressCCTFetch<any>("medicine_log", {
    method: "POST",
    body: { medicine_or_checkin: "medicine", logged_at: new Date().toISOString(), status: log.status || "taken", note: log.note || "" },
  });
  const newLogId = result?._ID || result?.id || result?.item_id;
  if (newLogId) {
    // Link log to medicine via JetEngine relation 84
    await wordpressFetch(`jet-rel/${REL_MEDICINE_LOG}`, {
      method: "POST",
      body: { parent_id: Number(log.medicine_id), child_id: Number(newLogId), context: "child", store_items_type: "update" },
    });
  }
}

// ─── Health Vitals ──────────────────────────────────────────
// CCT slug: health_vital | linked via JetEngine relation 96
export async function fetchHealthVitalsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const vitals = await fetchRelatedCctChildren(REL_USER_HEALTH_VITAL, caredOneId, "health_vital");
    if (!Array.isArray(vitals)) return [];
    return vitals.map((v: any) => ({
      id: String(v._ID || v.id || ""),
      user_id: caredOneId,
      vital_type: v.vital_type || null,
      value: v.value ?? null,
      unit: v.unit || null,
      notes: v.notes || null,
      recorded_at: v.recorded_at || v.created_at,
      created_at: v.cct_created || v.created_at,
    }));
  } catch { return []; }
}

export async function createHealthVitalWordPress(vital: { user_id: string; vital_type: string; value: number; unit?: string; notes?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>("health_vital", {
    method: "POST",
    body: { vital_type: vital.vital_type, value: vital.value, unit: vital.unit, notes: vital.notes || "", recorded_at: new Date().toISOString() },
  });
  const parentId = normalizeWpObjectId(vital.user_id);
  const childId = normalizeWpObjectId(created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_HEALTH_VITAL}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

// ─── Care Tips ──────────────────────────────────────────────
// CCT slug: care_tip | linked via JetEngine relation 88
export async function fetchCareTipsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const tips = await fetchRelatedCctChildren(REL_USER_CARE_TIP, caredOneId, "care_tip");
    if (!Array.isArray(tips)) return [];
    return tips.map((t: any) => ({
      id: String(t._ID || t.id || ""),
      user_id: caredOneId,
      title: t.title || null,
      content: t.content || null,
      category: t.category || null,
      is_important: t.is_important === true || t.is_important === "yes",
      created_at: t.cct_created || t.created_at,
      updated_at: t.cct_modified || t.updated_at || t.cct_created || t.created_at,
    }));
  } catch { return []; }
}

export async function createCareTipWordPress(tip: { user_id: string; title?: string; content: string; category?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>("care_tip", {
    method: "POST",
    body: { title: tip.title || tip.content.substring(0, 50), content: tip.content, category: tip.category },
  });
  const parentId = normalizeWpObjectId(tip.user_id);
  const childId = normalizeWpObjectId(created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_CARE_TIP}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateCareTipWordPress(id: string, updates: Record<string, any>): Promise<void> {
  await wordpressCCTFetch("care_tip", { id, method: "PUT", body: updates });
}

export async function deleteCareTipWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_tip", { id, method: "DELETE" });
}

// ─── Care Plans ─────────────────────────────────────────────
// CCT slug: care_plan | linked via JetEngine relation 97
export async function fetchCarePlansWordPress(caredOneId: string): Promise<any[]> {
  try {
    const plans = await fetchRelatedCctChildren(REL_USER_CARE_PLAN, caredOneId, "care_plan");
    if (!Array.isArray(plans)) return [];
    return plans.map((p: any) => ({
      id: String(p._ID || p.id || ""),
      user_id: caredOneId,
      title: p.title || null,
      description: p.description || null,
      status: p.status || "active",
      start_date: p.start_date || null,
      end_date: p.end_date || null,
      created_at: p.cct_created || p.created_at,
      updated_at: p.cct_modified || p.updated_at,
    }));
  } catch { return []; }
}

export async function createCarePlanWordPress(plan: { user_id: string; title: string; description?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>("care_plan", {
    method: "POST",
    body: { title: plan.title, description: plan.description || "", status: "active" },
  });
  const parentId = normalizeWpObjectId(plan.user_id);
  const childId = normalizeWpObjectId(created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_CARE_PLAN}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateCarePlanWordPress(id: string, updates: Record<string, any>): Promise<void> {
  await wordpressCCTFetch("care_plan", { id, method: "PUT", body: updates });
}

export async function deleteCarePlanWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_plan", { id, method: "DELETE" });
}

// ─── Care Plan Goals ────────────────────────────────────────
// CCT slug: care_plan_goal | linked via JetEngine relation 98
export async function fetchCarePlanGoalsWordPress(planId: string): Promise<any[]> {
  try {
    const goals = await fetchRelatedCctChildren(REL_CARE_PLAN_GOAL, planId, "care_plan_goal");
    if (!Array.isArray(goals)) return [];
    return goals.map((g: any) => ({
      id: String(g._ID || g.id || ""),
      care_plan_id: planId,
      title: g.title || null,
      description: g.description || null,
      status: g.status || "pending",
      target_date: g.target_date || null,
      created_at: g.cct_created || g.created_at,
    }));
  } catch { return []; }
}

export async function createCarePlanGoalWordPress(goal: { care_plan_id: string; title: string; description?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>("care_plan_goal", {
    method: "POST",
    body: { title: goal.title, description: goal.description || "", status: "pending" },
  });
  const parentId = normalizeWpObjectId(goal.care_plan_id);
  const childId = normalizeWpObjectId(created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_CARE_PLAN_GOAL}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateCarePlanGoalWordPress(id: string, updates: Record<string, any>): Promise<void> {
  await wordpressCCTFetch("care_plan_goal", { id, method: "PUT", body: updates });
}

// ─── Care Notes ─────────────────────────────────────────────
// CCT slug: care_note | linked via JetEngine relation 92
export async function fetchCareNotesWordPress(caredOneId: string): Promise<any[]> {
  try {
    const notes = await fetchRelatedCctChildren(REL_USER_CARE_NOTE, caredOneId, "care_note");
    if (!Array.isArray(notes)) return [];
    return notes.map((n: any) => ({
      id: String(n._ID || n.id || ""),
      user_id: caredOneId,
      title: n.title || null,
      content: n.content || null,
      category: n.category || null,
      author_id: n.author_id || null,
      created_at: n.cct_created || n.created_at,
      updated_at: n.cct_modified || n.updated_at || n.cct_created || n.created_at,
    }));
  } catch { return []; }
}

export async function createCareNoteWordPress(note: { user_id: string; title?: string; content: string; category?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>("care_note", {
    method: "POST",
    body: { title: note.title || note.content.substring(0, 50), content: note.content, category: note.category },
  });
  const parentId = normalizeWpObjectId(note.user_id);
  const childId = normalizeWpObjectId(created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_CARE_NOTE}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateCareNoteWordPress(id: string, updates: Record<string, any>): Promise<void> {
  await wordpressCCTFetch("care_note", { id, method: "PUT", body: updates });
}

export async function deleteCareNoteWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_note", { id, method: "DELETE" });
}

// ─── Emergency Contacts ─────────────────────────────────────
// CCT slug: emergency_contact | linked via JetEngine relation 63
export async function fetchEmergencyContactsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const contacts = await fetchRelatedCctChildren(REL_USER_EMERGENCY_CONTACT, caredOneId, "emergency_contact");
    if (!Array.isArray(contacts)) return [];
    return contacts.map((c: any) => ({
      id: String(c._ID || c.id || ""),
      user_id: caredOneId,
      name: c.name || null,
      phone: c.phone || null,
      email: c.email || null,
      relationship: c.relationship || null,
      is_primary: c.is_primary === true || c.is_primary === "yes",
      created_at: c.cct_created || c.created_at,
    }));
  } catch { return []; }
}

export async function createEmergencyContactWordPress(contact: { user_id: string; name: string; phone?: string; email?: string; relationship?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>("emergency_contact", {
    method: "POST",
    body: { name: contact.name, phone: contact.phone, email: contact.email, relationship: contact.relationship },
  });
  const parentId = normalizeWpObjectId(contact.user_id);
  const childId = normalizeWpObjectId(created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_EMERGENCY_CONTACT}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateEmergencyContactWordPress(id: string, updates: Record<string, any>): Promise<void> {
  await wordpressCCTFetch("emergency_contact", { id, method: "PUT", body: updates });
}

export async function deleteEmergencyContactWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("emergency_contact", { id, method: "DELETE" });
}

// ─── Activity Log ───────────────────────────────────────────
// CCT slug: activity_log | linked via JetEngine relation 94
export async function fetchActivityLogWordPress(caredOneId: string): Promise<any[]> {
  try {
    const logs = await fetchRelatedCctChildren(REL_USER_ACTIVITY_LOG, caredOneId, "activity_log");
    if (!Array.isArray(logs)) return [];
    return logs.map((l: any) => ({
      id: String(l._ID || l.id || ""),
      user_id: caredOneId,
      activity_type: l.activity_type || null,
      description: l.description || null,
      logged_by: l.logged_by ? String(l.logged_by) : null,
      created_at: l.cct_created || l.created_at,
    }));
  } catch { return []; }
}

export async function createActivityLogWordPress(log: { user_id: string; activity_type?: string; description?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>("activity_log", {
    method: "POST",
    body: { activity_type: log.activity_type, description: log.description || "" },
  });
  const parentId = normalizeWpObjectId(log.user_id);
  const childId = normalizeWpObjectId(created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_ACTIVITY_LOG}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function deleteActivityLogWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("activity_log", { id, method: "DELETE" });
}

// ─── Symptom Logs ───────────────────────────────────────────
// CCT: symptom logs stored via health_vital or activity_log CCT
export async function fetchSymptomLogsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const logs = await fetchRelatedCctChildren(REL_USER_HEALTH_VITAL, caredOneId, "health_vital");
    if (!Array.isArray(logs)) return [];
    return logs.filter((l: any) => (l.vital_type || "") === "symptom").map((l: any) => ({
      id: String(l._ID || l.id || ""),
      user_id: caredOneId,
      symptom: l.symptom || l.vital_type || null,
      severity: l.severity ?? l.value ?? null,
      notes: l.notes || null,
      recorded_at: l.recorded_at || l.created_at,
      created_at: l.cct_created || l.created_at,
    }));
  } catch { return []; }
}

export async function createSymptomLogWordPress(log: { user_id: string; symptom: string; severity?: number; notes?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>("health_vital", {
    method: "POST",
    body: { vital_type: "symptom", symptom: log.symptom, severity: log.severity, value: log.severity, notes: log.notes || "", recorded_at: new Date().toISOString() },
  });
  const parentId = normalizeWpObjectId(log.user_id);
  const childId = normalizeWpObjectId(created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_HEALTH_VITAL}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

// ─── Cared One Documents ────────────────────────────────────
// CCT slug: care_document | linked via JetEngine relation 95
export async function fetchCaredOneDocumentsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const docs = await fetchRelatedCctChildren(REL_USER_CARE_DOCUMENT, caredOneId, "care_document");
    if (!Array.isArray(docs)) return [];
    return docs.map((d: any) => ({
      id: String(d._ID || d.id || ""),
      user_id: caredOneId,
      title: d.title || null,
      description: d.description || null,
      file_url: d.file_url || null,
      document_type: d.document_type || null,
      created_at: d.cct_created || d.created_at,
      updated_at: d.cct_modified || d.updated_at || d.cct_created || d.created_at,
    }));
  } catch { return []; }
}

export async function createCaredOneDocumentWordPress(doc: { user_id: string; title: string; description?: string; file_url?: string; document_type?: string }): Promise<void> {
  const created = await wordpressCCTFetch<any>("care_document", {
    method: "POST",
    body: { title: doc.title, description: doc.description || "", file_url: doc.file_url, document_type: doc.document_type },
  });
  const parentId = normalizeWpObjectId(doc.user_id);
  const childId = normalizeWpObjectId(created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_USER_CARE_DOCUMENT}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateCaredOneDocumentWordPress(id: string, updates: Record<string, any>): Promise<void> {
  await wordpressCCTFetch("care_document", { id, method: "PUT", body: updates });
}

export async function deleteCaredOneDocumentWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_document", { id, method: "DELETE" });
}

// ─── Dementia Stage ─────────────────────────────────────────
export async function updateDementiaStageWordPress(caredOneId: string, stage: string): Promise<void> {
  const userId = String(caredOneId).replace(/^wp-/, "");
  await wordpressFetch(`wp/v2/users/${userId}`, {
    method: "PUT",
    body: { meta: { dementia_stage: stage } },
  });
}
