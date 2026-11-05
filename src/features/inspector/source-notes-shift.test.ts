import { describe, expect, it } from "vitest";
import { resolveSourceNote, sourceDigest } from "./source-notes";

describe("resolveSourceNote after code above moves", () => {
  it("still finds the note when the same block shifted down two lines", async () => {
    const block = "<Button>\n  发送紧急请求\n</Button>";
    const digest = await sourceDigest(block);
    const notes = new Map([["k", { key: "k", text: "note", updatedAt: "", id: "267", source: { file: "a.tsx", line: 1, endLine: 3, tag: "Button", digest } }]]);
    const file = "x\ny\n" + block;
    const found = await resolveSourceNote(notes, "a.tsx:3", "button", async () => file);
    expect(found?.id).toBe("267");
  });
  it("does not match when the block content changed", async () => {
    const digest = await sourceDigest("<Button>old</Button>");
    const notes = new Map([["k", { key: "k", text: "note", updatedAt: "", id: "1", source: { file: "a.tsx", line: 1, endLine: 1, tag: "Button", digest } }]]);
    expect(await resolveSourceNote(notes, "a.tsx:1", "button", async () => "<Button>new</Button>")).toBeUndefined();
  });
});
