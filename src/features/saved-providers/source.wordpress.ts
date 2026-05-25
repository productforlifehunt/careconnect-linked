/**
 * Saved providers (favorites).
 *
 * NOTE: the `saved_provider` JetEngine CCT does NOT exist on the live
 * WordPress backend (verified against /wp-json/jet-cct route discovery).
 * Until the CCT is created in the JetEngine GUI (90-year-old mode), we
 * persist favorites client-side in localStorage so the UI still works.
 *
 * When the CCT is added with fields:
 *   a55 = provider_id (text)
 *   a56 = provider_name (text)
 *   a57 = provider_avatar (text)
 * — swap the localStorage layer for opaque-code CCT writes.
 */

const STORAGE_KEY = "cc.saved_providers.v1";

function readStore(): Array<{ id: string; provider_id: string; created_at: string }> {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore(items: Array<{ id: string; provider_id: string; created_at: string }>): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
    /* ignore quota errors */
  }
}

export async function fetchSavedProvidersWordPress(): Promise<any[]> {
  return readStore().map((s) => ({
    id: s.id,
    provider_id: s.provider_id,
    provider_name: null,
    provider_avatar: null,
    created_at: s.created_at,
  }));
}

export async function toggleSavedProviderWordPress(providerId: string): Promise<void> {
  const list = readStore();
  const idx = list.findIndex(
    (s) => s.provider_id === providerId || s.provider_id === `wp-${providerId.replace(/^wp-/, "")}`
  );
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push({
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      provider_id: providerId,
      created_at: new Date().toISOString(),
    });
  }
  writeStore(list);
}
