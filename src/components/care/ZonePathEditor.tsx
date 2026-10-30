import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Layer } from "leaflet";
import { MousePointer2, PenLine, Pencil, Undo2, Redo2, Spline, CornerDownRight, Plus, Trash2, Scan, Check, Link2, Unlink2, BoxSelect, SquareDashed, Wand2, ArrowLeftRight, Eraser, HelpCircle, ChevronDown, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nodeAt, sampleBoundary, smoothNode, moveNode, moveHandle, insertNode, segment, removeNodes, curveNodes, reverseNodes, simplifyNodes, type PathNode, type ZonePoint } from "@/features/location/zone-path";

type Mode = "draw" | "freehand" | "edit";
type Props = { map: LeafletMap; initial: ZonePoint[]; isZh: boolean; onChange: (boundary: ZonePoint[]) => void };

export function ZonePathEditor({ map, initial, isZh, onChange }: Props) {
  const [nodes, setNodes] = useState<PathNode[]>(() => initial.map(nodeAt));
  const [mode, setMode] = useState<Mode>(initial.length >= 3 ? "edit" : "draw");
  const [sel, setSel] = useState<number[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [multi, setMulti] = useState(false);
  const multiRef = useRef(multi); multiRef.current = multi;
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
    live.current = target; setNodes(target); setSel([]);
    if (target.length < 3) setMode("draw");
  };
  const [warn, setWarn] = useState(false);
  const toastFew = () => { setWarn(true); setTimeout(() => setWarn(false), 2200); };
  const remove = () => {
    if (!sel.length) return;
    const next = mode === "edit" ? removeNodes(nodes, sel) : nodes.filter((_, i) => !sel.includes(i));
    if (next === nodes) { toastFew(); return; }
    commit(next); setSel([]);
    if (next.length < 3) setMode("draw");
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
        html: `<span class="zone-editor-dot${sel.includes(index) ? " is-selected" : ""}" data-zone-kind="${kind}" data-zone-index="${index}" ${side ? `data-zone-side="${side}"` : ""}></span>`,
        iconSize: [28, 28], iconAnchor: [14, 14],
      });
      const paint = (next: PathNode[]) => outline.setLatLngs(sampleBoundary(next));
      nodes.forEach((node, index) => {
        const marker = add(L.marker(node.point, { icon: icon("anchor", index), draggable: mode === "edit", keyboard: true,
          title: isZh ? `点 ${index + 1}` : `Point ${index + 1}`, zIndexOffset: 1000, bubblingMouseEvents: false }));
        marker.on("click", e => {
          L.DomEvent.stopPropagation(e.originalEvent);
          if (mode === "draw" && index === 0 && nodes.length >= 3) { setMode("edit"); setSel([0]); }
          else {
            if (selectionTimer.current) clearTimeout(selectionTimer.current);
            const additive = multiRef.current || e.originalEvent.shiftKey || e.originalEvent.metaKey || e.originalEvent.ctrlKey;
            selectionTimer.current = setTimeout(() => setSel(cur => additive ? (cur.includes(index) ? cur.filter(i => i !== index) : [...cur, index]) : [index]), 260);
          }
        });
        marker.on("dblclick", e => {
          L.DomEvent.stopPropagation(e.originalEvent);
          if (selectionTimer.current) clearTimeout(selectionTimer.current);
          if (mode === "edit") { commit(smoothNode(live.current, index)); setSel([index]); }
        });
        marker.on("drag", () => {
          const p = marker.getLatLng();
          const next = nodes.map((n, i) => i === index ? moveNode(n, [p.lat, p.lng]) : n);
          paint(next);
          layers.current.forEach(l => { if (l !== outline && l !== marker) { const el = (l as any).getElement?.(); if (el) el.style.visibility = "hidden"; } });
        });
        marker.on("dragend", () => {
          const p = marker.getLatLng();
          commit(nodes.map((n, i) => i === index ? moveNode(n, [p.lat, p.lng]) : n)); setSel([index]);
        });
        const next = nodes[(index + 1) % nodes.length];
        if (mode === "edit" && next) {
          const p = segment(node, next).get(.5);
          const mid = add(L.marker([p.x, p.y], { icon: icon("mid", index), title: isZh ? "添加点" : "Add point", zIndexOffset: 500, bubblingMouseEvents: false }));
          mid.on("click", e => { L.DomEvent.stopPropagation(e.originalEvent); commit(insertNode(live.current, index)); setSel([index + 1]); });
        }
        if (mode !== "edit" || sel.length !== 1 || sel[0] !== index) return;
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
  }, [nodes, mode, sel, linked, map, isZh, commit]);

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
      if (trail.length >= 3) { commit(trail.map(nodeAt)); setMode("edit"); setSel([]); }
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
      if (e.key === "Escape") setSel([]);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a" && mode === "edit") { e.preventDefault(); setSel(nodes.map((_, i) => i)); }
      if (e.key === "Enter" && nodes.length >= 3) setMode("edit");
    };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  });
  const t = (zh: string, en: string) => isZh ? zh : en;
  const editing = mode === "edit";
  const many = sel.length > 0;
  type Tool = { id: string; Icon: typeof Plus; label: string; help: string; active?: boolean; disabled?: boolean; run: () => void };
  const modes: Tool[] = [
    { id: "draw", Icon: PenLine, label: t("描点", "Points"), help: t("在地图上逐个点击放点，点回第一个点即闭合区域。", "Tap the map to place points one by one; tap the first point to close the zone."), active: mode === "draw", run: () => { setMode("draw"); setSel([]); } },
    { id: "free", Icon: Pencil, label: t("手绘", "Freehand"), help: t("按住拖动，沿着花坛、院墙等轮廓描一圈，松手自动生成区域。", "Press and drag around a flower bed or wall; release to create the zone."), active: mode === "freehand", run: () => { setMode("freehand"); setSel([]); } },
    { id: "edit", Icon: MousePointer2, label: t("编辑", "Edit"), help: t("拖动点改位置；双击点拉出弧度手柄；按住 Shift 点击可多选。", "Drag points to move; double-click a point for curve handles; Shift-click to select several."), active: editing, disabled: nodes.length < 3, run: () => setMode("edit") },
  ];
  const history_: Tool[] = [
    { id: "undo", Icon: Undo2, label: t("撤销", "Undo"), help: t("退回上一步（Ctrl/⌘+Z）。", "Step back (Ctrl/⌘+Z)."), disabled: !history.past.length, run: () => restore("undo") },
    { id: "redo", Icon: Redo2, label: t("重做", "Redo"), help: t("恢复刚撤销的一步（Ctrl/⌘+Shift+Z）。", "Bring back what you undid (Ctrl/⌘+Shift+Z)."), disabled: !history.future.length, run: () => restore("redo") },
  ];
  const groups: { title: string; tools: Tool[] }[] = [
    { title: t("点", "Points"), tools: [
      { id: "all", Icon: BoxSelect, label: t("全选", "Select all"), help: t("选中全部点（Ctrl/⌘+A），之后可一起删除、加弧度或拉直。", "Select every point (Ctrl/⌘+A) to delete, curve or straighten them together."), disabled: !editing || !nodes.length, run: () => setSel(nodes.map((_, i) => i)) },
      { id: "multi", Icon: ListChecks, label: t("多选", "Multi-select"), help: t("打开后，每点一个点就加入选择，再点一次取消；电脑上也可按住 Shift 点击。", "When on, each tap adds a point to the selection (tap again to remove); on a computer you can also Shift-click."), active: multi, disabled: !editing, run: () => setMulti(v => !v) },
      { id: "none", Icon: SquareDashed, label: t("取消选择", "Deselect"), help: t("取消当前选中（Esc）。", "Clear the selection (Esc)."), disabled: !many, run: () => setSel([]) },
      { id: "add", Icon: Plus, label: t("加点", "Add point"), help: t("在选中点和下一个点之间加一个点，形状不变。也可直接点边上的小圆点。", "Adds a point after the selected one without changing the shape. You can also tap the small dot on an edge."), disabled: !editing || sel.length !== 1, run: () => { const i = sel[0]!; commit(insertNode(nodes, i)); setSel([i + 1]); } },
      { id: "del", Icon: Trash2, label: t("删点", "Delete"), help: t("删除选中的点（Delete 键）。区域至少要保留 3 个点；全选后删除会清空重画。", "Delete selected points (Delete key). A zone keeps at least 3 points; select all then delete to start over."), disabled: !many, run: remove },
    ] },
    { title: t("弧度", "Curves"), tools: [
      { id: "curve", Icon: Spline, label: t("加弧度", "Curve"), help: t("给选中的点拉出两个弧度手柄，拖手柄就能把边变成圆弧。", "Gives the selected points two curve handles; drag a handle to bend the edge."), disabled: !editing || !many, run: () => commit(curveNodes(nodes, sel, true)) },
      { id: "straight", Icon: CornerDownRight, label: t("拉直", "Straighten"), help: t("去掉选中点的弧度，恢复成尖角直线。", "Removes the curve from the selected points, back to a sharp corner."), disabled: !editing || !many, run: () => commit(curveNodes(nodes, sel, false)) },
      { id: "link", Icon: linked ? Link2 : Unlink2, label: linked ? t("手柄联动", "Linked") : t("手柄分开", "Split"), help: t("联动：拖一边手柄，另一边对称跟着动，弧线平滑。分开：两边各自调，可做花瓣尖角。", "Linked: both handles move together for a smooth curve. Split: move each side alone for petal-like tips."), active: linked, run: () => setLinked(v => !v) },
    ] },
    { title: t("形状", "Shape"), tools: [
      { id: "simplify", Icon: Wand2, label: t("精简", "Simplify"), help: t("去掉落在直边上的多余点，手绘后让轮廓更干净，形状基本不变。", "Removes extra points lying on straight edges — tidies freehand outlines."), disabled: nodes.length <= 3, run: () => commit(simplifyNodes(nodes)) },
      { id: "reverse", Icon: ArrowLeftRight, label: t("反向", "Reverse"), help: t("把描点顺序倒过来，形状完全不变，方便从另一头继续加点。", "Reverses the point order; the shape stays exactly the same."), disabled: nodes.length < 2, run: () => { commit(reverseNodes(nodes)); setSel([]); } },
      { id: "fit", Icon: Scan, label: t("看全貌", "Fit"), help: t("把地图缩放到正好看到整个区域。", "Zooms the map to show the whole zone."), disabled: !nodes.length, run: () => map.fitBounds(sampleBoundary(nodes), { padding: [65, 90], maxZoom: 19 }) },
      { id: "clear", Icon: Eraser, label: t("清空", "Clear"), help: t("清掉全部点重新画（可撤销）。", "Clears all points to start over (undoable)."), disabled: !nodes.length, run: () => { commit([]); setSel([]); setMode("draw"); } },
    ] },
  ];
  const iconBtn = ({ id, Icon, label, active, disabled, run }: Tool) => <Button key={id} type="button" title={label} aria-label={label} aria-pressed={active} variant={active ? "default" : "ghost"} size="icon" className="h-8 w-8 shrink-0" disabled={disabled} onClick={run}><Icon className="h-4 w-4" /></Button>;
  const hint = mode === "draw" ? t("点击放点 · 点第一个点闭合", "Tap to place · Tap first point to close")
    : mode === "freehand" ? t("按住拖动描出轮廓", "Press and drag to trace")
    : sel.length > 1 ? t("已多选 · 可一起删除、加弧度或拉直", "Several selected · Delete, curve or straighten together")
    : multi ? t("多选中 · 点点加入或取消", "Multi-select on · Tap points to add or remove") : t("双击点调弧度 · ？看每个工具说明", "Double-click for curves · ? explains every tool");
  return <>
    <div className="absolute left-2 right-2 top-2 z-[1100] max-h-[calc(100%-4.5rem)] overflow-y-auto rounded-xl border border-border bg-background/95 p-1 shadow-sm backdrop-blur-sm sm:left-auto sm:w-[400px]">
      <div role="toolbar" aria-label={t("区域绘制", "Zone drawing")} className="flex items-center gap-0.5">
        {modes.map(iconBtn)}
        <span className="mx-0.5 h-5 w-px bg-border" />
        {history_.map(iconBtn)}
        <span className="flex-1" />
        {mode !== "edit" && <Button size="sm" className="h-8 gap-1 px-2" disabled={nodes.length < 3} onClick={() => setMode("edit")}><Check className="h-3 w-3" />{t("闭合", "Close")}</Button>}
        <Button type="button" variant={showHelp ? "secondary" : "ghost"} size="icon" className="h-8 w-8" aria-label={t("工具说明", "Tool help")} aria-pressed={showHelp} onClick={() => setShowHelp(v => !v)}><HelpCircle className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={expanded ? t("收起工具", "Collapse tools") : t("展开工具", "Expand tools")} aria-expanded={expanded} onClick={() => setExpanded(v => !v)}><ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} /></Button>
      </div>
      {expanded && <div className="mt-1 flex flex-wrap gap-x-1 border-t border-border pt-1 sm:block sm:space-y-1">
        {groups.map((g, gi) => <div key={g.title} className={gi ? "border-l border-border pl-1 sm:border-l-0 sm:pl-0" : ""}>
          <p className="hidden px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:block">{g.title}</p>
          <div className="flex flex-wrap gap-0.5 sm:grid sm:grid-cols-5">
            {g.tools.map(({ id, Icon, label, active, disabled, run }) => <Button key={id} type="button" variant={active ? "secondary" : "ghost"} aria-pressed={active} disabled={disabled} onClick={run} title={label} aria-label={label} className="h-8 w-8 min-w-0 flex-col gap-0.5 p-0 text-[11px] font-normal sm:h-auto sm:w-auto sm:px-1 sm:py-1.5">
              <Icon className="h-4 w-4 shrink-0" /><span className="hidden w-full truncate sm:block">{label}</span>
            </Button>)}
          </div>
        </div>)}
      </div>}
      {showHelp && <dl className="mt-1 space-y-1.5 border-t border-border p-2 text-xs">
        {[...modes, ...history_, ...groups.flatMap(g => g.tools)].map(({ id, Icon, label, help }) => <div key={id} className="flex gap-2">
          <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <div className="min-w-0"><dt className="font-medium">{label}</dt><dd className="text-muted-foreground">{help}</dd></div>
        </div>)}
      </dl>}
    </div>
    <div className="absolute bottom-2 left-2 right-2 z-[1100] flex flex-wrap items-center justify-between gap-1 rounded-md border border-border bg-background/95 px-2 py-1.5 text-xs text-foreground shadow-sm">
      <span className={warn ? "font-medium text-destructive" : ""}>{warn ? t("区域至少要 3 个点；想重画请全选后删除", "A zone needs at least 3 points; select all and delete to redraw") : hint}</span>
      <span className="font-mono text-muted-foreground">{nodes.length} {t("点", "pts")}{many ? ` · ${t("选中", "Selected")} ${sel.length}` : ""}</span>
    </div>
  </>;
}