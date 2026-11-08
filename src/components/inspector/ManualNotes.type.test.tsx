import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/inspector-ai.functions", () => ({ explainReadWrite: vi.fn() }));
vi.mock("@/lib/inspector-notes.functions", () => ({
  loadInspectorNotes: mocks.load,
  listInspectorPositionNotes: mocks.list,
  updateBoundInspectorNote: mocks.update,
  saveInspectorNote: vi.fn(),
  selectInspectorNote: vi.fn(),
  duplicateInspectorNoteVersion: vi.fn(),
}));
vi.mock("@/services/wp-auth", () => ({ getWPToken: () => "test-session" }));
vi.mock("@/features/inspector/notes-cache", () => ({
  inspectorNotesCache: { put: vi.fn(), reset: vi.fn() },
}));
vi.mock("./NoteSearchList", () => ({ NoteSearchList: () => null }));

import { ManualNotes } from "./ManualNotes";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

it("saves a selected note under the chosen type and moves it to that type's tabs", async () => {
  const note = {
    key: "page|/care-circle",
    id: "101",
    title: "群组注释",
    text: "已有内容",
    noteType: "b55",
    tabOrder: 2,
    updatedAt: "2026-11-08T00:00:00Z",
  };
  mocks.load.mockResolvedValue({ notes: [note] });
  mocks.list.mockResolvedValue({ notes: [note] });
  mocks.update.mockImplementation(
    ({ data }: { data: Record<string, unknown> }) => ({
      note: { ...note, ...data },
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

  await screen.findByDisplayValue("已有内容");
  fireEvent.click(screen.getByRole("combobox", { name: "注释分类" }));
  fireEvent.click(
    await screen.findByRole("option", { name: "页面关联注释（B56）" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "保存注释" }));

  await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
  expect(mocks.update).toHaveBeenCalledWith({
    data: expect.objectContaining({ id: "101", noteType: "b56", tabOrder: 1 }),
  });
  expect(await screen.findByText("页面关联注释 · 1 条")).toBeDefined();
});

it("keeps category selection inside the inspector in select mode", async () => {
  const note = {
    key: "page|/care-circle",
    id: "102",
    title: "群组注释",
    text: "已有内容",
    noteType: "b55",
    tabOrder: 1,
    updatedAt: "2026-11-08T00:00:00Z",
  };
  mocks.load.mockResolvedValue({ notes: [note] });
  mocks.list.mockResolvedValue({ notes: [note] });
  mocks.update.mockImplementation(
    ({ data }: { data: Record<string, unknown> }) => ({
      note: { ...note, ...data },
    }),
  );

  const selectedPageElement = vi.fn();
  const selectModeClick = (event: Event) => {
    const target = event.target;
    if (target instanceof Element && target.closest("[data-rw-inspector]"))
      return;
    event.preventDefault();
    event.stopPropagation();
    selectedPageElement();
  };
  document.addEventListener("click", selectModeClick, true);

  try {
    render(
      <div data-rw-inspector>
        <ManualNotes
          noteKey="page|/care-circle"
          scope="page"
          page="/care-circle"
          label="群组"
        />
      </div>,
    );

    await screen.findByDisplayValue("已有内容");
    fireEvent.click(screen.getByRole("combobox", { name: "注释分类" }));
    fireEvent.click(
      await screen.findByRole("option", { name: "页面关联注释（B56）" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "保存注释" }));

    await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
    expect(selectedPageElement).not.toHaveBeenCalled();
    expect(mocks.update).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: "102",
        noteType: "b56",
        tabOrder: 1,
      }),
    });
  } finally {
    document.removeEventListener("click", selectModeClick, true);
  }
});
