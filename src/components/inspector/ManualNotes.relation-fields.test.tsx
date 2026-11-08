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
  put: vi.fn(),
}));
vi.mock("@/lib/inspector-ai.functions", () => ({ explainReadWrite: vi.fn() }));
vi.mock("@/lib/inspector-notes.functions", () => ({
  loadAllInspectorNotes: vi.fn(),
  loadInspectorNotes: mocks.load,
  saveInspectorNote: mocks.save,
  selectInspectorNote: vi.fn(),
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
  expect((detail as HTMLTextAreaElement).value).toBe("原有核对依据");
  expect(
    screen
      .getByRole("switch", { name: "已手动核对笔记关联" })
      .getAttribute("aria-checked"),
  ).toBe("true");

  fireEvent.change(detail, { target: { value: "保存后的核对依据" } });
  fireEvent.click(screen.getByRole("button", { name: "保存注释" }));

  await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
  expect(mocks.save).toHaveBeenCalledWith({
    data: expect.objectContaining({
      id: "101",
      relationVerified: true,
      relationDetails: "保存后的核对依据",
      text: "已有内容",
    }),
  });
  expect(await screen.findByDisplayValue("保存后的核对依据")).toBeDefined();
});
