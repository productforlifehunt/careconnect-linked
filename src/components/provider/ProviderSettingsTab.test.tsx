import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import ProviderSettingsTab from "./ProviderSettingsTab";
const mocks = vi.hoisted(() => ({ save: vi.fn(), vendor: vi.fn(), profile: { location: "Shanghai", care_provider_starts_hourly_rate: 50, bio: "", phone: "", provider_is_active: true } as any }));
vi.mock("@/hooks/use-care-data", () => ({ useMyProfile: () => ({ data: mocks.profile }), useUpdateProfile: () => ({ mutateAsync: mocks.save, isPending: false }) }));
vi.mock("@/services/woocommerce-api", () => ({ ensureDokanVendor: mocks.vendor }));
vi.mock("./PayoutAccountsCard", () => ({ default: () => null }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "zh" } }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); mocks.profile = { location: "Shanghai", care_provider_starts_hourly_rate: 50, bio: "", phone: "", provider_is_active: true }; });
it("turning visibility off saves only the visibility field immediately", async () => {
  render(<MemoryRouter><ProviderSettingsTab /></MemoryRouter>);
  fireEvent.click(screen.getByRole("switch", { name: "公开接单" }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ provider_is_active: false }));
  expect(mocks.vendor).not.toHaveBeenCalled();
});
it("turning visibility on verifies the payment store before publishing", async () => {
  mocks.profile = { ...mocks.profile, bio: "简介", provider_is_active: false };
  mocks.vendor.mockResolvedValue({ store_id: 52, enabled: true, created: false });
  render(<MemoryRouter><ProviderSettingsTab /></MemoryRouter>);
  const toggle = screen.getByRole("switch", { name: "公开接单" });
  fireEvent.click(toggle);
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ provider_is_active: true }));
  expect(mocks.vendor.mock.invocationCallOrder[0]).toBeLessThan(mocks.save.mock.invocationCallOrder[0]);
  await waitFor(() => expect(toggle.getAttribute("aria-checked")).toBe("true"));
});
it("stays hidden when the payment store cannot be verified", async () => {
  mocks.profile = { ...mocks.profile, bio: "简介", provider_is_active: false };
  mocks.vendor.mockRejectedValue(new Error("failed"));
  render(<MemoryRouter><ProviderSettingsTab /></MemoryRouter>);
  const toggle = screen.getByRole("switch", { name: "公开接单" });
  fireEvent.click(toggle);
  await waitFor(() => expect(mocks.vendor).toHaveBeenCalled());
  await waitFor(() => expect(toggle.hasAttribute("disabled")).toBe(false));
  expect(mocks.save).not.toHaveBeenCalled();
  expect(toggle.getAttribute("aria-checked")).toBe("false");
});
it("saves incomplete settings even when the existing profile is visible", async () => {
  render(<MemoryRouter><ProviderSettingsTab /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText(/common.location/), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "providerDash.saveProfileSettings" }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ location: "" }));
});
it("does not enable visibility with an empty biography", () => {
  mocks.profile = { ...mocks.profile, provider_is_active: false };
  render(<MemoryRouter><ProviderSettingsTab /></MemoryRouter>);
  const toggle = screen.getByRole("switch", { name: "公开接单" });
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-checked")).toBe("false");
  expect(mocks.vendor).not.toHaveBeenCalled();
});
