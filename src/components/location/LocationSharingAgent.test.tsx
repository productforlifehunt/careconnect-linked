import { render, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  flags: { shareOn: false, emergencyAllowed: false },
  start: vi.fn(), stop: vi.fn(), clear: vi.fn(), acknowledge: vi.fn(), write: vi.fn(),
  pending: vi.fn(), permissions: vi.fn(), fences: vi.fn(), listen: vi.fn(), remove: vi.fn(),
  fetchQuery: vi.fn(), invalidate: vi.fn(),
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ isAuthenticated: true }) }));
vi.mock("@/contexts/SiteContext", () => ({ useSite: () => ({ id: "notchsafety" }) }));
vi.mock("@/services/wp-auth", () => ({ getStoredWPUser: () => ({ user_id: "52" }) }));
vi.mock("@/features/shared/app-profile", () => ({ currentAppId: () => "notchsafety" }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => client }));
const client = { fetchQuery: state.fetchQuery, invalidateQueries: state.invalidate };
vi.mock("@capacitor/core", () => ({ Capacitor: { isNativePlatform: () => true, getPlatform: () => "ios" } }));
vi.mock("@careconnect/location", () => ({ CareLocation: {
  start: state.start, stop: state.stop, clearPending: state.clear, getPending: state.pending,
  acknowledge: state.acknowledge, getPermissions: state.permissions, setGeofences: state.fences,
  addListener: state.listen,
} }));
vi.mock("@/features/location/sharing-flags", () => ({ fetchLocationSharingFlags: async () => state.flags }));
vi.mock("@/features/location/source.wordpress", () => ({ writeLocationAndCheckZones: state.write }));
vi.mock("@/features/location/source.wordpress-extended", () => ({ fetchSafeZonesWordPress: async () => [] }));
import { LocationSharingAgent } from "./LocationSharingAgent";

describe("iOS location sharing lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.flags = { shareOn: false, emergencyAllowed: false };
    for (const fn of [state.start, state.stop, state.clear, state.acknowledge, state.write, state.fences, state.invalidate]) fn.mockResolvedValue(undefined);
    state.pending.mockResolvedValue({ positions: [] });
    state.permissions.mockResolvedValue({ location: "whenInUse" });
    state.listen.mockResolvedValue({ remove: state.remove });
    state.fetchQuery.mockImplementation(async ({ queryFn }) => queryFn());
  });
  afterEach(cleanup);
  it("never starts native tracking while CCT258 sharing is off", async () => {
    render(<LocationSharingAgent />);
    await waitFor(() => expect(state.fetchQuery).toHaveBeenCalled());
    expect(state.start).not.toHaveBeenCalled();
    await waitFor(() => expect(state.clear).toHaveBeenCalledTimes(2));
  });
  it("shares native motion and original time using existing cared-one CCT/relation metadata", async () => {
    state.flags.shareOn = true;
    state.pending.mockResolvedValue({ positions: [{ sequence: 7, latitude: 0, longitude: 0, accuracy: 5,
      altitude: -10, heading: 90, speed: 1, moving_type: "walking", battery_level: 10,
      phone_is_charging: false, timestamp: 1794419580000 }] });
    render(<LocationSharingAgent />);
    await waitFor(() => expect(state.acknowledge).toHaveBeenCalledWith({ sequences: [7] }));
    expect(state.start).toHaveBeenCalledWith({ background: true, collectMotion: true, collectVisits: true });
    expect(state.write).toHaveBeenCalledWith(0, 0, {
      accuracy: 5, altitude: -10, heading: 90, speed: 1, moving_type: "walking",
      is_cared_one: true, battery_level: 10, phone_is_charging: false,
      captured_at: new Date(1794419580000).toISOString(),
    });
    expect(state.fences).not.toHaveBeenCalled();
  });
  it("stops tracking and discards session queue when the sharing agent unmounts", async () => {
    state.flags.shareOn = true;
    const view = render(<LocationSharingAgent />);
    await waitFor(() => expect(state.start).toHaveBeenCalled());
    view.unmount();
    await waitFor(() => expect(state.clear).toHaveBeenCalledTimes(2));
    expect(state.stop).toHaveBeenCalledTimes(2);
    expect(state.remove).toHaveBeenCalledTimes(5);
  });
});