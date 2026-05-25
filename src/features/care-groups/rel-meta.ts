/**
 * Opaque-code meta encoders / decoders for JetEngine relations 72 and 75
 * (care_group ↔ users and care_group_private_member_group ↔ users).
 *
 * Per data dictionary (the only source of truth):
 *
 *  REL 72 — care_group → users
 *    a55 display_name             text
 *    a56 member_types             checkbox  { b55 nothing special, b56 owner, b57 admin }
 *    a57 member_roles             checkbox  { b55 nothing special, b56 cared one }
 *    a58 invitation_status        radio     { b55 accepted, b56 pending }
 *
 *  REL 75 — sub-group → users
 *    a55 member_types             checkbox  { b55 nothing special, b56 owner, b57 admin }
 *    a56 invitation_status        radio     { b55 accepted, b56 pending }
 *
 * The dictionary has NO "declined" code; decline = delete the relation row.
 */

// ─── REL 72 ───────────────────────────────────────────────────
export const REL72_TYPE_CODE: Record<string, string> = {
  "nothing special": "b55", nothing: "b55", member: "b55",
  owner: "b56",
  admin: "b57",
};
export const REL72_TYPE_LABEL: Record<string, string> = {
  b55: "nothing special", b56: "owner", b57: "admin",
};
export const REL72_ROLE_CODE: Record<string, string> = {
  "nothing special": "b55", nothing: "b55",
  "cared one": "b56", cared_one: "b56", "cared-one": "b56",
};
export const REL72_ROLE_LABEL: Record<string, string> = {
  b55: "nothing special", b56: "cared one",
};
export const REL72_STATUS_CODE: Record<string, string> = {
  accepted: "b55", active: "b55",
  pending: "b56", invited: "b56", declined: "b56",
};
export const REL72_STATUS_LABEL: Record<string, string> = {
  b55: "accepted", b56: "pending",
};

function toCodeList(value: unknown, map: Record<string, string>): string[] {
  const list = Array.isArray(value)
    ? value.map(String)
    : typeof value === "string"
      ? value.split(",").map((s) => s.trim())
      : [];
  return list
    .filter(Boolean)
    .map((v) => (/^b\d+$/.test(v) ? v : (map[v.toLowerCase()] || map[v] || v)))
    .filter((v) => /^b\d+$/.test(v));
}

function fromCodeList(value: unknown, labelMap: Record<string, string>): string[] {
  const list = Array.isArray(value)
    ? value.map(String)
    : typeof value === "string"
      ? value.split(",").map((s) => s.trim())
      : [];
  return list
    .filter(Boolean)
    .map((v) => labelMap[v] || v);
}

function pickCode(value: unknown, map: Record<string, string>, fallback: string): string {
  if (value == null || value === "") return fallback;
  const s = String(Array.isArray(value) ? value[0] : value);
  if (/^b\d+$/.test(s)) return s;
  return map[s.toLowerCase()] || map[s] || fallback;
}

function pickLabel(value: unknown, labelMap: Record<string, string>, fallback: string): string {
  if (value == null || value === "") return fallback;
  const s = String(Array.isArray(value) ? value[0] : value);
  return labelMap[s] || s;
}

// ─── REL 72 encode / decode ──────────────────────────────────
export interface Rel72MetaInput {
  displayName?: string;
  memberTypes?: string[];
  memberRoles?: string[];
  invitationStatus?: "accepted" | "pending" | "declined";
}

export function encodeRel72Meta(input: Rel72MetaInput = {}): Record<string, any> {
  const types = toCodeList(input.memberTypes?.length ? input.memberTypes : ["nothing special"], REL72_TYPE_CODE);
  const roles = toCodeList(input.memberRoles?.length ? input.memberRoles : ["nothing special"], REL72_ROLE_CODE);
  return {
    a55: input.displayName || "Member",
    a56: types.length ? types : ["b55"],
    a57: roles.length ? roles : ["b55"],
    a58: REL72_STATUS_CODE[input.invitationStatus || "accepted"] || "b55",
  };
}

export interface Rel72MetaDecoded {
  displayName: string;
  memberTypes: string[];     // readable labels
  memberRoles: string[];     // readable labels
  invitationStatus: "accepted" | "pending";
}

export function decodeRel72Meta(meta: any): Rel72MetaDecoded {
  const m = meta || {};
  return {
    displayName: m.a55 || m.care_groups_member_display_name_ || "",
    memberTypes: fromCodeList(m.a56 ?? m.care_groups_member_types, REL72_TYPE_LABEL),
    memberRoles: fromCodeList(m.a57 ?? m.care_groups_member_roles, REL72_ROLE_LABEL),
    invitationStatus: pickLabel(
      m.a58 ?? m.care_groups_member_invitation_status,
      REL72_STATUS_LABEL,
      "accepted",
    ) as "accepted" | "pending",
  };
}

// ─── REL 75 encode / decode ──────────────────────────────────
export interface Rel75MetaInput {
  types?: string[];
  status?: "accepted" | "pending" | "declined";
}

export function encodeRel75Meta(input: Rel75MetaInput = {}): Record<string, any> {
  const types = toCodeList(input.types?.length ? input.types : ["nothing special"], REL72_TYPE_CODE);
  return {
    a55: types.length ? types : ["b55"],
    a56: REL72_STATUS_CODE[input.status || "accepted"] || "b55",
  };
}

export interface Rel75MetaDecoded {
  types: string[];                     // readable labels
  status: "accepted" | "pending";
}

export function decodeRel75Meta(meta: any): Rel75MetaDecoded {
  const m = meta || {};
  return {
    types: fromCodeList(
      m.a55 ?? m.care_group_s_private_member_group_member_types,
      REL72_TYPE_LABEL,
    ),
    status: pickLabel(
      m.a56 ?? m.care_group_s_private_member_group_member_invitation_status,
      REL72_STATUS_LABEL,
      "accepted",
    ) as "accepted" | "pending",
  };
}
