import type { Profile } from "@/types/care-connector";

import { T } from "@/integrations/wp-schema";

import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { fetchProviderRatingSummary } from "@/features/reviews/source.wordpress";
import { careServiceIdsToSlugs, deliveryIdsToSlugs } from "@/lib/care-service-types";
import { fetchWPUserProfile } from "@/features/shared/wp-users";

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

async function mapProviderRow(row: any): Promise<Profile | null> {
  {
    const userId = Number(row.author_id || row.cct_author_id || row.user_id);
    if (!userId) return null;

    const user = await fetchWPUserProfile(userId);
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
      email: user.email || null,
      first_name: user.first_name || null,
      last_name: user.last_name || null,
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
}

async function fetchDictionaryProviderProfiles(): Promise<Profile[]> {
  const rows = await wordpressCCTFetch<any[]>(P2.slug, { params: { _limit: 200 } });
  const activeRows = (Array.isArray(rows) ? rows : []).filter(isListedProviderRow);
  const profiles = await Promise.all(activeRows.map((row) => mapProviderRow(row)));
  return profiles.filter(Boolean) as Profile[];
}


export interface ProviderFilters {
  query?: string;
  specialties?: string[];
  minRate?: number;
  maxRate?: number;
  verifiedOnly?: boolean;
  minRating?: number;
  sortBy?: string;
  location?: string;
  /** Delivery-mode slugs to require (any-of), from CCT 258 a65. e.g. ["in-person", "remote"]. */
  serviceLocations?: string[];
  /** Care service slugs to require (any-of), from CCT 258 a68. */
  serviceTypeSlugs?: string[];
}

export async function fetchProvidersWordPress(filters?: ProviderFilters): Promise<Profile[]> {
  try {
    // Discovery is 100% dictionary-driven: CCT 258 (a59 is care provider,
    // a60 provider is active) plus CCT 31 review aggregates. No WooCommerce
    // and no Dokan calls happen before the buyer adds a service to the cart.
    const sourceProfiles = await fetchDictionaryProviderProfiles();

    // Real rating aggregates from CCT 31 "Review" via relation 264.
    const ratingSummaries = new Map<string, { average: number | null; count: number }>();
    await Promise.all(
      sourceProfiles.map(async (p) => {
        const uid = String(p.id).replace(/^wp-/, "");
         ratingSummaries.set(uid, await fetchProviderRatingSummary(uid));
      }),
    );

    let results: Profile[] = sourceProfiles.map((p) => {
      const numericId = String(p.id).replace(/^wp-/, "");
      const rating = ratingSummaries.get(numericId) || { average: null, count: 0 };
      return { ...p, rating_average: rating.average, rating_count: rating.count } as Profile;
    });
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      results = results.filter((p) => [p.full_name, p.user_name, p.bio, p.location, ...(p.specialty || [])].some((v) => String(v || "").toLowerCase().includes(q)));
    }

    // Remaining filters run client-side over the dictionary rows.

    if (filters?.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter((p) => p.location?.toLowerCase().includes(loc));
    }
    if (filters?.minRating != null) {
      results = results.filter((p) => (p.rating_average ?? 0) >= filters.minRating!);
    }
    if (filters?.serviceLocations && filters.serviceLocations.length > 0) {
      const want = new Set(filters.serviceLocations.map((s) => s.toLowerCase()));
      results = results.filter((p) => (p.service_location_slugs || []).some((s) => want.has(s)));
    }
    if (filters?.serviceTypeSlugs && filters.serviceTypeSlugs.length > 0) {
      const want = new Set(filters.serviceTypeSlugs.map((s) => s.toLowerCase()));
      results = results.filter((p) => (p.service_type_slugs || []).some((s) => want.has(s)));
    }
    if (filters?.minRate != null) {
      results = results.filter((p) => (p.care_provider_starts_hourly_rate ?? 0) >= filters.minRate!);
    }
    if (filters?.maxRate != null) {
      results = results.filter(
        (p) => (p.care_provider_starts_hourly_rate ?? Number.POSITIVE_INFINITY) <= filters.maxRate!,
      );
    }

    // Sorting. Providers with no price / no reviews sort last instead of being
    // treated as "0", which would rank unpriced listings above real ones.
    const byRatingDesc = (a: Profile, b: Profile) =>
      (b.rating_average ?? -1) - (a.rating_average ?? -1);
    const priceOf = (p: Profile) => p.care_provider_starts_hourly_rate;
    if (filters?.sortBy === "rating") results.sort(byRatingDesc);
    else if (filters?.sortBy === "price-low")
      results.sort((a, b) => (priceOf(a) ?? Number.POSITIVE_INFINITY) - (priceOf(b) ?? Number.POSITIVE_INFINITY));
    else if (filters?.sortBy === "price-high")
      results.sort((a, b) => (priceOf(b) ?? -1) - (priceOf(a) ?? -1));
    else results.sort(byRatingDesc);

    return results;
  } catch (error) { throw new Error(`Failed to fetch providers: ${error instanceof Error ? error.message : String(error)}`); }
}

export async function fetchProviderByIdWordPress(id: string): Promise<Profile | null> {
  try {
    const numericId = String(id).replace(/^wp-/, "");
    // Profile page reads the same dictionary row as search (CCT 258), so the
    // card price and the profile price can never disagree, and no Dokan/Woo
    // store call happens before checkout.
    const rows = await wordpressCCTFetch<any[]>(P2.slug, { params: { _limit: 200 } });
    const row = (Array.isArray(rows) ? rows : []).find(
      (r: any) => String(r.author_id || r.cct_author_id || r.user_id) === numericId,
    );
    if (!row || !isListedProviderRow(row)) return null;
    const profile = await mapProviderRow(row);
    if (!profile) return null;
    // Ratings always come from CCT 31 "Review" (relation 264).
    const rating = await fetchProviderRatingSummary(numericId);
    return { ...profile, rating_average: rating.average, rating_count: rating.count };
  } catch (error) { throw new Error(`Failed to fetch provider ${id}: ${error instanceof Error ? error.message : String(error)}`); }
}


