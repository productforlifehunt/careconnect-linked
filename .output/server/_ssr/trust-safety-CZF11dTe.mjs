import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { At as Lock, Dn as CircleCheckBig, L as Shield, Ot as Mail, _ as TriangleAlert, ct as Phone, in as Eye, rn as FileCheck } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trust-safety-CZF11dTe.js
var import_jsx_runtime = require_jsx_runtime();
function TrustSafety() {
	const { t } = useTranslation();
	const site = useSite();
	const safeguards = [
		{
			icon: FileCheck,
			title: t("trustSafety.comprehensiveBgChecks"),
			desc: t("trustSafety.comprehensiveBgChecksDesc"),
			badge: t("trustSafety.badgeRequired")
		},
		{
			icon: Shield,
			title: t("trustSafety.identityVerification"),
			desc: t("trustSafety.identityVerificationDesc"),
			badge: t("trustSafety.badgeVerified")
		},
		{
			icon: CircleCheckBig,
			title: t("trustSafety.credentialValidation"),
			desc: t("trustSafety.credentialValidationDesc"),
			badge: t("trustSafety.badgeValidated")
		},
		{
			icon: Eye,
			title: t("trustSafety.verifiedReviews"),
			desc: t("trustSafety.verifiedReviewsDesc"),
			badge: t("trustSafety.badgeAuthentic")
		},
		{
			icon: Lock,
			title: t("trustSafety.securePayments"),
			desc: t("trustSafety.securePaymentsDesc"),
			badge: t("trustSafety.badgeEncrypted")
		},
		{
			icon: TriangleAlert,
			title: t("trustSafety.realtimeSafetyAlerts"),
			desc: t("trustSafety.realtimeSafetyAlertsDesc"),
			badge: t("trustSafety.badge24_7")
		}
	];
	const stats = [
		{
			label: t("trustSafety.bgChecksCompleted"),
			value: "50,000+"
		},
		{
			label: t("trustSafety.activeVerified"),
			value: "12,000+"
		},
		{
			label: t("trustSafety.familiesServed"),
			value: "25,000+"
		},
		{
			label: t("trustSafety.safetyIncidents"),
			value: "99.8%"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/TrustSafety.tsx:28:5:b61c0db3be7538ad4f62e464d578d63d8c148b5fceb583066f660ee806b604ce:1",
		className: "max-w-5xl mx-auto px-4 py-8 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/TrustSafety.tsx:29:7:c3b202de5c725f242e794c2c0518f7361cf684fb3359d9be6c86aabb7748677e:1",
				className: "text-center mb-8 sm:mb-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "pages/TrustSafety.tsx:30:9:40a3b44488e4b801eefc54f7df78b992706599e60c691c45bf65de15d19e1d44:1",
						className: "mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl hero-gradient flex items-center justify-center mb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-source": "pages/TrustSafety.tsx:31:9:3c180dd1bf9c98dfb3aa51d690b306cca07b42add86f3c435c1fa0bfeb920a1b:1",
						className: "text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3",
						children: t("trustSafety.title")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/TrustSafety.tsx:32:9:f8bd65b644da8183a21996f1452cdbba035f50e3f484fff34569e5d0c855f5ee:1",
						className: "text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto",
						children: t("trustSafety.subtitle")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "pages/TrustSafety.tsx:35:7:f1058d67492a606fd403d84dffbf37e107e941be7401fd372bad1671db0b17a9:1",
				className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-12",
				children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-transparent card-elevated text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/TrustSafety.tsx:38:42:88ef4b341fea5a4dc91b00681361ad2fc54b24bfd8f0a7c6d6129cd45cb0c53f:0",
							className: "text-2xl md:text-3xl font-bold text-primary",
							children: s.value
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/TrustSafety.tsx:38:114:88ef4b341fea5a4dc91b00681361ad2fc54b24bfd8f0a7c6d6129cd45cb0c53f:0",
							className: "text-sm text-muted-foreground mt-1",
							children: s.label
						})]
					})
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "pages/TrustSafety.tsx:43:7:c34e438e5c8bd9a3d85ee07d6b96dc388a91ac63e75c56e3b38128417902e947:1",
				className: "space-y-6 mb-12",
				children: safeguards.map((sg, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-6 flex gap-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "pages/TrustSafety.tsx:47:15:81e75d80f664cef44eab47896f71e890c74991ee05cf55d8afa4951444b6df67:1",
							className: "w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(sg.icon, { className: "h-6 w-6 text-primary" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/TrustSafety.tsx:48:15:b1ff2850ea380f59e75af717280248a488429da1509175b4e56e2d3386937551:1",
							className: "flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/TrustSafety.tsx:49:17:de0675a7ac282622a3333717f67c6c3d0cc4ecccc3f876e239ba6cbf45df4084:1",
								className: "flex items-center gap-3 mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									"data-inspector-source": "pages/TrustSafety.tsx:49:63:de0675a7ac282622a3333717f67c6c3d0cc4ecccc3f876e239ba6cbf45df4084:1",
									className: "font-semibold text-lg text-foreground",
									children: sg.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "bg-success/10 text-success",
									children: sg.badge
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/TrustSafety.tsx:50:17:6c81f01d220a3789a058aa3b4acef644cdc6149434bc28051abe9ead4cf17d83:1",
								className: "text-muted-foreground",
								children: sg.desc
							})]
						})]
					})
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-transparent card-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("trustSafety.reportConcern") }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "pages/TrustSafety.tsx:60:11:520b397a185df75aadacae81c5127f74264dfafb2035d6f3e16d24cbb35abd2d:1",
					className: "text-muted-foreground mb-4",
					children: t("trustSafety.reportConcernDesc")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/TrustSafety.tsx:61:11:7bbd58a59445e37e43a503539e76102b469c1b4fb17911491a15424031747f62:1",
					className: "flex flex-col sm:flex-row gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "coral",
						className: "gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4" }),
							" ",
							t("trustSafety.callSafetyLine")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4" }),
							" ",
							t("trustSafety.emailSafety", { email: site.contactEmail })
						]
					})]
				})] })]
			})
		]
	});
}
var SplitComponent = TrustSafety;
//#endregion
export { SplitComponent as component };
