/** Researcher manual notes for the selected element or the whole page, saved privately so they survive refresh/close. */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  loadInspectorNotes,
  saveInspectorNote,
  selectInspectorNote,
  duplicateInspectorNoteVersion,
  listInspectorPositionNotes,
  unlinkInspectorPositionNote,
  deleteInspectorNote,
  reorderInspectorPositionNotes,
  updateBoundInspectorNote,
} from "@/lib/inspector-notes.functions";
import { inspectorNotesCache } from "@/features/inspector/notes-cache";
import { samePosition } from "@/features/inspector/position-bindings";
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
import { ChevronsUpDown, Plus, Copy, Trash2 } from "lucide-react";
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
  positionNotes?: CCTNote[];
  warning?: string;
  migrationCandidates?: MigrationCandidate[];
};

/** Per-element read cache for this browser session; successful writes update it so reopening never repeats reads. */
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
  scope: "element" | "page" | "site";
  page: string;
  label: string;
  source?: string | undefined;
  tag?: string | undefined;
  onChange?: (text: string) => void;
  buildEvidence?: () => string;
  evidenceReady?: boolean;
}) {
  const noteScopeLabel = scope === "site" ? "全站" : "页面";
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
  const [selected, setSelected] = useState<string>();
  const [activeType, setActiveType] = useState<InspectorNoteType>("b55");
  const [draftNoteType, setDraftNoteType] = useState<InspectorNoteType>("b55");
  const [savedNoteType, setSavedNoteType] = useState<InspectorNoteType>("b55");
  const [positionNotes, setPositionNotes] = useState<CCTNote[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CCTNote | null>(null);
  const [deleteError, setDeleteError] = useState("");
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
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState("");
  const [state, setState] = useState<{
    loading?: boolean;
    saving?: boolean;
    activity?: string | undefined;
    successMessage?: string | undefined;
    saveStatus?: "saved" | undefined;
    saveError?: string | undefined;
    unlinkError?: string | undefined;
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
    setDeleteTarget(null);
    setDeleteError("");
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
        positionNotes?: CCTNote[];
      },
    ) => {
      if (!live || session !== (getWPToken() || "")) return;
      // Only the visible-element identity (page + component names + markup position), identical in preview
      // and published builds. No source line, no alias, no carry-over: different elements never share a note.
      const n = findSameElementNote(map, noteKey);
      if (!live || session !== (getWPToken() || "")) return;
      const hasPositionNotes = migration?.positionNotes !== undefined;
      if (hasPositionNotes) setPositionNotes(migration.positionNotes || []);
      setText(n?.text || "");
      setSaved(n?.text || "");
      onChange?.(n?.text || "");
      setState({
        loading: !hasPositionNotes,
        at: n?.updatedAt,
        ...(migration?.warning ? { warning: migration.warning } : {}),
        ...(migration?.migrationCandidates?.length
          ? { migrationCandidates: migration.migrationCandidates }
          : {}),
      });
      setSelected(n?.id);
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
      setSavedRelationDetails(
        (n as CCTNote | undefined)?.relationDetails || "",
      );
      setStale(false);
      setLoadedFor(noteKey);
      if (!hasPositionNotes) {
        listInspectorPositionNotes({ data: { key: noteKey } })
          .then((result) => {
            if (!live || session !== (getWPToken() || "")) return;
            if (result.error) {
              setState((current) => ({
                ...current,
                loading: false,
                error: result.error,
              }));
              return;
            }
            const notes = (result.notes || []) as CCTNote[];
            setPositionNotes(notes);
            const current = notes.find(
              (note) => note.id === correctionState.current.selected,
            );
            if (current) setActiveType(current.noteType || "b55");
            setState((currentState) => ({
              ...currentState,
              loading: false,
              error: undefined,
            }));
          })
          .catch((error) => {
            if (live && session === (getWPToken() || ""))
              setState((current) => ({
                ...current,
                loading: false,
                error: String(error),
              }));
          });
      }
    };
    // Old scoped positions are equivalent across pages. Source-based recovery requires an exact,
    // unique build fingerprint and never downloads the full catalogue.
    const cacheKey = `${session}|${noteKey}`;
    const hit = oneCache.get(cacheKey);
    if (hit !== undefined)
      void apply(
        new Map(hit.note ? [[noteKey, hit.note]] : []) as Parameters<
          typeof apply
        >[0],
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
              ...("positionNotes" in r && Array.isArray(r.positionNotes)
                ? { positionNotes: r.positionNotes as CCTNote[] }
                : {}),
              ...("warning" in r && r.warning ? { warning: r.warning } : {}),
              ...("migrationCandidates" in r && r.migrationCandidates?.length
                ? { migrationCandidates: r.migrationCandidates }
                : {}),
            };
            oneCache.set(cacheKey, {
              note: result.note,
              ...(result.positionNotes !== undefined ? { positionNotes: result.positionNotes } : {}),
              ...(result.warning ? { warning: result.warning } : {}),
              ...(result.migrationCandidates
                ? { migrationCandidates: result.migrationCandidates }
                : {}),
            });
            return result;
          })
          .finally(() => {
            if (onePending.get(cacheKey) === pending)
              onePending.delete(cacheKey);
          });
        onePending.set(cacheKey, pending);
      }
      pending
        .then((result) =>
          apply(
            new Map(result.note ? [[noteKey, result.note]] : []) as Parameters<
              typeof apply
            >[0],
            result,
          ),
        )
        .catch((e) => live && setState({ error: String(e) }));
    }
    return () => {
      live = false;
    };
  }, [noteKey, priorKey, legacyKey, legacySourceKey, legacyKeysKey, alias, fingerprint, tag, retry]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const current = positionNotes.find((item) => item.id === note.id);
    if (current) setFieldsFromPositionNote(current);
  };

  const changeNoteType = (noteType: InspectorNoteType) => {
    if (noteType === activeType) return;
    stashActiveDraft();
    setActiveType(noteType);
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
    setState((current) => ({ ...current, saving: true, activity: "正在保存注释顺序…", successMessage: undefined, error: undefined }));
    try {
      const result = await reorderInspectorPositionNotes({
        data: { key: noteKey, noteType: activeType, ids: reordered.map((note) => note.id) },
      });
      if (result.error) throw new Error(result.error);
      const notes = (result.notes || []) as CCTNote[];
      setPositionNotes(notes);
      const cacheKey = `${getWPToken() || ""}|${noteKey}`;
      const cached = oneCache.get(cacheKey);
      if (cached) oneCache.set(cacheKey, { ...cached, note: notes.find((note) => note.id === selected) || cached.note, positionNotes: notes });
      setState((current) => ({ ...current, activity: undefined, successMessage: "注释顺序已保存。" }));
    } catch (error) {
      setPositionNotes(previous);
      setState((current) => ({ ...current, activity: undefined, error: error instanceof Error ? error.message : String(error) }));
    } finally {
      setState((current) => ({ ...current, saving: false, activity: undefined }));
    }
  };

  const unlinkPositionNote = async (note: CCTNote) => {
    if (!ready || state.saving) return;
    const key = noteKey;
    const session = getWPToken() || "";
    stashActiveDraft();
    setState((current) => ({
      ...current,
      saving: true,
      activity: `正在解除「${note.title || `注释 #${note.id}`}」与当前位置的关联…`,
      successMessage: undefined,
      saveError: undefined,
      unlinkError: undefined,
      error: undefined,
    }));
    try {
      const result = await unlinkInspectorPositionNote({ data: { key, id: note.id } });
      if (activeKey.current !== key) return;
      if (session !== (getWPToken() || ""))
        throw new Error("登录状态已变化，请重新打开注释后再解除关联。");
      if (result.error) throw new Error(result.error);
      const removedKeys = result.removedKeys as string[] | undefined;
      if (!removedKeys?.length) throw new Error("未确认当前位置的关联已解除。");

      inspectorNotesCache.removePosition(session, note.id, removedKeys);
      const nextPositionNotes = positionNotes.filter((item) => item.id !== note.id);
      setPositionNotes(nextPositionNotes);
      oneCache.forEach((cached, cacheKey) => {
        const prefix = `${session}|`;
        if (!cacheKey.startsWith(prefix) || !samePosition(cacheKey.slice(prefix.length), key)) return;
        oneCache.set(cacheKey, {
          ...cached,
          note: cached.note?.id === note.id ? null : cached.note,
          positionNotes: (cached.positionNotes || []).filter((item) => item.id !== note.id),
        });
      });
      oneCache.set(`${session}|${key}`, { note: null, positionNotes: nextPositionNotes });

      if (selected === note.id) {
        const nextSelected = nextPositionNotes
          .filter((item) => item.noteType === activeType)
          .sort((a, b) => (a.tabOrder ?? Number.MAX_SAFE_INTEGER) - (b.tabOrder ?? Number.MAX_SAFE_INTEGER) || Number(a.id) - Number(b.id))[0];
        if (nextSelected) setFieldsFromPositionNote(nextSelected);
        else {
          setSelected(undefined);
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
      }
      setState((current) => ({
        ...current,
        saveStatus: undefined,
        successMessage: `已解除「${note.title || `注释 #${note.id}`}」与当前位置的关联；注释及其他位置的关联已保留。`,
      }));
    } catch (error) {
      if (activeKey.current === key)
        setState((current) => ({
          ...current,
          unlinkError: error instanceof Error ? error.message : String(error),
        }));
    } finally {
      if (activeKey.current === key)
        setState((current) => ({ ...current, saving: false, activity: undefined }));
    }
  };

  const deleteNote = async () => {
    const note = deleteTarget;
    if (!note || !ready || state.saving) return;
    const key = noteKey;
    const session = getWPToken() || "";
    stashActiveDraft();
    setDeleteError("");
    setState((current) => ({
      ...current,
      saving: true,
      activity: `正在永久删除「${note.title || `注释 #${note.id}`}」及其关联…`,
      successMessage: undefined,
      saveError: undefined,
      unlinkError: undefined,
      error: undefined,
    }));
    try {
      const result = await deleteInspectorNote({ data: { id: note.id } });
      if (session !== (getWPToken() || ""))
        throw new Error("登录状态已变化，请重新打开注释后再删除。");
      if (result.deleted?.id !== note.id)
        throw new Error(result.error || "未确认笔记已删除。");

      inspectorNotesCache.removeNote(session, note.id);
      oneCache.forEach((cached, cacheKey) => {
        const prefix = `${session}|`;
        if (!cacheKey.startsWith(prefix)) return;
        if (cached.note?.id !== note.id && !cached.positionNotes?.some((item) => item.id === note.id)) return;
        oneCache.set(cacheKey, {
          ...cached,
          note: cached.note?.id === note.id ? null : cached.note,
          ...(cached.positionNotes
            ? { positionNotes: cached.positionNotes.filter((item) => item.id !== note.id) }
            : {}),
        });
      });
      if (activeKey.current !== key) return;
      const nextPositionNotes = positionNotes.filter((item) => item.id !== note.id);
      setPositionNotes(nextPositionNotes);
      const currentCachedNote = oneCache.get(`${session}|${key}`)?.note;
      oneCache.set(`${session}|${key}`, {
        note:
          currentCachedNote?.id === note.id
            ? nextPositionNotes[0] || null
            : currentCachedNote || null,
        positionNotes: nextPositionNotes,
      });

      setDrafts((current) => {
        const next = { ...current };
        delete next[note.id];
        return next;
      });
      if (selected === note.id) {
        const nextSelected = nextPositionNotes
          .filter((item) => item.noteType === activeType)
          .sort((a, b) => (a.tabOrder ?? Number.MAX_SAFE_INTEGER) - (b.tabOrder ?? Number.MAX_SAFE_INTEGER) || Number(a.id) - Number(b.id))[0];
        if (nextSelected) setFieldsFromPositionNote(nextSelected);
        else {
          setSelected(undefined);
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
      }
      setDeleteTarget(null);
      setState((current) => ({
        ...current,
        saveStatus: undefined,
        successMessage: `「${note.title || `注释 #${note.id}`}」已删除。`,
      }));
    } catch (error) {
      if (activeKey.current === key)
        setDeleteError(error instanceof Error ? error.message : String(error));
    } finally {
      if (activeKey.current === key)
        setState((current) => ({ ...current, saving: false, activity: undefined }));
    }
  };

  const createLinkedNote = async () => {
    stashActiveDraft();
    const tabOrder = Math.max(0, ...activePositionNotes.map((note) => note.tabOrder || 0)) + 1;
    setState((current) => ({ ...current, saving: true, activity: "正在创建并关联注释…", successMessage: undefined, saveError: undefined }));
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
      const nextPositionNotes = [...positionNotes.filter((note) => note.id !== created.id), created];
      setPositionNotes(nextPositionNotes);
      oneCache.set(`${getWPToken() || ""}|${noteKey}`, { note: created, positionNotes: nextPositionNotes });
      setDrafts((current) => {
        const next = { ...current };
        delete next[created.id];
        return next;
      });
      setFieldsFromPositionNote(created, false);
      setState((current) => ({ ...current, activity: undefined, saveStatus: "saved", successMessage: `已创建并关联「${created.title}」（CCT324 #${created.id}）。` }));
    } catch (error) {
      setState((current) => ({ ...current, activity: undefined, saveError: error instanceof Error ? error.message : String(error) }));
    } finally {
      setState((current) => ({ ...current, saving: false, activity: undefined }));
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
      successMessage: undefined,
    }));
  const doSave = async () => {
    if (stale || !ready || !selected) return;
    const session = getWPToken() || "";
    const key = noteKey;
    setState((s) => ({ ...s, saving: true, activity: "正在保存并核对注释…", successMessage: undefined, error: undefined, saveError: undefined, saveStatus: undefined }));
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
        const positionNotes = cached.positionNotes?.map((note) => note.id === updated.id ? { ...note, ...updated } : note);
        if (cached.note?.id === updated.id || positionNotes?.some((note) => note.id === updated.id))
          oneCache.set(cacheKey, { ...cached, note: cached.note?.id === updated.id ? { ...cached.note, ...updated } : cached.note, ...(positionNotes ? { positionNotes } : {}) });
      });
      const nextPositionNotes = positionNotes.map((note) => note.id === updated.id ? updated : note);
      setPositionNotes(nextPositionNotes);
      oneCache.set(`${session}|${key}`, { note: updated, positionNotes: nextPositionNotes });
      setDrafts((current) => {
        const next = { ...current };
        delete next[updated.id];
        return next;
      });
      setFieldsFromPositionNote(updated, false);
      setState({ at: updated.updatedAt, saveStatus: "saved", successMessage: `「${updated.title}」已保存并读回确认。` });
    } catch (e) {
      if (activeKey.current === key)
        setState((s) => ({
          ...s,
          activity: undefined,
          saveError: e instanceof Error ? e.message : String(e),
          saveStatus: undefined,
        }));
    } finally {
      if (activeKey.current === key)
        setState((s) => ({ ...s, saving: false, activity: undefined }));
    }
  };
  const linkPickedNote = async (note: NotePick) => {
    if (!ready || state.saving) return;
    stashActiveDraft();
    const key = noteKey;
    const session = getWPToken() || "";
    setState((s) => ({ ...s, saving: true, activity: `正在关联「${note.title}」…`, successMessage: undefined, error: undefined, saveError: undefined }));
    try {
      const tabOrder = Math.max(0, ...activePositionNotes.map((note) => note.tabOrder || 0)) + 1;
      const result = await select({
        data: {
          key,
          id: note.id,
          scope,
          page,
          label,
          noteType: activeType,
          tabOrder,
          ...(alias ? { alias } : {}),
          ...(await stableAnchor()),
        },
      });
      if (activeKey.current !== key) return;
      if (session !== (getWPToken() || "")) throw new Error("登录状态已变化，请重新打开注释后再关联。");
      if (!result.note) throw new Error(result.error || "选择未保存");
      inspectorNotesCache.put(session, result.note);
      const linked = result.note as CCTNote;
      const nextPositionNotes = [...positionNotes.filter((item) => item.id !== linked.id), linked];
      setPositionNotes(nextPositionNotes);
      oneCache.set(`${session}|${key}`, { note: linked, positionNotes: nextPositionNotes });
      setFieldsFromPositionNote(linked, false);
      setState({ at: result.note.updatedAt, successMessage: `已关联「${result.note.title}」（CCT324 #${result.note.id}），列表已更新。` });
    } catch (e) {
      if (activeKey.current === key) setState((current) => ({ ...current, activity: undefined, error: e instanceof Error ? e.message : String(e) }));
    } finally {
      if (activeKey.current === key) setState((current) => ({ ...current, saving: false, activity: undefined }));
    }
  };
  const createVersionCopy = async () => {
    if (!selected || !copyVersion.trim()) return;
    setVersionCopy({ version: copyVersion, saving: true });
    setState((current) => ({ ...current, saving: true, activity: `正在创建 v${copyVersion.trim()}…`, successMessage: undefined, error: undefined }));
    try {
      const result = await duplicate({
        data: { id: selected, version: copyVersion.trim() },
      });
      if (!result.note) throw new Error(result.error || "新版本创建失败。");
      setVersionCopy({ version: copyVersion.trim(), note: result.note });
      setCopyVersion("");
      setState((current) => ({ ...current, activity: undefined, successMessage: `新版本 v${result.note!.version} 已创建。` }));
    } catch (error) {
      setVersionCopy({
        version: copyVersion,
        error: error instanceof Error ? error.message : String(error),
      });
      setState((current) => ({ ...current, activity: undefined, error: error instanceof Error ? error.message : String(error) }));
    } finally {
      setState((current) => ({ ...current, saving: false, activity: undefined }));
    }
  };
  const switchToVersionCopy = async (note: CCTNote) => {
    stashActiveDraft();
    const session = getWPToken() || "";
    const key = noteKey;
    setState((s) => ({ ...s, saving: true, activity: `正在切换到 v${note.version || "新版本"}…`, successMessage: undefined, error: undefined, saveError: undefined }));
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
      setSelected(result.note.id);
      const selectedNote = result.note as CCTNote;
      const nextPositionNotes = [...positionNotes.filter((item) => item.id !== selectedNote.id), selectedNote];
      setPositionNotes(nextPositionNotes);
      oneCache.set(`${session}|${key}`, { note: selectedNote, positionNotes: nextPositionNotes });
      setFieldsFromPositionNote(selectedNote, false);
      setVersionCopy(null);
      setState({ at: result.note.updatedAt, saveStatus: "saved", successMessage: `已切换到「${result.note.title}」。` });
    } catch (error) {
      setVersionCopy((copy) => ({
        ...(copy || { version: note.version || "" }),
        error: error instanceof Error ? error.message : String(error),
      }));
    } finally {
      if (activeKey.current === key)
        setState((s) => ({ ...s, saving: false, activity: undefined }));
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
      {state.activity && <p role="status" aria-live="polite">{state.activity}</p>}
      {state.successMessage && !state.saving && <p role="status" className="text-emerald-700">{state.successMessage}</p>}
      {state.saveError && <p role="alert" className="text-destructive">修改失败：{state.saveError}</p>}
      {state.unlinkError && <p role="alert" className="text-destructive">解除关联失败：{state.unlinkError}</p>}
      {scope === "site" && (
        <p className="text-muted-foreground">
          此处的注释关联到 {label}；同一注释可同时保留多个页面、元素和全站关联。
        </p>
      )}
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
          {noteScopeLabel}说明注释
        </Button>
        <Button
          type="button"
          size="sm"
          variant={activeType === "b56" ? "default" : "ghost"}
          role="tab"
          aria-selected={activeType === "b56"}
          onClick={() => changeNoteType("b56")}
        >
          {noteScopeLabel}关联注释
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
              新增关联已有注释
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
                setOpen(false);
                void linkPickedNote(n);
              }}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          size="sm"
          disabled={state.loading || state.saving || !!state.error}
          onClick={() => void createLinkedNote()}
        >
          <Plus className="mr-1 h-3 w-3" />
          新建新关联注释
        </Button>
      </div>
      <div className="space-y-1" data-rw-inspector>
        <p className="text-muted-foreground">
          {activeType === "b55" ? `${noteScopeLabel}说明注释` : `${noteScopeLabel}关联注释`} · {activePositionNotes.length} 条
        </p>
        {activePositionNotes.length > 0 && (
          <div className="flex flex-wrap gap-1 rounded-md border bg-muted/20 p-1" role="group" aria-label={activeType === "b55" ? `${noteScopeLabel}说明注释列表` : `${noteScopeLabel}关联注释列表`}>
            {activePositionNotes.map((note, index) => (
              <div
                key={note.id}
                draggable
                onDragStart={() => { dragIndex.current = index; }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragIndex.current !== null) void persistTabOrder(dragIndex.current, index);
                  dragIndex.current = null;
                }}
                onDragEnd={() => { dragIndex.current = null; }}
                className="flex shrink-0 items-center gap-1 rounded-md border bg-background p-0.5"
              >
                <Button
                  type="button"
                  size="sm"
                  variant={selected === note.id ? "default" : "ghost"}
                  aria-pressed={selected === note.id}
                  onClick={() => activateNote(note)}
                  className="cursor-grab"
                  disabled={state.saving}
                >
                  {index + 1}. {note.title || `注释 #${note.id}`}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={`解除关联：${note.title || `注释 #${note.id}`}`}
                  disabled={state.saving || !ready}
                  onClick={() => void unlinkPositionNote(note)}
                >
                  解除关联
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={`删除笔记：${note.title || `注释 #${note.id}`}`}
                  title="永久删除笔记及所有关联"
                  disabled={state.saving || !ready}
                  onClick={() => {
                    setDeleteError("");
                    setDeleteTarget(note);
                  }}
                >
                  <Trash2 className="mr-1 h-3 w-3" />删除
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !state.saving) {
            setDeleteTarget(null);
            setDeleteError("");
          }
        }}
      >
        <AlertDialogContent data-rw-inspector>
          <AlertDialogHeader>
            <AlertDialogTitle>永久删除这条笔记？</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `将删除「${deleteTarget.title || `注释 #${deleteTarget.id}`}」及它在所有页面、元素和全站的位置关联，也会移除它与其他笔记之间的关联。此操作无法恢复。`
                : "此操作无法恢复。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p role="alert" className="text-sm text-destructive">删除失败：{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={state.saving}>取消</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={state.saving || !deleteTarget}
              onClick={() => void deleteNote()}
            >
              {state.saving ? "删除中…" : "永久删除"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {selected && (
      <section role="tabpanel" aria-label={activeType === "b55" ? `${noteScopeLabel}说明注释内容` : `${noteScopeLabel}关联注释内容`} className="space-y-2">
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
          <SelectContent data-rw-inspector className="z-[10001]">
            <SelectItem value="b55">{noteScopeLabel}说明注释（B55）</SelectItem>
            <SelectItem value="b56">{noteScopeLabel}关联注释（B56）</SelectItem>
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
      {state.saveStatus === "saved" && !state.saving && !state.successMessage && (
        <p role="status" className="text-emerald-700">修改成功，已读回确认。</p>
      )}
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
