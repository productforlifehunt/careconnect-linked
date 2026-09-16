/**
 * Relation 219 — "One user can have many related cared ones" (Users → Users,
 * Many to Many). Parent = the caregiver, child = the cared one.
 *
 * The relation carries exactly one custom field per the data dictionary:
 *   a58  cared one invitation status   Radio { accepted b55 | pending b56 | declined b57 }
 *
 * Codes are read from the generated schema, never hardcoded here.
 */
import { WP } from "@/integrations/wp-schema";

type RelDef = {
  f: Readonly<Record<string, string>>;
  opt: Readonly<Record<string, Readonly<Record<string, string>>>>;
};

const R219 = WP.rel["219"] as unknown as RelDef;

export const REL219_STATUS_FIELD = R219.f.CARED_ONE_INVITATION_STATUS;
const OPT = R219.opt.CARED_ONE_INVITATION_STATUS;

export type CaredOneInvitationStatus = "accepted" | "pending" | "declined";

export const REL219_STATUS_CODE: Record<CaredOneInvitationStatus, string> = {
  accepted: OPT.ACCEPTED,
  pending: OPT.PENDING,
  declined: OPT.DECLINED,
};

const LABEL: Record<string, CaredOneInvitationStatus> = {
  [OPT.ACCEPTED]: "accepted",
  [OPT.PENDING]: "pending",
  [OPT.DECLINED]: "declined",
};

/** Meta payload for a link/update on Relation 219. */
export function encodeRel219Meta(status: CaredOneInvitationStatus): Record<string, any> {
  return { [REL219_STATUS_FIELD]: REL219_STATUS_CODE[status] };
}

/**
 * Meta comes back as a bare code, an array, a comma list, or a PHP-serialized
 * array on rows written before the field existed. Rows with nothing stored are
 * historical links made before the consent field was added — they are treated
 * as accepted so nobody loses an existing connection.
 */
export function decodeRel219Status(meta: any): CaredOneInvitationStatus {
  const raw = meta?.[REL219_STATUS_FIELD];
  if (raw == null) return "accepted";
  const s = Array.isArray(raw) ? raw.map(String).join(",") : String(raw);
  const codes = /^a:\d+:\{/.test(s.trim())
    ? Array.from(s.matchAll(/"(b\d+)"/g)).map((m) => m[1])
    : s.split(",").map((x) => x.trim()).filter(Boolean);
  for (const c of codes) if (LABEL[c]) return LABEL[c];
  return "accepted";
}
