import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { careGroupLink, cleanJoinCodeInput, parseCareGroupLink, randomJoinCode } from "@/features/care-groups/join-link";
import { GroupSettingsTab } from "@/components/care-circle/tabs/GroupSettingsTab";

const writeText = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "zh" } }) }));
vi.mock("@/hooks/use-care-data", () => ({
  useUpdateMyGroupDisplayName: () => ({ mutate: vi.fn(), isPending: false }),
}));

afterEach(() => { cleanup(); writeText.mockClear(); toast.mockClear(); });

const group = { id: "199", name: "测试群组", join_code: "482913", is_active: true };

function renderSettings(activeGroup: any = group) {
  render(
    <GroupSettingsTab
      activeGroup={activeGroup}
      activeGroupId={activeGroup.id}
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

it("gives each group one link built from its id only", () => {
  expect(careGroupLink("http://localhost:8080", "199")).toBe("http://localhost:8080/group/199");
  expect(careGroupLink("http://localhost:8080/", "wp-199")).toBe("http://localhost:8080/group/199");
  expect(careGroupLink("http://localhost:8080", "")).toBe("");
  expect(careGroupLink("http://localhost:8080", "ABC123")).toBe("");
});

it("reads the group id back out of a pasted group link", () => {
  expect(parseCareGroupLink("https://example.com/group/199")).toBe("199");
  expect(parseCareGroupLink("https://example.com/group/199?request=5")).toBe("199");
  expect(parseCareGroupLink("482913")).toBeNull();
});

it("generates six-digit join codes", () => {
  for (let i = 0; i < 50; i++) expect(randomJoinCode()).toMatch(/^\d{6}$/);
});

it("lets admins type any characters but caps the join code at six", () => {
  expect(cleanJoinCodeInput("ab c1234567")).toBe("abc123");
  expect(cleanJoinCodeInput("我的密码")).toBe("我的密码");
});

it("never puts the join code in the group link", () => {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  renderSettings();
  const link = screen.getByLabelText("群组链接") as HTMLInputElement;
  expect(link.value).toBe(`${window.location.origin}/group/199`);
  expect(link.value).not.toContain("482913");
  fireEvent.click(screen.getByRole("button", { name: "复制群组链接" }));
  expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/group/199`);
});

it("keeps the same group link when the join code is empty or changed", () => {
  renderSettings({ ...group, join_code: "" });
  expect((screen.getByLabelText("群组链接") as HTMLInputElement).value).toBe(`${window.location.origin}/group/199`);
  const code = screen.getByLabelText("加入码") as HTMLInputElement;
  expect(code.maxLength).toBe(6);
  fireEvent.click(screen.getByRole("button", { name: /自动生成/ }));
  expect(code.value).toMatch(/^\d{6}$/);
  expect((screen.getByLabelText("群组链接") as HTMLInputElement).value).toBe(`${window.location.origin}/group/199`);
});
