/** REL325 related manual notes for the current CCT324 note: collapsed list, link/unlink/create, and an AI conflict check. */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Link2, Plus, Sparkles, Unlink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NoteSearchList } from "./NoteSearchList";
import { duplicateInspectorNoteVersion, linkRelatedNote, listRelatedNotes, unlinkRelatedNote, updateRelatedNote } from "@/lib/inspector-notes.functions";
import { explainReadWrite } from "@/lib/inspector-ai.functions";
import type { ConflictReport } from '@/features/inspector/conflict-report';
import type { CCTNote } from '@/features/inspector/cct-notes';
import { ConflictReportView } from './ConflictReportView';

type Related = { id: string; title: string; version: string; text: string; side: "parent" | "child"; todo: boolean; aiLocked?: boolean | undefined; verified: boolean; relationVerified: boolean; relationDetails: string };
type Edit = { title: string; version: string; text: string; todo: boolean; aiLocked?: boolean | undefined; verified: boolean; relationVerified: boolean; relationDetails: string };

export function RelatedNotes({ noteId }: { noteId: string }) {
  const list = listRelatedNotes; const link = linkRelatedNote;
  const unlink = unlinkRelatedNote; const update = updateRelatedNote;
  const duplicate = duplicateInspectorNoteVersion;
  const [edits, setEdits] = useState<Record<string, Edit>>({}); const compare = explainReadWrite;
  const [notes, setNotes] = useState<Related[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<{ loading?: boolean; busy?: boolean; activity?: string | undefined; error?: string | undefined; success?: string | undefined }>({ loading: true });
  const [pick, setPick] = useState(false);
  const [draft, setDraft] = useState<{ title: string; version: string; text: string; todo: boolean; relationVerified: boolean; relationDetails: string } | null>(null);
  const [ai, setAi] = useState<{ loading?: boolean; report?: ConflictReport; error?: string }>({});
  const [copyVersion, setCopyVersion] = useState<Record<string, string>>({});
  const [copyState, setCopyState] = useState<{ sourceId: string; version: string; note?: CCTNote; error?: string; saving?: boolean } | null>(null);
  const active = useRef(noteId); active.current = noteId;
  const [correctionRevision, setCorrectionRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setCorrectionRevision(value => value + 1);
    window.addEventListener('inspector-note-corrected', refresh);
    return () => window.removeEventListener('inspector-note-corrected', refresh);
  }, []);

  useEffect(() => {
    let live = true; setState({ loading: true }); setNotes([]); setOpen({}); setEdits({}); setAi({}); setDraft(null);
    list({ data: { id: noteId } }).then((r) => { if (!live) return; setNotes(r.notes); setState({ error: r.error }); })
      .catch((e) => live && setState({ error: String(e) }));
    return () => { live = false; };
  }, [noteId, correctionRevision]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (fn: () => Promise<{ notes?: Related[]; error?: string }>, success = "操作成功", activity = "正在保存修改…"): Promise<boolean> => {
    const id = noteId; setState({ busy: true, activity });
    try {
      const r = await fn(); if (active.current !== id) return false;
      if (r.notes) { setNotes(r.notes); setState({ success }); setAi({}); return true; }
      setState({ error: r.error || "失败" }); return false;
    } catch (e) { if (active.current === id) setState({ error: String(e) }); return false; }
    finally { if (active.current === id) setState((current) => ({ ...current, busy: false, activity: undefined })); }
  };
  const createVersion = async (note: Related) => {
    const version = (copyVersion[note.id] || "").trim();
    if (!version) return;
    setCopyState({ sourceId: note.id, version, saving: true });
    setState({ busy: true, activity: `正在创建 v${version} 并更新关联列表…` });
    try {
      const result = await duplicate({ data: { id: note.id, version } });
      if (!result.note) throw new Error(result.error || "新版本创建失败。");
      const refreshed = await list({ data: { id: noteId } });
      if (refreshed.error) throw new Error(refreshed.error);
      if (active.current !== noteId) return;
      setNotes(refreshed.notes || []);
      setCopyState({ sourceId: note.id, version, note: result.note });
      setCopyVersion((current) => ({ ...current, [note.id]: "" }));
      setState({ success: "新版本已创建，所有原有直接关联已复制。" });
    } catch (error) {
      setCopyState({ sourceId: note.id, version, error: error instanceof Error ? error.message : String(error) });
      setState({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (active.current === noteId) setState((current) => ({ ...current, busy: false, activity: undefined }));
    }
  };
  const linked = new Set([noteId, ...notes.map((n) => n.id)]);
  const busy = state.loading || state.busy;

  return (
    <div className="space-y-2 rounded-md border p-2" data-rw-inspector>
      <p className="font-medium">
        关联注释 ·{" "}
        {state.loading ? "读取中…" : `${notes.length} 条`}
      </p>
      {notes.map((n) => (
        <div key={`${n.side}-${n.id}`} className="rounded border">
          <div className="flex items-start gap-1 p-1">
            <Button
              type="button"
              variant="ghost"
              aria-expanded={!!open[n.id]}
              className="h-auto min-w-0 flex-1 justify-start whitespace-normal rounded-none p-2 text-left"
              onClick={() => setOpen((o) => ({ ...o, [n.id]: !o[n.id] }))}
            >
              {open[n.id] ? (
                <ChevronDown className="mt-0.5 h-3 w-3 shrink-0" />
              ) : (
                <ChevronRight className="mt-0.5 h-3 w-3 shrink-0" />
              )}
              <span>
                <span className="text-muted-foreground">#{n.id} · </span>
                {n.title}
                <span className="font-medium text-primary"> · {n.version ? `v${n.version}` : "未设置版本"}</span>
                {n.todo && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900">待完成</span>}
                <span className="text-muted-foreground">
                  {" "}
                  · {n.verified ? "已手动核对" : "未手动核对"} · 关联
                  {n.relationVerified ? "已核对" : "未核对"}
                </span>
              </span>
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => { setCopyState(null); setCopyVersion((current) => ({ ...current, [n.id]: current[n.id] || "" })); setCopyState({ sourceId: n.id, version: "" }); }}>
              <Copy className="mr-1 h-3 w-3" />复制版本
            </Button>
          </div>
          {copyState?.sourceId === n.id && !copyState.note && (
            <div className="flex flex-wrap items-end gap-2 border-t p-2">
              <label className="space-y-1 text-sm">
                <span>新版本号</span>
                <Input aria-label={`关联注释 ${n.id} 新版本号`} value={copyVersion[n.id] || ""} maxLength={80} placeholder="例如 2.0" onChange={(event) => setCopyVersion((current) => ({ ...current, [n.id]: event.target.value }))} />
              </label>
              <Button size="sm" disabled={copyState.saving || !(copyVersion[n.id] || "").trim()} onClick={() => void createVersion(n)}>
                {copyState.saving ? "创建中…" : "创建新版本"}
              </Button>
              <Button size="sm" variant="ghost" disabled={copyState.saving} onClick={() => setCopyState(null)}>取消</Button>
              {copyState.error && <p role="alert" className="w-full text-destructive">新版本创建失败：{copyState.error}</p>}
            </div>
          )}
          {copyState?.sourceId === n.id && copyState.note && (
            <div className="space-y-2 border-t p-2" role="status">
              <p>新版本 v{copyState.note.version} 已创建，内容和原有直接关联已复制。是否打开新版本继续编辑？</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { setOpen((current) => ({ ...current, [copyState.note!.id]: true })); setCopyState(null); setState({ success: "已打开新版本，可继续编辑。" }); }}>是，打开新版本</Button>
                <Button size="sm" variant="outline" onClick={() => setCopyState(null)}>否，留在当前笔记</Button>
              </div>
            </div>
          )}
          {open[n.id] && (
            <div className="space-y-2 border-t p-2">
              {(() => {
                const e = edits[n.id] || {
                  title: n.title,
                  version: n.version || "",
                  text: n.text,
                  todo: n.todo,
                  aiLocked: !!n.aiLocked,
                  verified: n.verified,
                  relationVerified: n.relationVerified,
                  relationDetails: n.relationDetails,
                };
                const set = (v: Partial<Edit>) =>
                  { setState((current) => ({ ...current, success: undefined, error: undefined })); setEdits((m) => ({ ...m, [n.id]: { ...e, ...v } })); };
                const dirty =
                  e.title !== n.title ||
                  e.version !== (n.version || "") ||
                  e.text !== n.text ||
                  e.todo !== n.todo ||
                  !!e.aiLocked !== !!n.aiLocked ||
                  e.verified !== n.verified ||
                  e.relationVerified !== n.relationVerified ||
                  e.relationDetails !== n.relationDetails;
                return (
                  <>
                    <label className="flex items-center gap-2">
                      <Switch aria-label={`关联注释 ${n.id} 严禁 AI 编辑`} checked={!!e.aiLocked}
                        disabled={busy} onCheckedChange={(aiLocked) => set({ aiLocked })} />
                      <span>严禁 AI 编辑</span>
                    </label>
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(8rem,1fr)]">
                      <label className="block space-y-1 text-sm"><span>标题</span>
                        <Input aria-label="关联注释名字" value={e.title} maxLength={240} disabled={busy} onChange={(ev) => set({ title: ev.target.value })} />
                      </label>
                      <label className="block space-y-1 text-sm"><span>版本</span>
                        <Input aria-label="关联注释版本" value={e.version} maxLength={80} placeholder="例如 1.0" disabled={busy} onChange={(ev) => set({ version: ev.target.value })} />
                      </label>
                    </div>
                    <Textarea
                      aria-label="关联注释内容"
                      rows={8}
                      value={e.text}
                      disabled={busy}
                      onChange={(ev) => set({ text: ev.target.value })}
                    />
                    <label className="flex items-center gap-2">
                      <Switch
                        checked={e.todo}
                        disabled={busy}
                        onCheckedChange={(todo) => set({ todo })}
                        aria-label={`关联注释 ${n.id} 待完成`}
                      />
                      <span>待完成</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Switch
                        checked={e.verified}
                        disabled={busy}
                        onCheckedChange={(v) => set({ verified: v })}
                        aria-label="关联注释已手动核对"
                      />
                      <span>{e.verified ? "已手动核对" : "未手动核对"}</span>
                    </label>
                    <fieldset className="space-y-2 rounded-md border bg-muted/20 p-3">
                      <legend className="px-1 text-sm font-medium">
                        笔记关联核对
                      </legend>
                      <label className="flex items-center gap-2">
                        <Switch
                          checked={e.relationVerified}
                          disabled={busy}
                          onCheckedChange={(v) => set({ relationVerified: v })}
                          aria-label="关联注释已手动核对笔记关联"
                        />
                        <span>
                          {e.relationVerified
                            ? "已手动核对笔记关联"
                            : "未手动核对笔记关联"}
                        </span>
                      </label>
                      <label className="block space-y-1 text-sm">
                        <span>关联核对详情</span>
                        <Textarea
                          aria-label="关联注释已手动核对笔记关联详情"
                          rows={4}
                          maxLength={100_000}
                          value={e.relationDetails}
                          disabled={busy}
                          onChange={(ev) =>
                            set({ relationDetails: ev.target.value })
                          }
                          placeholder="记录关联关系的说明或核对依据…"
                        />
                      </label>
                    </fieldset>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        disabled={busy || !dirty || !e.title.trim()}
                        onClick={async () => {
                          if (
                            await run(
                              () => update({
                                data: {
                                  id: noteId,
                                  otherId: n.id,
                                  title: e.title.trim(),
                                  version: e.version,
                                  text: e.text,
                                  todo: e.todo,
                                  aiLocked: !!e.aiLocked,
                                  verified: e.verified,
                                  relationVerified: e.relationVerified,
                                  relationDetails: e.relationDetails,
                                },
                              }),
                              "修改成功",
                              "正在保存关联注释…",
                            )
                          )
                            setEdits((m) => {
                              const c = { ...m };
                              delete c[n.id];
                              return c;
                            });
                        }}
                      >
                        {state.busy ? "修改中…" : "保存"}
                      </Button>
                      {dirty && !state.busy && (
                        <span role="status" className="text-muted-foreground">
                          有未保存的修改
                        </span>
                      )}
                    </div>
                  </>
                );
              })()}
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  run(() =>
                    unlink({
                      data:
                        n.side === "parent"
                          ? { id: noteId, parent: n.id, child: noteId }
                          : { id: noteId, parent: noteId, child: n.id },
                    }),
                    "关联已取消",
                    "正在取消关联…",
                  )
                }
              >
                <Unlink className="mr-1 h-3 w-3" />
                取消关联
              </Button>
            </div>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Popover open={pick} onOpenChange={setPick}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" disabled={busy}>
              <Link2 className="mr-1 h-3 w-3" />
              关联已有注释
            </Button>
          </PopoverTrigger>
          <PopoverContent
            data-rw-inspector
            className="z-[10001] w-80 p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <NoteSearchList
              onClose={() => setPick(false)}
              exclude={new Set([...linked, noteId])}
              onPick={(c) => {
                setPick(false);
                void run(() => link({ data: { id: noteId, otherId: c.id } }), "关联成功，列表已更新。", `正在关联「${c.title}」…`);
              }}
            />
          </PopoverContent>
        </Popover>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() =>
            setDraft({
              title: "",
              version: "",
              text: "",
              todo: false,
              relationVerified: false,
              relationDetails: "",
            })
          }
        >
          <Plus className="mr-1 h-3 w-3" />
          新建关联注释
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy || !notes.length || ai.loading}
          onClick={async () => {
            const id = noteId;
            setAi({ loading: true });
            try {
              const r = await compare({
                data: {
                  noteId: id,
                  context: JSON.stringify({
                    page: window.location.pathname + window.location.search,
                  }),
                },
              });
              if (active.current === id)
                setAi(
                  r.report
                    ? { report: r.report }
                    : { error: r.error || "失败" },
                );
            } catch (e) {
              if (active.current === id) setAi({ error: String(e) });
            }
          }}
        >
          <Sparkles className="mr-1 h-3 w-3" />
          {ai.loading ? "AI 比较中…" : "AI 三方核对实际代码与注释"}
        </Button>
      </div>
      {state.busy && <p role="status" aria-live="polite">{state.activity || "正在处理…"}</p>}
      {state.success && !state.busy && <p role="status" className="text-emerald-700">{state.success}</p>}
      {draft && (
        <div className="space-y-2 rounded border p-2">
          <Input
            aria-label="关联注释名字"
            placeholder="名字"
            value={draft.title}
            maxLength={240}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <label className="block space-y-1 text-sm"><span>版本</span>
            <Input aria-label="新关联注释版本" value={draft.version} maxLength={80} placeholder="例如 1.0" onChange={(e) => setDraft({ ...draft, version: e.target.value })} />
          </label>
          <Textarea
            rows={6}
            placeholder="内容"
            value={draft.text}
            onChange={(e) => setDraft({ ...draft, text: e.target.value })}
          />
          <label className="flex items-center gap-2">
            <Switch
              checked={draft.todo}
              disabled={busy}
              onCheckedChange={(todo) => setDraft({ ...draft, todo })}
              aria-label="新关联注释待完成"
            />
            <span>待完成</span>
          </label>
          <fieldset className="space-y-2 rounded-md border bg-muted/20 p-3">
            <legend className="px-1 text-sm font-medium">笔记关联核对</legend>
            <label className="flex items-center gap-2">
              <Switch
                checked={draft.relationVerified}
                onCheckedChange={(relationVerified) =>
                  setDraft({ ...draft, relationVerified })
                }
                aria-label="新关联注释已手动核对笔记关联"
              />
              <span>
                {draft.relationVerified
                  ? "已手动核对笔记关联"
                  : "未手动核对笔记关联"}
              </span>
            </label>
            <label className="block space-y-1 text-sm">
              <span>关联核对详情</span>
              <Textarea
                aria-label="新关联注释已手动核对笔记关联详情"
                rows={4}
                maxLength={100_000}
                placeholder="记录关联关系的说明或核对依据…"
                value={draft.relationDetails}
                onChange={(e) =>
                  setDraft({ ...draft, relationDetails: e.target.value })
                }
              />
            </label>
          </fieldset>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={busy || !draft.title.trim()}
              onClick={async () => {
                const d = draft;
                if (
                  await run(() =>
                    link({
                      data: {
                        id: noteId,
                        create: {
                          title: d.title.trim(),
                          version: d.version,
                          text: d.text,
                          todo: d.todo,
                          relationVerified: d.relationVerified,
                          relationDetails: d.relationDetails,
                        },
                      },
                    }),
                    "新注释已创建并关联，列表已更新。",
                    "正在创建并关联新注释…",
                  )
                )
                  setDraft(null);
              }}
            >
              保存并关联
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>
              取消
            </Button>
          </div>
        </div>
      )}
      {state.error && <p role="alert" className="text-destructive">修改失败：{state.error}</p>}
      {ai.error && <p className="text-destructive">{ai.error}</p>}
      {ai.report && <ConflictReportView report={ai.report} />}
    </div>
  );
}
