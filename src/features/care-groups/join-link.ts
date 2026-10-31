/**
 * One group, one address: <origin>/care-circle/<group id> — the group's own
 * home page. Members see the group; everyone else sees the group onboarding
 * on that same page (join code, accept an invitation, or ask the admins).
 *
 * The join code (CCT 199 a58) is the group's password and never appears in
 * any link. Older /group/<id>, /care-circle?group=<id> and /join/<token>
 * addresses only forward to this one.
 */
export const JOIN_CODE_MAX_LENGTH = 6;

function cleanId(groupId: string | number | null | undefined): string {
  const id = String(groupId ?? "").trim().replace(/^wp-/, "");
  return /^\d+$/.test(id) && Number(id) > 0 ? id : "";
}

export function careGroupLink(origin: string, groupId: string | number | null | undefined): string {
  const base = String(origin || "").trim().replace(/\/+$/, "");
  const id = cleanId(groupId);
  if (!base || !id) return "";
  return `${base}/care-circle/${id}`;
}

export function careGroupPath(groupId: string | number): string {
  return `/care-circle/${cleanId(groupId) || String(groupId).replace(/^wp-/, "")}`;
}

/** The group id inside a page address (/care-circle/12, NotchSafety /circle/12, old /group/12). */
export function groupIdFromPath(pathname: string): string | null {
  const m = String(pathname || "").match(/^\/(?:care-circle|circle|group)\/(\d+)\/?$/);
  return m && Number(m[1]) > 0 ? m[1]! : null;
}

/** Reads the group id out of a pasted group link ("…/care-circle/123", old "…/group/123"). */
export function parseCareGroupLink(text: string): string | null {
  const m = String(text || "").trim().match(/\/(?:care-circle|circle|group)\/(\d+)(?:[/?#]|$)/);
  return m && Number(m[1]) > 0 ? m[1]! : null;
}

/** Default join code: six random digits. */
export function randomJoinCode(): string {
  const b = new Uint32Array(6);
  crypto.getRandomValues(b);
  return Array.from(b, (n) => String(n % 10)).join("");
}

/** Admins may type any characters, but never more than six, and no spaces. */
export function cleanJoinCodeInput(value: string): string {
  return String(value || "").replace(/\s/g, "").slice(0, JOIN_CODE_MAX_LENGTH);
}
