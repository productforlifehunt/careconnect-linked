import { describe, expect, it } from "vitest";
import { findSameElementNote } from "./route-key";
describe("findSameElementNote", () => {
  const m = new Map([["el|/care-circle/28|components/care-circle/tabs/HomeTab.tsx:80|button|Pending Tasks", "tasks"]]);
  it("finds the same card on another group", () => expect(findSameElementNote(m, "el|/care-circle/31|components/care-circle/tabs/HomeTab.tsx:80|button|Pending Tasks")).toBe("tasks"));
  it("does not cross slots", () => expect(findSameElementNote(m, "el|/care-circle/31|components/care-circle/tabs/HomeTab.tsx:80|button|Members")).toBeUndefined());
  it("does not cross pages", () => expect(findSameElementNote(m, "el|/cared-ones/31|components/care-circle/tabs/HomeTab.tsx:80|button|Pending Tasks")).toBeUndefined());
});
