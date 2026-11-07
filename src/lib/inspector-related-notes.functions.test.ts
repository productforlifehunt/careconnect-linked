import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  readRelatedNotes: vi.fn(),
  noteTitle: vi.fn(),
  createPlainNote: vi.fn(),
  relationDirection: vi.fn(),
  linkNotes: vi.fn(),
  unlinkNotes: vi.fn(),
  updatePlainNote: vi.fn(),
}));

vi.mock("./inspector-ai.server", () => ({ verifyResearcher: mocks.verify }));
vi.mock("./inspector-notes.server", () => ({
  readRelatedNotes: mocks.readRelatedNotes,
  noteTitle: mocks.noteTitle,
  createPlainNote: mocks.createPlainNote,
  relationDirection: mocks.relationDirection,
  linkNotes: mocks.linkNotes,
  unlinkNotes: mocks.unlinkNotes,
  updatePlainNote: mocks.updatePlainNote,
}));

import { linkRelatedNote, listRelatedNotes } from "./inspector-notes.functions.server";

const request = new Request("http://localhost/api/server-actions", {
  headers: { "X-WP-Token": "test-session" },
});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.verify.mockResolvedValue(undefined);
  mocks.readRelatedNotes.mockResolvedValue([]);
  mocks.noteTitle.mockImplementation(async (id: string) => `Note ${id}`);
  mocks.relationDirection.mockImplementation((current: { id: string }, other: { id: string }) => ({
    parent: current.id,
    child: other.id,
  }));
  mocks.linkNotes.mockResolvedValue(undefined);
});

it("uses the verified researcher token to read REL325", async () => {
  const result = await listRelatedNotes({ id: "101" }, request);

  expect(mocks.verify).toHaveBeenCalledExactlyOnceWith("test-session");
  expect(mocks.readRelatedNotes).toHaveBeenCalledExactlyOnceWith("101", "test-session");
  expect(result).toEqual({ notes: [] });
});

it("uses the verified researcher token for CCT324 and REL325 manual linking", async () => {
  const result = await linkRelatedNote({ id: "101", otherId: "202" }, request);

  expect(mocks.verify).toHaveBeenCalledExactlyOnceWith("test-session");
  expect(mocks.noteTitle.mock.calls).toEqual([
    ["101", "test-session"],
    ["202", "test-session"],
  ]);
  expect(mocks.linkNotes).toHaveBeenCalledExactlyOnceWith("101", "202", "test-session");
  expect(mocks.readRelatedNotes).toHaveBeenCalledExactlyOnceWith("101", "test-session");
  expect(result).toEqual({ notes: [] });
});
