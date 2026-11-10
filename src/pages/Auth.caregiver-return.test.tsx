import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  next: "/become-caregiver",
  navigate: vi.fn(),
  signup: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/router-compat", () => ({
  useNavigate: () => m.navigate,
  useSearchParams: () => [new URLSearchParams({ mode: "signup", next: m.next })],
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ signup: m.signup, login: vi.fn() }) }));
vi.mock("@/contexts/SiteContext", () => ({ useSite: () => ({}) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/services/wp-auth", () => ({ wpRequestPasswordReset: vi.fn() }));
vi.mock("@/components/BrandMark", () => ({ BrandMark: () => null }));
import Auth from "./Auth";

vi.stubGlobal("ResizeObserver", class {
  observe() {}
  unobserve() {}
  disconnect() {}
});

afterEach(() => { cleanup(); vi.clearAllMocks(); m.next = "/become-caregiver"; });

async function submitSignup() {
  render(<Auth />);
  fireEvent.change(document.querySelector("#signup-name") as HTMLInputElement, { target: { value: "test1" } });
  fireEvent.change(document.querySelector("#signup-email") as HTMLInputElement, { target: { value: "test1@example.test" } });
  fireEvent.change(document.querySelector("#signup-password") as HTMLInputElement, { target: { value: "test-only-password-123" } });
  fireEvent.change(document.querySelector("#signup-password-confirm") as HTMLInputElement, { target: { value: "test-only-password-123" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "common.signUp" }));
  await waitFor(() => expect(m.signup).toHaveBeenCalledTimes(1));
}

it("returns a successful common signup directly to the caregiver entry", async () => {
  await submitSignup();
  await waitFor(() => expect(m.navigate).toHaveBeenCalledWith("/become-caregiver"));
});
it("preserves onboarding for unrelated common signup returns", async () => {
  m.next = "/care-circle/28";
  await submitSignup();
  await waitFor(() => expect(m.navigate).toHaveBeenCalledWith("/onboarding?next=%2Fcare-circle%2F28"));
});