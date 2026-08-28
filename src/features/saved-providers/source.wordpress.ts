/**
 * Saved providers (favorites).
 *
 * The data dictionary has no favorites table, so we deliberately do NOT
 * invent one — favorites are kept on this device only, and the UI says so.
 * The provider details shown in the list are read live from WordPress.
 */

import { fetchProviderByIdWordPress } from "@/features/providers/source.wordpress";

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
  const saved = readStore();
  const enriched = await Promise.all(
    saved.map(async (s) => {
      let provider: any = null;
      try { provider = await fetchProviderByIdWordPress(s.provider_id); } catch { provider = null; }
      return {
        id: s.id,
        provider_id: s.provider_id,
        provider,
        provider_name: provider?.full_name ?? null,
        provider_avatar: provider?.avatar_url ?? null,
        created_at: s.created_at,
      };
    }),
  );
  return enriched.filter((e) => e.provider);
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
