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
  duplicateNoteVersion: vi.fn(),
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
  duplicateNoteVersion: mocks.duplicateNoteVersion,
}));

import {
  linkRelatedNote,
  listRelatedNotes,
  updateRelatedNote,
  duplicateInspectorNoteVersion,
} from "./inspector-notes.functions.server";

const request = new Request("http://localhost/api/server-actions", {
  headers: { "X-WP-Token": "test-session" },
});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.verify.mockResolvedValue(undefined);
  mocks.readRelatedNotes.mockResolvedValue([]);
  mocks.noteTitle.mockImplementation(async (id: string) => `Note ${id}`);
  mocks.relationDirection.mockImplementation(
    (current: { id: string }, other: { id: string }) => ({
      parent: current.id,
      child: other.id,
    }),
  );
  mocks.linkNotes.mockResolvedValue(undefined);
  mocks.createPlainNote.mockResolvedValue("303");
  mocks.updatePlainNote.mockResolvedValue(undefined);
});

it("uses the verified researcher token to read REL325", async () => {
  const result = await listRelatedNotes({ id: "101" }, request);

  expect(mocks.verify).toHaveBeenCalledExactlyOnceWith("test-session");
  expect(mocks.readRelatedNotes).toHaveBeenCalledExactlyOnceWith(
    "101",
    "test-session",
  );
  expect(result).toEqual({ notes: [] });
});

it("uses the verified researcher token for CCT324 and REL325 manual linking", async () => {
  const result = await linkRelatedNote({ id: "101", otherId: "202" }, request);

  expect(mocks.verify).toHaveBeenCalledExactlyOnceWith("test-session");
  expect(mocks.noteTitle.mock.calls).toEqual([
    ["101", "test-session"],
    ["202", "test-session"],
  ]);
  expect(mocks.linkNotes).toHaveBeenCalledExactlyOnceWith(
    "101",
    "202",
    "test-session",
  );
  expect(mocks.readRelatedNotes).toHaveBeenCalledExactlyOnceWith(
    "101",
    "test-session",
  );
  expect(result).toEqual({ notes: [] });
});

it("creates a related CCT324 note with the relation review fields before linking it", async () => {
  const result = await linkRelatedNote(
    {
      id: "101",
      create: {
        title: "同一处理流程",
        text: "内容",
        relationVerified: true,
        relationDetails: "两条注释描述同一处理流程。",
      },
    },
    request,
  );

  expect(mocks.createPlainNote).toHaveBeenCalledExactlyOnceWith(
    {
      title: "同一处理流程",
      text: "内容",
      relationVerified: true,
      relationDetails: "两条注释描述同一处理流程。",
    },
    "test-session",
  );
  expect(mocks.linkNotes).toHaveBeenCalledExactlyOnceWith(
    "101",
    "303",
    "test-session",
  );
  expect(result).toEqual({ notes: [] });
});

it("saves relation review edits to the selected related CCT324 note", async () => {
  const result = await updateRelatedNote(
    {
      id: "101",
      otherId: "202",
      title: "更新后的标题",
      text: "更新后的内容",
      verified: false,
      relationVerified: true,
      relationDetails: "重新核对过这条关联。",
    },
    request,
  );

  expect(mocks.updatePlainNote).toHaveBeenCalledExactlyOnceWith(
    "202",
    {
      title: "更新后的标题",
      text: "更新后的内容",
      verified: false,
      relationVerified: true,
      relationDetails: "重新核对过这条关联。",
    },
    "test-session",
  );
  expect(mocks.readRelatedNotes).toHaveBeenCalledExactlyOnceWith(
    "101",
    "test-session",
  );
  expect(result).toEqual({ notes: [] });
});

it("creates a new note version only after researcher verification", async () => {
  const note = { id: "404", title: "Note", version: "2.0" };
  mocks.duplicateNoteVersion.mockResolvedValue(note);
  const result = await duplicateInspectorNoteVersion({ id: "202", version: "2.0" }, request);
  expect(mocks.verify).toHaveBeenCalledExactlyOnceWith("test-session");
  expect(mocks.duplicateNoteVersion).toHaveBeenCalledExactlyOnceWith("202", "2.0", "test-session");
  expect(result).toEqual({ note });
});
