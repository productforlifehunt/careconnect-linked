import { render, fireEvent } from "@testing-library/react";
import { NoteTextarea, markedParts } from "@/components/inspector/NoteTextarea";
import { test, expect } from "vitest";
test("no automatic color; only user-marked words", () => {
  const t = "红段\n二行\n\n黄段";
  expect(markedParts(t, []).every((p) => p.color === undefined)).toBe(true);
  expect(markedParts(t, [{ a: 7, b: 9, c: 1 }]).find((p) => p.color === 1)).toMatchObject({ start: 7, end: 9 });
  const twice = "段段";
  expect(markedParts(twice, [{ a: 1, b: 2, c: 0 }]).map((p) => p.color)).toEqual([undefined, 0]);
  const r = render(<NoteTextarea aria-label="x" markKey="t" value={t} onChange={() => {}} />);
  const ta = r.getByLabelText("x") as HTMLTextAreaElement;
  ta.setSelectionRange(0, 2);
  fireEvent.click(r.getByText("红"));
  expect(JSON.parse(localStorage.getItem("inspector-note-marks:t")!)).toEqual([{ a: 0, b: 2, c: 0 }]);
  expect(r.container.textContent).toContain("共 4 行");
});
