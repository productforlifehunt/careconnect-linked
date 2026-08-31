import { wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { T } from "@/integrations/wp-schema";

// CCT slug: care_facility | a55=name, a56=detail, a57=type, a63=location, a64=address
export async function fetchCareFacilitiesWordPress(): Promise<any[]> {
  const F = T.careFacility.f;
  const items = await wordpressCCTFetch(T.careFacility.slug, { params: { _limit: 100 } });
  if (!Array.isArray(items)) throw new Error("Care facilities returned an invalid response");
  return items
    .filter((f: any) => String(f[F.FACILITY_IS_APPROVED]) === T.careFacility.opt.FACILITY_IS_APPROVED.YES)
    .map((f: any) => ({
      id: f.id,
      name: f[F.NAME] || null,
      description: f[F.DETAIL] || null,
      location: f[F.LOCATION] || null,
      address: f[F.ADDRESS] || null,
      phone: f[F.PHONE] || null,
      email: f[F.EMAIL] || null,
      type: f[F.CARE_FACILITY_TYPE] || null,
      dementia_stage: f[F.CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE] || null,
      room_type: f[F.CARE_FACILITY_ROOM_TYPE] || null,
      room_facility: f[F.CARE_FACILITY_PROVIDES_ROOM_FACILITY] || null,
      community_facility: f[F.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY] || null,
      people_number: f[F.CARE_FACILITY_PEOPLE_NUMBER] || null,
      is_approved: true,
      created_at: f.created_at,
    }));
}

export async function fetchCareFacilityByIdWordPress(id: string): Promise<any | null> {
  const F = T.careFacility.f;
  const f = await wordpressCCTFetch(T.careFacility.slug, { id }) as any;
  if (!f || String(f[F.FACILITY_IS_APPROVED]) !== T.careFacility.opt.FACILITY_IS_APPROVED.YES) return null;
  return {
      id: f.id,
      name: f[F.NAME] || null,
      description: f[F.DETAIL] || null,
      location: f[F.LOCATION] || null,
      address: f[F.ADDRESS] || null,
      phone: f[F.PHONE] || null,
      email: f[F.EMAIL] || null,
      type: f[F.CARE_FACILITY_TYPE] || null,
      dementia_stage: f[F.CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE] || null,
      room_type: f[F.CARE_FACILITY_ROOM_TYPE] || null,
      room_facility: f[F.CARE_FACILITY_PROVIDES_ROOM_FACILITY] || null,
      community_facility: f[F.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY] || null,
      people_number: f[F.CARE_FACILITY_PEOPLE_NUMBER] || null,
      is_approved: true,
      created_at: f.created_at,
      updated_at: f.updated_at,
    };
}
