import { expect, it } from "vitest";
import { createNotesCache } from "./notes-cache";

const note = { key: "page|/community", text: "讨论标题来自已保存的帖子。", updatedAt: "2026-11-04T06:29:00Z" };

it("prefetches once and reuses the notes for page/element switches", async () => {
  const cache = createNotesCache(); let reads = 0;
  const load = async () => { reads++; return { notes: [note] }; };
  await Promise.all([cache.load("session-a", load), cache.load("session-a", load)]);
  expect(cache.peek("session-a")?.get(note.key)?.text).toBe(note.text);
  await cache.load("session-a", load);
  expect(reads).toBe(1);
});

it("exposes confirmed saves immediately without a new read", async () => {
  const cache = createNotesCache();
  await cache.load("session-a", async () => ({ notes: [note] }));
  cache.put("session-a", { ...note, text: "更正后的注释" });
  expect(cache.peek("session-a")?.get(note.key)?.text).toBe("更正后的注释");
});

it("removes a confirmed note binding from the selected position cache only", async () => {
  const cache = createNotesCache();
  const pageNote = { ...note, key: "page|/community", id: "10567" };
  const otherPosition = { ...pageNote, key: "page|/profile" };
  const cctNote = { ...pageNote, key: "cct|10567" };
  await cache.load("session-a", async () => ({ notes: [pageNote, otherPosition, cctNote] }));

  cache.removePosition("session-a", "10567", [pageNote.key]);

  const remaining = cache.peek("session-a");
  expect(remaining?.has(pageNote.key)).toBe(false);
  expect(remaining?.get(otherPosition.key)).toEqual(otherPosition);
  expect(remaining?.get(cctNote.key)).toEqual(cctNote);
});

it("removes every cached reference when a note is permanently deleted", async () => {
  const cache = createNotesCache();
  const first = { ...note, id: "10567", key: "page|/community" };
  const second = { ...first, key: "el|/community|button" };
  const other = { ...note, id: "10568", key: "page|/profile" };
  await cache.load("session-a", async () => ({ notes: [first, second, other] }));

  cache.removeNote("session-a", "10567");

  expect(cache.peek("session-a")?.has(first.key)).toBe(false);
  expect(cache.peek("session-a")?.has(second.key)).toBe(false);
  expect(cache.peek("session-a")?.get(other.key)).toEqual(other);
});

it("clears private notes on session changes and rejects late reads/saves", async () => {
  const cache = createNotesCache();
  let finish: (value: { notes: typeof note[] }) => void = () => {};
  const oldRead = cache.load("session-a", () => new Promise((resolve) => { finish = resolve; }));
  expect(cache.peek("session-b")).toBeNull();
  finish({ notes: [note] });
  await expect(oldRead).rejects.toThrow("登录状态已变化");
  cache.put("session-a", note);
  expect(cache.peek("session-b")).toBeNull();
});

it("retries a failed read rather than caching an empty result", async () => {
  const cache = createNotesCache();
  await expect(cache.load("session-a", async () => ({ notes: [], error: "读取失败" }))).rejects.toThrow("读取失败");
  expect(cache.peek("session-a")).toBeNull();
  const result = await cache.load("session-a", async () => ({ notes: [note] }));
  expect(result.get(note.key)).toEqual(note);
});

it("does not overwrite a confirmed save with an older in-flight read", async () => {
  const cache = createNotesCache();
  let finish: (value: { notes: typeof note[] }) => void = () => {};
  const read = cache.load("session-a", () => new Promise((resolve) => { finish = resolve; }));
  cache.put("session-a", { ...note, text: "新的注释" });
  finish({ notes: [note] });
  expect((await read).get(note.key)?.text).toBe("新的注释");
});
