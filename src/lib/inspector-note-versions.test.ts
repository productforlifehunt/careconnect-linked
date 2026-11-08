import { afterEach, expect, it, vi } from "vitest";
import { duplicateNoteVersion } from "./inspector-notes.server";

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => {
    throw new Error("Note versions must stay in WordPress CCT storage");
  },
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("copies every direct REL325 edge and links the new version without changing existing edges or position bindings", async () => {
  vi.stubEnv("WP_ADMIN_USER", "test");
  vi.stubEnv("WP_ADMIN_APP_PASSWORD", "test");
  const rows: Record<string, Record<string, unknown>> = {
    "10": {
      _ID: "10",
      a55: "手动笔记",
      a56: "完整正文",
      a58: "b55",
      a59: JSON.stringify({
        inspectorBindings: [{ key: "page|/x", id: "10" }],
      }),
      a60: "b55",
      a61: "核对说明",
      a62: "1.0",
    },
    "5": { _ID: "5", a55: "父关联", a56: "父正文", a58: "b56" },
    "20": { _ID: "20", a55: "子关联", a56: "子正文", a58: "b56" },
  };
  const edges = [
    { parent_object_id: 5, child_object_id: 10 },
    { parent_object_id: 10, child_object_id: 20 },
  ];
  const createBodies: Record<string, unknown>[] = [];
  const relationBodies: Record<string, unknown>[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      const path = url.pathname.replace(
        "/afresh/wp-json/jet-cct/manual_notes",
        "",
      );
      if (url.pathname.includes("/jet-rel/325")) {
        const relPath = url.pathname.split("/jet-rel/325")[1] || "";
        if (init?.method === "POST") {
          const body = JSON.parse(String(init.body)) as Record<string, unknown>;
          relationBodies.push(body);
          const edge = {
            parent_object_id: Number(body["parent_id"]),
            child_object_id: Number(body["child_id"]),
            ...(body["meta"]
              ? { meta: body["meta"] as Record<string, unknown> }
              : {}),
          };
          if (
            !edges.some(
              (existing) =>
                existing.parent_object_id === edge.parent_object_id &&
                existing.child_object_id === edge.child_object_id,
            )
          )
            edges.push(edge);
          return Response.json(true);
        }
        const id = relPath.split("/").filter(Boolean)[1];
        if (relPath.startsWith("/parents/"))
          return Response.json(
            edges.filter((edge) => String(edge.child_object_id) === id),
          );
        if (relPath.startsWith("/children/"))
          return Response.json(
            edges.filter((edge) => String(edge.parent_object_id) === id),
          );
      }
      if (init?.method === "POST" && !path) {
        const body = JSON.parse(String(init.body)) as Record<string, unknown>;
        createBodies.push(body);
        rows["11"] = { _ID: "11", ...body };
        return Response.json({ item_id: 11 });
      }
      const id = path.replace(/^\//, "");
      const row = rows[id];
      return row
        ? Response.json(row)
        : new Response("Not found", { status: 404 });
    }),
  );

  const copy = await duplicateNoteVersion("10", "2.0", "test-session");

  expect(copy).toMatchObject({
    id: "11",
    title: "手动笔记",
    text: "完整正文",
    version: "2.0",
    verified: true,
    relationVerified: true,
    relationDetails: "核对说明",
  });
  expect(createBodies[0]).toMatchObject({
    a55: "手动笔记",
    a56: "完整正文",
    a58: "b55",
    a60: "b55",
    a61: "核对说明",
    a62: "2.0",
  });
  expect(createBodies[0]).not.toHaveProperty("a59");
  expect(edges).toContainEqual({ parent_object_id: 5, child_object_id: 11 });
  expect(edges).toContainEqual({ parent_object_id: 11, child_object_id: 20 });
  expect(edges).toContainEqual({
    parent_object_id: 10,
    child_object_id: 11,
    meta: { a55: ["b55"] },
  });
  expect(edges).toContainEqual({ parent_object_id: 5, child_object_id: 10 });
  expect(edges).toContainEqual({ parent_object_id: 10, child_object_id: 20 });
  expect(relationBodies).toContainEqual({
    parent_id: 10,
    child_id: 11,
    context: "child",
    store_items_type: "update",
    meta: { a55: ["b55"] },
  });
  expect(
    relationBodies
      .filter((body) => body["parent_id"] !== 10 || body["child_id"] !== 11)
      .every((body) => !Object.hasOwn(body, "meta")),
  ).toBe(true);
  expect(rows["10"]?.["a62"]).toBe("1.0");
});
