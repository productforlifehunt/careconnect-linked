import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  link: vi.fn(),
  unlink: vi.fn(),
  update: vi.fn(),
}));
vi.mock("@/lib/inspector-ai.functions", () => ({ explainReadWrite: vi.fn() }));
vi.mock("@/lib/inspector-notes.functions", () => ({
  listRelatedNotes: mocks.list,
  linkRelatedNote: mocks.link,
  unlinkRelatedNote: mocks.unlink,
  updateRelatedNote: mocks.update,
}));
import { RelatedNotes } from "./RelatedNotes";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("creates a linked note with relation review fields", async () => {
  mocks.list.mockResolvedValue({ notes: [] });
  mocks.link.mockResolvedValue({
    notes: [
      {
        id: "303",
        title: "并列说明",
        text: "新内容",
        side: "child",
        verified: false,
        relationVerified: true,
        relationDetails: "共同指向同一来源。",
      },
    ],
  });

  render(<RelatedNotes noteId="101" />);
  await screen.findByText("关联注释 · 0 条");
  expect(screen.queryByText(/REL325/)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "新建关联注释" }));
  fireEvent.change(screen.getByPlaceholderText("名字"), {
    target: { value: "并列说明" },
  });
  fireEvent.change(screen.getByPlaceholderText("内容"), {
    target: { value: "新内容" },
  });
  fireEvent.click(
    screen.getByRole("switch", { name: "新关联注释已手动核对笔记关联" }),
  );
  fireEvent.change(
    screen.getByRole("textbox", { name: "新关联注释已手动核对笔记关联详情" }),
    { target: { value: "共同指向同一来源。" } },
  );
  expect(screen.getAllByText("笔记关联核对")).toHaveLength(1);
  expect(screen.getAllByText("关联核对详情")).toHaveLength(1);
  expect(
    screen
      .getByRole("textbox", {
        name: "新关联注释已手动核对笔记关联详情",
      })
      .getAttribute("placeholder"),
  ).toBe("记录关联关系的说明或核对依据…");
  fireEvent.click(screen.getByRole("button", { name: "保存并关联" }));

  await waitFor(() => expect(mocks.link).toHaveBeenCalledOnce());
  expect(mocks.link).toHaveBeenCalledWith({
    data: {
      id: "101",
      create: {
        title: "并列说明",
        text: "新内容",
        relationVerified: true,
        relationDetails: "共同指向同一来源。",
      },
    },
  });
  expect(await screen.findByText(/关联已核对/)).toBeDefined();
});

it("loads and edits relation review fields on an existing linked note", async () => {
  mocks.list.mockResolvedValue({
    notes: [
      {
        id: "202",
        title: "关联说明",
        text: "旧内容",
        side: "child",
        verified: false,
        relationVerified: true,
        relationDetails: "旧依据",
      },
    ],
  });
  mocks.update.mockResolvedValue({
    notes: [
      {
        id: "202",
        title: "关联说明",
        text: "旧内容",
        side: "child",
        verified: false,
        relationVerified: false,
        relationDetails: "新依据",
      },
    ],
  });

  render(<RelatedNotes noteId="101" />);
  const item = await screen.findByRole("button", { name: /#202 · 关联说明/ });
  fireEvent.click(item);
  const detail = await screen.findByRole("textbox", {
    name: "关联注释已手动核对笔记关联详情",
  });
  expect(screen.getByText("笔记关联核对")).toBeDefined();
  expect(screen.getByText("关联核对详情")).toBeDefined();
  expect((detail as HTMLTextAreaElement).value).toBe("旧依据");
  fireEvent.click(
    screen.getByRole("switch", { name: "关联注释已手动核对笔记关联" }),
  );
  fireEvent.change(detail, { target: { value: "新依据" } });
  fireEvent.click(screen.getByRole("button", { name: "保存" }));

  await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
  expect(mocks.update).toHaveBeenCalledWith({
    data: {
      id: "101",
      otherId: "202",
      title: "关联说明",
      text: "旧内容",
      verified: false,
      relationVerified: false,
      relationDetails: "新依据",
    },
  });
  await waitFor(() => expect(screen.getByText(/关联未核对/)).toBeDefined());
});
