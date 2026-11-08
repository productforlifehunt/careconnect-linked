import type { Profile } from "@/types/care-connector";
import { T } from "@/integrations/wp-schema";
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import {
  filterProviders,
  type ProviderFilters,
} from "@/features/providers/filter";
import {
  fetchProviderRatingSummaries,
  fetchProviderRatingSummary,
} from "@/features/reviews/source.wordpress";
import { careServiceIdsToSlugs, deliveryIdsToSlugs } from "@/lib/care-service-types";
import {
  fetchWPUserPublicProfile,
  fetchWPUserPublicProfiles,
  type WPUserPublicProfile,
} from "@/features/shared/wp-users";

export { filterProviders } from "@/features/providers/filter";
export type { ProviderFilters } from "@/features/providers/filter";

// Provider fields live on CCT 258 "User's extended profile 2".
// Discovery (browse / search / filter / price display) reads ONLY from this CCT
// — WooCommerce is not involved until the buyer adds a service to the cart.
const P2 = T.userProfile2;
const F_PROFILE = P2.f;



function parseWpList(value: unknown): string[] | null {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {}
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return null;
}

function isListedProviderRow(row: any): boolean {
  return String(row?.[F_PROFILE.IS_PAID_CARE_PROVIDER]) === P2.opt.IS_PAID_CARE_PROVIDER.YES
    && String(row?.[F_PROFILE.CARE_PROVIDER_IS_ACTIVE]) === P2.opt.CARE_PROVIDER_IS_ACTIVE.YES;
}

function mapProviderRow(row: any, user: WPUserPublicProfile): Profile | null {
  const userId = Number(row.author_id || row.cct_author_id || row.user_id);
  if (!userId) return null;

  // Name = this app's own column on CCT 151 (a556 / a557).
  const fullName = user.full_name;

  // Rates: a66 in-person hourly, a67 remote hourly, a69 remote check-in,
  // a70 remote medicine supervision. "Starts at" = cheapest published rate.
  const rateNumbers = [
    row[F_PROFILE.CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE],
    row[F_PROFILE.CARE_PROVIDER_S_HOURLY_RATE_FOR_REMOTE_SERVICE],
    row[F_PROFILE.CARE_PROVIDER_S_RATE_FOR_REMOTE_CHECKINS],
    row[F_PROFILE.CARE_PROVIDER_S_RATE_FOR_REMOTE_MEDICINE_SUPERVISION],
  ].map((v) => parseFloat(v)).filter((n) => Number.isFinite(n) && n > 0);
  const startsAt = rateNumbers.length ? Math.min(...rateNumbers) : null;

  return {
    id: `wp-${userId}`,
    user_id: `wp-${userId}`,
    email: null,
    first_name: null,
    last_name: null,
    full_name: fullName,
    user_name: user.slug || null,
    avatar_url: user.avatar_url || null,
    bio: null,
    general_user_role: parseWpList(row[F_PROFILE.GENERAL_USER_ROLE]),
    is_care_provider: String(row[F_PROFILE.IS_PAID_CARE_PROVIDER]) === P2.opt.IS_PAID_CARE_PROVIDER.YES,
    provider_is_active: String(row[F_PROFILE.CARE_PROVIDER_IS_ACTIVE]) === P2.opt.CARE_PROVIDER_IS_ACTIVE.YES,
    care_provider_is_background_checked: String(row[F_PROFILE.CARE_PROVIDER_IS_BACKGROUND_CHECKED]) === P2.opt.CARE_PROVIDER_IS_BACKGROUND_CHECKED.YES,
    care_provider_background_check_detail: row[F_PROFILE.CARE_PROVIDER_S_BACKGROUND_CHECK_DETAIL] || null,
    care_provider_starts_hourly_rate: startsAt,
    min_block_cost: startsAt,
    // Filter facets straight from the dictionary checkboxes (a65 / a68).
    service_location_slugs: deliveryIdsToSlugs(row[F_PROFILE.CARE_PROVIDER_OFFERS_SERVICE_TYPE]),
    service_type_slugs: careServiceIdsToSlugs(row[F_PROFILE.CARE_PROVIDER_OFFERS_CARE_SERVICE_TYPE]),
    care_provider_hourly_rate_in_person: parseFloat(row[F_PROFILE.CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE]) || null,
    care_provider_hourly_rate_remote: parseFloat(row[F_PROFILE.CARE_PROVIDER_S_HOURLY_RATE_FOR_REMOTE_SERVICE]) || null,
    care_provider_rate_remote_checkin: parseFloat(row[F_PROFILE.CARE_PROVIDER_S_RATE_FOR_REMOTE_CHECKINS]) || null,
    care_provider_rate_remote_medicine: parseFloat(row[F_PROFILE.CARE_PROVIDER_S_RATE_FOR_REMOTE_MEDICINE_SUPERVISION]) || null,
    care_provider_cancellation_policy: row[F_PROFILE.CARE_PROVIDER_S_CANCELLATION_POLICY] || null,
    phone: null,
    location: row[F_PROFILE.CARE_PROVIDER_S_LOCATION] || null,
    years_of_experience: null,
    certifications: null,
    specialty: null,
    rating_average: null,
    rating_count: null,
    created_at: row.created_at || null,
    updated_at: row.updated_at || row.created_at || null,
  } satisfies Profile;
}

async function fetchDictionaryProviderRows(): Promise<any[]> {
  const rows = await wordpressCCTFetch<any[]>(P2.slug, {
    params: { _limit: 200 },
  });
  return (Array.isArray(rows) ? rows : []).filter(isListedProviderRow);
}

/** Listed providers with their ratings — read once and shared; filters/sorting run on this list without re-downloading. */
export async function fetchProviderDirectoryWordPress(): Promise<Profile[]> {
  const providerRows = await fetchDictionaryProviderRows();
  const providerIds = providerRows
    .map((row) => Number(row.author_id || row.cct_author_id || row.user_id))
    .filter((id) => Number.isFinite(id) && id > 0);
  const [publicProfiles, ratingSummaries] = await Promise.all([
    fetchWPUserPublicProfiles(providerIds),
    fetchProviderRatingSummaries(providerIds),
  ]);
  const mappedProfiles = providerRows.map((row) => {
    const userId = Number(row.author_id || row.cct_author_id || row.user_id);
    const user = publicProfiles.get(userId);
    return user ? mapProviderRow(row, user) : null;
  });
  const sourceProfiles = mappedProfiles.filter(Boolean) as Profile[];
  return sourceProfiles.map((profile) => {
    const numericId = String(profile.id).replace(/^wp-/, "");
    const rating = ratingSummaries.get(numericId) || { average: null, count: 0 };
    return { ...profile, rating_average: rating.average, rating_count: rating.count } as Profile;
  });
}

export async function fetchProvidersWordPress(filters?: ProviderFilters | undefined): Promise<Profile[]> {
  return filterProviders(await fetchProviderDirectoryWordPress(), filters);
}

export async function fetchProviderByIdWordPress(id: string): Promise<Profile | null> {
  try {
    const numericId = String(id).replace(/^wp-/, "");
    // Profile page reads the same dictionary row as search (CCT 258), so the
    // card price and the profile price can never disagree, and no Dokan/Woo
    // store call happens before checkout.
    const rows = await wordpressCCTFetch<any[]>(P2.slug, { params: { cct_author_id: numericId, _limit: 20 } });
    const row = (Array.isArray(rows) ? rows : []).find(
      (r: any) => String(r.author_id || r.cct_author_id || r.user_id) === numericId,
    );
    if (!row || !isListedProviderRow(row)) return null;
    const userId = Number(row.author_id || row.cct_author_id || row.user_id);
    const [user, rating] = await Promise.all([
      userId ? fetchWPUserPublicProfile(userId) : Promise.resolve(null),
      fetchProviderRatingSummary(numericId),
    ]);
    if (!user) return null;
    const profile = mapProviderRow(row, user);
    if (!profile) return null;
    // Ratings always come from CCT 31 "Review" (relation 264).
    return { ...profile, rating_average: rating.average, rating_count: rating.count };
  } catch (error) { throw new Error(`Failed to fetch provider ${id}: ${error instanceof Error ? error.message : String(error)}`); }
}


