import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { careGroupLink, cleanJoinCodeInput, groupIdFromPath, parseCareGroupLink, randomJoinCode } from "@/features/care-groups/join-link";
import { safeNextPath, withNext } from "@/lib/return-path";
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
  expect(careGroupLink("http://localhost:8080", "199")).toBe("http://localhost:8080/care-circle/199");
  expect(careGroupLink("http://localhost:8080/", "wp-199")).toBe("http://localhost:8080/care-circle/199");
  expect(careGroupLink("http://localhost:8080", "")).toBe("");
  expect(careGroupLink("http://localhost:8080", "ABC123")).toBe("");
});

it("reads the group id back out of a pasted group link", () => {
  expect(parseCareGroupLink("https://example.com/care-circle/199")).toBe("199");
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
  expect(link.value).toBe(`${window.location.origin}/care-circle/199`);
  expect(link.value).not.toContain("482913");
  fireEvent.click(screen.getByRole("button", { name: "复制群组链接" }));
  expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/care-circle/199`);
});

it("keeps the same group link without any join code on the settings page", () => {
  renderSettings({ ...group, join_code: "" });
  expect((screen.getByLabelText("群组链接") as HTMLInputElement).value).toBe(`${window.location.origin}/care-circle/199`);
  expect(screen.queryByLabelText("加入码")).toBeNull();
});

it("treats the group's home page address as its one link", () => {
  expect(groupIdFromPath("/care-circle/28")).toBe("28");
  expect(groupIdFromPath("/circle/28")).toBe("28");
  expect(groupIdFromPath("/group/28")).toBe("28");
  expect(groupIdFromPath("/care-circle")).toBeNull();
  expect(groupIdFromPath("/care-circle/482913abc")).toBeNull();
});

it("returns to the opened group link after sign-in, but never to another site", () => {
  expect(withNext("/auth", "/care-circle/28")).toBe("/auth?next=%2Fcare-circle%2F28");
  expect(safeNextPath("/care-circle/28?invite=abc")).toBe("/care-circle/28?invite=abc");
  expect(safeNextPath("https://evil.example")).toBeNull();
  expect(safeNextPath("//evil.example")).toBeNull();
  expect(withNext("/auth", "//evil.example")).toBe("/auth");
});
