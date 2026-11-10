/**
 * User profile = WP user (core) + JetEngine CCT 258 `user_ext_profile_2`.
 *
 * Extended profile 2 opaque codes (only the ones the FE currently exposes):
 *   a55=Allow emergency location request (b55 Yes | b56 No)
 *   a56=Location share is on            (b55 Yes | b56 No)
 *   a57=Notification preference
 *   a58=General user role               (b55 cared one | b56 caring one)  [checkbox]
 *   a59=Is care provider                (b55 Yes | b56 No)
 *   a60=Care provider is active         (b55 Yes | b56 No)
 *   a61=Background checked              (b55 Yes | b56 No)
 *   a62=Background check detail
 *   a63=Cancellation policy
 *   a64=Care provider's location
 *   a65=Offers service type              [checkbox: b55 in person | b56 virtual]
 *   a66=Hourly rate for in-person service (number)
 *   a67=Hourly rate for remote service    (number)
 *   a68=Offers care service type          [checkbox]
 *   a90=Cared one's AI system prompt
 *
 * Notification / display / permission settings are NOT stored here — they live
 * as one JSON blob on CCT 151 (a95 ChallengeD, a96 CareCNC); see
 * src/features/settings/app-settings.ts.

 *
 * Linked to user via Rel 259 (one-to-one).
 */
import type { Profile } from "@/types/care-connector";
import { getWordPressFeature, updateWordPressFeature } from "@/features/shared/wordpress-adapter";
import { wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { T, R } from "@/integrations/wp-schema";
import { findOwnRow, findOwnRowId, linkOwnRow } from "@/features/shared/own-profile-row";
import { fetchMyAppUserName } from "@/features/profile/app-user-name";
import { getAppProfileRow, patchAppProfile, APP_PROFILE_F } from "@/features/shared/app-profile";
import {
  careServiceIdsToSlugs,
  careServiceSlugsToIds,
  deliveryIdsToSlugs,
  deliverySlugsToIds,
} from "@/lib/care-service-types";

const P2 = T.userProfile2;
const F = P2.f;
const CCT_SLUG = P2.slug;

// Targets come only from this account's JetEngine relations, never from a caller's id.
const profileTargets = new WeakMap<Profile, { userId: string; providerRowId?: string | undefined; appRowId?: string | undefined }>();

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
    const [wpProfile, appName, cct, appProfile] = await Promise.all([
      getWordPressFeature<Profile>("profile_me"),
      fetchMyAppUserName(),
      findOwnRow(R.userProfile2Rel, CCT_SLUG),
      getAppProfileRow(),
    ]);
    if (!wpProfile) return null;

    // Display name lives ONLY in this app's own column on CCT 151
    // (a556 ChallengeD / a557 CareCNC) — never the shared WP user name.
    wpProfile.full_name = appName;
    wpProfile.phone = appProfile?.[APP_PROFILE_F.PHONE] ?? null;
    wpProfile.bio = cct?.[F.CARE_PROVIDER_DESCRIPTION] ?? null;

    // Resolved through Relation 259 (one-to-one). A cct_author_id query filter
    // is ignored by JetEngine on this route and returns another user's row.
    if (cct) {
      wpProfile.general_user_role = parseCheckboxList(cct[F.GENERAL_USER_ROLE]) || wpProfile.general_user_role;
      wpProfile.is_care_provider = yesNoToBool(cct[F.IS_PAID_CARE_PROVIDER]);
      wpProfile.provider_is_active = yesNoToBool(cct[F.CARE_PROVIDER_IS_ACTIVE]);
      wpProfile.care_provider_is_background_checked = yesNoToBool(cct[F.CARE_PROVIDER_IS_BACKGROUND_CHECKED]);
      wpProfile.care_provider_background_check_detail = cct[F.CARE_PROVIDER_S_BACKGROUND_CHECK_DETAIL] || wpProfile.care_provider_background_check_detail;
      {
        const rate = cct[F.CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE];
        wpProfile.care_provider_starts_hourly_rate =
          rate != null && rate !== "" ? parseFloat(rate) : wpProfile.care_provider_starts_hourly_rate;
      }
      // a65 / a68 — what the provider offers, and how it is delivered.
      wpProfile.service_location_slugs = deliveryIdsToSlugs(cct[F.CARE_PROVIDER_OFFERS_SERVICE_TYPE]);
      wpProfile.service_type_slugs = careServiceIdsToSlugs(cct[F.CARE_PROVIDER_OFFERS_CARE_SERVICE_TYPE]);
      // a66 / a67 / a69 / a70 — the four published rates.
      const num = (v: any) => (v != null && v !== "" && Number.isFinite(parseFloat(v)) ? parseFloat(v) : null);
      wpProfile.care_provider_hourly_rate_in_person = num(cct[F.CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE]);
      wpProfile.care_provider_hourly_rate_remote = num(cct[F.CARE_PROVIDER_S_HOURLY_RATE_FOR_REMOTE_SERVICE]);
      wpProfile.care_provider_rate_remote_checkin = num(cct[F.CARE_PROVIDER_S_RATE_FOR_REMOTE_CHECKINS]);
      wpProfile.care_provider_rate_remote_medicine = num(cct[F.CARE_PROVIDER_S_RATE_FOR_REMOTE_MEDICINE_SUPERVISION]);
      wpProfile.care_provider_cancellation_policy = cct[F.CARE_PROVIDER_S_CANCELLATION_POLICY] || null;
      wpProfile.location = cct[F.CARE_PROVIDER_S_LOCATION] || wpProfile.location;
      // Phone belongs to this app's CCT151 a98; biography belongs to CCT258 a107.

    }

    profileTargets.set(wpProfile, {
      userId: String(getStoredWPUser()?.user_id ?? ""),
      providerRowId: cct ? String(cct._ID ?? cct.id) : undefined,
      appRowId: appProfile ? String(appProfile._ID ?? appProfile.id) : undefined,
    });
    return wpProfile;
  } catch (error) {
    // No fabricated profile: the WordPress account name is never a fallback for
    // the app name, and an empty shell profile would hide a real backend
    // failure. Surface the error so the UI can show a retry state.
    throw error;
  }
}


export async function updateProfileWordPress(updates: Partial<Profile>, loadedProfile?: Profile): Promise<void> {
  const targets = loadedProfile ? profileTargets.get(loadedProfile) : undefined;
  const ownTargets = targets?.userId === String(getStoredWPUser()?.user_id ?? "") ? targets : undefined;
  const writes: Promise<unknown>[] = [];
  // 1) Update WP user core fields
  const wpFields: Partial<Profile> = {};
  if (updates.first_name !== undefined) wpFields.first_name = updates.first_name;
  if (updates.last_name !== undefined) wpFields.last_name = updates.last_name;
  if (Object.keys(wpFields).length > 0) {
    writes.push(updateWordPressFeature("profile_me", wpFields));
  }

  // The app display name goes to CCT 151, this app's own column.
  const appBody: Record<string, unknown> = {};
  if (updates.full_name !== undefined) appBody[APP_PROFILE_F.NAME] = updates.full_name ?? "";
  if (updates.phone !== undefined) appBody[APP_PROFILE_F.PHONE] = updates.phone ?? "";
  if (Object.keys(appBody).length) {
    writes.push(ownTargets?.appRowId
      ? wordpressCCTFetch(T.userProfile.slug, { id: ownTargets.appRowId, method: "PUT", body: appBody })
      : patchAppProfile(appBody));
  }

  // 2) Update CCT 258 extended profile 2 (opaque codes)
  const body: Record<string, any> = {};
  if (updates.bio !== undefined) body[F.CARE_PROVIDER_DESCRIPTION] = updates.bio ?? "";
  if (updates.general_user_role !== undefined) body[F.GENERAL_USER_ROLE] = serializeRoleList(updates.general_user_role as string[] | null);
  if (updates.is_care_provider !== undefined) body[F.IS_PAID_CARE_PROVIDER] = boolToYesNo(updates.is_care_provider);
  if (updates.provider_is_active !== undefined) body[F.CARE_PROVIDER_IS_ACTIVE] = boolToYesNo(updates.provider_is_active);
  if (updates.care_provider_is_background_checked !== undefined) body[F.CARE_PROVIDER_IS_BACKGROUND_CHECKED] = boolToYesNo(updates.care_provider_is_background_checked);
  if (updates.care_provider_background_check_detail !== undefined) body[F.CARE_PROVIDER_S_BACKGROUND_CHECK_DETAIL] = updates.care_provider_background_check_detail;
  if (updates.care_provider_starts_hourly_rate !== undefined) body[F.CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE] = String(updates.care_provider_starts_hourly_rate ?? "");
  // Dictionary: a64 = care provider's location (the only location column in CCT 258).
  if (updates.location !== undefined) body[F.CARE_PROVIDER_S_LOCATION] = updates.location ?? "";
  // a65 / a68 checkboxes — stored as option-id arrays.
  if (updates.service_location_slugs !== undefined)
    body[F.CARE_PROVIDER_OFFERS_SERVICE_TYPE] = deliverySlugsToIds(updates.service_location_slugs);
  if (updates.service_type_slugs !== undefined)
    body[F.CARE_PROVIDER_OFFERS_CARE_SERVICE_TYPE] = careServiceSlugsToIds(updates.service_type_slugs);
  // a66 / a67 / a69 / a70 — published rates.
  const rate = (v: number | null | undefined) => (v == null || Number.isNaN(v) ? "" : String(v));
  if (updates.care_provider_hourly_rate_in_person !== undefined)
    body[F.CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE] = rate(updates.care_provider_hourly_rate_in_person);
  if (updates.care_provider_hourly_rate_remote !== undefined)
    body[F.CARE_PROVIDER_S_HOURLY_RATE_FOR_REMOTE_SERVICE] = rate(updates.care_provider_hourly_rate_remote);
  if (updates.care_provider_rate_remote_checkin !== undefined)
    body[F.CARE_PROVIDER_S_RATE_FOR_REMOTE_CHECKINS] = rate(updates.care_provider_rate_remote_checkin);
  if (updates.care_provider_rate_remote_medicine !== undefined)
    body[F.CARE_PROVIDER_S_RATE_FOR_REMOTE_MEDICINE_SUPERVISION] = rate(updates.care_provider_rate_remote_medicine);
  if (updates.care_provider_cancellation_policy !== undefined)
    body[F.CARE_PROVIDER_S_CANCELLATION_POLICY] = updates.care_provider_cancellation_policy ?? "";


  if (Object.keys(body).length) {
    writes.push((async () => {
      const wpUserId = String(getStoredWPUser()?.user_id ?? "");
      const existingId = ownTargets?.providerRowId ?? await findOwnRowId(R.userProfile2Rel);
      if (existingId) {
        await wordpressCCTFetch(CCT_SLUG, { id: existingId, method: "PUT", body });
        return;
      }
      const created: any = await wordpressCCTFetch(CCT_SLUG, { method: "POST", body: { ...body, cct_author_id: wpUserId } });
      const newId = created?.item_id ?? created?._ID ?? created?.id;
      if (!newId) throw new Error("Could not create the extended profile 2 row");
      await linkOwnRow(R.userProfile2Rel, newId);
    })());
  }
  await Promise.all(writes);
}

/** Preserve resolved write targets when Query's structural sharing creates a new object. */
export function carryProfileWriteTargets(previous: Profile, next: Profile): void {
  const targets = profileTargets.get(previous);
  if (targets) profileTargets.set(next, targets);
}


