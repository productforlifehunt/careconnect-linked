import { afterEach, expect, it, vi } from "vitest";
import { searchNotes } from "./inspector-notes.server";

afterEach(() => vi.unstubAllGlobals());

it("returns notes matching any keyword and ranks multi-keyword matches first", async () => {
  const rowsByTerm: Record<
    string,
    { _ID: string; a55: string; a58: string }[]
  > = {
    medicine: [
      { _ID: "3", a55: "Medicine dose logic", a58: "b56" },
      { _ID: "5", a55: "Medicine overview", a58: "b56" },
    ],
    dose: [
      { _ID: "3", a55: "Medicine dose logic", a58: "b56" },
      { _ID: "9", a55: "Dose timing", a58: "b56" },
    ],
  };
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    const filters = JSON.parse(url.searchParams.get("_filters") || "[]");
    const term = filters.find(
      (filter: { field: string }) => filter.field === "a55",
    )?.value;
    return new Response(JSON.stringify(rowsByTerm[term] || []), {
      status: 200,
    });
  });
  vi.stubGlobal("fetch", fetchMock);

  const notes = await searchNotes("medicine dose", "all", "researcher-token");

  expect(notes.map((note) => note.id)).toEqual(["3", "9", "5"]);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
