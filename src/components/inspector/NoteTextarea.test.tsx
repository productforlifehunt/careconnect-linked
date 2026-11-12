import { render, fireEvent } from "@testing-library/react";
import { NoteTextarea, noteParagraphs } from "@/components/inspector/NoteTextarea";
import { test, expect } from "vitest";
test("paragraph pick", () => {
  const t = "红段\n二行\n\n黄段\n\n橙段";
  expect(noteParagraphs(t).filter(p => p.color !== undefined).map(p => p.color)).toEqual([0,1,2]);
  const r = render(<NoteTextarea aria-label="x" value={t} onChange={() => {}} />);
  fireEvent.click(r.getByText("2 黄"));
  const ta = r.getByLabelText("x") as HTMLTextAreaElement;
  expect(t.slice(ta.selectionStart, ta.selectionEnd)).toBe("黄段");
  expect(r.container.textContent).toContain("共 6 行");
});
