import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "zh" } }) }));
vi.mock("@/contexts/SiteContext", () => ({ useSite: () => ({ id: "challenged", family: "dementia" }) }));
vi.mock("@/lib/family-voices", () => ({}));
vi.mock("@/lib/ai", () => ({}));
vi.mock("@/lib/ai-dynamic-knowledge", () => ({ ASSISTANT_CONVERSATION_SKILL: "assistant-conversations", runAssistantConversationSkill: (_skill: string, _operation: string, input: { id: string }) => state.load(input.id) }));
vi.mock("@/lib/ai-static-knowledge", () => ({ appGuideEntries: () => [] }));
vi.mock("@/components/ai/CareTipContextPicker", () => ({ CareTipContextPicker: () => null }));
vi.mock("@/components/ai-elements/conversation", () => ({ Conversation: ({ children }: any) => <div>{children}</div>, ConversationContent: ({ children }: any) => <div>{children}</div>, ConversationScrollButton: () => null }));
vi.mock("@/components/ai-elements/message", () => ({ Message: ({ children }: any) => <div>{children}</div>, MessageContent: ({ children }: any) => <div>{children}</div>, MessageResponse: ({ children }: any) => <div>{children}</div> }));
vi.mock("@/components/ai-elements/prompt-input", () => ({ PromptInput: ({ children }: any) => <div>{children}</div>, PromptInputBody: ({ children }: any) => <div>{children}</div>, PromptInputFooter: ({ children }: any) => <div>{children}</div>, PromptInputTextarea: (props: any) => <textarea {...props} />, PromptInputSubmit: () => null }));
vi.mock("@/components/ai-elements/shimmer", () => ({ Shimmer: ({ children }: any) => <span>{children}</span> }));

import { AICompanionChat } from "./AICompanionChat";

afterEach(() => { cleanup(); state.load.mockReset(); });
function mount(id: string) {
  const client = new QueryClient();
  const chat = (threadId: string) => <QueryClientProvider client={client}><AICompanionChat active threadId={threadId} /></QueryClientProvider>;
  const result = render(chat(id));
  return { ...result, select: (nextId: string) => result.rerender(chat(nextId)) };
}

it("replaces the first conversation's user and assistant messages when selecting another conversation", async () => {
  state.load.mockImplementation(async (id: string) => [{ role: "user", content: `问题-${id}` }, { role: "assistant", content: `回答-${id}` }]);
  const chat = mount("101");
  await screen.findByText("回答-101");
  chat.select("102");
  await screen.findByText("回答-102");
  expect(screen.queryByText("问题-101")).toBeNull();
  expect(screen.queryByText("回答-101")).toBeNull();
});

it("does not let a late history response replace the conversation selected last", async () => {
  let finishFirst: ((rows: { role: string; content: string }[]) => void) | undefined;
  state.load.mockImplementation((id: string) => id === "101" ? new Promise((resolve) => { finishFirst = resolve; }) : Promise.resolve([{ role: "assistant", content: "最后选择的对话" }]));
  const chat = mount("101");
  await waitFor(() => expect(state.load).toHaveBeenCalledWith("101"));
  chat.select("102");
  await screen.findByText("最后选择的对话");
  await act(async () => { finishFirst?.([{ role: "assistant", content: "迟到的旧对话" }]); });
  expect(screen.queryByText("迟到的旧对话")).toBeNull();
  expect(screen.getByText("最后选择的对话")).toBeInTheDocument();
});