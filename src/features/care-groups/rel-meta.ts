/**
 * Opaque-code meta encoders / decoders for the two care-group membership
 * relations. Every code below is read from the generated schema, which is built
 * from the data dictionary — the ONLY source of truth. Nothing is hardcoded.
 *
 *  REL 223 — 199. Care Group → Users (Many to Many)
 *    a55 care group's member display name          Text
 *    a56 care group's member types                 Checkbox { nothing special | owner | admin }
 *    a57 care group's member roles                 Checkbox { nothing special | cared one }
 *    a58 care group's member invitation status     Radio    { accepted | pending | declined }
 *
 *  REL 225 — 201. Care group's private member group → Users (Many to Many)
 *    a55 private member group member types             Checkbox { nothing special | owner | admin }
 *    a56 private member group member invitation status Radio    { accepted | pending | declined }
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
  status: R225.f.CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_INVITATION_STATUS,
} as const;

// ─── Option codes (dictionary-driven) ─────────────────────────
const TYPE_OPT = R223.opt.CARE_GROUP_S_MEMBER_TYPES;
const ROLE_OPT = R223.opt.CARE_GROUP_S_MEMBER_ROLES;
const STATUS_OPT = R223.opt.CARE_GROUP_S_MEMBER_INVITATION_STATUS;
const SUB_TYPE_OPT = R225.opt.CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_TYPES;
const SUB_STATUS_OPT = R225.opt.CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_INVITATION_STATUS;

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
const SUB_STATUS_CODE: Record<string, string> = {
  accepted: SUB_STATUS_OPT.ACCEPTED,
  active: SUB_STATUS_OPT.ACCEPTED,
  pending: SUB_STATUS_OPT.PENDING,
  invited: SUB_STATUS_OPT.PENDING,
  declined: SUB_STATUS_OPT.DECLINED,
  rejected: SUB_STATUS_OPT.DECLINED,
};
const SUB_STATUS_LABEL: Record<string, string> = {
  [SUB_STATUS_OPT.ACCEPTED]: "accepted",
  [SUB_STATUS_OPT.PENDING]: "pending",
  [SUB_STATUS_OPT.DECLINED]: "declined",
};

// ─── Back-compat aliases (older imports) ──────────────────────
export const REL72_TYPE_CODE = MEMBER_TYPE_CODE;
export const REL72_TYPE_LABEL = MEMBER_TYPE_LABEL;
export const REL72_ROLE_CODE = MEMBER_ROLE_CODE;
export const REL72_ROLE_LABEL = MEMBER_ROLE_LABEL;
export const REL72_STATUS_CODE = INVITATION_STATUS_CODE;
export const REL72_STATUS_LABEL = INVITATION_STATUS_LABEL;

/**
 * Bible field types: REL 223 a56/a57/a58 and REL 225 a55/a56 are **Radio**
 * (single value). We therefore always write ONE code, and decode into a
 * one-element array so existing `.includes("owner")` call sites keep working.
 */
const TYPE_PRIORITY = ["owner", "admin", "nothing special"];
const ROLE_PRIORITY = ["cared one", "nothing special"];

function pickCode(value: unknown, map: Record<string, string>, priority: string[], fallback: string): string {
  const list = (Array.isArray(value)
    ? value.map(String)
    : typeof value === "string"
      ? value.split(",")
      : []
  ).map((s) => s.trim()).filter(Boolean);
  const codes = list.map((v) => (/^b\d+$/.test(v) ? v : (map[v.toLowerCase()] || map[v] || "")))
    .filter((v) => /^b\d+$/.test(v));
  if (codes.length === 0) return fallback;
  for (const label of priority) {
    const wanted = map[label];
    if (wanted && codes.includes(wanted)) return wanted;
  }
  return codes[0];
}

function decodeSingle(value: unknown, labelMap: Record<string, string>): string[] {
  const raw = Array.isArray(value) ? value[0] : value;
  const s = raw == null ? "" : String(raw).trim();
  if (!s) return [];
  return [labelMap[s] || s];
}

function pickLabel(value: unknown, labelMap: Record<string, string>, fallback: string): string {
  if (value == null || value === "") return fallback;
  const s = String(Array.isArray(value) ? value[0] : value);
  return labelMap[s] || s;
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
    [F223.types]: type,
    [F223.roles]: role,
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
    displayName: m[F223.displayName] || m.care_groups_member_display_name_ || "",
    memberTypes: decodeSingle(m[F223.types] ?? m.care_groups_member_types, MEMBER_TYPE_LABEL),
    memberRoles: decodeSingle(m[F223.roles] ?? m.care_groups_member_roles, MEMBER_ROLE_LABEL),
    invitationStatus: pickLabel(
      m[F223.status] ?? m.care_groups_member_invitation_status,
      INVITATION_STATUS_LABEL,
      "accepted",
    ) as InvitationStatus,
  };
}

// ─── REL 225 encode / decode ──────────────────────────────────
export interface Rel75MetaInput {
  types?: string[];
  status?: InvitationStatus;
}

export function encodeRel75Meta(input: Rel75MetaInput = {}): Record<string, any> {
  const type = pickCode(input.types, SUB_TYPE_CODE, TYPE_PRIORITY, SUB_TYPE_OPT.NOTHING_SPECIAL);
  return {
    [F225.types]: type,
    [F225.status]: SUB_STATUS_CODE[input.status || "accepted"] || SUB_STATUS_OPT.ACCEPTED,
  };
}

export interface Rel75MetaDecoded {
  types: string[];                     // readable labels
  status: InvitationStatus;
}

export function decodeRel75Meta(meta: any): Rel75MetaDecoded {
  const m = meta || {};
  return {
    types: decodeSingle(
      m[F225.types] ?? m.care_group_s_private_member_group_member_types,
      SUB_TYPE_LABEL,
    ),
    status: pickLabel(
      m[F225.status] ?? m.care_group_s_private_member_group_member_invitation_status,
      SUB_STATUS_LABEL,
      "accepted",
    ) as InvitationStatus,
  };
}
