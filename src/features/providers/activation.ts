import type { Profile } from "@/types/care-connector";
import { careServiceTypeBySlug } from "@/lib/care-service-types";

const hasRate = (rate: number | null | undefined) => typeof rate === "number" && Number.isFinite(rate) && rate > 0;

/** Required public-care fields, using the existing dictionary service/rate pairing. */
export function canActivateProvider(profile: Partial<Profile>): boolean {
  if (!profile.location?.trim() || !profile.service_type_slugs?.length) return false;
  return profile.service_type_slugs.every(slug => {
    if (slug === "remote-checkin") return hasRate(profile.care_provider_rate_remote_checkin);
    if (slug === "remote-medicine-supervision") return hasRate(profile.care_provider_rate_remote_medicine);
    const service = careServiceTypeBySlug(slug);
    if (!service) return false;
    const modes = service.delivery ? [service.delivery] : profile.service_location_slugs || [];
    return modes.length > 0 && modes.every(mode => mode === "in-person"
      ? hasRate(profile.care_provider_hourly_rate_in_person)
      : mode === "remote" && hasRate(profile.care_provider_hourly_rate_remote));
  });
}

export function providerActivationMessage(zh: boolean): string {
  return zh ? "请先填写所在地，并保存服务类型及各项对应价格，再开启公开接单。"
    : "Complete your location and save your service types with their corresponding rates before accepting bookings publicly.";
}