import { expect, it } from "vitest";
import { resolveSourceNote, sourceDigest, isGeneratedNote } from "./source-notes";

it("resolves a listing wrapper independently of page path and stored display text", async () => {
  const code = "<Card>{post.title}</Card>";
  const note = { key: "source|card", text: "title binding", updatedAt: "today", source: { file: "pages/Community.tsx", line: 1, endLine: 1, tag: "Card", digest: await sourceDigest(code) } };
  expect((await resolveSourceNote(new Map([[note.key, note]]), "pages/Community.tsx:1", "div", async () => code))).toBeUndefined();
  expect((await resolveSourceNote(new Map([[note.key, { ...note, source: { ...note.source, tag: "div" } }]]), "pages/Community.tsx:1", "div", async () => code))?.key).toBe(note.key);
});

it("refuses stale explanation when the actual rendering source changes", async () => {
  const note = { key: "source|vote", text: "upvotes binding", updatedAt: "today", source: { file: "pages/Community.tsx", line: 1, endLine: 1, tag: "button", digest: await sourceDigest("{votes.upvotes}") } };
  expect(await resolveSourceNote(new Map([[note.key, note]]), "pages/Community.tsx:1", "button", async () => "{votes.downvotes}")).toBeUndefined();
});

it("never matches an unrelated same-number node or an ancestor line", async () => {
  const code = "{count}";
  const note = { key: "source|count", text: "count binding", updatedAt: "today", source: { file: "page.tsx", line: 1, endLine: 1, tag: "span", digest: await sourceDigest(code) } };
  expect(await resolveSourceNote(new Map([[note.key, note]]), "other.tsx:1", "span", async () => code)).toBeUndefined();
  expect(await resolveSourceNote(new Map([[note.key, note]]), "page.tsx:2", "span", async () => code)).toBeUndefined();
});

it("distinguishes old automated placeholders from genuine manual edits", () => {
  expect(isGeneratedNote("【根据本页实际读写记录写成的说明，待人工确认业务上是否应该这样】")).toBe(true);
  expect(isGeneratedNote("这段代码同一处会显示多项内容")).toBe(true);
  expect(isGeneratedNote("这条点赞数必须只统计 REL166 关联的投票。")).toBe(false);
});