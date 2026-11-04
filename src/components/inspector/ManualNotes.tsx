/** Researcher manual notes for the selected element or the whole page, saved privately so they survive refresh/close. */
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { loadInspectorNotes, saveInspectorNote } from "@/lib/inspector-notes.functions";

export function ManualNotes({ noteKey, scope, page, label, onChange }: { noteKey: string; scope: "element" | "page"; page: string; label: string; onChange?: (text: string) => void }) {
  const load = useServerFn(loadInspectorNotes); const save = useServerFn(saveInspectorNote);
  const [text, setText] = useState(""); const [saved, setSaved] = useState(""); const [state, setState] = useState<{ loading?: boolean; saving?: boolean; error?: string; at?: string }>({ loading: true });
  useEffect(() => {
    let live = true; setState({ loading: true }); setText(""); setSaved("");
    load({ data: { keys: [noteKey] } }).then((r) => {
      if (!live) return; const n = r.notes[0];
      setText(n?.text || ""); setSaved(n?.text || ""); onChange?.(n?.text || ""); setState({ error: r.error, at: n?.updatedAt });
    }).catch((e) => live && setState({ error: String(e) }));
    return () => { live = false; };
  }, [noteKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const doSave = async () => {
    setState((s) => ({ ...s, saving: true, error: undefined }));
    const r = await save({ data: { key: noteKey, scope, page, label, text } }).catch((e) => ({ error: String(e) }) as { error: string; note?: undefined });
    if ("note" in r && r.note) { setSaved(r.note.text); onChange?.(r.note.text); setState({ at: r.note.updatedAt }); } else setState({ error: r.error || "保存失败" });
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
      {state.error && <p className="text-destructive">{state.error}</p>}
    </div>
  );
}
