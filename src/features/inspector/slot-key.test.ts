import { describe, expect, it } from "vitest";
import { staticSlotKey } from "./inspect-dom";

describe("staticSlotKey", () => {
  it("keeps fixed card labels so each stat card gets its own note", () => {
    expect(staticSlotKey("Pending Tasks")).toBe("Pending Tasks");
    expect(staticSlotKey("收件箱未读")).toBe("收件箱未读");
  });
  it("ignores data row ids so rows of one list share one note", () => {
    expect(staticSlotKey(4877)).toBeUndefined();
    expect(staticSlotKey("4877")).toBeUndefined();
    expect(staticSlotKey("post-4877")).toBeUndefined();
    expect(staticSlotKey("3f2a9c1e-77aa-4b0e-9a6e-1b2c3d4e5f60")).toBeUndefined();
  });
});
