/**
 * Shared helper to read the current WP user id from localStorage.
 * The stored user object uses `user_id` (not `id`) — see services/wp-auth.ts.
 */
import { getStoredWPUser } from "@/services/wp-auth";

export function getCurrentUserId(): string | null {
  const u = getStoredWPUser();
  if (!u) return null;
  const raw = (u as any).user_id ?? (u as any).id;
  return raw ? String(raw) : null;
}

export function getCurrentUserIdNumber(): number | null {
  const id = getCurrentUserId();
  if (!id) return null;
  const n = Number(String(id).replace(/^wp-/, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}
