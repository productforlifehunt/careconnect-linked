import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sync-test-draftbit-CAjuflcK.js
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
		className: "flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			"data-testid": "careconnect-draftbit-sync-ok",
			className: "text-4xl font-bold",
			children: "Care Connect：Draftbit → GitHub → Lovable 同步测试成功"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "本次读取基线：cc40d474"
		})]
	});
}
//#endregion
export { DraftbitSyncTestPage as component };
