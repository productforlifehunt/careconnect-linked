import { afterEach, expect, it, vi } from "vitest";
import {
  readNoteForKey,
  readNoteForFingerprint,
  readNotesForPosition,
  selectNote,
} from "./inspector-notes.server";
import { WP } from "@/integrations/wp-schema";

const noteFields = WP.cct["324"].f;

type TestRow = {
  _ID: string | number;
  a55: string;
  a56: string;
  a57?: string;
  a58?: string | null;
  a59?: string;
  [field: string]: unknown;
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => {
    throw new Error("Cloud binding storage must not be used");
  },
}));
const binding = {
  key: "el|*|scope:settings-personal-form|@div",
  id: "10567",
  scope: "element" as const,
  page: "/settings",
  label: "个人设置",
  locked: true,
};
const original = {
  version: 2,
  relatedNoteIds: ["10564"],
  frontendTargets: [{ app: "afresh", pageKey: "/" }],
  inspectorBindings: [binding],
};
function fixture(normalizeEmpty = false) {
  let row: TestRow = {
    _ID: "10567",
    a55: "个人设置表单",
    a56: "不可改变的原正文",
    a57: "ChallengeD",
    a58: normalizeEmpty ? null : "b55",
    a59: JSON.stringify(original),
    [noteFields["已手动核对笔记关联"]!]:
      WP.cct["324"].opt["NOTE_RELATION_VERIFIED"]!["YES"],
    [noteFields["已手动核对笔记关联详情"]!]: "现有 REL325 关系已核对",
    [noteFields["版本"]!]: "1.0",
    [noteFields["笔记类型"]!]: "b55",
    [noteFields["笔记标签顺序"]!]: "1",
  };
  const writes: { url: string; body: Record<string, unknown> }[] = [];
  vi.stubEnv("WP_ADMIN_USER", "test");
  vi.stubEnv("WP_ADMIN_APP_PASSWORD", "test");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as Record<string, unknown>;
        writes.push({ url, body });
        row = { ...row, ...body } as TestRow;
        if (normalizeEmpty && "a58" in body) row["a58"] = "";
        return Response.json(true);
      }
      return Response.json(url.includes("?") ? [row] : row);
    }),
  );
  return { writes, getRow: () => row };
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("reads the exact migrated note only through WordPress a59, never Cloud", async () => {
  fixture();
  expect(await readNoteForKey(binding.key)).toMatchObject({
    id: "10567",
    text: "不可改变的原正文",
    locked: true,
  });
});
it("explicit binding save writes only CCT324 a59 and leaves body, verified state and REL325 metadata intact", async () => {
  const f = fixture();
  await selectNote(binding);
  expect(f.writes).toHaveLength(1);
  expect(f.writes[0]?.url).toBe(
    "https://app.challenged-dementia.com/afresh/wp-json/jet-cct/manual_notes/10567",
  );
  expect(Object.keys(f.writes[0]?.body ?? {})).toEqual(["a59"]);
  expect(f.getRow()).toMatchObject({
    a55: "个人设置表单",
    a56: "不可改变的原正文",
    a58: "b55",
  });
  expect(JSON.parse(String(f.getRow().a59))).toEqual(original);
});

it.each(["b55", "b56"] as const)(
  "selects a %s note and stores only its page binding in a59",
  async (noteType) => {
    const f = fixture();
    const selected = await selectNote({
      key: "page|/care-circle/46/tasks",
      id: "10567",
      scope: "page",
      page: "/care-circle/46/tasks",
      label: "Care Tasks",
      noteType,
      tabOrder: 2,
    });

    expect(selected).toMatchObject({
      id: "10567",
      key: "page|/care-circle/46/tasks",
      noteType,
      tabOrder: 2,
      locked: true,
    });
    expect(f.writes).toHaveLength(2);
    expect(f.writes[0]?.body).not.toHaveProperty("a59");
    expect(f.writes[0]?.body[noteFields["笔记类型"]!]).toBe(noteType);
    expect(f.writes[0]?.body[noteFields["笔记标签顺序"]!]).toBe("2");
    expect(Object.keys(f.writes[1]?.body ?? {})).toEqual(["a59"]);

    const saved = f.getRow();
    expect(saved[noteFields["笔记类型"]!]).toBe(noteType);
    expect(String(saved[noteFields["笔记标签顺序"]!])).toBe("2");
    expect(saved).toMatchObject({
      a55: "个人设置表单",
      a56: "不可改变的原正文",
      a57: "ChallengeD",
      a58: "b55",
      [noteFields["已手动核对笔记关联详情"]!]: "现有 REL325 关系已核对",
      [noteFields["版本"]!]: "1.0",
    });

    const stored = JSON.parse(String(saved.a59)) as typeof original;
    expect(stored.version).toBe(original.version);
    expect(stored.relatedNoteIds).toEqual(original.relatedNoteIds);
    expect(stored.frontendTargets).toEqual(original.frontendTargets);
    expect(stored.inspectorBindings).toEqual([
      binding,
      {
        key: "page|/care-circle/46/tasks",
        id: "10567",
        scope: "page",
        page: "/care-circle/46/tasks",
        label: "Care Tasks",
        locked: true,
      },
    ]);
    const positionNotes = await readNotesForPosition(
      "page|/care-circle/46/tasks",
    );
    expect(positionNotes).toHaveLength(1);
    expect(positionNotes[0]).toMatchObject({
      id: "10567",
      key: "page|/care-circle/46/tasks",
      noteType,
      tabOrder: 2,
      scope: "page",
      page: "/care-circle/46/tasks",
      label: "Care Tasks",
      locked: true,
    });
  },
);
it.each(["b55", "b56"] as const)(
  "selects a %s site note and retains its element and page bindings together in a59",
  async (noteType) => {
    const f = fixture();
    await selectNote({
      key: "page|/care-circle/46/tasks",
      id: "10567",
      scope: "page",
      page: "/care-circle/46/tasks",
      label: "Care Tasks",
    });
    await selectNote({
      key: "el|/inbox|components/Inbox.tsx:20|button",
      id: "10567",
      scope: "element",
      page: "/inbox",
      label: "Inbox button",
    });
    const selected = await selectNote({
      key: "site|challenged",
      id: "10567",
      scope: "site",
      page: "/",
      label: "ChallengeD 全站",
      noteType,
      tabOrder: 1,
    });

    expect(selected).toMatchObject({ id: "10567", key: "site|challenged", scope: "site", noteType, locked: true });
    const stored = JSON.parse(String(f.getRow().a59)) as typeof original;
    expect(stored.inspectorBindings).toEqual([
      binding,
      { key: "page|/care-circle/46/tasks", id: "10567", scope: "page", page: "/care-circle/46/tasks", label: "Care Tasks", locked: true },
      { key: "el|/inbox|components/Inbox.tsx:20|button", id: "10567", scope: "element", page: "/inbox", label: "Inbox button", locked: true },
      { key: "site|challenged", id: "10567", scope: "site", page: "/", label: "ChallengeD 全站", locked: true },
    ]);
    expect(await readNotesForPosition("site|challenged")).toMatchObject([
      { id: "10567", key: "site|challenged", scope: "site", noteType },
    ]);
    expect(f.getRow()).toMatchObject({ a55: "个人设置表单", a56: "不可改变的原正文", a57: "ChallengeD" });
  },
);
it("plugin normalization of an empty verification field does not report a false binding-save failure", async () => {
  fixture(true);
  expect(await selectNote(binding)).toMatchObject({
    id: "10567",
    verified: false,
  });
});

it("recovers one source-verified note with public CCT reads, but refuses ambiguous or changed fingerprints", async () => {
  vi.stubEnv("WP_ADMIN_USER", "");
  vi.stubEnv("WP_ADMIN_APP_PASSWORD", "");
  const digest = "a".repeat(64);
  const source = {
    file: "pages/Test.tsx",
    line: 5,
    endLine: 5,
    tag: "p",
    digest,
  };
  const row = (id: string) => ({
    _ID: id,
    a55: `注释 ${id}`,
    a56: "原文",
    a59: JSON.stringify({
      inspectorBindings: [
        {
          key: `source|${id}`,
          id,
          scope: "element",
          page: "",
          label: "",
          source,
        },
      ],
    }),
  });
  let rows = [row("11")];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      expect(new Headers(init?.headers).has("Authorization")).toBe(false);
      return Response.json(rows);
    }),
  );
  const fp = `pages/Test.tsx:5:2:${digest}:1`;
  expect(
    await readNoteForFingerprint("el|/test|one", fp, "p", "/test"),
  ).toMatchObject({ id: "11", key: "el|/test|one", text: "原文" });
  expect(
    await readNoteForFingerprint("el|/test|one", fp, "span", "/test"),
  ).toBeNull();
  expect(
    await readNoteForFingerprint(
      "el|/test|one",
      fp.replace(/:1$/, ":0"),
      "p",
      "/test",
    ),
  ).toBeNull();
  rows = [row("11"), row("12")];
  expect(
    await readNoteForFingerprint("el|/test|one", fp, "p", "/test"),
  ).toBeNull();
});
