import type { Profile } from "@/types/care-connector";

import { T } from "@/integrations/wp-schema";
import { getWordPressFeature, listWordPressFeature } from "@/features/shared/wordpress-adapter";
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { fetchAllProviderProductSummaries } from "@/services/woocommerce-api";
import { fetchProviderRatingSummary } from "@/features/reviews/source.wordpress";

// Provider fields live on CCT 258 "User's extended profile 2".
const P2 = T.userProfile2;
const F_PROFILE = P2.f;

function parseWpBoolean(value: unknown): boolean {
  return value === true || value === 1 || (typeof value === "string" && ["yes", "true", "1", "active", "Active"].includes(value));
}

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

async function fetchDictionaryProviderProfiles(): Promise<Profile[]> {
  const rows = await wordpressCCTFetch<any[]>(P2.slug, { params: { _limit: 200 } });
  const activeRows = (Array.isArray(rows) ? rows : []).filter(
    (row) => String(row[F_PROFILE.IS_CARE_PROVIDER]) === P2.opt.IS_CARE_PROVIDER.YES
      && String(row[F_PROFILE.CARE_PROVIDER_IS_ACTIVE]) === P2.opt.CARE_PROVIDER_IS_ACTIVE.YES,
  );

  const profiles = await Promise.all(activeRows.map(async (row) => {
    const userId = Number(row.author_id || row.cct_author_id || row.user_id);
    if (!userId) return null;
    let user: any = null;
    try { user = await wordpressFetch<any>(`wp/v2/users/${userId}`); } catch {}
    const fullName = user?.name || row.full_name || row.name || row.user_name || "Provider";
    return {
      id: `wp-${userId}`,
      user_id: `wp-${userId}`,
      email: user?.email || row.email || null,
      first_name: user?.first_name || null,
      last_name: user?.last_name || null,
      full_name: fullName,
      user_name: user?.slug || row.user_name || null,
      avatar_url: user?.avatar_urls?.["96"] || user?.avatar_urls?.["48"] || row.avatar_url || null,
      bio: user?.description || row.bio || null,
      general_user_role: parseWpList(row[F_PROFILE.GENERAL_USER_ROLE]),
      is_care_provider: true,
      provider_is_active: true,
      care_provider_is_background_checked: String(row[F_PROFILE.CARE_PROVIDER_IS_BACKGROUND_CHECKED]) === P2.opt.CARE_PROVIDER_IS_BACKGROUND_CHECKED.YES,
      care_provider_background_check_detail: row[F_PROFILE.CARE_PROVIDER_S_BACKGROUND_CHECK_DETAIL] || null,
      care_provider_starts_hourly_rate: (() => {
        const inPerson = parseFloat(row[F_PROFILE.CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE]);
        const remote = parseFloat(row[F_PROFILE.CARE_PROVIDER_S_HOURLY_RATE_FOR_REMOTE_SERVICE]);
        const rates = [inPerson, remote].filter((n) => Number.isFinite(n) && n > 0);
        return rates.length ? Math.min(...rates) : null;
      })(),
      phone: row.phone || null,
      location: row.location || null,
      years_of_experience: row.years_of_experience ? parseInt(row.years_of_experience, 10) : null,
      certifications: parseWpList(row.certifications),
      specialty: parseWpList(row.specialty),
      rating_average: null,
      rating_count: null,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || row.created_at || new Date().toISOString(),
    } satisfies Profile;
  }));

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
  /** pa_service-location slugs to require (any-of). e.g. ["in-person", "remote"]. */
  serviceLocations?: string[];
  /** pa_service-type slugs to require (any-of). */
  serviceTypeSlugs?: string[];
}

export async function fetchProvidersWordPress(filters?: ProviderFilters): Promise<Profile[]> {
  try {
    const params: Record<string, string | number> = {};
    if (filters?.query) params.search = filters.query;

    // Run the Dokan store list and the WC product summary scan in parallel —
    // the product summaries hydrate each provider card with min_block_cost +
    // pa_service-type / pa_service-location attribute slugs so we can filter
    // against the real package catalogue (not the stale CCT hourly_rate).
    const [dictionaryProfiles, storeResults, productSummaries] = await Promise.all([
      fetchDictionaryProviderProfiles().catch(() => []),
      listWordPressFeature<Profile[]>("providers", { params }).catch(() => []),
      fetchAllProviderProductSummaries().catch(() => new Map()),
    ]);

    // Single source of truth for "is this a listed care provider": CCT 258
    // (a59 = is care provider, a60 = provider is active). Dokan stores only
    // enrich these rows — a store is never promoted into a provider listing.
    const activeProfileIds = new Set(dictionaryProfiles.map((p) => String(p.id).replace(/^wp-/, "")));
    const sourceProfiles = dictionaryProfiles;

    const storeById = new Map<string, Profile>();
    (storeResults || []).forEach((s: Profile) => {
      storeById.set(String(s.id).replace(/^wp-/, ""), s);
    });

    // Real rating aggregates from CCT 31 "Review" via relation 264.
    const ratingSummaries = new Map<string, { average: number | null; count: number }>();
    await Promise.all(
      sourceProfiles.map(async (p) => {
        const uid = String(p.id).replace(/^wp-/, "");
        ratingSummaries.set(uid, await fetchProviderRatingSummary(uid).catch(() => ({ average: null, count: 0 })));
      }),
    );

    let results: Profile[] = sourceProfiles.map((p) => {
      const numericId = String(p.id).replace(/^wp-/, "");
      const store = storeById.get(numericId);
      const summary = productSummaries.get(String(p.id)) || productSummaries.get(numericId) || productSummaries.get(String(p.user_id || "").replace(/^wp-/, ""));
      const rating = ratingSummaries.get(numericId) || { average: null, count: 0 };
      const merged: Profile = {
        ...p,
        // Dokan store data only fills gaps the dictionary profile left empty.
        avatar_url: p.avatar_url || store?.avatar_url || null,
        bio: p.bio || store?.bio || null,
        location: p.location || store?.location || null,
        rating_average: rating.average,
        rating_count: rating.count,
      };
      if (!summary) return merged;
      return {
        ...merged,
        min_block_cost: summary.minBlockCost || null,
        service_type_slugs: summary.serviceTypeSlugs,
        service_location_slugs: summary.serviceLocationSlugs,
        // Mirror min_block_cost into the legacy hourly_rate field so existing
        // card UI ("$X / hour") shows the real package price.
        care_provider_starts_hourly_rate:
          summary.minBlockCost > 0 ? summary.minBlockCost : merged.care_provider_starts_hourly_rate,
      };
    });

    results = results.filter((p) => activeProfileIds.has(String(p.id).replace(/^wp-/, "")));


    if (filters?.query) {
      const q = filters.query.toLowerCase();
      results = results.filter((p) => [p.full_name, p.user_name, p.bio, p.location, ...(p.specialty || [])].some((v) => String(v || "").toLowerCase().includes(q)));
    }

    // Client-side filtering for fields Dokan API doesn't natively filter
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
  } catch {
    return [];
  }
}

export async function fetchProviderByIdWordPress(id: string): Promise<Profile | null> {
  try {
    const profile = await getWordPressFeature<Profile>("provider", { endpointArgs: { id } });
    if (!profile) return null;
    // Ratings always come from CCT 31 "Review" (relation 264), never from the
    // Dokan/Woo store aggregate, so profile and search agree.
    const rating = await fetchProviderRatingSummary(id).catch(() => ({ average: null, count: 0 }));
    return { ...profile, rating_average: rating.average, rating_count: rating.count };
  } catch {
    return null;
  }
}

