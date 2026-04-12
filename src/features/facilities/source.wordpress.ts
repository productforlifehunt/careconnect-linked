import { wordpressCCTFetch } from "@/features/shared/wordpress-client";

// CCT slug: care_facility | flat fields
export async function fetchCareFacilitiesWordPress(): Promise<any[]> {
  try {
    const items = await wordpressCCTFetch("care_facility", { params: { _limit: 100 } });
    if (!Array.isArray(items)) return [];
    return items.map((f: any) => ({
      id: f.id,
      name: f.name || f.title || "Facility",
      description: f.description || null,
      location: f.location || null,
      address: f.address || null,
      phone: f.phone || null,
      email: f.email || null,
      website: f.website || null,
      rating_average: f.rating || f.rating_average || null,
      review_count: f.review_count || 0,
      type: f.type || null,
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
    const f = await wordpressCCTFetch("care_facility", { id }) as any;
    if (!f) return null;
    return {
      id: f.id,
      name: f.name || f.title || "Facility",
      description: f.description || null,
      location: f.location || null,
      address: f.address || null,
      phone: f.phone || null,
      email: f.email || null,
      website: f.website || null,
      rating_average: f.rating || f.rating_average || null,
      review_count: f.review_count || 0,
      type: f.type || null,
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
