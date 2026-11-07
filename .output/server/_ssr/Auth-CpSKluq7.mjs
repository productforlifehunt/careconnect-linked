import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { f as wpRequestPasswordReset } from "./wp-auth-DL1jfVY7.mjs";
import { t as Checkbox } from "./checkbox-4tVtKjWh.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1, o as useSearchParams } from "./router-compat-3gk8yjav.mjs";
import { n as withNext, t as safeNextPath } from "./return-path-B1QN16Ol.mjs";
import { t as BrandMark } from "./BrandMark-DkcdUUQ8.mjs";
import { t as PasswordInput } from "./password-input-CqPpo553.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Auth-CpSKluq7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Auth() {
	const [searchParams] = useSearchParams();
	const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
	const nextPath = safeNextPath(searchParams.get("next"));
	const navigate = useNavigate$1();
	const { login, signup } = useAuth();
	const site = useSite();
	const { toast } = useToast();
	const { t } = useTranslation();
	const [loginEmail, setLoginEmail] = (0, import_react.useState)("");
	const [loginPassword, setLoginPassword] = (0, import_react.useState)("");
	const [signupName, setSignupName] = (0, import_react.useState)("");
	const [signupEmail, setSignupEmail] = (0, import_react.useState)("");
	const [signupPassword, setSignupPassword] = (0, import_react.useState)("");
	const [signupPassword2, setSignupPassword2] = (0, import_react.useState)("");
	const [termsAccepted, setTermsAccepted] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [forgotOpen, setForgotOpen] = (0, import_react.useState)(false);
	const [forgotEmail, setForgotEmail] = (0, import_react.useState)("");
	const [forgotLoading, setForgotLoading] = (0, import_react.useState)(false);
	const passwordStrength = (pw) => {
		if (!pw) return {
			score: 0,
			label: "",
			color: ""
		};
		let score = 0;
		if (pw.length >= 8) score++;
		if (pw.length >= 12) score++;
		if (/[A-Z]/.test(pw)) score++;
		if (/[0-9]/.test(pw)) score++;
		if (/[^A-Za-z0-9]/.test(pw)) score++;
		if (score <= 1) return {
			score,
			label: t("common.weak"),
			color: "bg-destructive"
		};
		if (score <= 2) return {
			score,
			label: t("common.fair"),
			color: "bg-warning"
		};
		if (score <= 3) return {
			score,
			label: t("common.good"),
			color: "bg-primary"
		};
		return {
			score,
			label: t("common.strong"),
			color: "bg-success"
		};
	};
	const pwStrength = passwordStrength(signupPassword);
	const handleLogin = async () => {
		if (!loginEmail || !loginPassword) {
			toast({
				title: t("auth.fillAllFields"),
				variant: "destructive"
			});
			return;
		}
		setLoading(true);
		try {
			await login(loginEmail, loginPassword);
			toast({ title: t("auth.welcomeBack") });
			navigate(nextPath || "/dashboard");
		} catch (err) {
			toast({
				title: t("auth.loginFailed"),
				description: err.message,
				variant: "destructive"
			});
		} finally {
			setLoading(false);
		}
	};
	const handleSignup = async () => {
		if (!signupName || !signupEmail || !signupPassword) {
			toast({
				title: t("auth.fillAllFields"),
				variant: "destructive"
			});
			return;
		}
		if (signupPassword.length < 8) {
			toast({
				title: t("auth.passwordTooShort"),
				description: t("auth.passwordTooShortDesc"),
				variant: "destructive"
			});
			return;
		}
		if (signupPassword !== signupPassword2) {
			toast({
				title: t("auth.passwordsDoNotMatch", { defaultValue: "Passwords do not match" }),
				variant: "destructive"
			});
			return;
		}
		if (!termsAccepted) {
			toast({
				title: t("auth.mustAcceptTerms", { defaultValue: "Please accept the terms and privacy notice first" }),
				variant: "destructive"
			});
			return;
		}
		if (pwStrength.score < 2) {
			toast({
				title: t("auth.passwordTooWeak"),
				description: t("auth.passwordTooWeakDesc"),
				variant: "destructive"
			});
			return;
		}
		setLoading(true);
		try {
			await signup(signupName, signupEmail, signupPassword, "care-seeker");
			toast({
				title: t("auth.accountCreated"),
				description: t("settings.creditsGrantedBody", { defaultValue: "You have 10 AI credits to try the assistant in this app." })
			});
			navigate(withNext("/onboarding", nextPath));
		} catch (err) {
			toast({
				title: t("auth.signupFailed"),
				description: err.message,
				variant: "destructive"
			});
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-source": "pages/Auth.tsx:115:5:d3d7f9b2588f70368ce9ca1777c6b0d9b6a748a1dfa0c60f7851b8fe4989535c:1",
		className: "min-h-[80vh] flex items-center justify-center px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "w-full max-w-md border-transparent card-elevated",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "pages/Auth.tsx:118:11:f00c25a390fa247096ed316da2de541303b99ff6187dffb7bbbbce68ed1341d8:1",
						className: "flex justify-center mb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { size: 56 })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-source": "pages/Auth.tsx:121:11:44f5b8fdb2d7469a390982b2a1f215f4b1fd6756a6e8f28942701860f9b72f3c:1",
						className: "text-2xl font-semibold leading-none tracking-tight",
						children: site.name
					}),
					t(`site.${site.id}.authSubtitle`) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: t(`site.${site.id}.authSubtitle`) })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: initialMode,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid w-full grid-cols-2 h-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "login",
							className: "text-xs sm:text-sm px-1.5 py-1.5",
							children: t("common.signIn")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "signup",
							className: "text-xs sm:text-sm px-1.5 py-1.5",
							children: t("common.signUp")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "login",
						className: "space-y-4 mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Auth.tsx:133:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("auth.emailOrUsername", { defaultValue: "Email or username" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "text",
									autoComplete: "username",
									inputMode: "email",
									autoCapitalize: "none",
									spellCheck: false,
									value: loginEmail,
									onChange: (e) => setLoginEmail(e.target.value),
									placeholder: t("auth.emailOrUsernamePlaceholder", { defaultValue: "you@example.com" }),
									onKeyDown: (e) => e.key === "Enter" && handleLogin()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Auth.tsx:137:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("common.password") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
									value: loginPassword,
									onChange: (e) => setLoginPassword(e.target.value),
									placeholder: t("auth.passwordPlaceholder"),
									onKeyDown: (e) => e.key === "Enter" && handleLogin()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "coral",
								className: "w-full",
								onClick: handleLogin,
								disabled: loading,
								children: loading ? t("auth.signingIn") : t("common.signIn")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "pages/Auth.tsx:144:15:f94e033d58409a587eca864de56301c014f915e6603025d86532383d0d76174e:1",
								className: "text-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									"data-inspector-source": "pages/Auth.tsx:145:17:63ed86569dbb9f492859704b89271c2a1102ca04e7f301509184b6e59307a588:1",
									type: "button",
									className: "text-sm text-primary hover:underline",
									onClick: () => setForgotOpen(true),
									children: t("auth.forgotPassword")
								})
							}),
							forgotOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Auth.tsx:148:17:f7966d01920e278e2197a84ee5a7604ee1de6f1a5f0b837153f1816f83e1b560:1",
								className: "border rounded-lg p-4 mt-2 space-y-3 bg-muted/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/Auth.tsx:149:19:d2764d59126484c538bb56abfa1a9bc77d20cd07f6e0547788168905ee5154cd:1",
										className: "text-sm text-foreground font-medium",
										children: t("auth.resetPassword")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "email",
										value: forgotEmail,
										onChange: (e) => setForgotEmail(e.target.value),
										placeholder: t("auth.enterEmail")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										className: "w-full",
										disabled: forgotLoading,
										onClick: async () => {
											if (!forgotEmail) {
												toast({
													title: t("auth.enterEmail"),
													variant: "destructive"
												});
												return;
											}
											setForgotLoading(true);
											try {
												await wpRequestPasswordReset(forgotEmail);
												toast({
													title: t("auth.resetLinkSent", "Reset Link Sent"),
													description: t("auth.resetLinkSentDesc", "Check your email for a password reset link.")
												});
												setForgotOpen(false);
											} catch (err) {
												toast({
													title: t("common.errorOccurred"),
													description: err.message,
													variant: "destructive"
												});
											} finally {
												setForgotLoading(false);
											}
										},
										children: forgotLoading ? t("auth.sendingResetLink") : t("auth.sendResetLink")
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "signup",
						className: "space-y-4 mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Auth.tsx:170:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("common.fullName") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: signupName,
									onChange: (e) => setSignupName(e.target.value),
									placeholder: t("auth.namePlaceholder")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Auth.tsx:174:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("common.email") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									value: signupEmail,
									onChange: (e) => setSignupEmail(e.target.value),
									placeholder: t("auth.emailPlaceholder")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Auth.tsx:178:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("common.password") }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
										value: signupPassword,
										onChange: (e) => setSignupPassword(e.target.value),
										placeholder: t("auth.passwordHint")
									}),
									signupPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/Auth.tsx:182:19:8ba5c405a48d054eb9809c524513ef4d5dbad90eb02ab29a81471457e9d700ca:1",
										className: "mt-2 space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/Auth.tsx:183:21:0deb6fe58a4d849a0075df18f5d7fb638ed5e9e4cd3602096e3acd52bddea2ca:1",
											className: "flex gap-1",
											children: [
												1,
												2,
												3,
												4,
												5
											].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-source": "pages/Auth.tsx:185:25:8c96d3717f8b001e081984e08bc9af072c8d50dd49137d72cb89c917c7e2220b:1",
												className: `h-1.5 flex-1 rounded-full ${i <= pwStrength.score ? pwStrength.color : "bg-muted"}`
											}, i))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "pages/Auth.tsx:188:21:6e96086e7929db8e3646fa1ea459437b534170db077fca9991b8042bb737c4a0:1",
											className: `text-xs ${pwStrength.score <= 1 ? "text-destructive" : pwStrength.score <= 2 ? "text-warning" : "text-success"}`,
											children: pwStrength.label
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Auth.tsx:192:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("auth.confirmPassword", { defaultValue: "Confirm password" }) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
										value: signupPassword2,
										onChange: (e) => setSignupPassword2(e.target.value),
										placeholder: t("auth.confirmPasswordPlaceholder", { defaultValue: "Type your password again" }),
										onKeyDown: (e) => e.key === "Enter" && handleSignup()
									}),
									signupPassword2 && signupPassword2 !== signupPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/Auth.tsx:201:19:8ec17d66a1510c9f7580d8d6216a0e6c0afabb5a8127f624f9030d8ac4cd2221:1",
										className: "text-xs text-destructive mt-1",
										children: t("auth.passwordsDoNotMatch", { defaultValue: "Passwords do not match" })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								"data-inspector-source": "pages/Auth.tsx:206:15:44962981b7c1ab48ad79e2ecc67156c8eae7fc88e66033550714917a880e7c49:1",
								className: "flex items-start gap-2 text-xs text-muted-foreground cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: termsAccepted,
									onCheckedChange: (v) => setTermsAccepted(v === true),
									className: "mt-0.5",
									"aria-label": t("auth.acceptTerms", { defaultValue: "I accept the terms and the privacy notice" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "pages/Auth.tsx:213:17:562e7dea04057999d7d01cc107b5808c1f21f06bbdbfa35662ed779d620e3f77:1",
									children: t("auth.acceptTerms", { defaultValue: "I accept the terms and the privacy notice, including the storage of health and location information I choose to add." })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "coral",
								className: "w-full",
								onClick: handleSignup,
								disabled: loading,
								children: loading ? t("auth.creatingAccount") : t("common.signUp")
							})
						]
					})
				]
			}) })]
		})
	});
}
//#endregion
export { Auth as t };
