import { matchRoutes } from "react-router";
import { describe, expect, it } from "vitest";

describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const matches = matchRoutes([
      { id: "root", path: "/", children: [{ id: "home", index: true }] },
      { id: "not-found", path: "*" },
    ], "/");

    expect(matches?.at(-1)?.route.id).toBe("home");
  });
});
