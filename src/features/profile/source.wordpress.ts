import type { Profile } from "@/types/care-connector";
import { getWordPressFeature, updateWordPressFeature } from "@/features/shared/wordpress-adapter";
import { wordpressFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

/**
 * Fetch profile by merging WP user data + CCT extended profile data.
 * 1. GET wp/v2/users/me → core user fields
 * 2. GET jet-cct/users_extended_prof?cct_author_id={userId} → extended CCT fields
 * 3. Merge into single Profile object
 */
export async function fetchMyProfileWordPress(): Promise<Profile | null> {
  try {
    // Step 1: Get WP user
    const wpProfile = await getWordPressFeature<Profile>("profile_me");
    if (!wpProfile) return null;

    // Step 2: Try to fetch CCT extended profile for this user
    const storedUser = getStoredWPUser();
    const wpUserId = storedUser?.user_id || wpProfile.id?.replace('wp-', '');
    let cctData: any = null;
    try {
      const cctResults = await wordpressFetch("jet-cct/users_extended_prof", {
        params: { cct_author_id: wpUserId, _limit: 1 },
      });
      if (Array.isArray(cctResults) && cctResults.length > 0) {
        cctData = cctResults[0];
      }
    } catch {
      // CCT may not have data yet — that's fine
    }

    // Step 3: Merge CCT data into profile
    if (cctData) {
      wpProfile.general_user_role = cctData.general_user_role
        ? (typeof cctData.general_user_role === 'string' ? cctData.general_user_role.split(',').map((s: string) => s.trim()) : cctData.general_user_role)
        : wpProfile.general_user_role;
      wpProfile.is_care_provider = cctData.is_care_provider === 'yes' || cctData.is_care_provider === true || wpProfile.is_care_provider;
      wpProfile.provider_is_active = cctData.provider_is_active === 'yes' || cctData.provider_is_active === true || wpProfile.provider_is_active;
      wpProfile.care_provider_is_background_checked = cctData.care_provider_is_background_checked === 'yes' || cctData.care_provider_is_background_checked === true || wpProfile.care_provider_is_background_checked;
      wpProfile.care_provider_background_check_detail = cctData.care_provider_background_check_detail || wpProfile.care_provider_background_check_detail;
      wpProfile.care_provider_starts_hourly_rate = cctData.care_provider_starts_hourly_rate ? parseFloat(cctData.care_provider_starts_hourly_rate) : wpProfile.care_provider_starts_hourly_rate;
      wpProfile.phone = cctData.phone || wpProfile.phone;
      wpProfile.location = cctData.location || wpProfile.location;
      wpProfile.years_of_experience = cctData.years_of_experience ? parseInt(cctData.years_of_experience) : wpProfile.years_of_experience;
      wpProfile.certifications = cctData.certifications ? (typeof cctData.certifications === 'string' ? JSON.parse(cctData.certifications || '[]') : cctData.certifications) : wpProfile.certifications;
      wpProfile.specialty = cctData.specialty ? (typeof cctData.specialty === 'string' ? JSON.parse(cctData.specialty || '[]') : cctData.specialty) : wpProfile.specialty;
    }

    return wpProfile;
  } catch {
    // Fallback to stored user
    const stored = getStoredWPUser();
    if (!stored) return null;
    return {
      id: `wp-${stored.user_id}`,
      user_id: `wp-${stored.user_id}`,
      email: stored.user_email,
      first_name: null, last_name: null,
      full_name: stored.user_display_name || stored.user_login,
      user_name: stored.user_login,
      avatar_url: null, bio: null,
      general_user_role: null, is_care_provider: false,
      provider_is_active: false, care_provider_is_background_checked: false,
      care_provider_background_check_detail: null, care_provider_starts_hourly_rate: null,
      phone: null, location: null, years_of_experience: null,
      certifications: null, specialty: null,
      rating_average: null, rating_count: null,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
  }
}

/**
 * Update profile: writes WP user fields AND CCT extended profile fields.
 */
export async function updateProfileWordPress(updates: Partial<Profile>): Promise<void> {
  // Update WP user fields (name, bio)
  const wpFields: Partial<Profile> = {};
  if (updates.first_name !== undefined) wpFields.first_name = updates.first_name;
  if (updates.last_name !== undefined) wpFields.last_name = updates.last_name;
  if (updates.full_name !== undefined) wpFields.full_name = updates.full_name;
  if (updates.bio !== undefined) wpFields.bio = updates.bio;
  if (Object.keys(wpFields).length > 0) {
    await updateWordPressFeature("profile_me", wpFields);
  }

  // Update CCT extended profile fields
  const cctFields: Record<string, any> = {};
  if (updates.general_user_role !== undefined) cctFields.general_user_role = Array.isArray(updates.general_user_role) ? updates.general_user_role.join(',') : updates.general_user_role;
  if (updates.is_care_provider !== undefined) cctFields.is_care_provider = updates.is_care_provider ? 'yes' : 'no';
  if (updates.provider_is_active !== undefined) cctFields.provider_is_active = updates.provider_is_active ? 'yes' : 'no';
  if (updates.care_provider_is_background_checked !== undefined) cctFields.care_provider_is_background_checked = updates.care_provider_is_background_checked ? 'yes' : 'no';
  if (updates.care_provider_background_check_detail !== undefined) cctFields.care_provider_background_check_detail = updates.care_provider_background_check_detail;
  if (updates.care_provider_starts_hourly_rate !== undefined) cctFields.care_provider_starts_hourly_rate = String(updates.care_provider_starts_hourly_rate);
  if (updates.phone !== undefined) cctFields.phone = updates.phone;
  if (updates.location !== undefined) cctFields.location = updates.location;
  if (updates.years_of_experience !== undefined) cctFields.years_of_experience = String(updates.years_of_experience);
  if (updates.certifications !== undefined) cctFields.certifications = JSON.stringify(updates.certifications);
  if (updates.specialty !== undefined) cctFields.specialty = JSON.stringify(updates.specialty);

  if (Object.keys(cctFields).length > 0) {
    // Find existing CCT record or create new one
    const storedUser = getStoredWPUser();
    const wpUserId = storedUser?.user_id;
    try {
      const existing = await wordpressFetch("jet-cct/users_extended_prof", {
        params: { cct_author_id: wpUserId, _limit: 1 },
      });
      if (Array.isArray(existing) && existing.length > 0) {
        // Update existing CCT record
        await wordpressFetch(`jet-cct/users_extended_prof/${existing[0]._ID}`, {
          method: "POST",
          body: cctFields,
        });
      } else {
        // Create new CCT record
        await wordpressFetch("jet-cct/users_extended_prof", {
          method: "POST",
          body: { ...cctFields, cct_author_id: wpUserId },
        });
      }
    } catch (err) {
      console.warn("Failed to update CCT extended profile:", err);
    }
  }
}
