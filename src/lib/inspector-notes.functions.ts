import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

/** Researcher-only: read manual notes for an element and its page. */
export const loadInspectorNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        keys: z.array(z.string().min(1).max(600)).min(1).max(5),
        fingerprint: z.string().max(600).optional(),
        tag: z.string().max(60).optional(),
        page: z.string().max(400).optional(),
        priorKey: z.string().min(1).max(600).optional(),
        priorLabel: z.string().max(400).optional(),
        legacy: z
          .union([
            z.object({
              key: z.string().min(1).max(600),
              label: z.string().max(400),
            }),
            z
              .array(
                z.object({
                  key: z.string().min(1).max(600),
                  label: z.string().max(400),
                }),
              )
              .min(1)
              .max(8),
          ])
          .optional(),
        alias: z.string().max(600).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { verifyResearcher } = await import("./inspector-ai.server");
    try {
      await verifyResearcher(getRequestHeader("X-WP-Token") || "");
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Forbidden", notes: [] };
    }
    const { readNoteForKey, readNoteForFingerprint, rebindRecoveredNote } =
      await import("./inspector-notes.server");
    try {
      const notes = (await Promise.all(data.keys.map(readNoteForKey))).filter(
        (n) => !!n,
      );
      const { matchingLegacyLabel } =
        await import("@/features/inspector/legacy-match");
      let warning: string | undefined;
      const migrationCandidates: Array<{
        key: string;
        id: string;
        title: string;
        label: string;
        reason: string;
      }> = [];
      const seenCandidates = new Set<string>();
      const listCandidate = (
        note: Awaited<ReturnType<typeof readNoteForKey>>,
        key: string,
        label: string,
        reason: string,
      ) => {
        if (!note?.id) return;
        const signature = `${note.id}|${key}`;
        if (seenCandidates.has(signature)) return;
        seenCandidates.add(signature);
        migrationCandidates.push({
          key,
          id: note.id,
          title: note.title || "（无标题）",
          label,
          reason,
        });
      };
      const rebind = async (
        note: NonNullable<Awaited<ReturnType<typeof readNoteForKey>>>,
        label: string,
      ) => {
        const recovered = { ...note, key: data.keys[0]! };
        try {
          return await rebindRecoveredNote(
            recovered,
            data.keys[0]!,
            "element",
            data.page || "",
            label,
            data.alias,
          );
        } catch (error) {
          warning = `已读回 CCT324 #${note.id}，但 a59 关联没有写入：${error instanceof Error ? error.message : String(error)}`;
          return recovered;
        }
      };
      if (!notes.length && data.priorKey && data.page) {
        const previous = await readNoteForKey(data.priorKey);
        if (
          previous?.scope === "element" &&
          data.priorLabel &&
          matchingLegacyLabel(previous.label, data.priorLabel)
        ) {
          notes.push(await rebind(previous, data.priorLabel));
        } else if (previous) {
          listCandidate(
            previous,
            data.priorKey,
            data.priorLabel || "",
            "旧可见位置存在笔记，但标签未能核对一致",
          );
        }
      }
      if (!notes.length && data.legacy) {
        const entries = Array.isArray(data.legacy) ? data.legacy : [data.legacy];
        const candidates = [
          ...new Map(
            entries.flatMap((entry) => {
              const keys = [entry.key];
              const parts = entry.key.split("|");
              if (parts[0] === "el" && parts.length > 3)
                keys.push(parts.slice(0, -1).join("|"));
              return keys.map((key) => [key, { key, label: entry.label }] as const);
            }),
          ).values(),
        ];
        const oldRows = (
          await Promise.all(
            candidates.map((candidate) => readNoteForKey(candidate.key)),
          )
        ).flatMap((note, index) =>
          note ? [{ note, candidate: candidates[index]! }] : [],
        );
        const matches = oldRows.filter(({ note, candidate }) =>
          matchingLegacyLabel(note.label, candidate.label),
        );
        const matchIds = new Set(matches.map(({ note }) => note.id));
        if (matchIds.size === 1) {
          const match = matches[0]!;
          notes.push(await rebind(match.note, match.candidate.label));
        } else if (matchIds.size > 1) {
          warning = `发现多个旧元素绑定符合当前标签（${[...matchIds].map((id) => `CCT324 #${id}`).join("、")}），未自动绑定。请在“选择其他注释”中明确选择。`;
          for (const { note, candidate } of matches)
            listCandidate(
              note,
              candidate.key,
              candidate.label,
              "多个旧位置同时符合，未自动猜绑",
            );
        } else if (oldRows.length) {
          warning =
            "发现旧元素绑定，但没有一个能与当前可见标签唯一核对一致，未自动绑定。";
          for (const { note, candidate } of oldRows)
            listCandidate(note, candidate.key, candidate.label, "旧绑定标签未核对一致");
        }
      }
      if (!notes.length && data.fingerprint && data.tag && data.page) {
        const recovered = await readNoteForFingerprint(
          data.keys[0]!,
          data.fingerprint,
          data.tag,
          data.page,
          Array.isArray(data.legacy)
            ? data.legacy[0]?.label
            : data.legacy?.label,
        );
        if (recovered) notes.push(await rebind(recovered, recovered.label || ""));
      }
      return {
        notes,
        ...(warning ? { warning } : {}),
        ...(migrationCandidates.length ? { migrationCandidates } : {}),
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "读取失败", notes: [] };
    }
  });

/** Researcher-only: read every saved note in one call (the inspector caches them in the browser). */
export const loadAllInspectorNotes = createServerFn({ method: "POST" }).handler(
  async () => {
    const { verifyResearcher } = await import("./inspector-ai.server");
    try {
      await verifyResearcher(getRequestHeader("X-WP-Token") || "");
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Forbidden", notes: [] };
    }
    const { readAllNotes } = await import("./inspector-notes.server");
    const { encodeNotes } =
      await import("@/features/inspector/notes-transport");
    try {
      return { compressedNotes: await encodeNotes(await readAllNotes()) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "读取失败", notes: [] };
    }
  },
);

/** Researcher-only: note picker search (names only, at most 60, searched on the WordPress side). */
export const searchInspectorNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        q: z.string().max(200),
        status: z.enum(["all", "verified", "unverified"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { verifyResearcher } = await import("./inspector-ai.server");
    try {
      await verifyResearcher(getRequestHeader("X-WP-Token") || "");
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Forbidden", notes: [] };
    }
    const { searchNotes } = await import("./inspector-notes.server");
    try {
      return { notes: await searchNotes(data.q, data.status) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "搜索失败", notes: [] };
    }
  });

/** Researcher-only: save (overwrite) the manual note for one element or page. */
export const saveInspectorNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        key: z.string().min(1).max(600),
        scope: z.enum(["element", "page"]),
        page: z.string().max(400),
        label: z.string().max(400),
        title: z.string().min(1).max(240),
        id: z.string().regex(/^\d+$/).optional(),
        create: z.boolean().optional(),
        verified: z.boolean().optional(),
        text: z.string().max(100_000),
        source: z
          .object({
            file: z.string().min(1).max(300),
            line: z.number().int().positive(),
            endLine: z.number().int().positive(),
            tag: z.string().min(1).max(60),
            digest: z.string().regex(/^[0-9a-f]{64}$/),
          })
          .optional(),
        alias: z.string().max(600).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { verifyResearcher } = await import("./inspector-ai.server");
    try {
      await verifyResearcher(getRequestHeader("X-WP-Token") || "");
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Forbidden" };
    }
    const { writeNote } = await import("./inspector-notes.server");
    try {
      return { note: await writeNote(data) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "保存失败" };
    }
  });

export const selectInspectorNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        key: z.string().min(1).max(600),
        id: z.string().regex(/^\d+$/),
        scope: z.enum(["element", "page"]),
        page: z.string().max(400),
        label: z.string().max(400),
        source: z
          .object({
            file: z.string().min(1).max(300),
            line: z.number().int().positive(),
            endLine: z.number().int().positive(),
            tag: z.string().min(1).max(60),
            digest: z.string().regex(/^[0-9a-f]{64}$/),
          })
          .optional(),
        alias: z.string().max(600).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { verifyResearcher } = await import("./inspector-ai.server");
    try {
      await verifyResearcher(getRequestHeader("X-WP-Token") || "");
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Forbidden" };
    }
    const { selectNote } = await import("./inspector-notes.server");
    try {
      return { note: await selectNote(data) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "保存失败" };
    }
  });

const noteId = z.string().regex(/^\d+$/);
/** Explicit user submission to one existing record; never creates bindings or relations. */
export const submitNoteCorrection = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: noteId,
        title: z.string().trim().min(1).max(240),
        text: z.string().min(1).max(100_000),
        expected: z.object({
          title: z.string(),
          text: z.string(),
          verified: z.boolean(),
        }),
        confirmVerified: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const denied = await researcherOnly();
    if (denied) return { error: denied };
    try {
      const s = await import("./inspector-notes.server");
      const { assertUnchangedNote } =
        await import("@/features/inspector/corrections");
      const current = await s.readNoteById(data.id);
      assertUnchangedNote(current, data.expected);
      if (current.verified && !data.confirmVerified)
        throw new Error("这条笔记已手动核对，请先明确确认修改。");
      await s.updatePlainNote(data.id, data.title, data.text, current.verified);
      return { note: await s.readNoteById(data.id) };
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "提交失败，未确认保存。",
      };
    }
  });
async function researcherOnly(): Promise<string | undefined> {
  const { verifyResearcher } = await import("./inspector-ai.server");
  try {
    await verifyResearcher(getRequestHeader("X-WP-Token") || "");
    return undefined;
  } catch (e) {
    return e instanceof Error ? e.message : "Forbidden";
  }
}

/** Researcher-only: notes linked to one CCT324 note through REL325. */
export const listRelatedNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: noteId }).parse(input))
  .handler(async ({ data }) => {
    const denied = await researcherOnly();
    if (denied) return { error: denied, notes: [] };
    const { readRelatedNotes } = await import("./inspector-notes.server");
    try {
      return { notes: await readRelatedNotes(data.id) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "读取失败", notes: [] };
    }
  });

/** Researcher-only: link an existing note (or a newly created one) to the current note through REL325. */
export const linkRelatedNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: noteId,
        otherId: noteId.optional(),
        create: z
          .object({
            title: z.string().min(1).max(240),
            text: z.string().max(100_000),
          })
          .optional(),
      })
      .refine((v) => !!v.otherId !== !!v.create)
      .parse(input),
  )
  .handler(async ({ data }) => {
    const denied = await researcherOnly();
    if (denied) return { error: denied };
    const s = await import("./inspector-notes.server");
    try {
      const currentTitle = await s.noteTitle(data.id);
      const otherId =
        data.otherId ||
        (await s.createPlainNote(data.create!.title, data.create!.text));
      const otherTitle = data.otherId
        ? await s.noteTitle(otherId)
        : data.create!.title;
      const { parent, child } = s.relationDirection(
        { id: data.id, title: currentTitle },
        { id: otherId, title: otherTitle },
      );
      try {
        await s.linkNotes(parent, child);
      } catch (e) {
        if (data.create)
          throw new Error(
            `新注释 #${otherId} 已保存，但关联失败：${e instanceof Error ? e.message : String(e)}`,
          );
        throw e;
      }
      return { notes: await s.readRelatedNotes(data.id) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "关联失败" };
    }
  });

export const unlinkRelatedNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ id: noteId, parent: noteId, child: noteId })
      .refine((v) => v.id === v.parent || v.id === v.child)
      .parse(input),
  )
  .handler(async ({ data }) => {
    const denied = await researcherOnly();
    if (denied) return { error: denied };
    const s = await import("./inspector-notes.server");
    try {
      await s.unlinkNotes(data.parent, data.child);
      return { notes: await s.readRelatedNotes(data.id) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "取消关联失败" };
    }
  });

/** Researcher-only: edit a related note (name, content, manual-check flag) and return the refreshed REL325 list. */
export const updateRelatedNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: noteId,
        otherId: noteId,
        title: z.string().min(1).max(240),
        text: z.string().max(100_000),
        verified: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const denied = await researcherOnly();
    if (denied) return { error: denied };
    const s = await import("./inspector-notes.server");
    try {
      await s.updatePlainNote(
        data.otherId,
        data.title,
        data.text,
        data.verified,
      );
      return { notes: await s.readRelatedNotes(data.id) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "保存失败" };
    }
  });
