import type { Profile } from "@/types/care-connector";
import { getMyWordPressProfileOrStoredFallback, updateWordPressFeature } from "@/features/shared/wordpress-adapter";

// ─── WordPress-native types ────────────────────────────────
// ─── Fetchers ──────────────────────────────────────────────
export async function fetchMyProfileWordPress(): Promise<Profile | null> {
  return getMyWordPressProfileOrStoredFallback();
}

export async function updateProfileWordPress(updates: Partial<Profile>): Promise<void> {
  await updateWordPressFeature("profile_me", updates);
}
