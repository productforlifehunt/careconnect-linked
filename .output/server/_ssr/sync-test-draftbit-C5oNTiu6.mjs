import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sync-test-draftbit-C5oNTiu6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DraftbitSyncTestPage() {
	(0, import_react.useEffect)(() => {
		const titleTimer = window.setTimeout(() => {
			document.title = "Care Connect — Draftbit Sync Test";
		}, 0);
		return () => window.clearTimeout(titleTimer);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		"data-inspector-source": "routes/sync-test-draftbit.tsx:9:10:2b41a077b083e51c6c7f81dc53be6db32d28e22b6bbc5c1d06eb2d3990bc3755:1",
		className: "flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			"data-inspector-source": "routes/sync-test-draftbit.tsx:10:7:de7431a0b38ee5022d29cc473d09309a75cdf985b6677a1ab9fd1f5499d27fee:1",
			"data-testid": "careconnect-draftbit-sync-ok",
			className: "text-4xl font-bold",
			children: "Care Connect：Draftbit → GitHub → Lovable 同步测试成功"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			"data-inspector-source": "routes/sync-test-draftbit.tsx:13:7:c98fb8f205dd5aed27ed58ea02efc9a242000d552ab49d226ee9e3e7514fd274:1",
			className: "text-muted-foreground",
			children: "本次读取基线：cc40d474"
		})]
	});
}
//#endregion
export { DraftbitSyncTestPage as component };
