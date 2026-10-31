/**
 * One group, one shareable address: <origin>/group/<group id>.
 *
 * The join code (CCT 199 a58) is the group's password and never appears in
 * any link. Personal invitations, shared links and "contact the admin" all
 * land on this same page; who you are decides what you see there.
 */
export const JOIN_CODE_MAX_LENGTH = 6;

export function careGroupLink(origin: string, groupId: string | number | null | undefined): string {
  const base = String(origin || "").trim().replace(/\/+$/, "");
  const id = String(groupId ?? "").trim().replace(/^wp-/, "");
  if (!base || !/^\d+$/.test(id) || Number(id) <= 0) return "";
  return `${base}/group/${id}`;
}

export function careGroupPath(groupId: string | number): string {
  return `/group/${String(groupId).replace(/^wp-/, "")}`;
}

/** Reads the group id out of a pasted group link ("…/group/123"). */
export function parseCareGroupLink(text: string): string | null {
  const m = String(text || "").trim().match(/\/group\/(\d+)(?:[/?#]|$)/);
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
