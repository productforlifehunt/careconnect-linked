import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ site: "challenged", user: "46", fail: false, people: [{ user_id: "46", cared_one: { full_name: "爸爸" } }, { user_id: "47", cared_one: { full_name: "妈妈" } }, { user_id: "48", invitation_status: "pending", cared_one: { full_name: "待确认" } }] }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "zh" } }) }));
vi.mock("@/contexts/SiteContext", () => ({ useSite: () => ({ id: state.site }) }));
vi.mock("@/services/wp-auth", () => ({ getStoredWPUser: () => ({ user_id: state.user }) }));
vi.mock("@/hooks/use-care-data", () => ({ useUserCaredOnes: () => ({ data: state.people, isPending: false, isFetching: false, isError: false }) }));
vi.mock("@/features/cared-ones/source.wordpress-extended", () => ({ fetchCareTipsWordPress: vi.fn(async (person: string) => {
  if (state.fail) throw new Error("Read failed");
  return person === "46" ? [{ id: "101", title: "饭后", content: "饭后正文不应显示", category: "tip" }, { id: "102", title: "避免争辩", content: "避免正文不应显示", category: "avoid" }] : [];
}) }));
import { CareTipContextPicker } from "./CareTipContextPicker";

beforeEach(async () => { await import("@/features/cared-ones/source.wordpress-extended"); localStorage.clear(); state.site = "challenged"; state.user = "46"; state.fail = false; });
afterEach(cleanup);
function mount() {
  const onActiveTipsChange = vi.fn(); const onSendTips = vi.fn(async (_tips: unknown[]) => true);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const rendered = render(<QueryClientProvider client={client}><CareTipContextPicker enabled onActiveTipsChange={onActiveTipsChange} onSendTips={onSendTips} /></QueryClientProvider>);
  return { ...rendered, onActiveTipsChange, onSendTips, client };
}
async function open() { fireEvent.click(await screen.findByRole("button", { name: "选择护理小贴士" })); await screen.findByRole("checkbox", { name: "选择发送给 AI: 饭后" }); }
const key = "ai-care-tip-context:challenged:46";

describe("care-tip picker acceptance", () => {
  it("switches named people and excludes pending invitations", async () => {
    mount(); await open(); expect(screen.queryByRole("tab", { name: /待确认/ })).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: /妈妈/ }));
    expect(await screen.findByText("这位家人还没有护理小贴士。")).toBeInTheDocument();
  });
  it("sends multiple hidden bodies without enabling or saving them", async () => {
    const { onSendTips, onActiveTipsChange } = mount(); await open();
    fireEvent.click(screen.getByRole("checkbox", { name: "选择发送给 AI: 饭后" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "选择发送给 AI: 避免争辩" }));
    fireEvent.click(screen.getByRole("button", { name: "发送给 AI" }));
    await waitFor(() => expect(onSendTips).toHaveBeenCalledTimes(1));
    expect(onSendTips.mock.calls[0]?.[0]).toHaveLength(2);
    expect(onActiveTipsChange).toHaveBeenLastCalledWith([]);
    expect(document.body.textContent).not.toContain("饭后正文不应显示");
    expect(JSON.parse(localStorage.getItem(key) || "{}")).toEqual({ active: [], favorites: [] });
  });
  it("favorites alone do not activate; activation and stopping update request context", async () => {
    const { onActiveTipsChange } = mount(); await open();
    fireEvent.click(screen.getByRole("button", { name: "加入常用栏：饭后" }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem(key) || "{}").favorites).toEqual([{ caredOneId: "46", tipId: "101" }]));
    expect(onActiveTipsChange).toHaveBeenLastCalledWith([]);
    const use = screen.getAllByRole("button", { name: /^使用$/ })[0];
    if (!use) throw new Error("Missing use control");
    fireEvent.click(use);
    await waitFor(() => expect(onActiveTipsChange.mock.calls.at(-1)?.[0]).toHaveLength(1));
    fireEvent.click(screen.getByRole("button", { name: /^停止使用$/ }));
    await waitFor(() => expect(onActiveTipsChange).toHaveBeenLastCalledWith([]));
  });
  it("restores active references and favorite order after remount without storing bodies", async () => {
    localStorage.setItem(key, JSON.stringify({ active: [{ caredOneId: "46", tipId: "101" }], favorites: [{ caredOneId: "46", tipId: "102" }, { caredOneId: "46", tipId: "101" }] }));
    const first = mount(); await waitFor(() => expect(first.onActiveTipsChange.mock.calls.at(-1)?.[0]).toHaveLength(1));
    const down = screen.getAllByRole("button", { name: "下移常用贴士" })[0];
    if (!down) throw new Error("Missing reorder control");
    fireEvent.click(down);
    await waitFor(() => expect(JSON.parse(localStorage.getItem(key) || "{}").favorites[0].tipId).toBe("101"));
    first.unmount(); const second = mount();
    await waitFor(() => expect(second.onActiveTipsChange.mock.calls.at(-1)?.[0]).toHaveLength(1));
    expect(JSON.parse(localStorage.getItem(key) || "{}").favorites.map((row: { tipId: string }) => row.tipId)).toEqual(["101", "102"]);
    expect(localStorage.getItem(key)).not.toContain("正文");
  });
  it("does not reuse another App or account's preferences", async () => {
    localStorage.setItem(key, JSON.stringify({ active: [{ caredOneId: "46", tipId: "101" }], favorites: [] }));
    state.site = "carecnc"; const otherApp = mount(); await open(); expect(otherApp.onActiveTipsChange).toHaveBeenLastCalledWith([]);
    otherApp.unmount(); state.site = "challenged"; state.user = "47"; const otherAccount = mount(); await open(); expect(otherAccount.onActiveTipsChange).toHaveBeenLastCalledWith([]);
    expect(JSON.parse(localStorage.getItem(key) || "{}").active).toHaveLength(1);
  });
  it("shows failed reads and retries instead of presenting an empty list", async () => {
    state.fail = true; mount(); fireEvent.click(await screen.findByRole("button", { name: "选择护理小贴士" }));
    expect(await screen.findByText("暂时无法读取这位家人的护理小贴士。")).toBeInTheDocument();
    state.fail = false; fireEvent.click(screen.getByRole("button", { name: "重试" }));
    expect(await screen.findByRole("checkbox", { name: "选择发送给 AI: 饭后" })).toBeInTheDocument();
  });
});