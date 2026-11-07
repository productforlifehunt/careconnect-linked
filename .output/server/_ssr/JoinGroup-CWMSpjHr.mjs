import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { Cn as CircleX, jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { n as careGroupPath } from "./join-link-DH4hH7JP.mjs";
import { Vt as useGroupInvitePreview } from "./use-care-data-7GR_eJDG.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { a as useParams$1, i as useNavigate$1, t as Link$1 } from "./router-compat-CRbRSfhz.mjs";
import { n as withNext } from "./return-path-B1QN16Ol.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/JoinGroup-CWMSpjHr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Older per-link invitations (/join/<token>) only forward to the group's one
* page, /care-circle/<id>, which shows the invitation there.
*/
function JoinGroup() {
	const { code = "" } = useParams$1();
	const navigate = useNavigate$1();
	const { user, isAuthenticated, isLoading } = useAuth();
	const { i18n } = useTranslation();
	const Z = (cn, en) => i18n.language?.startsWith("zh") ? cn : en;
	const signedIn = !isLoading && isAuthenticated && !!user;
	const { data: preview, isError, isLoading: previewLoading } = useGroupInvitePreview(signedIn && code ? code : null);
	(0, import_react.useEffect)(() => {
		if (isLoading) return;
		if (!isAuthenticated || !user) navigate(withNext("/auth", `/join/${code}`), { replace: true });
	}, [
		isLoading,
		isAuthenticated,
		user,
		code,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		if (preview?.group_id) navigate(`${careGroupPath(preview.group_id)}?invite=${encodeURIComponent(code)}`, { replace: true });
	}, [
		preview,
		code,
		navigate
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "pages/JoinGroup/JoinGroup/div/0",
		"data-inspector-source": "pages/JoinGroup.tsx:36:5:f7846bc69bbeed33f45ccb2b41754f2e8396058a50f47c86d444dab9c21f310d:1",
		className: "min-h-screen flex items-center justify-center p-4 bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			"data-inspector-id": "pages/JoinGroup/JoinGroup/Card/0",
			"data-inspector-source": "pages/JoinGroup.tsx:37:7:7aa35611c22a1f4f8798cb252edec0dea49b57f489ea9525a02c33500c5f1eeb:1",
			className: "w-full max-w-md",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				"data-inspector-id": "pages/JoinGroup/JoinGroup/CardContent/0",
				"data-inspector-source": "pages/JoinGroup.tsx:38:9:ca12451a1f078255ce8e2218e5c5e4f797cb499379bcc9a36da0b3cd0ecbc179:1",
				className: "py-8 flex flex-col items-center gap-3 text-center",
				children: signedIn && (!code || isError || !previewLoading && !preview) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, {
						"data-inspector-id": "pages/JoinGroup/JoinGroup/XCircle/0",
						"data-inspector-source": "pages/JoinGroup.tsx:41:15:b483b53c9dc38b5bc19b8312e664b815ff108720b3f5ccca9caea0b75e31b503:1",
						className: "h-10 w-10 text-destructive"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/JoinGroup/JoinGroup/p/0",
						"data-inspector-source": "pages/JoinGroup.tsx:42:15:c61a7f4871179d23afdc29396caf380399588d5efbf246ea1ca809c0bc106ba4:1",
						className: "text-muted-foreground",
						children: Z("这个邀请链接无效或已过期。请向群管理员要群组链接。", "This invite link is invalid or expired. Ask an admin for the group link.")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "pages/JoinGroup/JoinGroup/Button/0",
						"data-inspector-source": "pages/JoinGroup.tsx:43:15:c435e5542328d4ea947043d964435be8da2cb58089d4ea142a2ac36172a05fe7:1",
						asChild: true,
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
							"data-inspector-id": "pages/JoinGroup/JoinGroup/Link/0",
							"data-inspector-source": "pages/JoinGroup.tsx:43:49:c435e5542328d4ea947043d964435be8da2cb58089d4ea142a2ac36172a05fe7:1",
							to: "/care-circle",
							children: Z("返回我的护理小组", "Back to my care groups")
						})
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					"data-inspector-id": "pages/JoinGroup/JoinGroup/Loader2/0",
					"data-inspector-source": "pages/JoinGroup.tsx:46:13:883982d419a368e7a70dc0b3f2b5e3dcd29d2ccb328545a9763b622e337f44e7:1",
					className: "h-8 w-8 animate-spin text-muted-foreground"
				})
			})
		})
	});
}
//#endregion
export { JoinGroup as t };
