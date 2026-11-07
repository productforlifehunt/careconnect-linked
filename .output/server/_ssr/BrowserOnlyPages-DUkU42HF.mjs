import { s as __toESM } from "../_runtime.mjs";
import { n as __name$1 } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as lazyRetry } from "./lazy-retry-gN02cENW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BrowserOnlyPages-DUkU42HF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GPSTrackingPage = lazyRetry(() => import("./GPSTracking-RYb-L6Wq.mjs"), "GPSTrackingPage");
var CalendarPage = lazyRetry(() => import("./Calendar-DgteNJ0Z.mjs"), "CalendarPage");
function PageSpinner() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex justify-center items-center min-h-[60vh]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" })
	});
}
function GPSTracking() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		"data-inspector-id": "components/routing/BrowserOnlyPages/GPSTracking/Suspense/0",
		"data-inspector-source": "components/routing/BrowserOnlyPages.tsx:20:5:b3ad0355b0b6ec07089f0ef38a1ea4764a13ebceebf4e572a69f2ed8650a2646:1",
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSpinner, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GPSTrackingPage, {})
	});
}
function Calendar$1() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		"data-inspector-id": "components/routing/BrowserOnlyPages/Calendar/Suspense/0",
		"data-inspector-source": "components/routing/BrowserOnlyPages.tsx:28:5:b3ad0355b0b6ec07089f0ef38a1ea4764a13ebceebf4e572a69f2ed8650a2646:1",
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSpinner, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPage, {})
	});
}
__name$1(Calendar$1, "Calendar");
//#endregion
export { GPSTracking as n, Calendar$1 as t };
