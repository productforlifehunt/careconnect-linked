import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as useLocation$1 } from "./router-compat-DbWBz8c6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/path-routes-B_e8W2aO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Route(_props) {
	return null;
}
function matches(pattern, pathname) {
	if (pattern === "*") return true;
	const want = pattern.split("/").filter(Boolean);
	const have = pathname.split("/").filter(Boolean);
	const splat = want[want.length - 1] === "*";
	if (splat) want.pop();
	if (splat ? have.length < want.length : have.length !== want.length) return false;
	return want.every((segment, i) => segment.startsWith(":") || segment === have[i]);
}
function Routes({ children }) {
	const { pathname } = useLocation$1();
	const routes = [];
	import_react.Children.forEach(children, (child) => {
		if ((0, import_react.isValidElement)(child) && typeof child.props.path === "string") routes.push(child.props);
	});
	const hit = routes.find((route) => matches(route.path, pathname));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: hit ? hit.element : null });
}
//#endregion
export { Routes as n, Route as t };
