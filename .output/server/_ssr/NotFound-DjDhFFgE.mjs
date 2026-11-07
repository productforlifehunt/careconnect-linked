import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useLocation$1 } from "./router-compat-3gk8yjav.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/NotFound-DjDhFFgE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NotFound = () => {
	const location = useLocation$1();
	const { t } = useTranslation();
	(0, import_react.useEffect)(() => {
		console.error("404 Error: User attempted to access non-existent route:", location.pathname);
	}, [location.pathname]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-source": "pages/NotFound.tsx:14:5:8343827c6c5a75d7dec1bbe1ee8fda96acdc1ec72a69d08e3c81f106a0c48bb5:1",
		className: "flex min-h-screen items-center justify-center bg-muted",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "pages/NotFound.tsx:15:7:8489c0565dc12b5c72f1a7ba236d24933959cd6dd54957fce5cdca2c534f2fdd:1",
			className: "text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					"data-inspector-source": "pages/NotFound.tsx:16:9:ba2545587be373943c7e7bae379c16feeff507acd501ff12d4672917340c7779:1",
					className: "mb-4 text-4xl font-bold",
					children: t("notFound.title")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "pages/NotFound.tsx:17:9:e652607457273d7a6519b0c7a958fe29f49ef87cafa07306bf53ac93fd85879f:1",
					className: "mb-4 text-xl text-muted-foreground",
					children: t("notFound.subtitle")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					"data-inspector-source": "pages/NotFound.tsx:18:9:ebff08238378ee9bf6bcef08d5c17d2ff80c29195d39420da9cf07a5365703ec:1",
					href: "/",
					className: "text-primary underline hover:text-primary/90",
					children: t("notFound.returnHome")
				})
			]
		})
	});
};
//#endregion
export { NotFound as t };
