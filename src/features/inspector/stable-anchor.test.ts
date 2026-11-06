import { describe, expect, it } from "vitest";
import { elementAlias, findAliasNote } from "./route-key";
import { resolveSourceNote, sourceRef } from "./source-notes";

describe("saved element notes survive refresh, code edits and the published build", () => {
  it("same alias from preview and published component names; record ids ignored", () => {
    const preview = elementAlias("/cared-ones/46/tips", ["CardContent", "O", "TipsPage", "AppLayout"], "span");
    const published = elementAlias("/cared-ones/31/tips", ["CardContent", "O", "TipsPage", "AppLayout"], "span");
    expect(preview).toBe("al|/cared-ones/:id/tips|CardContent<TipsPage<AppLayout|span");
    expect(published).toBe(preview);
  });
  it("different stat-card slots keep different aliases", () => {
    expect(elementAlias("/care-circle/1", ["StatCard", "GroupHome"], "p", "Members")).not.toBe(elementAlias("/care-circle/1", ["StatCard", "GroupHome"], "p", "Cared Ones"));
  });
  it("finds a note by alias when the main key no longer matches", () => {
    const map = new Map([["el|/x|components/a.tsx:10|span", { key: "el|/x|components/a.tsx:10|span", text: "t", updatedAt: "", id: "7", alias: "al|/x|A|span" }]]);
    expect(findAliasNote(map, "al|/x|A|span")?.id).toBe("7");
    expect(findAliasNote(map, "")).toBeUndefined();
  });
  it("a saved source line is found again after lines are inserted above it", async () => {
    const before = "a\nb\n<span>{tip.title}</span>\n";
    const ref = await sourceRef("pages/T.tsx:3", "span", async () => before);
    expect(ref?.line).toBe(3);
    const after = "new1\nnew2\na\nb\n<span>{tip.title}</span>\n";
    const map = new Map([["old", { key: "old", text: "note", updatedAt: "", id: "9", source: ref! }]]);
    const found = await resolveSourceNote(map, "pages/T.tsx:5", "span", async () => after);
    expect(found?.id).toBe("9");
  });
});
