import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({
  authenticated: true,
  list: vi.fn(),
  onboarding: vi.fn(),
  cachedOnboarding: undefined as boolean | undefined,
  pathname: "/cared-ones/46/tips",
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: m.authenticated, isLoading: false }),
}));
vi.mock("@/lib/router-compat", () => ({
  useLocation: () => ({ pathname: m.pathname, search: "" }),
  Navigate: ({ to }: { to: string }) => <div>{to}</div>,
}));
vi.mock("@/features/shared/app-profile", () => ({
  currentAppId: () => "challenged",
  fetchOnboardingDone: m.onboarding,
  getCachedOnboardingDone: () => m.cachedOnboarding,
}));
vi.mock("@/features/cared-ones/source.wordpress", () => ({
  fetchUserCaredOnesWordPress: m.list,
}));
import { RequireAuth } from "./RequireAuth";
afterEach(() => {
  cleanup();
  m.authenticated = true;
  m.cachedOnboarding = undefined;
  m.pathname = "/cared-ones/46/tips";
  vi.clearAllMocks();
});
it("prefetches related people during onboarding without exposing children early", async () => {
  let finish: ((value: boolean) => void) | undefined;
  m.onboarding.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  m.list.mockResolvedValue([]);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RequireAuth>
        <div>Private care content</div>
      </RequireAuth>
    </QueryClientProvider>,
  );
  await waitFor(() => expect(m.list).toHaveBeenCalledTimes(1));
  expect(screen.queryByText("Private care content")).not.toBeInTheDocument();
  finish?.(true);
  expect(await screen.findByText("Private care content")).toBeInTheDocument();
});
it("does not prefetch private people for signed-out visitors", async () => {
  m.authenticated = false;
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RequireAuth>
        <div>Private care content</div>
      </RequireAuth>
    </QueryClientProvider>,
  );
  await Promise.resolve();
  expect(m.list).not.toHaveBeenCalled();
  expect(screen.queryByText("Private care content")).not.toBeInTheDocument();
});
it("opens immediately from the confirmed onboarding cache and rechecks in the background", async () => {
  m.cachedOnboarding = true;
  m.onboarding.mockResolvedValue(true);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RequireAuth>
        <div>Private care content</div>
      </RequireAuth>
    </QueryClientProvider>,
  );
  expect(screen.getByText("Private care content")).toBeInTheDocument();
  await waitFor(() => expect(m.onboarding).toHaveBeenCalledTimes(1));
  expect(screen.getByText("Private care content")).toBeInTheDocument();
});
it("opens caregiver settings without a separate onboarding form", async () => {
  m.pathname = "/caregiver-setting";
  m.cachedOnboarding = false;
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RequireAuth skipOnboarding><div>Caregiver settings</div></RequireAuth>
    </QueryClientProvider>,
  );
  expect(screen.getByText("Caregiver settings")).toBeInTheDocument();
  expect(m.onboarding).not.toHaveBeenCalled();
});
it("still requires login for caregiver settings and preserves its return address", () => {
  m.pathname = "/caregiver-setting";
  m.authenticated = false;
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RequireAuth skipOnboarding><div>Caregiver settings</div></RequireAuth>
    </QueryClientProvider>,
  );
  expect(screen.getByText("/auth?next=%2Fcaregiver-setting")).toBeInTheDocument();
  expect(screen.queryByText("Caregiver settings")).not.toBeInTheDocument();
});
