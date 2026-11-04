/** REL325 related manual notes for the current CCT324 note: collapsed list, link/unlink/create, and an AI conflict check. */
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, ChevronRight, Link2, Plus, Sparkles, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { linkRelatedNote, listRelatedNotes, unlinkRelatedNote } from "@/lib/inspector-notes.functions";
import { checkNoteConflicts } from "@/lib/inspector-ai.functions";
import type { CCTNote } from "@/features/inspector/cct-notes";

type Related = { id: string; title: string; text: string; side: "parent" | "child" };

export function RelatedNotes({ noteId, catalogue }: { noteId: string; catalogue: CCTNote[] }) {
  const list = useServerFn(listRelatedNotes); const link = useServerFn(linkRelatedNote);
  const unlink = useServerFn(unlinkRelatedNote); const compare = useServerFn(checkNoteConflicts);
  const [notes, setNotes] = useState<Related[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<{ loading?: boolean; busy?: boolean; error?: string | undefined }>({ loading: true });
  const [pick, setPick] = useState(false);
  const [draft, setDraft] = useState<{ title: string; text: string } | null>(null);
  const [ai, setAi] = useState<{ loading?: boolean; text?: string; error?: string }>({});
  const active = useRef(noteId); active.current = noteId;

  useEffect(() => {
    let live = true; setState({ loading: true }); setNotes([]); setOpen({}); setAi({}); setDraft(null);
    list({ data: { id: noteId } }).then((r) => { if (!live) return; setNotes(r.notes); setState({ error: r.error }); })
      .catch((e) => live && setState({ error: String(e) }));
    return () => { live = false; };
  }, [noteId]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = (id: string, r: { notes?: Related[]; error?: string }) => {
    if (active.current !== id) return;
    if (r.notes) { setNotes(r.notes); setState({}); setAi({}); } else setState({ error: r.error || "失败" });
  };
  const run = async (fn: () => Promise<{ notes?: Related[]; error?: string }>) => {
    const id = noteId; setState({ busy: true });
    try { apply(id, await fn()); } catch (e) { if (active.current === id) setState({ error: String(e) }); }
  };
  const linked = new Set([noteId, ...notes.map((n) => n.id)]);
  const busy = state.loading || state.busy;

  return (
    <div className="space-y-2 rounded-md border p-2" data-rw-inspector>
      <p className="font-medium">关联注释（REL325 One manual note can have many related manual notes）· {state.loading ? "读取中…" : `${notes.length} 条`}</p>
      {notes.map((n) => (
        <div key={`${n.side}-${n.id}`} className="rounded border">
          <button type="button" className="flex w-full items-start gap-1 p-2 text-left hover:bg-muted/50" onClick={() => setOpen((o) => ({ ...o, [n.id]: !o[n.id] }))}>
            {open[n.id] ? <ChevronDown className="mt-0.5 h-3 w-3 shrink-0" /> : <ChevronRight className="mt-0.5 h-3 w-3 shrink-0" />}
            <span><span className="text-muted-foreground">{n.side === "parent" ? "上级（父）" : "下级（子）"} · #{n.id} · </span>{n.title}</span>
          </button>
          {open[n.id] && (
            <div className="space-y-2 border-t p-2">
              <div className="max-h-[40vh] overflow-auto whitespace-pre-wrap break-words">{n.text}</div>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => unlink({ data: n.side === "parent" ? { id: noteId, parent: n.id, child: noteId } : { id: noteId, parent: noteId, child: n.id } }))}><Unlink className="mr-1 h-3 w-3" />取消关联</Button>
            </div>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Popover open={pick} onOpenChange={setPick}>
          <PopoverTrigger asChild><Button size="sm" variant="outline" disabled={busy}><Link2 className="mr-1 h-3 w-3" />关联已有注释</Button></PopoverTrigger>
          <PopoverContent data-rw-inspector className="z-[10001] w-80 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
            <Command><CommandInput placeholder="搜索注释名字或编号" /><CommandList><CommandEmpty>没有找到注释</CommandEmpty>
              {catalogue.filter((c) => !linked.has(c.id)).map((c) => <CommandItem key={c.id} value={`${c.title} ${c.id}`} onSelect={() => { setPick(false); void run(() => link({ data: { id: noteId, otherId: c.id } })); }}>{c.title} · #{c.id}</CommandItem>)}
            </CommandList></Command>
          </PopoverContent>
        </Popover>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => setDraft({ title: "", text: "" })}><Plus className="mr-1 h-3 w-3" />新建关联注释</Button>
        <Button size="sm" variant="outline" disabled={busy || !notes.length || ai.loading} onClick={async () => {
          const id = noteId; setAi({ loading: true });
          try { const r = await compare({ data: { id } }); if (active.current === id) setAi(r.text ? { text: r.text } : { error: r.error || "失败" }); }
          catch (e) { if (active.current === id) setAi({ error: String(e) }); }
        }}><Sparkles className="mr-1 h-3 w-3" />{ai.loading ? "AI 比较中…" : "AI 分析与相关注释冲突"}</Button>
      </div>
      {draft && (
        <div className="space-y-2 rounded border p-2">
          <Input aria-label="关联注释名字" placeholder="名字（数据结构注释以“数据字典 · ”开头会作为上级）" value={draft.title} maxLength={240} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <Textarea rows={6} placeholder="内容" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
          <div className="flex gap-2">
            <Button size="sm" disabled={busy || !draft.title.trim()} onClick={async () => { const d = draft; await run(() => link({ data: { id: noteId, create: { title: d.title.trim(), text: d.text } } })); setDraft(null); }}>保存并关联</Button>
            <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>取消</Button>
          </div>
        </div>
      )}
      {state.error && <p className="text-destructive">{state.error}</p>}
      {ai.error && <p className="text-destructive">{ai.error}</p>}
      {ai.text && <div className="max-h-[50vh] overflow-auto whitespace-pre-wrap break-words rounded bg-muted/40 p-2">{ai.text}</div>}
    </div>
  );
}
