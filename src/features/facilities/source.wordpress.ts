import { wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { T } from "@/integrations/wp-schema";

// CCT slug: care_facility | a55=name, a56=detail, a57=type, a63=location, a64=address
export async function fetchCareFacilitiesWordPress(): Promise<any[]> {
  try {
    const items = await wordpressCCTFetch(T.careFacility.slug, { params: { _limit: 100 } });
    if (!Array.isArray(items)) return [];
    return items.map((f: any) => ({
      id: f.id,
      name: f.a55 || "Facility",
      description: f.a56 || null,
      location: f.a63 || null,
      address: f.a64 || null,
      phone: f.phone || null,
      email: f.email || null,
      website: f.website || null,
      rating_average: f.rating || f.rating_average || null,
      review_count: f.review_count || 0,
      type: f.a57 || null,
      country: f.country || null,
      c_province: f.c_province || null,
      c_city: f.c_city || null,
      service_category: f.service_category || [],
      service_type: f.service_type || [],
      created_at: f.created_at,
    }));
  } catch {
    return [];
  }
}

export async function fetchCareFacilityByIdWordPress(id: string): Promise<any | null> {
  try {
    const f = await wordpressCCTFetch(T.careFacility.slug, { id }) as any;
    if (!f) return null;
    return {
      id: f.id,
      name: f.a55 || "Facility",
      description: f.a56 || null,
      location: f.a63 || null,
      address: f.a64 || null,
      phone: f.phone || null,
      email: f.email || null,
      website: f.website || null,
      rating_average: f.rating || f.rating_average || null,
      review_count: f.review_count || 0,
      type: f.a57 || null,
      country: f.country || null,
      c_province: f.c_province || null,
      c_city: f.c_city || null,
      service_category: f.service_category || [],
      service_type: f.service_type || [],
      created_at: f.created_at,
      updated_at: f.updated_at,
    };
  } catch {
    return null;
  }
}
