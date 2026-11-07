import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-4rcasKp7.mjs";
import { n as formatDateTime, r as formatTime } from "./locale-DKwjQju2.mjs";
import { Cn as CircleX, Dt as MapPin, Gn as Bell, Jt as Hexagon, Kn as BatteryMedium, L as Shield, Pn as Check, Sn as Circle, Y as Route, _ as TriangleAlert, et as RefreshCw, fn as Crosshair, ft as PenLine, g as Undo2, gt as Navigation, it as Plus, jt as LoaderCircle, nt as Radio, t as Zap, ut as Pencil, vn as Clock, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-C88F3k7U.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-SAioInf-.mjs";
import { t as Checkbox } from "./checkbox-LEE7aLq-.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { b as runSettingSkill } from "./ai-dynamic-knowledge-C5tnjGCy.mjs";
import { a as writeLocationAndCheckZones } from "./source.wordpress-CSA-mU0R.mjs";
import { C as zoneTypeLabel, S as updateSafeZoneWordPress, g as isDangerZone, h as isCustomZone, l as fetchCaredOneLocationHistoryWordPress, m as fetchSafeZonesWordPress, n as ZONE_TYPE_CODES, o as createSafeZoneWordPress, p as fetchSafeZoneAlertsWordPress, r as acknowledgeAlertWordPress, s as deleteSafeZoneWordPress, t as ZONE_TYPE, u as fetchCaredOneLocationSettingsWordPress } from "./source.wordpress-extended-CLFqt_H_.mjs";
import { A as useCareGroups, O as useCareGroupMembers, tn as useLocationShares, yr as useUserCaredOnes } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { t as Switch } from "./switch-Coli7fra.mjs";
import { r as useLocation$1 } from "./router-compat-CRbRSfhz.mjs";
import { n as getCurrentPosition } from "./geolocation-BbrvI7XV.mjs";
import { t as checkBreaches } from "./locationService-BXr8t7Zc.mjs";
import { t as require_leaflet_src } from "../_libs/leaflet.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/GPSTracking-C17Jx3VK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_leaflet_src = /* @__PURE__ */ __toESM(require_leaflet_src());
/**
* Leaflet paints shapes with SVG presentation attributes, which do NOT resolve
* `var(--token)`. Resolve a theme token to a real colour string so map shapes
* are actually visible while still following the design system.
*/
function themeColor(token, fallback) {
	try {
		const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
		return raw ? `hsl(${raw})` : fallback;
	} catch {
		return fallback;
	}
}
/**
* Map-based area picker: a simple radius circle, or a precise custom outline
* drawn point by point. Shared by the GPS page and the safety Places page so
* both write the same CCT 214 shape fields.
*/
function ZoneShapeEditor({ shape, onShapeChange, latitude, longitude, onCenterChange, radiusMeters, onRadiusChange, points, onPointsChange, onUseMyLocation, danger }) {
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const holderRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const layerRef = (0, import_react.useRef)(null);
	const stateRef = (0, import_react.useRef)({
		shape,
		points,
		onPointsChange,
		onCenterChange
	});
	stateRef.current = {
		shape,
		points,
		onPointsChange,
		onCenterChange
	};
	(0, import_react.useEffect)(() => {
		if (!holderRef.current || mapRef.current) return;
		const map = import_leaflet_src.default.map(holderRef.current, { zoomControl: true }).setView([39.9042, 116.4074], 12);
		import_leaflet_src.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>" }).addTo(map);
		map.getContainer().setAttribute("aria-label", Z("区域地图", "Zone map"));
		map.on("click", (e) => {
			const s = stateRef.current;
			const lat = Number(e.latlng.lat.toFixed(6));
			const lng = Number(e.latlng.lng.toFixed(6));
			if (s.shape === "Polygon") s.onPointsChange([...s.points, [lat, lng]]);
			else s.onCenterChange(String(lat), String(lng));
		});
		layerRef.current = import_leaflet_src.default.layerGroup().addTo(map);
		mapRef.current = map;
		const t = window.setTimeout(() => map.invalidateSize(), 250);
		return () => {
			window.clearTimeout(t);
			map.remove();
			mapRef.current = null;
			layerRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		const group = layerRef.current;
		if (!map || !group) return;
		group.clearLayers();
		const color = danger ? "#ef4444" : themeColor("--primary", "#4c1d95");
		if (shape === "Polygon") {
			points.forEach(([lat, lng], i) => {
				import_leaflet_src.default.circleMarker([lat, lng], {
					radius: 5,
					color: "#fff",
					weight: 2,
					fillColor: color,
					fillOpacity: 1
				}).bindTooltip(String(i + 1), { permanent: false }).addTo(group);
			});
			if (points.length >= 3) {
				const poly = import_leaflet_src.default.polygon(points, {
					color,
					weight: 2,
					fillOpacity: .15
				}).addTo(group);
				map.fitBounds(poly.getBounds(), { padding: [30, 30] });
			} else if (points.length > 0) {
				if (points.length === 2) import_leaflet_src.default.polyline(points, {
					color,
					weight: 2,
					dashArray: "5 5"
				}).addTo(group);
				map.panTo(points[points.length - 1]);
			}
			return;
		}
		const lat = Number(latitude);
		const lng = Number(longitude);
		const radius = Number(radiusMeters);
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
		import_leaflet_src.default.circleMarker([lat, lng], {
			radius: 6,
			color: "#fff",
			weight: 3,
			fillColor: color,
			fillOpacity: 1
		}).addTo(group);
		const circle = import_leaflet_src.default.circle([lat, lng], {
			radius: Number.isFinite(radius) && radius > 0 ? radius : 100,
			color,
			weight: 2,
			fillOpacity: .12
		}).addTo(group);
		map.fitBounds(circle.getBounds(), { padding: [30, 30] });
	}, [
		shape,
		points,
		latitude,
		longitude,
		radiusMeters,
		danger
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/div/0",
		"data-inspector-source": "components/location/ZoneShapeEditor.tsx:114:5:2b69ab864b367220d20e2579d6d6e037a90e8f50bc30ed5d9cfd4ac43c641459:1",
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/div/1",
				"data-inspector-source": "components/location/ZoneShapeEditor.tsx:115:7:acb1ef6d1795106abaa313fb0186ce695685431b14b400a7df2e07ff400d4b09:1",
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/Button/0",
					"data-inspector-source": "components/location/ZoneShapeEditor.tsx:116:9:2cbf2afe1b54a91992d854285721d994fd9ad62c98cef20b40ccfc2ba0f045a3:1",
					type: "button",
					variant: shape === "Radius" ? "default" : "outline",
					size: "sm",
					onClick: () => onShapeChange("Radius"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, {
						"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/Circle/0",
						"data-inspector-source": "components/location/ZoneShapeEditor.tsx:122:11:90c1e3657f028408058cc67a3d6d5086f38b5c1ccfff1e376e61120e1b3a5c26:1",
						className: "mr-2 h-4 w-4"
					}), Z("圆形范围", "Circle area")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/Button/1",
					"data-inspector-source": "components/location/ZoneShapeEditor.tsx:125:9:2cbf2afe1b54a91992d854285721d994fd9ad62c98cef20b40ccfc2ba0f045a3:1",
					type: "button",
					variant: shape === "Polygon" ? "default" : "outline",
					size: "sm",
					onClick: () => onShapeChange("Polygon"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, {
						"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/PenLine/0",
						"data-inspector-source": "components/location/ZoneShapeEditor.tsx:131:11:580168f628babe04e748425d93733b5f29348d05cbcae02e302c9ffd2d0144eb:1",
						className: "mr-2 h-4 w-4"
					}), Z("定位范围", "Position area")]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/p/0",
				"data-inspector-source": "components/location/ZoneShapeEditor.tsx:136:7:bb886ba25ccefeda96b9d19c2568999d5bf74f474c14a8f3781465b8a2933d96:1",
				className: "text-xs text-muted-foreground",
				children: shape === "Polygon" ? Z("在地图上依次点击，围出准确范围，至少 3 个点。", "Tap the map point by point to trace the exact area — at least 3 points.") : Z("在地图上点一下就是中心点，再设置范围大小。", "Tap the map to set the centre, then choose how wide the area is.")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/div/2",
				"data-inspector-source": "components/location/ZoneShapeEditor.tsx:142:7:df30bc175c637c61566c1acf8d913b080ef4ac1f87821d7eaffdb76027a4f72e:1",
				ref: holderRef,
				className: "h-64 w-full overflow-hidden rounded-xl border"
			}),
			shape === "Polygon" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/div/3",
				"data-inspector-source": "components/location/ZoneShapeEditor.tsx:145:9:c03659bb24809f4e9ae4a77c22731b0e3f9d5e23131fdb11d7dbe16c8fd938db:1",
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/span/0",
						"data-inspector-source": "components/location/ZoneShapeEditor.tsx:146:11:2a21361b2ad8c220890753104aeee45bd15f20ef433fdbb4cef9d7e63df688b2:1",
						className: "text-xs text-muted-foreground",
						children: isCN ? `已画 ${points.length} 个点` : `${points.length} point${points.length === 1 ? "" : "s"} placed`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/Button/2",
						"data-inspector-source": "components/location/ZoneShapeEditor.tsx:149:11:47da7afe0ed7722377b8ff6b7acd0c92a749325efdb93d76a13647f443d0fa2f:1",
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: () => onPointsChange(points.slice(0, -1)),
						disabled: points.length === 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, {
							"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/Undo2/0",
							"data-inspector-source": "components/location/ZoneShapeEditor.tsx:154:13:e92920fc90c34c60c58147d23ab0a7844b4c5ee41999e678cd7c3069771efdb9:1",
							className: "mr-1 h-4 w-4"
						}), Z("撤销上一个点", "Undo last point")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/Button/3",
						"data-inspector-source": "components/location/ZoneShapeEditor.tsx:157:11:47da7afe0ed7722377b8ff6b7acd0c92a749325efdb93d76a13647f443d0fa2f:1",
						type: "button",
						variant: "ghost",
						size: "sm",
						onClick: () => onPointsChange([]),
						disabled: points.length === 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, {
							"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/XCircle/0",
							"data-inspector-source": "components/location/ZoneShapeEditor.tsx:162:13:a13969fe82a77f9c767e0560dd40bed5d56457c8be6c476247931b5fd634f0e8:1",
							className: "mr-1 h-4 w-4"
						}), Z("全部清除", "Clear all")]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/div/4",
				"data-inspector-source": "components/location/ZoneShapeEditor.tsx:167:9:cc8354a48087dc5aff332c769846a218e8a79c91b18e4f1efd32cda76263771a:1",
				className: "grid gap-2 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/div/5",
					"data-inspector-source": "components/location/ZoneShapeEditor.tsx:168:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/Label/0",
						"data-inspector-source": "components/location/ZoneShapeEditor.tsx:169:13:8acb62b2b10fc9a7474c5e1824d2a67ea98b33807cec6b5b2ba464dffd809522:1",
						htmlFor: "zone-shape-radius",
						children: Z("范围大小（米）", "Area size (metres)")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/Input/0",
						"data-inspector-source": "components/location/ZoneShapeEditor.tsx:170:13:f8dc2d8b298e828184f92f8f9e5eae0e54d3df44a3c49a90dfb735edcc2d1bc1:1",
						id: "zone-shape-radius",
						inputMode: "numeric",
						value: radiusMeters,
						onChange: (e) => onRadiusChange(e.target.value)
					})]
				}), onUseMyLocation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/div/6",
					"data-inspector-source": "components/location/ZoneShapeEditor.tsx:178:13:9b6043299a233ad448d9daec26a0fa8bae79fe3a21e867b2921e4e6346239c4e:1",
					className: "flex items-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/Button/4",
						"data-inspector-source": "components/location/ZoneShapeEditor.tsx:179:15:363c733097bbcde627ab812b8a28492f42f4c83af5f0e9c1e9929b8a4e643327:1",
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: onUseMyLocation,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, {
							"data-inspector-id": "components/location/ZoneShapeEditor/ZoneShapeEditor/Crosshair/0",
							"data-inspector-source": "components/location/ZoneShapeEditor.tsx:180:17:2ebf623a19ba8f3216b63c4327ccd7fb317862af520eeb6bfe77a686534a11f9:1",
							className: "mr-2 h-4 w-4"
						}), Z("用我现在的位置", "Use my current spot")]
					})
				})]
			})
		]
	});
}
/** Datetime pickers speak local time; the CCT keeps a full timestamp. */
function toLocalInput(value) {
	if (!value) return "";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(value) {
	if (!value) return "";
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}
function ZoneScheduleFields({ value, onChange }) {
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/location/ZoneScheduleFields/ZoneScheduleFields/div/0",
		"data-inspector-source": "components/location/ZoneScheduleFields.tsx:43:5:2b69ab864b367220d20e2579d6d6e037a90e8f50bc30ed5d9cfd4ac43c641459:1",
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-id": "components/location/ZoneScheduleFields/ZoneScheduleFields/div/1",
			"data-inspector-source": "components/location/ZoneScheduleFields.tsx:44:7:a4c3287ad016b94b7df04c1452960d934999af850de29804b7b6200075295f72:1",
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/location/ZoneScheduleFields/ZoneScheduleFields/div/2",
				"data-inspector-source": "components/location/ZoneScheduleFields.tsx:45:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					"data-inspector-id": "components/location/ZoneScheduleFields/ZoneScheduleFields/Label/0",
					"data-inspector-source": "components/location/ZoneScheduleFields.tsx:46:11:0aa1b11d4a15ef8046e165e058c9a25602857ea99d5c37f2a53f41df8debaf1a:1",
					className: "text-sm",
					children: Z("只在某段时间内提醒", "Only alert during set times")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "components/location/ZoneScheduleFields/ZoneScheduleFields/p/0",
					"data-inspector-source": "components/location/ZoneScheduleFields.tsx:47:11:888266f5d953d8463cf44438dce0a6b3330f689e4683e9b52beb34cf1d864ca6:1",
					className: "text-xs text-muted-foreground",
					children: Z("关闭时全天都会提醒。", "When off, alerts work around the clock.")
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
				"data-inspector-id": "components/location/ZoneScheduleFields/ZoneScheduleFields/Switch/0",
				"data-inspector-source": "components/location/ZoneScheduleFields.tsx:51:9:ee4c322168556f85c372df91d79f57ecf6384fa08f5931c753a8bf28f60d0451:1",
				checked: value.schedule_enabled,
				onCheckedChange: (v) => onChange({ schedule_enabled: v }),
				"aria-label": Z("只在某段时间内提醒", "Only alert during set times")
			})]
		}), value.schedule_enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-id": "components/location/ZoneScheduleFields/ZoneScheduleFields/div/3",
			"data-inspector-source": "components/location/ZoneScheduleFields.tsx:59:9:cc8354a48087dc5aff332c769846a218e8a79c91b18e4f1efd32cda76263771a:1",
			className: "grid gap-2 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/location/ZoneScheduleFields/ZoneScheduleFields/div/4",
				"data-inspector-source": "components/location/ZoneScheduleFields.tsx:60:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					"data-inspector-id": "components/location/ZoneScheduleFields/ZoneScheduleFields/Label/1",
					"data-inspector-source": "components/location/ZoneScheduleFields.tsx:61:13:75f1c204afb99e87f367b0aa439a230cd94240886b5ce48dd5eba346b208b1f3:1",
					htmlFor: "zone-schedule-start",
					className: "text-sm",
					children: Z("开始", "Starts")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					"data-inspector-id": "components/location/ZoneScheduleFields/ZoneScheduleFields/Input/0",
					"data-inspector-source": "components/location/ZoneScheduleFields.tsx:62:13:f8dc2d8b298e828184f92f8f9e5eae0e54d3df44a3c49a90dfb735edcc2d1bc1:1",
					id: "zone-schedule-start",
					type: "datetime-local",
					value: toLocalInput(value.schedule_start_time),
					onChange: (e) => onChange({ schedule_start_time: fromLocalInput(e.target.value) })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/location/ZoneScheduleFields/ZoneScheduleFields/div/5",
				"data-inspector-source": "components/location/ZoneScheduleFields.tsx:69:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					"data-inspector-id": "components/location/ZoneScheduleFields/ZoneScheduleFields/Label/2",
					"data-inspector-source": "components/location/ZoneScheduleFields.tsx:70:13:e2c5666b8f95b9b961c6e7619b2026fc0edbfb48ac06e71e35797f3da3d71efc:1",
					htmlFor: "zone-schedule-end",
					className: "text-sm",
					children: Z("结束", "Ends")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					"data-inspector-id": "components/location/ZoneScheduleFields/ZoneScheduleFields/Input/1",
					"data-inspector-source": "components/location/ZoneScheduleFields.tsx:71:13:f8dc2d8b298e828184f92f8f9e5eae0e54d3df44a3c49a90dfb735edcc2d1bc1:1",
					id: "zone-schedule-end",
					type: "datetime-local",
					value: toLocalInput(value.schedule_end_time),
					onChange: (e) => onChange({ schedule_end_time: fromLocalInput(e.target.value) })
				})]
			})]
		})]
	});
}
/** Standard three colours the dictionary requires on every zone, plus extras. */
var ZONE_COLOR_PRESETS = [
	"#10B981",
	"#EF4444",
	"#3B82F6",
	"#F59E0B",
	"#8B5CF6",
	"#EC4899",
	"#0EA5E9",
	"#6B7280"
];
/** Default colour per dictionary zone type (a55): Safe green, Danger red, Custom blue. */
function defaultZoneColor(typeCode, codes) {
	if (typeCode === codes.DANGER) return "#EF4444";
	if (typeCode === codes.SAFE) return "#10B981";
	return "#3B82F6";
}
/** Colour any zone is actually painted with — its own colour wins (a59). */
function zoneColorOf(zone, fallback) {
	const c = typeof zone?.color === "string" ? zone.color.trim() : "";
	return /^#[0-9a-fA-F]{3,8}$/.test(c) ? c : fallback;
}
/** Colour chooser for CCT 214 a59 — used by every zone form. */
function ZoneColorPicker({ value, onChange }) {
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/location/ZoneColorPicker/ZoneColorPicker/div/0",
		"data-inspector-source": "components/location/ZoneColorPicker.tsx:35:5:14ed00278e1f988f944b2e295efaa80bcb0c544a2074c16bb2069f8cd6696c34:1",
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			"data-inspector-id": "components/location/ZoneColorPicker/ZoneColorPicker/Label/0",
			"data-inspector-source": "components/location/ZoneColorPicker.tsx:36:7:32b76f02788482d213d8ad07551d138a188ee7be59fc7b4c8c8f24dafe6ec90d:1",
			children: isCN ? "区域颜色" : "Zone colour"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-id": "components/location/ZoneColorPicker/ZoneColorPicker/div/1",
			"data-inspector-source": "components/location/ZoneColorPicker.tsx:37:7:d64b5862047258ce32865dd855bcce51e7af7073283d696a46c854763d2b440d:1",
			className: "flex flex-wrap items-center gap-2",
			children: [ZONE_COLOR_PRESETS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"data-inspector-id": "components/location/ZoneColorPicker/ZoneColorPicker/button/0",
				"data-inspector-source": "components/location/ZoneColorPicker.tsx:39:11:8c368e75324f39218072cbe2158a018716f2db9df494990d6585f50bfb5db9fb:1",
				type: "button",
				"aria-label": c,
				onClick: () => onChange(c),
				className: "flex h-7 w-7 items-center justify-center rounded-full border border-border",
				style: { backgroundColor: c },
				children: value?.toLowerCase() === c.toLowerCase() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					"data-inspector-id": "components/location/ZoneColorPicker/ZoneColorPicker/Check/0",
					"data-inspector-source": "components/location/ZoneColorPicker.tsx:47:58:4d11bb9a75aef45f391397e37cd5dd097637287ba21930a7b1928666bf301b9d:1",
					className: "h-4 w-4 text-white"
				})
			}, c)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				"data-inspector-id": "components/location/ZoneColorPicker/ZoneColorPicker/input/0",
				"data-inspector-source": "components/location/ZoneColorPicker.tsx:50:9:2347c48cc7d674b8aafe9d7f0292f073e1761629e180454d45eb08ab8b4c6600:1",
				type: "color",
				"aria-label": isCN ? "自选颜色" : "Pick a colour",
				value: /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#3B82F6",
				onChange: (e) => onChange(e.target.value),
				className: "h-7 w-10 cursor-pointer rounded-sm border border-border bg-transparent p-0"
			})]
		})]
	});
}
var POLL_INTERVAL = 15e3;
var TRAIL_MAX_POINTS = 200;
function GPSTracking() {
	const { t, i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const { toast } = useToast();
	const routerLocation = useLocation$1();
	const site = useSite();
	const { data: locationShares, isLoading, refetch } = useLocationShares(POLL_INTERVAL, site.family === "notchsafety" || site.id === "notchsafety" ? "group" : "cared-ones");
	const [selectedPerson, setSelectedPerson] = (0, import_react.useState)(null);
	const [shareMyLocation, setShareMyLocation] = (0, import_react.useState)(false);
	const [geofenceAlerts, setGeofenceAlerts] = (0, import_react.useState)(true);
	const [updatingShare, setUpdatingShare] = (0, import_react.useState)(false);
	const [sosDialogOpen, setSosDialogOpen] = (0, import_react.useState)(false);
	const [sosSending, setSosSending] = (0, import_react.useState)(false);
	const [activeTab, setActiveTab] = (0, import_react.useState)(typeof window !== "undefined" && window.location.pathname.startsWith("/places") ? "zones" : typeof window !== "undefined" && window.location.pathname.startsWith("/alerts") ? "alerts" : "map");
	const [alerts, setAlerts] = (0, import_react.useState)([]);
	const [zones, setZones] = (0, import_react.useState)([]);
	const [trailData, setTrailData] = (0, import_react.useState)({});
	const [customNameDraft, setCustomNameDraft] = (0, import_react.useState)("");
	const emptyZoneForm = {
		id: "",
		zone_type: ZONE_TYPE.SAFE,
		shape_type: "Radius",
		polygon_points: [],
		color: defaultZoneColor(ZONE_TYPE.SAFE, ZONE_TYPE),
		latitude: "",
		longitude: "",
		radius_meters: "100",
		notify_on_enter: true,
		notify_on_exit: true,
		schedule_enabled: false,
		schedule_start_time: "",
		schedule_end_time: "",
		is_active: true,
		receiver_ids: []
	};
	const [zoneDialogOpen, setZoneDialogOpen] = (0, import_react.useState)(false);
	const [zoneForm, setZoneForm] = (0, import_react.useState)({ ...emptyZoneForm });
	const [zoneSaving, setZoneSaving] = (0, import_react.useState)(false);
	const [zoneDeletingId, setZoneDeletingId] = (0, import_react.useState)(null);
	const [mapNode, setMapNode] = (0, import_react.useState)(null);
	const mapRef = (0, import_react.useRef)(null);
	const leafletMap = (0, import_react.useRef)(null);
	const markersRef = (0, import_react.useRef)([]);
	const trailLinesRef = (0, import_react.useRef)([]);
	const zoneLayers = (0, import_react.useRef)([]);
	const lastBreach = (0, import_react.useRef)({});
	const { user } = useAuth();
	const userId = user?.user_id ?? null;
	const { data: careGroups } = useCareGroups();
	const { data: groupMembers } = useCareGroupMembers((careGroups || [])[0]?.id ? String(careGroups[0].id) : null);
	const { data: myCaredOnes } = useUserCaredOnes();
	const [subjectId, setSubjectId] = (0, import_react.useState)("");
	const caredOneOptions = (() => {
		const seen = /* @__PURE__ */ new Set();
		const out = [];
		const push = (uid, name) => {
			const key = String(uid ?? "").replace(/^wp-/, "");
			if (!key || seen.has(key)) return;
			seen.add(key);
			out.push({
				id: key,
				name: name || t("common.unknown")
			});
		};
		(myCaredOnes || []).forEach((c) => push(c.cared_one_user_id ?? c.user_id ?? c.id, c.cared_one?.full_name || c.full_name || c.display_name || c.name));
		if (site.family === "notchsafety" || site.id === "notchsafety") (groupMembers || []).filter((m) => m.is_cared_one).forEach((m) => push(m.user_id ?? m.id, m.display_name || m.profile?.full_name));
		return out;
	})();
	const selfKey = String(userId ?? "").replace(/^wp-/, "");
	const effectiveSubjectId = subjectId || (caredOneOptions.length === 1 ? caredOneOptions[0].id : selfKey);
	const selfIsCaredOne = (groupMembers || []).some((m) => String(m.user_id ?? m.id).replace(/^wp-/, "") === selfKey && m.is_cared_one);
	(0, import_react.useEffect)(() => {
		if (!userId) return;
		(async () => {
			try {
				if ((await fetchCaredOneLocationSettingsWordPress(effectiveSubjectId))?.sharing_enabled) setShareMyLocation(true);
			} catch {}
		})();
	}, [userId, effectiveSubjectId]);
	(0, import_react.useEffect)(() => {
		if (!userId) return;
		(async () => {
			try {
				const [z, a] = await Promise.all([fetchSafeZonesWordPress(effectiveSubjectId), fetchSafeZoneAlertsWordPress(effectiveSubjectId)]);
				setZones(z);
				setAlerts(a);
			} catch {}
		})();
	}, [userId, effectiveSubjectId]);
	const nameByUserId = (() => {
		const map = {};
		const put = (uid, name) => {
			const key = String(uid ?? "").replace(/^wp-/, "");
			if (!key || !name || map[key]) return;
			map[key] = String(name);
		};
		(groupMembers || []).forEach((m) => put(m.user_id ?? m.id, m.display_name || m.profile?.full_name || m.profile?.email));
		caredOneOptions.forEach((c) => put(c.id, c.name));
		put(selfKey, user?.user_metadata?.full_name || user?.email);
		return map;
	})();
	const people = (locationShares || []).map((ls) => {
		const lat = parseFloat(ls.latitude) || 0;
		const lng = parseFloat(ls.longitude) || 0;
		const key = String(ls.user_id ?? "").replace(/^wp-/, "");
		const stampMs = ls.updated_at ? typeof ls.updated_at === "number" ? ls.updated_at * 1e3 : new Date(ls.updated_at).getTime() : 0;
		return {
			id: ls.id,
			userId: ls.user_id,
			name: ls.profile?.full_name || nameByUserId[key] || t("common.unknown"),
			avatar_url: ls.profile?.avatar_url || ls.user_avatar,
			lastLocation: ls.address_text || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
			coordinates: {
				lat,
				lng
			},
			lastUpdated: ls.updated_at ? formatTime(typeof ls.updated_at === "number" ? ls.updated_at * 1e3 : ls.updated_at, "en", {
				hour: "numeric",
				minute: "2-digit"
			}) : "",
			lastSeenMs: Number.isFinite(stampMs) ? stampMs : 0,
			battery: ls.battery_level != null ? Math.round(Number(ls.battery_level)) : null,
			isCharging: ls.phone_is_charging === "Yes" || ls.phone_is_charging === true,
			movingType: ls.moving_type || null,
			status: "active",
			isSharing: ls.sharing_status !== "off" && ls.is_sharing_enabled !== false
		};
	});
	const sharingPeople = people.filter((p) => p.isSharing && p.coordinates.lat && p.coordinates.lng);
	const receiverCandidates = (() => {
		const seen = /* @__PURE__ */ new Set();
		const out = [];
		const push = (uid, name) => {
			const key = String(uid ?? "").replace(/^wp-/, "");
			if (!key || seen.has(key)) return;
			seen.add(key);
			out.push({
				id: key,
				userId: key,
				name: name || t("common.unknown")
			});
		};
		(groupMembers || []).forEach((m) => push(m.user_id ?? m.id, m.display_name || m.profile?.full_name || m.profile?.email));
		people.forEach((p) => push(p.userId, p.name));
		return out;
	})();
	(0, import_react.useEffect)(() => {
		if (!sharingPeople.length) return;
		(async () => {
			const trails = {};
			await Promise.all(sharingPeople.map(async (p) => {
				try {
					const history = await fetchCaredOneLocationHistoryWordPress(p.userId);
					trails[p.userId] = history.filter((h) => h.latitude && h.longitude).slice(0, TRAIL_MAX_POINTS).map((h) => [Number(h.latitude), Number(h.longitude)]).reverse();
				} catch {
					trails[p.userId] = [];
				}
			}));
			setTrailData(trails);
		})();
	}, [sharingPeople.length]);
	(0, import_react.useEffect)(() => {
		if (!mapNode) return;
		const map = import_leaflet_src.map(mapNode, { zoomControl: true }).setView([39.8283, -98.5795], 4);
		import_leaflet_src.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>" }).addTo(map);
		const mapContainer = map.getContainer();
		mapContainer.setAttribute("aria-label", Z("位置地图", "Location map"));
		mapContainer.querySelector(".leaflet-control-zoom-in")?.setAttribute("aria-label", Z("放大地图", "Zoom in"));
		mapContainer.querySelector(".leaflet-control-zoom-out")?.setAttribute("aria-label", Z("缩小地图", "Zoom out"));
		leafletMap.current = map;
		const t = window.setTimeout(() => map.invalidateSize(), 200);
		const ro = new ResizeObserver(() => map.invalidateSize());
		ro.observe(mapNode);
		return () => {
			window.clearTimeout(t);
			ro.disconnect();
			map.remove();
			leafletMap.current = null;
			markersRef.current = [];
			trailLinesRef.current = [];
			zoneLayers.current = [];
		};
	}, [mapNode]);
	(0, import_react.useEffect)(() => {
		const map = leafletMap.current;
		if (!map) return;
		zoneLayers.current.forEach((l) => map.removeLayer(l));
		zoneLayers.current = [];
		zones.filter((z) => z.is_active).forEach((zone) => {
			const isDanger = isDangerZone(String(zone.zone_type));
			const isPolygon = String(zone.shape_type).toLowerCase() === "polygon";
			const label = zoneLabel(String(zone.zone_type), zone.zone_name);
			const color = zoneColorOf(zone, isDanger ? "#EF4444" : themeColor("--primary", "#4c1d95"));
			if (isPolygon && zone.polygon_points?.length >= 3) {
				const poly = import_leaflet_src.polygon(zone.polygon_points, {
					color,
					weight: 2,
					fillOpacity: .15,
					dashArray: isDanger ? "6 4" : void 0
				}).addTo(map);
				poly.bindPopup(`<b>${label}</b>`);
				zoneLayers.current.push(poly);
			} else if (zone.latitude && zone.longitude) {
				const circle = import_leaflet_src.circle([zone.latitude, zone.longitude], {
					radius: zone.radius_meters || 100,
					color,
					weight: 2,
					fillOpacity: .12,
					dashArray: isDanger ? "6 4" : void 0
				}).addTo(map);
				circle.bindPopup(`<b>${label}</b><br/>${Z("半径", "Radius")}: ${zone.radius_meters || 100}m`);
				zoneLayers.current.push(circle);
			}
		});
		if (zoneLayers.current.length && !sharingPeople.length) {
			const bounds = import_leaflet_src.featureGroup(zoneLayers.current).getBounds();
			if (bounds.isValid()) map.fitBounds(bounds, {
				padding: [40, 40],
				maxZoom: 15
			});
		}
	}, [
		zones,
		mapNode,
		sharingPeople.length
	]);
	(0, import_react.useEffect)(() => {
		const map = leafletMap.current;
		if (!map) return;
		markersRef.current.forEach((m) => m.remove());
		markersRef.current = [];
		trailLinesRef.current.forEach((l) => l.remove());
		trailLinesRef.current = [];
		if (sharingPeople.length === 0) return;
		sharingPeople.forEach((person) => {
			const initials = person.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
			const icon = import_leaflet_src.divIcon({
				className: "custom-marker",
				html: `<div style="width:40px;height:40px;border-radius:50%;background:hsl(var(--primary));color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);cursor:pointer;position:relative">
          ${initials}
          <span style="position:absolute;bottom:-2px;right:-2px;width:12px;height:12px;border-radius:50%;background:hsl(var(--primary));border:2px solid white"></span>
        </div>`,
				iconSize: [40, 40],
				iconAnchor: [20, 20]
			});
			const marker = import_leaflet_src.marker([person.coordinates.lat, person.coordinates.lng], { icon }).addTo(map).bindPopup(`<b>${person.name}</b><br/>${Z("最近上线", "Last seen")}: ${person.lastUpdated}<br/>${person.lastLocation}`);
			marker.on("click", () => setSelectedPerson(person));
			markersRef.current.push(marker);
			const trail = trailData[person.userId];
			if (trail && trail.length > 1) {
				const polyline = import_leaflet_src.polyline(trail, {
					color: themeColor("--primary", "#4c1d95"),
					weight: 3,
					opacity: .6,
					dashArray: "4 6"
				}).addTo(map);
				trailLinesRef.current.push(polyline);
			}
		});
		if (sharingPeople.length === 1) map.setView([sharingPeople[0].coordinates.lat, sharingPeople[0].coordinates.lng], 14);
		else {
			const bounds = import_leaflet_src.latLngBounds(sharingPeople.map((p) => [p.coordinates.lat, p.coordinates.lng]));
			map.fitBounds(bounds, { padding: [50, 50] });
		}
	}, [
		sharingPeople.length,
		locationShares,
		trailData,
		mapNode
	]);
	(0, import_react.useEffect)(() => {
		if (!geofenceAlerts || !zones.length || !sharingPeople.length) return;
		sharingPeople.forEach((person) => {
			checkBreaches(person.coordinates.lat, person.coordinates.lng, zones).forEach((breach) => {
				const dedupKey = `${person.userId}-${breach.zoneId}-${breach.alertType}`;
				const lastTime = lastBreach.current[dedupKey] || 0;
				const now = Date.now();
				if (now - lastTime < 300 * 1e3) return;
				lastBreach.current[dedupKey] = now;
				toast({
					title: breach.alertType === "entered_danger_zone" ? Z("⚠️ 危险区域警报", "⚠️ Danger Zone Alert") : Z("📍 安全区域警报", "📍 Safe Zone Alert"),
					description: `${person.name} — ${Z({
						entered_danger_zone: "进入危险区域",
						exited_safe_zone: "离开安全区域",
						entered_safe_zone: "进入安全区域"
					}[breach.alertType] || breach.alertType, breach.alertType.replace(/_/g, " "))} (${breach.zoneName})`,
					variant: breach.alertType.includes("danger") ? "destructive" : "default"
				});
			});
		});
	}, [
		locationShares,
		zones,
		geofenceAlerts
	]);
	(0, import_react.useEffect)(() => {
		if (!shareMyLocation || !userId) return;
		const sendMyLocation = async () => {
			try {
				const pos = await getCurrentPosition({ timeout: 1e4 });
				if (!pos) return;
				await writeLocationAndCheckZones(pos.latitude, pos.longitude, {
					accuracy: pos.accuracy,
					is_cared_one: selfIsCaredOne
				});
			} catch {}
		};
		sendMyLocation();
		const interval = setInterval(sendMyLocation, POLL_INTERVAL);
		return () => clearInterval(interval);
	}, [
		shareMyLocation,
		userId,
		selfIsCaredOne
	]);
	(0, import_react.useEffect)(() => {
		if (selectedPerson?.coordinates?.lat && leafletMap.current) leafletMap.current.setView([selectedPerson.coordinates.lat, selectedPerson.coordinates.lng], 15);
	}, [selectedPerson]);
	const handleToggleShare = async (checked) => {
		setShareMyLocation(checked);
		setUpdatingShare(true);
		try {
			if (!userId) return;
			await runSettingSkill("set-location-sharing", {
				enabled: checked,
				isCaredOne: selfIsCaredOne
			});
			refetch();
			toast({ title: checked ? t("gps.locationSharingEnabled") : t("gps.locationSharingDisabled") });
		} catch {
			if (checked) {
				setShareMyLocation(false);
				toast({
					title: t("gps.couldNotGetLocation"),
					description: t("gps.enableLocationAccess"),
					variant: "destructive"
				});
			}
		} finally {
			setUpdatingShare(false);
		}
	};
	const handleRefresh = () => {
		refetch().then(() => {
			toast({ title: t("gps.locationsUpdated") });
		});
	};
	const handleSOS = async () => {
		setSosSending(true);
		try {
			if (!userId) throw new Error(Z("未登录", "Not authenticated"));
			const pos = await getCurrentPosition({ timeout: 8e3 });
			await writeLocationAndCheckZones(pos?.latitude ?? 0, pos?.longitude ?? 0, {
				accuracy: pos?.accuracy,
				isEmergency: true,
				is_cared_one: selfIsCaredOne
			});
			refetch();
			setSosDialogOpen(false);
			toast({
				title: t("gps.sosSuccess"),
				description: pos ? t("gps.sosSuccessDesc", { groups: site.navLabels.careGroups.toLowerCase() }) : t("gps.sosWithoutLocation", "SOS alert sent without location. Your care circle has been notified.")
			});
		} catch (err) {
			toast({
				title: t("gps.sosFailed"),
				description: err.message || t("gps.sosFailedDesc"),
				variant: "destructive"
			});
		} finally {
			setSosSending(false);
		}
	};
	const handleAcknowledgeAlert = async (alertId) => {
		try {
			await acknowledgeAlertWordPress(alertId);
			setAlerts((prev) => prev.map((a) => a.id === alertId ? {
				...a,
				is_read: true
			} : a));
		} catch {}
	};
	const reloadZones = async () => {
		if (!userId) return;
		try {
			const rows = await fetchSafeZonesWordPress(effectiveSubjectId);
			setZones(rows);
		} catch {}
	};
	const zoneLabel = (code, zoneName) => zoneTypeLabel(code, zoneName ?? null, isCN);
	const openNewZone = () => {
		const center = leafletMap.current?.getCenter();
		setZoneForm({
			...emptyZoneForm,
			latitude: center ? center.lat.toFixed(6) : "",
			longitude: center ? center.lng.toFixed(6) : ""
		});
		setCustomNameDraft("");
		setZoneDialogOpen(true);
	};
	const openEditZone = (zone) => {
		setCustomNameDraft(isCustomZone(String(zone.zone_type)) ? String(zone.zone_name || "") : "");
		const pts = Array.isArray(zone.polygon_points) ? zone.polygon_points : [];
		setZoneForm({
			id: String(zone.id),
			zone_type: String(zone.zone_type),
			shape_type: String(zone.shape_type).toLowerCase() === "polygon" && pts.length >= 3 ? "Polygon" : "Radius",
			polygon_points: pts,
			latitude: zone.latitude != null ? String(zone.latitude) : "",
			longitude: zone.longitude != null ? String(zone.longitude) : "",
			radius_meters: String(zone.radius_meters ?? 100),
			color: zoneColorOf(zone, defaultZoneColor(String(zone.zone_type), ZONE_TYPE)),
			notify_on_enter: !!zone.notify_on_enter,
			notify_on_exit: !!zone.notify_on_exit,
			schedule_enabled: !!zone.schedule_enabled,
			schedule_start_time: zone.schedule_start_time || "",
			schedule_end_time: zone.schedule_end_time || "",
			is_active: !!zone.is_active,
			receiver_ids: Array.isArray(zone.receiver_ids) ? zone.receiver_ids.map(String) : []
		});
		setZoneDialogOpen(true);
	};
	const useMyLocationForZone = async () => {
		try {
			const pos = await getCurrentPosition({ timeout: 1e4 });
			if (!pos) throw new Error("no position");
			setZoneForm((f) => ({
				...f,
				latitude: pos.latitude.toFixed(6),
				longitude: pos.longitude.toFixed(6)
			}));
		} catch {
			toast({
				title: t("gps.couldNotGetLocation"),
				description: t("gps.enableLocationAccess"),
				variant: "destructive"
			});
		}
	};
	const handleSaveZone = async () => {
		const isPolygon = zoneForm.shape_type === "Polygon";
		const points = zoneForm.polygon_points;
		const radius = Number(zoneForm.radius_meters);
		const isCustom = isCustomZone(zoneForm.zone_type);
		if (isCustom && !customNameDraft.trim()) {
			toast({
				title: Z("请填写自定义区域名称", "Custom zone name is required"),
				variant: "destructive"
			});
			return;
		}
		let lat = Number(zoneForm.latitude);
		let lng = Number(zoneForm.longitude);
		if (isPolygon) {
			if (points.length < 3) {
				toast({
					title: Z("手绘范围至少需要 3 个点", "A drawn area needs at least 3 points"),
					variant: "destructive"
				});
				return;
			}
			lat = points.reduce((s, p) => s + p[0], 0) / points.length;
			lng = points.reduce((s, p) => s + p[1], 0) / points.length;
		}
		if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
			toast({
				title: Z("这个位置填得不对，请在地图上重新选一次", "That location doesn't look right — please pick the spot on the map again"),
				variant: "destructive"
			});
			return;
		}
		if (!isPolygon && (!Number.isFinite(radius) || radius < 20)) {
			toast({
				title: Z("范围至少要 20 米", "Please make the area at least 20 metres wide"),
				variant: "destructive"
			});
			return;
		}
		setZoneSaving(true);
		try {
			const payload = {
				zone_type: zoneForm.zone_type,
				zone_name: isCustom ? customNameDraft.trim() : "",
				shape_type: isPolygon ? "Polygon" : "Radius",
				polygon_points: isPolygon ? points : [],
				latitude: Number(lat.toFixed(6)),
				longitude: Number(lng.toFixed(6)),
				radius_meters: isPolygon ? 0 : Math.round(radius),
				color: zoneForm.color,
				notify_on_enter: zoneForm.notify_on_enter,
				notify_on_exit: zoneForm.notify_on_exit,
				schedule_enabled: zoneForm.schedule_enabled,
				schedule_start_time: zoneForm.schedule_enabled ? zoneForm.schedule_start_time : "",
				schedule_end_time: zoneForm.schedule_enabled ? zoneForm.schedule_end_time : "",
				is_active: zoneForm.is_active,
				user_id: effectiveSubjectId,
				receiver_ids: zoneForm.receiver_ids
			};
			if (zoneForm.id) await updateSafeZoneWordPress(zoneForm.id, payload);
			else await createSafeZoneWordPress(payload);
			await reloadZones();
			setZoneDialogOpen(false);
			toast({ title: zoneForm.id ? Z("区域已更新", "Zone updated") : Z("区域已创建", "Zone created") });
		} catch (err) {
			toast({
				title: Z("保存失败", "Save failed"),
				description: err?.message,
				variant: "destructive"
			});
		} finally {
			setZoneSaving(false);
		}
	};
	const handleDeleteZone = async (zone) => {
		setZoneDeletingId(String(zone.id));
		try {
			await deleteSafeZoneWordPress(String(zone.id));
			setZones((prev) => prev.filter((z) => String(z.id) !== String(zone.id)));
			toast({ title: Z("区域已删除", "Zone deleted") });
		} catch (err) {
			toast({
				title: Z("删除失败", "Delete failed"),
				description: err?.message,
				variant: "destructive"
			});
		} finally {
			setZoneDeletingId(null);
		}
	};
	const handleToggleZoneActive = async (zone, next) => {
		setZones((prev) => prev.map((z) => String(z.id) === String(zone.id) ? {
			...z,
			is_active: next
		} : z));
		try {
			await updateSafeZoneWordPress(String(zone.id), { is_active: next });
		} catch (err) {
			setZones((prev) => prev.map((z) => String(z.id) === String(zone.id) ? {
				...z,
				is_active: !next
			} : z));
			toast({
				title: Z("更新失败", "Update failed"),
				description: err?.message,
				variant: "destructive"
			});
		}
	};
	const dangerZoneCount = zones.filter((z) => isDangerZone(String(z.zone_type))).length;
	const unreadAlerts = alerts.filter((a) => !a.is_read);
	const locatorMode = site.id === "notchsafety";
	const locatorPlaces = locatorMode && routerLocation.pathname.startsWith("/places");
	const lastSeenLabel = (ms) => {
		if (!ms) return Z("暂无位置", "No location yet");
		const mins = Math.max(0, Math.round((Date.now() - ms) / 6e4));
		if (mins < 1) return Z("刚刚", "Just now");
		if (mins < 60) return Z(`${mins} 分钟前`, `${mins} min ago`);
		const hrs = Math.round(mins / 60);
		if (hrs < 24) return Z(`${hrs} 小时前`, `${hrs} h ago`);
		return Z(`${Math.round(hrs / 24)} 天前`, `${Math.round(hrs / 24)} d ago`);
	};
	const movingLabel = (word) => {
		if (!word || word === "unknown") return "";
		return Z({
			stationary: "静止",
			walking: "步行",
			running: "跑步",
			cycling: "骑行",
			automotive: "乘车"
		}[word] || "", word);
	};
	const zonesPanel = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		"data-inspector-id": "pages/GPSTracking/zonesPanel/Card/0",
		"data-inspector-source": "pages/GPSTracking.tsx:684:5:361b72a9932b9a2e80c11375a968bc01d241b7d501547dded35951b1465bc544:1",
		className: "border-transparent card-elevated",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			"data-inspector-id": "pages/GPSTracking/zonesPanel/CardContent/0",
			"data-inspector-source": "pages/GPSTracking.tsx:685:7:e2ab063b240bb02f9d89acf5194c4f1b5f7133849b4213dae4dd41060aafecc3:1",
			className: "py-4 space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/GPSTracking/zonesPanel/div/0",
					"data-inspector-source": "pages/GPSTracking.tsx:686:9:71740d6e22098adce0984d91fc869b458a95848731a9984649c1ef4a08594932:1",
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/GPSTracking/zonesPanel/p/0",
						"data-inspector-source": "pages/GPSTracking.tsx:687:11:888266f5d953d8463cf44438dce0a6b3330f689e4683e9b52beb34cf1d864ca6:1",
						className: "text-xs text-muted-foreground",
						children: Z("在此创建和管理安全区域与危险区域。", "Create and manage safe and danger zones here.")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/GPSTracking/zonesPanel/Button/0",
						"data-inspector-source": "pages/GPSTracking.tsx:690:11:94594d7dacd42ee4c60476db3fcb37f951bdd10f2cacb05a93fcffba49426d12:1",
						size: "sm",
						onClick: openNewZone,
						className: "shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							"data-inspector-id": "pages/GPSTracking/zonesPanel/Plus/0",
							"data-inspector-source": "pages/GPSTracking.tsx:691:13:f658dc0cb85c27f4fddbef3beffb61836807b6ff99ea370691c0ee88bc282a79:1",
							className: "h-4 w-4 mr-1"
						}), Z("新建区域", "New zone")]
					})]
				}),
				caredOneOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/GPSTracking/zonesPanel/div/1",
					"data-inspector-source": "pages/GPSTracking.tsx:696:11:3f9900155b9635e4cbcd3bd763bae7c2b90165b4f1b83fed4d27f4715acbdd41:1",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						"data-inspector-id": "pages/GPSTracking/zonesPanel/Label/0",
						"data-inspector-source": "pages/GPSTracking.tsx:697:13:039277c292cabd0dc5836124fb433e9c9e22d4d64f0d87104dd70fbb15cbfd34:1",
						className: "text-xs text-muted-foreground shrink-0",
						children: Z("区域属于", "Areas for")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						"data-inspector-id": "pages/GPSTracking/zonesPanel/Select/0",
						"data-inspector-source": "pages/GPSTracking.tsx:700:13:a778bcf21cd4b25e617af24b4206160866a5d23a640d559c9ca1aa5fbd5fe75a:1",
						value: effectiveSubjectId,
						onValueChange: setSubjectId,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							"data-inspector-id": "pages/GPSTracking/zonesPanel/SelectTrigger/0",
							"data-inspector-source": "pages/GPSTracking.tsx:701:15:0e79f88128b5fedf634607cf7d988f1edcda889b40f8d8610b684900d4999260:1",
							className: "h-9 max-w-[240px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
								"data-inspector-id": "pages/GPSTracking/zonesPanel/SelectValue/0",
								"data-inspector-source": "pages/GPSTracking.tsx:702:17:195d3841cee1575fa2840c204dd65283affa03759f7ccdc0952f1a13ef9ae195:1"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
							"data-inspector-id": "pages/GPSTracking/zonesPanel/SelectContent/0",
							"data-inspector-source": "pages/GPSTracking.tsx:704:15:ae408a9a0eb603258ac9cdccc03ecf6ae5e4251c802090da93a407cf5feafb57:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								"data-inspector-id": "pages/GPSTracking/zonesPanel/SelectItem/0",
								"data-inspector-source": "pages/GPSTracking.tsx:705:17:acf90d9cf0d415a22172d001d3bd4082fa0c1c63f5a6b83a5ddd61cc1e0a7aeb:1",
								value: selfKey,
								children: Z("我自己", "Myself")
							}), caredOneOptions.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								"data-inspector-id": "pages/GPSTracking/zonesPanel/SelectItem/1",
								"data-inspector-source": "pages/GPSTracking.tsx:707:19:647315ada0a6f2af0297fc70c4ea896cc34b8d2b4922e3e331e0ff24aee03ebd:1",
								value: c.id,
								children: c.name
							}, c.id))]
						})]
					})]
				}),
				zones.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "pages/GPSTracking/zonesPanel/p/1",
					"data-inspector-source": "pages/GPSTracking.tsx:714:11:e96f72331790988ceed5fc42b52c499e0ec611c5fd9850adaa2063c3f1f90e32:1",
					className: "text-sm text-muted-foreground text-center py-8",
					children: t("gps.noZones", "No areas set up yet")
				}) : zones.map((zone) => {
					const isDanger = isDangerZone(String(zone.zone_type));
					const isPolygon = String(zone.shape_type).toLowerCase() === "polygon";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/GPSTracking/zonesPanel/div/2",
						"data-inspector-source": "pages/GPSTracking.tsx:720:15:d9a98a80c9040d0e1aa83c5c7dd40de2023c7cada75779a1a9114ad80595720c:1",
						className: "p-3 rounded-lg bg-muted/50 border border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/GPSTracking/zonesPanel/div/3",
							"data-inspector-source": "pages/GPSTracking.tsx:721:17:c7ab0eaaef672610c63daa1ba5cc48ba62a4036e6d4738badfe0a7aebc205439:1",
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/GPSTracking/zonesPanel/div/4",
								"data-inspector-source": "pages/GPSTracking.tsx:722:19:63953ac657d88ba75690d4a4166d25c2c2b729517fea0213cfc3405493f99ae1:1",
								className: "flex items-center gap-2 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "pages/GPSTracking/zonesPanel/div/5",
									"data-inspector-source": "pages/GPSTracking.tsx:723:21:642e6f61ec9241fbba09d0b19842c133d6a7a3bf6bb239f26929c534f391898b:1",
									className: `w-3 h-3 rounded-full shrink-0 ${isDanger ? "bg-destructive" : "bg-success"}`
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/GPSTracking/zonesPanel/p/2",
									"data-inspector-source": "pages/GPSTracking.tsx:724:21:a518561f2f8f80a85db45a6f4ca1c5ede27817be248a8abbe908929bebe06c09:1",
									className: "text-sm font-medium text-foreground truncate",
									children: zoneLabel(String(zone.zone_type), zone.zone_name)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/GPSTracking/zonesPanel/div/6",
								"data-inspector-source": "pages/GPSTracking.tsx:726:19:02410339759fece7c64429346bbef57225583dbe6b48a9753ce7abd718186fa6:1",
								className: "flex items-center gap-1 shrink-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										"data-inspector-id": "pages/GPSTracking/zonesPanel/Switch/0",
										"data-inspector-source": "pages/GPSTracking.tsx:727:21:9af743b1e7b61a25621699eba5a34c0419d2fce596df7f23ec36b7465cd21d64:1",
										checked: !!zone.is_active,
										onCheckedChange: (v) => handleToggleZoneActive(zone, v),
										"aria-label": Z("启用区域", "Zone active")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										"data-inspector-id": "pages/GPSTracking/zonesPanel/Button/1",
										"data-inspector-source": "pages/GPSTracking.tsx:732:21:719f545cccf4555c2877aaed85c3facafff630b3b14efccbd6a5e8d4dd7090c0:1",
										variant: "ghost",
										size: "icon",
										className: "h-8 w-8",
										onClick: () => openEditZone(zone),
										"aria-label": Z("编辑", "Edit"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
											"data-inspector-id": "pages/GPSTracking/zonesPanel/Pencil/0",
											"data-inspector-source": "pages/GPSTracking.tsx:733:23:f4c513e9a89af044bf00a5c589e96d716f364b39d0d8ec9b5e16853194891718:1",
											className: "h-4 w-4"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										"data-inspector-id": "pages/GPSTracking/zonesPanel/Button/2",
										"data-inspector-source": "pages/GPSTracking.tsx:735:21:f78eb0d3971a8bb1961070c6eb62ce8e6cd943a164ed8f8de3e28a31c77337dc:1",
										variant: "ghost",
										size: "icon",
										className: "h-8 w-8 text-destructive",
										onClick: () => handleDeleteZone(zone),
										disabled: zoneDeletingId === String(zone.id),
										"aria-label": Z("删除", "Delete"),
										children: zoneDeletingId === String(zone.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
											"data-inspector-id": "pages/GPSTracking/zonesPanel/Loader2/0",
											"data-inspector-source": "pages/GPSTracking.tsx:744:27:3a5d01c796e30205e23208c1f50686be00d99c5f04e7676d057d3991843c318e:1",
											className: "h-4 w-4 animate-spin"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
											"data-inspector-id": "pages/GPSTracking/zonesPanel/Trash2/0",
											"data-inspector-source": "pages/GPSTracking.tsx:745:27:d13200e72506af13ff5008d233bf65c38a2ae986c522f967afe55bd8830bdda6:1",
											className: "h-4 w-4"
										})
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							"data-inspector-id": "pages/GPSTracking/zonesPanel/p/3",
							"data-inspector-source": "pages/GPSTracking.tsx:749:17:1ba736aae822138a4f8a0eebee709e7d9e37134e05cd387de6b48a215ec26bd3:1",
							className: "text-xs text-muted-foreground mt-1",
							children: [
								isPolygon ? `${Z("手绘范围", "Drawn area")} (${zone.polygon_points?.length || 0} ${Z("个点", "points")})` : `${Z("半径", "Radius")}: ${zone.radius_meters || 100}m`,
								" · ",
								isDanger ? Z("⚠️ 危险", "⚠️ Danger") : zoneLabel(String(zone.zone_type), zone.zone_name),
								" · ",
								zone.is_active ? t("common.active", "Active") : t("common.inactive", "Inactive"),
								" · ",
								zone.notify_on_enter ? Z("到达提醒", "Arrival alerts") : Z("不提醒到达", "No arrival alerts"),
								" · ",
								zone.notify_on_exit ? Z("离开提醒", "Leaving alerts") : Z("不提醒离开", "No leaving alerts")
							]
						})]
					}, zone.id);
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/GPSTracking/GPSTracking/div/0",
		"data-inspector-source": "pages/GPSTracking.tsx:765:5:712c0192aa37b93e031b9267701cf232c7f9e2bb67e08ddf86badc381d76aa44:1",
		className: locatorMode ? "" : "max-w-6xl mx-auto px-4 py-5",
		children: [
			!locatorMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/GPSTracking/GPSTracking/div/1",
				"data-inspector-source": "pages/GPSTracking.tsx:768:7:bc3d93d19c93f0f0b17885ec0b3429016aab36317082d2694525526267887603:1",
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/GPSTracking/GPSTracking/div/2",
					"data-inspector-source": "pages/GPSTracking.tsx:769:9:ad6704f0e73e2aaf5297b25ad967181462ad8d1550149ddfe9e7f973738162c1:1",
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/GPSTracking/GPSTracking/h1/0",
						"data-inspector-source": "pages/GPSTracking.tsx:770:11:c750812786ffdbcf96c5a85ec89583ea3fe975097489cc76f53f72fd0f7cc86b:1",
						className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
						children: t("gps.gpsTracking")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-inspector-id": "pages/GPSTracking/GPSTracking/p/0",
						"data-inspector-source": "pages/GPSTracking.tsx:771:11:e3a38bf295f15cf4cc87b1686a4511bf4e046d2682a32fa8bbba8a76c24946de:1",
						className: "text-xs sm:text-sm text-muted-foreground mt-0.5",
						children: [t("gps.realtimeLocation"), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							"data-inspector-id": "pages/GPSTracking/GPSTracking/span/0",
							"data-inspector-source": "pages/GPSTracking.tsx:773:13:d6030aae7ce716104e967822bf238604d06ba3c7eb19ce57c7dc2235a70a1f1c:1",
							className: "ml-2 inline-block whitespace-nowrap text-xs text-muted-foreground/70",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/Radio/0",
								"data-inspector-source": "pages/GPSTracking.tsx:774:15:368b4f3e39f7dcdacce5b6257c321da3826de1354674c9b806da60ad275c5e14:1",
								className: "inline h-3 w-3 mr-1 text-success"
							}), t("gps.autoRefresh", "Auto-refreshing")]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/GPSTracking/GPSTracking/div/3",
					"data-inspector-source": "pages/GPSTracking.tsx:779:9:986d29164597bbc65a926257dcc71814a2e06629f1e2b848c2c73f55f379f420:1",
					className: "flex gap-2 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/GPSTracking/GPSTracking/Button/0",
						"data-inspector-source": "pages/GPSTracking.tsx:780:11:a304955c3745f86e89c5db23d5f96d283c58742d6499abbf3f8284d3ad34eafb:1",
						variant: "outline",
						size: "sm",
						onClick: handleRefresh,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/RefreshCw/0",
								"data-inspector-source": "pages/GPSTracking.tsx:781:13:a93ade02428d61aaf50091eb4d044584f1eccec36c0da1fd0b59ee213283c9d4:1",
								className: "h-4 w-4 mr-1"
							}),
							" ",
							t("common.refresh")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/GPSTracking/GPSTracking/Button/1",
						"data-inspector-source": "pages/GPSTracking.tsx:783:11:cc8cfd44d8dc9c04f28f219dd57b199231ec5ed939dc38cd7cd302cd8ee294c3:1",
						variant: "destructive",
						size: "sm",
						onClick: () => setSosDialogOpen(true),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/AlertTriangle/0",
								"data-inspector-source": "pages/GPSTracking.tsx:784:13:6bf65f956935e873d7d3f8cd4ca89d27a62bf19076a0dba2aff20fd23ef56b06:1",
								className: "h-4 w-4 mr-1"
							}),
							" ",
							t("gps.sos")
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				"data-inspector-id": "pages/GPSTracking/GPSTracking/Dialog/0",
				"data-inspector-source": "pages/GPSTracking.tsx:792:7:8481a2565404aa57746145121b9194a5c15bf055f802f122dbfdfcc837f49c5c:1",
				open: sosDialogOpen,
				onOpenChange: setSosDialogOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					"data-inspector-id": "pages/GPSTracking/GPSTracking/DialogContent/0",
					"data-inspector-source": "pages/GPSTracking.tsx:793:9:a1db9351f2bc97608c8aaec7c954792a0a22e6a3d66d076f63a06f6c1dd1b96a:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
						"data-inspector-id": "pages/GPSTracking/GPSTracking/DialogHeader/0",
						"data-inspector-source": "pages/GPSTracking.tsx:794:11:f3baf1571d8ce48392ac850c82c313f167b22021224d9cc9f1db77c5581f7169:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							"data-inspector-id": "pages/GPSTracking/GPSTracking/DialogTitle/0",
							"data-inspector-source": "pages/GPSTracking.tsx:795:13:14e622b24a08a12c619f5e00012bd65a9768abba0de45ddb674ea713f93ca056:1",
							className: "flex items-center gap-2 text-destructive",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/AlertTriangle/1",
									"data-inspector-source": "pages/GPSTracking.tsx:796:15:25119e4ed04fd3efda9a2731df878da0fdd23b0cbb1a6f95b0ac883d1dfd3ed2:1",
									className: "h-5 w-5"
								}),
								" ",
								t("gps.emergencySOS")
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							"data-inspector-id": "pages/GPSTracking/GPSTracking/DialogDescription/0",
							"data-inspector-source": "pages/GPSTracking.tsx:798:13:51b58bd6f771492fe8f328f8b6b32808a35fbee191088e76e53a5f41905e432b:1",
							children: t("gps.sosDesc", { groups: site.navLabels.careGroups.toLowerCase() })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						"data-inspector-id": "pages/GPSTracking/GPSTracking/DialogFooter/0",
						"data-inspector-source": "pages/GPSTracking.tsx:802:11:2c4588d35c249cf1d1499cf531ad3910d7d3824ab72c5418afd40b67526d5f10:1",
						className: "gap-2 sm:gap-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "pages/GPSTracking/GPSTracking/Button/2",
							"data-inspector-source": "pages/GPSTracking.tsx:803:13:64a7096d6c9333404bdced9d3cd3042ff06cef4742862bcfc1f52264f6c32f23:1",
							variant: "outline",
							onClick: () => setSosDialogOpen(false),
							disabled: sosSending,
							children: t("common.cancel")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "pages/GPSTracking/GPSTracking/Button/3",
							"data-inspector-source": "pages/GPSTracking.tsx:806:13:54ac5ab17a0f27c82b026d44704c85917703e176969670905a72e5eb7bcb1f3e:1",
							variant: "destructive",
							onClick: handleSOS,
							disabled: sosSending,
							children: sosSending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/Loader2/0",
									"data-inspector-source": "pages/GPSTracking.tsx:807:31:99081e8c252c560d134b9df63aeeeea0a184e1c1b49fa640020c28328bffc53c:1",
									className: "h-4 w-4 animate-spin mr-2"
								}),
								" ",
								t("gps.sosConfirmSending")
							] }) : t("gps.sendSOS")
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				"data-inspector-id": "pages/GPSTracking/GPSTracking/Dialog/1",
				"data-inspector-source": "pages/GPSTracking.tsx:814:7:24ce7160e14ebab701ee9b263361b7e9ed8bc1864c0a4078cfbdd53ecd121cfe:1",
				open: zoneDialogOpen,
				onOpenChange: setZoneDialogOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					"data-inspector-id": "pages/GPSTracking/GPSTracking/DialogContent/1",
					"data-inspector-source": "pages/GPSTracking.tsx:815:9:1a207e6ec273e6e993dfe85ab335af839b63f1f1585406748ac1a850740af3a2:1",
					className: "max-h-[90vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							"data-inspector-id": "pages/GPSTracking/GPSTracking/DialogHeader/1",
							"data-inspector-source": "pages/GPSTracking.tsx:816:11:f3baf1571d8ce48392ac850c82c313f167b22021224d9cc9f1db77c5581f7169:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/DialogTitle/1",
								"data-inspector-source": "pages/GPSTracking.tsx:817:13:c15677cb541d768a5dff24ae7b2861da9af7371992010546de7ce915fccaf083:1",
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hexagon, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/Hexagon/0",
									"data-inspector-source": "pages/GPSTracking.tsx:818:15:c886876603a638f4a28df16374faee2114c5e3dacf019f9e0d976b6650171b31:1",
									className: "h-5 w-5 text-primary"
								}), zoneForm.id ? Z("编辑区域", "Edit zone") : Z("新建区域", "New zone")]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/DialogDescription/1",
								"data-inspector-source": "pages/GPSTracking.tsx:821:13:51b58bd6f771492fe8f328f8b6b32808a35fbee191088e76e53a5f41905e432b:1",
								children: Z("设置区域中心、半径和提醒方式。", "Set the zone centre, radius and alert rules.")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/GPSTracking/GPSTracking/div/4",
							"data-inspector-source": "pages/GPSTracking.tsx:826:11:08a74e1722a7423a395edd9885a6271c3983ac7a96edf7622caf915c2e23ad90:1",
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/div/5",
									"data-inspector-source": "pages/GPSTracking.tsx:827:13:0bd137aee249026a5dcadda5560dc6aa5052211c8c1d3dfb27198b058ac36b71:1",
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/Label/0",
										"data-inspector-source": "pages/GPSTracking.tsx:828:15:0b1505cc22c6b016ad910f97d6643db8b0115c8a2a0593f8c09bd7d739e6bacf:1",
										children: Z("区域类型", "Zone type")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/div/6",
										"data-inspector-source": "pages/GPSTracking.tsx:829:15:6e41bbe2c9adf4bd6ff63ada306d6ceb91d667e7785aa942bfa79a4f5847fdde:1",
										className: "grid grid-cols-3 gap-2",
										children: ZONE_TYPE_CODES.map((code) => {
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Button/4",
												"data-inspector-source": "pages/GPSTracking.tsx:833:21:f78eb0d3971a8bb1961070c6eb62ce8e6cd943a164ed8f8de3e28a31c77337dc:1",
												type: "button",
												size: "sm",
												className: "truncate",
												variant: zoneForm.zone_type === code ? isDangerZone(code) ? "destructive" : "default" : "outline",
												onClick: () => {
													setZoneForm((f) => ({
														...f,
														zone_type: code,
														color: defaultZoneColor(code, ZONE_TYPE)
													}));
													if (!isCustomZone(code)) setCustomNameDraft("");
												},
												children: [isDangerZone(code) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
													"data-inspector-id": "pages/GPSTracking/GPSTracking/AlertTriangle/2",
													"data-inspector-source": "pages/GPSTracking.tsx:844:45:e95e4f7f32c22853fc0ac1d8069777026030c9e16f268a3cef50ca18b769124f:1",
													className: "h-4 w-4 mr-1"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
													"data-inspector-id": "pages/GPSTracking/GPSTracking/Shield/0",
													"data-inspector-source": "pages/GPSTracking.tsx:844:90:e95e4f7f32c22853fc0ac1d8069777026030c9e16f268a3cef50ca18b769124f:1",
													className: "h-4 w-4 mr-1"
												}), zoneLabel(code)]
											}, code);
										})
									})]
								}),
								isCustomZone(zoneForm.zone_type) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/div/7",
									"data-inspector-source": "pages/GPSTracking.tsx:853:15:b4bebc0b60d26b0514d35cee98a10b62cec4c5f27d831ace94297a63a10fd9b0:1",
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/Label/1",
										"data-inspector-source": "pages/GPSTracking.tsx:854:17:27fa9a8be86a8f022577e3f46d7f6e3394a640354383481c8e929c1801b88c9b:1",
										htmlFor: "zone-custom-name",
										children: Z("自定义区域名称", "Custom zone name")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/Input/0",
										"data-inspector-source": "pages/GPSTracking.tsx:857:17:1b672057fcea09067ce1ce6e6cb5f341eea03edbf9b8a51780a399aa3c5ba37f:1",
										id: "zone-custom-name",
										value: customNameDraft,
										onChange: (e) => setCustomNameDraft(e.target.value),
										placeholder: Z("例如：日托中心", "e.g. \"Day centre\"")
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoneColorPicker, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/ZoneColorPicker/0",
									"data-inspector-source": "pages/GPSTracking.tsx:867:13:10fc8930bd1b7175627f169143a56842fcf64ef2239f3c2d56e670ddf0a8d505:1",
									value: zoneForm.color,
									onChange: (c) => setZoneForm((f) => ({
										...f,
										color: c
									}))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoneShapeEditor, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/ZoneShapeEditor/0",
									"data-inspector-source": "pages/GPSTracking.tsx:869:13:8017f6121cb1d3b2f42128c56e23e5cc413ca00ab4ad85ebf67709d61e26786c:1",
									shape: zoneForm.shape_type,
									onShapeChange: (s) => setZoneForm((f) => ({
										...f,
										shape_type: s
									})),
									latitude: zoneForm.latitude,
									longitude: zoneForm.longitude,
									onCenterChange: (lat, lng) => setZoneForm((f) => ({
										...f,
										latitude: lat,
										longitude: lng
									})),
									radiusMeters: zoneForm.radius_meters,
									onRadiusChange: (r) => setZoneForm((f) => ({
										...f,
										radius_meters: r
									})),
									points: zoneForm.polygon_points,
									onPointsChange: (p) => setZoneForm((f) => ({
										...f,
										polygon_points: p
									})),
									onUseMyLocation: useMyLocationForZone,
									danger: isDangerZone(zoneForm.zone_type)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/div/8",
									"data-inspector-source": "pages/GPSTracking.tsx:884:13:611b7e71d225e897fe95c120f276df8e89d67cdeaa7cbc7843c3e8d445d282b2:1",
									className: "space-y-3 rounded-lg border border-border p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/div/9",
											"data-inspector-source": "pages/GPSTracking.tsx:885:15:a9077605babd609cd10539bc1e3dc7ae031793a024439419627ac092b11b41c3:1",
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Label/2",
												"data-inspector-source": "pages/GPSTracking.tsx:886:17:321ff41a2c90f19660852a91c9fcd3b72fb97e24be01dbad61816a44e3fa236d:1",
												className: "text-sm",
												children: Z("进入时提醒", "Alert on entry")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Switch/0",
												"data-inspector-source": "pages/GPSTracking.tsx:887:17:8c689f21461cc74c7daa582a6d5c16d0186cd022631cb6fd8ec48ec13e75db84:1",
												checked: zoneForm.notify_on_enter,
												onCheckedChange: (v) => setZoneForm((f) => ({
													...f,
													notify_on_enter: v
												}))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/div/10",
											"data-inspector-source": "pages/GPSTracking.tsx:890:15:a9077605babd609cd10539bc1e3dc7ae031793a024439419627ac092b11b41c3:1",
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Label/3",
												"data-inspector-source": "pages/GPSTracking.tsx:891:17:ea11b93e7bb95ba53c8314ca2c4cc78cfa85f2bb16cf1eaab0c36ab65c314e85:1",
												className: "text-sm",
												children: Z("离开时提醒", "Alert on exit")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Switch/1",
												"data-inspector-source": "pages/GPSTracking.tsx:892:17:fafb8a7ed59a9ba7b24f8c6b73027294e73e548426379b43596a3b46ebb9fb05:1",
												checked: zoneForm.notify_on_exit,
												onCheckedChange: (v) => setZoneForm((f) => ({
													...f,
													notify_on_exit: v
												}))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/div/11",
											"data-inspector-source": "pages/GPSTracking.tsx:895:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Label/4",
												"data-inspector-source": "pages/GPSTracking.tsx:896:17:29f7b6e9e3edc88cb89c216d627acca902addfb3a0cc1a6c4d169914a8e3cd86:1",
												className: "text-sm",
												children: Z("提醒接收人（对该被护理人的所有区域生效）", "Alert receivers (apply to all zones of this person)")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/div/12",
												"data-inspector-source": "pages/GPSTracking.tsx:897:17:232ff939d429ece9b8161101540316eb4d5b63438ec43ab87b53a22983ebda96:1",
												className: "mt-2 max-h-32 overflow-auto rounded-md border p-2 space-y-2",
												children: [receiverCandidates.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													"data-inspector-id": "pages/GPSTracking/GPSTracking/p/1",
													"data-inspector-source": "pages/GPSTracking.tsx:899:21:32f56058ce17e8d0d90d67a3c5f953eb414781d91835b9e6d998eec4e8d1738d:1",
													className: "text-xs text-muted-foreground",
													children: Z("暂无可选成员", "No members available")
												}), receiverCandidates.map((pp) => {
													const pid = String(pp.userId ?? "").replace(/^wp-/, "");
													const checked = zoneForm.receiver_ids.some((r) => String(r).replace(/^wp-/, "") === pid);
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
														"data-inspector-id": "pages/GPSTracking/GPSTracking/label/0",
														"data-inspector-source": "pages/GPSTracking.tsx:905:23:1c7c0b1588615d37ee1104ec11e0910339d7171a1ac65e50e5d2b9c688a4f15b:1",
														className: "flex items-center gap-2 text-sm cursor-pointer",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
															"data-inspector-id": "pages/GPSTracking/GPSTracking/Checkbox/0",
															"data-inspector-source": "pages/GPSTracking.tsx:906:25:fcc4859cd057c42cd41b063507e665b01ddb08aed8979e0285fe6f76a50458e5:1",
															checked,
															onCheckedChange: () => setZoneForm((f) => ({
																...f,
																receiver_ids: checked ? f.receiver_ids.filter((r) => String(r).replace(/^wp-/, "") !== pid) : [...f.receiver_ids, pid]
															}))
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															"data-inspector-id": "pages/GPSTracking/GPSTracking/span/1",
															"data-inspector-source": "pages/GPSTracking.tsx:915:25:0e3f045d0826217e462a9470abca89d8dd067e4e1521de01e9a3e08335093718:1",
															children: pp.name
														})]
													}, pp.id);
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoneScheduleFields, {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/ZoneScheduleFields/0",
											"data-inspector-source": "pages/GPSTracking.tsx:922:15:c5137135e6a324965059c1a96fb1d4eab6446f0b624c1b620c7735fe50884bd8:1",
											value: zoneForm,
											onChange: (next) => setZoneForm((f) => ({
												...f,
												...next
											}))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/div/13",
											"data-inspector-source": "pages/GPSTracking.tsx:927:15:a9077605babd609cd10539bc1e3dc7ae031793a024439419627ac092b11b41c3:1",
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Label/5",
												"data-inspector-source": "pages/GPSTracking.tsx:928:17:2c0c120ff30019a7df779bddb978be4f23b1ecc4c3cc5c5887de94a7da1db345:1",
												className: "text-sm",
												children: Z("启用此区域", "Zone active")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Switch/2",
												"data-inspector-source": "pages/GPSTracking.tsx:929:17:0af4fc88ae8bf66fe8fd19c8bc9674737a578457582509f7f3d6c17ab63644f5:1",
												checked: zoneForm.is_active,
												onCheckedChange: (v) => setZoneForm((f) => ({
													...f,
													is_active: v
												}))
											})]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							"data-inspector-id": "pages/GPSTracking/GPSTracking/DialogFooter/1",
							"data-inspector-source": "pages/GPSTracking.tsx:935:11:2c4588d35c249cf1d1499cf531ad3910d7d3824ab72c5418afd40b67526d5f10:1",
							className: "gap-2 sm:gap-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/Button/5",
								"data-inspector-source": "pages/GPSTracking.tsx:936:13:649d065869d8892ba343b97a566ffa3e09ed8dd52cc9504fc9b0e5b17a22b21e:1",
								variant: "outline",
								onClick: () => setZoneDialogOpen(false),
								disabled: zoneSaving,
								children: t("common.cancel")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/Button/6",
								"data-inspector-source": "pages/GPSTracking.tsx:939:13:678b0e4590adfe7eede77faca035997e8c8b5c58d762259944accf98bc9d6112:1",
								onClick: handleSaveZone,
								disabled: zoneSaving,
								children: zoneSaving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/Loader2/1",
										"data-inspector-source": "pages/GPSTracking.tsx:940:31:1875de29c1e1673f1824563b25d27decd55f4b4ab58269d6eabeee04891a63ea:1",
										className: "h-4 w-4 animate-spin mr-2"
									}),
									" ",
									t("common.saving", "Saving...")
								] }) : t("common.save", "Save")
							})]
						})
					]
				})
			}),
			locatorMode ? locatorPlaces ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/GPSTracking/GPSTracking/div/14",
				"data-inspector-source": "pages/GPSTracking.tsx:951:11:5370823bc6c0bb34e10a99e767a509c627875bd3bd3aaca03f6bffb087804bd7:1",
				className: "px-4 py-4 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/GPSTracking/GPSTracking/h1/1",
						"data-inspector-source": "pages/GPSTracking.tsx:952:13:812c242ae135ad3e4c9f85346018a1cee4d577d8a7bbe3788f749c1270b72638:1",
						className: "text-xl font-bold tracking-tight",
						children: Z("地点", "Places")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/GPSTracking/GPSTracking/p/2",
						"data-inspector-source": "pages/GPSTracking.tsx:953:13:7092a605bb0ee468f54cfd5cd2af559f4d0717ca74addc443319cf46d0cfdc7a:1",
						className: "text-xs text-muted-foreground",
						children: Z("家人到达或离开这些地点时，你会收到提醒。", "You get a push when family arrive at or leave these places.")
					}),
					zonesPanel
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/GPSTracking/GPSTracking/div/15",
				"data-inspector-source": "pages/GPSTracking.tsx:960:11:4ac264ea0efe13cd6678c47a2a5ca0706e3518a72db315ad355a3a057b26f43a:1",
				className: "relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/GPSTracking/GPSTracking/div/16",
						"data-inspector-source": "pages/GPSTracking.tsx:961:13:fa57c5eef02c89773b2e766e44a02483d2a1bf0a1cc17a5fe84bea858f0142ea:1",
						ref: (node) => {
							mapRef.current = node;
							setMapNode(node);
						},
						className: "h-[calc(100dvh-11.5rem)] w-full md:h-[calc(100dvh-9rem)]"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/GPSTracking/GPSTracking/div/17",
						"data-inspector-source": "pages/GPSTracking.tsx:967:13:70e49b9e4edc19f86d442655e2dd4810901bffda56d3f6822aa0b15cd479453b:1",
						className: "pointer-events-none absolute right-3 top-3 z-[500] flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/Button/7",
								"data-inspector-source": "pages/GPSTracking.tsx:968:15:07f77ad16dcf60707111099b7ffe94ca8bfc5a0b826f92ea7219e3e2cfb16e6f:1",
								variant: "secondary",
								size: "icon",
								className: "pointer-events-auto shadow-lg",
								onClick: handleRefresh,
								"aria-label": t("common.refresh"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/RefreshCw/1",
									"data-inspector-source": "pages/GPSTracking.tsx:975:17:3777dcd0a48a3411cc750de30a0b83693bf51261c81b2ee7c74c0c7685de6f39:1",
									className: "h-4 w-4"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/Button/8",
								"data-inspector-source": "pages/GPSTracking.tsx:977:15:07f77ad16dcf60707111099b7ffe94ca8bfc5a0b826f92ea7219e3e2cfb16e6f:1",
								variant: "secondary",
								size: "icon",
								className: "pointer-events-auto shadow-lg",
								onClick: async () => {
									const pos = await getCurrentPosition({ timeout: 8e3 }).catch(() => null);
									if (pos && leafletMap.current) leafletMap.current.setView([pos.latitude, pos.longitude], 15);
								},
								"aria-label": Z("回到我的位置", "Centre on me"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/Crosshair/0",
									"data-inspector-source": "pages/GPSTracking.tsx:987:17:ba6e02eca812ae6b4822271a953747b156f232e1bd664524e646204d898b3e77:1",
									className: "h-4 w-4"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/Button/9",
								"data-inspector-source": "pages/GPSTracking.tsx:989:15:07f77ad16dcf60707111099b7ffe94ca8bfc5a0b826f92ea7219e3e2cfb16e6f:1",
								variant: "destructive",
								size: "icon",
								className: "pointer-events-auto shadow-lg",
								onClick: () => setSosDialogOpen(true),
								"aria-label": t("gps.sos"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/AlertTriangle/3",
									"data-inspector-source": "pages/GPSTracking.tsx:996:17:008658740582bcb4cbd55060c7ce854f12d5320067deefed71909cf667ace4db:1",
									className: "h-4 w-4"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/GPSTracking/GPSTracking/div/18",
						"data-inspector-source": "pages/GPSTracking.tsx:1001:13:24b1212038d613f7ffcd4f23d36dff8d2f57659f121cf482fdb0d15a6147dc8b:1",
						className: "absolute inset-x-0 bottom-0 z-[500] max-h-[52%] overflow-y-auto rounded-t-2xl border-t bg-background/95 backdrop-blur px-3 pb-3 pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.12)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/div/19",
								"data-inspector-source": "pages/GPSTracking.tsx:1002:15:aa850bbc4832a8394f1a8f94c63aae0d4d6a1e4d0b93418cdda54b91a766994c:1",
								className: "mx-auto mb-2 h-1 w-10 rounded-full bg-muted-foreground/30"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/div/20",
								"data-inspector-source": "pages/GPSTracking.tsx:1003:15:fa189a8024d75a3cf811fb2c8974498749742bbf68fd296352292c119fea18e8:1",
								className: "mb-2 flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/p/3",
									"data-inspector-source": "pages/GPSTracking.tsx:1004:17:40a3f8870bff091c376006602038f5a32ed4bebc97b2283cd1b641df160354ba:1",
									className: "text-sm font-semibold",
									children: t("gps.trackedPeople")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/div/21",
									"data-inspector-source": "pages/GPSTracking.tsx:1005:17:ddda52a954e0b7361f4465e4102ec5e0196544c94ac144760245f0dab7b3e0c6:1",
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/Label/6",
										"data-inspector-source": "pages/GPSTracking.tsx:1006:19:f055fc75e107d39640036cabe7aad99c98895455f013c42b081a96ee91ec22ce:1",
										htmlFor: "locator-share",
										className: "text-xs text-muted-foreground",
										children: t("gps.shareMyLocation")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/Switch/3",
										"data-inspector-source": "pages/GPSTracking.tsx:1009:19:2b5d46c6217d41ba950ea0ddc824abd9fd14e9e94fafa46fa570bdd7560371e3:1",
										id: "locator-share",
										"aria-label": t("gps.shareMyLocation"),
										checked: shareMyLocation,
										onCheckedChange: handleToggleShare,
										disabled: updatingShare
									})]
								})]
							}),
							isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/div/22",
								"data-inspector-source": "pages/GPSTracking.tsx:1020:17:16c7f99aa0bffb0d6242ad539e06e511b26c22b3b170f7ec31c28c3aedffe0fc:1",
								className: "flex justify-center py-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/Loader2/2",
									"data-inspector-source": "pages/GPSTracking.tsx:1020:59:16c7f99aa0bffb0d6242ad539e06e511b26c22b3b170f7ec31c28c3aedffe0fc:1",
									className: "h-5 w-5 animate-spin text-muted-foreground"
								})
							}) : people.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/p/4",
								"data-inspector-source": "pages/GPSTracking.tsx:1022:17:bf63e66cf1cec08d729251ae1b7d9838b2b4281e4230d09c8f8599433b2fa6fc:1",
								className: "py-6 text-center text-sm text-muted-foreground",
								children: t("gps.noLocationShares")
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/ul/0",
								"data-inspector-source": "pages/GPSTracking.tsx:1024:17:a5ce6d21e3463af92eddb02d1f449fc4297948b05d872fb6ef698554b549a1dd:1",
								className: "space-y-1.5",
								children: people.map((p) => {
									const active = selectedPerson?.id === p.id;
									const trailPoints = trailData[p.userId]?.length || 0;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/li/0",
										"data-inspector-source": "pages/GPSTracking.tsx:1029:23:1f67b8a835834f201706bc734fa5bb59ff0c13d1ee797c1099c3543a59b0be3d:1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/button/0",
											"data-inspector-source": "pages/GPSTracking.tsx:1030:25:bd14c58dec5b3fe07c94bdbfdaeddcc281a0be3d696ffbf25044f010329e2cc4:1",
											type: "button",
											onClick: () => setSelectedPerson(p),
											"aria-current": active ? "true" : void 0,
											className: `flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${active ? "border-primary/40 bg-accent" : "border-transparent bg-muted/50 hover:bg-accent/60"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-id": "pages/GPSTracking/GPSTracking/div/23",
													"data-inspector-source": "pages/GPSTracking.tsx:1038:27:bd5b4c68aaa9b45e0adc7a15bf640a33f07660321a47772bda362e2d55560bdf:1",
													className: "relative shrink-0",
													children: [p.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
														"data-inspector-id": "pages/GPSTracking/GPSTracking/img/0",
														"data-inspector-source": "pages/GPSTracking.tsx:1040:31:25911bae1d4c73ebfad6e0b99cc362203f6c7c815e152a726e9a336353fccf5b:1",
														src: p.avatar_url,
														alt: "",
														className: "h-10 w-10 rounded-full object-cover"
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														"data-inspector-id": "pages/GPSTracking/GPSTracking/div/24",
														"data-inspector-source": "pages/GPSTracking.tsx:1042:31:a2c8f7829b835fac87bf9e050f078680110a7d2277244ee0a29ef55cf4b25ad5:1",
														className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary",
														children: p.name.charAt(0)
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														"data-inspector-id": "pages/GPSTracking/GPSTracking/span/2",
														"data-inspector-source": "pages/GPSTracking.tsx:1046:29:0af68b3ff139937432a0b5ab0cfe18c281346c4b88a5df0648025e72ec1a1557:1",
														className: `absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${p.isSharing ? "bg-success" : "bg-muted-foreground/40"}`
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-id": "pages/GPSTracking/GPSTracking/div/25",
													"data-inspector-source": "pages/GPSTracking.tsx:1048:27:e5a83513e87ef0e200081a112e79b9a84c0e337e92e542b14712dd03ac098fd2:1",
													className: "min-w-0 flex-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															"data-inspector-id": "pages/GPSTracking/GPSTracking/div/26",
															"data-inspector-source": "pages/GPSTracking.tsx:1049:29:5eaa5140fbf24194a97af71f844b9eb8c002417f801342b737a85943493e53d5:1",
															className: "flex items-center gap-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																"data-inspector-id": "pages/GPSTracking/GPSTracking/p/5",
																"data-inspector-source": "pages/GPSTracking.tsx:1050:31:ec68f3e34204cd85df0dd24fac788aa27c3abb1d5032978033f5bfc3c2cc1615:1",
																className: "truncate text-sm font-medium",
																children: p.name
															}), !p.isSharing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																"data-inspector-id": "pages/GPSTracking/GPSTracking/Badge/0",
																"data-inspector-source": "pages/GPSTracking.tsx:1052:33:51115a69a1c8038138188268b43ba2c2560073d3928be5f74dcd33a3cf1d1715:1",
																variant: "secondary",
																className: "text-[10px]",
																children: t("gps.notSharing")
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															"data-inspector-id": "pages/GPSTracking/GPSTracking/p/6",
															"data-inspector-source": "pages/GPSTracking.tsx:1055:29:21b765c7850c09704e936e5cea6aeff5bf8d8546afee5d0f518641f2c60abdee:1",
															className: "truncate text-xs text-muted-foreground",
															children: p.lastLocation
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															"data-inspector-id": "pages/GPSTracking/GPSTracking/p/7",
															"data-inspector-source": "pages/GPSTracking.tsx:1056:29:f97d81510ab20bdf0841c7dc3eb037549993025b2e7a9c502b920e7b4d26dddf:1",
															className: "mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	"data-inspector-id": "pages/GPSTracking/GPSTracking/span/3",
																	"data-inspector-source": "pages/GPSTracking.tsx:1057:31:fe8998511724f2ef7a27e7d20d6e76071f96aeff25f10cc42722d4dcf44bcd9c:1",
																	className: "inline-flex items-center gap-1",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
																		"data-inspector-id": "pages/GPSTracking/GPSTracking/Clock/0",
																		"data-inspector-source": "pages/GPSTracking.tsx:1058:33:a793438337e69be4d735e971c8e3be681e80fa405549463199ed01368f6ffe33:1",
																		className: "h-3 w-3"
																	}), lastSeenLabel(p.lastSeenMs)]
																}),
																p.battery != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	"data-inspector-id": "pages/GPSTracking/GPSTracking/span/4",
																	"data-inspector-source": "pages/GPSTracking.tsx:1061:33:54bea10d0105f3edb62bfdf44eb47d9f1b05f0240965e9e07ce9a55eb6486b42:1",
																	className: `inline-flex items-center gap-1 ${p.battery <= 15 && !p.isCharging ? "text-destructive" : ""}`,
																	children: [
																		p.isCharging ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
																			"data-inspector-id": "pages/GPSTracking/GPSTracking/Zap/0",
																			"data-inspector-source": "pages/GPSTracking.tsx:1062:51:39f036d0a73bf53ec5024645ed3c7bac1c88397949cb747b42aa70cdb0411de7:1",
																			className: "h-3 w-3"
																		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BatteryMedium, {
																			"data-inspector-id": "pages/GPSTracking/GPSTracking/BatteryMedium/0",
																			"data-inspector-source": "pages/GPSTracking.tsx:1062:81:39f036d0a73bf53ec5024645ed3c7bac1c88397949cb747b42aa70cdb0411de7:1",
																			className: "h-3 w-3"
																		}),
																		p.battery,
																		"%"
																	]
																}),
																movingLabel(p.movingType) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	"data-inspector-id": "pages/GPSTracking/GPSTracking/span/5",
																	"data-inspector-source": "pages/GPSTracking.tsx:1067:33:2c8d24bc4be0360cfd035c62860ad6855c5081bc70d92634b1ce6c9e4c3f8d77:1",
																	className: "inline-flex items-center gap-1",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {
																		"data-inspector-id": "pages/GPSTracking/GPSTracking/Navigation/0",
																		"data-inspector-source": "pages/GPSTracking.tsx:1068:35:8221d33687bb64783f1da64af35e01971bfd3e320349f164cfc0955c5bc6fbb3:1",
																		className: "h-3 w-3"
																	}), movingLabel(p.movingType)]
																}),
																trailPoints > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	"data-inspector-id": "pages/GPSTracking/GPSTracking/span/6",
																	"data-inspector-source": "pages/GPSTracking.tsx:1072:33:2c8d24bc4be0360cfd035c62860ad6855c5081bc70d92634b1ce6c9e4c3f8d77:1",
																	className: "inline-flex items-center gap-1",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
																		"data-inspector-id": "pages/GPSTracking/GPSTracking/Route/0",
																		"data-inspector-source": "pages/GPSTracking.tsx:1073:35:f8db919ab54c03cb184f33176583eb020f75caf10832106c6ee5c878215dbf20:1",
																		className: "h-3 w-3"
																	}), Z(`${trailPoints} 个轨迹点`, `${trailPoints} trail points`)]
																})
															]
														})
													]
												}),
												p.coordinates?.lat ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-id": "pages/GPSTracking/GPSTracking/span/7",
													"data-inspector-source": "pages/GPSTracking.tsx:1079:29:99820a2bdea2f46af1c3fb4d26e95cbe6677bd1766174fc11f212bf09635b7c3:1",
													role: "link",
													tabIndex: 0,
													onClick: (e) => {
														e.stopPropagation();
														window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.coordinates.lat},${p.coordinates.lng}`, "_blank", "noopener");
													},
													onKeyDown: (e) => {
														if (e.key === "Enter") {
															e.stopPropagation();
															window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.coordinates.lat},${p.coordinates.lng}`, "_blank", "noopener");
														}
													},
													"aria-label": `${t("common.directions")} — ${p.name}`,
													className: "shrink-0 rounded-md p-2 text-muted-foreground hover:bg-background hover:text-foreground",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {
														"data-inspector-id": "pages/GPSTracking/GPSTracking/Navigation/1",
														"data-inspector-source": "pages/GPSTracking.tsx:1087:31:b407601fa34a36362e655a5bfcf55db0fa875d4cf4f5680b4a5c14b58d64577b:1",
														className: "h-4 w-4"
													})
												}) : null
											]
										})
									}, p.id);
								})
							})
						]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/GPSTracking/GPSTracking/div/27",
				"data-inspector-source": "pages/GPSTracking.tsx:1100:7:b038f04c3049dd9276d74d961e719b9aa9a52fc9c286f30a5b9b2e3513d28013:1",
				className: "grid lg:grid-cols-3 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/GPSTracking/GPSTracking/div/28",
					"data-inspector-source": "pages/GPSTracking.tsx:1103:9:a9cfdd46d6ee4f864c3f7172f6579022daf01cf0958d53a74a48d25a3f0d11eb:1",
					className: "lg:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						"data-inspector-id": "pages/GPSTracking/GPSTracking/Tabs/0",
						"data-inspector-source": "pages/GPSTracking.tsx:1104:11:92d1343d3e128ed2e99152016136c0c4a81b6e71c715d531a7f3a6d825e2870e:1",
						value: activeTab,
						onValueChange: setActiveTab,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/TabsList/0",
								"data-inspector-source": "pages/GPSTracking.tsx:1105:13:201a37fa40ed40d399adddcf815a1cead33a8fac9b1f77f04ed3dcfbb1411934:1",
								className: "mb-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/TabsTrigger/0",
										"data-inspector-source": "pages/GPSTracking.tsx:1106:15:3a9409c95195e7d52e465c91226f57565ab5b0e6f4ae50f34fef861c3cd9b44a:1",
										value: "map",
										className: "gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/MapPin/0",
												"data-inspector-source": "pages/GPSTracking.tsx:1106:58:3a9409c95195e7d52e465c91226f57565ab5b0e6f4ae50f34fef861c3cd9b44a:1",
												className: "h-3.5 w-3.5"
											}),
											" ",
											t("gps.map", "Map")
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/TabsTrigger/1",
										"data-inspector-source": "pages/GPSTracking.tsx:1107:15:8c4561d7253957e528c503d11d559b919d7fa21183b5f9cc6273987794922024:1",
										value: "alerts",
										className: "gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Bell/0",
												"data-inspector-source": "pages/GPSTracking.tsx:1108:17:a6e0505a28018eed29c369e1249349d3414f4d10c10c934c2b262571c4f8445c:1",
												className: "h-3.5 w-3.5"
											}),
											" ",
											t("gps.alerts", "Alerts"),
											unreadAlerts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Badge/1",
												"data-inspector-source": "pages/GPSTracking.tsx:1109:45:9414fae4de0d00fa6c072a9a1bcb15f46528e8a04099f1cea04c2bc8c3b78698:1",
												variant: "destructive",
												className: "ml-1 text-[10px] px-1",
												children: unreadAlerts.length
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/TabsTrigger/2",
										"data-inspector-source": "pages/GPSTracking.tsx:1111:15:802b317d52191007c6e0f99572bc1cf7b9f3d7f21023c2d27449ba062a6c9ad5:1",
										value: "zones",
										className: "gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hexagon, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Hexagon/1",
												"data-inspector-source": "pages/GPSTracking.tsx:1111:60:802b317d52191007c6e0f99572bc1cf7b9f3d7f21023c2d27449ba062a6c9ad5:1",
												className: "h-3.5 w-3.5"
											}),
											" ",
											t("gps.zones", "Zones")
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/TabsContent/0",
								"data-inspector-source": "pages/GPSTracking.tsx:1114:13:1787c4a04e3db5fd0d53e993f80e382c668e57d99942cd4f047183bc6124f84b:1",
								value: "map",
								className: "mt-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/Card/0",
									"data-inspector-source": "pages/GPSTracking.tsx:1115:15:d716ac167c118e7ca726af4ca8389a2cd71f9ce6f303857f31f673776ab5afa4:1",
									className: "border-transparent card-elevated overflow-hidden relative",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/CardContent/0",
										"data-inspector-source": "pages/GPSTracking.tsx:1116:17:c82ca8c8a1a2db950f4e53363bc513eb831a3ca89ca83016e572b855ee873318:1",
										className: "p-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/div/29",
											"data-inspector-source": "pages/GPSTracking.tsx:1117:19:88f4ba24e1c8cec9efdccbf547165c6775c0c0c18e372282b193d46b399b9203:1",
											ref: (node) => {
												mapRef.current = node;
												setMapNode(node);
											},
											className: "h-[500px] w-full"
										}), sharingPeople.length === 0 && !isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/div/30",
											"data-inspector-source": "pages/GPSTracking.tsx:1119:21:f02dcdfc7cff93193f481e5294282508f5f7c980e8b6ed3a2dd999970377a378:1",
											className: "absolute inset-0 flex items-center justify-center pointer-events-none z-[400]",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/div/31",
												"data-inspector-source": "pages/GPSTracking.tsx:1120:23:55cff12a7ad5f7b818662975d1fec4bd154968a4da207d6baa83cedbe08b1b3c:1",
												className: "text-center bg-card/80 backdrop-blur-sm rounded-xl p-6",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
														"data-inspector-id": "pages/GPSTracking/GPSTracking/MapPin/1",
														"data-inspector-source": "pages/GPSTracking.tsx:1121:25:57e2fe86af6417d434d93b7eaae6e1bcd5bc9d714eb0ed94a6847adbf9dd3b67:1",
														className: "h-12 w-12 text-primary/30 mx-auto mb-2"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														"data-inspector-id": "pages/GPSTracking/GPSTracking/p/8",
														"data-inspector-source": "pages/GPSTracking.tsx:1122:25:3169a7790b8ccc3b59fa85275e854c23b6a2d3c24e81633dcbc625e1f5192a53:1",
														className: "text-sm text-muted-foreground",
														children: t("gps.noSharingDesc")
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														"data-inspector-id": "pages/GPSTracking/GPSTracking/p/9",
														"data-inspector-source": "pages/GPSTracking.tsx:1123:25:a7fff4cebe28094d602c900bd526750e4c740c6ecb74b8506e81689def13730b:1",
														className: "text-xs text-muted-foreground mt-1",
														children: t("gps.enableSharingDesc")
													})
												]
											})
										})]
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/TabsContent/1",
								"data-inspector-source": "pages/GPSTracking.tsx:1131:13:3570086191d50b7cf9f5a6c0154ff7d181299e7c7343f527e06fe973f5271401:1",
								value: "alerts",
								className: "mt-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/Card/1",
									"data-inspector-source": "pages/GPSTracking.tsx:1132:15:f63865fc172258fa2749785c8a8fc2ecf3741bb86e461d9de731d68498fd22c2:1",
									className: "border-transparent card-elevated",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/CardContent/1",
										"data-inspector-source": "pages/GPSTracking.tsx:1133:17:769ad3e7cdc33595a7ab38416c09378b2b716f4b7c95a32164221172c30ade28:1",
										className: "py-4 space-y-3",
										children: alerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/p/10",
											"data-inspector-source": "pages/GPSTracking.tsx:1135:21:f8bfdca7a7a8251310a2d2c2f752d850528bbc909b3c8ad03e2f6e93db56eaa6:1",
											className: "text-sm text-muted-foreground text-center py-8",
											children: t("gps.noAlerts", "No safe zone alerts")
										}) : alerts.slice(0, 20).map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/div/32",
											"data-inspector-source": "pages/GPSTracking.tsx:1138:23:dddcdd18794ee5b391f63c0a801af42fa08844acb2ae471aacb3111fd6c399ab:1",
											className: `p-3 rounded-lg border ${alert.is_read ? "bg-muted/30 border-border" : "bg-warning/10 border-warning/30"}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/div/33",
												"data-inspector-source": "pages/GPSTracking.tsx:1142:25:7c57724eebba1f90d45dba89f49ba50f5e8a73b87b71751d65eb0321cccd2362:1",
												className: "flex items-start justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-id": "pages/GPSTracking/GPSTracking/div/34",
													"data-inspector-source": "pages/GPSTracking.tsx:1143:27:83468e7714eb5133d77441fb377f98d07ed9f9f2691e63ae919bd584913589ea:1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														"data-inspector-id": "pages/GPSTracking/GPSTracking/p/11",
														"data-inspector-source": "pages/GPSTracking.tsx:1144:29:75c876b79d6f6c6435179c8a37d8fb388faddefa011c7015e4f0eb521349338a:1",
														className: "text-sm font-medium text-foreground",
														children: [
															alert.alert_type?.includes("danger") ? "⚠️" : "📍",
															" ",
															alert.message || alert.alert_type?.replace(/_/g, " ")
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														"data-inspector-id": "pages/GPSTracking/GPSTracking/p/12",
														"data-inspector-source": "pages/GPSTracking.tsx:1147:29:b1ab30e320f72a5e53278ad5ccf7df7828cfeabda904914d159f7ca99bd3e4af:1",
														className: "text-xs text-muted-foreground mt-1",
														children: alert.created_at ? formatDateTime(alert.created_at) : ""
													})]
												}), !alert.is_read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													"data-inspector-id": "pages/GPSTracking/GPSTracking/Button/10",
													"data-inspector-source": "pages/GPSTracking.tsx:1152:29:d9fcdbd659a6cdc7a6f9523b29fd8d5b042beed3fdda58d35a2c7c1f180f5d0a:1",
													variant: "ghost",
													size: "sm",
													onClick: () => handleAcknowledgeAlert(alert.id),
													children: t("common.dismiss", "Dismiss")
												})]
											})
										}, alert.id))
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/TabsContent/2",
								"data-inspector-source": "pages/GPSTracking.tsx:1164:13:8112c25ed1a70f1ded0cf7187de7c727a74ce00f149c931166e957df57fbb0f5:1",
								value: "zones",
								className: "mt-0",
								children: zonesPanel
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/GPSTracking/GPSTracking/div/35",
					"data-inspector-source": "pages/GPSTracking.tsx:1172:9:016acb45e37f8fd66985f879762723e3792cd6b1b475d10f0bf88264dad7cf46:1",
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							"data-inspector-id": "pages/GPSTracking/GPSTracking/Card/2",
							"data-inspector-source": "pages/GPSTracking.tsx:1174:11:a64a620c93afbb6418aa9cd618d936e82dcd8c90cc1f74f7641d7a9db51d7453:1",
							className: "border-transparent card-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/CardHeader/0",
								"data-inspector-source": "pages/GPSTracking.tsx:1175:13:9ba6fc39d02c05ec110a7cfcf667c9c852717c82c70002da0251b7f395e965e4:1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/CardTitle/0",
									"data-inspector-source": "pages/GPSTracking.tsx:1175:25:9ba6fc39d02c05ec110a7cfcf667c9c852717c82c70002da0251b7f395e965e4:1",
									className: "text-lg",
									children: t("gps.trackedPeople")
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/CardContent/2",
								"data-inspector-source": "pages/GPSTracking.tsx:1176:13:2a7a99b6c13f423abf168bd67f8502acc5771ae26f9b028babc4f70f40bbe188:1",
								className: "space-y-3",
								children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/div/36",
									"data-inspector-source": "pages/GPSTracking.tsx:1178:17:39ce8b82a2e7d0d0ec93e43e282e8b1031cb52a52cb1dd8d5960b3ddabdc7fe0:1",
									className: "flex justify-center py-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/Loader2/3",
										"data-inspector-source": "pages/GPSTracking.tsx:1178:59:39ce8b82a2e7d0d0ec93e43e282e8b1031cb52a52cb1dd8d5960b3ddabdc7fe0:1",
										className: "h-6 w-6 animate-spin text-muted-foreground"
									})
								}) : people.length > 0 ? people.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/div/37",
									"data-inspector-source": "pages/GPSTracking.tsx:1180:17:b769c951546e460f3b91b27eb3ca280297185bcc07a0572b944d08611975ee68:1",
									className: `p-3 rounded-lg cursor-pointer transition-colors ${selectedPerson?.id === p.id ? "bg-accent border border-primary/20" : "bg-muted/50 hover:bg-accent/50"}`,
									onClick: () => setSelectedPerson(p),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/div/38",
										"data-inspector-source": "pages/GPSTracking.tsx:1185:19:f8c73ffb941a2e60669a0e7885be562338fe50deba6c40dbe54b167fd24bfbaa:1",
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/div/39",
											"data-inspector-source": "pages/GPSTracking.tsx:1186:21:b16b973a35e25c73004fc3d61772499e17eb15f02f008ded5abec00da741045a:1",
											className: "relative",
											children: [p.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/img/1",
												"data-inspector-source": "pages/GPSTracking.tsx:1188:25:66a6c001e6a3f5a6459874840ed14def78f854750a30bf02268d2311f5fa4bc9:1",
												src: p.avatar_url,
												alt: "",
												className: "w-10 h-10 rounded-full object-cover"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/div/40",
												"data-inspector-source": "pages/GPSTracking.tsx:1190:25:fd1e4b7a7a5bc4d4ba94ea2643602443cedd33acb5ff0f6ca1cbdbac0216e1f4:1",
												className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-id": "pages/GPSTracking/GPSTracking/span/8",
													"data-inspector-source": "pages/GPSTracking.tsx:1191:27:431af9fc583bd33d5075b454d3f21015a05e9590b0719e5a3e2eb422a4607202:1",
													className: "text-primary text-sm font-medium",
													children: p.name.charAt(0)
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/div/41",
												"data-inspector-source": "pages/GPSTracking.tsx:1194:23:c878b1c7ef99ab8c7fc8dd0f433f7a6e275f2a95099d2f98270a213213e7fbc8:1",
												className: `absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${p.isSharing ? "bg-success" : "bg-muted-foreground/30"}`
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/div/42",
											"data-inspector-source": "pages/GPSTracking.tsx:1196:21:1ddf41f097c600aa190b08df66369d0d7867c50ff28cfed2574919f319344215:1",
											className: "flex-1 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/p/13",
												"data-inspector-source": "pages/GPSTracking.tsx:1197:23:3db23ac76db1e1b11f89b35cd92549941b889ff215ee935219107a51334bcb06:1",
												className: "text-sm font-medium text-foreground",
												children: p.name
											}), !p.isSharing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Badge/2",
												"data-inspector-source": "pages/GPSTracking.tsx:1198:40:0e6ff76214195f594932c360835a11f5b0ea0bb39e7e3a59425697ad433b6cf7:1",
												variant: "secondary",
												className: "text-[10px] mt-0.5",
												children: t("gps.notSharing")
											})]
										})]
									}), p.isSharing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/div/43",
										"data-inspector-source": "pages/GPSTracking.tsx:1202:21:876d091d585e61f2505c82d2452662191d76c11c1b26f8cbd833bdc5d8057123:1",
										className: "mt-2 text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/p/14",
											"data-inspector-source": "pages/GPSTracking.tsx:1203:23:a118e3baa038cddd13bae88905abe1acaec73ce13943e1644fa68872afa24281:1",
											className: "flex items-center gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
													"data-inspector-id": "pages/GPSTracking/GPSTracking/MapPin/2",
													"data-inspector-source": "pages/GPSTracking.tsx:1203:62:a118e3baa038cddd13bae88905abe1acaec73ce13943e1644fa68872afa24281:1",
													className: "h-3 w-3"
												}),
												" ",
												p.lastLocation
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/p/15",
											"data-inspector-source": "pages/GPSTracking.tsx:1204:23:9cd92cd109ce0209548a23f924a4302fc9a785295cdeb5e8ce8fe26d1851bf9e:1",
											className: "flex items-center gap-1 mt-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
													"data-inspector-id": "pages/GPSTracking/GPSTracking/Clock/1",
													"data-inspector-source": "pages/GPSTracking.tsx:1204:67:9cd92cd109ce0209548a23f924a4302fc9a785295cdeb5e8ce8fe26d1851bf9e:1",
													className: "h-3 w-3"
												}),
												" ",
												p.lastUpdated
											]
										})]
									})]
								}, p.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/p/16",
									"data-inspector-source": "pages/GPSTracking.tsx:1209:17:e2b28ece7487c4b5ba2d94574cb5f606de2acfc20af5db9eaca56ba7ca6ebda1:1",
									className: "text-sm text-muted-foreground text-center py-4",
									children: t("gps.noLocationShares")
								})
							})]
						}),
						selectedPerson && selectedPerson.coordinates?.lat ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							"data-inspector-id": "pages/GPSTracking/GPSTracking/Card/3",
							"data-inspector-source": "pages/GPSTracking.tsx:1216:13:3f7f438c8f726c8022ba13ae3f51d5eb0dce0afd0b4c8312b74e8c45674eb2c9:1",
							className: "border-transparent card-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/CardHeader/1",
								"data-inspector-source": "pages/GPSTracking.tsx:1217:15:564a1290a6337ce7d46ecda75cdc5fd90375b33d9449e868cb7e7841c760d99f:1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/CardTitle/1",
									"data-inspector-source": "pages/GPSTracking.tsx:1217:27:564a1290a6337ce7d46ecda75cdc5fd90375b33d9449e868cb7e7841c760d99f:1",
									className: "text-lg",
									children: selectedPerson.name
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/CardContent/3",
								"data-inspector-source": "pages/GPSTracking.tsx:1218:15:c406722f4c71e28f3a898b3d5cbff3366aaba84a3bcde8092723e838dd285216:1",
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/div/44",
										"data-inspector-source": "pages/GPSTracking.tsx:1219:17:8708db4bfc665877aceb66a19d55610a11529db4a61d286d6455475036356a32:1",
										className: "p-2 rounded-sm bg-muted/50 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/p/17",
											"data-inspector-source": "pages/GPSTracking.tsx:1220:19:35887dcc18f4a31798f3e915baa220a02714ca21cd4c1ec64344d3b682352d47:1",
											className: "text-muted-foreground text-xs",
											children: t("gps.coordinates")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/p/18",
											"data-inspector-source": "pages/GPSTracking.tsx:1221:19:2542c619bf26841f3e91fad6bebcc0c6d97e439fd2c99df6d51e6758b51f2202:1",
											className: "font-mono text-xs text-foreground",
											children: [
												selectedPerson.coordinates.lat?.toFixed(6),
												", ",
												selectedPerson.coordinates.lng?.toFixed(6)
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/div/45",
										"data-inspector-source": "pages/GPSTracking.tsx:1223:17:8708db4bfc665877aceb66a19d55610a11529db4a61d286d6455475036356a32:1",
										className: "p-2 rounded-sm bg-muted/50 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/p/19",
											"data-inspector-source": "pages/GPSTracking.tsx:1224:19:46e36e5331a7a574df1b8ddd357386ec06a09fed8fd6c7f34311b9e1a8d255e7:1",
											className: "text-muted-foreground text-xs",
											children: t("gps.lastUpdated")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/p/20",
											"data-inspector-source": "pages/GPSTracking.tsx:1225:19:6a45fc99448cad4d7f4279142264e25c02a2f274e6459b375d7f334ba67905e2:1",
											className: "text-xs text-foreground",
											children: selectedPerson.lastUpdated
										})]
									}),
									trailData[selectedPerson.userId]?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/div/46",
										"data-inspector-source": "pages/GPSTracking.tsx:1228:19:6d0faf7a30a844d7ea6aafcf61705fe3a57cc647eeeaff86d62424ff6c6475b5:1",
										className: "p-2 rounded-sm bg-muted/50 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/p/21",
											"data-inspector-source": "pages/GPSTracking.tsx:1229:21:3cf45b09dcd078b24d201d108b7d438c9d7af89f09a6dfa96d522073566fc8b0:1",
											className: "text-muted-foreground text-xs flex items-center gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
													"data-inspector-id": "pages/GPSTracking/GPSTracking/Route/1",
													"data-inspector-source": "pages/GPSTracking.tsx:1229:90:3cf45b09dcd078b24d201d108b7d438c9d7af89f09a6dfa96d522073566fc8b0:1",
													className: "h-3 w-3"
												}),
												" ",
												t("gps.trail", "Trail")
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/p/22",
											"data-inspector-source": "pages/GPSTracking.tsx:1230:21:f56ff8f1135ec05133b80d899718420f8c5fad0499413c971f5509690acbeaf3:1",
											className: "text-xs text-foreground",
											children: [
												trailData[selectedPerson.userId].length,
												" ",
												t("gps.points", "points")
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/div/47",
										"data-inspector-source": "pages/GPSTracking.tsx:1233:17:d083778d1dcc27fdd6d17334070f6d219e3753eb38227a321fb3d21549e6953d:1",
										className: "flex gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/Button/11",
											"data-inspector-source": "pages/GPSTracking.tsx:1234:19:fc8746cb815a4073bafe41e42750d8df0639fb2f30269ff1af968f1fd2ba1d56:1",
											variant: "outline",
											size: "sm",
											className: "flex-1",
											asChild: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/a/0",
												"data-inspector-source": "pages/GPSTracking.tsx:1235:21:e11ecd0d214a66f5e9badfb50acda49cb2baf322a50dc0a70f25ce2322265c5f:1",
												href: `https://www.google.com/maps/dir/?api=1&destination=${selectedPerson.coordinates.lat},${selectedPerson.coordinates.lng}`,
												target: "_blank",
												rel: "noopener noreferrer",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {
														"data-inspector-id": "pages/GPSTracking/GPSTracking/Navigation/2",
														"data-inspector-source": "pages/GPSTracking.tsx:1236:23:3b945ef28e98f51e3fca2e8075e4ad6fe7054f4c3cb193457efee3711230c496:1",
														className: "h-3 w-3 mr-1"
													}),
													" ",
													t("common.directions")
												]
											})
										})
									})
								]
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							"data-inspector-id": "pages/GPSTracking/GPSTracking/Card/4",
							"data-inspector-source": "pages/GPSTracking.tsx:1245:11:a64a620c93afbb6418aa9cd618d936e82dcd8c90cc1f74f7641d7a9db51d7453:1",
							className: "border-transparent card-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/CardHeader/2",
								"data-inspector-source": "pages/GPSTracking.tsx:1246:13:8807e946215ae18c71820b6ad7e931b11499c7a390dedcbf50666020ee1fc3ff:1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									"data-inspector-id": "pages/GPSTracking/GPSTracking/CardTitle/2",
									"data-inspector-source": "pages/GPSTracking.tsx:1246:25:8807e946215ae18c71820b6ad7e931b11499c7a390dedcbf50666020ee1fc3ff:1",
									className: "text-lg",
									children: t("common.settings")
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								"data-inspector-id": "pages/GPSTracking/GPSTracking/CardContent/4",
								"data-inspector-source": "pages/GPSTracking.tsx:1247:13:1363dc75b44b5db44644fec753f742e10ec1c5e01baa19bb08bac509895f3b8b:1",
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/div/48",
										"data-inspector-source": "pages/GPSTracking.tsx:1248:15:a9077605babd609cd10539bc1e3dc7ae031793a024439419627ac092b11b41c3:1",
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/div/49",
											"data-inspector-source": "pages/GPSTracking.tsx:1249:17:92be92a7fe050749218dc20048da94fc87b46eec5b7e95e0d8e8ef44bf4fe0d1:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Label/7",
												"data-inspector-source": "pages/GPSTracking.tsx:1250:19:92e3bb55afdc45405f9b5f7b37f8bb6f8b8277308321035c2f8f9de3a6c160bf:1",
												className: "text-sm",
												children: t("gps.shareMyLocation")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/p/23",
												"data-inspector-source": "pages/GPSTracking.tsx:1251:19:75242c101df29f64d6c6a687866a743b0001bc066fcf9e771b4b5e844b0a5e95:1",
												className: "text-xs text-muted-foreground mt-0.5",
												children: shareMyLocation ? t("gps.sharingActive", "Sharing every 15s") : t("gps.sharingInactive", "Not sharing")
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/Switch/4",
											"data-inspector-source": "pages/GPSTracking.tsx:1257:18:1c8b435142ffdc71ebc900f1a26a5f684ef2e7bebf451a83984e4940562b79fd:1",
											"aria-label": t("gps.shareMyLocation"),
											checked: shareMyLocation,
											onCheckedChange: handleToggleShare,
											disabled: updatingShare
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/div/50",
										"data-inspector-source": "pages/GPSTracking.tsx:1259:15:a9077605babd609cd10539bc1e3dc7ae031793a024439419627ac092b11b41c3:1",
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/div/51",
											"data-inspector-source": "pages/GPSTracking.tsx:1260:17:92be92a7fe050749218dc20048da94fc87b46eec5b7e95e0d8e8ef44bf4fe0d1:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Label/8",
												"data-inspector-source": "pages/GPSTracking.tsx:1261:19:e91f4bfbccdbe2dfc38a8e7e25bcf371931f59246b164a4d07b9be18b5c66db3:1",
												className: "text-sm",
												children: t("gps.geofenceAlerts")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/p/24",
												"data-inspector-source": "pages/GPSTracking.tsx:1262:19:75242c101df29f64d6c6a687866a743b0001bc066fcf9e771b4b5e844b0a5e95:1",
												className: "text-xs text-muted-foreground mt-0.5",
												children: [
													zones.length,
													" ",
													t("gps.zonesConfigured", "zones"),
													" (",
													dangerZoneCount,
													" ",
													t("gps.danger", "danger"),
													")"
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											"data-inspector-id": "pages/GPSTracking/GPSTracking/Switch/5",
											"data-inspector-source": "pages/GPSTracking.tsx:1266:18:595d245ab91085dd5bfa0ee151ad2fe003bdd5037e0b0482ca21cf9311d23387:1",
											"aria-label": t("gps.geofenceAlerts"),
											checked: geofenceAlerts,
											onCheckedChange: setGeofenceAlerts
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										"data-inspector-id": "pages/GPSTracking/GPSTracking/p/25",
										"data-inspector-source": "pages/GPSTracking.tsx:1268:15:9af3654699a209916509c883225ed7b2fb511fc4ea2916d081106628e9c49c66:1",
										className: "text-xs text-muted-foreground flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
												"data-inspector-id": "pages/GPSTracking/GPSTracking/Shield/1",
												"data-inspector-source": "pages/GPSTracking.tsx:1269:17:89beb35940c2e5085f2b3e8ef06f20ac8c1cfa8997a62a76378d66d0dfe85e2e:1",
												className: "h-3 w-3"
											}),
											" ",
											t("gps.locationEncrypted", { groups: site.navLabels.careGroups.toLowerCase() })
										]
									})
								]
							})]
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { GPSTracking as default };
