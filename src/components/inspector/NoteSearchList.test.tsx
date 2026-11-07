import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup, waitFor } from "@testing-library/react";
vi.mock("@/lib/inspector-notes.functions", () => ({ searchInspectorNotes: vi.fn() }));
import { NoteSearchList } from "./NoteSearchList";

describe("NoteSearchList", () => {
  afterEach(cleanup);
  it("asks the server with the typed words and status, never a local full list", async () => {
    const search = vi.fn(async () => [{ id: "10564", title: "20. Settings 全部设置功能逻辑", verified: false }]);
    render(<NoteSearchList search={search} onPick={vi.fn()} />);
    const box = screen.getByPlaceholderText("搜索注释名字或编号");
    await act(async () => { fireEvent.change(box, { target: { value: "设置" } }); });
    await waitFor(() => expect(search).toHaveBeenLastCalledWith("设置", "all"));
    await screen.findByText(/#10564/);
    fireEvent.click(screen.getByRole("button", { name: "已核对" }));
    await waitFor(() => expect(search).toHaveBeenLastCalledWith("设置", "verified"));
  });
  it("hides excluded notes and picks the first on Enter", async () => {
    const onPick = vi.fn();
    const search = vi.fn(async () => [{ id: "1", title: "a", verified: true }, { id: "2", title: "b", verified: false }]);
    render(<NoteSearchList search={search} exclude={new Set(["1"])} onPick={onPick} />);
    await screen.findByText(/#2/);
    expect(screen.queryByText(/#1\b/)).toBeNull();
    fireEvent.keyDown(screen.getByPlaceholderText("搜索注释名字或编号"), { key: "Enter" });
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: "2" }));
  });
});
