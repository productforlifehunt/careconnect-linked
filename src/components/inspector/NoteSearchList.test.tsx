import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { NoteSearchList } from "./NoteSearchList";

const notes = Array.from({ length: 17000 }, (_, i) => ({ id: String(1000 + i), title: i === 9000 ? "群组成员数量" : `注释 ${i}`, text: "", verified: i % 2 === 0 })) as any;

describe("NoteSearchList", () => {
  afterEach(cleanup);
  it("finds a note by Chinese name among 17000 and shows at most 60 rows", async () => {
    const onPick = vi.fn();
    render(<NoteSearchList notes={notes} onPick={onPick} />);
    expect(screen.getAllByRole("button").length).toBe(63);
    const box = screen.getByPlaceholderText("搜索注释名字或编号");
    const t = performance.now();
    await act(async () => { fireEvent.change(box, { target: { value: "群组成员" } }); });
    expect(performance.now() - t).toBeLessThan(500);
    const rows = screen.getAllByRole("button").slice(3);
    expect(rows.length).toBe(1);
    expect(rows[0]?.textContent).toContain("#10000");
  });
  it("finds by number and picks first on Enter", async () => {
    const onPick = vi.fn();
    render(<NoteSearchList notes={notes} onPick={onPick} />);
    const box = screen.getByPlaceholderText("搜索注释名字或编号");
    await act(async () => { fireEvent.change(box, { target: { value: "#17999" } }); });
    fireEvent.keyDown(box, { key: "Enter" });
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: "17999" }));
  });
  it("searches only verified notes, including matches beyond the first 60", async () => {
    render(<NoteSearchList notes={notes} onPick={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "已核对" }));
    await act(async () => { fireEvent.change(screen.getByPlaceholderText("搜索注释名字或编号"), { target: { value: "#17998" } }); });
    expect(screen.getByRole("button", { name: /#17998/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "未核对" }));
    expect(screen.queryByRole("button", { name: /#17998/ })).toBeNull();
  });
  it("searches only unverified notes and restores all without clearing the query", async () => {
    render(<NoteSearchList notes={notes} onPick={vi.fn()} />);
    await act(async () => { fireEvent.change(screen.getByPlaceholderText("搜索注释名字或编号"), { target: { value: "#17999" } }); });
    fireEvent.click(screen.getByRole("button", { name: "未核对" }));
    expect(screen.getByRole("button", { name: /#17999/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "已核对" }));
    expect(screen.queryByRole("button", { name: /#17999/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "全部" }));
    expect(screen.getByRole("button", { name: /#17999/ })).toBeTruthy();
  });
});
