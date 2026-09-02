/**
 * Opaque-code meta encoders / decoders for the two care-group membership
 * relations. Every code below is read from the generated schema, which is built
 * from the data dictionary — the ONLY source of truth. Nothing is hardcoded.
 *
 *  REL 223 — 199. Care Group → Users (Many to Many)
 *    a55 care group's member display name          Text
 *    a56 care group's member types                 Radio { nothing special | owner | admin }
 *    a57 care group's member roles                 Radio { nothing special | cared one }
 *    a58 care group's member invitation status      Radio { accepted | pending | declined }
 *
 *  REL 225 — 201. Care group's private member group → Users (Many to Many)
 *    a55 private member group member types          Radio { nothing special | owner | admin }
 *    (invitation status is deprecated by the dictionary — subgroup members are
 *     always accepted, so nothing else is written here.)
 */
import { WP } from "@/integrations/wp-schema";

type RelDef = {
  f: Readonly<Record<string, string>>;
  opt: Readonly<Record<string, Readonly<Record<string, string>>>>;
};

const R223 = WP.rel["223"] as unknown as RelDef;
const R225 = WP.rel["225"] as unknown as RelDef;

// ─── REL 223 field codes ──────────────────────────────────────
const F223 = {
  displayName: R223.f.CARE_GROUP_S_MEMBER_DISPLAY_NAME,
  types: R223.f.CARE_GROUP_S_MEMBER_TYPES,
  roles: R223.f.CARE_GROUP_S_MEMBER_ROLES,
  status: R223.f.CARE_GROUP_S_MEMBER_INVITATION_STATUS,
} as const;

// ─── REL 225 field codes ──────────────────────────────────────
const F225 = {
  types: R225.f.CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_TYPES,
} as const;

// ─── Option codes (dictionary-driven) ─────────────────────────
const TYPE_OPT = R223.opt.CARE_GROUP_S_MEMBER_TYPES;
const ROLE_OPT = R223.opt.CARE_GROUP_S_MEMBER_ROLES;
const STATUS_OPT = R223.opt.CARE_GROUP_S_MEMBER_INVITATION_STATUS;
const SUB_TYPE_OPT = R225.opt.CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_TYPES;

export type MemberType = "nothing special" | "owner" | "admin";
export type MemberRole = "nothing special" | "cared one";
export type InvitationStatus = "accepted" | "pending" | "declined";

/** label → code, accepting a few friendly synonyms used across the UI. */
export const MEMBER_TYPE_CODE: Record<string, string> = {
  "nothing special": TYPE_OPT.NOTHING_SPECIAL,
  nothing: TYPE_OPT.NOTHING_SPECIAL,
  member: TYPE_OPT.NOTHING_SPECIAL,
  owner: TYPE_OPT.OWNER,
  admin: TYPE_OPT.ADMIN,
};
export const MEMBER_TYPE_LABEL: Record<string, string> = {
  [TYPE_OPT.NOTHING_SPECIAL]: "nothing special",
  [TYPE_OPT.OWNER]: "owner",
  [TYPE_OPT.ADMIN]: "admin",
};
export const MEMBER_ROLE_CODE: Record<string, string> = {
  "nothing special": ROLE_OPT.NOTHING_SPECIAL,
  nothing: ROLE_OPT.NOTHING_SPECIAL,
  "cared one": ROLE_OPT.CARED_ONE,
  cared_one: ROLE_OPT.CARED_ONE,
  "cared-one": ROLE_OPT.CARED_ONE,
};
export const MEMBER_ROLE_LABEL: Record<string, string> = {
  [ROLE_OPT.NOTHING_SPECIAL]: "nothing special",
  [ROLE_OPT.CARED_ONE]: "cared one",
};
export const INVITATION_STATUS_CODE: Record<string, string> = {
  accepted: STATUS_OPT.ACCEPTED,
  active: STATUS_OPT.ACCEPTED,
  pending: STATUS_OPT.PENDING,
  invited: STATUS_OPT.PENDING,
  declined: STATUS_OPT.DECLINED,
  rejected: STATUS_OPT.DECLINED,
};
export const INVITATION_STATUS_LABEL: Record<string, string> = {
  [STATUS_OPT.ACCEPTED]: "accepted",
  [STATUS_OPT.PENDING]: "pending",
  [STATUS_OPT.DECLINED]: "declined",
};

const SUB_TYPE_CODE: Record<string, string> = {
  "nothing special": SUB_TYPE_OPT.NOTHING_SPECIAL,
  nothing: SUB_TYPE_OPT.NOTHING_SPECIAL,
  member: SUB_TYPE_OPT.NOTHING_SPECIAL,
  owner: SUB_TYPE_OPT.OWNER,
  admin: SUB_TYPE_OPT.ADMIN,
};
const SUB_TYPE_LABEL: Record<string, string> = {
  [SUB_TYPE_OPT.NOTHING_SPECIAL]: "nothing special",
  [SUB_TYPE_OPT.OWNER]: "owner",
  [SUB_TYPE_OPT.ADMIN]: "admin",
};

// ─── Back-compat aliases (older imports) ──────────────────────
export const REL72_TYPE_CODE = MEMBER_TYPE_CODE;
export const REL72_TYPE_LABEL = MEMBER_TYPE_LABEL;
export const REL72_ROLE_CODE = MEMBER_ROLE_CODE;
export const REL72_ROLE_LABEL = MEMBER_ROLE_LABEL;
export const REL72_STATUS_CODE = INVITATION_STATUS_CODE;
export const REL72_STATUS_LABEL = INVITATION_STATUS_LABEL;

const TYPE_PRIORITY = ["owner", "admin", "nothing special"];
const ROLE_PRIORITY = ["cared one", "nothing special"];

/**
 * Meta values can come back as an array, a plain code, a comma list, or a
 * PHP-serialized array (rows written before these fields became Radio).
 * All shapes reduce to the list of `bNN` codes they contain.
 */
function parseCodes(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  const s = String(value).trim();
  if (!s) return [];
  if (/^a:\d+:\{/.test(s)) return Array.from(s.matchAll(/"(b\d+)"/g)).map((m) => m[1]);
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function pickCode(value: unknown, map: Record<string, string>, priority: string[], fallback: string): string {
  const codes = parseCodes(value)
    .map((v) => (/^b\d+$/.test(v) ? v : (map[v.toLowerCase()] || map[v] || "")))
    .filter((v) => /^b\d+$/.test(v));
  if (codes.length === 0) return fallback;
  for (const label of priority) {
    const wanted = map[label];
    if (wanted && codes.includes(wanted)) return wanted;
  }
  return codes[0];
}

/**
 * Radio fields hold one value; decoding returns a one-element array so
 * existing `.includes("owner")` call sites keep working. Legacy serialized
 * rows may hold several codes — the highest-privilege one wins.
 */
function decodeSingle(value: unknown, labelMap: Record<string, string>, priority: string[]): string[] {
  const codes = parseCodes(value);
  if (codes.length === 0) return [];
  for (const label of priority) {
    const code = Object.keys(labelMap).find((c) => labelMap[c] === label);
    if (code && codes.includes(code)) return [label];
  }
  return [labelMap[codes[0]] || codes[0]];
}

function pickLabel(value: unknown, labelMap: Record<string, string>, fallback: string): string {
  const codes = parseCodes(value);
  if (codes.length === 0) return fallback;
  return labelMap[codes[0]] || codes[0];
}

// ─── REL 223 encode / decode ──────────────────────────────────
export interface Rel72MetaInput {
  displayName?: string;
  memberTypes?: string[];
  memberRoles?: string[];
  invitationStatus?: InvitationStatus;
}

export function encodeRel72Meta(input: Rel72MetaInput = {}): Record<string, any> {
  const type = pickCode(input.memberTypes, MEMBER_TYPE_CODE, TYPE_PRIORITY, TYPE_OPT.NOTHING_SPECIAL);
  const role = pickCode(input.memberRoles, MEMBER_ROLE_CODE, ROLE_PRIORITY, ROLE_OPT.NOTHING_SPECIAL);
  return {
    // Never invent a name: the display name is the member's own app name
    // (CCT 151 a556 / a557). Empty means "not set yet", not "Member".
    [F223.displayName]: input.displayName ?? "",
    // a56 (member type) and a57 (member role) are multi-choice columns in
    // JetEngine: they only accept an array of codes — a bare string makes the
    // relation endpoint fail with a 500. One code each is still written.
    [F223.types]: [type],
    [F223.roles]: [role],
    [F223.status]: INVITATION_STATUS_CODE[input.invitationStatus || "accepted"] || STATUS_OPT.ACCEPTED,
  };

}

export interface Rel72MetaDecoded {
  displayName: string;
  memberTypes: string[];     // readable labels
  memberRoles: string[];     // readable labels
  invitationStatus: InvitationStatus;
}

export function decodeRel72Meta(meta: any): Rel72MetaDecoded {
  const m = meta || {};
  return {
    displayName: m[F223.displayName] || "",
    memberTypes: decodeSingle(m[F223.types], MEMBER_TYPE_LABEL, TYPE_PRIORITY),
    memberRoles: decodeSingle(m[F223.roles], MEMBER_ROLE_LABEL, ROLE_PRIORITY),
    invitationStatus: pickLabel(m[F223.status], INVITATION_STATUS_LABEL, "accepted") as InvitationStatus,
  };
}

// ─── REL 225 encode / decode ──────────────────────────────────
export interface Rel75MetaInput {
  types?: string[];
}

export function encodeRel75Meta(input: Rel75MetaInput = {}): Record<string, any> {
  const type = pickCode(input.types, SUB_TYPE_CODE, TYPE_PRIORITY, SUB_TYPE_OPT.NOTHING_SPECIAL);
  // a55 is a Radio field — one code. Invitation status is deprecated.
  return { [F225.types]: type };
}

export interface Rel75MetaDecoded {
  types: string[];                     // readable labels
}

export function decodeRel75Meta(meta: any): Rel75MetaDecoded {
  const m = meta || {};
  return { types: decodeSingle(m[F225.types], SUB_TYPE_LABEL, TYPE_PRIORITY) };
}
