import { describe, expect, it } from "vitest";
import { pageDisplayPath, pagePositionKey } from "./route-key";
import { samePosition } from "./position-bindings";

describe("page note keys", () => {
  it("same page across cared-one ids is one page", () => {
    expect(pagePositionKey("/cared-ones/45/medicine", "challenged")).toBe(pagePositionKey("/cared-ones/46/medicine", "challenged"));
    expect(samePosition("page|/cared-ones/46/medicine", pagePositionKey("/cared-ones/45/medicine", "challenged"))).toBe(true);
  });
  it("same path on different sub-apps stays separate", () => {
    expect(samePosition(pagePositionKey("/map", "challenged"), pagePositionKey("/map", "notchsafety"))).toBe(false);
  });
  it("key has no host, so preview and published share it", () => {
    expect(pagePositionKey("/cared-ones/46/medicine", "challenged")).toBe("page|/cared-ones/:id/medicine?__site=challenged");
  });
  it("shows the record id by name", () => {
    expect(pageDisplayPath("/cared-ones/46/medicine")).toBe("/cared-ones/{Cared One ID}/medicine");
  });
});
