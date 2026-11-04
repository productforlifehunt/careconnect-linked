/** Researcher manual notes for the selected element or the whole page, saved privately so they survive refresh/close. */
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { loadAllInspectorNotes, saveInspectorNote } from "@/lib/inspector-notes.functions";
import { inspectorNotesCache } from "@/features/inspector/notes-cache";
import { getWPToken } from "@/services/wp-auth";
import { useRef } from "react";

export function ManualNotes({ noteKey, scope, page, label, onChange }: { noteKey: string; scope: "element" | "page"; page: string; label: string; onChange?: (text: string) => void }) {
  const load = useServerFn(loadAllInspectorNotes); const save = useServerFn(saveInspectorNote);
  const [text, setText] = useState(""); const [saved, setSaved] = useState(""); const [state, setState] = useState<{ loading?: boolean; saving?: boolean; error?: string | undefined; at?: string | undefined }>({ loading: true });
  const [retry, setRetry] = useState(0);
  const activeKey = useRef(noteKey); activeKey.current = noteKey;
  useEffect(() => {
    let live = true;
    const session = getWPToken() || "";
    const apply = (map: Awaited<ReturnType<typeof inspectorNotesCache.load>>) => {
      if (!live || session !== (getWPToken() || "")) return;
      const n = map.get(noteKey);
      setText(n?.text || ""); setSaved(n?.text || ""); onChange?.(n?.text || ""); setState({ at: n?.updatedAt });
    };
    const cached = inspectorNotesCache.peek(session);
    if (cached) apply(cached);
    else {
      setState({ loading: true }); setText(""); setSaved(""); onChange?.("");
      inspectorNotesCache.load(session, () => load()).then(apply).catch((e) => live && setState({ error: String(e) }));
    }
    return () => { live = false; };
  }, [noteKey, retry]); // eslint-disable-line react-hooks/exhaustive-deps
  const doSave = async () => {
    const session = getWPToken() || "";
    const key = noteKey;
    setState((s) => ({ ...s, saving: true, error: undefined }));
    const r = await save({ data: { key: noteKey, scope, page, label, text } }).catch((e) => ({ error: String(e) }) as { error: string; note?: undefined });
    if (session !== (getWPToken() || "")) return;
    if ("note" in r && r.note) {
      inspectorNotesCache.put(session, r.note);
      if (activeKey.current !== key) return;
      setSaved(r.note.text); onChange?.(r.note.text); setState({ at: r.note.updatedAt });
    } else if (activeKey.current === key) setState({ error: r.error || "保存失败" });
  };
  return (
    <div className="space-y-2 text-xs">
      <p className="text-muted-foreground">这份注释关联到：{scope === "element" ? "这个元素" : "这一页"}「{label.slice(0, 80)}」。保存后关闭或刷新都不会消失；AI 分析会拿它来核对实际实现。</p>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} disabled={state.loading} placeholder={state.loading ? "读取中…" : "写下这里应该怎么读写、怎么判定…"} />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={doSave} disabled={state.loading || state.saving || text === saved}>{state.saving ? "保存中…" : "保存注释"}</Button>
        {text !== saved && <span className="text-muted-foreground">有未保存的修改</span>}
        {text === saved && state.at && <span className="text-muted-foreground">已保存 {new Date(state.at).toLocaleString()}</span>}
      </div>
      {state.error && <div className="flex items-center gap-2"><p className="text-destructive">{state.error}</p><Button size="sm" variant="outline" onClick={() => setRetry((n) => n + 1)}>重新读取</Button></div>}
    </div>
  );
}
