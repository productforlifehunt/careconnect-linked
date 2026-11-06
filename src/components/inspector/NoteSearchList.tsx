import { useDeferredValue, useMemo, useState } from "react";
import type { CCTNote } from "@/features/inspector/cct-notes";

/**
 * Fast note picker: plain text box, simple contains-match on name or number, at most 60 rows shown.
 * Thousands of notes stay smooth because nothing is fuzzy-scored and the list never renders them all;
 * Chinese input is matched only after the typed characters are committed.
 */
export function NoteSearchList({ notes, onPick }: { notes: CCTNote[]; onPick: (n: CCTNote) => void }) {
  const [text, setText] = useState("");
  const [composing, setComposing] = useState(false);
  const [committed, setCommitted] = useState("");
  const query = useDeferredValue(composing ? committed : text);
  const index = useMemo(() => notes.map((n) => ({ n, hay: `${n.title} #${n.id} ${n.id}`.toLowerCase() })), [notes]);
  const results = useMemo(() => {
    const words = query.trim().toLowerCase().replace(/^#/, "").split(/\s+/).filter(Boolean);
    const out: CCTNote[] = [];
    for (const { n, hay } of index) {
      if (words.every((w) => hay.includes(w))) { out.push(n); if (out.length >= 60) break; }
    }
    return out;
  }, [index, query]);
  return (
    <div className="flex flex-col">
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
        {results.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">没有找到注释</p> :
          results.map((n) => (
            <button key={n.id} type="button" onClick={() => onPick(n)} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent">
              <span className="min-w-0 truncate">{n.title} · #{n.id}</span>
              <span className="ml-auto shrink-0 pl-2 text-xs text-muted-foreground">{n.verified ? "已手动核对" : "未手动核对"}</span>
            </button>
          ))}
        {results.length >= 60 && <p className="px-2 py-1 text-xs text-muted-foreground">只显示前 60 条，请输入更多字缩小范围</p>}
      </div>
    </div>
  );
}
