import { wordpressCCTFetch } from "@/features/shared/wordpress-client";

// CCT slug: saved_provider | flat fields
export async function fetchSavedProvidersWordPress(): Promise<any[]> {
  try {
    const items = await wordpressCCTFetch("saved_provider", { params: { _limit: 100 } });
    if (!Array.isArray(items)) return [];
    return items.map((s: any) => ({
      id: s.id,
      provider_id: s.provider_id || null,
      provider_name: s.provider_name || null,
      provider_avatar: s.provider_avatar || null,
      created_at: s.created_at,
    }));
  } catch {
    return [];
  }
}

export async function toggleSavedProviderWordPress(providerId: string): Promise<void> {
  try {
    const existing = await wordpressCCTFetch("saved_provider", { params: { _limit: 100 } });
    const found = Array.isArray(existing) && existing.find(
      (s: any) => s.provider_id === providerId || s.provider_id === `wp-${providerId.replace("wp-", "")}`
    );
    if (found) {
      await wordpressCCTFetch("saved_provider", { id: found.id, method: "DELETE" });
    } else {
      await wordpressCCTFetch("saved_provider", {
        method: "POST",
        body: { provider_id: providerId },
      });
    }
  } catch {
  }
}
