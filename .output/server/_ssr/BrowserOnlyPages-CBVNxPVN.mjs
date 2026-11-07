import { s as __toESM } from "../_runtime.mjs";
import { n as __name$1 } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as lazyRetry } from "./lazy-retry-gN02cENW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BrowserOnlyPages-CBVNxPVN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GPSTrackingPage = lazyRetry(() => import("./GPSTracking-CvLbF-y6.mjs"), "GPSTrackingPage");
var CalendarPage = lazyRetry(() => import("./Calendar-Deuxd32k.mjs"), "CalendarPage");
function PageSpinner() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-source": "components/routing/BrowserOnlyPages.tsx:12:5:8336d0bbeed7a2ef5b59e5b8e91bca1370926a8bb010f5f9134f1f70635dd38a:1",
		className: "flex justify-center items-center min-h-[60vh]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" })
	});
}
function GPSTracking() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSpinner, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GPSTrackingPage, {})
	});
}
function Calendar$1() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSpinner, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPage, {})
	});
}
__name$1(Calendar$1, "Calendar");
//#endregion
export { GPSTracking as n, Calendar$1 as t };
