import { afterEach, expect, it, vi } from "vitest";
import { WP } from "@/integrations/wp-schema";
import {
  readNotesForPosition,
  readRelatedNotes,
} from "./inspector-notes.server";

afterEach(() => vi.unstubAllGlobals());

it("reads an already indexed position without per-note rereads", async () => {
  const key = "page|/cared-ones/46/plan";
  const binding = {
    key,
    id: "44",
    scope: "page",
    page: "/cared-ones/46/plan",
    label: "护理方案",
  };
  const fields = WP.cct["324"].f;
  const noteTypes = WP.cct["324"].opt["NOTE_TYPE"];
  const row = {
    _ID: "44",
    a55: "方案测试1",
    a56: "方案测试",
    a57: "ChallengeD",
    a58: "b55",
    a59: JSON.stringify({ inspectorBindings: [binding] }),
    [fields["笔记类型"]]: noteTypes["PAGE_DESCRIPTION"],
    [fields["笔记标签顺序"]]: "1",
  };
  const fetchMock = vi.fn(
    async () => new Response(JSON.stringify([row]), { status: 200 }),
  );
  vi.stubGlobal("fetch", fetchMock);

  const notes = await readNotesForPosition(key, "researcher-token");

  expect(notes.map((note) => note.id)).toEqual(["44"]);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("batch reads related note rows after resolving REL325 IDs", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith("/parents/100"))
      return new Response(JSON.stringify([{ parent_object_id: "201" }]), {
        status: 200,
      });
    if (url.pathname.endsWith("/children/100"))
      return new Response(JSON.stringify([{ child_object_id: "202" }]), {
        status: 200,
      });
    return new Response(
      JSON.stringify([
        { _ID: "201", a55: "父注释", a56: "父内容", a58: "b55" },
        { _ID: "202", a55: "子注释", a56: "子内容", a58: "b56" },
      ]),
      { status: 200 },
    );
  });
  vi.stubGlobal("fetch", fetchMock);

  const notes = await readRelatedNotes("100", "researcher-token");

  expect(notes.map(({ id, side }) => [id, side])).toEqual([
    ["201", "parent"],
    ["202", "child"],
  ]);
  expect(fetchMock).toHaveBeenCalledTimes(3);
  const filters = JSON.parse(
    new URL(String(fetchMock.mock.calls[2]?.[0])).searchParams.get(
      "_filters",
    ) || "[]",
  );
  expect(filters[0]).toMatchObject({
    field: "_ID",
    operator: "IN",
    value: ["201", "202"],
  });
});
