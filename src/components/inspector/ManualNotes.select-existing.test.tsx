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
  reorderInspectorPositionNotes: vi.fn(),
  updateBoundInspectorNote: vi.fn(),
}));
vi.mock("@/services/wp-auth", () => ({ getWPToken: () => "test-session" }));
vi.mock("@/features/inspector/notes-cache", () => ({
  inspectorNotesCache: { put: vi.fn(), reset: vi.fn() },
}));

import { ManualNotes } from "./ManualNotes";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it.each([
  ["b55", "页面说明注释"],
  ["b56", "页面关联注释"],
] as const)(
  "selects and locks an existing %s note",
  async (noteType, typeLabel) => {
    const noteKey = "page|/care-circle/46/tasks";
    mocks.load.mockResolvedValue({ notes: [] });
    mocks.list.mockResolvedValue({ notes: [] });
    mocks.search.mockResolvedValue({
      notes: [
        { id: "10567", title: "Picked note", version: "1.0", verified: false },
      ],
    });
    mocks.select.mockResolvedValue({
      note: {
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
      },
    });

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
    fireEvent.click(screen.getByRole("button", { name: "选择其他注释" }));
    fireEvent.click(
      await screen.findByRole("button", { name: /Picked note.*#10567/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "锁定选择" }));

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
  },
);

it.each([
  ["b55", "全站说明注释"],
  ["b56", "全站关联注释"],
] as const)("selects and locks an existing %s note for the site", async (noteType, typeLabel) => {
  const noteKey = "site|challenged";
  mocks.load.mockResolvedValue({ notes: [] });
  mocks.list.mockResolvedValue({ notes: [] });
  mocks.search.mockResolvedValue({ notes: [{ id: "10567", title: "Picked note", version: "1.0", verified: false }] });
  mocks.select.mockResolvedValue({ note: { key: noteKey, id: "10567", title: "Picked note", text: "Saved note body", noteType, tabOrder: 1, locked: true, updatedAt: "2026-11-08T00:00:00Z" } });

  render(<ManualNotes noteKey={noteKey} scope="site" page="/" label="ChallengeD 全站" />);
  await screen.findByText("当前没有已保存的注释");
  if (noteType === "b56") fireEvent.click(screen.getByRole("tab", { name: "全站关联注释" }));
  fireEvent.click(screen.getByRole("button", { name: "选择其他注释" }));
  fireEvent.click(await screen.findByRole("button", { name: /Picked note.*#10567/ }));
  fireEvent.click(screen.getByRole("button", { name: "锁定选择" }));

  await waitFor(() => expect(mocks.select).toHaveBeenCalledOnce());
  expect(mocks.select).toHaveBeenCalledWith({ data: { key: noteKey, id: "10567", scope: "site", page: "/", label: "ChallengeD 全站", noteType, tabOrder: 1 } });
  expect(await screen.findByText(`${typeLabel} · 1 条`)).toBeDefined();
});
