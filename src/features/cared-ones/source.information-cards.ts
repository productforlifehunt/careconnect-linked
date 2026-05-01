import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

// JetEngine relations (live)
const REL_USER_INFO_CARD = 126;          // 1:M users → cared_ones_informat
const REL_INFO_CARD_EMERGENCY = 127;     // 1:M cared_ones_informat → emergency_contact
const CCT_SLUG = "cared_ones_informat";

export interface InformationCard {
  id: string;
  cared_ones_name?: string;
  cared_ones_description?: string;
  cared_ones_information_card_name?: string;
  status?: "Draft" | "Active" | "Paused" | string;
  displays_location?: "Yes" | "No" | string;
  cct_author_id?: string | number;
  cct_created?: string;
}

function normalizeWpId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

export async function fetchInformationCardsWordPress(caredOneId: string): Promise<InformationCard[]> {
  const id = normalizeWpId(caredOneId);
  if (!id) return [];
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_INFO_CARD}/children/${id}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const items = await Promise.all(
      rels.map(async (rel: any) => {
        try {
          return await wordpressCCTFetch<any>(CCT_SLUG, { id: rel.child_object_id });
        } catch {
          return null;
        }
      })
    );
    return items.filter(Boolean) as InformationCard[];
  } catch {
    return [];
  }
}

export async function fetchInformationCardWordPress(cardId: string): Promise<InformationCard | null> {
  try {
    return (await wordpressCCTFetch<any>(CCT_SLUG, { id: normalizeWpId(cardId) })) as InformationCard;
  } catch {
    return null;
  }
}

export async function createInformationCardWordPress(input: {
  caredOneUserId: string;
  cared_ones_name?: string;
  cared_ones_description?: string;
  cared_ones_information_card_name: string;
  status?: "Draft" | "Active" | "Paused";
  displays_location?: "Yes" | "No";
}): Promise<InformationCard> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) throw new Error("Not authenticated");
  const parentId = normalizeWpId(input.caredOneUserId);
  if (!parentId) throw new Error("Invalid cared one");

  const created = await wordpressCCTFetch<any>(CCT_SLUG, {
    method: "POST",
    body: {
      cared_ones_name: input.cared_ones_name || "",
      cared_ones_description: input.cared_ones_description || "",
      cared_ones_information_card_name: input.cared_ones_information_card_name,
      status: input.status || "Draft",
      displays_location: input.displays_location || "No",
    },
  });

  const childId = created?._ID || created?.id;
  if (childId) {
    await wordpressFetch(`jet-rel/${REL_USER_INFO_CARD}`, {
      method: "POST",
      body: {
        parent_id: parentId,
        child_id: Number(childId),
        context: "child",
        store_items_type: "update",
      },
    });
  }
  return created as InformationCard;
}

export async function updateInformationCardWordPress(id: string, updates: Partial<InformationCard>): Promise<void> {
  await wordpressCCTFetch(CCT_SLUG, { id: normalizeWpId(id), method: "POST", body: updates });
}

export async function deleteInformationCardWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(CCT_SLUG, { id: normalizeWpId(id), method: "DELETE" });
}

// ── Linked emergency contacts (REL 127) ─────────────────
export async function fetchInformationCardContactIdsWordPress(cardId: string): Promise<string[]> {
  const id = normalizeWpId(cardId);
  if (!id) return [];
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_INFO_CARD_EMERGENCY}/children/${id}`);
    if (!Array.isArray(rels)) return [];
    return rels.map((r: any) => String(r.child_object_id));
  } catch {
    return [];
  }
}

export async function setInformationCardContactsWordPress(cardId: string, contactIds: string[]): Promise<void> {
  const parentId = normalizeWpId(cardId);
  if (!parentId) throw new Error("Invalid card");

  // Get current to compute diff
  const current = await fetchInformationCardContactIdsWordPress(cardId);
  const currentSet = new Set(current.map(String));
  const desiredSet = new Set(contactIds.map((c) => String(normalizeWpId(c))));

  // Add new ones
  const toAdd = [...desiredSet].filter((c) => !currentSet.has(c));
  for (const childId of toAdd) {
    await wordpressFetch(`jet-rel/${REL_INFO_CARD_EMERGENCY}`, {
      method: "POST",
      body: {
        parent_id: parentId,
        child_id: Number(childId),
        context: "child",
        store_items_type: "update",
      },
    });
  }

  // Remove ones no longer wanted
  const toRemove = [...currentSet].filter((c) => !desiredSet.has(c));
  for (const childId of toRemove) {
    try {
      await wordpressFetch(`jet-rel/${REL_INFO_CARD_EMERGENCY}/${parentId}/${childId}`, { method: "DELETE" });
    } catch {
      // ignore
    }
  }
}
