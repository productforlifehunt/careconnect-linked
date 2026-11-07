import { s as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { n as formatDateTime } from "./locale-DKwjQju2.mjs";
import { A as Spline, B as ShieldAlert, Dt as MapPin, En as CircleCheck, Ft as Link2, Gn as Bell, K as Scan, L as Shield, Nn as ChevronDown, O as SquareDashed, Pn as Check, Pt as ListChecks, Qn as ArrowLeftRight, S as Target, W as Send, _ as TriangleAlert, dt as Pen, et as RefreshCw, ft as PenLine, g as Undo2, gt as Navigation, h as Unlink2, it as Plus, jt as LoaderCircle, n as X, on as ExternalLink, pn as CornerDownRight, qn as Ban, r as WandSparkles, sn as Eraser, tt as Redo2, ut as Pencil, vn as Clock, vt as MousePointer2, wn as CircleQuestionMark, y as Trash2 } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { C as zoneTypeLabel, _ as isSafeZone, g as isDangerZone, h as isCustomZone, n as ZONE_TYPE_CODES, t as ZONE_TYPE } from "./source.wordpress-extended-CLFqt_H_.mjs";
import { An as useSafeZones, Et as useDeleteSafeZone, I as useCaredOneLocation, In as useSetLocationSharingFlags, L as useCaredOneLocationHistory, Ln as useShareMyLocation, Nn as useSendLocationRequest, R as useCaredOneLocationSettings, en as useLocationRequests, g as useAcknowledgeAllAlerts, h as useAcknowledgeAlert, hr as useUpdateSafeZone, jt as useEnableEmergencyLocationPermission, kn as useSafeZoneAlerts, nn as useLocationSharingFlags, ot as useCreateSafeZone, w as useCancelLocationRequest } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-B2Az5zRn.mjs";
import { t as Switch } from "./switch-Coli7fra.mjs";
import { n as getCurrentPosition } from "./geolocation-BbrvI7XV.mjs";
import { t as Slider } from "./slider-D5YvUsBT.mjs";
import { t as Bezier } from "../_libs/bezier-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/LocationCard-D8ikg-9-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var nodeAt = (point) => ({
	point,
	incoming: null,
	outgoing: null
});
var xy = (p) => ({
	x: p[0],
	y: p[1]
});
var pair = (p) => [p.x, p.y];
function segment(a, b) {
	return new Bezier(xy(a.point), xy(a.outgoing ?? a.point), xy(b.incoming ?? b.point), xy(b.point));
}
function sampleBoundary(nodes) {
	if (nodes.length < 3) return nodes.map((n) => n.point);
	return nodes.flatMap((a, i) => {
		const b = nodes[(i + 1) % nodes.length];
		if (!b || !a.outgoing && !b.incoming) return [a.point];
		return segment(a, b).getLUT(32).slice(0, -1).map(pair);
	});
}
function smoothNode(nodes, i) {
	const n = nodes[i];
	const before = nodes[(i - 1 + nodes.length) % nodes.length];
	const after = nodes[(i + 1) % nodes.length];
	if (!n || !before || !after) return nodes;
	const delta = [(after.point[0] - before.point[0]) / 6, (after.point[1] - before.point[1]) / 6];
	return nodes.map((p, j) => j !== i ? p : {
		...p,
		incoming: [p.point[0] - delta[0], p.point[1] - delta[1]],
		outgoing: [p.point[0] + delta[0], p.point[1] + delta[1]]
	});
}
function moveNode(n, point) {
	const shift = (p) => p ? [p[0] + point[0] - n.point[0], p[1] + point[1] - n.point[1]] : null;
	return {
		point,
		incoming: shift(n.incoming),
		outgoing: shift(n.outgoing)
	};
}
function moveHandle(n, side, point, linked) {
	const other = side === "incoming" ? "outgoing" : "incoming";
	return {
		...n,
		[side]: point,
		...linked ? { [other]: [2 * n.point[0] - point[0], 2 * n.point[1] - point[1]] } : {}
	};
}
function insertNode(nodes, i) {
	const a = nodes[i];
	const b = nodes[(i + 1) % nodes.length];
	if (!a || !b) return nodes;
	if (!a.outgoing && !b.incoming) {
		const copy = [...nodes];
		copy.splice(i + 1, 0, nodeAt([(a.point[0] + b.point[0]) / 2, (a.point[1] + b.point[1]) / 2]));
		return copy;
	}
	const { left, right } = segment(a, b).split(.5);
	const l = left.points;
	const r = right.points;
	if (!l[1] || !l[2] || !l[3] || !r[1] || !r[2]) return nodes;
	const leftOut = pair(l[1]);
	const rightIn = pair(r[2]);
	const copy = nodes.map((n, j) => j === i ? {
		...n,
		outgoing: leftOut
	} : j === (i + 1) % nodes.length ? {
		...n,
		incoming: rightIn
	} : n);
	copy.splice(i + 1, 0, {
		point: pair(l[3]),
		incoming: pair(l[2]),
		outgoing: pair(r[1])
	});
	return copy;
}
function removeNodes(nodes, indices) {
	const drop = new Set(indices);
	const next = nodes.filter((_, i) => !drop.has(i));
	return next.length >= 3 || next.length === 0 ? next : nodes;
}
/** Curve or straighten several anchors at once. */
function curveNodes(nodes, indices, curved) {
	let next = nodes;
	for (const i of indices) next = curved ? smoothNode(next, i) : next.map((n, j) => j === i ? {
		...n,
		incoming: null,
		outgoing: null
	} : n);
	return next;
}
/** Reverse drawing direction while keeping the exact same shape. */
function reverseNodes(nodes) {
	return [...nodes].reverse().map((n) => ({
		point: n.point,
		incoming: n.outgoing,
		outgoing: n.incoming
	}));
}
/** Drop anchors that sit almost on the straight line between their neighbours (cleans up freehand tracing). */
function simplifyNodes(nodes, tolerance = .08) {
	if (nodes.length <= 3) return nodes;
	const keep = nodes.filter((n, i) => {
		if (n.incoming || n.outgoing) return true;
		const a = nodes[(i - 1 + nodes.length) % nodes.length].point;
		const b = nodes[(i + 1) % nodes.length].point;
		const p = n.point;
		const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
		if (!len) return false;
		return Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / len / len > tolerance;
	});
	return keep.length >= 3 ? keep : nodes;
}
function ZonePathEditor({ map, initial, isZh, onChange }) {
	const [nodes, setNodes] = (0, import_react.useState)(() => initial.map(nodeAt));
	const [mode, setMode] = (0, import_react.useState)(initial.length >= 3 ? "edit" : "draw");
	const [sel, setSel] = (0, import_react.useState)([]);
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	const [showHelp, setShowHelp] = (0, import_react.useState)(false);
	const [multi, setMulti] = (0, import_react.useState)(false);
	const multiRef = (0, import_react.useRef)(multi);
	multiRef.current = multi;
	const [linked, setLinked] = (0, import_react.useState)(true);
	const [history, setHistory] = (0, import_react.useState)({
		past: [],
		future: []
	});
	const layers = (0, import_react.useRef)([]);
	const live = (0, import_react.useRef)(nodes);
	const selectionTimer = (0, import_react.useRef)(null);
	const changeRef = (0, import_react.useRef)(onChange);
	changeRef.current = onChange;
	const commit = (0, import_react.useCallback)((next) => {
		const previous = live.current;
		setHistory((h) => ({
			past: [...h.past.slice(-49), previous],
			future: []
		}));
		live.current = next;
		setNodes(next);
	}, []);
	(0, import_react.useEffect)(() => {
		changeRef.current(sampleBoundary(nodes));
	}, [nodes]);
	const restore = (direction) => {
		const source = direction === "undo" ? history.past : history.future;
		const target = source[source.length - 1];
		if (!target) return;
		setHistory(direction === "undo" ? {
			past: history.past.slice(0, -1),
			future: [...history.future, live.current]
		} : {
			past: [...history.past, live.current],
			future: history.future.slice(0, -1)
		});
		live.current = target;
		setNodes(target);
		setSel([]);
		if (target.length < 3) setMode("draw");
	};
	const [warn, setWarn] = (0, import_react.useState)(false);
	const toastFew = () => {
		setWarn(true);
		setTimeout(() => setWarn(false), 2200);
	};
	const remove = () => {
		if (!sel.length) return;
		const next = mode === "edit" ? removeNodes(nodes, sel) : nodes.filter((_, i) => !sel.includes(i));
		if (next === nodes) {
			toastFew();
			return;
		}
		commit(next);
		setSel([]);
		if (next.length < 3) setMode("draw");
	};
	(0, import_react.useEffect)(() => {
		let active = true;
		const render = async () => {
			const L = await import("../_libs/_29.mjs").then((m) => /* @__PURE__ */ __toESM(m.default));
			if (!active) return;
			layers.current.forEach((l) => l.remove());
			layers.current = [];
			const add = (layer) => {
				layer.addTo(map);
				layers.current.push(layer);
				return layer;
			};
			const tokens = getComputedStyle(map.getContainer());
			const color = `hsl(${tokens.getPropertyValue("--primary")})`;
			const selectedColor = `hsl(${tokens.getPropertyValue("--foreground")})`;
			const boundary = sampleBoundary(nodes);
			const outline = nodes.length >= 3 && mode === "edit" ? add(L.polygon(boundary, {
				color,
				weight: 2.5,
				fillOpacity: .14,
				interactive: false
			})) : add(L.polyline(boundary, {
				color,
				weight: 2.5,
				interactive: false
			}));
			const icon = (kind, index, side) => L.divIcon({
				className: `zone-editor-marker zone-editor-${kind}`,
				html: `<span class="zone-editor-dot${sel.includes(index) ? " is-selected" : ""}" data-zone-kind="${kind}" data-zone-index="${index}" ${side ? `data-zone-side="${side}"` : ""}></span>`,
				iconSize: [28, 28],
				iconAnchor: [14, 14]
			});
			const paint = (next) => outline.setLatLngs(sampleBoundary(next));
			nodes.forEach((node, index) => {
				const marker = add(L.marker(node.point, {
					icon: icon("anchor", index),
					draggable: mode === "edit",
					keyboard: true,
					title: isZh ? `点 ${index + 1}` : `Point ${index + 1}`,
					zIndexOffset: 1e3,
					bubblingMouseEvents: false
				}));
				marker.on("click", (e) => {
					L.DomEvent.stopPropagation(e.originalEvent);
					if (mode === "draw" && index === 0 && nodes.length >= 3) {
						setMode("edit");
						setSel([0]);
					} else {
						if (selectionTimer.current) clearTimeout(selectionTimer.current);
						const additive = multiRef.current || e.originalEvent.shiftKey || e.originalEvent.metaKey || e.originalEvent.ctrlKey;
						selectionTimer.current = setTimeout(() => setSel((cur) => additive ? cur.includes(index) ? cur.filter((i) => i !== index) : [...cur, index] : [index]), 260);
					}
				});
				marker.on("dblclick", (e) => {
					L.DomEvent.stopPropagation(e.originalEvent);
					if (selectionTimer.current) clearTimeout(selectionTimer.current);
					if (mode === "edit") {
						commit(smoothNode(live.current, index));
						setSel([index]);
					}
				});
				marker.on("drag", () => {
					const p = marker.getLatLng();
					const next = nodes.map((n, i) => i === index ? moveNode(n, [p.lat, p.lng]) : n);
					paint(next);
					layers.current.forEach((l) => {
						if (l !== outline && l !== marker) {
							const el = l.getElement?.();
							if (el) el.style.visibility = "hidden";
						}
					});
				});
				marker.on("dragend", () => {
					const p = marker.getLatLng();
					commit(nodes.map((n, i) => i === index ? moveNode(n, [p.lat, p.lng]) : n));
					setSel([index]);
				});
				const next = nodes[(index + 1) % nodes.length];
				if (mode === "edit" && next) {
					const p = segment(node, next).get(.5);
					add(L.marker([p.x, p.y], {
						icon: icon("mid", index),
						title: isZh ? "添加点" : "Add point",
						zIndexOffset: 500,
						bubblingMouseEvents: false
					})).on("click", (e) => {
						L.DomEvent.stopPropagation(e.originalEvent);
						commit(insertNode(live.current, index));
						setSel([index + 1]);
					});
				}
				if (mode !== "edit" || sel.length !== 1 || sel[0] !== index) return;
				for (const side of ["incoming", "outgoing"]) {
					const point = node[side];
					if (!point) continue;
					const line = add(L.polyline([node.point, point], {
						color: selectedColor,
						weight: 1,
						dashArray: "3 4",
						interactive: false
					}));
					const handle = add(L.marker(point, {
						icon: icon("handle", index, side),
						draggable: true,
						title: isZh ? "拖动调整弧度" : "Drag to adjust curve",
						zIndexOffset: 1500,
						bubblingMouseEvents: false
					}));
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
		return () => {
			active = false;
			layers.current.forEach((l) => l.remove());
			layers.current = [];
		};
	}, [
		nodes,
		mode,
		sel,
		linked,
		map,
		isZh,
		commit
	]);
	(0, import_react.useEffect)(() => {
		map.doubleClickZoom.disable();
		if (mode === "edit") map.dragging.enable();
		else map.dragging.disable();
		const el = map.getContainer();
		el.style.cursor = mode === "edit" ? "" : "crosshair";
		let trail = [];
		let pointerId = null;
		const toPoint = (e) => {
			const p = map.mouseEventToLatLng(e);
			return [p.lat, p.lng];
		};
		const click = (e) => {
			if (mode === "draw") commit([...live.current, nodeAt([e.latlng.lat, e.latlng.lng])]);
		};
		const down = (e) => {
			if (mode !== "freehand" || e.target.closest(".leaflet-control,.zone-editor-marker")) return;
			pointerId = e.pointerId;
			trail = [toPoint(e)];
			el.setPointerCapture(e.pointerId);
			e.preventDefault();
		};
		const move = (e) => {
			if (pointerId !== e.pointerId) return;
			const p = toPoint(e);
			const last = trail[trail.length - 1];
			if (!last || map.latLngToContainerPoint(p).distanceTo(map.latLngToContainerPoint(last)) >= 8) trail.push(p);
		};
		const up = (e) => {
			if (pointerId !== e.pointerId) return;
			pointerId = null;
			if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
			if (trail.length >= 3) {
				commit(trail.map(nodeAt));
				setMode("edit");
				setSel([]);
			}
			trail = [];
		};
		map.on("click", click);
		el.addEventListener("pointerdown", down);
		el.addEventListener("pointermove", move);
		el.addEventListener("pointerup", up);
		el.addEventListener("pointercancel", up);
		return () => {
			map.off("click", click);
			map.dragging.enable();
			map.doubleClickZoom.enable();
			el.style.cursor = "";
			el.removeEventListener("pointerdown", down);
			el.removeEventListener("pointermove", move);
			el.removeEventListener("pointerup", up);
			el.removeEventListener("pointercancel", up);
		};
	}, [
		mode,
		map,
		commit
	]);
	(0, import_react.useEffect)(() => {
		const key = (e) => {
			if (e.target.closest("input,textarea,[contenteditable=true]")) return;
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
				e.preventDefault();
				restore(e.shiftKey ? "redo" : "undo");
			}
			if (e.key === "Delete" || e.key === "Backspace") {
				e.preventDefault();
				remove();
			}
			if (e.key === "Escape") setSel([]);
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a" && mode === "edit") {
				e.preventDefault();
				setSel(nodes.map((_, i) => i));
			}
			if (e.key === "Enter" && nodes.length >= 3) setMode("edit");
		};
		window.addEventListener("keydown", key);
		return () => window.removeEventListener("keydown", key);
	});
	const t = (zh, en) => isZh ? zh : en;
	const editing = mode === "edit";
	const many = sel.length > 0;
	const modes = [
		{
			id: "draw",
			Icon: PenLine,
			label: t("描点", "Points"),
			help: t("在地图上逐个点击放点，点回第一个点即闭合区域。", "Tap the map to place points one by one; tap the first point to close the zone."),
			active: mode === "draw",
			run: () => {
				setMode("draw");
				setSel([]);
			}
		},
		{
			id: "free",
			Icon: Pencil,
			label: t("手绘", "Freehand"),
			help: t("按住拖动，沿着花坛、院墙等轮廓描一圈，松手自动生成区域。", "Press and drag around a flower bed or wall; release to create the zone."),
			active: mode === "freehand",
			run: () => {
				setMode("freehand");
				setSel([]);
			}
		},
		{
			id: "edit",
			Icon: MousePointer2,
			label: t("编辑", "Edit"),
			help: t("拖动点改位置；双击点拉出弧度手柄；按住 Shift 点击可多选。", "Drag points to move; double-click a point for curve handles; Shift-click to select several."),
			active: editing,
			disabled: nodes.length < 3,
			run: () => setMode("edit")
		}
	];
	const history_ = [{
		id: "undo",
		Icon: Undo2,
		label: t("撤销", "Undo"),
		help: t("退回上一步（Ctrl/⌘+Z）。", "Step back (Ctrl/⌘+Z)."),
		disabled: !history.past.length,
		run: () => restore("undo")
	}, {
		id: "redo",
		Icon: Redo2,
		label: t("重做", "Redo"),
		help: t("恢复刚撤销的一步（Ctrl/⌘+Shift+Z）。", "Bring back what you undid (Ctrl/⌘+Shift+Z)."),
		disabled: !history.future.length,
		run: () => restore("redo")
	}];
	const groups = [
		{
			title: t("点", "Points"),
			tools: [
				{
					id: "all",
					Icon: SquareDashed,
					label: t("全选", "Select all"),
					help: t("选中全部点（Ctrl/⌘+A），之后可一起删除、加弧度或拉直。", "Select every point (Ctrl/⌘+A) to delete, curve or straighten them together."),
					disabled: !editing || !nodes.length,
					run: () => setSel(nodes.map((_, i) => i))
				},
				{
					id: "multi",
					Icon: ListChecks,
					label: t("多选", "Multi-select"),
					help: t("打开后，每点一个点就加入选择，再点一次取消；电脑上也可按住 Shift 点击。", "When on, each tap adds a point to the selection (tap again to remove); on a computer you can also Shift-click."),
					active: multi,
					disabled: !editing,
					run: () => setMulti((v) => !v)
				},
				{
					id: "none",
					Icon: SquareDashed,
					label: t("取消选择", "Deselect"),
					help: t("取消当前选中（Esc）。", "Clear the selection (Esc)."),
					disabled: !many,
					run: () => setSel([])
				},
				{
					id: "add",
					Icon: Plus,
					label: t("加点", "Add point"),
					help: t("在选中点和下一个点之间加一个点，形状不变。也可直接点边上的小圆点。", "Adds a point after the selected one without changing the shape. You can also tap the small dot on an edge."),
					disabled: !editing || sel.length !== 1,
					run: () => {
						const i = sel[0];
						commit(insertNode(nodes, i));
						setSel([i + 1]);
					}
				},
				{
					id: "del",
					Icon: Trash2,
					label: t("删点", "Delete"),
					help: t("删除选中的点（Delete 键）。区域至少要保留 3 个点；全选后删除会清空重画。", "Delete selected points (Delete key). A zone keeps at least 3 points; select all then delete to start over."),
					disabled: !many,
					run: remove
				}
			]
		},
		{
			title: t("弧度", "Curves"),
			tools: [
				{
					id: "curve",
					Icon: Spline,
					label: t("加弧度", "Curve"),
					help: t("给选中的点拉出两个弧度手柄，拖手柄就能把边变成圆弧。", "Gives the selected points two curve handles; drag a handle to bend the edge."),
					disabled: !editing || !many,
					run: () => commit(curveNodes(nodes, sel, true))
				},
				{
					id: "straight",
					Icon: CornerDownRight,
					label: t("拉直", "Straighten"),
					help: t("去掉选中点的弧度，恢复成尖角直线。", "Removes the curve from the selected points, back to a sharp corner."),
					disabled: !editing || !many,
					run: () => commit(curveNodes(nodes, sel, false))
				},
				{
					id: "link",
					Icon: linked ? Link2 : Unlink2,
					label: linked ? t("手柄联动", "Linked") : t("手柄分开", "Split"),
					help: t("联动：拖一边手柄，另一边对称跟着动，弧线平滑。分开：两边各自调，可做花瓣尖角。", "Linked: both handles move together for a smooth curve. Split: move each side alone for petal-like tips."),
					active: linked,
					run: () => setLinked((v) => !v)
				}
			]
		},
		{
			title: t("形状", "Shape"),
			tools: [
				{
					id: "simplify",
					Icon: WandSparkles,
					label: t("精简", "Simplify"),
					help: t("去掉落在直边上的多余点，手绘后让轮廓更干净，形状基本不变。", "Removes extra points lying on straight edges — tidies freehand outlines."),
					disabled: nodes.length <= 3,
					run: () => commit(simplifyNodes(nodes))
				},
				{
					id: "reverse",
					Icon: ArrowLeftRight,
					label: t("反向", "Reverse"),
					help: t("把描点顺序倒过来，形状完全不变，方便从另一头继续加点。", "Reverses the point order; the shape stays exactly the same."),
					disabled: nodes.length < 2,
					run: () => {
						commit(reverseNodes(nodes));
						setSel([]);
					}
				},
				{
					id: "fit",
					Icon: Scan,
					label: t("看全貌", "Fit"),
					help: t("把地图缩放到正好看到整个区域。", "Zooms the map to show the whole zone."),
					disabled: !nodes.length,
					run: () => map.fitBounds(sampleBoundary(nodes), {
						padding: [65, 90],
						maxZoom: 19
					})
				},
				{
					id: "clear",
					Icon: Eraser,
					label: t("清空", "Clear"),
					help: t("清掉全部点重新画（可撤销）。", "Clears all points to start over (undoable)."),
					disabled: !nodes.length,
					run: () => {
						commit([]);
						setSel([]);
						setMode("draw");
					}
				}
			]
		}
	];
	const iconBtn = ({ id, Icon, label, active, disabled, run }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		title: label,
		"aria-label": label,
		"aria-pressed": active,
		variant: active ? "default" : "ghost",
		size: "icon",
		className: "h-8 w-8 shrink-0",
		disabled,
		onClick: run,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
	}, id);
	const hint = mode === "draw" ? t("点击放点 · 点第一个点闭合", "Tap to place · Tap first point to close") : mode === "freehand" ? t("按住拖动描出轮廓", "Press and drag to trace") : sel.length > 1 ? t("已多选 · 可一起删除、加弧度或拉直", "Several selected · Delete, curve or straighten together") : multi ? t("多选中 · 点点加入或取消", "Multi-select on · Tap points to add or remove") : t("双击点调弧度 · ？看每个工具说明", "Double-click for curves · ? explains every tool");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/care/ZonePathEditor.tsx:212:5:bc94069d20d3e88492b63a6cc406b1e0a56d6c549e87a1590480ebad648997e4:1",
		className: "absolute left-2 right-2 top-2 z-[1100] max-h-[calc(100%-4.5rem)] overflow-y-auto rounded-xl border border-border bg-background/95 p-1 shadow-sm backdrop-blur-sm sm:left-auto sm:w-[400px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/care/ZonePathEditor.tsx:213:7:573dde582a155c5a0e4b8b87d9bad3d08c4932b5fc6879e259b635837be57eab:1",
				role: "toolbar",
				"aria-label": t("区域绘制", "Zone drawing"),
				className: "flex items-center gap-0.5",
				children: [
					modes.map(iconBtn),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "components/care/ZonePathEditor.tsx:215:9:36e2e9596b93aa80b0116c81e340f53983d8b60f435fc97c7e69e897074233cd:1",
						className: "mx-0.5 h-5 w-px bg-border"
					}),
					history_.map(iconBtn),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "components/care/ZonePathEditor.tsx:217:9:8a999e6ce9f8e23acc62b5d2bb60262075c94fd9e853308f337f3936687bb3fc:1",
						className: "flex-1"
					}),
					mode !== "edit" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "h-8 gap-1 px-2",
						disabled: nodes.length < 3,
						onClick: () => setMode("edit"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" }), t("闭合", "Close")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: showHelp ? "secondary" : "ghost",
						size: "icon",
						className: "h-8 w-8",
						"aria-label": t("工具说明", "Tool help"),
						"aria-pressed": showHelp,
						onClick: () => setShowHelp((v) => !v),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "icon",
						className: "h-8 w-8",
						"aria-label": expanded ? t("收起工具", "Collapse tools") : t("展开工具", "Expand tools"),
						"aria-expanded": expanded,
						onClick: () => setExpanded((v) => !v),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}` })
					})
				]
			}),
			expanded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/care/ZonePathEditor.tsx:222:20:00eb751b57ac998981bad9b128ba55451675fc95a6cfb5154e3a66cddfd8d20c:1",
				className: "mt-1 flex flex-wrap gap-x-1 border-t border-border pt-1 sm:block sm:space-y-1",
				children: groups.map((g, gi) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/care/ZonePathEditor.tsx:223:32:997fe3903e8318344f8006dd467fd656eb68e7afe7b57119ee3ec21bc54a4a16:1",
					className: gi ? "border-l border-border pl-1 sm:border-l-0 sm:pl-0" : "",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/care/ZonePathEditor.tsx:224:11:7fb36172f0fe4c56029477e455287a858478bdc4c6454f249f370b5ce64d1d01:1",
						className: "hidden px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:block",
						children: g.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/care/ZonePathEditor.tsx:225:11:32d87ee5fee929bb74c57e4618efd538e309c37861a589f47f0c4bbae5d149c6:1",
						className: "flex flex-wrap gap-0.5 sm:grid sm:grid-cols-5",
						children: g.tools.map(({ id, Icon, label, active, disabled, run }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: active ? "secondary" : "ghost",
							"aria-pressed": active,
							disabled,
							onClick: run,
							title: label,
							"aria-label": label,
							className: "h-8 w-8 min-w-0 flex-col gap-0.5 p-0 text-[11px] font-normal sm:h-auto sm:w-auto sm:px-1 sm:py-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "components/care/ZonePathEditor.tsx:227:52:65460b3ede762ca6b91a72e062c0577f49bb0d87a095974597a71f1769f3869a:1",
								className: "hidden w-full truncate sm:block",
								children: label
							})]
						}, id))
					})]
				}, g.title))
			}),
			showHelp && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				"data-inspector-source": "components/care/ZonePathEditor.tsx:232:20:43cec94e050ab7df80b4e2a418fcc88b9c3cfe9578f97b72eff405d4656341f8:1",
				className: "mt-1 space-y-1.5 border-t border-border p-2 text-xs",
				children: [
					...modes,
					...history_,
					...groups.flatMap((g) => g.tools)
				].map(({ id, Icon, label, help }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/care/ZonePathEditor.tsx:233:102:57ba10ae4fc5fc42a732d5f5d555913b6b2465b45ea8ab186f73efa61348dcd7:1",
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/care/ZonePathEditor.tsx:235:11:8f969c96756f67c43309ed0099bf3fcfc44c68a85e1a10e9160c0f89ca71fa66:1",
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							"data-inspector-source": "components/care/ZonePathEditor.tsx:235:36:8f969c96756f67c43309ed0099bf3fcfc44c68a85e1a10e9160c0f89ca71fa66:1",
							className: "font-medium",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							"data-inspector-source": "components/care/ZonePathEditor.tsx:235:76:8f969c96756f67c43309ed0099bf3fcfc44c68a85e1a10e9160c0f89ca71fa66:1",
							className: "text-muted-foreground",
							children: help
						})]
					})]
				}, id))
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/care/ZonePathEditor.tsx:239:5:8ee3abcbd1bc95e83f6b24f4b06185e0976379e956149a34cdc5c65a813e8afe:1",
		className: "absolute bottom-2 left-2 right-2 z-[1100] flex flex-wrap items-center justify-between gap-1 rounded-md border border-border bg-background/95 px-2 py-1.5 text-xs text-foreground shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"data-inspector-source": "components/care/ZonePathEditor.tsx:240:7:ee1403ec37f4e5e65deec22537756c5c106ddd3f066039a3b96a23143461d47d:1",
			className: warn ? "font-medium text-destructive" : "",
			children: warn ? t("区域至少要 3 个点；想重画请全选后删除", "A zone needs at least 3 points; select all and delete to redraw") : hint
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			"data-inspector-source": "components/care/ZonePathEditor.tsx:241:7:b106960021c58e07b85d417124ca6fe315a4dc4988d93b6534d73989c95b32b8:1",
			className: "font-mono text-muted-foreground",
			children: [
				nodes.length,
				" ",
				t("点", "pts"),
				many ? ` · ${t("选中", "Selected")} ${sel.length}` : ""
			]
		})]
	})] });
}
function EmergencySharingToggle({ allowed, pending, isZh, onSave }) {
	const [next, setNext] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const busy = pending || saving;
	const confirm = async () => {
		if (next === null || busy) return;
		setSaving(true);
		try {
			await onSave(next);
			setNext(null);
		} catch {} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/care/EmergencySharingToggle.tsx:31:5:a077131079edd087813c8e2d4cda2880f37770340250a81780605fe53d55b9ce:1",
		className: "flex items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: "emergency-sharing-toggle",
			children: isZh ? "紧急共享模式" : "Emergency sharing mode"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			id: "emergency-sharing-toggle",
			checked: allowed,
			disabled: busy,
			onCheckedChange: setNext
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open: next !== null,
		onOpenChange: (open) => {
			if (!open && !busy) setNext(null);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
			className: "w-[calc(100%-2rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: next ? isZh ? "开启紧急共享模式？" : "Turn on emergency sharing mode?" : isZh ? "关闭紧急共享模式？" : "Turn off emergency sharing mode?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: next ? isZh ? "开启后，护理者可以发送不需要对方确认的紧急位置请求。" : "Caregivers will be able to send emergency location requests without the cared one's confirmation." : isZh ? "关闭会关闭紧急共享模式，请确认其他护理者暂时不需要此功能。" : "Turning this off will disable emergency sharing mode. Please confirm that other caregivers do not need this feature for now." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
				disabled: busy,
				children: isZh ? "取消" : "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: next ? "default" : "destructive",
				disabled: busy,
				onClick: confirm,
				children: busy ? isZh ? "正在保存…" : "Saving…" : next ? isZh ? "确认开启" : "Confirm turn on" : isZh ? "确认关闭" : "Confirm turn off"
			})] })]
		})
	})] });
}
var LocationCard_exports = /* @__PURE__ */ __exportAll({ default: () => LocationCard });
if (typeof document !== "undefined" && !document.getElementById("leaflet-css")) {
	const link = document.createElement("link");
	link.id = "leaflet-css";
	link.rel = "stylesheet";
	link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
	document.head.appendChild(link);
}
if (typeof document !== "undefined" && !document.getElementById("loc-pulse-kf")) {
	const s = document.createElement("style");
	s.id = "loc-pulse-kf";
	s.textContent = `@keyframes locPulse{0%,100%{box-shadow:0 0 0 3px rgba(16,185,129,.3)}50%{box-shadow:0 0 0 9px rgba(16,185,129,0)}}`;
	document.head.appendChild(s);
}
var L = null;
async function getL() {
	if (L) return L;
	L = await import("../_libs/_29.mjs").then((m) => /* @__PURE__ */ __toESM(m.default));
	delete L.Icon.Default.prototype._getIconUrl;
	L.Icon.Default.mergeOptions({
		iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
		iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
		shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
	});
	return L;
}
function haversine(lat1, lon1, lat2, lon2) {
	const R = 6371e3;
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function pointInPolygon(lat, lng, polygon) {
	let inside = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const [xi, yi] = polygon[i];
		const [xj, yj] = polygon[j];
		if (yi > lat !== yj > lat && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
	}
	return inside;
}
function chaikinPerVertex(points, radii) {
	if (points.length < 3) return points;
	const maxRadius = Math.max(...radii, 0);
	if (maxRadius === 0) return points;
	const iters = Math.ceil(maxRadius);
	let pts = [...points];
	let rads = [...radii];
	for (let iter = 0; iter < iters; iter++) {
		const strength = (r) => Math.min(1, Math.max(0, r - iter));
		const next = [];
		const nextR = [];
		for (let i = 0; i < pts.length; i++) {
			const j = (i + 1) % pts.length;
			const si = strength(rads[i]);
			const sj = strength(rads[j]);
			const [xi, yi] = pts[i];
			const [xj, yj] = pts[j];
			if (si >= 1) {
				next.push([xi * .75 + xj * .25, yi * .75 + yj * .25]);
				next.push([xi * .25 + xj * .75, yi * .25 + yj * .75]);
				nextR.push(rads[i], rads[j]);
			} else if (si > 0) {
				const q1 = [xi * .75 + xj * .25, yi * .75 + yj * .25];
				const q2 = [xi * .25 + xj * .75, yi * .25 + yj * .75];
				next.push([xi * (1 - si) + q1[0] * si, yi * (1 - si) + q1[1] * si]);
				if (sj > 0) {
					next.push([xj * (1 - sj) + q2[0] * sj, yj * (1 - sj) + q2[1] * sj]);
					nextR.push(rads[i], rads[j]);
				} else nextR.push(rads[i]);
			} else {
				next.push([xi, yi]);
				nextR.push(rads[i]);
				if (sj > 0) {
					next.push([xi * .25 + xj * .75, yi * .25 + yj * .75]);
					nextR.push(rads[j]);
				}
			}
		}
		pts = next;
		rads = nextR;
	}
	return pts;
}
function centroid(points) {
	return [points.reduce((s, p) => s + p[0], 0) / points.length, points.reduce((s, p) => s + p[1], 0) / points.length];
}
function zoneColor(code) {
	if (isDangerZone(code)) return "#EF4444";
	if (isSafeZone(code)) return "#10B981";
	if (isCustomZone(code)) return "#3B82F6";
	return "#6B7280";
}
/** Colour actually painted for a zone: a custom zone may carry its own colour (a59). */
function zoneFill(code, storedColor) {
	if (isCustomZone(code) && typeof storedColor === "string" && /^#[0-9a-fA-F]{6}$/.test(storedColor)) return storedColor;
	return zoneColor(code);
}
/** Palette offered for custom zones — includes the Safe green and Danger red. */
var CUSTOM_ZONE_COLORS = [
	"#10B981",
	"#EF4444",
	"#3B82F6",
	"#F59E0B",
	"#8B5CF6",
	"#EC4899",
	"#0EA5E9",
	"#6B7280"
];
function zoneIcon(code) {
	if (isDangerZone(code)) return Ban;
	if (isSafeZone(code)) return Shield;
	return Target;
}
var DAYS = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Sun"
];
/** "08:00", an ISO datetime, or an RFC 5545 "…T080000" value → minutes after local midnight. */
function toMinutes(v) {
	const str = String(v ?? "").trim();
	if (!str) return null;
	let m = /^(\d{1,2}):(\d{2})/.exec(str);
	if (m) return Number(m[1]) * 60 + Number(m[2]);
	m = /T(\d{2})(\d{2})(\d{2})?(Z)?$/.exec(str);
	if (m && !str.includes("-")) {
		if (m[4]) {
			const d = new Date(Date.UTC(2e3, 0, 1, Number(m[1]), Number(m[2])));
			return d.getHours() * 60 + d.getMinutes();
		}
		return Number(m[1]) * 60 + Number(m[2]);
	}
	const d = new Date(str);
	if (!Number.isNaN(d.getTime())) return d.getHours() * 60 + d.getMinutes();
	return null;
}
function hhmm(v, fallback) {
	const n = toMinutes(v);
	if (n == null) return fallback;
	return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}
function isZoneActive(zone) {
	if (!zone.schedule_enabled) return true;
	const now = /* @__PURE__ */ new Date();
	const dayName = [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	][now.getDay()];
	if (Array.isArray(zone.schedule_days) && zone.schedule_days.length && !zone.schedule_days.includes(dayName)) return false;
	const cur = now.getHours() * 60 + now.getMinutes();
	const s = toMinutes(zone.schedule_start_time);
	const e = toMinutes(zone.schedule_end_time);
	if (s == null || e == null) return true;
	return s <= e ? cur >= s && cur <= e : cur >= s || cur <= e;
}
function checkZoneBreach(zone, lat, lng) {
	if (!isZoneActive(zone)) return {
		breached: false,
		distance: 0,
		inside: false
	};
	let inside = false;
	let distance = 0;
	if (String(zone.shape_type || "").toLowerCase() === "polygon" && zone.polygon_points?.length >= 3) {
		const pts = zone.polygon_points;
		inside = pointInPolygon(lat, lng, zone.corner_radius?.some((r) => r > 0) ? chaikinPerVertex(pts, zone.corner_radius) : pts);
		distance = haversine(lat, lng, zone.latitude, zone.longitude);
	} else {
		distance = haversine(lat, lng, zone.latitude, zone.longitude);
		inside = distance <= (zone.radius_meters || 200);
	}
	return {
		breached: isDangerZone(zone.zone_type) ? inside : isSafeZone(zone.zone_type) ? !inside : inside ? !!zone.notify_on_enter : !!zone.notify_on_exit,
		distance: Math.round(distance),
		inside
	};
}
var defaultForm = () => ({
	zone_type: ZONE_TYPE.SAFE,
	shape_type: "radius",
	color: "#3B82F6",
	latitude: "",
	longitude: "",
	radius: 200,
	polygon_points: [],
	corner_radius: [],
	description: "",
	notify_on_enter: true,
	notify_on_exit: true,
	schedule_enabled: false,
	schedule_start_time: "08:00",
	schedule_end_time: "20:00",
	schedule_days: []
});
function LocationCard({ caredOneId, caredOneName, readOnly = false }) {
	const { toast } = useToast();
	const { i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const [activeTab, setActiveTab] = (0, import_react.useState)("location");
	const { data: currentLocation, refetch: refetchLocation, isLoading: loadingLocation } = useCaredOneLocation(caredOneId);
	const managementSubject = readOnly ? null : caredOneId;
	const { data: locationHistory, refetch: refetchHistory } = useCaredOneLocationHistory(managementSubject);
	const { data: zones, refetch: refetchZones } = useSafeZones(caredOneId);
	const { data: alerts, refetch: refetchAlerts } = useSafeZoneAlerts(managementSubject);
	const { data: locationRequests, refetch: refetchRequests } = useLocationRequests(managementSubject);
	const { data: locationSettings, refetch: refetchSettings } = useCaredOneLocationSettings(managementSubject);
	const { data: flags, refetch: refetchFlags, isLoading: flagsLoading, isError: flagsError } = useLocationSharingFlags(managementSubject);
	const enableEmergency = useEnableEmergencyLocationPermission();
	const setSharingFlags = useSetLocationSharingFlags();
	const saveEmergencySharing = async (allowed) => {
		try {
			if (allowed) await enableEmergency.mutateAsync(caredOneId);
			else await setSharingFlags.mutateAsync({
				userId: caredOneId,
				emergencyAllowed: false
			});
			setEmergencyConfirm(false);
			await refetchFlags();
			toast({ title: allowed ? isZh ? "已开启紧急共享模式" : "Emergency sharing mode on" : isZh ? "已关闭紧急共享模式" : "Emergency sharing mode off" });
		} catch (e) {
			toast({
				title: isZh ? "保存失败" : "Save failed",
				description: e instanceof Error ? e.message : String(e),
				variant: "destructive"
			});
			throw e;
		}
	};
	const [viewerPos, setViewerPos] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (readOnly) return;
		let off = false;
		getCurrentPosition({ timeout: 1e4 }).then((p) => {
			if (!off && p) setViewerPos({
				lat: p.latitude,
				lng: p.longitude
			});
		});
		return () => {
			off = true;
		};
	}, [readOnly]);
	const createZone = useCreateSafeZone();
	const updateZone = useUpdateSafeZone();
	const deleteZone = useDeleteSafeZone();
	const acknowledgeAlert = useAcknowledgeAlert();
	const acknowledgeAll = useAcknowledgeAllAlerts();
	const sendRequest = useSendLocationRequest();
	const cancelRequest = useCancelLocationRequest();
	useShareMyLocation();
	const mapRef = (0, import_react.useRef)(null);
	const leafletMapRef = (0, import_react.useRef)(null);
	const mapLayersRef = (0, import_react.useRef)([]);
	const mapReadyRef = (0, import_react.useRef)(false);
	const drawLayersRef = (0, import_react.useRef)([]);
	const [showZoneForm, setShowZoneForm] = (0, import_react.useState)(false);
	const [editingZone, setEditingZone] = (0, import_react.useState)(null);
	const [zoneForm, setZoneForm] = (0, import_react.useState)(defaultForm());
	const [pickingOnMap, setPickingOnMap] = (0, import_react.useState)(false);
	const [customNameDraft, setCustomNameDraft] = (0, import_react.useState)("");
	const zoneLabel = (0, import_react.useCallback)((code, zoneName) => zoneTypeLabel(code, zoneName ?? null, !!isZh), [isZh]);
	const [drawnPoints, setDrawnPoints] = (0, import_react.useState)([]);
	const initialPathRef = (0, import_react.useRef)([]);
	const [requestMessage, setRequestMessage] = (0, import_react.useState)("");
	const [isEmergency, setIsEmergency] = (0, import_react.useState)(false);
	const [emergencyConfirm, setEmergencyConfirm] = (0, import_react.useState)(false);
	const [sendingRequest, setSendingRequest] = (0, import_react.useState)(false);
	const [sharingMyLocation, setSharingMyLocation] = (0, import_react.useState)(false);
	const [openHistoryId, setOpenHistoryId] = (0, import_react.useState)(null);
	const [refreshing, setRefreshing] = (0, import_react.useState)(false);
	const unreadAlerts = (alerts || []).filter((a) => !a.is_read).length;
	const breaches = (0, import_react.useMemo)(() => (zones || []).filter((z) => {
		if (!currentLocation?.latitude || !currentLocation?.longitude) return false;
		return checkZoneBreach(z, parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude)).breached;
	}), [zones, currentLocation]);
	const renderMapContent = (0, import_react.useCallback)(async () => {
		const Lx = await getL();
		const map = leafletMapRef.current;
		if (!map) return;
		mapLayersRef.current.forEach((l) => {
			try {
				l.remove();
			} catch (_) {}
		});
		mapLayersRef.current = [];
		const bounds = [];
		if (currentLocation?.latitude && currentLocation?.longitude) {
			const lat = parseFloat(currentLocation.latitude);
			const lng = parseFloat(currentLocation.longitude);
			if (!isNaN(lat) && !isNaN(lng)) {
				bounds.push([lat, lng]);
				const icon = Lx.divIcon({
					className: "",
					html: `<div style="width:22px;height:22px;border-radius:50%;background:#10B981;border:3px solid white;box-shadow:0 0 0 3px rgba(16,185,129,.3);animation:locPulse 2s infinite"></div>`,
					iconSize: [22, 22],
					iconAnchor: [11, 11]
				});
				mapLayersRef.current.push(Lx.marker([lat, lng], { icon }).addTo(map).bindPopup(`<b>${caredOneName}</b><br>${currentLocation.address_text || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}`));
			}
		}
		(zones || []).forEach((zone) => {
			if (!zone.latitude || !zone.longitude) return;
			const zLat = parseFloat(zone.latitude);
			const zLng = parseFloat(zone.longitude);
			if (isNaN(zLat) || isNaN(zLng)) return;
			const color = zoneFill(zone.zone_type, zone.color);
			const isDanger = isDangerZone(zone.zone_type);
			if (String(zone.shape_type || "").toLowerCase() === "polygon" && zone.polygon_points?.length >= 3) {
				const pts = zone.polygon_points;
				const smoothed = zone.corner_radius?.some((r) => r > 0) ? chaikinPerVertex(pts, zone.corner_radius) : pts;
				const poly = Lx.polygon(smoothed, {
					color,
					fillColor: color,
					fillOpacity: .15,
					weight: 2,
					dashArray: isDanger ? "6,4" : void 0
				}).addTo(map).bindPopup(`<b>${zoneLabel(zone.zone_type, zone.zone_name)}</b>${zone.description ? `<br>${zone.description}` : ""}`);
				mapLayersRef.current.push(poly);
				pts.forEach((pt) => bounds.push(pt));
			} else {
				const c = Lx.circle([zLat, zLng], {
					radius: zone.radius_meters || 200,
					color,
					fillColor: color,
					fillOpacity: .15,
					weight: 2,
					dashArray: isDanger ? "6,4" : void 0
				}).addTo(map).bindPopup(`<b>${zoneLabel(zone.zone_type, zone.zone_name)}</b><br>${zone.radius_meters || 200}m`);
				mapLayersRef.current.push(c);
				bounds.push([zLat, zLng]);
			}
			const zIcon = Lx.divIcon({
				className: "",
				html: isDanger ? `<div style="width:28px;height:28px;border-radius:50%;background:#EF4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-size:13px;font-weight:bold;line-height:1">✕</div>` : `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;"><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg></div>`,
				iconSize: [28, 28],
				iconAnchor: [14, 14]
			});
			mapLayersRef.current.push(Lx.marker([zLat, zLng], { icon: zIcon }).addTo(map));
		});
		if (bounds.length > 0) try {
			map.fitBounds(bounds, {
				paddingTopLeft: [30, 30],
				paddingBottomRight: [30, 30],
				maxZoom: 16
			});
		} catch (_) {}
		else if (viewerPos) {
			map.setView([viewerPos.lat, viewerPos.lng], 15);
			const me = Lx.circleMarker([viewerPos.lat, viewerPos.lng], {
				radius: 8,
				color: "#fff",
				weight: 3,
				fillColor: "#3B82F6",
				fillOpacity: 1
			}).addTo(map).bindTooltip(isZh ? "你的位置" : "You are here");
			mapLayersRef.current.push(me);
		} else map.setView([37.0902, -95.7129], 4);
	}, [
		currentLocation,
		zones,
		caredOneName,
		zoneLabel,
		viewerPos,
		isZh
	]);
	const renderRadiusPreview = (0, import_react.useCallback)(async () => {
		const Lx = await getL();
		const map = leafletMapRef.current;
		if (!map) return;
		drawLayersRef.current.forEach((l) => {
			try {
				l.remove();
			} catch (_) {}
		});
		drawLayersRef.current = [];
		const lat = parseFloat(zoneForm.latitude);
		const lng = parseFloat(zoneForm.longitude);
		if (isNaN(lat) || isNaN(lng)) return;
		const color = zoneFill(zoneForm.zone_type, zoneForm.color);
		const c = Lx.circle([lat, lng], {
			radius: zoneForm.radius,
			color,
			fillColor: color,
			fillOpacity: .2,
			weight: 2,
			dashArray: "4,4"
		}).addTo(map);
		drawLayersRef.current.push(c);
		try {
			map.panTo([lat, lng]);
		} catch (_) {}
	}, [
		zoneForm.latitude,
		zoneForm.longitude,
		zoneForm.radius,
		zoneForm.zone_type,
		zoneForm.color
	]);
	const isMapTab = true;
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const init = async () => {
			const Lx = await getL();
			if (cancelled || !mapRef.current) return;
			if (!leafletMapRef.current) {
				const map = Lx.map(mapRef.current, {
					zoomControl: true,
					attributionControl: false
				});
				Lx.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
				leafletMapRef.current = map;
				mapReadyRef.current = true;
			}
			setTimeout(() => {
				try {
					leafletMapRef.current?.invalidateSize();
				} catch (_) {}
			}, 150);
			if (!cancelled) renderMapContent();
		};
		init();
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (leafletMapRef.current) setTimeout(() => {
			try {
				leafletMapRef.current?.invalidateSize();
			} catch (_) {}
		}, 100);
	}, [activeTab, isMapTab]);
	(0, import_react.useEffect)(() => {
		if (mapReadyRef.current) renderMapContent();
	}, [renderMapContent]);
	(0, import_react.useEffect)(() => {
		if (!mapReadyRef.current) return;
		if (!showZoneForm) {
			drawLayersRef.current.forEach((l) => {
				try {
					l.remove();
				} catch (_) {}
			});
			drawLayersRef.current = [];
			return;
		}
		if (zoneForm.shape_type === "polygon") {
			drawLayersRef.current.forEach((l) => {
				try {
					l.remove();
				} catch (_) {}
			});
			drawLayersRef.current = [];
		} else renderRadiusPreview();
	}, [
		renderRadiusPreview,
		showZoneForm,
		zoneForm.shape_type,
		zoneForm.latitude,
		zoneForm.longitude,
		zoneForm.radius
	]);
	(0, import_react.useEffect)(() => () => {
		if (leafletMapRef.current) {
			try {
				leafletMapRef.current.remove();
			} catch (_) {}
			leafletMapRef.current = null;
			mapReadyRef.current = false;
		}
	}, []);
	(0, import_react.useEffect)(() => {
		const map = leafletMapRef.current;
		if (!map || !showZoneForm) return void 0;
		if (pickingOnMap && zoneForm.shape_type === "radius") {
			map.getContainer().style.cursor = "crosshair";
			const h = (e) => {
				setZoneForm((p) => ({
					...p,
					latitude: e.latlng.lat.toFixed(6),
					longitude: e.latlng.lng.toFixed(6)
				}));
				setPickingOnMap(false);
			};
			map.once("click", h);
			return () => {
				map.off("click", h);
				map.getContainer().style.cursor = "";
			};
		}
		map.getContainer().style.cursor = "";
	}, [
		pickingOnMap,
		showZoneForm,
		drawnPoints.length,
		zoneForm.shape_type
	]);
	const openZoneForm = (zone) => {
		initialPathRef.current = zone?.polygon_points || [];
		if (zone) {
			setEditingZone(zone);
			setZoneForm({
				zone_type: zone.zone_type || ZONE_TYPE.SAFE,
				shape_type: String(zone.shape_type || "radius").toLowerCase() === "polygon" ? "polygon" : "radius",
				color: typeof zone.color === "string" && /^#[0-9a-fA-F]{6}$/.test(zone.color) ? zone.color : "#3B82F6",
				latitude: zone.latitude?.toString() || "",
				longitude: zone.longitude?.toString() || "",
				radius: zone.radius_meters || 200,
				description: zone.description || "",
				polygon_points: zone.polygon_points || [],
				corner_radius: zone.corner_radius || [],
				notify_on_enter: zone.notify_on_enter ?? true,
				notify_on_exit: zone.notify_on_exit ?? true,
				schedule_enabled: zone.schedule_enabled ?? false,
				schedule_start_time: hhmm(zone.schedule_start_time, "08:00"),
				schedule_end_time: hhmm(zone.schedule_end_time, "20:00"),
				schedule_days: zone.schedule_days || []
			});
			if (String(zone.shape_type || "").toLowerCase() === "polygon" && zone.polygon_points?.length >= 3) setDrawnPoints(zone.polygon_points);
			else setDrawnPoints([]);
		} else {
			setEditingZone(null);
			setZoneForm(defaultForm());
			setDrawnPoints([]);
		}
		setCustomNameDraft(isCustomZone(zone?.zone_type || ZONE_TYPE.SAFE) ? String(zone?.zone_name || "") : "");
		setShowZoneForm(true);
		setActiveTab("safezones");
	};
	const handleSaveZone = async () => {
		let lat = parseFloat(zoneForm.latitude);
		let lng = parseFloat(zoneForm.longitude);
		const isPolygon = zoneForm.shape_type === "polygon";
		if (isPolygon) {
			if (drawnPoints.length < 3) {
				toast({
					title: isZh ? "请至少绘制3个多边形点" : "Draw at least 3 polygon points",
					variant: "destructive"
				});
				return;
			}
			const c = centroid(drawnPoints);
			lat = c[0];
			lng = c[1];
		} else if (isNaN(lat) || isNaN(lng)) {
			toast({
				title: isZh ? "请输入有效坐标，或使用「在地图上选点」。" : "Valid coordinates required. Use 'Pick on Map'.",
				variant: "destructive"
			});
			return;
		}
		const isCustom = isCustomZone(zoneForm.zone_type);
		if (isCustom && !customNameDraft.trim()) {
			toast({
				title: isZh ? "请填写自定义区域名称" : "Custom zone name is required",
				variant: "destructive"
			});
			return;
		}
		const payload = {
			user_id: caredOneId,
			zone_type: zoneForm.zone_type,
			zone_name: isCustom ? customNameDraft.trim() : "",
			shape_type: isPolygon ? "polygon" : "radius",
			color: isCustom ? zoneForm.color : zoneColor(zoneForm.zone_type),
			latitude: lat,
			longitude: lng,
			radius_meters: isPolygon ? 0 : zoneForm.radius,
			polygon_points: isPolygon ? drawnPoints : null,
			corner_radius: null,
			description: zoneForm.description || null,
			notify_on_enter: zoneForm.notify_on_enter,
			notify_on_exit: zoneForm.notify_on_exit,
			schedule_enabled: zoneForm.schedule_enabled,
			schedule_start_time: zoneForm.schedule_enabled ? zoneForm.schedule_start_time : null,
			schedule_end_time: zoneForm.schedule_enabled ? zoneForm.schedule_end_time : null,
			schedule_days: zoneForm.schedule_enabled ? zoneForm.schedule_days : [],
			is_active: true
		};
		if (editingZone) updateZone.mutate({
			id: editingZone.id,
			...payload
		}, {
			onSuccess: () => {
				setShowZoneForm(false);
				setEditingZone(null);
				toast({ title: isZh ? "区域已更新 ✓" : "Zone updated ✓" });
			},
			onError: (e) => toast({
				title: isZh ? "更新失败" : "Failed to update",
				description: e.message,
				variant: "destructive"
			})
		});
		else createZone.mutate(payload, {
			onSuccess: () => {
				setShowZoneForm(false);
				toast({ title: isZh ? "区域已创建 ✓" : "Zone created ✓" });
			},
			onError: (e) => toast({
				title: isZh ? "创建失败" : "Failed to create",
				description: e.message,
				variant: "destructive"
			})
		});
	};
	const handleDeleteZone = (id, label) => {
		if (!confirm(isZh ? `删除区域「${label}」？` : `Delete zone "${label}"?`)) return;
		deleteZone.mutate(id, {
			onSuccess: () => toast({ title: isZh ? `区域「${label}」已删除` : `Zone "${label}" deleted` }),
			onError: (e) => toast({
				title: isZh ? "删除失败" : "Failed to delete",
				description: e.message,
				variant: "destructive"
			})
		});
	};
	const handleSendRequest = async (emergency) => {
		if (emergency && !emergencyConfirm) {
			setEmergencyConfirm(true);
			return;
		}
		const isEmergency = emergency;
		setSendingRequest(true);
		sendRequest.mutate({
			caredOneId,
			message: requestMessage,
			isEmergency
		}, {
			onSuccess: () => {
				setSendingRequest(false);
				setRequestMessage("");
				setIsEmergency(false);
				setEmergencyConfirm(false);
				toast({
					title: isZh ? isEmergency ? "紧急请求已发送" : "位置请求已发送 ✓" : isEmergency ? "Emergency request sent" : "Location request sent ✓",
					description: isEmergency ? isZh ? "对方应用开着时位置会立即到达。" : "The location arrives as soon as their app is open." : isZh ? "对方允许后，位置会出现在「实时位置」。" : "Once they allow it, the location appears under Live location."
				});
				refetchFlags();
				refetchRequests();
			},
			onError: (e) => {
				setSendingRequest(false);
				toast({
					title: isZh ? "操作失败" : "Failed",
					description: e.message,
					variant: "destructive"
				});
			}
		});
	};
	const handleRefresh = async () => {
		setRefreshing(true);
		await Promise.all(readOnly ? [refetchLocation(), refetchZones()] : [
			refetchLocation(),
			refetchHistory(),
			refetchZones(),
			refetchAlerts(),
			refetchRequests(),
			refetchSettings()
		]);
		setRefreshing(false);
		toast({ title: isZh ? "已刷新" : "Refreshed" });
	};
	const handleUseCaredOneLocation = () => {
		if (currentLocation?.latitude && currentLocation?.longitude) {
			setZoneForm((p) => ({
				...p,
				latitude: parseFloat(currentLocation.latitude).toFixed(6),
				longitude: parseFloat(currentLocation.longitude).toFixed(6)
			}));
			toast({ title: isZh ? `已使用${caredOneName}最后一次已知位置` : `Using ${caredOneName}'s last known location` });
		} else toast({
			title: isZh ? `暂无${caredOneName}的位置数据` : `No location data for ${caredOneName}`,
			variant: "destructive"
		});
	};
	const tabs = [
		{
			key: "location",
			label: isZh ? "实时位置" : "Live Location",
			icon: MapPin
		},
		{
			key: "requests",
			label: isZh ? "共享请求" : "Requests",
			icon: Send
		},
		{
			key: "alerts",
			label: isZh ? "提醒" : "Alerts",
			icon: Bell
		},
		{
			key: "safezones",
			label: isZh ? "安全区域" : "Safe Zones",
			icon: Shield,
			badge: (zones || []).length || void 0
		},
		{
			key: "history",
			label: isZh ? "历史记录" : "History",
			icon: Clock
		}
	];
	const lastSeen = currentLocation ? formatDateTime(currentLocation.created_at) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/care/LocationCard.tsx:624:5:ca58dfc20fbae0198e02d1b126f71b4c2aedc6fbb1576a0f9f4fad0a6e7ad6d3:1",
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/care/LocationCard.tsx:626:7:1262ef6f2f86f72464aee2214af3a3d32ddfa3e213d8eacee314637fedf71447:1",
				className: "flex items-start justify-between gap-3 flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/care/LocationCard.tsx:627:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						"data-inspector-source": "components/care/LocationCard.tsx:628:11:ae73931df17d752d94e17ab600f194e1107651e8187e696c8509b783d5cac17b:1",
						className: "text-lg font-bold text-foreground flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-5 w-5 text-primary" }), isZh ? `${caredOneName}的位置` : `${caredOneName}'s Location`]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/care/LocationCard.tsx:632:11:384f1fa199c4f1e3c21c048a9779752e061a46582fc88283e905bf1a2efabde8:1",
						className: "flex items-center gap-2 mt-1 flex-wrap",
						children: [
							!readOnly && flagsLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-xs",
								children: isZh ? "正在读取分享状态…" : "Checking sharing…"
							}),
							!readOnly && !flagsLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: flags?.shareOn ? "default" : "secondary",
								className: "text-xs",
								children: flags?.shareOn ? isZh ? "📍 已开启实时位置分享" : "📍 Live sharing on" : isZh ? "未开启实时位置分享" : "Live sharing off"
							}),
							!readOnly && !flagsLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-xs",
								children: flags?.emergencyAllowed ? isZh ? "允许紧急请求" : "Emergency requests allowed" : isZh ? "未允许紧急请求" : "Emergency requests not allowed"
							}),
							lastSeen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-source": "components/care/LocationCard.tsx:642:15:279cd5525d79606562351c16e2815c688845898e995f985d11979b99a047f348:1",
								className: "text-xs text-muted-foreground flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "components/care/LocationCard.tsx:643:17:2f8fb3ba357aac64882a2525b0a6451bb081135a7d71c91b9c6ac914361cc5fe:1",
									className: "w-1.5 h-1.5 rounded-full bg-success animate-pulse"
								}), isZh ? `最后位置 ${lastSeen}` : `Last seen ${lastSeen}`]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/care/LocationCard.tsx:649:9:f4d835cf84809832c85bfd509b21325fb752c45be810a568db2c665a7e868473:1",
					className: "flex gap-2 items-center flex-wrap",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-8 w-8",
						onClick: handleRefresh,
						disabled: refreshing,
						"aria-label": isZh ? "刷新位置" : "Refresh location",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}` })
					})
				})]
			}),
			breaches.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/care/LocationCard.tsx:658:9:47dc61f6e9b776480e797c761939a2129f29f13e4fc222ab98fc7ea44ec3dbb1:1",
				className: "p-3 rounded-lg bg-destructive/10 border border-destructive/20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/care/LocationCard.tsx:659:11:8f1f38c1306c8eedbd0aa4466ab1f45de93aa5599e41ff97dfcf2b1969d50df8:1",
					className: "flex items-center gap-2 text-destructive font-semibold text-sm mb-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4" }),
						" ",
						isZh ? "检测到越界" : "Zone breach detected"
					]
				}), breaches.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/care/LocationCard.tsx:663:13:9b4dacc208e0068e9493b94d160811ac8d3d3d220450ff1164105b454b80e7d6:1",
					className: "text-xs text-destructive/80",
					children: isDangerZone(z.zone_type) ? isZh ? `⚠ ${caredOneName} 位于危险区域「${zoneLabel(z.zone_type, z.zone_name)}」内` : `⚠ ${caredOneName} is inside danger zone "${zoneLabel(z.zone_type, z.zone_name)}"` : checkZoneBreach(z, parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude)).inside ? isZh ? `⚠ ${caredOneName} 已进入区域「${zoneLabel(z.zone_type, z.zone_name)}」` : `⚠ ${caredOneName} entered zone "${zoneLabel(z.zone_type, z.zone_name)}"` : isZh ? `⚠ ${caredOneName} 已离开区域「${zoneLabel(z.zone_type, z.zone_name)}」` : `⚠ ${caredOneName} is outside zone "${zoneLabel(z.zone_type, z.zone_name)}"`
				}, z.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/care/LocationCard.tsx:676:7:ad4b9f22f2cc416be5fecfc622d69b5d3eeba08400fc313c01150a30f6bed097:1",
				style: { display: "block" },
				className: "relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/care/LocationCard.tsx:677:9:2e0983a6d14024531eca74d612b6450617d5cf005cceec49f7931ccdfd6cb610:1",
						ref: mapRef,
						className: `leaflet-container ${readOnly ? "h-56" : "h-[350px]"} w-full rounded-md overflow-hidden bg-muted`
					}),
					activeTab === "location" && currentLocation?.latitude && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						className: "absolute top-2 right-2 z-[1000] shadow-md bg-background/90 backdrop-blur-sm",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							"data-inspector-source": "components/care/LocationCard.tsx:680:13:49dd34e47a9a62ee5b5e03001cd4035ef3853dd88b59e41cfc240520a695ed37:1",
							href: `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`,
							target: "_blank",
							rel: "noopener noreferrer",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3 mr-1" }),
								" ",
								isZh ? "在地图中打开" : "Open in Maps"
							]
						})
					}),
					activeTab === "safezones" && !showZoneForm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "absolute top-2 right-2 z-[1000] shadow-md bg-primary text-primary-foreground hover:bg-primary/90",
						onClick: () => openZoneForm(),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3 mr-1" }),
							" ",
							isZh ? "添加区域" : "Add Zone"
						]
					}),
					showZoneForm && zoneForm.shape_type === "polygon" && leafletMapRef.current && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZonePathEditor, {
						map: leafletMapRef.current,
						initial: initialPathRef.current,
						isZh: !!isZh,
						onChange: setDrawnPoints
					}, editingZone?.id || "new-zone")
				]
			}),
			!readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/care/LocationCard.tsx:699:21:ca4d2c90e9afe2c5f60741f8825f5d86686ad7056faf1d0feef8437e8d6546c4:1",
				className: "flex gap-1 border-b border-border overflow-x-auto -mx-1 px-1",
				children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					"data-inspector-source": "components/care/LocationCard.tsx:701:11:13afe4577f9d08c175917c0805656bb261160cecd830d735802952f6edf740eb:1",
					onClick: () => setActiveTab(t.key),
					className: `px-3 py-2.5 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 border-b-2 transition-colors
              ${activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "h-3.5 w-3.5" }),
						t.label,
						t.badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "components/care/LocationCard.tsx:707:15:ef16e3d41e88e3c22e471fbf8382362403d1693960c10c60028e7a96bf513647:1",
							className: `text-[10px] rounded-full px-1.5 py-0.5 font-bold
                ${t.key === "alerts" ? "bg-destructive text-destructive-foreground" : "bg-primary/10 text-primary"}`,
							children: t.badge
						}) : null
					]
				}, t.key))
			}),
			activeTab === "location" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/care/LocationCard.tsx:720:9:016acb45e37f8fd66985f879762723e3792cd6b1b475d10f0bf88264dad7cf46:1",
				className: "space-y-4",
				children: [!readOnly && !flagsLoading && !flags?.shareOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/care/LocationCard.tsx:724:17:b3883295bab5874709659227a0f01daec4b7c63ee10731742a6c682a10c56bee:1",
								className: "text-sm font-medium",
								children: isZh ? `${caredOneName}还没有开启实时位置分享` : `${caredOneName} has not turned on live sharing`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/care/LocationCard.tsx:725:17:77f19dd9bedcc139ac94ce9f394f70902f11c935438d665ad8643b1091393eb3:1",
								className: "text-xs text-muted-foreground",
								children: isZh ? "发送位置请求后，对方允许即开启分享，位置会自动更新。" : "Send a location request. Once they allow it, sharing turns on and the location keeps updating."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "coral",
								size: "sm",
								onClick: () => setActiveTab("requests"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3 w-3 mr-1" }),
									" ",
									isZh ? "请求位置" : "Request location"
								]
							})
						]
					})
				}), loadingLocation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/care/LocationCard.tsx:735:13:67a697af6ee1cf09825a6f3a9edefcb612b71646b2dd643629d7289241f382a3:1",
					className: "flex justify-center py-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
				}) : currentLocation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:739:17:75e17054c58be119d3723c332e8e15c689ea64d4a53009bab7d97283b001753f:1",
								className: "flex items-center gap-2 flex-wrap",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "components/care/LocationCard.tsx:740:19:9b73d9557478125d84f544a7c7fdb68a4d7604842f7ff89775426dc4bbb4034c:1",
										className: "w-2 h-2 rounded-full bg-success animate-pulse"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "components/care/LocationCard.tsx:741:19:5ce5c743d24253f3f20e361a1f99dbe253270877c442030156531c2ee02cc0e2:1",
										className: "text-sm font-semibold text-foreground",
										children: isZh ? "最新位置" : "Latest location"
									}),
									currentLocation.is_emergency && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "destructive",
										className: "text-[10px]",
										children: isZh ? "紧急模式" : "Emergency mode"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								"data-inspector-source": "components/care/LocationCard.tsx:744:17:210cad734038afd3a8e20645a1971adbfa38a047f5c938e56223f51c3186d639:1",
								className: "grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										"data-inspector-source": "components/care/LocationCard.tsx:745:19:dd966024b4c4c4ef4222717f23b0ce967feb15a3b0553934ecd9f1621f1207d2:1",
										className: "text-muted-foreground",
										children: isZh ? "位置" : "Location"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										"data-inspector-source": "components/care/LocationCard.tsx:746:19:26e8797b473362bd42aa53b9909c1207826d1ee7561a0d38fff8386b47efd201:1",
										children: currentLocation.address_text || `${parseFloat(currentLocation.latitude).toFixed(6)}, ${parseFloat(currentLocation.longitude).toFixed(6)}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										"data-inspector-source": "components/care/LocationCard.tsx:747:19:a32b8742f0136a091a9db0ccca52e6971cc025dc31d964f5e3b6df95457f0e73:1",
										className: "text-muted-foreground",
										children: isZh ? "使用设备" : "Device"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										"data-inspector-source": "components/care/LocationCard.tsx:748:19:d75708f4810da11dfa068572cf635335623d0e10d2448b39f1a7865c47e8d50f:1",
										children: currentLocation.platform || (isZh ? "未知" : "Unknown")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										"data-inspector-source": "components/care/LocationCard.tsx:749:19:fbe652f18fd33158bdc48efe49f1007fe99fb73ae333e4994f443a9ac46dd9b5:1",
										className: "text-muted-foreground",
										children: isZh ? "最后更新" : "Last updated"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										"data-inspector-source": "components/care/LocationCard.tsx:750:19:2a4d33ba7642aa563b43651e15a47e4e0fb9eac45b04285a75f918a2fbce5e29:1",
										children: formatDateTime(currentLocation.captured_at || currentLocation.created_at)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										"data-inspector-source": "components/care/LocationCard.tsx:751:19:9796ea50e69ec0b75b78801386d9341cb392207211b64439e642e187df2d1b1d:1",
										className: "text-muted-foreground",
										children: isZh ? "电量" : "Battery"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										"data-inspector-source": "components/care/LocationCard.tsx:752:19:019517e1f62ef6de9c25a4690897053e2de503d344a07dad93b8f00c70bf90d5:1",
										children: currentLocation.battery_level != null ? `${currentLocation.battery_level}%` : isZh ? "未知" : "Unknown"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										"data-inspector-source": "components/care/LocationCard.tsx:753:19:3a089d341b9c9c3d8771345b5c8f870a3b8c72962241a976505fb14d6c68fc41:1",
										className: "text-muted-foreground",
										children: isZh ? "是否在充电" : "Charging"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										"data-inspector-source": "components/care/LocationCard.tsx:754:19:f58552efbdfd6602977bea67d1e579085f4346deceb2c9c55447e2fda64779f3:1",
										children: currentLocation.phone_is_charging === "Yes" ? isZh ? "是" : "Yes" : currentLocation.phone_is_charging === "No" ? isZh ? "否" : "No" : isZh ? "未知" : "Unknown"
									})
								]
							}),
							(zones || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:759:19:9562d9e0a7ab65ca0033da0bbd3f0976d56bb0f87d36c6e5410fd5f56fbe4371:1",
								className: "pt-2 border-t border-border mt-2 space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "components/care/LocationCard.tsx:760:21:04f24764c3baae7286876a4236ce9c44d69cc3fe38ff3dc6bdc52d87b053525e:1",
									className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide",
									children: isZh ? "区域状态" : "Zone Status"
								}), (zones || []).map((zone) => {
									const breach = checkZoneBreach(zone, parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude));
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/care/LocationCard.tsx:764:25:3276be1752006a97a4019556ddf0ae813865d68dc569f40331288aeb1046529e:1",
										className: "flex items-center gap-2 text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-source": "components/care/LocationCard.tsx:765:27:1e8c3d3e653c37456e8996a01ec426647aa2573bf01ec4139467b98716a92798:1",
												className: "w-2 h-2 rounded-full",
												style: { background: zoneFill(zone.zone_type, zone.color) }
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-source": "components/care/LocationCard.tsx:766:27:5de45ff253b4abb018e2fc7dddfd2d1485cf2ef5595b0d389866c1cc6534482a:1",
												className: "font-medium",
												children: zoneLabel(zone.zone_type, zone.zone_name)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-source": "components/care/LocationCard.tsx:767:27:6ba431385ddf2ebaf77ff196e66d4a0c1c459662ce6b78865e56dc8d2a71c060:1",
												className: breach.breached ? "text-destructive font-semibold" : "text-success",
												children: isDangerZone(zone.zone_type) ? breach.breached ? isZh ? "⚠ 已进入危险区域！" : "⚠ INSIDE danger zone!" : isZh ? `✓ 已远离（${breach.distance} 米）` : `✓ Away (${breach.distance}m)` : !breach.inside ? isZh ? `${breach.breached ? "⚠ " : ""}在区域外（${breach.distance} 米）` : `${breach.breached ? "⚠ " : ""}Outside (${breach.distance}m)` : isZh ? `${breach.breached ? "⚠ " : "✓ "}在区域内（${breach.distance} 米）` : `${breach.breached ? "⚠ " : "✓ "}Inside (${breach.distance}m)`
											})
										]
									}, zone.id);
								})]
							})
						]
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-8 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-10 w-10 mx-auto mb-2 text-muted-foreground/30" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/care/LocationCard.tsx:789:17:82a4557f6e27ba31973143e442d248bc9da3f090b898c18f381b0784e9bbbebf:1",
								className: "text-sm font-medium text-foreground mb-1",
								children: isZh ? "还没有位置记录" : "No location yet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/care/LocationCard.tsx:790:17:fd3ceca9f8cf2486c825004296c7bec467a5df961799f63e7f9a211d11048837:1",
								className: "text-xs text-muted-foreground mb-3",
								children: readOnly ? isZh ? "这张信息卡关联的人暂无位置记录。如需帮助，请联系其家人。" : "No location has been recorded for the person on this card. Please contact their family for help." : isZh ? `${caredOneName}还没分享过位置。发送请求后，对方手机会收到通知，点开同意即可在这里看到位置。` : `${caredOneName} has not shared a location yet. Send a request; once they tap it and agree, it shows here.`
							}),
							!readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "coral",
								size: "sm",
								onClick: () => setActiveTab("requests"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3 w-3 mr-1" }),
									" ",
									isZh ? "去发送位置请求" : "Send a location request"
								]
							})
						]
					})
				})]
			}),
			activeTab === "requests" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/care/LocationCard.tsx:804:9:016acb45e37f8fd66985f879762723e3792cd6b1b475d10f0bf88264dad7cf46:1",
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-transparent card-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									"data-inspector-source": "components/care/LocationCard.tsx:807:15:b908f2eadc3835fabf735870ef3e0ba147cc2e23254579d0d91181e758a6d3a9:1",
									className: "font-semibold text-sm",
									children: isZh ? `请求${caredOneName}的位置` : `Ask ${caredOneName} for their location`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "components/care/LocationCard.tsx:808:15:cc7ab076c7e09aa547b80a773645747bbdd0bcc6f6945ad4ded96beec9fa040b:1",
									className: "text-xs text-muted-foreground",
									children: isZh ? `${caredOneName}会收到消息，选择是否允许。允许后会开启实时位置分享，位置显示在「实时位置」。` : `${caredOneName} gets a message and chooses whether to allow it. Allowing turns on live sharing; the location shows under Live location.`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: requestMessage,
									onChange: (e) => setRequestMessage(e.target.value),
									placeholder: isZh ? "可选：说明为什么需要位置" : "Optional: why you need their location",
									rows: 2
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "w-full",
									onClick: () => handleSendRequest(false),
									disabled: sendingRequest || sendRequest.isPending,
									children: [sendingRequest || sendRequest.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4 mr-2" }), isZh ? "发送位置请求" : "Send location request"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/care/LocationCard.tsx:815:15:3a788f1e7fe6b53437a460593d2be6fdc89bebc59c445d9bdbcbcfb17d2a6059:1",
									className: "flex flex-col gap-2 p-3 rounded-lg border bg-destructive/5 border-destructive/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-source": "components/care/LocationCard.tsx:816:17:70c5362713316331913f895cce889ba9b146585c28aa64844f17ac33427116b0:1",
											className: "flex items-center gap-1.5 text-sm font-medium",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-4 w-4 text-destructive" }), isZh ? "紧急请求" : "Emergency request"]
										}),
										!flagsLoading && !flagsError && flags && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmergencySharingToggle, {
											allowed: flags.emergencyAllowed,
											pending: enableEmergency.isPending || setSharingFlags.isPending,
											isZh: !!isZh,
											onSave: saveEmergencySharing
										}),
										flagsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-source": "components/care/LocationCard.tsx:819:19:d8058b8dfa48b2085e2bd756698d671b00f8b0419df28d27196a33c74fcbeb4e:1",
											className: "flex items-center gap-2 text-xs text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), isZh ? `正在读取${caredOneName}是否已开启紧急请求…` : `Checking whether ${caredOneName} has turned on emergency requests…`]
										}) : flagsError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/care/LocationCard.tsx:821:19:7087ad198f460f4b4db8fc51c331b7f713770488616c52171ac2ce8816eb37f8:1",
											className: "flex items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "components/care/LocationCard.tsx:822:21:36282bf22f4054437bf968d8238adf80d09ea355d6385dc55931fe0266285b27:1",
												className: "text-xs text-destructive",
												children: isZh ? "读取紧急请求设置失败。" : "Could not read the emergency request setting."
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => refetchFlags(),
												children: isZh ? "重试" : "Retry"
											})]
										}) : flags?.emergencyAllowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "components/care/LocationCard.tsx:827:21:06c6153f4a49a2179cc87a1cb99bfcf3d7c808570aed35fa04ddd190fa8485b3:1",
												className: "text-xs text-muted-foreground",
												children: isZh ? `${caredOneName}已开启紧急请求。你可以发送紧急位置请求：不需要对方确认，只要对方的应用开着，位置会立即发过来，并记为紧急模式。` : `${caredOneName} has turned on emergency requests. You can send an emergency location request: no confirmation needed. As long as their app is open, the location arrives at once and is marked as emergency mode.`
											}),
											emergencyConfirm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "components/care/LocationCard.tsx:828:42:9745b1b698113a946689b1499614c0c6669889572fdc5a32218450a3f8b1c212:1",
												className: "text-xs text-destructive font-medium",
												children: isZh ? "确定吗？再点一次发送。" : "Are you sure? Click again to send."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "destructive",
												onClick: () => handleSendRequest(true),
												disabled: sendingRequest || sendRequest.isPending,
												children: emergencyConfirm ? isZh ? "确认发送紧急请求" : "Confirm emergency request" : isZh ? "发送紧急请求" : "Send emergency request"
											})
										] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "components/care/LocationCard.tsx:835:21:0897846e0b43381bb1ec72c73d7cd64d842272b192b43e8729d9eb2671334415:1",
											className: "text-xs text-muted-foreground",
											children: isZh ? `${caredOneName}还没有开启紧急请求许可。开启后，紧急时不需要对方确认就能查看位置；开启时会给对方发送通知。` : `Emergency requests are off for ${caredOneName}. Once on, you can see their location in an emergency without them confirming. They are notified when you turn it on.`
										}) })
									]
								})
							]
						})
					}),
					(locationRequests || []).filter((r) => r.status === "pending").length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/care/LocationCard.tsx:843:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							"data-inspector-source": "components/care/LocationCard.tsx:844:15:41a92936190b4fc3d5ac438cc3ba998a330be869d396147190a5c7cdaa39faed:1",
							className: "text-sm font-semibold text-muted-foreground mb-2",
							children: isZh ? "等待回应" : "Waiting"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "components/care/LocationCard.tsx:845:15:f2363fb736e34fe278c1c6a79637c03e43712bbc8d8966ca7c71f14a06b8fc5b:1",
							className: "space-y-2",
							children: (locationRequests || []).filter((r) => r.status === "pending").map((req) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "border-transparent card-elevated border-l-2 border-l-amber-400",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "p-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/care/LocationCard.tsx:849:23:43f94d22be4270ca41745b2bf99e2ec5cae616d3c9bfc56eeebe85727f6f90df:1",
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/care/LocationCard.tsx:850:25:c5ef961e7c671996083509685695e28adf3bf953f4f06f8bf48866d694a6d3b4:1",
											className: "flex-1 min-w-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-source": "components/care/LocationCard.tsx:851:27:afc64a44695b2988c1d249e107b195d5498b61a84e714563955a8903676ce90b:1",
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														"data-inspector-source": "components/care/LocationCard.tsx:852:29:2f90fc04624345170f1af4c8bf08e1ae9a57e10edbf39ecfe0c6ec01b9b7cea7:1",
														className: "text-xs font-medium text-amber-500",
														children: isZh ? "⏳ 已送达，等待对方同意" : "⏳ Delivered, waiting for them"
													}), req.is_emergency && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "destructive",
														className: "text-[10px]",
														children: isZh ? "紧急" : "Urgent"
													})]
												}),
												req.message && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													"data-inspector-source": "components/care/LocationCard.tsx:855:43:44970be15868fcd98f5950747106ef384700d2c2c1456c0068b35ae54fd04db8:1",
													className: "text-xs text-muted-foreground mt-0.5",
													children: [
														"\"",
														req.message,
														"\""
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													"data-inspector-source": "components/care/LocationCard.tsx:856:27:5c6452d9bef630a91022a234ba08192ae0e2c7498b961c2be516595424da9c20:1",
													className: "text-xs text-muted-foreground",
													children: formatDateTime(req.created_at)
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											className: "text-destructive text-xs h-7",
											onClick: () => cancelRequest.mutate({
												requestId: req.id,
												caredOneId
											}),
											disabled: cancelRequest.isPending,
											children: isZh ? "移除" : "Remove"
										})]
									})
								})
							}, req.id))
						})]
					}),
					(locationRequests || []).filter((r) => r.status !== "pending").length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/care/LocationCard.tsx:870:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							"data-inspector-source": "components/care/LocationCard.tsx:871:15:846bea424e7f4a76a5ec6dca14396f46136e337db05b4989f6566290fb7a7540:1",
							className: "text-sm font-semibold text-muted-foreground mb-2",
							children: isZh ? "已回应" : "Answered"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "components/care/LocationCard.tsx:872:15:f2363fb736e34fe278c1c6a79637c03e43712bbc8d8966ca7c71f14a06b8fc5b:1",
							className: "space-y-2",
							children: (locationRequests || []).filter((r) => r.status !== "pending").map((req) => {
								const s = {
									accepted: {
										icon: "✓",
										label: isZh ? "已分享位置" : "Location shared",
										color: "text-success"
									},
									emergency_approved: {
										icon: "!",
										label: isZh ? "紧急请求·已自动分享" : "Emergency — auto-shared",
										color: "text-destructive"
									},
									declined: {
										icon: "✗",
										label: "Declined",
										color: "text-destructive"
									},
									rejected: {
										icon: "✗",
										label: "Declined",
										color: "text-destructive"
									},
									cancelled: {
										icon: "—",
										label: "Cancelled",
										color: "text-muted-foreground"
									}
								}[req.status] || {
									icon: "?",
									label: req.status,
									color: "text-muted-foreground"
								};
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "border-transparent card-elevated opacity-80",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "components/care/LocationCard.tsx:885:25:b993a0f88c717d092f54e62614c5c7a288e86397422792e53392d79320459800:1",
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													"data-inspector-source": "components/care/LocationCard.tsx:886:27:4a4ccdbdfd1e8fff3892f3938f56c6809d16538369e9f3c8b04eae2d1eba3b17:1",
													className: `text-xs font-medium ${s.color}`,
													children: [
														s.icon,
														" ",
														s.label
													]
												}), req.is_emergency && req.status !== "emergency_approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "destructive",
													className: "text-[10px]",
													children: "Emergency"
												})]
											}),
											req.message && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												"data-inspector-source": "components/care/LocationCard.tsx:889:41:13660d21256b482a06e58b8e08108c46516b99505e8316daff18666f14e98548:1",
												className: "text-xs text-muted-foreground mt-0.5",
												children: [
													"\"",
													req.message,
													"\""
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "components/care/LocationCard.tsx:890:25:fa1b8df3f999de687320577c445622624265f5ac7c3459940c2a223b4af6df27:1",
												className: "text-xs text-muted-foreground",
												children: formatDateTime(req.created_at)
											})
										]
									})
								}, req.id);
							})
						})]
					}),
					(locationRequests || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/care/LocationCard.tsx:900:13:44cf3e54979b8280efd93e64de1e54532657175e4460fe7dd58d6d99cb527255:1",
						className: "text-center py-8 text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-10 w-10 mx-auto mb-2 opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/care/LocationCard.tsx:902:15:f2e1f8ac18815b7c9a43bfa55c79f5715a2d37109b2afbc08c79524752c02522:1",
							className: "text-sm",
							children: isZh ? "这台设备还没发过位置请求" : "No requests sent from this device yet"
						})]
					})
				]
			}),
			activeTab === "alerts" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/care/LocationCard.tsx:910:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
				children: [unreadAlerts > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/care/LocationCard.tsx:912:13:9d924accec7d0e45e6440d64bf6d86a85e4a05ce7efad490d057cbe516040f41:1",
					className: "flex justify-end mb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => acknowledgeAll.mutate(caredOneId, { onSuccess: () => toast({ title: isZh ? "已确认所有警报 ✓" : "All alerts acknowledged ✓" }) }),
						disabled: acknowledgeAll.isPending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 mr-1" }), " Mark all read"]
					})
				}), (alerts || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/care/LocationCard.tsx:919:13:7f82c0150900aaca402771d948773a206818a8314b3e27408c63cfc9ef77fe51:1",
					className: "text-center py-10 text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-10 w-10 mx-auto mb-2 opacity-40" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/care/LocationCard.tsx:921:15:121f1cd1756580a59df5205fa8f1ed3045b4874345bc9de168fc13dfb8efd2f2:1",
							className: "text-sm",
							children: "No zone alerts"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							"data-inspector-source": "components/care/LocationCard.tsx:922:15:852a79fae3f1509e83bf2843d9f990ee4d9ee22c1c899596623835b3d6c5cf1f:1",
							className: "text-xs mt-1",
							children: [
								"Alerts appear when ",
								caredOneName,
								" enters or exits a zone"
							]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/care/LocationCard.tsx:925:13:5ca737ca92b381dd61b1bf6e56c19ce4d2db0e06f2d51b3de2f2cce60f2f25b2:1",
					className: "space-y-2",
					children: (alerts || []).map((alert) => {
						const cfg = {
							exited_safe_zone: {
								label: "Left Safe Zone",
								color: "text-destructive"
							},
							entered_safe_zone: {
								label: "Entered Safe Zone",
								color: "text-success"
							},
							entered_danger_zone: {
								label: "Entered Danger Zone",
								color: "text-destructive"
							},
							exited_danger_zone: {
								label: "Left Danger Zone",
								color: "text-success"
							}
						}[alert.alert_type] || {
							label: alert.alert_type,
							color: "text-muted-foreground"
						};
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: `border-transparent card-elevated ${!alert.is_read ? "border-l-2 border-l-destructive" : "opacity-70"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/care/LocationCard.tsx:938:23:7de653c88a3935f7880fc1e1d5ee5cc095f925bdb180afcddcb8ab09d0d462e2:1",
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/care/LocationCard.tsx:939:25:c5ef961e7c671996083509685695e28adf3bf953f4f06f8bf48866d694a6d3b4:1",
										className: "flex-1 min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "components/care/LocationCard.tsx:940:27:823d4945657298f9d7cb696ad55f222c2ac0ea660c998a4502b524ba0ff4381b:1",
												className: "flex items-center gap-2 flex-wrap",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-source": "components/care/LocationCard.tsx:941:29:d1e56b8329549082e8a07194df1dfa54d9337a05883070e6848aa277657a1672:1",
													className: `text-sm font-semibold ${cfg.color}`,
													children: cfg.label
												}), alert.safe_zone?.zone_type && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "secondary",
													className: "text-[10px]",
													children: zoneLabel(alert.safe_zone.zone_type, alert.safe_zone.zone_name)
												})]
											}),
											alert.message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "components/care/LocationCard.tsx:947:45:5ce2f6ef05e3c916db465d4ddde225e1a49f627ccf599fc6f1814813339dc28d:1",
												className: "text-xs text-muted-foreground mt-0.5",
												children: alert.message
											}),
											alert.distance_from_center != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												"data-inspector-source": "components/care/LocationCard.tsx:949:29:b2b6f080dd83175c36aca0d8e4d0c0fdbad332176ddd1de8342cf332491b228c:1",
												className: "text-xs text-muted-foreground",
												children: [Math.round(alert.distance_from_center), "m from center"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "components/care/LocationCard.tsx:951:27:78d3648024e04d2584ad2904cc92094ab4de899c3206cbb8ebc81ebfa52e107d:1",
												className: "text-xs text-muted-foreground mt-1",
												children: formatDateTime(alert.created_at)
											})
										]
									}), !alert.is_read ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										className: "text-xs h-7 shrink-0",
										onClick: () => acknowledgeAlert.mutate(alert.id),
										disabled: acknowledgeAlert.isPending,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 mr-1" }), " Ack"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-success shrink-0 mt-0.5" })]
								})
							})
						}, alert.id);
					})
				})]
			}),
			activeTab === "safezones" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/care/LocationCard.tsx:972:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
				children: [showZoneForm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-primary/20 card-elevated mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:976:17:16400e4476a80c458fbfc97272bb388c06951a4fb5e4afa521d31a21a3f731a0:1",
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									"data-inspector-source": "components/care/LocationCard.tsx:977:19:923e6bc6a6cad7cf66fe9c43afc34fee29b2d3e29fba4d803d7a4b3ed466d8cd:1",
									className: "font-semibold",
									children: editingZone ? isZh ? "编辑区域" : "Edit zone" : isZh ? "新建区域" : "New zone"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									className: "h-7 w-7",
									onClick: () => {
										setShowZoneForm(false);
										setEditingZone(null);
										setDrawnPoints([]);
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:986:17:92be92a7fe050749218dc20048da94fc87b46eec5b7e95e0d8e8ef44bf4fe0d1:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: isZh ? "区域类型 *" : "Zone Type *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "components/care/LocationCard.tsx:988:19:b7fec8c6b4a69d6e0455ce88bd04ecedc3d1922cd67d669d32109efd215de1a7:1",
									className: "grid grid-cols-3 gap-1.5 mt-1",
									children: ZONE_TYPE_CODES.map((code) => {
										const active = zoneForm.zone_type === code;
										const c = zoneColor(code);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											"data-inspector-source": "components/care/LocationCard.tsx:993:25:3ecf5e9205d0779363a1bd17f684e91c6f7e72ed09c4a20d4b873ece7617b955:1",
											onClick: () => {
												setZoneForm((p) => ({
													...p,
													zone_type: code
												}));
												if (!isCustomZone(code)) setCustomNameDraft("");
											},
											className: "px-2 py-1.5 rounded-lg border text-xs font-medium truncate transition-colors",
											style: {
												borderColor: active ? c : void 0,
												color: active ? c : void 0,
												backgroundColor: active ? `${c}20` : void 0
											},
											children: zoneLabel(code)
										}, code);
									})
								})]
							}),
							isDangerZone(zoneForm.zone_type) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/care/LocationCard.tsx:1011:19:df44a1e56e96820ae7395d81cbfb8cd811897fd0a7d14412e3735623b551d7ca:1",
								className: "text-xs text-destructive bg-destructive/10 rounded-sm p-2",
								children: isZh ? `当 ${caredOneName} 进入该区域时提醒` : `Alert when ${caredOneName} enters this area`
							}),
							isCustomZone(zoneForm.zone_type) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:1019:19:1bc93ee7afa00675b5eaacf65fb77591ecc6a1e0b98a66b196f925023f85861e:1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: isZh ? "自定义区域名称" : "Custom zone name"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: customNameDraft,
										onChange: (e) => setCustomNameDraft(e.target.value),
										placeholder: isZh ? "例如：日托中心" : "e.g. \"Day centre\"",
										className: "mt-1"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs mt-3 block",
										children: isZh ? "区域颜色" : "Zone colour"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/care/LocationCard.tsx:1027:21:99009f43f0031165c2d69166d5a81a20003e40f8a5b6e362c1c95c336462b292:1",
										className: "flex items-center gap-1.5 mt-1 flex-wrap",
										children: [CUSTOM_ZONE_COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											"data-inspector-source": "components/care/LocationCard.tsx:1029:25:3b7390a5bbcf620aacf602781a9af36780412f59a1c33bd10740fa059442228d:1",
											type: "button",
											"aria-label": c,
											onClick: () => setZoneForm((p) => ({
												...p,
												color: c
											})),
											className: `h-7 w-7 rounded-full border-2 transition-transform ${zoneForm.color.toLowerCase() === c.toLowerCase() ? "scale-110 border-foreground" : "border-transparent"}`,
											style: { background: c }
										}, c)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											"data-inspector-source": "components/care/LocationCard.tsx:1034:23:92f1c5040e7f1e93f2cae3fe32337571a6217a30fac4b013ddd040e59e8b906e:1",
											type: "color",
											"aria-label": isZh ? "自选颜色" : "Pick a colour",
											value: zoneForm.color,
											onChange: (e) => setZoneForm((p) => ({
												...p,
												color: e.target.value
											})),
											className: "h-7 w-9 rounded-sm border bg-transparent p-0.5"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:1043:17:92be92a7fe050749218dc20048da94fc87b46eec5b7e95e0d8e8ef44bf4fe0d1:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: isZh ? "形状" : "Shape"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "components/care/LocationCard.tsx:1045:19:02c59d3a8893db95d5a288aa7ecfe7f01b786d94c292ed76359816c0aa2f1924:1",
									className: "flex rounded-lg border overflow-hidden mt-1",
									children: ["radius", "polygon"].map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										"data-inspector-source": "components/care/LocationCard.tsx:1047:23:59d40ae857c0ec9be0a11952fc84ab439a2e935333e518b213e3446cf4472e52:1",
										onClick: () => {
											setZoneForm((p) => ({
												...p,
												shape_type: st
											}));
											if (st === "radius") setDrawnPoints([]);
										},
										className: `flex-1 py-1.5 text-sm font-medium transition-colors
                          ${zoneForm.shape_type === st ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-accent"}`,
										children: st === "radius" ? isZh ? "⬤ 圆形范围" : "⬤ Circle area" : isZh ? "⬡ 绘制边界" : "⬡ Draw boundary"
									}, st))
								})]
							}),
							zoneForm.shape_type === "radius" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:1061:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Zone Center"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/care/LocationCard.tsx:1063:23:9f7daf72870d29a1d4a0ae2424ae27bffbcb191570209c1a809355003fbecbc9:1",
										className: "flex gap-2 mt-1 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											size: "sm",
											onClick: () => setPickingOnMap(!pickingOnMap),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "h-3 w-3 mr-1" }), pickingOnMap ? "Cancel picking" : "Pick on Map"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											size: "sm",
											onClick: handleUseCaredOneLocation,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3 mr-1" }),
												"Use ",
												caredOneName,
												"'s Location"
											]
										})]
									}),
									pickingOnMap && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "components/care/LocationCard.tsx:1071:40:d5ec2ad8b15fda8e4039bd22e8cddbde5c7045a38466f21cb2290e6394010e9b:1",
										className: "text-xs text-primary mt-1 font-medium",
										children: "👆 Click on the map above to set center"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/care/LocationCard.tsx:1072:23:caf66ccfbdfedfb9831ab1ae0fbd220acb8539dea6eb2a2e3f4f7081bc15e766:1",
										className: "grid grid-cols-2 gap-2 mt-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/care/LocationCard.tsx:1073:25:93c20f33197c23bcea4ef5a1cb8fe93d4c03f188eeb9807c78ad47f62a6570c7:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[10px] text-muted-foreground",
												children: "Latitude"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: zoneForm.latitude,
												onChange: (e) => setZoneForm((p) => ({
													...p,
													latitude: e.target.value
												})),
												placeholder: "40.71280",
												className: "mt-0.5 font-mono text-xs"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/care/LocationCard.tsx:1078:25:93c20f33197c23bcea4ef5a1cb8fe93d4c03f188eeb9807c78ad47f62a6570c7:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[10px] text-muted-foreground",
												children: "Longitude"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: zoneForm.longitude,
												onChange: (e) => setZoneForm((p) => ({
													...p,
													longitude: e.target.value
												})),
												placeholder: "-74.00600",
												className: "mt-0.5 font-mono text-xs"
											})]
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:1085:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/care/LocationCard.tsx:1086:23:ba18cdee6becdc334042c5ae1191afbdae46e28b54a046ed2e90e987f41a5355:1",
										className: "flex justify-between items-center mb-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs",
											children: "Radius"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											"data-inspector-source": "components/care/LocationCard.tsx:1088:25:1b5e1e3a17b1205db5df637da2b7c96c4ef9721865496c4368c8015b4b06ba37:1",
											className: "text-xs text-muted-foreground font-mono",
											children: [zoneForm.radius, "m"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										min: 50,
										max: 5e3,
										step: 50,
										value: [zoneForm.radius],
										onValueChange: ([v]) => setZoneForm((p) => ({
											...p,
											radius: v
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/care/LocationCard.tsx:1092:23:094d367291d106f7b5c293fdee99e23926ed0c44f169d92daf76def6308a1025:1",
										className: "flex justify-between text-[10px] text-muted-foreground mt-0.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "components/care/LocationCard.tsx:1092:102:094d367291d106f7b5c293fdee99e23926ed0c44f169d92daf76def6308a1025:0",
											children: "50m"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "components/care/LocationCard.tsx:1092:118:094d367291d106f7b5c293fdee99e23926ed0c44f169d92daf76def6308a1025:0",
											children: "5km"
										})]
									})
								]
							})] }),
							zoneForm.shape_type === "polygon" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:1098:19:5d33348242e744ba055d630e5fc6b6976c7ad33899f9b72eaa3b5795794b4926:1",
								className: "flex items-center justify-between gap-2 border-b border-border pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/care/LocationCard.tsx:1099:21:a8a04aa83d3eddef11477cb63f9371779b3221f7e2951a4f9c3183863a8fd08a:1",
									className: "text-sm font-medium",
									children: isZh ? "边界" : "Boundary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-source": "components/care/LocationCard.tsx:1100:21:65d8c018431e7dd5395f2dc036739bf85f9dfb2feb1fd7a094af1156b10edf9a:1",
									className: "text-xs text-muted-foreground",
									children: [
										drawnPoints.length,
										" ",
										isZh ? "边界点" : "boundary points"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:1104:17:92be92a7fe050749218dc20048da94fc87b46eec5b7e95e0d8e8ef44bf4fe0d1:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: isZh ? "描述（可选）" : "Description (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: zoneForm.description,
									onChange: (e) => setZoneForm((p) => ({
										...p,
										description: e.target.value
									})),
									placeholder: isZh ? "可选备注…" : "Optional notes...",
									rows: 2,
									className: "mt-1"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:1110:17:17d9d6c09ea299a8a60db95751c360e55c1db680a84cb8451206c49e7d794eb0:1",
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/care/LocationCard.tsx:1111:19:875a2aaba3867eca06c89388168e4d56cae16349ad194622ba2970f9f1f78d65:1",
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: isZh ? "进入时提醒" : "Alert on enter"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: zoneForm.notify_on_enter,
										onCheckedChange: (v) => setZoneForm((p) => ({
											...p,
											notify_on_enter: v
										}))
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/care/LocationCard.tsx:1115:19:875a2aaba3867eca06c89388168e4d56cae16349ad194622ba2970f9f1f78d65:1",
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: isZh ? "离开时提醒" : "Alert on exit"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: zoneForm.notify_on_exit,
										onCheckedChange: (v) => setZoneForm((p) => ({
											...p,
											notify_on_exit: v
										}))
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:1121:17:92be92a7fe050749218dc20048da94fc87b46eec5b7e95e0d8e8ef44bf4fe0d1:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/care/LocationCard.tsx:1122:19:ad070b02c197e1792d071a7d5824aae421c93970be4fb4247cdc75e4b066a151:1",
									className: "flex items-center justify-between mb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: isZh ? "生效时段" : "Active hours"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: zoneForm.schedule_enabled,
										onCheckedChange: (v) => setZoneForm((p) => ({
											...p,
											schedule_enabled: v
										}))
									})]
								}), zoneForm.schedule_enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/care/LocationCard.tsx:1127:21:7797cf625e2a6da5c13ad2e5d24962cf5996f825e6686aafdbff036a8ac646a3:1",
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/care/LocationCard.tsx:1128:23:4286c3e7587f952662ae5a3e6b6e340e704e60daf9c112a7450292922140c64a:1",
										className: "grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/care/LocationCard.tsx:1129:25:93c20f33197c23bcea4ef5a1cb8fe93d4c03f188eeb9807c78ad47f62a6570c7:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[10px] text-muted-foreground",
												children: "Start"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "time",
												value: zoneForm.schedule_start_time,
												onChange: (e) => setZoneForm((p) => ({
													...p,
													schedule_start_time: e.target.value
												})),
												className: "mt-0.5"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/care/LocationCard.tsx:1134:25:93c20f33197c23bcea4ef5a1cb8fe93d4c03f188eeb9807c78ad47f62a6570c7:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[10px] text-muted-foreground",
												children: "End"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "time",
												value: zoneForm.schedule_end_time,
												onChange: (e) => setZoneForm((p) => ({
													...p,
													schedule_end_time: e.target.value
												})),
												className: "mt-0.5"
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "components/care/LocationCard.tsx:1140:23:1fc850133179b2c5225c386396b346c4ae692b67d13b0272d2ec5167841edd0c:1",
										className: "flex gap-1 flex-wrap",
										children: DAYS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											"data-inspector-source": "components/care/LocationCard.tsx:1142:27:f5466dc7b9c4f8213acc6adf2e2cf0e310edfcd990e455dfca51322b04d1865a:1",
											onClick: () => setZoneForm((p) => ({
												...p,
												schedule_days: p.schedule_days.includes(d) ? p.schedule_days.filter((x) => x !== d) : [...p.schedule_days, d]
											})),
											className: `px-2 py-1 rounded-sm text-xs border font-medium transition-colors
                              ${zoneForm.schedule_days.includes(d) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`,
											children: d
										}, d))
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:1157:17:af9e9a8f75327dc859dd6bd43f3112972408e6c48800bbd7896342dcf8d249fc:1",
								className: "flex gap-2 pt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "flex-1",
									onClick: () => {
										setShowZoneForm(false);
										setEditingZone(null);
										setDrawnPoints([]);
									},
									children: isZh ? "取消" : "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "flex-1 text-white",
									style: { background: zoneFill(zoneForm.zone_type, zoneForm.color) },
									onClick: handleSaveZone,
									disabled: createZone.isPending || updateZone.isPending,
									children: [(createZone.isPending || updateZone.isPending) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }), editingZone ? isZh ? "保存修改" : "Save changes" : isZh ? "创建区域" : "Create zone"]
								})]
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/care/LocationCard.tsx:1176:11:94490c180d4f0469c17deda0b1a4d7cc86527230dc532ba16ef5120fe55a0723:1",
					className: "space-y-2",
					children: [(zones || []).length === 0 && !showZoneForm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/care/LocationCard.tsx:1178:15:c1f8b31f2f1e98eaaaf26533d4bf73d2a86c179382a4fc04390ad83cf3517078:1",
						className: "text-center py-8 text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-10 w-10 mx-auto mb-2 opacity-40" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/care/LocationCard.tsx:1180:17:a6f0d336548773d4d06c1723c198190d609e94017cce7f26b3c7ce4e16cd0a81:1",
								className: "text-sm",
								children: isZh ? "还没有区域" : "No zones yet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/care/LocationCard.tsx:1181:17:03996d5d28dc306283ee0af2dc82bee5895cef3335cf571eabe97a83f4391a3c:1",
								className: "text-xs",
								children: isZh ? "可以加安全区域（如家），或要避开的危险区域" : "Add safe zones like home, or danger zones to avoid"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "mt-3",
								onClick: () => openZoneForm(),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3 mr-1" }),
									" ",
									isZh ? "新建区域" : "New zone"
								]
							})
						]
					}), (zones || []).map((zone) => {
						const color = zoneFill(zone.zone_type, zone.color);
						const Icon = zoneIcon(zone.zone_type);
						const label = zoneLabel(zone.zone_type, zone.zone_name);
						const active = isZoneActive(zone);
						const breachInfo = currentLocation ? checkZoneBreach(zone, parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude)) : {
							breached: false,
							distance: 0,
							inside: false
						};
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "border-transparent card-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/care/LocationCard.tsx:1199:21:def070be69b8a57912e6a16d6ed1b60c0ba2330e6736a1b8ac5ea95f773de991:1",
									className: "flex items-start gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "components/care/LocationCard.tsx:1200:23:f8207014e62896ade887211109ecc8f9e0d8f80ab80b55c5c0415e3d9288ee31:1",
											className: "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
											style: {
												background: `${color}20`,
												color
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/care/LocationCard.tsx:1204:23:fb16241906a50328b5f35f398e0a728f84b5ec742847470d5fca41c035bc5725:1",
											className: "flex-1 min-w-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-source": "components/care/LocationCard.tsx:1205:25:4d034e44b6d303a1dafad0675255e3b7f8ca373d7cc606c9a3d68c45a49b2548:1",
													className: "flex items-center gap-2 flex-wrap",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															"data-inspector-source": "components/care/LocationCard.tsx:1206:27:7f717beab510da258b5f3c66c2a6a1ee682bfc6ab2ee162680abb3d03a1874bd:1",
															className: "font-semibold text-sm",
															children: label
														}),
														isDangerZone(zone.zone_type) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "destructive",
															className: "text-[10px]",
															children: isZh ? "危险" : "DANGER"
														}),
														!active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "secondary",
															className: "text-[10px]",
															children: isZh ? "⏰ 定时（当前未生效）" : "⏰ Scheduled (inactive)"
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													"data-inspector-source": "components/care/LocationCard.tsx:1210:25:90412395fb9030909caeb8656df9247ee79227886d979de86517eb320b4c9648:1",
													className: "text-xs text-muted-foreground mt-0.5",
													children: String(zone.shape_type).toLowerCase() === "polygon" ? isZh ? "精确范围" : "Traced area" : isZh ? `半径 ${zone.radius_meters || 200} 米` : `${zone.radius_meters || 200}m radius`
												}),
												zone.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													"data-inspector-source": "components/care/LocationCard.tsx:1214:46:3867a2124c1aa2a2468ecf8c92bab203cb3f33899faa997ae00a7ea1707f931a:1",
													className: "text-xs text-muted-foreground",
													children: zone.description
												}),
												zone.schedule_enabled && zone.schedule_start_time && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													"data-inspector-source": "components/care/LocationCard.tsx:1216:27:fb7636bd7a50f4575c0cf3e4c95c7ffb73deedd32d412c7753c27688a1be0327:1",
													className: "text-xs text-muted-foreground flex items-center gap-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
														" ",
														hhmm(zone.schedule_start_time, ""),
														"–",
														hhmm(zone.schedule_end_time, "")
													]
												}),
												currentLocation && active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													"data-inspector-source": "components/care/LocationCard.tsx:1221:27:5a94053b5a4adfae39316fdfe3c49a7b49feb2bf4bfc2559f863b898050469f7:1",
													className: `text-xs mt-1 font-medium ${breachInfo.breached ? "text-destructive" : "text-success"}`,
													children: isDangerZone(zone.zone_type) ? breachInfo.breached ? isZh ? `⚠ 现在在危险区域里（${breachInfo.distance} 米）` : `⚠ Inside danger zone (${breachInfo.distance}m)` : isZh ? `✓ 现在在区域外（${breachInfo.distance} 米）` : `✓ Outside (${breachInfo.distance}m)` : !breachInfo.inside ? isZh ? `现在在区域外（距中心 ${breachInfo.distance} 米）` : `Outside (${breachInfo.distance}m away)` : isZh ? `现在在区域里（距中心 ${breachInfo.distance} 米）` : `Inside (${breachInfo.distance}m from center)`
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-source": "components/care/LocationCard.tsx:1228:25:83239c6197aaae99b2298700dea38956e26862814fdde84c9fa317b2dc2927c3:1",
													className: "flex gap-1 mt-1.5 flex-wrap",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "outline",
														className: "text-[10px]",
														children: [isZh ? "类型：" : "Type: ", isDangerZone(zone.zone_type) ? isZh ? "危险区域" : "Danger" : isSafeZone(zone.zone_type) ? isZh ? "安全区域" : "Safe" : isZh ? "自定义" : "Custom"]
													}), zone.schedule_enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "outline",
														className: "text-[10px]",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-2.5 w-2.5 mr-0.5" }), isZh ? "有生效时段" : "Scheduled"]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-source": "components/care/LocationCard.tsx:1232:25:5c1f2373131b685f0db01b01bc1d5418954862e40bde7fa4358221d66f3d6599:1",
													className: "flex gap-4 mt-2 flex-wrap",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
														"data-inspector-source": "components/care/LocationCard.tsx:1233:27:a33824e8745a96102b67f2d3fcb3edb9921f610a940da9f608efcb657b756976:1",
														className: "flex items-center gap-2 text-xs",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
															checked: !!zone.notify_on_enter,
															onCheckedChange: (v) => updateZone.mutate({
																id: zone.id,
																notify_on_enter: v
															})
														}), isZh ? "进入时提醒" : "Alert on enter"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
														"data-inspector-source": "components/care/LocationCard.tsx:1237:27:a33824e8745a96102b67f2d3fcb3edb9921f610a940da9f608efcb657b756976:1",
														className: "flex items-center gap-2 text-xs",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
															checked: !!zone.notify_on_exit,
															onCheckedChange: (v) => updateZone.mutate({
																id: zone.id,
																notify_on_exit: v
															})
														}), isZh ? "离开时提醒" : "Alert on exit"]
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/care/LocationCard.tsx:1243:23:017b9a04a7d18dd52378e0c2ae039bd097462f305a381b0b505a637cd9a1346e:1",
											className: "flex gap-1 shrink-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												className: "h-7 w-7",
												onClick: () => openZoneForm(zone),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { className: "h-3 w-3" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												className: "h-7 w-7 text-destructive",
												onClick: () => handleDeleteZone(zone.id, label),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
											})]
										})
									]
								})
							})
						}, zone.id);
					})]
				})]
			}),
			activeTab === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/care/LocationCard.tsx:1262:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: (locationHistory || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/care/LocationCard.tsx:1264:13:7f82c0150900aaca402771d948773a206818a8314b3e27408c63cfc9ef77fe51:1",
					className: "text-center py-10 text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-10 w-10 mx-auto mb-2 opacity-40" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/care/LocationCard.tsx:1266:15:9da007b8d0221c8025e2efa094380bd6e00763237487ab5f254093f26e194f3a:1",
							className: "text-sm",
							children: isZh ? "还没有位置记录" : "No location history"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/care/LocationCard.tsx:1267:15:774f26e26f4deeb5b0d0e668bd2c1cc3a1c1179917cbb46d8c4b82c8af999c32:1",
							className: "text-xs mt-1",
							children: isZh ? `${caredOneName}分享位置后，这里会出现记录` : `Location history appears after ${caredOneName} shares their location`
						})
					]
				}) : (locationHistory || []).map((entry, idx) => {
					const lat = parseFloat(entry.latitude);
					const lng = parseFloat(entry.longitude);
					const validPos = Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
					const open = openHistoryId === entry.id;
					const unknown = isZh ? "未知" : "Unknown";
					const yesNo = (v) => v === "Yes" ? isZh ? "是" : "Yes" : v === "No" ? isZh ? "否" : "No" : unknown;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-transparent card-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								"data-inspector-source": "components/care/LocationCard.tsx:1279:17:fb72cc9ecca15757a52d8285987735cf0832e6c3282638fc8310adcfcfd68ddb:1",
								type: "button",
								className: "w-full text-left p-3 flex items-start gap-3",
								onClick: () => setOpenHistoryId(open ? null : entry.id),
								"aria-expanded": open,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "components/care/LocationCard.tsx:1280:19:f958cb2602b35b39cf6d19fdf7daa473485eb06dc679d501a36f736a54632f7a:1",
										className: `w-2 h-2 rounded-full mt-1.5 shrink-0 ${idx === 0 ? "bg-success" : "bg-muted-foreground/40"}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/care/LocationCard.tsx:1281:19:6c7e01a82bed7b5be9659555d26252fa1b29a459f38ae1c7991bc5c13fe68b12:1",
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/care/LocationCard.tsx:1282:21:ef1ddffb4c5df7d044deed3b3ead476a5c17acd1d1f7bc1cab893436e44f4a56:1",
											className: "flex items-center gap-2 flex-wrap",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-source": "components/care/LocationCard.tsx:1283:23:6895024649789d813828f339e150f3afeaef34ea1eed361d32a3fae9a68f5b12:1",
													className: `text-xs font-medium ${idx === 0 ? "text-success" : "text-muted-foreground"}`,
													children: idx === 0 ? isZh ? "最新" : "Latest" : isZh ? "之前" : "Earlier"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-source": "components/care/LocationCard.tsx:1286:23:0d798a89ccd200a86c13d1f95b88c29bd76e53fbe249ca3f42fe27a5a21fa004:1",
													className: "text-xs text-muted-foreground",
													children: formatDateTime(entry.created_at)
												}),
												entry.is_emergency && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "destructive",
													className: "text-[10px]",
													children: isZh ? "紧急定位" : "Emergency"
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "components/care/LocationCard.tsx:1289:21:574d2798a4ac6f19a602a093c8aa66382d2bd43ff74b3928ca8935dd3d43842e:1",
											className: "text-xs text-muted-foreground font-mono",
											children: validPos ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : isZh ? "没有有效位置" : "No valid position"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-4 w-4 mt-1 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}` })
								]
							}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/care/LocationCard.tsx:1296:19:29dcb5126b6211d690ee1abb675a2d41dbd4c7753ba6d4a7580610ca4f98b66e:1",
								className: "px-3 pb-3 pl-8 space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									"data-inspector-source": "components/care/LocationCard.tsx:1297:21:a68b4448a8e2cf38284ca36f6ca250f216553df3dcdc9f22b185b6d014be174f:1",
									className: "grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											"data-inspector-source": "components/care/LocationCard.tsx:1298:23:aabb2045bec01db3983350a950cf8d563ff33c14f2e6122efaa02f7a99fd8141:1",
											className: "text-muted-foreground",
											children: isZh ? "位置" : "Location"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											"data-inspector-source": "components/care/LocationCard.tsx:1299:23:4a760fe760a9024cba5d8048506061d0bc89c961855038a552a42d3b5842f5b4:1",
											className: "break-all",
											children: entry.address_text || (validPos ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : unknown)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											"data-inspector-source": "components/care/LocationCard.tsx:1300:23:54200d610ea272449066ae347b77a1ad267fe7151f77de75ea26674014ad5e05:1",
											className: "text-muted-foreground",
											children: isZh ? "精度" : "Accuracy"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											"data-inspector-source": "components/care/LocationCard.tsx:1301:23:f2d95f97381126bf6057ee9c2f7a65231ebfe90ec96b590600ac33980ad1ee30:1",
											children: entry.accuracy_meters ? `±${Math.round(entry.accuracy_meters)} ${isZh ? "米" : "m"}` : unknown
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											"data-inspector-source": "components/care/LocationCard.tsx:1302:23:95e4deac9e6130547608e160e47608667f9509bb3b11d658172ffd5814f951d7:1",
											className: "text-muted-foreground",
											children: isZh ? "记录时间" : "Recorded"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											"data-inspector-source": "components/care/LocationCard.tsx:1303:23:810a2c272b546f5a8731fecd529be8c0839f5ff692be779ddb3c48ca821362be:1",
											children: formatDateTime(entry.created_at)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											"data-inspector-source": "components/care/LocationCard.tsx:1304:23:7e8b4fc8c048496037570c0eb34f2906d255a149ec38ba85be6deebe9f6657ac:1",
											className: "text-muted-foreground",
											children: isZh ? "使用设备" : "Device"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											"data-inspector-source": "components/care/LocationCard.tsx:1305:23:45081c95e2c0e137350e0cddd9415633deff3f69cd4e5033eeb210443885e690:1",
											children: entry.platform || unknown
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											"data-inspector-source": "components/care/LocationCard.tsx:1306:23:c728ec03fdfe6fba49daab3ac2da059ebbf97b03be44bf69a8671da26480175e:1",
											className: "text-muted-foreground",
											children: isZh ? "移动状态" : "Movement"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											"data-inspector-source": "components/care/LocationCard.tsx:1307:23:eca929cdaa710bdb03eedf6f18caf9fbab91642bb5094ce3718fdeb8e7c8ad0a:1",
											children: entry.moving_type ? {
												stationary: ["静止", "Stationary"],
												walking: ["步行", "Walking"],
												running: ["跑步", "Running"],
												cycling: ["骑行", "Cycling"],
												automotive: ["乘车", "In a vehicle"],
												unknown: ["未知", "Unknown"]
											}[entry.moving_type]?.[isZh ? 0 : 1] ?? unknown : unknown
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											"data-inspector-source": "components/care/LocationCard.tsx:1308:23:25cd8040f220c42df0f797ff65b9af9f0beab7d739709d21d5ac11f78cbdad99:1",
											className: "text-muted-foreground",
											children: isZh ? "电量" : "Battery"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											"data-inspector-source": "components/care/LocationCard.tsx:1309:23:01b63748c0274633234ce4546165e17a249938f1396a8badf38db020a2f9627f:1",
											children: entry.battery_level != null ? `${entry.battery_level}%` : isZh ? "手机未提供" : "Not reported by phone"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											"data-inspector-source": "components/care/LocationCard.tsx:1310:23:13bf1b4d2d700641ef5505fd710d633099eecaabea2fd2f43327fd8620b28498:1",
											className: "text-muted-foreground",
											children: isZh ? "是否在充电" : "Charging"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											"data-inspector-source": "components/care/LocationCard.tsx:1311:23:8641ebdea8a14a7ac6ee3080c73bed99496a09a775a69c4bce49f959f13fcd9f:1",
											children: yesNo(entry.phone_is_charging)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											"data-inspector-source": "components/care/LocationCard.tsx:1312:23:f0d93183561c5eae0145d71d471c4b716304230d381b241a81e50d85da289057:1",
											className: "text-muted-foreground",
											children: isZh ? "记录方式" : "Type"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											"data-inspector-source": "components/care/LocationCard.tsx:1313:23:c450121e94685d11412ca21ff5b41ad282516cc77e0188f3bba5fc2a4328413f:1",
											children: entry.is_emergency ? isZh ? "紧急定位（未开实时分享时）" : "Emergency (live sharing off)" : isZh ? "实时位置分享" : "Live sharing"
										})
									]
								}), validPos && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => {
										const map = leafletMapRef.current;
										if (map) {
											map.setView([lat, lng], 16);
											map.getContainer().scrollIntoView({
												behavior: "smooth",
												block: "center"
											});
										}
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 mr-1" }), isZh ? "在地图上查看" : "Show on map"]
								})]
							})]
						})
					}, entry.id);
				})
			})
		]
	});
}
//#endregion
export { LocationCard_exports as n, LocationCard as t };
