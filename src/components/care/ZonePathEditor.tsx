import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Layer } from "leaflet";
import { MousePointer2, PenLine, Pencil, Undo2, Redo2, Spline, CornerDownRight, Plus, Trash2, Scan, Check, Link2, Unlink2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nodeAt, sampleBoundary, smoothNode, moveNode, moveHandle, insertNode, segment, type PathNode, type ZonePoint } from "@/features/location/zone-path";

type Mode = "draw" | "freehand" | "edit";
type Props = { map: LeafletMap; initial: ZonePoint[]; isZh: boolean; onChange: (boundary: ZonePoint[]) => void };

export function ZonePathEditor({ map, initial, isZh, onChange }: Props) {
  const [nodes, setNodes] = useState<PathNode[]>(() => initial.map(nodeAt));
  const [mode, setMode] = useState<Mode>(initial.length >= 3 ? "edit" : "draw");
  const [selected, setSelected] = useState<number | null>(null);
  const [linked, setLinked] = useState(true);
  const [history, setHistory] = useState<{ past: PathNode[][]; future: PathNode[][] }>({ past: [], future: [] });
  const layers = useRef<Layer[]>([]);
  const live = useRef(nodes);
  const selectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  const commit = useCallback((next: PathNode[]) => {
    const previous = live.current;
    setHistory(h => ({ past: [...h.past.slice(-49), previous], future: [] }));
    live.current = next; setNodes(next);
  }, []);
  useEffect(() => { changeRef.current(sampleBoundary(nodes)); }, [nodes]);
  const restore = (direction: "undo" | "redo") => {
    const source = direction === "undo" ? history.past : history.future;
    const target = source[source.length - 1];
    if (!target) return;
    setHistory(direction === "undo"
      ? { past: history.past.slice(0, -1), future: [...history.future, live.current] }
      : { past: [...history.past, live.current], future: history.future.slice(0, -1) });
    live.current = target; setNodes(target); setSelected(null);
    if (target.length < 3) setMode("draw");
  };
  const remove = () => {
    if (selected === null || (mode === "edit" && nodes.length <= 3)) return;
    commit(nodes.filter((_, i) => i !== selected)); setSelected(null);
  };
  useEffect(() => {
    let active = true;
    const render = async () => {
      const L = await import("leaflet");
      if (!active) return;
      layers.current.forEach(l => l.remove()); layers.current = [];
      const add = <T extends Layer,>(layer: T): T => { layer.addTo(map); layers.current.push(layer); return layer; };
      const tokens = getComputedStyle(map.getContainer());
      const color = `hsl(${tokens.getPropertyValue("--primary")})`;
      const selectedColor = `hsl(${tokens.getPropertyValue("--foreground")})`;
      const boundary = sampleBoundary(nodes);
      const outline = nodes.length >= 3 && mode === "edit"
        ? add(L.polygon(boundary, { color, weight: 2.5, fillOpacity: .14, interactive: false }))
        : add(L.polyline(boundary, { color, weight: 2.5, interactive: false }));
      const icon = (kind: "anchor" | "mid" | "handle", index: number, side?: string) => L.divIcon({
        className: `zone-editor-marker zone-editor-${kind}`,
        html: `<span class="zone-editor-dot${selected === index ? " is-selected" : ""}" data-zone-kind="${kind}" data-zone-index="${index}" ${side ? `data-zone-side="${side}"` : ""}></span>`,
        iconSize: [28, 28], iconAnchor: [14, 14],
      });
      const paint = (next: PathNode[]) => outline.setLatLngs(sampleBoundary(next));
      nodes.forEach((node, index) => {
        const marker = add(L.marker(node.point, { icon: icon("anchor", index), draggable: mode === "edit", keyboard: true,
          title: isZh ? `点 ${index + 1}` : `Point ${index + 1}`, zIndexOffset: 1000, bubblingMouseEvents: false }));
        marker.on("click", e => {
          L.DomEvent.stopPropagation(e.originalEvent);
          if (mode === "draw" && index === 0 && nodes.length >= 3) { setMode("edit"); setSelected(0); }
          else {
            if (selectionTimer.current) clearTimeout(selectionTimer.current);
            selectionTimer.current = setTimeout(() => setSelected(index), 260);
          }
        });
        marker.on("dblclick", e => {
          L.DomEvent.stopPropagation(e.originalEvent);
          if (selectionTimer.current) clearTimeout(selectionTimer.current);
          if (mode === "edit") { commit(smoothNode(live.current, index)); setSelected(index); }
        });
        marker.on("drag", () => {
          const p = marker.getLatLng();
          const next = nodes.map((n, i) => i === index ? moveNode(n, [p.lat, p.lng]) : n);
          paint(next);
          layers.current.forEach(l => { if (l !== outline && l !== marker) { const el = (l as any).getElement?.(); if (el) el.style.visibility = "hidden"; } });
        });
        marker.on("dragend", () => {
          const p = marker.getLatLng();
          commit(nodes.map((n, i) => i === index ? moveNode(n, [p.lat, p.lng]) : n)); setSelected(index);
        });
        const next = nodes[(index + 1) % nodes.length];
        if (mode === "edit" && next) {
          const p = segment(node, next).get(.5);
          const mid = add(L.marker([p.x, p.y], { icon: icon("mid", index), title: isZh ? "添加点" : "Add point", zIndexOffset: 500, bubblingMouseEvents: false }));
          mid.on("click", e => { L.DomEvent.stopPropagation(e.originalEvent); commit(insertNode(live.current, index)); setSelected(index + 1); });
        }
        if (mode !== "edit" || selected !== index) return;
        for (const side of ["incoming", "outgoing"] as const) {
          const point = node[side];
          if (!point) continue;
          const line = add(L.polyline([node.point, point], { color: selectedColor, weight: 1, dashArray: "3 4", interactive: false }));
          const handle = add(L.marker(point, { icon: icon("handle", index, side), draggable: true,
            title: isZh ? "拖动调整弧度" : "Drag to adjust curve", zIndexOffset: 1500, bubblingMouseEvents: false }));
          handle.on("drag", () => {
            const p = handle.getLatLng();
            line.setLatLngs([node.point, [p.lat, p.lng]]);
            paint(nodes.map((n, i) => i === index ? moveHandle(n, side, [p.lat, p.lng], linked) : n));
          });
          handle.on("dragend", () => {
            const p = handle.getLatLng();
            commit(nodes.map((n, i) => i === index ? moveHandle(n, side, [p.lat, p.lng], linked) : n));
          });
        }
      });
    };
    render();
    return () => { active = false; layers.current.forEach(l => l.remove()); layers.current = []; };
  }, [nodes, mode, selected, linked, map, isZh, commit]);

  useEffect(() => {
    map.doubleClickZoom.disable();
    if (mode === "edit") map.dragging.enable(); else map.dragging.disable();
    const el = map.getContainer();
    el.style.cursor = mode === "edit" ? "" : "crosshair";
    let trail: ZonePoint[] = [];
    let pointerId: number | null = null;
    const toPoint = (e: PointerEvent): ZonePoint => {
      const p = map.mouseEventToLatLng(e); return [p.lat, p.lng];
    };
    const click = (e: any) => {
      if (mode === "draw") commit([...live.current, nodeAt([e.latlng.lat, e.latlng.lng])]);
    };
    const down = (e: PointerEvent) => {
      if (mode !== "freehand" || (e.target as HTMLElement).closest(".leaflet-control,.zone-editor-marker")) return;
      pointerId = e.pointerId; trail = [toPoint(e)]; el.setPointerCapture(e.pointerId); e.preventDefault();
    };
    const move = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      const p = toPoint(e), last = trail[trail.length - 1];
      if (!last || map.latLngToContainerPoint(p).distanceTo(map.latLngToContainerPoint(last)) >= 8) trail.push(p);
    };
    const up = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (trail.length >= 3) { commit(trail.map(nodeAt)); setMode("edit"); setSelected(null); }
      trail = [];
    };
    map.on("click", click);
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    return () => {
      map.off("click", click); map.dragging.enable(); map.doubleClickZoom.enable(); el.style.cursor = "";
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
    };
  }, [mode, map, commit]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea,[contenteditable=true]")) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); restore(e.shiftKey ? "redo" : "undo"); }
      if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); remove(); }
      if (e.key === "Escape") setSelected(null);
      if (e.key === "Enter" && nodes.length >= 3) setMode("edit");
    };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  });
  const tools = [
    { Icon: PenLine, label: isZh ? "描点" : "Place points", active: mode === "draw", run: () => setMode("draw") },
    { Icon: Pencil, label: isZh ? "自由绘制" : "Freehand", active: mode === "freehand", run: () => setMode("freehand") },
    { Icon: MousePointer2, label: isZh ? "编辑" : "Edit points", active: mode === "edit", disabled: nodes.length < 3, run: () => setMode("edit") },
    { Icon: Undo2, label: isZh ? "撤销" : "Undo", disabled: !history.past.length, run: () => restore("undo") },
    { Icon: Redo2, label: isZh ? "重做" : "Redo", disabled: !history.future.length, run: () => restore("redo") },
    { Icon: Spline, label: isZh ? "调整弧度" : "Curve point", disabled: selected === null || mode !== "edit", run: () => { if (selected !== null) commit(smoothNode(nodes, selected)); } },
    { Icon: CornerDownRight, label: isZh ? "恢复直线" : "Straight point", disabled: selected === null || mode !== "edit", run: () => commit(nodes.map((n, i) => i === selected ? { ...n, incoming: null, outgoing: null } : n)) },
    { Icon: Plus, label: isZh ? "添加点" : "Add point", disabled: selected === null || mode !== "edit", run: () => { if (selected !== null) commit(insertNode(nodes, selected)); } },
    { Icon: Trash2, label: isZh ? "删除点" : "Delete point", disabled: selected === null || nodes.length <= 3, run: remove },
    { Icon: linked ? Link2 : Unlink2, label: isZh ? "联动手柄" : "Link handles", active: linked, run: () => setLinked(v => !v) },
    { Icon: Scan, label: isZh ? "查看全貌" : "Fit boundary", disabled: !nodes.length, run: () => map.fitBounds(sampleBoundary(nodes), { padding: [65, 90], maxZoom: 19 }) },
  ];
  return <>
    <div role="toolbar" aria-label={isZh ? "区域绘制" : "Zone drawing"} className="absolute left-2 right-2 top-2 z-[1100] flex flex-wrap gap-0.5 rounded-md border border-border bg-background/95 p-1 shadow-sm backdrop-blur-sm sm:left-auto sm:right-2 sm:max-w-[470px]">
      {tools.map(({ Icon, label, active, disabled, run }) => <Button key={label} type="button" title={label} aria-label={label} aria-pressed={active} variant={active ? "secondary" : "ghost"} size="icon" className="h-8 w-8 shrink-0" disabled={disabled} onClick={run}><Icon className="h-4 w-4" /></Button>)}
      {mode !== "edit" && <Button size="sm" className="h-8 gap-1" disabled={nodes.length < 3} onClick={() => setMode("edit")}><Check className="h-3 w-3" />{isZh ? "闭合" : "Close"}</Button>}
    </div>
    <div className="absolute bottom-2 left-2 right-2 z-[1100] flex flex-wrap items-center justify-between gap-1 rounded-md border border-border bg-background/95 px-2 py-1.5 text-xs text-foreground shadow-sm">
      <span>{mode === "draw" ? (isZh ? "点击描点 · 点起点闭合" : "Place points · Tap first to close") : mode === "freehand" ? (isZh ? "按住描出轮廓" : "Trace the outline") : (isZh ? "双击点调整弧度 · 拖动手柄" : "Double-click point for curves · Drag handles")}</span>
      <span className="font-mono text-muted-foreground">{nodes.length} {isZh ? "点" : "pts"}{selected !== null ? ` · ${isZh ? "选中" : "Selected"} ${selected + 1}` : ""}</span>
    </div>
  </>;
}