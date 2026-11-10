import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Messages from "./Messages";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "zh" }, t: (key: string) => key }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/components/messages/MessageAttachment", () => ({ MessageAttachment: () => null }));
vi.mock("@/components/messages/MessageBubble", () => ({ MessageBubble: () => null }));
vi.mock("@/components/messages/QuoteDialog", () => ({ QuoteDialog: () => null }));
vi.mock("@/hooks/use-care-data", () => {
  const conversations = [{ id: "7", other_user_id: "54", other_user_name: "甲", unread_count: 0 }, { id: "8", other_user_id: "55", other_user_name: "乙", unread_count: 0 }];
  const mutation = { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false };
  return { useConversations: () => ({ data: conversations }), useMyProfile: () => ({ data: { id: "46" } }), useDirectMessages: () => ({ data: [] }), useSendMessage: () => mutation, useStartConversation: () => mutation, useMarkMessagesRead: () => mutation, useSearchProfiles: () => ({ data: [] }) };
});

afterEach(cleanup);

it("returns to the conversation list and restores selected chat with history", async () => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  const router = createMemoryRouter([{ path: "/inbox", Component: Messages }], { initialEntries: ["/inbox?tab=messages"] });
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={router} /></QueryClientProvider>);
  fireEvent.click(screen.getByText("甲", { selector: ".truncate" }));
  await waitFor(() => expect(router.state.location.search).toBe("?tab=messages&conversation=7"));
  fireEvent.click(screen.getByText("乙", { selector: ".truncate" }));
  await waitFor(() => expect(router.state.location.search).toBe("?tab=messages&conversation=8"));
  await act(async () => { await router.navigate(-1); });
  await waitFor(() => expect(router.state.location.search).toBe("?tab=messages&conversation=7"));
  await act(async () => { await router.navigate(-1); });
  await waitFor(() => expect(router.state.location.search).toBe("?tab=messages"));
  expect(screen.queryByPlaceholderText("messages.typeMessage")).toBeNull();
  await act(async () => { await router.navigate(1); });
  await waitFor(() => expect(router.state.location.search).toBe("?tab=messages&conversation=7"));
});