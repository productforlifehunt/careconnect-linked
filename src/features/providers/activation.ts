import type { Profile } from "@/types/care-connector";

const hasRate = (rate: number | null | undefined) => typeof rate === "number" && Number.isFinite(rate) && rate > 0;

/** Only location, default hourly rate and biography gate public visibility. */
export function canActivateProvider(profile: Partial<Profile>): boolean {
  return Boolean(profile.location?.trim() && profile.bio?.trim() &&
    hasRate(profile.care_provider_starts_hourly_rate ?? profile.care_provider_hourly_rate_in_person));
}

export function providerActivationMessage(zh: boolean): string {
  return zh ? "请先填写位置、小时费率和个人简介，再开启公开接单。"
    : "Complete your location, hourly rate and biography before accepting bookings publicly.";
}