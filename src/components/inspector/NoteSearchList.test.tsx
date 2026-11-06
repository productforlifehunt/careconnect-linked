import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { NoteSearchList } from "./NoteSearchList";

const notes = Array.from({ length: 17000 }, (_, i) => ({ id: String(1000 + i), title: i === 9000 ? "群组成员数量" : `注释 ${i}`, text: "", verified: i % 2 === 0 })) as any;

describe("NoteSearchList", () => {
  it("finds a note by Chinese name among 17000 and shows at most 60 rows", async () => {
    const onPick = vi.fn();
    render(<NoteSearchList notes={notes} onPick={onPick} />);
    expect(screen.getAllByRole("button").length).toBe(60);
    const box = screen.getByPlaceholderText("搜索注释名字或编号");
    const t = performance.now();
    await act(async () => { fireEvent.change(box, { target: { value: "群组成员" } }); });
    expect(performance.now() - t).toBeLessThan(500);
    const rows = screen.getAllByRole("button");
    expect(rows.length).toBe(1);
    expect(rows[0]!.textContent).toContain("#10000");
  });
  it("finds by number and picks first on Enter", async () => {
    const onPick = vi.fn();
    render(<NoteSearchList notes={notes} onPick={onPick} />);
    const box = screen.getAllByPlaceholderText("搜索注释名字或编号").at(-1)!;
    await act(async () => { fireEvent.change(box, { target: { value: "#17999" } }); });
    fireEvent.keyDown(box, { key: "Enter" });
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: "17999" }));
  });
});
