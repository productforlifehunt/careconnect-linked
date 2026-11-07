var e=`/** Researcher manual notes for the selected element or the whole page, saved privately so they survive refresh/close. */
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  loadInspectorNotes,
  saveInspectorNote,
  selectInspectorNote,
} from "@/lib/inspector-notes.functions";
import { inspectorNotesCache } from "@/features/inspector/notes-cache";
import { getWPToken } from "@/services/wp-auth";
import { useRef } from "react";
import { findSameElementNote } from "@/features/inspector/route-key";
import { type CCTNote } from "@/features/inspector/cct-notes";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NoteSearchList, type NotePick } from "./NoteSearchList";
import { ChevronsUpDown, Plus, Lock } from "lucide-react";
import { RelatedNotes } from "./RelatedNotes";
import { explainReadWrite } from "@/lib/inspector-ai.functions";
import { ConflictReportView } from "./ConflictReportView";
import type { ConflictReport } from "@/features/inspector/conflict-report";
import { Sparkles } from "lucide-react";

/** Per-element read cache for this browser session; cleared on save/lock/retry so it never shows stale bindings. */
const oneCache = new Map<string, CCTNote | null>();

export function ManualNotes({
  noteKey,
  priorKey,
  legacyKey,
  legacySourceKey,
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
  priorKey?: string;
  legacyKey?: string | undefined;
  legacySourceKey?: string | undefined;
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
  const loadOne = useServerFn(loadInspectorNotes);
  const save = useServerFn(saveInspectorNote);
  const select = useServerFn(selectInspectorNote);
  const analyze = useServerFn(explainReadWrite);
  const [ai, setAi] = useState<{
    loading?: boolean;
    report?: ConflictReport;
    error?: string;
  }>({});
  const [picked, setPicked] = useState<NotePick>();
  const [selected, setSelected] = useState<string>();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [savedTitle, setSavedTitle] = useState("");
  const [choice, setChoice] = useState<string>();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState("");
  const [state, setState] = useState<{
    loading?: boolean;
    saving?: boolean;
    error?: string | undefined;
    at?: string | undefined;
  }>({ loading: true });
  const [retry, setRetry] = useState(0);
  const [verified, setVerified] = useState(false);
  const [savedVerified, setSavedVerified] = useState(false);
  const [stale, setStale] = useState(false);
  // The element whose saved note is currently shown; save/lock are refused for any other element.
  const [loadedFor, setLoadedFor] = useState<string>();
  const ready = loadedFor === noteKey;
  const activeKey = useRef(noteKey);
  activeKey.current = noteKey;
  const revision = \`\${noteKey}|\${selected}|\${title}|\${text}\`;
  const activeRevision = useRef(revision);
  activeRevision.current = revision;
  const correctionState = useRef({ selected, title, text, savedTitle, saved });
  correctionState.current = { selected, title, text, savedTitle, saved };
  useEffect(() => {
    const updated = (event: Event) => {
      const note = (
        event as CustomEvent<{
          id: string;
          title: string;
          text: string;
          verified: boolean;
        }>
      ).detail;
      const current = correctionState.current;
      if (note.id !== current.selected) return;
      if (
        current.text !== current.saved ||
        current.title !== current.savedTitle
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
    if (!buildEvidence || !selected) return;
    const current = revision;
    setAi({ loading: true });
    try {
      const context = buildEvidence();
      const result = await analyze({
        data: { context, scope, noteId: selected, draft: { title, text } },
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
    setChoice(undefined);
    setCreating(false);
    setText("");
    setSaved("");
    setTitle(label.slice(0, 240));
    setSavedTitle("");
    setVerified(false);
    setSavedVerified(false);
    const apply = async (
      map: Awaited<ReturnType<typeof inspectorNotesCache.load>>,
    ) => {
      if (!live || session !== (getWPToken() || "")) return;
      // Only the visible-element identity (page + component names + markup position), identical in preview
      // and published builds. No source line, no alias, no carry-over: different elements never share a note.
      const n = findSameElementNote(map, noteKey);
      if (!live || session !== (getWPToken() || "")) return;
      setText(n?.text || "");
      setSaved(n?.text || "");
      onChange?.(n?.text || "");
      setState({ at: n?.updatedAt });
      setSelected(n?.id);
      setChoice(n?.id);
      setTitle(n?.title || label.slice(0, 240));
      setSavedTitle(n?.title || label.slice(0, 240));
      setVerified(!!(n as CCTNote | undefined)?.verified);
      setSavedVerified(!!(n as CCTNote | undefined)?.verified);
      setCreating(false);
      setStale(false);
      setLoadedFor(noteKey);
    };
    // Old scoped positions are equivalent across pages. Source-based recovery requires an exact,
    // unique build fingerprint and never downloads the full catalogue.
    const hit = oneCache.get(\`\${session}|\${noteKey}\`);
    if (hit !== undefined)
      void apply(
        new Map(hit ? [[noteKey, hit]] : []) as Parameters<typeof apply>[0],
      );
    else {
      setState({ loading: true });
      setText("");
      setSaved("");
      onChange?.("");
      const keys = [noteKey];
      loadOne({
        data: {
          keys,
          priorKey,
          page,
          ...(fingerprint && tag ? { fingerprint, tag, page } : {}),
          ...(legacySourceKey
            ? { legacy: { key: legacySourceKey, label } }
            : {}),
        },
      })
        .then((r) => {
          if ("error" in r && r.error) throw new Error(r.error);
          const n = (r.notes as CCTNote[])[0] || null;
          if (n) oneCache.set(\`\${session}|\${noteKey}\`, n);
          return apply(
            new Map(n ? [[noteKey, n]] : []) as Parameters<typeof apply>[0],
          );
        })
        .catch((e) => live && setState({ error: String(e) }));
    }
    return () => {
      live = false;
    };
  }, [noteKey, priorKey, legacyKey, legacySourceKey, fingerprint, tag, retry]); // eslint-disable-line react-hooks/exhaustive-deps
  const stableAnchor = async () => {
    const match = fingerprint?.match(/^([^:]+):(\\d+):\\d+:([0-9a-f]{64}):1$/);
    if (!match || !tag) return {};
    const line = Number(match[2]);
    return {
      source: { file: match[1]!, line, endLine: line, tag, digest: match[3]! },
    };
  };
  const doSave = async () => {
    if (stale || !ready) return;
    const session = getWPToken() || "";
    const key = noteKey;
    setState((s) => ({ ...s, saving: true, error: undefined }));
    const anchor = await stableAnchor();
    const r = await save({
      data: {
        key: noteKey,
        scope,
        page,
        label,
        title,
        id: selected,
        create: creating,
        verified,
        text,
        ...anchor,
      },
    }).catch(
      (e) => ({ error: String(e) }) as { error: string; note?: undefined },
    );
    if (session !== (getWPToken() || "")) return;
    if ("note" in r && r.note) {
      inspectorNotesCache.put(session, r.note);
      oneCache.delete(\`\${session}|\${key}\`);
      if (activeKey.current !== key) return;
      setSaved(r.note.text);
      onChange?.(r.note.text);
      setState({ at: r.note.updatedAt });
      setSelected(r.note.id);
      setChoice(r.note.id);
      setTitle(r.note.title || title);
      setSavedTitle(r.note.title || title);
      setVerified(!!r.note.verified);
      setSavedVerified(!!r.note.verified);
      setCreating(false);
    } else if (activeKey.current === key)
      setState({ error: r.error || "保存失败" });
  };
  const lockChoice = async () => {
    if (!choice || !ready) return;
    const key = noteKey;
    const session = getWPToken() || "";
    setState((s) => ({ ...s, saving: true, error: undefined }));
    try {
      const result = await select({
        data: {
          key,
          id: choice,
          scope,
          page,
          label,
          ...(await stableAnchor()),
        },
      });
      if (session !== (getWPToken() || "") || activeKey.current !== key) return;
      if (!result.note) throw new Error(result.error || "选择未保存");
      inspectorNotesCache.put(session, result.note);
      oneCache.delete(\`\${session}|\${key}\`);
      setSelected(result.note.id);
      setText(result.note.text);
      setSaved(result.note.text);
      setTitle(result.note.title || "");
      setSavedTitle(result.note.title || "");
      setVerified(!!result.note.verified);
      setSavedVerified(!!result.note.verified);
      onChange?.(result.note.text);
      setState({ at: result.note.updatedAt });
    } catch (e) {
      if (activeKey.current === key) setState({ error: String(e) });
    }
  };
  return (
    <div className="space-y-2 text-xs">
      <p className="text-muted-foreground">
        {state.loading
          ? "正在读取已保存的注释…"
          : selected
            ? \`当前注释：\${savedTitle} · CCT324 #\${selected}\`
            : "当前没有已保存的注释"}
      </p>
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
          disabled={state.loading || state.saving}
          onClick={() => {
            setCreating(true);
            setSelected(undefined);
            setChoice(undefined);
            setTitle(label.slice(0, 240));
            setSavedTitle("");
            setVerified(false);
            setSavedVerified(false);
            setText("");
            setSaved("");
            onChange?.("");
            setState({});
          }}
        >
          <Plus className="mr-1 h-3 w-3" />
          新建
        </Button>
      </div>
      {choice && choice !== selected && (
        <p>
          待锁定：{picked?.id === choice ? picked.title : ""} · #{choice} ·{" "}
          {picked?.id === choice && picked.verified
            ? "已手动核对"
            : "未手动核对"}
        </p>
      )}
      <Input
        aria-label="注释名字"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={240}
        disabled={state.loading || state.saving}
      />
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        disabled={state.loading}
        placeholder={
          state.loading ? "读取中…" : "写下这里应该怎么读写、怎么判定…"
        }
      />
      <label className="flex items-center gap-2">
        <Switch
          checked={verified}
          onCheckedChange={setVerified}
          disabled={state.loading || state.saving}
          aria-label="已手动核对"
        />
        <span>{verified ? "已手动核对" : "未手动核对"}</span>
        {verified !== savedVerified && (
          <span className="text-muted-foreground">（未保存）</span>
        )}
      </label>
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
            (selected !== undefined &&
              text === saved &&
              title === savedTitle &&
              verified === savedVerified)
          }
        >
          {state.saving ? "保存中…" : "保存注释"}
        </Button>
        {text !== saved && (
          <span className="text-muted-foreground">有未保存的修改</span>
        )}
        {text === saved && state.at && (
          <span className="text-muted-foreground">
            已保存 {new Date(state.at).toLocaleString()}
          </span>
        )}
      </div>
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
      {selected && !creating ? (
        <RelatedNotes noteId={selected} />
      ) : (
        !state.loading && (
          <p className="rounded-md border p-2 text-muted-foreground">
            关联注释：这个元素还没有自己的注释。先写好并点"保存注释"（或用"选择其他注释"再"锁定选择"），下面就会出现"关联已有注释"（可搜索名字或编号）和"新建关联注释"。
          </p>
        )
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
`;export{e as default};