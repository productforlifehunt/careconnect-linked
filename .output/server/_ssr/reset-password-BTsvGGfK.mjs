import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-Cz5iPbNd.mjs";
import { o as wpChangePassword } from "./wp-auth-DL1jfVY7.mjs";
import { Yt as Heart, jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { i as useNavigate$1 } from "./router-compat-3gk8yjav.mjs";
import { t as PasswordInput } from "./password-input-CqPpo553.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-BTsvGGfK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPassword() {
	const navigate = useNavigate$1();
	const { toast } = useToast();
	const { t } = useTranslation();
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [isRecovery, setIsRecovery] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (window.location.hash.includes("type=recovery")) setIsRecovery(true);
	}, []);
	const handleReset = async () => {
		if (!password || password.length < 8) {
			toast({
				title: t("resetPw.passwordMinLength"),
				variant: "destructive"
			});
			return;
		}
		if (password !== confirmPassword) {
			toast({
				title: t("resetPw.passwordsMismatch"),
				variant: "destructive"
			});
			return;
		}
		setLoading(true);
		try {
			await wpChangePassword(password);
			toast({
				title: t("resetPw.passwordUpdated", "Password Updated"),
				description: t("resetPw.passwordUpdatedDesc", "Your password has been changed successfully.")
			});
			navigate("/auth");
		} catch (err) {
			toast({
				title: t("resetPw.resetFailed"),
				description: err.message,
				variant: "destructive"
			});
		} finally {
			setLoading(false);
		}
	};
	if (!isRecovery) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-source": "pages/ResetPassword.tsx:51:7:5292da1e9961b82aa9988e017de8834de6568469bd819e8c01a2fe1d52c9d40f:1",
		className: "min-h-[80vh] flex items-center justify-center px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "w-full max-w-md border-transparent card-elevated",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-source": "pages/ResetPassword.tsx:55:13:e1daee089bc6b630b1c8d7ab724506b018a19aae0e12a4fd1c3f64696b233ff1:1",
						className: "text-lg font-semibold text-foreground",
						children: t("resetPw.verifyingLink")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/ResetPassword.tsx:56:13:dbff3750aae5463908866e7ff5704b0019a23ce9c4451617b5d7a6c7d7c4f60e:1",
						className: "text-xs text-muted-foreground mt-2",
						children: t("resetPw.linkExpired")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "mt-4",
						onClick: () => navigate("/auth"),
						children: t("resetPw.backToSignIn")
					})
				]
			})
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-source": "pages/ResetPassword.tsx:65:5:d3d7f9b2588f70368ce9ca1777c6b0d9b6a748a1dfa0c60f7851b8fe4989535c:1",
		className: "min-h-[80vh] flex items-center justify-center px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "w-full max-w-md border-transparent card-elevated",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "pages/ResetPassword.tsx:68:11:7f13247bd37d0605c629d1cedb143b16b5c8fa9f3aea21f45abf5c9bbe079382:1",
						className: "mx-auto w-12 h-12 rounded-xl hero-gradient flex items-center justify-center mb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-6 w-6 text-primary-foreground" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-source": "pages/ResetPassword.tsx:71:11:c9b6d2b48d560cab422732191f8ed7e823b4449788924bc9a9955d0f900bb7f0:1",
						className: "text-2xl font-semibold leading-none tracking-tight",
						children: t("resetPw.title")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: t("resetPw.subtitle") })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/ResetPassword.tsx:75:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("resetPw.newPassword") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: "••••••••",
							onKeyDown: (e) => e.key === "Enter" && handleReset()
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/ResetPassword.tsx:79:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("resetPw.confirmPassword") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
							value: confirmPassword,
							onChange: (e) => setConfirmPassword(e.target.value),
							placeholder: "••••••••",
							onKeyDown: (e) => e.key === "Enter" && handleReset()
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "coral",
						className: "w-full",
						onClick: handleReset,
						disabled: loading,
						children: loading ? t("resetPw.updating") : t("resetPw.updatePassword")
					})
				]
			})]
		})
	});
}
var SplitComponent = ResetPassword;
//#endregion
export { SplitComponent as component };
