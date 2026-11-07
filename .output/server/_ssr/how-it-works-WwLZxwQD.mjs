import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { Dn as CircleCheckBig, Dt as MapPin, G as Search, L as Shield, Ln as CalendarDays, T as Star, Yt as Heart, c as Users } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { i as useNavigate$1 } from "./router-compat-CRbRSfhz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/how-it-works-WwLZxwQD.js
var import_jsx_runtime = require_jsx_runtime();
function HowItWorks() {
	const navigate = useNavigate$1();
	const site = useSite();
	const { t } = useTranslation();
	const steps = [
		{
			icon: Search,
			title: t("howItWorks.step1Title"),
			desc: t("howItWorks.step1Desc")
		},
		{
			icon: CalendarDays,
			title: t("howItWorks.step2Title"),
			desc: t("howItWorks.step2Desc")
		},
		{
			icon: Users,
			title: t("howItWorks.step3Title"),
			desc: t("howItWorks.step3Desc")
		},
		{
			icon: MapPin,
			title: t("howItWorks.step4Title"),
			desc: t("howItWorks.step4Desc")
		}
	];
	const features = [
		{
			icon: Shield,
			title: t("howItWorks.bgVerified"),
			desc: t("howItWorks.bgVerifiedDesc")
		},
		{
			icon: Star,
			title: t("howItWorks.verifiedReviews"),
			desc: t("howItWorks.verifiedReviewsDesc")
		},
		{
			icon: CircleCheckBig,
			title: t("howItWorks.certifiedPros"),
			desc: t("howItWorks.certifiedProsDesc")
		},
		{
			icon: Heart,
			title: t("howItWorks.careMatching"),
			desc: t("howItWorks.careMatchingDesc")
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-5xl mx-auto px-4 py-8 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center mb-10 sm:mb-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					"data-inspector-id": "pages/HowItWorks/HowItWorks/h1/0",
					"data-inspector-source": "pages/HowItWorks.tsx:30:9:54a6ed99c0a7f50b2e5eec3c5e26c75c1713d48089fd0b127897775850682be7:1",
					className: "text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3",
					children: t(`site.${site.id}.howItWorksTitle`)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "pages/HowItWorks/HowItWorks/p/0",
					"data-inspector-source": "pages/HowItWorks.tsx:31:9:b87741d6c1264d378e1f1195e96f711fe63e312e9edcaaffdbda33dc2b2ddd18:1",
					className: "text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto",
					children: t("howItWorks.subtitle")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/HowItWorks/HowItWorks/div/0",
				"data-inspector-source": "pages/HowItWorks.tsx:33:7:a3cd18646e2062b40288f9a4c16011efdc1f7108aa57a69a5aca606b93cc8a9d:1",
				className: "space-y-10 sm:space-y-12 mb-16 sm:mb-20",
				children: steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/HowItWorks/HowItWorks/div/1",
					"data-inspector-source": "pages/HowItWorks.tsx:35:11:81344300525dbcedae0229798956073de6be0a5fb1a21c072db5399a8531f616:1",
					className: `flex flex-col md:flex-row gap-8 items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-24 h-24 rounded-3xl hero-gradient flex items-center justify-center shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(step.icon, { className: "h-10 w-10 text-primary-foreground" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 text-center md:text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-3 justify-center md:justify-start mb-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-id": "pages/HowItWorks/HowItWorks/span/0",
									"data-inspector-source": "pages/HowItWorks.tsx:41:17:493bcfde6f450dbe13622b93cf8416b59e4d4c679cd4b7fd39011e0ae9074b02:1",
									className: "text-sm font-bold text-primary",
									children: [
										t("common.step"),
										" ",
										i + 1
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								"data-inspector-id": "pages/HowItWorks/HowItWorks/h2/0",
								"data-inspector-source": "pages/HowItWorks.tsx:43:15:400644b43ff82dc3616bad71fa32c47183530755a7838ea5782acff35b100f14:1",
								className: "text-2xl font-bold text-foreground mb-2",
								children: step.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/HowItWorks/HowItWorks/p/1",
								"data-inspector-source": "pages/HowItWorks.tsx:44:15:1e55e6fed32d9ff01d414398e0b63782fa16b6fda3555db654e5556c1d67bee6:1",
								className: "text-muted-foreground leading-relaxed",
								children: step.desc
							})
						]
					})]
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-id": "pages/HowItWorks/HowItWorks/h2/1",
					"data-inspector-source": "pages/HowItWorks.tsx:50:9:3de8c750a80b9bb58b9e5db990a7275eecd00ff22bed539f4c13dfbb670bcff8:1",
					className: "text-2xl font-bold text-foreground text-center mb-8",
					children: t("howItWorks.whyTrust")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/HowItWorks/HowItWorks/div/2",
					"data-inspector-source": "pages/HowItWorks.tsx:51:9:8050cfe8985ea8e30a1377c6cede5545092b9be62b84219e734a41da8567183d:1",
					className: "grid md:grid-cols-2 gap-6",
					children: features.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						"data-inspector-id": "pages/HowItWorks/HowItWorks/Card/0",
						"data-inspector-source": "pages/HowItWorks.tsx:53:13:f3b07eba12c1186a61671a98c467ad84d23e97c1926d8e5fc2d77233cf509432:1",
						className: "border-transparent card-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-6 flex gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "h-6 w-6 text-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								"data-inspector-id": "pages/HowItWorks/HowItWorks/h3/0",
								"data-inspector-source": "pages/HowItWorks.tsx:59:19:d09f338e9437f1480f74fa01f80d709dc45d9834ca50237be491a4cac58ac517:1",
								className: "font-semibold text-foreground mb-1",
								children: f.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/HowItWorks/HowItWorks/p/2",
								"data-inspector-source": "pages/HowItWorks.tsx:60:19:e8ae2b5c4c3eabcca32aaf009cb44c51e9c460dda30d9ae1a25e4a62ce19ceea:1",
								className: "text-sm text-muted-foreground",
								children: f.desc
							})] })]
						})
					}, i))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center hero-gradient rounded-2xl p-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						"data-inspector-id": "pages/HowItWorks/HowItWorks/h2/2",
						"data-inspector-source": "pages/HowItWorks.tsx:68:9:16393940c801f1bf5a82e61d0f1c835996531d3113344509b30799dc91249d84:1",
						className: "text-2xl font-bold text-primary-foreground mb-4",
						children: t("howItWorks.readyToStart")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/HowItWorks/HowItWorks/p/3",
						"data-inspector-source": "pages/HowItWorks.tsx:69:9:68a67252665547ddfe8976f256744f73a400235533a668e172313fbdfa82e4b8:1",
						className: "text-primary-foreground/80 mb-6",
						children: t("howItWorks.searchForFree")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/HowItWorks/HowItWorks/div/3",
						"data-inspector-source": "pages/HowItWorks.tsx:70:9:733afc935bfafb07b0993acc3c8acfdd0aafdc71fe9f68974991449ade3c2d02:1",
						className: "flex gap-3 justify-center",
						children: [site.features.paidCaregivers && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "pages/HowItWorks/HowItWorks/Button/d0cda6559bb3",
							"data-inspector-source": "pages/HowItWorks.tsx:72:13:6cc6634f80b2d2ddbcc576c3fcbc7203e8a88d11b1683d9670af0923563f783b:1",
							variant: "coral",
							size: "lg",
							onClick: () => navigate("/search"),
							children: t(`site.${site.id}.ctaButton`)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "pages/HowItWorks/HowItWorks/Button/d0cda6559bb3",
							"data-inspector-source": "pages/HowItWorks.tsx:74:11:f93d03b3caeb2061bc20bd25a91061cfe17e867dcd9decb8db7af5cdcc2cf193:1",
							variant: "outline",
							size: "lg",
							className: "bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
							onClick: () => navigate("/auth?mode=signup"),
							children: t("howItWorks.createAccount")
						})]
					})
				]
			})
		]
	});
}
var SplitComponent = HowItWorks;
//#endregion
export { SplitComponent as component };
