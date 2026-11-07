import { s as __toESM } from "../_runtime.mjs";
import { n as __name$1 } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { C as useRouter, S as useParams, b as Link, p as useLocation, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-compat-CRbRSfhz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Router-compat shim — bridges @/lib/router-compat v6 call sites to
* @tanstack/react-router without hand-rewriting every component.
* This is the same load-bearing pattern used in Klar's dev-copy migration.
*/
function parseTo(to) {
	const [beforeHash = "", hashStr] = (to ?? "").split("#");
	const [pathname, searchStr] = beforeHash.split("?");
	return {
		pathname: pathname || ".",
		...searchStr ? { search: Object.fromEntries(new URLSearchParams(searchStr)) } : {},
		...hashStr ? { hash: hashStr } : {}
	};
}
function useNavigate$1() {
	const tsNav = useNavigate();
	const router = useRouter();
	return (0, import_react.useCallback)((to, options) => {
		if (typeof to === "number") {
			router.history.go(to);
			return;
		}
		const { pathname, search, hash } = parseTo(to);
		tsNav({
			to: pathname,
			search,
			...hash !== void 0 ? { hash } : {},
			state: options?.state,
			...options?.replace !== void 0 ? { replace: options.replace } : {}
		});
	}, [tsNav, router]);
}
__name$1(useNavigate$1, "useNavigate");
function useLocation$1() {
	const loc = useLocation();
	return (0, import_react.useMemo)(() => ({
		pathname: loc.pathname,
		search: loc.searchStr ? `?${loc.searchStr}` : "",
		hash: loc.hash ?? "",
		state: loc.state ?? null,
		key: loc.pathname + (loc.searchStr ?? "")
	}), [
		loc.pathname,
		loc.searchStr,
		loc.hash,
		loc.state
	]);
}
__name$1(useLocation$1, "useLocation");
function useParams$1() {
	return useParams({ strict: false });
}
__name$1(useParams$1, "useParams");
function useSearchParams() {
	const loc = useLocation();
	const nav = useNavigate();
	const router = useRouter();
	return [(0, import_react.useMemo)(() => new URLSearchParams(loc.searchStr ?? ""), [loc.searchStr]), (0, import_react.useCallback)((init, opts) => {
		const live = router.state.location;
		const current = new URLSearchParams(live.searchStr ?? "");
		const next = typeof init === "function" ? init(current) : init instanceof URLSearchParams ? init : new URLSearchParams(init);
		const searchObj = {};
		next.forEach((v, k) => {
			searchObj[k] = v;
		});
		nav({
			to: live.pathname,
			search: searchObj,
			...opts?.replace !== void 0 ? { replace: opts.replace } : {}
		});
	}, [nav, router])];
}
var Link$1 = (0, import_react.forwardRef)(/* @__PURE__ */ __name$1(function Link$2({ to, replace, state, children, ...rest }, ref) {
	const { pathname, search, hash } = parseTo(to);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		"data-inspector-id": "lib/router-compat/Link/TSLink/0",
		"data-inspector-source": "lib/router-compat.tsx:129:5:b3d1776e8cc7df92c7901aff6cb3c601c65be346a92a88125ab8b99bf5457544:1",
		ref,
		to: pathname,
		search,
		state,
		...hash !== void 0 ? { hash } : {},
		...replace !== void 0 ? { replace } : {},
		...rest ?? {},
		children
	});
}, "Link"));
function Navigate({ to, replace, state }) {
	const navigate = useNavigate$1();
	const lastTarget = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (lastTarget.current === to) return;
		lastTarget.current = to;
		navigate(to, {
			...replace !== void 0 ? { replace } : {},
			...state !== void 0 ? { state } : {}
		});
	}, [
		to,
		replace,
		state,
		navigate
	]);
	return null;
}
//#endregion
export { useParams$1 as a, useNavigate$1 as i, Navigate as n, useSearchParams as o, useLocation$1 as r, Link$1 as t };
