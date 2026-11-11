import { beforeEach, describe, expect, it, vi } from "vitest";

const native = vi.hoisted(() => ({ ios: true, get: vi.fn() }));
vi.mock("@capacitor/core", () => ({ Capacitor: {
  isNativePlatform: () => native.ios,
  getPlatform: () => native.ios ? "ios" : "web",
} }));
vi.mock("@careconnect/location", () => ({ CareLocation: { getCurrentPosition: native.get } }));
import { getCurrentPosition, toGeo } from "./geolocation";

describe("shared location adapter", () => {
  beforeEach(() => { native.ios = true; native.get.mockReset(); });
  it("reads iOS native fields without dropping accuracy, acquisition time or motion", async () => {
    const result = { latitude: 0, longitude: 0, accuracy: 3, altitude: -20, altitudeAccuracy: 2,
      heading: 90, headingAccuracy: 4, speed: 8, speedAccuracy: 0.5,
      timestamp: 1794419580000, moving_type: "automotive", battery_level: 70, phone_is_charging: true };
    native.get.mockResolvedValue(result);
    expect(await getCurrentPosition({ timeout: 5000 })).toEqual(result);
    expect(native.get).toHaveBeenCalledWith({ timeout: 5000 });
  });
  it("returns unavailable rather than inventing a location after permission denial", async () => {
    native.get.mockRejectedValue(new Error("Location permission denied"));
    expect(await getCurrentPosition()).toBeNull();
  });
  it("keeps web zero coordinates, below-sea-level altitude and vertical accuracy", () => {
    expect(toGeo({ latitude: 0, longitude: 0, accuracy: 5, altitude: -30, altitudeAccuracy: 4 }))
      .toEqual({ latitude: 0, longitude: 0, accuracy: 5, altitude: -30, altitudeAccuracy: 4, heading: null, speed: null });
  });
});