import * as React from "react";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";

const COLORS = [
  { name: "红", v: "--note-red" },
  { name: "黄", v: "--note-yellow" },
  { name: "橙", v: "--note-orange" },
  { name: "绿", v: "--note-green" },
  { name: "蓝", v: "--note-blue" },
];

export type Mark = { s: string; c: number };
type Part = { start: number; end: number; color?: number | undefined };

/** Highlights every occurrence of each user-marked phrase; later marks win. */
export function markedParts(text: string, marks: Mark[]): Part[] {
  const color: (number | undefined)[] = new Array(text.length);
  for (const m of marks) {
    if (!m.s) continue;
    for (let i = text.indexOf(m.s); i >= 0; i = text.indexOf(m.s, i + m.s.length))
      for (let k = i; k < i + m.s.length; k++) color[k] = m.c < 0 ? undefined : m.c;
  }
  const parts: Part[] = [];
  for (let i = 0; i < text.length; ) {
    let j = i + 1;
    while (j < text.length && color[j] === color[i]) j++;
    parts.push({ start: i, end: j, color: color[i] });
    i = j;
  }
  return parts;
}

const key = (k: string) => `inspector-note-marks:${k}`;

export function NoteTextarea({ markKey, ...props }: Omit<TextareaProps, "value"> & { value: string; markKey?: string | undefined }) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const back = React.useRef<HTMLDivElement>(null);
  const [view, setView] = React.useState({ caret: 1, visible: 0, top: 1 });
  const [marks, setMarks] = React.useState<Mark[]>([]);
  const text = props.value;
  const parts = React.useMemo(() => markedParts(text, marks), [text, marks]);
  const total = text ? text.split("\n").length : 0;

  React.useEffect(() => {
    try { setMarks(markKey ? JSON.parse(localStorage.getItem(key(markKey)) || "[]") : []); } catch { setMarks([]); }
  }, [markKey]);

  const measure = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (back.current) back.current.scrollTop = el.scrollTop;
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
    setView({
      caret: el.value.slice(0, el.selectionStart).split("\n").length,
      visible: Math.max(1, Math.round((el.clientHeight - 16) / lh)),
      top: Math.floor(el.scrollTop / lh) + 1,
    });
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, text]);

  const paint = (c: number) => {
    const el = ref.current;
    if (!el || el.selectionStart === el.selectionEnd) return;
    const s = el.value.slice(el.selectionStart, el.selectionEnd);
    const next = [...marks.filter((m) => m.s !== s), { s, c }];
    setMarks(next);
    if (markKey) localStorage.setItem(key(markKey), JSON.stringify(next));
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1" aria-label="标色">
        {COLORS.map((c, i) => (
          <button key={c.name} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => paint(i)}
            className="rounded border border-input px-1.5 text-xs" style={{ background: `hsl(var(${c.v}))` }}>
            {c.name}
          </button>
        ))}
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => paint(-1)}
          className="rounded border border-input px-1.5 text-xs">清除</button>
      </div>
      <div className="relative">
        <div
          ref={back}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words rounded-md border border-transparent px-3 py-2 text-sm text-transparent"
          style={{ scrollbarGutter: "stable" }}
        >
          {parts.map((p) => (
            <span key={p.start} style={p.color === undefined ? undefined : { background: `hsl(var(${COLORS[p.color]!.v}))` }}>
              {text.slice(p.start, p.end)}
            </span>
          ))}
          {"\n"}
        </div>
        <Textarea
          {...props}
          ref={ref}
          className={`relative bg-transparent ${props.className ?? ""}`}
          style={{ scrollbarGutter: "stable", ...props.style }}
          onScroll={(e) => { measure(); props.onScroll?.(e); }}
          onSelect={(e) => { measure(); props.onSelect?.(e); }}
        />
      </div>
      <p className="text-right text-xs text-muted-foreground">
        第 {view.top}–{Math.min(total, view.top + view.visible - 1) || 0} 行 · 光标第 {view.caret} 行 · 共 {total} 行
      </p>
    </div>
  );
}
