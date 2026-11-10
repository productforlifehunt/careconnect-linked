import { describe, expect, it } from "vitest";
import { canActivateProvider } from "./activation";

const ready = { location: "Shanghai", bio: "上门陪伴", care_provider_starts_hourly_rate: 50 };
describe("provider activation required fields", () => {
  it("requires location", () => expect(canActivateProvider({ ...ready, location: " " })).toBe(false));
  it("requires hourly rate", () => expect(canActivateProvider({ ...ready, care_provider_starts_hourly_rate: null })).toBe(false));
  it("requires biography", () => expect(canActivateProvider({ ...ready, bio: " " })).toBe(false));
  it("requires neither phone nor service selection", () => expect(canActivateProvider({ ...ready, phone: "", service_type_slugs: [] })).toBe(true));
});