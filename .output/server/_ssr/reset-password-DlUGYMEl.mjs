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
import { i as useNavigate$1 } from "./router-compat-DbWBz8c6.mjs";
import { t as PasswordInput } from "./password-input-_moxnRCs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-DlUGYMEl.js
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
		"data-inspector-id": "pages/ResetPassword/ResetPassword/div/0",
		"data-inspector-source": "pages/ResetPassword.tsx:51:7:5292da1e9961b82aa9988e017de8834de6568469bd819e8c01a2fe1d52c9d40f:1",
		className: "min-h-[80vh] flex items-center justify-center px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			"data-inspector-id": "pages/ResetPassword/ResetPassword/Card/0",
			"data-inspector-source": "pages/ResetPassword.tsx:52:9:24fb3a61dfd920c9633b5e945661dcc2f9cf2bf86019b8669cb3439ebeda1606:1",
			className: "w-full max-w-md border-transparent card-elevated",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				"data-inspector-id": "pages/ResetPassword/ResetPassword/CardContent/0",
				"data-inspector-source": "pages/ResetPassword.tsx:53:11:b77bb0d29426ba66b57b8f14be9fcd0a96078df35eda96a063f8ba497bd70cce:1",
				className: "p-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/Loader2/0",
						"data-inspector-source": "pages/ResetPassword.tsx:54:13:fbbbac4731925b6106191ea5e725947894f32d035b28efeff26610eb45bd67fb:1",
						className: "h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/h1/e3b98a4da31a/0",
						"data-inspector-source": "pages/ResetPassword.tsx:55:13:e1daee089bc6b630b1c8d7ab724506b018a19aae0e12a4fd1c3f64696b233ff1:1",
						className: "text-lg font-semibold text-foreground",
						children: t("resetPw.verifyingLink")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/p/e3b98a4da31a/0",
						"data-inspector-source": "pages/ResetPassword.tsx:56:13:dbff3750aae5463908866e7ff5704b0019a23ce9c4451617b5d7a6c7d7c4f60e:1",
						className: "text-xs text-muted-foreground mt-2",
						children: t("resetPw.linkExpired")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/Button/64da27f77818/0",
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
		"data-inspector-id": "pages/ResetPassword/ResetPassword/div/1",
		"data-inspector-source": "pages/ResetPassword.tsx:65:5:d3d7f9b2588f70368ce9ca1777c6b0d9b6a748a1dfa0c60f7851b8fe4989535c:1",
		className: "min-h-[80vh] flex items-center justify-center px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			"data-inspector-id": "pages/ResetPassword/ResetPassword/Card/1",
			"data-inspector-source": "pages/ResetPassword.tsx:66:7:d1610eb37809e0b9292ad0f6d35590eebe1a315e29a0b7d9dc87172dfa83d143:1",
			className: "w-full max-w-md border-transparent card-elevated",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				"data-inspector-id": "pages/ResetPassword/ResetPassword/CardHeader/0",
				"data-inspector-source": "pages/ResetPassword.tsx:67:9:ddae879e8bb2f107a38e496da43e976b1a6b2ea316cd5bd4a0afb69fdae44ed0:1",
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/div/2",
						"data-inspector-source": "pages/ResetPassword.tsx:68:11:7f13247bd37d0605c629d1cedb143b16b5c8fa9f3aea21f45abf5c9bbe079382:1",
						className: "mx-auto w-12 h-12 rounded-xl hero-gradient flex items-center justify-center mb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
							"data-inspector-id": "pages/ResetPassword/ResetPassword/Heart/0",
							"data-inspector-source": "pages/ResetPassword.tsx:69:13:2927e91711429d39b4554faabe22594797ad505d84ca1854ef5bfd4f74b91932:1",
							className: "h-6 w-6 text-primary-foreground"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/h1/e3b98a4da31a/1",
						"data-inspector-source": "pages/ResetPassword.tsx:71:11:c9b6d2b48d560cab422732191f8ed7e823b4449788924bc9a9955d0f900bb7f0:1",
						className: "text-2xl font-semibold leading-none tracking-tight",
						children: t("resetPw.title")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/CardDescription/e3b98a4da31a/0",
						"data-inspector-source": "pages/ResetPassword.tsx:72:11:0cf9ba5c2962f0b3626ad31acfb90a8bba0e696c7861c4522336f9d74efa50c8:1",
						children: t("resetPw.subtitle")
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				"data-inspector-id": "pages/ResetPassword/ResetPassword/CardContent/1",
				"data-inspector-source": "pages/ResetPassword.tsx:74:9:cc8ea7d2cded8a22448260682e5f00c2d8bec53617c3b425befcf0e177771087:1",
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/div/3",
						"data-inspector-source": "pages/ResetPassword.tsx:75:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							"data-inspector-id": "pages/ResetPassword/ResetPassword/Label/e3b98a4da31a/0",
							"data-inspector-source": "pages/ResetPassword.tsx:76:13:b71ab95e1cb52d66b6ea5cdedf6f84ac70c01233aa49a94d4dc3441e16412de8:1",
							children: t("resetPw.newPassword")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
							"data-inspector-id": "pages/ResetPassword/ResetPassword/PasswordInput/8e8efe5bf821/0",
							"data-inspector-source": "pages/ResetPassword.tsx:77:13:7848ec693ee3bf74b9c5ae2ca3ab418a2f9a4ccab4ebf87448e683859b5e4b6a:1",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: "••••••••",
							onKeyDown: (e) => e.key === "Enter" && handleReset()
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/div/4",
						"data-inspector-source": "pages/ResetPassword.tsx:79:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							"data-inspector-id": "pages/ResetPassword/ResetPassword/Label/e3b98a4da31a/1",
							"data-inspector-source": "pages/ResetPassword.tsx:80:13:0bb6e25f345707f7c2e2767ad54fd7005865591cea8f6c314638038abe60a501:1",
							children: t("resetPw.confirmPassword")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
							"data-inspector-id": "pages/ResetPassword/ResetPassword/PasswordInput/1e8450d8c9b6/0",
							"data-inspector-source": "pages/ResetPassword.tsx:81:13:94ff932e4f273317e8c0f7c19b30d8b49832f8e76897b14d3cb1f8eabe07f0a6:1",
							value: confirmPassword,
							onChange: (e) => setConfirmPassword(e.target.value),
							placeholder: "••••••••",
							onKeyDown: (e) => e.key === "Enter" && handleReset()
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "pages/ResetPassword/ResetPassword/Button/5e9442e3b353/0",
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
