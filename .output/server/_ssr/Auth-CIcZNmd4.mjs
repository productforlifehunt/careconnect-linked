import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-DGU2jav_.mjs";
import { t as Input } from "./input-4rcasKp7.mjs";
import { f as wpRequestPasswordReset } from "./wp-auth-DL1jfVY7.mjs";
import { t as Checkbox } from "./checkbox-LEE7aLq-.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1, o as useSearchParams } from "./router-compat-CRbRSfhz.mjs";
import { n as withNext, t as safeNextPath } from "./return-path-B1QN16Ol.mjs";
import { t as BrandMark } from "./BrandMark-s4GFHX6D.mjs";
import { t as PasswordInput } from "./password-input-Wp5KYo_4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Auth-CIcZNmd4.js
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
		"data-inspector-id": "pages/Auth/Auth/div/0",
		"data-inspector-source": "pages/Auth.tsx:115:5:d3d7f9b2588f70368ce9ca1777c6b0d9b6a748a1dfa0c60f7851b8fe4989535c:1",
		className: "min-h-[80vh] flex items-center justify-center px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			"data-inspector-id": "pages/Auth/Auth/Card/0",
			"data-inspector-source": "pages/Auth.tsx:116:7:d1610eb37809e0b9292ad0f6d35590eebe1a315e29a0b7d9dc87172dfa83d143:1",
			className: "w-full max-w-md border-transparent card-elevated",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				"data-inspector-id": "pages/Auth/Auth/CardHeader/0",
				"data-inspector-source": "pages/Auth.tsx:117:9:ddae879e8bb2f107a38e496da43e976b1a6b2ea316cd5bd4a0afb69fdae44ed0:1",
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/Auth/Auth/div/1",
						"data-inspector-source": "pages/Auth.tsx:118:11:f00c25a390fa247096ed316da2de541303b99ff6187dffb7bbbbce68ed1341d8:1",
						className: "flex justify-center mb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
							"data-inspector-id": "pages/Auth/Auth/BrandMark/0",
							"data-inspector-source": "pages/Auth.tsx:119:13:20eb2c6e5a16fb1cdfcb42c7d6d8841384bd3c4ec25ebea0fc9e12b1223dae76:1",
							size: 56
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/Auth/Auth/h1/0",
						"data-inspector-source": "pages/Auth.tsx:121:11:44f5b8fdb2d7469a390982b2a1f215f4b1fd6756a6e8f28942701860f9b72f3c:1",
						className: "text-2xl font-semibold leading-none tracking-tight",
						children: site.name
					}),
					t(`site.${site.id}.authSubtitle`) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						"data-inspector-id": "pages/Auth/Auth/CardDescription/0",
						"data-inspector-source": "pages/Auth.tsx:123:13:fb0df506900896f3c8c23bcff55b20e3ff7cab75919dce80ffc0253fa230ef78:1",
						children: t(`site.${site.id}.authSubtitle`)
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				"data-inspector-id": "pages/Auth/Auth/CardContent/0",
				"data-inspector-source": "pages/Auth.tsx:126:9:d7a10a382e595c477c9a72f9ce46846c34f41285e4753cea04ba7dc121b2dbf7:1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					"data-inspector-id": "pages/Auth/Auth/Tabs/0",
					"data-inspector-source": "pages/Auth.tsx:127:11:7582728aa0396673a8e156c80920bfc0c4f3e196363d287a9cc2fe526b1902e6:1",
					defaultValue: initialMode,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							"data-inspector-id": "pages/Auth/Auth/TabsList/0",
							"data-inspector-source": "pages/Auth.tsx:128:13:99cdd587c731585dfe8a008435c3da262230819364952c63b00e110a1e45b8ab:1",
							className: "grid w-full grid-cols-2 h-auto",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								"data-inspector-id": "pages/Auth/Auth/TabsTrigger/0",
								"data-inspector-source": "pages/Auth.tsx:129:15:aa3b99a1e1d9e4c03f2f8c805ea023f82cc4d34a9d4ad40373dc43f675e0b73b:1",
								value: "login",
								className: "text-xs sm:text-sm px-1.5 py-1.5",
								children: t("common.signIn")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								"data-inspector-id": "pages/Auth/Auth/TabsTrigger/1",
								"data-inspector-source": "pages/Auth.tsx:130:15:fcccb4aee9cacd1017530a12bb9ad426f8d560527083e51d0a0883bba07676de:1",
								value: "signup",
								className: "text-xs sm:text-sm px-1.5 py-1.5",
								children: t("common.signUp")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							"data-inspector-id": "pages/Auth/Auth/TabsContent/0",
							"data-inspector-source": "pages/Auth.tsx:132:13:9233114ef7cd43bf70e44f4e3420cac9c438ff0a62d01bcff9e460c55d2e40d6:1",
							value: "login",
							className: "space-y-4 mt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Auth/Auth/div/2",
									"data-inspector-source": "pages/Auth.tsx:133:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "pages/Auth/Auth/Label/0",
										"data-inspector-source": "pages/Auth.tsx:134:17:86b1e72641a0dface9c7de9dfa8285155671544acb5fda94244ea11c2003484d:1",
										children: t("auth.emailOrUsername", { defaultValue: "Email or username" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "pages/Auth/Auth/Input/0",
										"data-inspector-source": "pages/Auth.tsx:135:17:763fe487b4101209bab2b71be18c37f524fefc3679885f9f4e13f2449073e282:1",
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
									"data-inspector-id": "pages/Auth/Auth/div/3",
									"data-inspector-source": "pages/Auth.tsx:137:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "pages/Auth/Auth/Label/1",
										"data-inspector-source": "pages/Auth.tsx:138:17:410219ddb8c6c1ef595403500fcc8f13a2f8ab6d790b5c6b411e3a94f52bb397:1",
										children: t("common.password")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
										"data-inspector-id": "pages/Auth/Auth/PasswordInput/0",
										"data-inspector-source": "pages/Auth.tsx:139:17:2716f150ad2387c7781a9e3ce7f499f5de3413d391ed5c3793968109d55e9eaa:1",
										value: loginPassword,
										onChange: (e) => setLoginPassword(e.target.value),
										placeholder: t("auth.passwordPlaceholder"),
										onKeyDown: (e) => e.key === "Enter" && handleLogin()
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Auth/Auth/Button/0",
									"data-inspector-source": "pages/Auth.tsx:141:15:38749b500f88083fa92bbbfe52d17baac117410014a896973aa07c43c2ebed6e:1",
									variant: "coral",
									className: "w-full",
									onClick: handleLogin,
									disabled: loading,
									children: loading ? t("auth.signingIn") : t("common.signIn")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "pages/Auth/Auth/div/4",
									"data-inspector-source": "pages/Auth.tsx:144:15:f94e033d58409a587eca864de56301c014f915e6603025d86532383d0d76174e:1",
									className: "text-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										"data-inspector-id": "pages/Auth/Auth/button/0",
										"data-inspector-source": "pages/Auth.tsx:145:17:63ed86569dbb9f492859704b89271c2a1102ca04e7f301509184b6e59307a588:1",
										type: "button",
										className: "text-sm text-primary hover:underline",
										onClick: () => setForgotOpen(true),
										children: t("auth.forgotPassword")
									})
								}),
								forgotOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Auth/Auth/div/5",
									"data-inspector-source": "pages/Auth.tsx:148:17:f7966d01920e278e2197a84ee5a7604ee1de6f1a5f0b837153f1816f83e1b560:1",
									className: "border rounded-lg p-4 mt-2 space-y-3 bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/Auth/Auth/p/0",
											"data-inspector-source": "pages/Auth.tsx:149:19:d2764d59126484c538bb56abfa1a9bc77d20cd07f6e0547788168905ee5154cd:1",
											className: "text-sm text-foreground font-medium",
											children: t("auth.resetPassword")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											"data-inspector-id": "pages/Auth/Auth/Input/1",
											"data-inspector-source": "pages/Auth.tsx:150:19:8c6af5dec99774d0e2f3d85bb3d78e23f87cda8bb3f9d7e71759238c4acd69c3:1",
											type: "email",
											value: forgotEmail,
											onChange: (e) => setForgotEmail(e.target.value),
											placeholder: t("auth.enterEmail")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											"data-inspector-id": "pages/Auth/Auth/Button/1",
											"data-inspector-source": "pages/Auth.tsx:151:19:3aca09dab0548aaaa8bdc6547e936d2ff9a97a23ed76f64f3eeb0940dca02d45:1",
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
							"data-inspector-id": "pages/Auth/Auth/TabsContent/1",
							"data-inspector-source": "pages/Auth.tsx:169:13:5da266aeb122d3661b22c53f7c94726c032f46d41bdc53dfef468fed5cf49141:1",
							value: "signup",
							className: "space-y-4 mt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Auth/Auth/div/6",
									"data-inspector-source": "pages/Auth.tsx:170:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "pages/Auth/Auth/Label/2",
										"data-inspector-source": "pages/Auth.tsx:171:17:4ccfde08d0eae995f8c78d80e31750f33c24136f4393847b4d09f8d815b98735:1",
										children: t("common.fullName")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "pages/Auth/Auth/Input/2",
										"data-inspector-source": "pages/Auth.tsx:172:17:368245713d7b2b90b00a4355cf96584c590cc705ee0ce2f8d1cc3cb9ab58322b:1",
										value: signupName,
										onChange: (e) => setSignupName(e.target.value),
										placeholder: t("auth.namePlaceholder")
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Auth/Auth/div/7",
									"data-inspector-source": "pages/Auth.tsx:174:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "pages/Auth/Auth/Label/3",
										"data-inspector-source": "pages/Auth.tsx:175:17:4bc3265dff2288507a0fe38bb142007d99a9a8869611c531f2b33d17372ba704:1",
										children: t("common.email")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "pages/Auth/Auth/Input/3",
										"data-inspector-source": "pages/Auth.tsx:176:17:15f7dc9d49b77ee783f9faffef1c46e4b5e6093ec41b1178663941c9fa0424fa:1",
										type: "email",
										value: signupEmail,
										onChange: (e) => setSignupEmail(e.target.value),
										placeholder: t("auth.emailPlaceholder")
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Auth/Auth/div/8",
									"data-inspector-source": "pages/Auth.tsx:178:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											"data-inspector-id": "pages/Auth/Auth/Label/4",
											"data-inspector-source": "pages/Auth.tsx:179:17:410219ddb8c6c1ef595403500fcc8f13a2f8ab6d790b5c6b411e3a94f52bb397:1",
											children: t("common.password")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
											"data-inspector-id": "pages/Auth/Auth/PasswordInput/1",
											"data-inspector-source": "pages/Auth.tsx:180:17:318d7a0bcae271105174087571473868568895c2bbb1bb88dd0c93699fc9aa04:1",
											value: signupPassword,
											onChange: (e) => setSignupPassword(e.target.value),
											placeholder: t("auth.passwordHint")
										}),
										signupPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/Auth/Auth/div/9",
											"data-inspector-source": "pages/Auth.tsx:182:19:8ba5c405a48d054eb9809c524513ef4d5dbad90eb02ab29a81471457e9d700ca:1",
											className: "mt-2 space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-id": "pages/Auth/Auth/div/10",
												"data-inspector-source": "pages/Auth.tsx:183:21:0deb6fe58a4d849a0075df18f5d7fb638ed5e9e4cd3602096e3acd52bddea2ca:1",
												className: "flex gap-1",
												children: [
													1,
													2,
													3,
													4,
													5
												].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													"data-inspector-id": "pages/Auth/Auth/div/11",
													"data-inspector-source": "pages/Auth.tsx:185:25:8c96d3717f8b001e081984e08bc9af072c8d50dd49137d72cb89c917c7e2220b:1",
													className: `h-1.5 flex-1 rounded-full ${i <= pwStrength.score ? pwStrength.color : "bg-muted"}`
												}, i))
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-id": "pages/Auth/Auth/p/1",
												"data-inspector-source": "pages/Auth.tsx:188:21:6e96086e7929db8e3646fa1ea459437b534170db077fca9991b8042bb737c4a0:1",
												className: `text-xs ${pwStrength.score <= 1 ? "text-destructive" : pwStrength.score <= 2 ? "text-warning" : "text-success"}`,
												children: pwStrength.label
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Auth/Auth/div/12",
									"data-inspector-source": "pages/Auth.tsx:192:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											"data-inspector-id": "pages/Auth/Auth/Label/5",
											"data-inspector-source": "pages/Auth.tsx:193:17:91ba0de90395a49005d62ccdbeaac2f599774027cbe5313ab9eae27efc8926b5:1",
											children: t("auth.confirmPassword", { defaultValue: "Confirm password" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
											"data-inspector-id": "pages/Auth/Auth/PasswordInput/2",
											"data-inspector-source": "pages/Auth.tsx:194:17:8c59afc30e570647d77ec2080f3b5b569ba601d5491b1f9cfb233d64786d4563:1",
											value: signupPassword2,
											onChange: (e) => setSignupPassword2(e.target.value),
											placeholder: t("auth.confirmPasswordPlaceholder", { defaultValue: "Type your password again" }),
											onKeyDown: (e) => e.key === "Enter" && handleSignup()
										}),
										signupPassword2 && signupPassword2 !== signupPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/Auth/Auth/p/2",
											"data-inspector-source": "pages/Auth.tsx:201:19:8ec17d66a1510c9f7580d8d6216a0e6c0afabb5a8127f624f9030d8ac4cd2221:1",
											className: "text-xs text-destructive mt-1",
											children: t("auth.passwordsDoNotMatch", { defaultValue: "Passwords do not match" })
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									"data-inspector-id": "pages/Auth/Auth/label/0",
									"data-inspector-source": "pages/Auth.tsx:206:15:44962981b7c1ab48ad79e2ecc67156c8eae7fc88e66033550714917a880e7c49:1",
									className: "flex items-start gap-2 text-xs text-muted-foreground cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
										"data-inspector-id": "pages/Auth/Auth/Checkbox/0",
										"data-inspector-source": "pages/Auth.tsx:207:17:3695ddfb9f76b4db63de95d415e214502a9ed145716d0d0d82afd310cf067fd0:1",
										checked: termsAccepted,
										onCheckedChange: (v) => setTermsAccepted(v === true),
										className: "mt-0.5",
										"aria-label": t("auth.acceptTerms", { defaultValue: "I accept the terms and the privacy notice" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "pages/Auth/Auth/span/0",
										"data-inspector-source": "pages/Auth.tsx:213:17:562e7dea04057999d7d01cc107b5808c1f21f06bbdbfa35662ed779d620e3f77:1",
										children: t("auth.acceptTerms", { defaultValue: "I accept the terms and the privacy notice, including the storage of health and location information I choose to add." })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Auth/Auth/Button/2",
									"data-inspector-source": "pages/Auth.tsx:215:15:4a680489d2295f39ee04e5762b92bdef06028ba80ecdf3c56e7b47e683dace1a:1",
									variant: "coral",
									className: "w-full",
									onClick: handleSignup,
									disabled: loading,
									children: loading ? t("auth.creatingAccount") : t("common.signUp")
								})
							]
						})
					]
				})
			})]
		})
	});
}
//#endregion
export { Auth as t };
