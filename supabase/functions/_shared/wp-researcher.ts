/** Confirms the caller's WordPress sign-in belongs to the researcher account. */
const WP_BASE = "https://app.challenged-dementia.com/afresh";
const RESEARCHER_ID = 70;

export async function isResearcher(req: Request): Promise<boolean> {
  const token = req.headers.get("x-wp-token")?.trim();
  if (!token) return false;
  const res = await fetch(`${WP_BASE}/wp-json/wp/v2/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);
  if (!res?.ok) return false;
  const user = await res.json().catch(() => null);
  return Number(user?.id) === RESEARCHER_ID || user?.slug === "researcher";
}
