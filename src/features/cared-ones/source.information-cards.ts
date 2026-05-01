import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

// JetEngine relations (live) — CCT 125 "Cared one's information card"
const REL_USER_INFO_CARD = 126;          // 1:M users → cared_ones_informat
const REL_INFO_CARD_EMERGENCY = 127;     // 1:M cared_ones_informat → emergency_contact
const CCT_SLUG = "cared_ones_informat";

export type ShareVisibility =
  | "Visible to public"
  | "Visible to the care group of the cared one"
  | "Visible to caregivers of the cared one"
  | "Visible to author";

export interface InformationCard {
  id: string;
  cared_ones_name?: string;
  cared_ones_description?: string;
  cared_ones_information_card_name?: string;
  status?: "Draft" | "Active" | "Paused" | string;
  displays_location?: "Yes" | "No" | string;
  share_token?: string;
  share_expires_at?: string;
  share_visibility?: ShareVisibility | string;
  cct_author_id?: string | number;
  cct_created?: string;
}

function normalizeWpId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

function generateShareToken(): string {
  // 32-char URL-safe random token
  const bytes = new Uint8Array(24);
  (globalThis.crypto || (globalThis as any).msCrypto).getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

/** Public lookup by share token. Used by /share/card/:token public viewer. */
export async function fetchInformationCardByShareTokenWordPress(token: string): Promise<InformationCard | null> {
  if (!token) return null;
  try {
    // JetEngine CCT REST supports filter via meta query: ?meta_query[]...; simplest is full list + find
    const list = await wordpressCCTFetch<any[]>(CCT_SLUG, { query: { per_page: 100, share_token: token } });
    const items = Array.isArray(list) ? list : [];
    const card = items.find((c) => String(c.share_token || "") === token) || null;
    if (!card) return null;
    // Honor expiry
    if (card.share_expires_at) {
      const expires = new Date(String(card.share_expires_at).replace(" ", "T"));
      if (!Number.isNaN(expires.getTime()) && expires.getTime() < Date.now()) return null;
    }
    // Public visibility only (other levels require authenticated checks server-side later)
    if (card.share_visibility && card.share_visibility !== "Visible to public") return null;
    return card as InformationCard;
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
  share_visibility?: ShareVisibility;
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
      share_visibility: input.share_visibility || "Visible to author",
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

/**
 * Enable sharing on a card: ensures a share_token exists, sets visibility + optional expiry.
 * Returns the public URL.
 */
export async function enableInformationCardShareWordPress(
  cardId: string,
  opts: { visibility: ShareVisibility; expiresAt?: string | null; existingToken?: string }
): Promise<{ token: string; url: string; expiresAt?: string | null }> {
  const token = opts.existingToken && opts.existingToken.length > 0 ? opts.existingToken : generateShareToken();
  await updateInformationCardWordPress(cardId, {
    share_token: token,
    share_visibility: opts.visibility,
    share_expires_at: opts.expiresAt || "",
  });
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return { token, url: `${origin}/share/card/${token}`, expiresAt: opts.expiresAt || null };
}

/** Revoke sharing by clearing the token. */
export async function revokeInformationCardShareWordPress(cardId: string): Promise<void> {
  await updateInformationCardWordPress(cardId, {
    share_token: "",
    share_expires_at: "",
    share_visibility: "Visible to author",
  });
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

  const current = await fetchInformationCardContactIdsWordPress(cardId);
  const currentSet = new Set(current.map(String));
  const desiredSet = new Set(contactIds.map((c) => String(normalizeWpId(c))));

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

  const toRemove = [...currentSet].filter((c) => !desiredSet.has(c));
  for (const childId of toRemove) {
    try {
      await wordpressFetch(`jet-rel/${REL_INFO_CARD_EMERGENCY}/${parentId}/${childId}`, { method: "DELETE" });
    } catch {
      // ignore
    }
  }
}
