/** REL325 related manual notes for the current CCT324 note: collapsed list, link/unlink/create, and an AI conflict check. */
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, ChevronRight, Link2, Plus, Sparkles, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NoteSearchList } from "./NoteSearchList";
import { linkRelatedNote, listRelatedNotes, unlinkRelatedNote, updateRelatedNote } from "@/lib/inspector-notes.functions";
import { explainReadWrite } from "@/lib/inspector-ai.functions";
import type { CCTNote } from "@/features/inspector/cct-notes";
import type { ConflictReport } from '@/features/inspector/conflict-report';
import { ConflictReportView } from './ConflictReportView';

type Related = { id: string; title: string; text: string; side: "parent" | "child"; verified: boolean };
type Edit = { title: string; text: string; verified: boolean };

export function RelatedNotes({ noteId, catalogue }: { noteId: string; catalogue: CCTNote[] }) {
  const list = useServerFn(listRelatedNotes); const link = useServerFn(linkRelatedNote);
  const unlink = useServerFn(unlinkRelatedNote); const update = useServerFn(updateRelatedNote);
  const [edits, setEdits] = useState<Record<string, Edit>>({}); const compare = useServerFn(explainReadWrite);
  const [notes, setNotes] = useState<Related[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<{ loading?: boolean; busy?: boolean; error?: string | undefined }>({ loading: true });
  const [pick, setPick] = useState(false);
  const [draft, setDraft] = useState<{ title: string; text: string } | null>(null);
  const [ai, setAi] = useState<{ loading?: boolean; report?: ConflictReport; error?: string }>({});
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

  const run = async (fn: () => Promise<{ notes?: Related[]; error?: string }>): Promise<boolean> => {
    const id = noteId; setState({ busy: true });
    try {
      const r = await fn(); if (active.current !== id) return false;
      if (r.notes) { setNotes(r.notes); setState({}); setAi({}); return true; }
      setState({ error: r.error || "失败" }); return false;
    } catch (e) { if (active.current === id) setState({ error: String(e) }); return false; }
  };
  const linked = new Set([noteId, ...notes.map((n) => n.id)]);
  const busy = state.loading || state.busy;

  return (
    <div className="space-y-2 rounded-md border p-2" data-rw-inspector>
      <p className="font-medium">关联注释（REL325 One manual note can have many related manual notes）· {state.loading ? "读取中…" : `${notes.length} 条`}</p>
      {notes.map((n) => (
        <div key={`${n.side}-${n.id}`} className="rounded border">
          <Button type="button" variant="ghost" aria-expanded={!!open[n.id]} className="h-auto w-full justify-start whitespace-normal rounded-none p-2 text-left" onClick={() => setOpen((o) => ({ ...o, [n.id]: !o[n.id] }))}>
            {open[n.id] ? <ChevronDown className="mt-0.5 h-3 w-3 shrink-0" /> : <ChevronRight className="mt-0.5 h-3 w-3 shrink-0" />}
            <span><span className="text-muted-foreground">#{n.id} · </span>{n.title}<span className="text-muted-foreground"> · {n.verified ? "已手动核对" : "未手动核对"}</span></span>
          </Button>
          {open[n.id] && (
            <div className="space-y-2 border-t p-2">
              {(() => { const e = edits[n.id] || { title: n.title, text: n.text, verified: n.verified }; const set = (v: Partial<Edit>) => setEdits((m) => ({ ...m, [n.id]: { ...e, ...v } }));
                const dirty = e.title !== n.title || e.text !== n.text || e.verified !== n.verified;
                return (<>
                  <Input aria-label="关联注释名字" value={e.title} maxLength={240} disabled={busy} onChange={(ev) => set({ title: ev.target.value })} />
                  <Textarea aria-label="关联注释内容" rows={8} value={e.text} disabled={busy} onChange={(ev) => set({ text: ev.target.value })} />
                  <label className="flex items-center gap-2"><Switch checked={e.verified} disabled={busy} onCheckedChange={(v) => set({ verified: v })} aria-label="关联注释已手动核对" /><span>{e.verified ? "已手动核对" : "未手动核对"}</span></label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" disabled={busy || !dirty || !e.title.trim()} onClick={async () => { if (await run(() => update({ data: { id: noteId, otherId: n.id, title: e.title.trim(), text: e.text, verified: e.verified } }))) setEdits((m) => { const c = { ...m }; delete c[n.id]; return c; }); }}>保存</Button>
                    {dirty && <span className="text-muted-foreground">有未保存的修改</span>}
                  </div>
                </>); })()}
              <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => unlink({ data: n.side === "parent" ? { id: noteId, parent: n.id, child: noteId } : { id: noteId, parent: noteId, child: n.id } }))}><Unlink className="mr-1 h-3 w-3" />取消关联</Button>
            </div>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Popover open={pick} onOpenChange={setPick}>
          <PopoverTrigger asChild><Button size="sm" variant="outline" disabled={busy}><Link2 className="mr-1 h-3 w-3" />关联已有注释</Button></PopoverTrigger>
          <PopoverContent data-rw-inspector className="z-[10001] w-80 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
            <NoteSearchList notes={catalogue.filter((c) => !linked.has(c.id))} onPick={(c) => { setPick(false); void run(() => link({ data: { id: noteId, otherId: c.id } })); }} />
          </PopoverContent>
        </Popover>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => setDraft({ title: "", text: "" })}><Plus className="mr-1 h-3 w-3" />新建关联注释</Button>
        <Button size="sm" variant="outline" disabled={busy || !notes.length || ai.loading} onClick={async () => {
          const id = noteId; setAi({ loading: true });
          try { const r = await compare({ data: { noteId: id, context: JSON.stringify({ page: window.location.pathname + window.location.search }) } }); if (active.current === id) setAi(r.report ? { report: r.report } : { error: r.error || "失败" }); }
          catch (e) { if (active.current === id) setAi({ error: String(e) }); }
        }}><Sparkles className="mr-1 h-3 w-3" />{ai.loading ? "AI 比较中…" : "AI 三方核对实际代码与注释"}</Button>
      </div>
      {draft && (
        <div className="space-y-2 rounded border p-2">
          <Input aria-label="关联注释名字" placeholder="名字" value={draft.title} maxLength={240} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <Textarea rows={6} placeholder="内容" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
          <div className="flex gap-2">
            <Button size="sm" disabled={busy || !draft.title.trim()} onClick={async () => { const d = draft; if (await run(() => link({ data: { id: noteId, create: { title: d.title.trim(), text: d.text } } }))) setDraft(null); }}>保存并关联</Button>
            <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>取消</Button>
          </div>
        </div>
      )}
      {state.error && <p className="text-destructive">{state.error}</p>}
      {ai.error && <p className="text-destructive">{ai.error}</p>}
      {ai.report && <ConflictReportView report={ai.report} />}
    </div>
  );
}
