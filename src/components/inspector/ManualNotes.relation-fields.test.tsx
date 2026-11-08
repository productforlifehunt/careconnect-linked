import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  save: vi.fn(),
  select: vi.fn(),
  duplicate: vi.fn(),
  put: vi.fn(),
  list: vi.fn(),
}));
vi.mock("@/lib/inspector-ai.functions", () => ({ explainReadWrite: vi.fn() }));
vi.mock("@/lib/inspector-notes.functions", () => ({
  loadAllInspectorNotes: vi.fn(),
  loadInspectorNotes: mocks.load,
  saveInspectorNote: mocks.save,
  updateBoundInspectorNote: mocks.save,
  selectInspectorNote: mocks.select,
  duplicateInspectorNoteVersion: mocks.duplicate,
  listInspectorPositionNotes: mocks.list,
}));
vi.mock("@/services/wp-auth", () => ({ getWPToken: () => "test-session" }));
vi.mock("@/features/inspector/notes-cache", () => ({
  inspectorNotesCache: {
    put: mocks.put,
    reset: vi.fn(),
    peek: vi.fn(),
    load: vi.fn(),
  },
}));
vi.mock("./RelatedNotes", () => ({ RelatedNotes: () => null }));
import { ManualNotes } from "./ManualNotes";

const original = {
  key: "page|/care-circle",
  id: "101",
  title: "群组注释",
  version: "1.0",
  text: "已有内容",
  verified: false,
  relationVerified: true,
  relationDetails: "原有核对依据",
  locked: true,
  updatedAt: "2026-11-08T00:00:00Z",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("loads and saves the relation review fields when editing a page note", async () => {
  mocks.load.mockResolvedValue({ notes: [original] });
  mocks.list.mockResolvedValue({ notes: [original] });
  mocks.save.mockImplementation(
    async ({ data }: { data: Record<string, unknown> }) => ({
      note: { ...original, ...data },
    }),
  );

  render(
    <ManualNotes
      noteKey="page|/care-circle"
      scope="page"
      page="/care-circle"
      label="群组"
    />,
  );

  const detail = await screen.findByRole("textbox", {
    name: "已手动核对笔记关联详情",
  });
  expect(screen.getByText("笔记关联核对")).toBeDefined();
  expect(screen.getByText("关联核对详情")).toBeDefined();
  expect(detail.getAttribute("placeholder")).toBe(
    "记录关联关系的说明或核对依据…",
  );
  expect((detail as HTMLTextAreaElement).value).toBe("原有核对依据");
  expect(
    screen
      .getByRole("switch", { name: "已手动核对笔记关联" })
      .getAttribute("aria-checked"),
  ).toBe("true");

  fireEvent.change(detail, { target: { value: "保存后的核对依据" } });
  const save = screen.getByRole("button", { name: "保存注释" });
  expect(save.hasAttribute("disabled")).toBe(false);
  fireEvent.click(save);

  await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
  expect(mocks.save).toHaveBeenCalledWith({
    data: expect.objectContaining({
      id: "101",
      version: "1.0",
      relationVerified: true,
      relationDetails: "保存后的核对依据",
      text: "已有内容",
    }),
  });
  expect(await screen.findByDisplayValue("保存后的核对依据")).toBeDefined();
  expect(await screen.findByText("「群组注释」已保存并读回确认。")).toBeDefined();
});

it("enables save after one character in the note body and reports failures", async () => {
  mocks.load.mockResolvedValue({ notes: [original] });
  mocks.save.mockResolvedValue({ error: "模拟失败" });
  render(<ManualNotes noteKey="page|/care-circle" scope="page" page="/care-circle" label="群组" />);
  await screen.findByDisplayValue("已有内容");
  fireEvent.change(screen.getByRole("textbox", { name: "注释内容" }), { target: { value: "已有内容!" } });
  const save = screen.getByRole("button", { name: "保存注释" });
  expect(save.hasAttribute("disabled")).toBe(false);
  fireEvent.click(save);
  expect(await screen.findByRole("alert")).toHaveTextContent("修改失败：模拟失败");
});

it("copies a new version and switches the current position only after Yes", async () => {
  const copied = { ...original, key: "cct|102", id: "102", version: "2.0" };
  mocks.load.mockResolvedValue({ notes: [original] });
  mocks.list.mockResolvedValue({ notes: [original] });
  mocks.duplicate.mockResolvedValue({ note: copied });
  mocks.select.mockResolvedValue({ note: { ...copied, key: original.key } });
  render(<ManualNotes noteKey="page|/care-circle" scope="page" page="/care-circle" label="群组" />);
  await screen.findByDisplayValue("已有内容");
  fireEvent.click(screen.getByRole("button", { name: /复制为新版本/ }));
  fireEvent.change(screen.getByRole("textbox", { name: "新版本号" }), { target: { value: "2.0" } });
  fireEvent.click(screen.getByRole("button", { name: "创建新版本" }));
  await screen.findByText(/是否切换到新版本继续编辑/);
  expect(mocks.duplicate).toHaveBeenCalledWith({ data: { id: "101", version: "2.0" } });
  fireEvent.click(screen.getByRole("button", { name: "是，切换" }));
  await waitFor(() => expect(screen.getByDisplayValue("2.0")).toBeDefined());
  expect(mocks.select).toHaveBeenCalledWith({ data: expect.objectContaining({ key: original.key, id: "102", scope: "page", page: "/care-circle" }) });
});
