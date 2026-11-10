import { describe, expect, it } from "vitest";
import { canActivateProvider } from "./activation";

const ready = { location: "Shanghai", service_type_slugs: ["in-person-elderly-care-and-companion"], care_provider_hourly_rate_in_person: 50 };
describe("provider activation required fields", () => {
  it("requires location", () => expect(canActivateProvider({ ...ready, location: " " })).toBe(false));
  it("requires a service type", () => expect(canActivateProvider({ ...ready, service_type_slugs: [] })).toBe(false));
  it("requires the corresponding in-person price", () => expect(canActivateProvider({ ...ready, care_provider_hourly_rate_in_person: null })).toBe(false));
  it("does not require phone or biography", () => expect(canActivateProvider(ready)).toBe(true));
  it("requires remote hourly rate for remote companionship", () => {
    expect(canActivateProvider({ ...ready, service_type_slugs: ["remote-elderly-companion"] })).toBe(false);
    expect(canActivateProvider({ ...ready, service_type_slugs: ["remote-elderly-companion"], care_provider_hourly_rate_remote: 20 })).toBe(true);
  });
  it("requires a69 for remote check-ins, not the general remote rate", () => {
    const profile = { ...ready, service_type_slugs: ["remote-checkin"], care_provider_hourly_rate_remote: 20 };
    expect(canActivateProvider(profile)).toBe(false);
    expect(canActivateProvider({ ...profile, care_provider_rate_remote_checkin: 10 })).toBe(true);
  });
  it("requires a70 for remote medicine reminders", () => {
    expect(canActivateProvider({ ...ready, service_type_slugs: ["remote-medicine-supervision"] })).toBe(false);
    expect(canActivateProvider({ ...ready, service_type_slugs: ["remote-medicine-supervision"], care_provider_rate_remote_medicine: 10 })).toBe(true);
  });
  it("requires each selected service's price", () => expect(canActivateProvider({ ...ready, service_type_slugs: [...ready.service_type_slugs, "remote-checkin"] })).toBe(false));
  it("pairs non-specific services with selected delivery modes", () => {
    const profile = { ...ready, service_type_slugs: ["housekeeping"], service_location_slugs: ["in-person", "remote"] };
    expect(canActivateProvider(profile)).toBe(false);
    expect(canActivateProvider({ ...profile, care_provider_hourly_rate_remote: 20 })).toBe(true);
  });
});