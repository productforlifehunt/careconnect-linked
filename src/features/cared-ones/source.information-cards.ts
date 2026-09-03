import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { T, R } from "@/integrations/wp-schema";

// JetEngine relations (live) — CCT 198 "Cared one's information card"
const REL_USER_INFO_CARD = R.caredOneInfoCards;          // REL 220: 1:M users → cared_one_info_card
const REL_INFO_CARD_EMERGENCY = R.infoCardEmergencyContacts;     // REL 221: 1:M cared_one_info_card → emergency contacts
const CCT_SLUG = T.infoCard.slug;

// Opaque field map (live verified). a55 cared one's name, a56 cared one's
// description, a57 card name, a58 status, a59 displays location,
// a60 share token, a61 share expires at, a62 share visibility,
// a63 this sheet's own situation details.
const F = T.infoCard.f;


const STATUS_TO_CODE: Record<string, string> = { Draft: "b55", Active: "b56", Paused: "b57", draft: "b55", active: "b56", paused: "b57" };
const STATUS_FROM_CODE: Record<string, string> = { b55: "Draft", b56: "Active", b57: "Paused" };
const YESNO_TO_CODE: Record<string, string> = { Yes: "b55", No: "b56" };
const YESNO_FROM_CODE: Record<string, string> = { b55: "Yes", b56: "No" };
const VIS_TO_CODE: Record<string, string> = {
  "Visible to public": "b55",
  "Visible to the care group of the cared one": "b56",
  "Visible to caregivers of the cared one": "b57",
  "Visible to author": "b58",
};
const VIS_FROM_CODE: Record<string, string> = {
  b55: "Visible to public",
  b56: "Visible to the care group of the cared one",
  b57: "Visible to caregivers of the cared one",
  b58: "Visible to author",
};

function decodeCard(raw: any): InformationCard {
  const status = STATUS_FROM_CODE[String(raw[F.STATUS])];
  const displaysLocation = YESNO_FROM_CODE[String(raw[F.DISPLAYS_LOCATION])];
  const visibility = VIS_FROM_CODE[String(raw[F.SHARE_VISIBILITY])];
  if (!status || !displaysLocation || !visibility) throw new Error(`Information card ${raw._ID || raw.id} contains an invalid option code`);
  return {
    id: String(raw._ID || raw.id),
    cared_ones_name: raw[F.CARED_ONE_S_NAME] || "",
    cared_ones_description: raw[F.CARED_ONE_S_DESCRIPTION] || "",
    cared_ones_information_card_name: raw[F.CARED_ONE_S_INFORMATION_CARD_NAME] || "",
    cared_ones_information_card_description: raw[F.CARED_ONE_S_INFORMATION_CARD_DESCRIPTION] || "",

    status,
    displays_location: displaysLocation,
    share_token: raw[F.SHARE_TOKEN] || "",
    share_expires_at: raw[F.SHARE_EXPIRES_AT] || "",
    share_visibility: visibility,
    cct_author_id: raw.cct_author_id,
    cct_created: raw.cct_created,
  };
}

function encodeCardUpdates(u: Partial<InformationCard>): Record<string, string> {
  const b: Record<string, string> = {};
  if (u.cared_ones_name !== undefined) b[F.CARED_ONE_S_NAME] = u.cared_ones_name || "";
  if (u.cared_ones_description !== undefined) b[F.CARED_ONE_S_DESCRIPTION] = u.cared_ones_description || "";
  if (u.cared_ones_information_card_name !== undefined) b[F.CARED_ONE_S_INFORMATION_CARD_NAME] = u.cared_ones_information_card_name || "";
  if (u.cared_ones_information_card_description !== undefined) b[F.CARED_ONE_S_INFORMATION_CARD_DESCRIPTION] = u.cared_ones_information_card_description || "";
  if (u.status !== undefined) {
    const code = STATUS_TO_CODE[String(u.status)];
    if (!code) throw new Error(`Invalid information-card status: ${u.status}`);
    b[F.STATUS] = code;
  }
  if (u.displays_location !== undefined) {
    const code = YESNO_TO_CODE[String(u.displays_location)];
    if (!code) throw new Error(`Invalid displays-location value: ${u.displays_location}`);
    b[F.DISPLAYS_LOCATION] = code;
  }
  if (u.share_token !== undefined) b[F.SHARE_TOKEN] = u.share_token || "";
  if (u.share_expires_at !== undefined) b[F.SHARE_EXPIRES_AT] = u.share_expires_at || "";
  if (u.share_visibility !== undefined) {
    const code = VIS_TO_CODE[String(u.share_visibility)];
    if (!code) throw new Error(`Invalid information-card visibility: ${u.share_visibility}`);
    b[F.SHARE_VISIBILITY] = code;
  }
  return b;
}

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
  /** a63 — what this specific sheet is for (e.g. "cover 7–9am, meds at 8"). */
  cared_ones_information_card_description?: string;
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
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_INFO_CARD}/children/${id}`);
  if (!Array.isArray(rels)) throw new Error(`Relation ${REL_USER_INFO_CARD} returned an invalid response`);
  const rows = await Promise.all(rels.map((rel: any) => wordpressCCTFetch<any>(CCT_SLUG, { id: rel.child_object_id })));
  // A relation row can point at a sheet that was already deleted; JetEngine
  // answers `false` for it. Skip those rather than dropping the whole list.
  return rows.filter((raw: any) => raw && typeof raw === "object").map(decodeCard);
}


export async function fetchInformationCardWordPress(cardId: string): Promise<InformationCard | null> {
  const raw = await wordpressCCTFetch<any>(CCT_SLUG, { id: normalizeWpId(cardId) });
  return raw && typeof raw === "object" ? decodeCard(raw) : null;
}


/** REL 220 parent = the cared one (WP user) this card belongs to. */
export async function fetchInformationCardCaredOneIdWordPress(cardId: string): Promise<string | null> {
  const id = normalizeWpId(cardId);
  if (!id) return null;
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_INFO_CARD}/parents/${id}`);
    if (!Array.isArray(rels) || rels.length === 0) return null;
    return String(rels[0].parent_object_id);
  } catch {
    return null;
  }
}


/** Public lookup by share token. Used by /share/card/:token public viewer. */
export async function fetchInformationCardByShareTokenWordPress(token: string): Promise<InformationCard | null> {
  if (!token) return null;
  try {
    // JetEngine CCT REST: filter by opaque field code for share token (a60).
    const list = await wordpressCCTFetch<any[]>(CCT_SLUG, { params: { per_page: 100, [F.SHARE_TOKEN]: token } });
    const items = Array.isArray(list) ? list : [];
    const raw = items.find((c) => String(c[F.SHARE_TOKEN] || "") === token) || null;
    if (!raw) return null;
    const card = decodeCard(raw);
    if (card.share_expires_at) {
      const expires = new Date(String(card.share_expires_at).replace(" ", "T"));
      if (!Number.isNaN(expires.getTime()) && expires.getTime() < Date.now()) return null;
    }
    // Public visibility only at this anonymous endpoint.
    if (card.share_visibility !== "Visible to public") return null;
    return card;
  } catch {
    return null;
  }
}

export async function createInformationCardWordPress(input: {
  caredOneUserId: string;
  cared_ones_name?: string;
  cared_ones_description?: string;
  cared_ones_information_card_name: string;
  cared_ones_information_card_description?: string;
  status?: "Draft" | "Active" | "Paused";
  displays_location?: "Yes" | "No";
  share_visibility?: ShareVisibility;
}): Promise<InformationCard> {
  const stored = getStoredWPUser();
  if (!stored?.user_id) throw new Error("Not authenticated");
  const parentId = normalizeWpId(input.caredOneUserId);
  if (!parentId) throw new Error("Invalid cared one");

  const body = encodeCardUpdates({
    cared_ones_name: input.cared_ones_name || "",
    cared_ones_description: input.cared_ones_description || "",
    cared_ones_information_card_name: input.cared_ones_information_card_name,
    cared_ones_information_card_description: input.cared_ones_information_card_description || "",
    status: input.status || "Draft",
    displays_location: input.displays_location || "No",
    share_visibility: input.share_visibility || "Visible to author",
  });
  const created = await wordpressCCTFetch<any>(CCT_SLUG, { method: "POST", body });

  const childId = created?.item_id || created?._ID || created?.id;
  if (!childId) throw new Error("Information card was created without an item ID");
  await wordpressFetch(`jet-rel/${REL_USER_INFO_CARD}`, {
      method: "POST",
      body: {
        parent_id: parentId,
        child_id: Number(childId),
        context: "child",
        store_items_type: "update",
      },
  });
  const storedCard = await wordpressCCTFetch<any>(CCT_SLUG, { id: Number(childId) });
  return decodeCard(storedCard);
}

export async function updateInformationCardWordPress(id: string, updates: Partial<InformationCard>): Promise<void> {
  const body = encodeCardUpdates(updates);
  await wordpressCCTFetch(CCT_SLUG, { id: normalizeWpId(id), method: "PUT", body });
}

export async function deleteInformationCardWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(CCT_SLUG, { id: normalizeWpId(id), method: "DELETE" });
}

/**
 * Enable sharing on a care info sheet: ensures a share_token exists, sets visibility + optional expiry.
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

// ── Linked emergency contacts (REL 221) ─────────────────
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
    await wordpressFetch(`jet-rel/${REL_INFO_CARD_EMERGENCY}`, { method: "POST", body: { parent_id: parentId, child_id: Number(childId), context: "child", store_items_type: "disconnect" } });
  }
}
