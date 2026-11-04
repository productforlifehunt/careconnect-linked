/** Researcher manual notes for the selected element or the whole page, saved privately so they survive refresh/close. */
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { loadAllInspectorNotes, saveInspectorNote, selectInspectorNote } from "@/lib/inspector-notes.functions";
import { inspectorNotesCache } from "@/features/inspector/notes-cache";
import { getWPToken } from "@/services/wp-auth";
import { useRef } from "react";
import { isGeneratedNote, resolveSourceNote } from "@/features/inspector/source-notes";
import { readSource } from "@/features/inspector/live-index";
import { noteCatalogue, type CCTNote } from '@/features/inspector/cct-notes';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronsUpDown, Plus, Lock } from 'lucide-react';

export function ManualNotes({ noteKey, scope, page, label, source, tag, onChange }: { noteKey: string; scope: "element" | "page"; page: string; label: string; source?: string | undefined; tag?: string | undefined; onChange?: (text: string) => void }) {
  const load = useServerFn(loadAllInspectorNotes); const save = useServerFn(saveInspectorNote);
  const select = useServerFn(selectInspectorNote);
  const [catalogue, setCatalogue] = useState<CCTNote[]>([]);
  const [selected, setSelected] = useState<string>();
  const [title, setTitle] = useState(''); const [savedTitle, setSavedTitle] = useState('');
  const [choice, setChoice] = useState<string>(); const [open, setOpen] = useState(false);
  const [text, setText] = useState(""); const [saved, setSaved] = useState(""); const [state, setState] = useState<{ loading?: boolean; saving?: boolean; error?: string | undefined; at?: string | undefined }>({ loading: true });
  const [retry, setRetry] = useState(0);
  const activeKey = useRef(noteKey); activeKey.current = noteKey;
  useEffect(() => {
    let live = true;
    const session = getWPToken() || "";
    const apply = async (map: Awaited<ReturnType<typeof inspectorNotesCache.load>>) => {
      if (!live || session !== (getWPToken() || "")) return;
      const existing = map.get(noteKey);
      const n = existing?.locked || (existing?.text && !isGeneratedNote(existing.text)) ? existing :
        (source && tag ? await resolveSourceNote(map, source, tag, readSource) : undefined) || existing;
      if (!live || session !== (getWPToken() || "")) return;
      setText(n?.text || ""); setSaved(n?.text || ""); onChange?.(n?.text || ""); setState({ at: n?.updatedAt });
      setCatalogue(noteCatalogue(map)); setSelected(n?.id); setChoice(n?.id); setTitle(n?.title || label.slice(0,240)); setSavedTitle(n?.title || label.slice(0,240));
    };
    const cached = inspectorNotesCache.peek(session);
    if (cached) void apply(cached).catch((e) => live && setState({ error: String(e) }));
    else {
      setState({ loading: true }); setText(""); setSaved(""); onChange?.("");
      inspectorNotesCache.load(session, () => load()).then(apply).catch((e) => live && setState({ error: String(e) }));
    }
    return () => { live = false; };
  }, [noteKey, source, tag, retry]); // eslint-disable-line react-hooks/exhaustive-deps
  const doSave = async () => {
    const session = getWPToken() || "";
    const key = noteKey;
    setState((s) => ({ ...s, saving: true, error: undefined }));
    const r = await save({ data: { key: noteKey, scope, page, label, title, id: selected, text } }).catch((e) => ({ error: String(e) }) as { error: string; note?: undefined });
    if (session !== (getWPToken() || "")) return;
    if ("note" in r && r.note) {
      inspectorNotesCache.put(session, r.note);
      if (activeKey.current !== key) return;
      setSaved(r.note.text); onChange?.(r.note.text); setState({ at: r.note.updatedAt });
      setSelected(r.note.id); setChoice(r.note.id); setTitle(r.note.title || title); setSavedTitle(r.note.title || title);
      const map = inspectorNotesCache.peek(session); if (map) setCatalogue(noteCatalogue(map));
    } else if (activeKey.current === key) setState({ error: r.error || "保存失败" });
  };
  const lockChoice = async () => {
    if (!choice) return;
    const key = noteKey; const session = getWPToken() || '';
    setState(s => ({ ...s, saving: true, error: undefined }));
    try {
      const result = await select({ data: { key, id: choice, scope, page, label } });
      if (session !== (getWPToken() || '') || activeKey.current !== key) return;
      if (!result.note) throw new Error(result.error || '选择未保存');
      inspectorNotesCache.put(session, result.note);
      setSelected(result.note.id); setText(result.note.text); setSaved(result.note.text); setTitle(result.note.title || ''); setSavedTitle(result.note.title || ''); onChange?.(result.note.text); setState({at:result.note.updatedAt});
    } catch (e) { if (activeKey.current === key) setState({error:String(e)}); }
  };
  return (
    <div className="space-y-2 text-xs">
      <p className="text-muted-foreground">{selected ? `当前注释：${savedTitle} · CCT324 #${selected}` : '当前没有已保存的注释'}</p>
      <div className="flex flex-wrap gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild><Button variant="outline" size="sm" disabled={state.loading || state.saving}><ChevronsUpDown className="mr-1 h-3 w-3" />选择其他注释</Button></PopoverTrigger>
          <PopoverContent className="w-80 p-0" onOpenAutoFocus={e => e.preventDefault()}>
            <Command><CommandInput placeholder="搜索注释名字或编号" /><CommandList><CommandEmpty>没有找到注释</CommandEmpty>{catalogue.map(n => <CommandItem key={n.id} value={`${n.title} ${n.id}`} onSelect={() => {setChoice(n.id);setOpen(false);}}>{n.title} · #{n.id}</CommandItem>)}</CommandList></Command>
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="sm" disabled={!choice || choice === selected || state.saving} onClick={lockChoice}><Lock className="mr-1 h-3 w-3" />锁定选择</Button>
        <Button variant="outline" size="sm" disabled={state.loading || state.saving} onClick={() => {setSelected(undefined);setChoice(undefined);setTitle(label.slice(0,240));setSavedTitle('');setText('');setSaved('');onChange?.('');setState({});}}><Plus className="mr-1 h-3 w-3" />新建</Button>
      </div>
      {choice && choice !== selected && <p>待锁定：{catalogue.find(n=>n.id===choice)?.title} · #{choice}</p>}
      <Input aria-label="注释名字" value={title} onChange={e=>setTitle(e.target.value)} maxLength={240} disabled={state.loading || state.saving} />
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} disabled={state.loading} placeholder={state.loading ? "读取中…" : "写下这里应该怎么读写、怎么判定…"} />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={doSave} disabled={state.loading || state.saving || !title.trim() || (selected !== undefined && text === saved && title === savedTitle)}>{state.saving ? "保存中…" : "保存注释"}</Button>
        {text !== saved && <span className="text-muted-foreground">有未保存的修改</span>}
        {text === saved && state.at && <span className="text-muted-foreground">已保存 {new Date(state.at).toLocaleString()}</span>}
      </div>
      {state.error && <div className="flex items-center gap-2"><p className="text-destructive">{state.error}</p><Button size="sm" variant="outline" onClick={() => setRetry((n) => n + 1)}>重新读取</Button></div>}
    </div>
  );
}
