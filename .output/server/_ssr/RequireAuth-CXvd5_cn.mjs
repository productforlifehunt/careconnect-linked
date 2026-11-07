import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as fetchOnboardingDone, r as currentAppId } from "./app-profile-DeZHIfiB.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { n as Navigate, r as useLocation$1 } from "./router-compat-3gk8yjav.mjs";
import { n as withNext } from "./return-path-B1QN16Ol.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RequireAuth-CXvd5_cn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RequireAuth({ children }) {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation$1();
	const app = currentAppId();
	const queryClient = useQueryClient();
	(0, import_react.useEffect)(() => {
		if (!isAuthenticated || !location.pathname.startsWith("/cared-ones")) return;
		import("../_libs/_9.mjs").then((n) => n.n).then(({ fetchUserCaredOnesWordPress }) => queryClient.prefetchQuery({
			queryKey: ["userCaredOnes"],
			queryFn: fetchUserCaredOnesWordPress
		})).catch(() => {});
	}, [
		isAuthenticated,
		location.pathname,
		queryClient
	]);
	const { data: onboarded, isLoading: checkingOnboarding } = useQuery({
		queryKey: ["appOnboarding", app],
		queryFn: () => fetchOnboardingDone(app),
		enabled: isAuthenticated && location.pathname !== "/onboarding",
		staleTime: 3600 * 1e3,
		retry: 0
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-source": "components/auth/RequireAuth.tsx:35:7:caf838fc384076703ac437ecc13ce398c67dd626fa470f4d298687430ad6201c:1",
		className: "flex justify-center items-center min-h-[60vh]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" })
	});
	if (!isAuthenticated) {
		if (location.pathname.startsWith("/auth")) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
			to: withNext("/auth", location.pathname + location.search),
			replace: true
		});
	}
	if (location.pathname !== "/onboarding") {
		if (checkingOnboarding) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-source": "components/auth/RequireAuth.tsx:52:9:173f36c15c7cab651a8cfb994e2d753afa9914c6c4c0915d1ac2da5507490837:1",
			className: "flex justify-center items-center min-h-[60vh]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" })
		});
		if (onboarded === false) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
			to: withNext("/onboarding", location.pathname + location.search),
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
//#endregion
export { RequireAuth as t };
