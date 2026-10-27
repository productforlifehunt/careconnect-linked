import { describe, expect, it } from "vitest";
import { isPostAuthor } from "./ownership";

describe("My Posts uses the signed-in WordPress identity", () => {
  it("matches raw author ID to prefixed session ID", () => {
    expect(isPostAuthor("54", "wp-54")).toBe(true);
    expect(isPostAuthor(54, "wp-54")).toBe(true);
  });
  it("does not include another person's post", () => {
    expect(isPostAuthor("54", "wp-55")).toBe(false);
  });
  it("does not claim ownership for missing identities", () => {
    expect(isPostAuthor(null, null)).toBe(false);
    expect(isPostAuthor("54", undefined)).toBe(false);
  });
});