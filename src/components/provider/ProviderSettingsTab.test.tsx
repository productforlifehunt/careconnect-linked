import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import ProviderSettingsTab from "./ProviderSettingsTab";
const mocks = vi.hoisted(() => ({ save: vi.fn(), profile: { location: "Shanghai", care_provider_starts_hourly_rate: 50, bio: "", phone: "", provider_is_active: true } }));
vi.mock("@/hooks/use-care-data", () => ({ useMyProfile: () => ({ data: mocks.profile }), useUpdateProfile: () => ({ mutateAsync: mocks.save, isPending: false }) }));
vi.mock("./PayoutAccountsCard", () => ({ default: () => null }));
vi.mock("@/features/providers/activation", () => ({ canActivateProvider: () => true, providerActivationMessage: () => "" }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "zh" } }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it("publishes only the changed visibility field without rewriting phone or biography", async () => {
  render(<MemoryRouter><ProviderSettingsTab /></MemoryRouter>);
  fireEvent.click(screen.getByRole("switch", { name: "公开接单" }));
  fireEvent.click(screen.getByRole("button", { name: "providerDash.saveProfileSettings" }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ provider_is_active: false }));
});