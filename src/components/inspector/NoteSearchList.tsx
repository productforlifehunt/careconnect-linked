import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { searchInspectorNotes } from "@/lib/inspector-notes.functions";

export type NotePick = { id: string; title: string; verified: boolean };
export type NoteSearch = (q: string, status: "all" | "verified" | "unverified") => Promise<NotePick[]>;

/**
 * Note picker: WordPress itself searches the names (or exact number) and returns at most 60 rows,
 * so nothing ever downloads the whole note table just to type into this box.
 */
export function NoteSearchList({ onPick, exclude, search, onClose }: { onPick: (n: NotePick) => void; exclude?: Set<string>; search?: NoteSearch; onClose?: () => void }) {
  const remote = useServerFn(searchInspectorNotes);
  const run: NoteSearch = search ?? (async (q, status) => { const r = await remote({ data: { q, status } }); if ("error" in r && r.error) throw new Error(r.error); return r.notes; });
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"all" | "verified" | "unverified">("all");
  const [composing, setComposing] = useState(false);
  const [committed, setCommitted] = useState("");
  const [found, setFound] = useState<{ loading: boolean; rows: NotePick[]; error?: string }>({ loading: true, rows: [] });
  const query = composing ? committed : text;
  useEffect(() => {
    let live = true;
    setFound((f) => ({ ...f, loading: true }));
    const t = setTimeout(() => { run(query, status).then((rows) => live && setFound({ loading: false, rows })).catch((e) => live && setFound({ loading: false, rows: [], error: String(e) })); }, query ? 300 : 0);
    return () => { live = false; clearTimeout(t); };
  }, [query, status]); // eslint-disable-line react-hooks/exhaustive-deps
  const results = found.rows.filter((n) => !exclude?.has(n.id));
  return (
    <div className="flex flex-col">
      <div role="group" aria-label="核对状态筛选" className="flex gap-1 border-b border-border p-2">
        {([
          ["all", "全部"],
          ["verified", "已核对"],
          ["unverified", "未核对"],
        ] as const).map(([value, label]) => (
          <Button key={value} type="button" size="sm" variant={status === value ? "secondary" : "ghost"}
            aria-pressed={status === value} onClick={() => setStatus(value)} className="flex-1">
            {label}
          </Button>
        ))}
        {onClose && <Button type="button" size="sm" variant="ghost" aria-label="关闭" title="关闭" onClick={onClose} className="px-2"><X className="h-4 w-4" /></Button>}
      </div>
      <input
        autoFocus
        value={text}
        onChange={(e) => { setText(e.target.value); if (!composing) setCommitted(e.target.value); }}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={(e) => { setComposing(false); setCommitted(e.currentTarget.value); setText(e.currentTarget.value); }}
        onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter" && !composing && results[0]) onPick(results[0]); }}
        placeholder="搜索注释名字或编号"
        className="h-10 w-full border-b border-border bg-transparent px-3 text-sm outline-none"
      />
      <div className="max-h-72 overflow-y-auto overscroll-contain p-1">
        {found.loading && results.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">搜索中…</p> : found.error ? <p className="py-6 text-center text-sm text-destructive">{found.error}</p> : results.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">没有找到注释</p> :
          results.map((n) => (
            <Button key={n.id} type="button" variant="ghost" onClick={() => onPick(n)} className="flex h-auto w-full justify-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm font-normal">
              <span className="min-w-0 truncate">{n.title} · #{n.id}</span>
              <span className="ml-auto shrink-0 pl-2 text-xs text-muted-foreground">{n.verified ? "已手动核对" : "未手动核对"}</span>
            </Button>
          ))}
        {results.length >= 60 && <p className="px-2 py-1 text-xs text-muted-foreground">只显示最新 60 条，请输入更多字缩小范围</p>}
      </div>
    </div>
  );
}
