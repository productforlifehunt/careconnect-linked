import { describe, expect, it, vi } from "vitest";
import type { CareLocationPlugin, PendingPosition } from "@careconnect/location";
import { flushNativePositions, nativeCircleFences } from "./native-tracking";

const sample: PendingPosition = {
  sequence: 1, latitude: 0, longitude: 0, accuracy: 5, altitude: -12,
  altitudeAccuracy: 2, heading: 90, headingAccuracy: 3, speed: 1, speedAccuracy: 0.2,
  timestamp: 1794419580000, moving_type: "walking", simulated: false, accessory: false,
  battery_level: 10, phone_is_charging: false,
};
function plugin(positions = [sample]) {
  return { getPending: vi.fn().mockResolvedValue({ positions }), acknowledge: vi.fn().mockResolvedValue(undefined) } as unknown as CareLocationPlugin;
}
describe("native pending position sync", () => {
  it("keeps zero coordinates, negative altitude, original time and actual motion in the confirmed write", async () => {
    const native = plugin();
    const write = vi.fn().mockResolvedValue({ id: "213" });
    expect(await flushNativePositions(native, write, () => true)).toBe(1);
    expect(write).toHaveBeenCalledWith(sample);
    expect(native.acknowledge).toHaveBeenCalledWith({ sequences: [1] });
    expect(write.mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(native.acknowledge).mock.invocationCallOrder[0] ?? Infinity);
  });
  it("does not acknowledge a failed CCT/relation write", async () => {
    const native = plugin();
    await expect(flushNativePositions(native, vi.fn().mockRejectedValue(new Error("write failed")), () => true)).rejects.toThrow("write failed");
    expect(native.acknowledge).not.toHaveBeenCalled();
  });
  it("does not submit samples when the account/session is no longer current", async () => {
    const native = plugin([sample, { ...sample, sequence: 2 }]);
    const write = vi.fn();
    expect(await flushNativePositions(native, write, () => false)).toBe(0);
    expect(write).not.toHaveBeenCalled();
  });
});
describe("native fences mirror real circular zones", () => {
  it("preserves zero coordinates and exact radius; never converts polygons or schedules to circles", () => {
    const zone = { id: "214", is_active: true, shape_type: "Radius", latitude: 0, longitude: 0,
      radius_meters: 120, notify_on_enter: true, notify_on_exit: false, schedule_enabled: false };
    expect(nativeCircleFences([zone, { ...zone, id: "polygon", shape_type: "Polygon" },
      { ...zone, id: "scheduled", schedule_enabled: true }, { ...zone, id: "inactive", is_active: false }]))
      .toEqual([{ identifier: "214", latitude: 0, longitude: 0, radius: 120, notifyOnEntry: true, notifyOnExit: false }]);
  });
});