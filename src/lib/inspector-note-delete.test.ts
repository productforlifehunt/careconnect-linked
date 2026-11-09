import { afterEach, expect, it, vi } from "vitest";
import { deleteInspectorNote } from "./inspector-notes.server";

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => {
    throw new Error("Deleting inspector notes must stay in WordPress CCT storage");
  },
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("disconnects direct REL325 edges and permanently deletes only the selected CCT324 note", async () => {
  vi.stubEnv("WP_ADMIN_USER", "test");
  vi.stubEnv("WP_ADMIN_APP_PASSWORD", "test");
  const rows = new Map<string, Record<string, unknown>>([
    ["5", { _ID: "5", a55: "Parent note", a56: "Parent body" }],
    ["10", { _ID: "10", a55: "Accidental note", a56: "Its body", a59: '{"inspectorBindings":[]}' }],
    ["20", { _ID: "20", a55: "Child note", a56: "Child body" }],
  ]);
  const edges = [
    { parent_object_id: 5, child_object_id: 10 },
    { parent_object_id: 10, child_object_id: 20 },
    { parent_object_id: 5, child_object_id: 20 },
  ];
  const deletedIds: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      const method = init?.method || "GET";
      if (url.pathname.includes("/jet-rel/325")) {
        const path = url.pathname.split("/jet-rel/325")[1] || "";
        if (method === "GET" && path.startsWith("/parents/")) {
          const id = path.slice("/parents/".length);
          return Response.json(edges.filter((edge) => String(edge.child_object_id) === id));
        }
        if (method === "GET" && path.startsWith("/children/")) {
          const id = path.slice("/children/".length);
          return Response.json(edges.filter((edge) => String(edge.parent_object_id) === id));
        }
        if (method === "POST") {
          const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
          if (body["store_items_type"] === "disconnect") {
            const parent = Number(body["parent_id"]);
            const child = Number(body["child_id"]);
            for (let index = edges.length - 1; index >= 0; index--) {
              const edge = edges[index];
              if (edge?.parent_object_id === parent && edge.child_object_id === child)
                edges.splice(index, 1);
            }
          }
          return Response.json(true);
        }
      }

      const id = url.pathname.replace(
        "/afresh/wp-json/jet-cct/manual_notes/",
        "",
      );
      if (method === "DELETE") {
        deletedIds.push(id);
        rows.delete(id);
        return new Response(null, { status: 204 });
      }
      const row = rows.get(id);
      return row ? Response.json(row) : new Response("Not found", { status: 404 });
    }),
  );

  const result = await deleteInspectorNote("10", "researcher-token");

  expect(result).toEqual({ id: "10", title: "Accidental note" });
  expect(deletedIds).toEqual(["10"]);
  expect([...rows.keys()].sort()).toEqual(["20", "5"]);
  expect(edges).toEqual([{ parent_object_id: 5, child_object_id: 20 }]);
});

it("does not delete relations or rows when the selected note does not exist", async () => {
  vi.stubEnv("WP_ADMIN_USER", "test");
  vi.stubEnv("WP_ADMIN_APP_PASSWORD", "test");
  const methods: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      methods.push(init?.method || "GET");
      return new Response("Not found", { status: 404 });
    }),
  );

  await expect(deleteInspectorNote("404", "researcher-token")).rejects.toThrow("404");
  expect(methods).toEqual(["GET"]);
});
