/** Researcher manual notes for the selected element or the whole page, saved privately so they survive refresh/close. */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  loadInspectorNotes,
  saveInspectorNote,
  selectInspectorNote,
  duplicateInspectorNoteVersion,
  listInspectorPositionNotes,
  reorderInspectorPositionNotes,
  updateBoundInspectorNote,
} from "@/lib/inspector-notes.functions";
import { inspectorNotesCache } from "@/features/inspector/notes-cache";
import { getWPToken } from "@/services/wp-auth";
import { useRef } from "react";
import { findSameElementNote } from "@/features/inspector/route-key";
import { type CCTNote } from "@/features/inspector/cct-notes";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NoteSearchList, type NotePick } from "./NoteSearchList";
import { ChevronsUpDown, Plus, Lock, Copy } from "lucide-react";
import { explainReadWrite } from "@/lib/inspector-ai.functions";
import { ConflictReportView } from "./ConflictReportView";
import type { ConflictReport } from "@/features/inspector/conflict-report";
import { Sparkles } from "lucide-react";

type MigrationCandidate = {
  key: string;
  id: string;
  title: string;
  label: string;
  reason: string;
};

type OneLoad = {
  note: CCTNote | null;
  warning?: string;
  migrationCandidates?: MigrationCandidate[];
};

/** Per-element read cache for this browser session; cleared on save/lock/retry so it never shows stale bindings. */
const oneCache = new Map<string, OneLoad>();
/** Deduplicate overlapping reads while recorder updates cause the inspector to render again. */
const onePending = new Map<string, Promise<OneLoad>>();

type InspectorNoteType = "b55" | "b56";
type NoteDraft = {
  title: string;
  version: string;
  text: string;
  noteType: InspectorNoteType;
  verified: boolean;
  relationVerified: boolean;
  relationDetails: string;
};

export function ManualNotes({
  noteKey,
  priorKey,
  legacyKey,
  legacySourceKey,
  legacyKeys,
  alias,
  fingerprint,
  scope,
  page,
  label,
  tag,
  onChange,
  buildEvidence,
  evidenceReady = false,
}: {
  noteKey: string;
  priorKey?: string | undefined;
  legacyKey?: string | undefined;
  legacySourceKey?: string | undefined;
  legacyKeys?: string[];
  alias?: string;
  fingerprint?: string | undefined;
  scope: "element" | "page";
  page: string;
  label: string;
  source?: string | undefined;
  tag?: string | undefined;
  onChange?: (text: string) => void;
  buildEvidence?: () => string;
  evidenceReady?: boolean;
}) {
  const loadOne = loadInspectorNotes;
  const save = saveInspectorNote;
  const select = selectInspectorNote;
  const duplicate = duplicateInspectorNoteVersion;
  const analyze = explainReadWrite;
  const [ai, setAi] = useState<{
    loading?: boolean;
    report?: ConflictReport;
    error?: string;
  }>({});
  const [picked, setPicked] = useState<NotePick>();
  const [selected, setSelected] = useState<string>();
  const [activeType, setActiveType] = useState<InspectorNoteType>("b55");
  const [draftNoteType, setDraftNoteType] = useState<InspectorNoteType>("b55");
  const [savedNoteType, setSavedNoteType] = useState<InspectorNoteType>("b55");
  const [positionNotes, setPositionNotes] = useState<CCTNote[]>([]);
  const [drafts, setDrafts] = useState<Record<string, NoteDraft>>({});
  const dragIndex = useRef<number | null>(null);
  const [title, setTitle] = useState("");
  const [savedTitle, setSavedTitle] = useState("");
  const [version, setVersion] = useState("");
  const [savedVersion, setSavedVersion] = useState("");
  const [copyVersion, setCopyVersion] = useState("");
  const [versionCopy, setVersionCopy] = useState<{
    version: string;
    note?: CCTNote;
    error?: string;
    saving?: boolean;
  } | null>(null);
  const [choice, setChoice] = useState<string>();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState("");
  const [state, setState] = useState<{
    loading?: boolean;
    saving?: boolean;
    saveStatus?: "saved" | undefined;
    saveError?: string | undefined;
    error?: string | undefined;
    warning?: string | undefined;
    migrationCandidates?: Array<{
      key: string;
      id: string;
      title: string;
      label: string;
      reason: string;
    }>;
    at?: string | undefined;
  }>({ loading: true });
  const [retry, setRetry] = useState(0);
  const [verified, setVerified] = useState(false);
  const [savedVerified, setSavedVerified] = useState(false);
  const [relationVerified, setRelationVerified] = useState(false);
  const [savedRelationVerified, setSavedRelationVerified] = useState(false);
  const [relationDetails, setRelationDetails] = useState("");
  const [savedRelationDetails, setSavedRelationDetails] = useState("");
  const [stale, setStale] = useState(false);
  // The element whose saved note is currently shown; save/lock are refused for any other element.
  const [loadedFor, setLoadedFor] = useState<string>();
  const ready = loadedFor === noteKey;
  const activeKey = useRef(noteKey);
  activeKey.current = noteKey;
  const revision = `${noteKey}|${selected}|${title}|${version}|${text}|${draftNoteType}|${verified}|${relationVerified}|${relationDetails}`;
  const activeRevision = useRef(revision);
  activeRevision.current = revision;
  const correctionState = useRef({ selected, title, text, savedTitle, saved, version, savedVersion, draftNoteType, savedNoteType, verified, savedVerified, relationVerified, relationDetails, savedRelationVerified, savedRelationDetails });
  correctionState.current = { selected, title, text, savedTitle, saved, version, savedVersion, draftNoteType, savedNoteType, verified, savedVerified, relationVerified, relationDetails, savedRelationVerified, savedRelationDetails };
  const hasUnsavedChanges =
    text !== saved ||
    title !== savedTitle ||
    version !== savedVersion ||
    draftNoteType !== savedNoteType ||
    verified !== savedVerified ||
    relationVerified !== savedRelationVerified ||
    relationDetails !== savedRelationDetails;
  const legacyKeysKey = legacyKeys?.join("\u0000") || "";
  useEffect(() => {
    const updated = (event: Event) => {
      const note = (
        event as CustomEvent<{
          id: string;
          title: string;
          text: string;
          verified: boolean;
          relationVerified?: boolean | undefined;
          relationDetails?: string | undefined;
        }>
      ).detail;
      const current = correctionState.current;
      if (note.id !== current.selected) return;
      if (
        current.text !== current.saved ||
        current.title !== current.savedTitle ||
        current.version !== current.savedVersion ||
        current.draftNoteType !== current.savedNoteType ||
        current.verified !== current.savedVerified ||
        current.relationVerified !== current.savedRelationVerified ||
        current.relationDetails !== current.savedRelationDetails
      ) {
        setStale(true);
        setState({
          error:
            "此笔记已通过“建议修改或补充”保存；这里仍有未保存的旧编辑，请重新读取后再编辑。",
        });
        return;
      }
      setText(note.text);
      setSaved(note.text);
      setTitle(note.title);
      setSavedTitle(note.title);
      setVerified(note.verified);
      setSavedVerified(note.verified);
      setRelationVerified(!!note.relationVerified);
      setSavedRelationVerified(!!note.relationVerified);
      setRelationDetails(note.relationDetails || "");
      setSavedRelationDetails(note.relationDetails || "");
      onChange?.(note.text);
    };
    window.addEventListener("inspector-note-corrected", updated);
    return () =>
      window.removeEventListener("inspector-note-corrected", updated);
  }, [onChange]);
  useEffect(() => {
    setAi({});
  }, [revision]);
  const analyzeNotes = async () => {
    const noteId = selected;
    if (!buildEvidence || !noteId) return;
    const current = revision;
    setAi({ loading: true });
    try {
      const context = buildEvidence();
      const result = await analyze({
        data: { context, scope, noteId, draft: { title, text } },
      });
      if (activeRevision.current !== current) return;
      setAi(
        result.report
          ? { report: result.report }
          : { error: result.error || "分析失败，核查未完成。" },
      );
    } catch (error) {
      if (activeRevision.current === current) setAi({ error: String(error) });
    }
  };
  useEffect(() => {
    let live = true;
    const session = getWPToken() || "";
    // Clear everything from the previously selected element first, so its note can never be saved onto this one.
    setLoadedFor(undefined);
    setSelected(undefined);
    setPositionNotes([]);
    setChoice(undefined);
    setActiveType("b55");
    setDraftNoteType("b55");
    setSavedNoteType("b55");
    setDrafts({});
    setText("");
    setSaved("");
    setTitle(label.slice(0, 240));
    setSavedTitle("");
    setVersion("");
    setSavedVersion("");
    setCopyVersion("");
    setVersionCopy(null);
    setVerified(false);
    setSavedVerified(false);
    setRelationVerified(false);
    setSavedRelationVerified(false);
    setRelationDetails("");
    setSavedRelationDetails("");
    setState({ loading: true });
    const uniqueLegacyKeys = [
      ...(legacyKeysKey ? legacyKeysKey.split("\u0000") : []),
      legacyKey,
      legacySourceKey,
    ].filter((key): key is string => !!key && key !== noteKey);
    const legacy = [
      ...new Set(uniqueLegacyKeys),
    ].map((key) => ({ key, label }));
    const apply = async (
      map: Awaited<ReturnType<typeof inspectorNotesCache.load>>,
      migration?: {
        warning?: string;
        migrationCandidates?: Array<{
          key: string;
          id: string;
          title: string;
          label: string;
          reason: string;
        }>;
      },
    ) => {
      if (!live || session !== (getWPToken() || "")) return;
      // Only the visible-element identity (page + component names + markup position), identical in preview
      // and published builds. No source line, no alias, no carry-over: different elements never share a note.
      const n = findSameElementNote(map, noteKey);
      if (!live || session !== (getWPToken() || "")) return;
      setText(n?.text || "");
      setSaved(n?.text || "");
      onChange?.(n?.text || "");
      setState({
        at: n?.updatedAt,
        ...(migration?.warning ? { warning: migration.warning } : {}),
        ...(migration?.migrationCandidates?.length
          ? { migrationCandidates: migration.migrationCandidates }
          : {}),
      });
      setSelected(n?.id);
      setChoice(n?.id);
      setActiveType(n?.noteType || "b55");
      setDraftNoteType(n?.noteType || "b55");
      setSavedNoteType(n?.noteType || "b55");
      setTitle(n?.title || label.slice(0, 240));
      setSavedTitle(n?.title || label.slice(0, 240));
      setVersion((n as CCTNote | undefined)?.version || "");
      setSavedVersion((n as CCTNote | undefined)?.version || "");
      setVerified(!!(n as CCTNote | undefined)?.verified);
      setSavedVerified(!!(n as CCTNote | undefined)?.verified);
      setRelationVerified(!!(n as CCTNote | undefined)?.relationVerified);
      setSavedRelationVerified(!!(n as CCTNote | undefined)?.relationVerified);
      setRelationDetails((n as CCTNote | undefined)?.relationDetails || "");
      setSavedRelationDetails((n as CCTNote | undefined)?.relationDetails || "");
      setStale(false);
      setLoadedFor(noteKey);
    };
    // Old scoped positions are equivalent across pages. Source-based recovery requires an exact,
    // unique build fingerprint and never downloads the full catalogue.
    const cacheKey = `${session}|${noteKey}`;
    const hit = oneCache.get(cacheKey);
    if (hit !== undefined)
      void apply(
        new Map(hit.note ? [[noteKey, hit.note]] : []) as Parameters<typeof apply>[0],
        hit,
      );
    else {
      setText("");
      setSaved("");
      onChange?.("");
      const keys = [noteKey];
      let pending = onePending.get(cacheKey);
      if (!pending) {
        pending = loadOne({
          data: {
            keys,
            priorKey,
            priorLabel: label,
            page,
            ...(fingerprint && tag ? { fingerprint, tag, page } : {}),
            ...(legacy.length ? { legacy } : {}),
            ...(alias ? { alias } : {}),
          },
        })
          .then((r) => {
            if ("error" in r && r.error) throw new Error(r.error);
            const result: OneLoad = {
              note: (r.notes as CCTNote[])[0] || null,
              ...( "warning" in r && r.warning ? { warning: r.warning } : {}),
              ...( "migrationCandidates" in r && r.migrationCandidates?.length
                ? { migrationCandidates: r.migrationCandidates }
                : {}),
            };
            oneCache.set(cacheKey, result);
            return result;
          })
          .finally(() => {
            if (onePending.get(cacheKey) === pending) onePending.delete(cacheKey);
          });
        onePending.set(cacheKey, pending);
      }
      pending
        .then((result) =>
          apply(
            new Map(result.note ? [[noteKey, result.note]] : []) as Parameters<typeof apply>[0],
            result,
          ),
        )
        .catch((e) => live && setState({ error: String(e) }));
    }
    return () => {
      live = false;
    };
  }, [noteKey, priorKey, legacyKey, legacySourceKey, legacyKeysKey, alias, fingerprint, tag, retry]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let live = true;
    const sessionToken = getWPToken() || "";
    if (!ready) return () => { live = false; };
    setState((current) => ({ ...current, loading: true }));
    listInspectorPositionNotes({ data: { key: noteKey } })
      .then((result) => {
        if (!live) return;
        if (getWPToken() !== sessionToken) return;
        if (result.error) {
          setState((current) => ({ ...current, loading: false, error: result.error }));
          return;
        }
        const notes = (result.notes || []) as CCTNote[];
        setPositionNotes(notes);
        const current = notes.find((note) => note.id === correctionState.current.selected);
        if (current) setActiveType(current.noteType || "b55");
        setState((currentState) => ({ ...currentState, loading: false, error: undefined }));
      })
      .catch((error) => live && setState((current) => ({ ...current, loading: false, error: String(error) })));
    return () => { live = false; };
  }, [noteKey, ready, retry]);

  const activePositionNotes = positionNotes
    .filter((note) => note.noteType === activeType)
    .sort((a, b) => (a.tabOrder ?? Number.MAX_SAFE_INTEGER) - (b.tabOrder ?? Number.MAX_SAFE_INTEGER) || Number(a.id) - Number(b.id));
  const stashActiveDraft = () => {
    if (!selected) return;
    setDrafts((current) => ({
      ...current,
      [selected]: { title, version, text, noteType: draftNoteType, verified, relationVerified, relationDetails },
    }));
  };
  const setFieldsFromPositionNote = (note: CCTNote, restoreDraft = true) => {
    const draft = restoreDraft ? drafts[note.id] : undefined;
    const noteType = note.noteType || "b55";
    setSelected(note.id);
    setActiveType(noteType);
    setDraftNoteType(draft?.noteType ?? noteType);
    setSavedNoteType(noteType);
    setTitle(draft?.title ?? note.title);
    setSavedTitle(note.title);
    setVersion(draft?.version ?? note.version ?? "");
    setSavedVersion(note.version || "");
    setText(draft?.text ?? note.text);
    setSaved(note.text);
    setVerified(draft?.verified ?? !!note.verified);
    setSavedVerified(!!note.verified);
    setRelationVerified(draft?.relationVerified ?? !!note.relationVerified);
    setSavedRelationVerified(!!note.relationVerified);
    setRelationDetails(draft?.relationDetails ?? note.relationDetails ?? "");
    setSavedRelationDetails(note.relationDetails || "");
    onChange?.(draft?.text ?? note.text);
    setState((current) => ({ ...current, saveStatus: undefined, saveError: undefined }));
  };

  const activateNote = (note: CCTNote) => {
    if (note.id === selected) return;
    stashActiveDraft();
    setChoice(undefined);
    const current = positionNotes.find((item) => item.id === note.id);
    if (current) setFieldsFromPositionNote(current);
  };

  const changeNoteType = (noteType: InspectorNoteType) => {
    if (noteType === activeType) return;
    stashActiveDraft();
    setActiveType(noteType);
    setChoice(undefined);
    const note = positionNotes
      .filter((item) => item.noteType === noteType)
      .sort((a, b) => (a.tabOrder ?? Number.MAX_SAFE_INTEGER) - (b.tabOrder ?? Number.MAX_SAFE_INTEGER) || Number(a.id) - Number(b.id))[0];
    if (note) setFieldsFromPositionNote(note);
    else {
      setSelected(undefined);
      setDraftNoteType(noteType);
      setSavedNoteType(noteType);
      setTitle(label.slice(0, 240));
      setSavedTitle("");
      setVersion("");
      setSavedVersion("");
      setText("");
      setSaved("");
      setVerified(false);
      setSavedVerified(false);
      setRelationVerified(false);
      setSavedRelationVerified(false);
      setRelationDetails("");
      setSavedRelationDetails("");
      onChange?.("");
    }
  };

  const persistTabOrder = async (from: number, to: number) => {
    if (to < 0 || to >= activePositionNotes.length || from === to || state.saving) return;
    const previous = positionNotes;
    const reordered = [...activePositionNotes];
    const [moved] = reordered.splice(from, 1);
    if (!moved) return;
    reordered.splice(to, 0, moved);
    const orderById = new Map(reordered.map((note, index) => [note.id, index + 1]));
    setPositionNotes((notes) => notes.map((note) =>
      orderById.has(note.id) ? { ...note, tabOrder: orderById.get(note.id) } : note,
    ));
    setState((current) => ({ ...current, saving: true, error: undefined }));
    try {
      const result = await reorderInspectorPositionNotes({
        data: { key: noteKey, noteType: activeType, ids: reordered.map((note) => note.id) },
      });
      if (result.error) throw new Error(result.error);
      setPositionNotes(result.notes || []);
    } catch (error) {
      setPositionNotes(previous);
      setState((current) => ({ ...current, error: error instanceof Error ? error.message : String(error) }));
    } finally {
      setState((current) => ({ ...current, saving: false }));
    }
  };

  const createLinkedNote = async () => {
    stashActiveDraft();
    const tabOrder = Math.max(0, ...activePositionNotes.map((note) => note.tabOrder || 0)) + 1;
    setState((current) => ({ ...current, saving: true, saveError: undefined }));
    try {
      const result = await save({
        data: {
          key: noteKey,
          scope,
          page,
          label,
          title: label.slice(0, 240),
          text: "",
          version: "",
          noteType: activeType,
          tabOrder,
          create: true,
          verified: false,
          relationVerified: false,
          relationDetails: "",
          ...(alias ? { alias } : {}),
          ...(await stableAnchor()),
        },
      });
      if (!result.note) throw new Error(result.error || "新注释创建失败。");
      const created = result.note as CCTNote;
      setPositionNotes((notes) => [...notes.filter((note) => note.id !== created.id), created]);
      setDrafts((current) => {
        const next = { ...current };
        delete next[created.id];
        return next;
      });
      setFieldsFromPositionNote(created, false);
      setChoice(undefined);
      setState((current) => ({ ...current, saveStatus: "saved" }));
    } catch (error) {
      setState((current) => ({ ...current, saveError: error instanceof Error ? error.message : String(error) }));
    } finally {
      setState((current) => ({ ...current, saving: false }));
    }
  };
  const stableAnchor = async () => {
    const match = fingerprint?.match(/^([^:]+):(\d+):\d+:([0-9a-f]{64}):1$/);
    if (!match || !tag) return {};
    const line = Number(match[2]);
    return {
      source: { file: match[1]!, line, endLine: line, tag, digest: match[3]! },
    };
  };
  const clearSaveNotice = () =>
    setState((current) => ({
      ...current,
      saveStatus: undefined,
      saveError: undefined,
    }));
  const doSave = async () => {
    if (stale || !ready || !selected) return;
    const session = getWPToken() || "";
    const key = noteKey;
    setState((s) => ({ ...s, saving: true, error: undefined, saveError: undefined, saveStatus: undefined }));
    try {
      const result = await updateBoundInspectorNote({
        data: {
          key: noteKey,
          id: selected,
          title,
          version,
          noteType: draftNoteType,
          tabOrder:
            savedNoteType === draftNoteType
              ? positionNotes.find((note) => note.id === selected)?.tabOrder || 1
              : Math.max(
                  0,
                  ...positionNotes
                    .filter((note) => note.noteType === draftNoteType)
                    .map((note) => note.tabOrder || 0),
                ) + 1,
          verified,
          relationVerified,
          relationDetails,
          text,
        },
      });
      if (activeKey.current !== key) return;
      if (session !== (getWPToken() || ""))
        throw new Error("登录状态已变化，请重新打开注释后再保存。");
      if (!result.note) throw new Error(result.error || "保存失败，请重试。");
      const updated = result.note as CCTNote;
      inspectorNotesCache.put(session, updated);
      oneCache.forEach((cached, cacheKey) => {
        if (cached.note?.id === updated.id) oneCache.delete(cacheKey);
      });
      setPositionNotes((notes) => notes.map((note) => note.id === updated.id ? updated : note));
      setDrafts((current) => {
        const next = { ...current };
        delete next[updated.id];
        return next;
      });
      setFieldsFromPositionNote(updated, false);
      setChoice(undefined);
      setState({ at: updated.updatedAt, saveStatus: "saved" });
    } catch (e) {
      if (activeKey.current === key)
        setState((s) => ({
          ...s,
          saveError: e instanceof Error ? e.message : String(e),
          saveStatus: undefined,
        }));
    } finally {
      if (activeKey.current === key)
        setState((s) => ({ ...s, saving: false }));
    }
  };
  const lockChoice = async () => {
    if (!choice || !ready) return;
    stashActiveDraft();
    const key = noteKey;
    const session = getWPToken() || "";
    setState((s) => ({ ...s, saving: true, error: undefined }));
    try {
      const tabOrder = Math.max(0, ...activePositionNotes.map((note) => note.tabOrder || 0)) + 1;
      const result = await select({
        data: {
          key,
          id: choice,
          scope,
          page,
          label,
          noteType: activeType,
          tabOrder,
          ...(alias ? { alias } : {}),
          ...(await stableAnchor()),
        },
      });
      if (session !== (getWPToken() || "") || activeKey.current !== key) return;
      if (!result.note) throw new Error(result.error || "选择未保存");
      inspectorNotesCache.put(session, result.note);
      oneCache.delete(`${session}|${key}`);
      setSelected(result.note.id);
      setPositionNotes((notes) => [...notes.filter((note) => note.id !== result.note!.id), result.note as CCTNote]);
      setFieldsFromPositionNote(result.note as CCTNote, false);
      setChoice(undefined);
      setState({ at: result.note.updatedAt });
    } catch (e) {
      if (activeKey.current === key) setState({ error: String(e) });
    }
  };
  const createVersionCopy = async () => {
    if (!selected || !copyVersion.trim()) return;
    setVersionCopy({ version: copyVersion, saving: true });
    try {
      const result = await duplicate({
        data: { id: selected, version: copyVersion.trim() },
      });
      if (!result.note) throw new Error(result.error || "新版本创建失败。");
      setVersionCopy({ version: copyVersion.trim(), note: result.note });
      setCopyVersion("");
    } catch (error) {
      setVersionCopy({
        version: copyVersion,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };
  const switchToVersionCopy = async (note: CCTNote) => {
    stashActiveDraft();
    const session = getWPToken() || "";
    const key = noteKey;
    setState((s) => ({ ...s, saving: true, error: undefined, saveError: undefined }));
    try {
      const noteType = note.noteType || activeType;
      const tabOrder = Math.max(0, ...positionNotes.filter((item) => item.noteType === noteType).map((item) => item.tabOrder || 0)) + 1;
      const result = await select({
        data: {
          key,
          id: note.id,
          scope,
          page,
          label,
          noteType,
          tabOrder,
          ...(alias ? { alias } : {}),
          ...(await stableAnchor()),
        },
      });
      if (session !== (getWPToken() || ""))
        throw new Error("登录状态已变化，请重新打开注释。");
      if (activeKey.current !== key) return;
      if (!result.note) throw new Error(result.error || "切换到新版本失败。");
      inspectorNotesCache.put(session, result.note);
      oneCache.delete(`${session}|${key}`);
      setSelected(result.note.id);
      setChoice(result.note.id);
      const selectedNote = result.note as CCTNote;
      setPositionNotes((notes) => [...notes.filter((item) => item.id !== selectedNote.id), selectedNote]);
      setFieldsFromPositionNote(selectedNote, false);
      setChoice(undefined);
      setVersionCopy(null);
      setState({ at: result.note.updatedAt, saveStatus: "saved" });
    } catch (error) {
      setVersionCopy((copy) => ({
        ...(copy || { version: note.version || "" }),
        error: error instanceof Error ? error.message : String(error),
      }));
    } finally {
      if (activeKey.current === key)
        setState((s) => ({ ...s, saving: false }));
    }
  };
  return (
    <div className="space-y-2 text-xs">
      <p className="text-muted-foreground">
        {state.loading
          ? "正在读取已保存的注释…"
          : selected
            ? `当前注释：${savedTitle} · ${version ? `v${version} · ` : "未设置版本 · "}CCT324 #${selected}`
            : "当前没有已保存的注释"}
      </p>
      {state.warning && (
        <div className="space-y-1 rounded-md border border-amber-500/50 bg-amber-50 p-2 text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
          <p role="status">{state.warning}</p>
          {state.migrationCandidates?.length ? (
            <ul className="list-disc space-y-0.5 pl-4">
              {state.migrationCandidates.map((candidate) => (
                <li key={`${candidate.id}|${candidate.key}`}>
                  CCT324 #{candidate.id} · {candidate.title}：{candidate.reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
      <div className="flex gap-1 rounded-md border bg-muted/20 p-1" role="tablist" aria-label="笔记类型">
        <Button
          type="button"
          size="sm"
          variant={activeType === "b55" ? "default" : "ghost"}
          role="tab"
          aria-selected={activeType === "b55"}
          onClick={() => changeNoteType("b55")}
        >
          页面说明注释
        </Button>
        <Button
          type="button"
          size="sm"
          variant={activeType === "b56" ? "default" : "ghost"}
          role="tab"
          aria-selected={activeType === "b56"}
          onClick={() => changeNoteType("b56")}
        >
          页面关联注释
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={state.loading || state.saving}
            >
              <ChevronsUpDown className="mr-1 h-3 w-3" />
              选择其他注释
            </Button>
          </PopoverTrigger>
          <PopoverContent
            data-rw-inspector
            className="z-[10001] w-80 p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <NoteSearchList
              onClose={() => setOpen(false)}
              onPick={(n) => {
                setChoice(n.id);
                setPicked(n);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          size="sm"
          disabled={!ready || !choice || choice === selected || state.saving}
          onClick={lockChoice}
        >
          <Lock className="mr-1 h-3 w-3" />
          锁定选择
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={state.loading || state.saving || !!state.error}
          onClick={() => void createLinkedNote()}
        >
          <Plus className="mr-1 h-3 w-3" />
          新建关联手动注释
        </Button>
      </div>
      <div className="space-y-1" data-rw-inspector>
        <p className="text-muted-foreground">
          {activeType === "b55" ? "页面说明注释" : "页面关联注释"} · {activePositionNotes.length} 条
        </p>
        {activePositionNotes.length > 0 && (
          <div className="flex gap-1 overflow-x-auto rounded-md border bg-muted/20 p-1" role="tablist" aria-label={activeType === "b55" ? "页面说明注释列表" : "页面关联注释列表"}>
            {activePositionNotes.map((note, index) => (
              <Button
                key={note.id}
                type="button"
                size="sm"
                variant={selected === note.id ? "default" : "ghost"}
                role="tab"
                aria-selected={selected === note.id}
                draggable
                onDragStart={() => { dragIndex.current = index; }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragIndex.current !== null) void persistTabOrder(dragIndex.current, index);
                  dragIndex.current = null;
                }}
                onDragEnd={() => { dragIndex.current = null; }}
                onClick={() => activateNote(note)}
                className="shrink-0 cursor-grab"
              >
                {index + 1}. {note.title || `注释 #${note.id}`}
              </Button>
            ))}
          </div>
        )}
      </div>
      {selected && (
      <section role="tabpanel" aria-label={activeType === "b55" ? "页面说明注释内容" : "页面关联注释内容"} className="space-y-2">
      {choice && choice !== selected && (
        <p>
          待锁定：{picked?.id === choice ? picked.title : ""} · #{choice} ·{" "}
          {picked?.id === choice && picked.verified
            ? "已手动核对"
            : "未手动核对"}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(8rem,1fr)]">
        <label className="block space-y-1">
          <span className="text-muted-foreground">标题</span>
          <Input
            aria-label="注释名字"
            value={title}
            onChange={(e) => { setTitle(e.target.value); clearSaveNotice(); }}
            maxLength={240}
            disabled={state.loading || state.saving}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-muted-foreground">版本</span>
          <Input
            aria-label="注释版本"
            value={version}
            onChange={(e) => { setVersion(e.target.value); clearSaveNotice(); }}
            maxLength={80}
            placeholder="例如 1.0"
            disabled={state.loading || state.saving}
          />
        </label>
      </div>
      <label className="block max-w-sm space-y-1">
        <span className="text-muted-foreground">注释分类</span>
        <Select
          value={draftNoteType}
          onValueChange={(value) => {
            setDraftNoteType(value as InspectorNoteType);
            clearSaveNotice();
          }}
          disabled={state.loading || state.saving}
        >
          <SelectTrigger aria-label="注释分类">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="b55">页面说明注释（B55）</SelectItem>
            <SelectItem value="b56">页面关联注释（B56）</SelectItem>
          </SelectContent>
        </Select>
        {draftNoteType !== savedNoteType && (
          <span className="text-xs text-muted-foreground">保存后切换分类</span>
        )}
      </label>
      <Textarea
        aria-label="注释内容"
        value={text}
        onChange={(e) => { setText(e.target.value); clearSaveNotice(); }}
        rows={8}
        disabled={state.loading || state.saving}
        placeholder={
          state.loading ? "读取中…" : "写下这里应该怎么读写、怎么判定…"
        }
      />
      <label className="flex items-center gap-2">
        <Switch
          checked={verified}
          onCheckedChange={(value) => { setVerified(value); clearSaveNotice(); }}
          disabled={state.loading || state.saving}
          aria-label="已手动核对"
        />
        <span>{verified ? "已手动核对" : "未手动核对"}</span>
        {verified !== savedVerified && (
          <span className="text-muted-foreground">（未保存）</span>
        )}
      </label>
      <fieldset className="space-y-2 rounded-md border bg-muted/20 p-3">
        <legend className="px-1 text-sm font-medium">笔记关联核对</legend>
        <label className="flex items-center gap-2">
          <Switch
            checked={relationVerified}
            onCheckedChange={(value) => { setRelationVerified(value); clearSaveNotice(); }}
            disabled={state.loading || state.saving}
            aria-label="已手动核对笔记关联"
          />
          <span>
            {relationVerified ? "已手动核对笔记关联" : "未手动核对笔记关联"}
          </span>
          {relationVerified !== savedRelationVerified && (
            <span className="text-muted-foreground">（未保存）</span>
          )}
        </label>
        <label className="block space-y-1 text-sm">
          <span>关联核对详情</span>
          <Textarea
            aria-label="已手动核对笔记关联详情"
            value={relationDetails}
            onChange={(event) => { setRelationDetails(event.target.value); clearSaveNotice(); }}
            rows={4}
            maxLength={100_000}
            disabled={state.loading || state.saving}
            placeholder="记录关联关系的说明或核对依据…"
          />
        </label>
        {relationDetails !== savedRelationDetails && (
          <p className="text-xs text-muted-foreground">
            关联核对详情有未保存的修改
          </p>
        )}
      </fieldset>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={doSave}
          disabled={
            !ready ||
            stale ||
            state.loading ||
            state.saving ||
            !title.trim() ||
            (selected !== undefined && !hasUnsavedChanges)
          }
        >
          {state.saving ? "保存中…" : "保存注释"}
        </Button>
        {hasUnsavedChanges && !state.saving && (
          <span role="status" className="text-muted-foreground">有未保存的修改</span>
        )}
        {selected !== undefined && !hasUnsavedChanges && state.at && (
          <span className="text-muted-foreground">
            已保存 {new Date(state.at).toLocaleString()}
          </span>
        )}
      </div>
      {state.saving && <p role="status">修改中…</p>}
      {state.saveStatus === "saved" && !state.saving && (
        <p role="status" className="text-emerald-700">修改成功，已读回确认。</p>
      )}
      {state.saveError && <p role="alert" className="text-destructive">修改失败：{state.saveError}</p>}
      {selected && (
        <div className="space-y-2 rounded-md border p-2">
          <Button
            size="sm"
            variant="outline"
            disabled={state.loading || state.saving}
            onClick={() => { setVersionCopy({ version: "" }); setCopyVersion(""); }}
          >
            <Copy className="mr-1 h-3 w-3" />复制为新版本
          </Button>
          {versionCopy && !versionCopy.note && (
            <div className="flex flex-wrap items-end gap-2">
              <label className="space-y-1 text-sm">
                <span>新版本号</span>
                <Input
                  aria-label="新版本号"
                  value={copyVersion}
                  onChange={(event) => setCopyVersion(event.target.value)}
                  maxLength={80}
                  placeholder="例如 2.0"
                />
              </label>
              <Button size="sm" disabled={versionCopy.saving || !copyVersion.trim()} onClick={createVersionCopy}>
                {versionCopy.saving ? "创建中…" : "创建新版本"}
              </Button>
              <Button size="sm" variant="ghost" disabled={versionCopy.saving} onClick={() => setVersionCopy(null)}>取消</Button>
            </div>
          )}
          {versionCopy?.error && <p role="alert" className="text-destructive">新版本创建失败：{versionCopy.error}</p>}
          {versionCopy?.note && (
            <div className="space-y-2" role="status">
              <p>新版本 v{versionCopy.note.version} 已创建，标题、正文和关联已复制。是否切换到新版本继续编辑？</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => void switchToVersionCopy(versionCopy.note!)}>是，切换</Button>
                <Button size="sm" variant="outline" onClick={() => { setVersionCopy(null); setState((s) => ({ ...s, saveStatus: "saved" })); }}>否，保留当前笔记</Button>
              </div>
            </div>
          )}
        </div>
      )}
      </section>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={
          state.loading ||
          state.saving ||
          ai.loading ||
          !selected ||
          !buildEvidence ||
          !evidenceReady
        }
        onClick={analyzeNotes}
      >
        <Sparkles className="mr-1 h-3 w-3" />
        {ai.loading
          ? "AI 分析中…"
          : !evidenceReady
            ? "等这页数据和代码读完…"
            : "AI 分析：注释、关联注释与实际读写"}
      </Button>
      {ai.error && (
        <p role="alert" className="text-destructive">
          {ai.error}
        </p>
      )}
      {ai.report && <ConflictReportView report={ai.report} />}
      {!selected && !state.loading && (
        <p className="rounded-md border p-2 text-muted-foreground">
          这个分类还没有注释，点击上方按钮添加。
        </p>
      )}
      {state.error && (
        <div className="flex items-center gap-2">
          <p className="text-destructive">{state.error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              inspectorNotesCache.reset();
              oneCache.clear();
              setRetry((n) => n + 1);
            }}
          >
            重新读取
          </Button>
        </div>
      )}
    </div>
  );
}
