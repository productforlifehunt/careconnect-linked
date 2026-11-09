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
  list: vi.fn(),
  select: vi.fn(),
  search: vi.fn(),
  unlink: vi.fn(),
  removePosition: vi.fn(),
  removeNote: vi.fn(),
  deleteNote: vi.fn(),
}));

vi.mock("@/lib/inspector-ai.functions", () => ({
  explainReadWrite: vi.fn(),
}));
vi.mock("@/lib/inspector-notes.functions", () => ({
  loadInspectorNotes: mocks.load,
  listInspectorPositionNotes: mocks.list,
  selectInspectorNote: mocks.select,
  searchInspectorNotes: mocks.search,
  saveInspectorNote: vi.fn(),
  duplicateInspectorNoteVersion: vi.fn(),
  unlinkInspectorPositionNote: mocks.unlink,
  deleteInspectorNote: mocks.deleteNote,
  reorderInspectorPositionNotes: vi.fn(),
  updateBoundInspectorNote: vi.fn(),
}));
vi.mock("@/services/wp-auth", () => ({ getWPToken: () => "test-session" }));
vi.mock("@/features/inspector/notes-cache", () => ({
  inspectorNotesCache: { put: vi.fn(), reset: vi.fn(), removePosition: mocks.removePosition, removeNote: mocks.removeNote },
}));

import { ManualNotes } from "./ManualNotes";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("reuses the position notes returned by the initial read", async () => {
  const noteKey = "page|/care-circle/46/tasks|cached-position-test";
  const note = { key: noteKey, id: "10566", title: "Cached note", text: "Saved body", scope: "page" as const, page: "/care-circle/46/tasks", label: "Care Tasks", noteType: "b55" as const, tabOrder: 1, verified: false, relationVerified: false, relationDetails: "", locked: true, updatedAt: "2026-11-08T00:00:00Z" };
  mocks.load.mockResolvedValue({ notes: [note], positionNotes: [note] });

  render(<ManualNotes noteKey={noteKey} scope="page" page={note.page} label={note.label} />);

  expect(await screen.findByText(/当前注释：Cached note/)).toBeDefined();
  expect(await screen.findByText("页面说明注释 · 1 条")).toBeDefined();
  expect(mocks.list).not.toHaveBeenCalled();
});

it.each([
  ["b55", "页面说明注释"],
  ["b56", "页面关联注释"],
] as const)(
  "links an existing %s note immediately after picking it",
  async (noteType, typeLabel) => {
    const noteKey = `page|/care-circle/46/tasks|${noteType}`;
    mocks.load.mockResolvedValue({ notes: [] });
    mocks.list.mockResolvedValue({ notes: [] });
    mocks.search.mockResolvedValue({
      notes: [
        { id: "10567", title: "Picked note", version: "1.0", verified: false },
      ],
    });
    const savedNote = {
      key: noteKey,
      id: "10567",
      title: "Picked note",
      version: "1.0",
      text: "Saved note body",
      noteType,
      tabOrder: 1,
      verified: false,
      locked: true,
      updatedAt: "2026-11-08T00:00:00Z",
    };
    let finishSelection!: (result: { note: typeof savedNote }) => void;
    mocks.select.mockReturnValue(new Promise((resolve) => { finishSelection = resolve; }));

    render(
      <ManualNotes
        noteKey={noteKey}
        scope="page"
        page="/care-circle/46/tasks"
        label="Care Tasks"
      />,
    );

    await screen.findByText("当前没有已保存的注释");
    if (noteType === "b56")
      fireEvent.click(screen.getByRole("tab", { name: "页面关联注释" }));
    fireEvent.click(screen.getByRole("button", { name: "新增关联已有注释" }));
    fireEvent.click(await screen.findByRole("button", { name: /Picked note.*#10567/ }));
    expect(await screen.findByText("正在关联「Picked note」…")).toBeDefined();
    finishSelection({ note: savedNote });

    await waitFor(() => expect(mocks.select).toHaveBeenCalledOnce());
    expect(mocks.select).toHaveBeenCalledWith({
      data: {
        key: noteKey,
        id: "10567",
        scope: "page",
        page: "/care-circle/46/tasks",
        label: "Care Tasks",
        noteType,
        tabOrder: 1,
      },
    });
    expect(await screen.findByText(`${typeLabel} · 1 条`)).toBeDefined();
    expect(await screen.findByText(/已关联「Picked note」.*CCT324 #10567/)).toBeDefined();
    expect(screen.getByRole("button", { name: /1\. Picked note/ })).toBeDefined();
    expect(screen.queryByRole("button", { name: "锁定选择" })).toBeNull();
  },
);

it.each([
  ["b55", "全站说明注释"],
  ["b56", "全站关联注释"],
] as const)("links an existing %s note immediately for the site", async (noteType, typeLabel) => {
  const noteKey = `site|challenged|${noteType}`;
  mocks.load.mockResolvedValue({ notes: [] });
  mocks.list.mockResolvedValue({ notes: [] });
  mocks.search.mockResolvedValue({ notes: [{ id: "10567", title: "Picked note", version: "1.0", verified: false }] });
  mocks.select.mockResolvedValue({ note: { key: noteKey, id: "10567", title: "Picked note", text: "Saved note body", noteType, tabOrder: 1, locked: true, updatedAt: "2026-11-08T00:00:00Z" } });

  render(<ManualNotes noteKey={noteKey} scope="site" page="/" label="ChallengeD 全站" />);
  await screen.findByText("当前没有已保存的注释");
  if (noteType === "b56") fireEvent.click(screen.getByRole("tab", { name: "全站关联注释" }));
  fireEvent.click(screen.getByRole("button", { name: "新增关联已有注释" }));
  fireEvent.click(await screen.findByRole("button", { name: /Picked note.*#10567/ }));

  await waitFor(() => expect(mocks.select).toHaveBeenCalledOnce());
  expect(mocks.select).toHaveBeenCalledWith({ data: { key: noteKey, id: "10567", scope: "site", page: "/", label: "ChallengeD 全站", noteType, tabOrder: 1 } });
  expect(await screen.findByText(`${typeLabel} · 1 条`)).toBeDefined();
  expect(await screen.findByText(/已关联「Picked note」.*CCT324 #10567/)).toBeDefined();
  expect(screen.queryByRole("button", { name: "锁定选择" })).toBeNull();
});

it("adds an existing note without replacing the notes already linked to this position", async () => {
  const noteKey = "page|/care-circle/46/tasks|append-existing";
  const existing = {
    key: noteKey,
    id: "10566",
    title: "Existing note",
    version: "1.0",
    text: "Existing note body",
    noteType: "b55" as const,
    tabOrder: 1,
    verified: false,
    relationVerified: false,
    relationDetails: "",
    locked: true,
    updatedAt: "2026-11-08T00:00:00Z",
  };
  const added = {
    ...existing,
    id: "10567",
    title: "Picked note",
    text: "Picked note body",
    tabOrder: 2,
  };
  mocks.load.mockResolvedValue({ notes: [existing], positionNotes: [existing] });
  mocks.search.mockResolvedValue({
    notes: [{ id: added.id, title: added.title, version: added.version, verified: added.verified }],
  });
  mocks.select.mockResolvedValue({ note: added });

  render(
    <ManualNotes
      noteKey={noteKey}
      scope="page"
      page="/care-circle/46/tasks"
      label="Care Tasks"
    />,
  );

  expect(await screen.findByText("页面说明注释 · 1 条")).toBeDefined();
  expect(screen.getByRole("button", { name: "新建新关联注释" })).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "新增关联已有注释" }));
  fireEvent.click(await screen.findByRole("button", { name: /Picked note.*#10567/ }));

  expect(await screen.findByText("页面说明注释 · 2 条")).toBeDefined();
  expect(screen.getByRole("button", { name: "1. Existing note" })).toBeDefined();
  expect(screen.getByRole("button", { name: "2. Picked note" })).toBeDefined();
  expect(await screen.findByText(/已关联「Picked note」.*CCT324 #10567/)).toBeDefined();
});

it.each(["b55", "b56"] as const)("unlinks a %s note from the selected position and updates its list after read-back succeeds", async (noteType) => {
  const noteKey = `page|/care-circle/46/tasks|unlink-test-${noteType}`;
  const first = {
    key: noteKey,
    id: "10566",
    title: "First note",
    text: "First body",
    noteType,
    tabOrder: 1,
    locked: true,
  };
  const second = { ...first, id: "10567", title: "Second note", text: "Second body", tabOrder: 2 };
  mocks.load.mockResolvedValue({ notes: [first], positionNotes: [first, second] });
  mocks.unlink.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ removedKeys: [noteKey] }), 20)));
  render(<ManualNotes noteKey={noteKey} scope="page" page="/care-circle/46/tasks" label="Care Tasks" />);

  expect(await screen.findByText(/当前注释：First note/)).toBeDefined();
  if (noteType === "b56") fireEvent.click(screen.getByRole("tab", { name: "页面关联注释" }));
  const listTitle = noteType === "b55" ? "页面说明注释 · " : "页面关联注释 · ";
  expect(await screen.findByText(`${listTitle}2 条`)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "解除关联：First note" }));
  expect(await screen.findByText("正在解除「First note」与当前位置的关联…")).toBeDefined();
  expect(await screen.findByText(`${listTitle}1 条`)).toBeDefined();
  expect(screen.getByRole("button", { name: "1. Second note" })).toBeDefined();
  expect(screen.getByRole("textbox", { name: "注释内容" })).toHaveValue("Second body");
  expect(await screen.findByText(/已解除「First note」与当前位置的关联/)).toBeDefined();
  expect(mocks.unlink).toHaveBeenCalledWith({ data: { key: noteKey, id: "10566" } });
  expect(mocks.removePosition).toHaveBeenCalledWith("test-session", "10566", [noteKey]);
});

it("keeps a note in the list and reports an error when unlinking is not confirmed", async () => {
  const noteKey = "page|/care-circle/46/tasks|unlink-failed";
  const note = { key: noteKey, id: "10566", title: "Keep this note", text: "Body", noteType: "b55" as const, tabOrder: 1, locked: true };
  mocks.load.mockResolvedValue({ notes: [note], positionNotes: [note] });
  mocks.unlink.mockResolvedValue({ error: "写入核对失败", removedKeys: [] });

  render(<ManualNotes noteKey={noteKey} scope="page" page="/care-circle/46/tasks" label="Care Tasks" />);

  expect(await screen.findByText("页面说明注释 · 1 条")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "解除关联：Keep this note" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("写入核对失败");
  expect(screen.getByText("页面说明注释 · 1 条")).toBeDefined();
  expect(screen.getByRole("button", { name: "解除关联：Keep this note" })).toBeDefined();
});

it("requires confirmation before permanently deleting a note and updates the list after success", async () => {
  const noteKey = "page|/care-circle/46/tasks|delete-note";
  const note = { key: noteKey, id: "10568", title: "Accidental note", text: "Body", noteType: "b55" as const, tabOrder: 1, locked: true };
  mocks.load.mockResolvedValue({ notes: [note], positionNotes: [note] });
  mocks.deleteNote.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ deleted: { id: note.id, title: note.title } }), 20)));

  render(<ManualNotes noteKey={noteKey} scope="page" page="/care-circle/46/tasks" label="Care Tasks" />);

  expect(await screen.findByText(/当前注释：Accidental note/)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "删除笔记：Accidental note" }));
  expect(await screen.findByText(/此操作无法恢复/)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "取消" }));
  expect(screen.getByText("页面说明注释 · 1 条")).toBeDefined();
  expect(mocks.deleteNote).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("button", { name: "删除笔记：Accidental note" }));
  fireEvent.click(screen.getByRole("button", { name: "永久删除" }));
  expect(await screen.findByText("正在永久删除「Accidental note」及其关联…")).toBeDefined();
  expect(await screen.findByText("页面说明注释 · 0 条")).toBeDefined();
  expect(await screen.findByText("「Accidental note」已删除。")).toBeDefined();
  expect(mocks.deleteNote).toHaveBeenCalledWith({ data: { id: note.id } });
  expect(mocks.removeNote).toHaveBeenCalledWith("test-session", note.id);
});

it("keeps a note linked and leaves confirmation open when deletion fails", async () => {
  const noteKey = "page|/care-circle/46/tasks|delete-failed";
  const note = { key: noteKey, id: "10569", title: "Keep this note", text: "Body", noteType: "b55" as const, tabOrder: 1, locked: true };
  mocks.load.mockResolvedValue({ notes: [note], positionNotes: [note] });
  mocks.deleteNote.mockResolvedValue({ error: "删除失败" });

  render(<ManualNotes noteKey={noteKey} scope="page" page="/care-circle/46/tasks" label="Care Tasks" />);

  expect(await screen.findByText(/当前注释：Keep this note/)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "删除笔记：Keep this note" }));
  fireEvent.click(screen.getByRole("button", { name: "永久删除" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("删除失败");
  expect(screen.getByText("页面说明注释 · 1 条")).toBeDefined();
  expect(screen.getByRole("alertdialog", { name: "永久删除这条笔记？" })).toBeDefined();
  expect(screen.getByRole("button", { name: "取消" })).toBeDefined();
});
