/**
 * Where to go after signing in / finishing app onboarding.
 * Only same-site paths ("/care-circle/28") are accepted, never "//host" or
 * full URLs, so a crafted link cannot send someone to another website.
 */
export function safeNextPath(raw: string | null | undefined): string | null {
  const value = String(raw ?? "").trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  if (value.startsWith("/auth") || value.startsWith("/onboarding")) return null;
  return value;
}

export function withNext(path: string, next: string | null | undefined): string {
  const safe = safeNextPath(next);
  return safe ? `${path}?next=${encodeURIComponent(safe)}` : path;
}
