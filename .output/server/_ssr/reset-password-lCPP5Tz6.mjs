import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-DGU2jav_.mjs";
import { o as wpChangePassword } from "./wp-auth-DL1jfVY7.mjs";
import { Yt as Heart, jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { i as useNavigate$1 } from "./router-compat-CRbRSfhz.mjs";
import { t as PasswordInput } from "./password-input-BkNIMZKt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-lCPP5Tz6.js
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
		className: "min-h-[80vh] flex items-center justify-center px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "w-full max-w-md border-transparent card-elevated",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/h1/0",
						"data-inspector-source": "pages/ResetPassword.tsx:55:13:e1daee089bc6b630b1c8d7ab724506b018a19aae0e12a4fd1c3f64696b233ff1:1",
						className: "text-lg font-semibold text-foreground",
						children: t("resetPw.verifyingLink")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/p/0",
						"data-inspector-source": "pages/ResetPassword.tsx:56:13:dbff3750aae5463908866e7ff5704b0019a23ce9c4451617b5d7a6c7d7c4f60e:1",
						className: "text-xs text-muted-foreground mt-2",
						children: t("resetPw.linkExpired")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/Button/d0cda6559bb3",
						"data-inspector-source": "pages/ResetPassword.tsx:57:13:12e3a82b087d54cce47477990a624f10923a74c6374db9f663b3be855e80b37a:1",
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
		className: "min-h-[80vh] flex items-center justify-center px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "w-full max-w-md border-transparent card-elevated",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto w-12 h-12 rounded-xl hero-gradient flex items-center justify-center mb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-6 w-6 text-primary-foreground" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/h1/1",
						"data-inspector-source": "pages/ResetPassword.tsx:71:11:c9b6d2b48d560cab422732191f8ed7e823b4449788924bc9a9955d0f900bb7f0:1",
						className: "text-2xl font-semibold leading-none tracking-tight",
						children: t("resetPw.title")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/CardDescription/0",
						"data-inspector-source": "pages/ResetPassword.tsx:72:11:0cf9ba5c2962f0b3626ad31acfb90a8bba0e696c7861c4522336f9d74efa50c8:1",
						children: t("resetPw.subtitle")
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/Label/0",
						"data-inspector-source": "pages/ResetPassword.tsx:76:13:b71ab95e1cb52d66b6ea5cdedf6f84ac70c01233aa49a94d4dc3441e16412de8:1",
						children: t("resetPw.newPassword")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/PasswordInput/c073ded51d52",
						"data-inspector-source": "pages/ResetPassword.tsx:77:13:7848ec693ee3bf74b9c5ae2ca3ab418a2f9a4ccab4ebf87448e683859b5e4b6a:1",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						placeholder: "••••••••",
						onKeyDown: (e) => e.key === "Enter" && handleReset()
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/Label/1",
						"data-inspector-source": "pages/ResetPassword.tsx:80:13:0bb6e25f345707f7c2e2767ad54fd7005865591cea8f6c314638038abe60a501:1",
						children: t("resetPw.confirmPassword")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/PasswordInput/fadbbd809798",
						"data-inspector-source": "pages/ResetPassword.tsx:81:13:94ff932e4f273317e8c0f7c19b30d8b49832f8e76897b14d3cb1f8eabe07f0a6:1",
						value: confirmPassword,
						onChange: (e) => setConfirmPassword(e.target.value),
						placeholder: "••••••••",
						onKeyDown: (e) => e.key === "Enter" && handleReset()
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/Button/bae3656b8814",
						"data-inspector-source": "pages/ResetPassword.tsx:83:11:426884bea15446d737d63a9e7fee2ac170996034e764b516b2c48094e8706b0e:1",
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
