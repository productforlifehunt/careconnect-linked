import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { careGroupJoinLink } from "@/features/care-groups/join-link";
import { GroupSettingsTab } from "@/components/care-circle/tabs/GroupSettingsTab";

const writeText = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "zh" } }) }));
vi.mock("@/hooks/use-care-data", () => ({
  useUpdateMyGroupDisplayName: () => ({ mutate: vi.fn(), isPending: false }),
}));

afterEach(() => { cleanup(); writeText.mockClear(); toast.mockClear(); });

const group = { id: "199", name: "测试群组", join_code: "ABC123", is_active: true };

function renderSettings(activeGroup: any = group) {
  render(
    <GroupSettingsTab
      activeGroup={activeGroup}
      activeGroupId="199"
      isAdmin
      isOwner={false}
      myDisplayName="小明"
      updateGroup={{ mutate: vi.fn(), isPending: false }}
      deleteGroup={{ mutate: vi.fn() }}
      onDeleteSuccess={() => {}}
      onLeaveGroup={() => {}}
    />,
  );
}

it("builds the group join link from origin and code only", () => {
  expect(careGroupJoinLink("http://localhost:8080", "ABC123")).toBe("http://localhost:8080/join/ABC123");
  expect(careGroupJoinLink("http://localhost:8080/", " ABC123 ")).toBe("http://localhost:8080/join/ABC123");
  expect(careGroupJoinLink("http://localhost:8080", "")).toBe("");
  expect(careGroupJoinLink("", "ABC123")).toBe("");
});

it("shows the group link under the join code and copies it", () => {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  renderSettings();
  const link = screen.getByDisplayValue(`${window.location.origin}/join/ABC123`);
  expect(link).toHaveAttribute("readonly");
  fireEvent.click(screen.getByRole("button", { name: "复制群组链接" }));
  expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/join/ABC123`);
  expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "群组链接已复制" }));
});

it("keeps the copy-link button unusable until a join code exists", () => {
  renderSettings({ id: "199", name: "测试群组", join_code: "", is_active: true });
  expect(screen.getByRole("button", { name: "复制群组链接" })).toBeDisabled();
  expect(screen.getByPlaceholderText("先填写或生成加入码")).toBeInTheDocument();
});
