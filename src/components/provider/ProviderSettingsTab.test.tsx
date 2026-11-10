import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import ProviderSettingsTab from "./ProviderSettingsTab";
const mocks = vi.hoisted(() => ({ save: vi.fn(), profile: { location: "Shanghai", care_provider_starts_hourly_rate: 50, bio: "", phone: "", provider_is_active: true } }));
vi.mock("@/hooks/use-care-data", () => ({ useMyProfile: () => ({ data: mocks.profile }), useUpdateProfile: () => ({ mutateAsync: mocks.save, isPending: false }) }));
vi.mock("./PayoutAccountsCard", () => ({ default: () => null }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "zh" } }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it("publishes only the changed visibility field without rewriting phone or biography", async () => {
  render(<MemoryRouter><ProviderSettingsTab /></MemoryRouter>);
  fireEvent.click(screen.getByRole("switch", { name: "公开接单" }));
  fireEvent.click(screen.getByRole("button", { name: "providerDash.saveProfileSettings" }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ provider_is_active: false }));
});
it("saves incomplete settings even when the existing profile is visible", async () => {
  render(<MemoryRouter><ProviderSettingsTab /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText(/common.location/), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "providerDash.saveProfileSettings" }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ location: "" }));
});
it("does not enable visibility with an empty biography", () => {
  render(<MemoryRouter><ProviderSettingsTab /></MemoryRouter>);
  const toggle = screen.getByRole("switch", { name: "公开接单" });
  fireEvent.click(toggle);
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-checked")).toBe("false");
});