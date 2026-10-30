/**
 * The one place that builds a group's join link, so the settings tab, the
 * invite tab and any future surface hand out the exact same URL shape:
 *   <origin>/join/<code>
 * The code is either an invite-link token (CCT 200 a55) or the group's own
 * join code (CCT 199 a58); the join page accepts both.
 */
export function careGroupJoinLink(origin: string, code: string): string {
  const base = String(origin || "").trim().replace(/\/+$/, "");
  const trimmed = String(code || "").trim();
  if (!base || !trimmed) return "";
  return `${base}/join/${encodeURIComponent(trimmed)}`;
}
