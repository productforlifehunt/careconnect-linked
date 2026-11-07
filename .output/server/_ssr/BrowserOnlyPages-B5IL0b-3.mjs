import { s as __toESM } from "../_runtime.mjs";
import { n as __name$1 } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as lazyRetry } from "./lazy-retry-gN02cENW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BrowserOnlyPages-B5IL0b-3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GPSTrackingPage = lazyRetry(() => import("./GPSTracking-C17Jx3VK.mjs"), "GPSTrackingPage");
var CalendarPage = lazyRetry(() => import("./Calendar-kjQynCry.mjs"), "CalendarPage");
function PageSpinner() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "components/routing/BrowserOnlyPages/PageSpinner/div/0",
		"data-inspector-source": "components/routing/BrowserOnlyPages.tsx:12:5:8336d0bbeed7a2ef5b59e5b8e91bca1370926a8bb010f5f9134f1f70635dd38a:1",
		className: "flex justify-center items-center min-h-[60vh]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			"data-inspector-id": "components/routing/BrowserOnlyPages/PageSpinner/Loader2/0",
			"data-inspector-source": "components/routing/BrowserOnlyPages.tsx:13:7:120dbe28d49d5d62ef35a706002aa6bf16abc1afc0b4bc06e37d2f7364844d0d:1",
			className: "h-8 w-8 animate-spin text-muted-foreground"
		})
	});
}
function GPSTracking() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		"data-inspector-source": "components/routing/BrowserOnlyPages.tsx:20:5:b3ad0355b0b6ec07089f0ef38a1ea4764a13ebceebf4e572a69f2ed8650a2646:1",
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSpinner, {
			"data-inspector-id": "components/routing/BrowserOnlyPages/GPSTracking/PageSpinner/0",
			"data-inspector-source": "components/routing/BrowserOnlyPages.tsx:20:25:b3ad0355b0b6ec07089f0ef38a1ea4764a13ebceebf4e572a69f2ed8650a2646:1"
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GPSTrackingPage, {
			"data-inspector-id": "components/routing/BrowserOnlyPages/GPSTracking/GPSTrackingPage/0",
			"data-inspector-source": "components/routing/BrowserOnlyPages.tsx:21:7:e22ba32ad6a2ba2363b17d6fab24c1cf8f3313b89821fa48a8d0a1ec4f1ff241:1"
		})
	});
}
function Calendar$1() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		"data-inspector-source": "components/routing/BrowserOnlyPages.tsx:28:5:b3ad0355b0b6ec07089f0ef38a1ea4764a13ebceebf4e572a69f2ed8650a2646:1",
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSpinner, {
			"data-inspector-id": "components/routing/BrowserOnlyPages/Calendar/PageSpinner/0",
			"data-inspector-source": "components/routing/BrowserOnlyPages.tsx:28:25:b3ad0355b0b6ec07089f0ef38a1ea4764a13ebceebf4e572a69f2ed8650a2646:1"
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPage, {
			"data-inspector-id": "components/routing/BrowserOnlyPages/Calendar/CalendarPage/0",
			"data-inspector-source": "components/routing/BrowserOnlyPages.tsx:29:7:5ef10d3fa748be3b306ed41754477ddd3aaef061a7fd17a455b34b3eb36a7af4:1"
		})
	});
}
__name$1(Calendar$1, "Calendar");
//#endregion
export { GPSTracking as n, Calendar$1 as t };
