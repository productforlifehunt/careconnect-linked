/**
 * User profile = WP user (core) + JetEngine CCT 110 `users_extended_prof` (bible §1).
 *
 * Extended profile opaque codes (only the ones the FE currently exposes):
 *   a55=Allow emergency location request (b55 Yes | b56 No)
 *   a56=Location share is on            (b55 Yes | b56 No)
 *   a57=Notification preference
 *   a58=General user role               (b55 cared one | b56 caring one)  [checkbox]
 *   a59=Is care provider                (b55 Yes | b56 No)
 *   a60=Care provider is active         (b55 Yes | b56 No)
 *   a61=Background checked              (b55 Yes | b56 No)
 *   a62=Background check detail
 *   a63=Cancellation policy
 *   a64=Service area
 *   a65=Starts hourly rate              (number)
 *   a66=Offers in-person service        (b55 Yes | b56 No)
 *   a67=Offers virtual service          (b55 Yes | b56 No)
 *   a68=Offers care service general type [checkbox: b55..b66]
 *   a90=Cared one's AI system prompt
 *   a91=Push notification enabled       (b55 Yes | b56 No)
 *   a92=Email notification enabled      (b55 Yes | b56 No)
 *   a93=SMS notification enabled        (b55 Yes | b56 No)
 *
 * Linked to user via Rel 111 (one-to-one).
 */
import type { Profile } from "@/types/care-connector";
import { getWordPressFeature, updateWordPressFeature } from "@/features/shared/wordpress-adapter";
import { wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

const CCT_SLUG = "users_extended_prof";

// Role checkbox: opaque → role label
const ROLE_OPT_TO_LABEL: Record<string, string> = { b55: "cared one", b56: "caring one" };
const ROLE_LABEL_TO_OPT: Record<string, string> = { "cared one": "b55", "caring one": "b56" };
const YES = "b55", NO = "b56";

const yesNoToBool = (v: any): boolean => v === YES || v === true || v === 1 || v === "1" || v === "yes";
const boolToYesNo = (v: boolean | undefined): string => (v ? YES : NO);

function parseCheckboxList(v: unknown): string[] | null {
  if (Array.isArray(v)) return v.map((x) => ROLE_OPT_TO_LABEL[String(x)] ?? String(x)).filter(Boolean);
  if (typeof v === "string" && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map((x) => ROLE_OPT_TO_LABEL[String(x)] ?? String(x)).filter(Boolean);
    } catch {}
    return v.split(",").map((s) => ROLE_OPT_TO_LABEL[s.trim()] ?? s.trim()).filter(Boolean);
  }
  return null;
}

function serializeRoleList(roles: string[] | null | undefined): string {
  if (!roles || !Array.isArray(roles)) return "";
  return JSON.stringify(roles.map((r) => ROLE_LABEL_TO_OPT[r] ?? r));
}

export async function fetchMyProfileWordPress(): Promise<Profile | null> {
  try {
    const wpProfile = await getWordPressFeature<Profile>("profile_me");
    if (!wpProfile) return null;

    const storedUser = getStoredWPUser();
    const wpUserId = storedUser?.user_id || wpProfile.id?.replace("wp-", "");
    let cct: any = null;
    try {
      const list = await wordpressCCTFetch<any[]>(CCT_SLUG, {
        params: { cct_author_id: wpUserId, _limit: 1 },
      });
      if (Array.isArray(list) && list.length > 0) cct = list[0];
    } catch { /* no CCT record yet — fine */ }

    if (cct) {
      wpProfile.general_user_role = parseCheckboxList(cct.a58) || wpProfile.general_user_role;
      wpProfile.is_care_provider = yesNoToBool(cct.a59);
      wpProfile.provider_is_active = yesNoToBool(cct.a60);
      wpProfile.care_provider_is_background_checked = yesNoToBool(cct.a61);
      wpProfile.care_provider_background_check_detail = cct.a62 || wpProfile.care_provider_background_check_detail;
      wpProfile.care_provider_starts_hourly_rate = cct.a65 != null && cct.a65 !== "" ? parseFloat(cct.a65) : wpProfile.care_provider_starts_hourly_rate;
      // Phone / location / years / certifications / specialty are not in bible §110;
      // keep WP-user-derived values where present.
    }

    return wpProfile;
  } catch {
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

export async function updateProfileWordPress(updates: Partial<Profile>): Promise<void> {
  // 1) Update WP user core fields
  const wpFields: Partial<Profile> = {};
  if (updates.first_name !== undefined) wpFields.first_name = updates.first_name;
  if (updates.last_name !== undefined) wpFields.last_name = updates.last_name;
  if (updates.full_name !== undefined) wpFields.full_name = updates.full_name;
  if (updates.bio !== undefined) wpFields.bio = updates.bio;
  if (Object.keys(wpFields).length > 0) {
    await updateWordPressFeature("profile_me", wpFields);
  }

  // 2) Update CCT 110 extended profile (opaque codes)
  const body: Record<string, any> = {};
  if (updates.general_user_role !== undefined) body.a58 = serializeRoleList(updates.general_user_role as string[] | null);
  if (updates.is_care_provider !== undefined) body.a59 = boolToYesNo(updates.is_care_provider);
  if (updates.provider_is_active !== undefined) body.a60 = boolToYesNo(updates.provider_is_active);
  if (updates.care_provider_is_background_checked !== undefined) body.a61 = boolToYesNo(updates.care_provider_is_background_checked);
  if (updates.care_provider_background_check_detail !== undefined) body.a62 = updates.care_provider_background_check_detail;
  if (updates.care_provider_starts_hourly_rate !== undefined) body.a65 = String(updates.care_provider_starts_hourly_rate ?? "");

  if (Object.keys(body).length === 0) return;

  const storedUser = getStoredWPUser();
  const wpUserId = storedUser?.user_id;
  try {
    const existing = await wordpressCCTFetch<any[]>(CCT_SLUG, { params: { cct_author_id: wpUserId, _limit: 1 } });
    if (Array.isArray(existing) && existing.length > 0) {
      await wordpressCCTFetch(CCT_SLUG, { id: existing[0]._ID || existing[0].id, method: "PUT", body });
    } else {
      await wordpressCCTFetch(CCT_SLUG, { method: "POST", body: { ...body, cct_author_id: wpUserId } });
    }
  } catch (err) {
    console.warn("Failed to update CCT 110 extended profile:", err);
  }
}
