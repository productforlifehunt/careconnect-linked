/** Researcher manual notes for the selected element or the whole page, saved privately so they survive refresh/close. */
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { loadAllInspectorNotes, saveInspectorNote, selectInspectorNote } from "@/lib/inspector-notes.functions";
import { inspectorNotesCache } from "@/features/inspector/notes-cache";
import { getWPToken } from "@/services/wp-auth";
import { useRef } from "react";
import { isGeneratedNote, resolveSourceNote } from "@/features/inspector/source-notes";
import { findSameElementNote } from "@/features/inspector/route-key";
import { readSource } from "@/features/inspector/live-index";
import { noteCatalogue, type CCTNote } from '@/features/inspector/cct-notes';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NoteSearchList } from './NoteSearchList';
import { ChevronsUpDown, Plus, Lock } from 'lucide-react';
import { RelatedNotes } from './RelatedNotes';

export function ManualNotes({ noteKey, scope, page, label, source, tag, onChange }: { noteKey: string; scope: "element" | "page"; page: string; label: string; source?: string | undefined; tag?: string | undefined; onChange?: (text: string) => void }) {
  const load = useServerFn(loadAllInspectorNotes); const save = useServerFn(saveInspectorNote);
  const select = useServerFn(selectInspectorNote);
  const [catalogue, setCatalogue] = useState<CCTNote[]>([]);
  const [selected, setSelected] = useState<string>();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState(''); const [savedTitle, setSavedTitle] = useState('');
  const [choice, setChoice] = useState<string>(); const [open, setOpen] = useState(false);
  const [text, setText] = useState(""); const [saved, setSaved] = useState(""); const [state, setState] = useState<{ loading?: boolean; saving?: boolean; error?: string | undefined; at?: string | undefined }>({ loading: true });
  const [retry, setRetry] = useState(0);
  const [verified, setVerified] = useState(false); const [savedVerified, setSavedVerified] = useState(false);
  const activeKey = useRef(noteKey); activeKey.current = noteKey;
  useEffect(() => {
    let live = true;
    const session = getWPToken() || "";
    const apply = async (map: Awaited<ReturnType<typeof inspectorNotesCache.load>>) => {
      if (!live || session !== (getWPToken() || "")) return;
      const existing = findSameElementNote(map, noteKey);
      const n = existing?.locked || (existing?.text && !isGeneratedNote(existing.text)) ? existing :
        (source && tag ? await resolveSourceNote(map, source, tag, readSource) : undefined) || existing;
      if (!live || session !== (getWPToken() || "")) return;
      setText(n?.text || ""); setSaved(n?.text || ""); onChange?.(n?.text || ""); setState({ at: n?.updatedAt });
      setCatalogue(noteCatalogue(map)); setSelected(n?.id); setChoice(n?.id); setTitle(n?.title || label.slice(0,240)); setSavedTitle(n?.title || label.slice(0,240));
      setVerified(!!(n as CCTNote | undefined)?.verified); setSavedVerified(!!(n as CCTNote | undefined)?.verified);
      setCreating(false);
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
    const r = await save({ data: { key: noteKey, scope, page, label, title, id: selected, create: creating, verified, text } }).catch((e) => ({ error: String(e) }) as { error: string; note?: undefined });
    if (session !== (getWPToken() || "")) return;
    if ("note" in r && r.note) {
      inspectorNotesCache.put(session, r.note);
      if (activeKey.current !== key) return;
      setSaved(r.note.text); onChange?.(r.note.text); setState({ at: r.note.updatedAt });
      setSelected(r.note.id); setChoice(r.note.id); setTitle(r.note.title || title); setSavedTitle(r.note.title || title); setVerified(!!r.note.verified); setSavedVerified(!!r.note.verified);
      setCreating(false);
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
      setSelected(result.note.id); setText(result.note.text); setSaved(result.note.text); setTitle(result.note.title || ''); setSavedTitle(result.note.title || ''); setVerified(!!result.note.verified); setSavedVerified(!!result.note.verified); onChange?.(result.note.text); setState({at:result.note.updatedAt});
    } catch (e) { if (activeKey.current === key) setState({error:String(e)}); }
  };
  return (
    <div className="space-y-2 text-xs">
      <p className="text-muted-foreground">{state.loading ? '正在读取已保存的注释…' : selected ? `当前注释：${savedTitle} · CCT324 #${selected}` : '当前没有已保存的注释'}</p>
      <div className="flex flex-wrap gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild><Button variant="outline" size="sm" disabled={state.loading || state.saving}><ChevronsUpDown className="mr-1 h-3 w-3" />选择其他注释</Button></PopoverTrigger>
          <PopoverContent data-rw-inspector className="z-[10001] w-80 p-0" onOpenAutoFocus={e => e.preventDefault()}>
            <NoteSearchList notes={catalogue} onPick={(n) => { setChoice(n.id); setOpen(false); }} />
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="sm" disabled={!choice || choice === selected || state.saving} onClick={lockChoice}><Lock className="mr-1 h-3 w-3" />锁定选择</Button>
        <Button variant="outline" size="sm" disabled={state.loading || state.saving} onClick={() => {setCreating(true);setSelected(undefined);setChoice(undefined);setTitle(label.slice(0,240));setSavedTitle('');setVerified(false);setSavedVerified(false);setText('');setSaved('');onChange?.('');setState({});}}><Plus className="mr-1 h-3 w-3" />新建</Button>
      </div>
      {choice && choice !== selected && <p>待锁定：{catalogue.find(n=>n.id===choice)?.title} · #{choice} · {catalogue.find(n=>n.id===choice)?.verified ? "已手动核对" : "未手动核对"}</p>}
      <Input aria-label="注释名字" value={title} onChange={e=>setTitle(e.target.value)} maxLength={240} disabled={state.loading || state.saving} />
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} disabled={state.loading} placeholder={state.loading ? "读取中…" : "写下这里应该怎么读写、怎么判定…"} />
      <label className="flex items-center gap-2"><Switch checked={verified} onCheckedChange={setVerified} disabled={state.loading || state.saving} aria-label="已手动核对" /><span>{verified ? '已手动核对' : '未手动核对'}</span>{verified !== savedVerified && <span className="text-muted-foreground">（未保存）</span>}</label>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={doSave} disabled={state.loading || state.saving || !title.trim() || (selected !== undefined && text === saved && title === savedTitle && verified === savedVerified)}>{state.saving ? "保存中…" : "保存注释"}</Button>
        {text !== saved && <span className="text-muted-foreground">有未保存的修改</span>}
        {text === saved && state.at && <span className="text-muted-foreground">已保存 {new Date(state.at).toLocaleString()}</span>}
      </div>
      {selected && !creating ? <RelatedNotes noteId={selected} catalogue={catalogue} /> : !state.loading && <p className="rounded-md border p-2 text-muted-foreground">关联注释：这个元素还没有自己的注释。先写好并点"保存注释"（或用"选择其他注释"再"锁定选择"），下面就会出现"关联已有注释"（可搜索名字或编号）和"新建关联注释"。</p>}
      {state.error && <div className="flex items-center gap-2"><p className="text-destructive">{state.error}</p><Button size="sm" variant="outline" onClick={() => {inspectorNotesCache.reset();setRetry((n) => n + 1);}}>重新读取</Button></div>}
    </div>
  );
}
