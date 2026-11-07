var e=`import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { T, R } from "@/integrations/wp-schema";

// JetEngine relations (live) — CCT 198 "Cared one's information card"
const REL_USER_INFO_CARD = R.caredOneInfoCards;          // REL 220: 1:M users → cared_one_info_card
const REL_INFO_CARD_EMERGENCY = R.infoCardEmergencyContacts;     // REL 221: 1:M cared_one_info_card → emergency contacts
const CCT_SLUG = T.infoCard.slug;

// Opaque field map (live verified). a55 cared one's name, a56 cared one's
// description, a57 card name, a58 status, a59 displays location,
// a60 public share starts at, a61 public share expires at, a62 share
// visibility, a621 visibility after public expires, a622 public share
// expires (Yes/No), a63 this sheet's own situation details.
const F = T.infoCard.f;


const STATUS_TO_CODE: Record<string, string> = { Draft: "b55", Active: "b56", Paused: "b57", draft: "b55", active: "b56", paused: "b57" };
const STATUS_FROM_CODE: Record<string, string> = { b55: "Draft", b56: "Active", b57: "Paused" };
const YESNO_TO_CODE: Record<string, string> = { Yes: "b55", No: "b56" };
const YESNO_FROM_CODE: Record<string, string> = { b55: "Yes", b56: "No" };
const VIS_TO_CODE: Record<string, string> = {
  "Visible to public": "b55",
  "Visible to the care group of the cared one": "b56",
  "Visible to caregivers of the cared one": "b57",
  "Visible to the care group of the cared one and the caregivers of the cared one": "b58",
};
const VIS_FROM_CODE: Record<string, string> = {
  b55: "Visible to public",
  b56: "Visible to the care group of the cared one",
  b57: "Visible to caregivers of the cared one",
  b58: "Visible to the care group of the cared one and the caregivers of the cared one",
};

const AFTER_EXPIRY_DEFAULT = "Visible to the care group of the cared one and the caregivers of the cared one";

/** Parse a JetEngine datetime-local value; legacy non-date text counts as empty. */
export function parseCardDate(v: unknown): number | null {
  const s = String(v ?? "").trim();
  if (!/^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}/.test(s)) return null;
  const t = new Date(s.replace(" ", "T")).getTime();
  return Number.isFinite(t) ? t : null;
}

/** Datetime-local string ("YYYY-MM-DDTHH:mm") for a local time. */
export function toDatetimeLocal(ms: number = Date.now()): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return \`\${d.getFullYear()}-\${p(d.getMonth() + 1)}-\${p(d.getDate())}T\${p(d.getHours())}:\${p(d.getMinutes())}\`;
}

/**
 * Start/expiry only apply to public cards. Before the start, or once an
 * expiring public share has passed its end time, the card falls back to a621
 * (default: care group + caregivers). The author can always see the card.
 */
export function effectiveVisibility(card: InformationCard, now: number = Date.now()): string {
  const v = String(card.share_visibility || "");
  if (v !== "Visible to public") return v;
  const fallback = card.share_visibility_after_expiry || AFTER_EXPIRY_DEFAULT;
  const start = parseCardDate(card.public_share_starts_at);
  if (start !== null && now < start) return fallback;
  if (card.public_share_expires === "Yes") {
    const end = parseCardDate(card.public_share_expires_at);
    if (end !== null && now >= end) return fallback;
  }
  return v;
}

/** True when the stored a62 is public but the public window has ended. */
export function publicShareHasExpired(card: InformationCard, now: number = Date.now()): boolean {
  if (card.share_visibility !== "Visible to public" || card.public_share_expires !== "Yes") return false;
  const end = parseCardDate(card.public_share_expires_at);
  return end !== null && now >= end;
}

/** Persist the automatic switch a62 := a621 once a public share expires. */
async function applyExpiry(card: InformationCard): Promise<InformationCard> {
  if (!publicShareHasExpired(card)) return card;
  const next = card.share_visibility_after_expiry || AFTER_EXPIRY_DEFAULT;
  if (getStoredWPUser()?.user_id) {
    try { await updateInformationCardWordPress(card.id, { share_visibility: next }); } catch { /* viewer may lack write rights; read-time check still protects */ }
  }
  return { ...card, share_visibility: next };
}

function decodeCard(raw: any): InformationCard {
  const status = STATUS_FROM_CODE[String(raw[F.STATUS])];
  const displaysLocation = YESNO_FROM_CODE[String(raw[F.DISPLAYS_LOCATION])];
  const visibility = VIS_FROM_CODE[String(raw[F.SHARE_VISIBILITY])];
  if (!status || !displaysLocation || !visibility) throw new Error(\`Information card \${raw._ID || raw.id} contains an invalid option code\`);
  return {
    id: String(raw._ID || raw.id),
    cared_ones_name: raw[F.CARED_ONE_S_NAME] || "",
    cared_ones_description: raw[F.CARED_ONE_S_DESCRIPTION] || "",
    cared_ones_information_card_name: raw[F.CARED_ONE_S_INFORMATION_CARD_NAME] || "",
    cared_ones_information_card_description: raw[F.CARED_ONE_S_INFORMATION_CARD_DESCRIPTION] || "",

    status,
    displays_location: displaysLocation,
    public_share_starts_at: parseCardDate(raw[F.PUBLIC_SHARE_STARTS_AT]) !== null ? String(raw[F.PUBLIC_SHARE_STARTS_AT]) : "",
    public_share_expires_at: parseCardDate(raw[F.PUBLIC_SHARE_EXPIRES_AT]) !== null ? String(raw[F.PUBLIC_SHARE_EXPIRES_AT]) : "",
    public_share_expires: YESNO_FROM_CODE[String(raw[F.PUBLIC_SHARE_EXPIRES])] || "No",
    share_visibility: visibility,
    share_visibility_after_expiry: VIS_FROM_CODE[String(raw[F.SHARE_VISIBILITY_AFTER_PUBLIC_EXPIRES])] || "",
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
    if (!code) throw new Error(\`Invalid information-card status: \${u.status}\`);
    b[F.STATUS] = code;
  }
  if (u.displays_location !== undefined) {
    const code = YESNO_TO_CODE[String(u.displays_location)];
    if (!code) throw new Error(\`Invalid displays-location value: \${u.displays_location}\`);
    b[F.DISPLAYS_LOCATION] = code;
  }
  if (u.public_share_starts_at !== undefined) b[F.PUBLIC_SHARE_STARTS_AT] = u.public_share_starts_at || "";
  if (u.public_share_expires_at !== undefined) b[F.PUBLIC_SHARE_EXPIRES_AT] = u.public_share_expires_at || "";
  if (u.public_share_expires !== undefined) {
    const code = YESNO_TO_CODE[String(u.public_share_expires)];
    if (!code) throw new Error(\`Invalid public-share-expires value: \${u.public_share_expires}\`);
    b[F.PUBLIC_SHARE_EXPIRES] = code;
  }
  if (u.share_visibility_after_expiry !== undefined) {
    if (!u.share_visibility_after_expiry) b[F.SHARE_VISIBILITY_AFTER_PUBLIC_EXPIRES] = "";
    else {
      const code = VIS_TO_CODE[String(u.share_visibility_after_expiry)];
      if (!code || code === "b55") throw new Error(\`Invalid after-expiry visibility: \${u.share_visibility_after_expiry}\`);
      b[F.SHARE_VISIBILITY_AFTER_PUBLIC_EXPIRES] = code;
    }
  }
  if (u.share_visibility !== undefined) {
    const code = VIS_TO_CODE[String(u.share_visibility)];
    if (!code) throw new Error(\`Invalid information-card visibility: \${u.share_visibility}\`);
    b[F.SHARE_VISIBILITY] = code;
  }
  return b;
}

export type ShareVisibility =
  | "Visible to public"
  | "Visible to the care group of the cared one"
  | "Visible to caregivers of the cared one"
  | "Visible to the care group of the cared one and the caregivers of the cared one";

export interface InformationCard {
  id: string;
  cared_ones_name?: string | undefined;
  cared_ones_description?: string | undefined;
  cared_ones_information_card_name?: string | undefined;
  /** a63 — what this specific sheet is for (e.g. "cover 7–9am, meds at 8"). */
  cared_ones_information_card_description?: string | undefined;
  status?: "Draft" | "Active" | "Paused" | string | undefined;
  displays_location?: "Yes" | "No" | string | undefined;
  /** a60 — when the public share begins (datetime-local). */
  public_share_starts_at?: string | undefined;
  /** a61 — when the public share ends (only used when a622 = Yes). */
  public_share_expires_at?: string | undefined;
  /** a622 — whether the public share expires. */
  public_share_expires?: "Yes" | "No" | string | undefined;
  share_visibility?: ShareVisibility | string | undefined;
  /** a621 — visibility applied automatically once the public share expires. */
  share_visibility_after_expiry?: ShareVisibility | string | undefined;
  cct_author_id?: string | number | undefined;
  cct_created?: string | undefined;
}

function normalizeWpId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

export async function fetchInformationCardsWordPress(caredOneId: string): Promise<InformationCard[]> {
  const id = normalizeWpId(caredOneId);
  if (!id) return [];
  const rels = await wordpressFetch<any[]>(\`jet-rel/\${REL_USER_INFO_CARD}/children/\${id}\`);
  if (!Array.isArray(rels)) throw new Error(\`Relation \${REL_USER_INFO_CARD} returned an invalid response\`);
  const rows = await Promise.all(rels.map(async (rel: any) => {
    try {
      const raw = await wordpressCCTFetch<any>(CCT_SLUG, { id: rel.child_object_id });
      return raw && typeof raw === "object" ? await applyExpiry(decodeCard(raw)) : null;
    } catch {
      // One stale relation must not hide every valid care info sheet.
      return null;
    }
  }));
  return rows.filter((card): card is InformationCard => card !== null);
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
    const rels = await wordpressFetch<any[]>(\`jet-rel/\${REL_USER_INFO_CARD}/parents/\${id}\`);
    if (!Array.isArray(rels) || rels.length === 0) return null;
    return String(rels[0].parent_object_id);
  } catch {
    return null;
  }
}


/** Thrown by the share viewer when the reader may not see a non-public card. */
export class ShareAccessError extends Error {
  constructor(public reason: "login" | "forbidden") { super(reason); }
}

const REL_CAREGIVER_CARED_ONE = R.userCaredOnes;   // REL 219 caregiver → cared one
const REL_GROUP_MEMBER = R.careGroupMembers;        // REL 223 care group → users

async function viewerIsCaregiverOf(viewerId: number, caredOneId: number): Promise<boolean> {
  const { decodeRel219Status } = await import("@/features/cared-ones/rel219-meta");
  const rels = await wordpressFetch<any[]>(\`jet-rel/\${REL_CAREGIVER_CARED_ONE}/children/\${viewerId}\`);
  return Array.isArray(rels) && rels.some((r: any) =>
    Number(r.child_object_id) === caredOneId && decodeRel219Status(r?.meta) === "accepted");
}

async function viewerSharesGroupWith(viewerId: number, caredOneId: number): Promise<boolean> {
  const groups = await wordpressFetch<any[]>(\`jet-rel/\${REL_GROUP_MEMBER}/parents/\${viewerId}\`);
  if (!Array.isArray(groups)) return false;
  for (const g of groups) {
    const members = await wordpressFetch<any[]>(\`jet-rel/\${REL_GROUP_MEMBER}/children/\${Number(g.parent_object_id)}\`);
    if (Array.isArray(members) && members.some((m: any) => Number(m.child_object_id) === caredOneId)) return true;
  }
  return false;
}

/** Fixed card-ID link. Always check the card's current visibility. */
export async function fetchSharedInformationCardWordPress(cardId: string): Promise<InformationCard | null> {
  if (!/^\\d+$/.test(cardId) || !normalizeWpId(cardId)) return null;
  const stored = await fetchInformationCardWordPress(cardId);
  if (!stored) return null;
  const card = await applyExpiry(stored);
  const v = effectiveVisibility(card);
  if (v === "Visible to public") return card;

  const viewer = Number(getStoredWPUser()?.user_id || 0);
  if (!viewer) throw new ShareAccessError("login");
  if (Number(card.cct_author_id) === viewer) return card;
  const caredOne = Number(await fetchInformationCardCaredOneIdWordPress(card.id) || 0);
  if (!caredOne) throw new ShareAccessError("forbidden");

  const groupOk = v === "Visible to the care group of the cared one" || v === "Visible to the care group of the cared one and the caregivers of the cared one";
  const caregiverOk = v === "Visible to caregivers of the cared one" || v === "Visible to the care group of the cared one and the caregivers of the cared one";
  if (caregiverOk && await viewerIsCaregiverOf(viewer, caredOne)) return card;
  if (groupOk && await viewerSharesGroupWith(viewer, caredOne)) return card;
  throw new ShareAccessError("forbidden");
}

export async function createInformationCardWordPress(input: {
  caredOneUserId: string;
  cared_ones_name?: string | undefined;
  cared_ones_description?: string | undefined;
  cared_ones_information_card_name: string;
  cared_ones_information_card_description?: string | undefined;
  status?: "Draft" | "Active" | "Paused" | undefined;
  displays_location?: "Yes" | "No" | undefined;
  share_visibility?: ShareVisibility | undefined;
  public_share_starts_at?: string | undefined;
  public_share_expires_at?: string | undefined;
  public_share_expires?: "Yes" | "No" | undefined;
  share_visibility_after_expiry?: ShareVisibility | string | undefined;
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
    share_visibility: input.share_visibility || "Visible to caregivers of the cared one",
    public_share_starts_at: input.public_share_starts_at || toDatetimeLocal(),
    public_share_expires: input.public_share_expires || "No",
    public_share_expires_at: input.public_share_expires === "Yes" ? input.public_share_expires_at || "" : "",
    share_visibility_after_expiry: input.public_share_expires === "Yes" ? input.share_visibility_after_expiry || AFTER_EXPIRY_DEFAULT : "",
  });
  const created = await wordpressCCTFetch<any>(CCT_SLUG, { method: "POST", body });

  const childId = created?.item_id || created?._ID || created?.id;
  if (!childId) throw new Error("Information card was created without an item ID");
  await wordpressFetch(\`jet-rel/\${REL_USER_INFO_CARD}\`, {
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

// ── Linked emergency contacts (REL 221) ─────────────────
export async function fetchInformationCardContactIdsWordPress(cardId: string): Promise<string[]> {
  const id = normalizeWpId(cardId);
  if (!id) return [];
  try {
    const rels = await wordpressFetch<any[]>(\`jet-rel/\${REL_INFO_CARD_EMERGENCY}/children/\${id}\`);
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
    await wordpressFetch(\`jet-rel/\${REL_INFO_CARD_EMERGENCY}\`, {
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
    await wordpressFetch(\`jet-rel/\${REL_INFO_CARD_EMERGENCY}\`, { method: "POST", body: { parent_id: parentId, child_id: Number(childId), context: "child", store_items_type: "disconnect" } });
  }
}
`;export{e as default};