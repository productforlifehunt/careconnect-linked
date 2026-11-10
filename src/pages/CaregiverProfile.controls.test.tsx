import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import CaregiverProfile from "./CaregiverProfile";
import { TooltipProvider } from "@/components/ui/tooltip";
const mocks = vi.hoisted(() => ({ mutate: vi.fn(), pending: false, userId: 70, edit: vi.fn() }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "zh" }, t: (_key: string, fallback: string) => fallback }) }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ isAuthenticated: true, user: { user_id: mocks.userId } }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/components/comments/CommentsSection", () => ({ CommentsSection: () => null }));
vi.mock("@/hooks/use-cart", () => ({ useAddToCart: () => ({ isPending: false }) }));
vi.mock("@/features/reviews/edit", () => ({ editOwnReview: mocks.edit }));
vi.mock("@/hooks/use-care-data", () => ({
  useProvider: () => ({ data: { id: "wp-46", full_name: "test1", service_location_slugs: ["in-person"], service_type_slugs: ["in-person-elderly-care-and-companion"], care_provider_hourly_rate_in_person: 40 } }),
  useProviderReviews: () => ({ data: [{ id: "118", author_id: "wp-70", author_name: "评价作者", content: "原评价", rating: 5, created_at: "2026-11-10" }] }),
  useSavedProviderIds: () => ({ data: [], isLoading: false }),
  useToggleSavedProvider: () => ({ mutate: mocks.mutate, isPending: mocks.pending }),
  useCreateReview: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useStartConversation: () => ({ isPending: false }),
  useProviderAvailability: () => ({ data: [] }),
}));
afterEach(() => { cleanup(); mocks.pending = false; mocks.userId = 70; vi.clearAllMocks(); });
function mount() {
  const router = createMemoryRouter([{ path: "/caregiver/:id", Component: CaregiverProfile }, { path: "/search-caregiver", element: <div>搜索</div> }], { initialEntries: ["/caregiver/wp-46"] });
  render(<QueryClientProvider client={new QueryClient()}><TooltipProvider><RouterProvider router={router} /></TooltipProvider></QueryClientProvider>);
  return router;
}
it("selects the clicked service in the existing caregiver search", async () => {
  const router = mount();
  fireEvent.click(screen.getByRole("button", { name: "上门长者照护与陪伴" }));
  await waitFor(() => expect(router.state.location.search).toBe("?service_type=in-person-elderly-care-and-companion"));
});
it("submits explicit unsaved membership without waiting for a favorite directory", () => {
  mount(); fireEvent.click(screen.getByRole("button", { name: "收藏" }));
  expect(mocks.mutate).toHaveBeenCalledWith({ providerId: "wp-46", currentlySaved: false }, expect.any(Object));
});
it("allows the writer to edit the saved review", async () => {
  mount(); fireEvent.click(screen.getByRole("button", { name: "编辑" }));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "作者修订" } });
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
  await waitFor(() => expect(mocks.edit).toHaveBeenCalledWith({ id: "118", rating: 5, content: "作者修订" }));
});
it("does not offer editing to the reviewed caregiver", () => {
  mocks.userId = 46; mount(); expect(screen.queryByRole("button", { name: "编辑" })).toBeNull();
});