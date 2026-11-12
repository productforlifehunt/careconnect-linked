import * as React from "react";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";

const COLORS = [
  { name: "红", v: "--note-red" },
  { name: "黄", v: "--note-yellow" },
  { name: "橙", v: "--note-orange" },
  { name: "绿", v: "--note-green" },
  { name: "蓝", v: "--note-blue" },
];

type Part = { start: number; end: number; color?: number };

/** Splits text into blank-line separated paragraphs with offsets. */
export function noteParagraphs(text: string): Part[] {
  const parts: Part[] = [];
  const re = /\n[ \t]*\n+/g;
  let last = 0;
  let n = 0;
  let m: RegExpExecArray | null;
  const push = (s: number, e: number) => {
    if (text.slice(s, e).trim()) parts.push({ start: s, end: e, color: n++ % COLORS.length });
    else if (e > s) parts.push({ start: s, end: e });
  };
  while ((m = re.exec(text))) {
    push(last, m.index);
    parts.push({ start: m.index, end: m.index + m[0].length });
    last = m.index + m[0].length;
  }
  push(last, text.length);
  return parts;
}

export function NoteTextarea(props: Omit<TextareaProps, "value"> & { value: string }) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const back = React.useRef<HTMLDivElement>(null);
  const [view, setView] = React.useState({ caret: 1, visible: 0, top: 1 });
  const text = props.value;
  const parts = React.useMemo(() => noteParagraphs(text), [text]);
  const total = text ? text.split("\n").length : 0;

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

  const pick = (p: Part) => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(p.start, p.end);
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
    el.scrollTop = (text.slice(0, p.start).split("\n").length - 1) * lh;
    measure();
  };

  const colored = parts.filter((p) => p.color !== undefined);
  return (
    <div className="space-y-1">
      {colored.length > 1 && (
        <div className="flex flex-wrap gap-1" aria-label="段落">
          {colored.map((p, i) => (
            <button
              key={p.start}
              type="button"
              onClick={() => pick(p)}
              className="rounded border border-input px-1.5 text-xs"
              style={{ background: `hsl(var(${COLORS[p.color!]!.v}))` }}
            >
              {i + 1} {COLORS[p.color!]!.name}
            </button>
          ))}
        </div>
      )}
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
