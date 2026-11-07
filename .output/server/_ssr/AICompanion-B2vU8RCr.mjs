import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { At as Lock, Dn as CircleCheckBig, L as Shield, Xn as ArrowRight, Yt as Heart, _ as TriangleAlert, in as Eye, r as WandSparkles, wt as MessageCircle } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { n as useAIAssistant } from "./AIAssistantContext-CGVvEq5z.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1 } from "./router-compat-3gk8yjav.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AICompanion-B2vU8RCr.js
var import_jsx_runtime = require_jsx_runtime();
var AICompanion = () => {
	const navigate = useNavigate$1();
	const { isAuthenticated } = useAuth();
	const { openAssistant } = useAIAssistant();
	const openAi = () => isAuthenticated ? openAssistant() : navigate("/auth?mode=signup");
	const { t, i18n } = useTranslation();
	const site = useSite();
	const assistantName = i18n.language?.startsWith("zh") ? site.family === "carecnc" ? "护畅AI助手" : site.family === "notchsafety" ? "诺驰安全AI助手" : "小忆AI" : `${site.name} AI Assistant`;
	const copy = (key) => String(t(`aiCompanion.${key}`)).replace(/ChallengeD Assistant/g, assistantName).replace(/ChallengeD/g, site.name).replace(/小忆AI/g, assistantName).replace(/忆畅/g, site.name);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/AICompanion.tsx:33:5:846dd61817740bc6ba8b1ce14183a1f44c506623273f9638549d1b29df92915c:1",
		className: "min-h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				"data-inspector-source": "pages/AICompanion.tsx:35:7:4c34e1099679f498c5d30b7b91b58b99afcc18545ec8d852c44d9863e080c990:1",
				className: "hero-gradient py-14 sm:py-20 md:py-28",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/AICompanion.tsx:36:9:2367a04e0448e3a144fd72afa30e90bea2ae16eb8d948d150a7ae0a822e4ac44:1",
					className: "max-w-5xl mx-auto px-4 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "mb-4 bg-primary-foreground/20 text-primary-foreground border-0 text-xs sm:text-sm px-3 py-1",
							children: copy("badge")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							"data-inspector-source": "pages/AICompanion.tsx:40:11:0a141dae51ac59dae47663858220d6e970622945693e1dcbabf4581f89591e65:1",
							className: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground mb-4 sm:mb-6 leading-tight",
							children: [
								copy("heroTitle"),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "pages/AICompanion.tsx:42:13:e21827f15370e633925b77112b07e3f1f9d18006e44765bff5a7da9d5543e5cc:1",
									className: "text-coral",
									children: copy("heroHighlight")
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/AICompanion.tsx:44:11:f2fbb2bb60a73bceccd8160f7a61755492d97746e66daf2288ed241ae5bf9fe1:1",
							className: "text-base sm:text-lg md:text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-6 sm:mb-8",
							children: copy("heroSubtitle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/AICompanion.tsx:47:11:2ce4fecc3dd57832294316d6bd8d60b769fbefecdcbe395357e9ab88bfc3bfba:1",
							className: "flex flex-col sm:flex-row gap-3 justify-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "coral",
								size: "lg",
								onClick: openAi,
								children: copy("tryNow")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "lg",
								onClick: () => navigate("/how-it-works"),
								children: t("common.learnMore")
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"data-inspector-source": "pages/AICompanion.tsx:59:7:b2929ebfe1cd3b4afbd3a3656385a35c705ac555f74d2d1f464e6a7b892620dd:1",
				className: "max-w-5xl mx-auto px-4 py-12 sm:py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						"data-inspector-source": "pages/AICompanion.tsx:60:9:d029bd3d3da834dd2b8737ebef36806a7ae35b974f412309c3f4f995c9e429c2:1",
						className: "text-2xl md:text-3xl font-bold text-foreground text-center mb-4",
						children: copy("whyDifferentTitle")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/AICompanion.tsx:63:9:bfb1d632df9229777b1e83fd4d3e9a0d97b34304b8e49c6a01886c91b392b0be:1",
						className: "text-muted-foreground text-center max-w-2xl mx-auto mb-12",
						children: copy("whyDifferentSubtitle")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "pages/AICompanion.tsx:67:9:dc26f5611503a835e0356f3e14f203a6c70689508703926b9675c923817d9bf2:1",
						className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6",
						children: [
							{
								icon: WandSparkles,
								titleKey: "feature1Title",
								descKey: "feature1Desc"
							},
							{
								icon: Shield,
								titleKey: "feature2Title",
								descKey: "feature2Desc"
							},
							{
								icon: Lock,
								titleKey: "feature3Title",
								descKey: "feature3Desc"
							},
							{
								icon: Heart,
								titleKey: "feature4Title",
								descKey: "feature4Desc"
							},
							{
								icon: MessageCircle,
								titleKey: "feature5Title",
								descKey: "feature5Desc"
							},
							{
								icon: TriangleAlert,
								titleKey: "feature6Title",
								descKey: "feature6Desc"
							},
							{
								icon: Eye,
								titleKey: "feature7Title",
								descKey: "feature7Desc"
							}
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "card-elevated border-transparent",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/AICompanion.tsx:79:17:6d19010cb056783a14df337b239e78a1c186b77c8c84011f3d6bca1d3fc3b59e:1",
										className: "w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-6 w-6" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										"data-inspector-source": "pages/AICompanion.tsx:82:17:e0803a17d111ddf071ac9407b6cce0167fe790d9d76679c5d86a88cf1fa06ecc:1",
										className: "font-semibold text-foreground mb-2",
										children: copy(item.titleKey)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/AICompanion.tsx:83:17:afa062ab11baf212b34c2f751df8e3065add6b42e872a7c9d82fd305d188bcb9:1",
										className: "text-sm text-muted-foreground",
										children: copy(item.descKey)
									})
								]
							})
						}, item.titleKey))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				"data-inspector-source": "pages/AICompanion.tsx:91:7:12e0eb015211fbd8fc8482a0f902484b169596dc528678f1a7e2b45795047668:1",
				className: "bg-accent/30 py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/AICompanion.tsx:92:9:50950bd773af2bed4b285d12a843145cec975b9379c4ed9e2e9549246cdece88:1",
					className: "max-w-5xl mx-auto px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							"data-inspector-source": "pages/AICompanion.tsx:93:11:e6dee8b2c3bdad247b433c8197fd48de3da02b46efb53700f5982cf7facf08d7:1",
							className: "text-2xl md:text-3xl font-bold text-foreground text-center mb-4",
							children: copy("capabilitiesTitle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/AICompanion.tsx:96:11:da7d56dbe2b12c1d02621090750cccab6d52d5257f68acd258680647965d8e4c:1",
							className: "text-muted-foreground text-center max-w-2xl mx-auto mb-12",
							children: copy("capabilitiesSubtitle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "pages/AICompanion.tsx:99:11:e112852278d410230db45e472ef1e2311a584bf263900bb5150010f1948b029a:1",
							className: "grid md:grid-cols-2 lg:grid-cols-3 gap-4",
							children: Array.from({ length: 10 }, (_, i) => i + 1).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "card-elevated border-transparent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										"data-inspector-source": "pages/AICompanion.tsx:103:19:b875d3f98596121b5bc4e5528b50186a7bcbc63bd0c795f866c7ec166e6d11f1:1",
										className: "font-semibold text-foreground mb-2 text-base",
										children: copy(`cap${n}Title`)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/AICompanion.tsx:106:19:6af869160fbc786d49289574077663beab29a15564698bd0cfbff252a7f3f987:1",
										className: "text-sm text-muted-foreground leading-relaxed",
										children: copy(`cap${n}Desc`)
									})]
								})
							}, n))
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				"data-inspector-source": "pages/AICompanion.tsx:117:7:3ea2682eb9023ea76b72497ab0e756f2b1068e182c5a0e97fd19e1cb4fbb3e87:1",
				className: "bg-muted/50 py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/AICompanion.tsx:118:9:50950bd773af2bed4b285d12a843145cec975b9379c4ed9e2e9549246cdece88:1",
					className: "max-w-5xl mx-auto px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							"data-inspector-source": "pages/AICompanion.tsx:119:11:e6dee8b2c3bdad247b433c8197fd48de3da02b46efb53700f5982cf7facf08d7:1",
							className: "text-2xl md:text-3xl font-bold text-foreground text-center mb-4",
							children: copy("safetyTitle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/AICompanion.tsx:122:11:da7d56dbe2b12c1d02621090750cccab6d52d5257f68acd258680647965d8e4c:1",
							className: "text-muted-foreground text-center max-w-2xl mx-auto mb-12",
							children: copy("safetySubtitle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "pages/AICompanion.tsx:126:11:30aa456711af88e1097d7a132ddb83ba4733ce94d7ecdc6914cc8b51bc9f6825:1",
							className: "grid md:grid-cols-2 gap-6 max-w-4xl mx-auto",
							children: [
								"safetyGuard1",
								"safetyGuard2",
								"safetyGuard3",
								"safetyGuard4",
								"safetyGuard5",
								"safetyGuard6",
								"safetyGuard7",
								"safetyGuard8",
								"safetyGuard9",
								"safetyGuard10"
							].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/AICompanion.tsx:132:15:7682a8e25894fe964e809bf072fdd0a42a2c3e15c39b1dbbf4dffdff1b8e2c37:1",
								className: "flex items-start gap-3 p-4 bg-card rounded-xl border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-5 w-5 text-primary shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "pages/AICompanion.tsx:134:17:dd54a40d1aeb42166f7f4583ae5f6d2baee2e59eaa96add3899b46590109532d:1",
									className: "text-sm text-foreground",
									children: copy(key)
								})]
							}, key))
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"data-inspector-source": "pages/AICompanion.tsx:142:7:0cb34c234d0644dfbaa1d2c0df545355e9a2bcd62a1448c624d1c817a4001516:1",
				className: "max-w-5xl mx-auto px-4 py-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-source": "pages/AICompanion.tsx:143:9:a3aef429cfcb7bb67148b867c92a7b49d1da8fe219adec6c2bbef065aced2ed5:1",
					className: "text-2xl md:text-3xl font-bold text-foreground text-center mb-12",
					children: copy("comparisonTitle")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/AICompanion.tsx:146:9:ce485c3b4eb8f6edf969d5d7491d8f28c60fd4d283fbf911e90f70b214e58a67:1",
					className: "grid md:grid-cols-2 gap-8 max-w-4xl mx-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-destructive/30 bg-destructive/5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								"data-inspector-source": "pages/AICompanion.tsx:150:15:5c62d25a1e374b7fce3e2b958754f935df007b73e7ade8ebf9e4bd3d21367164:1",
								className: "font-bold text-destructive mb-4",
								children: copy("otherAITitle")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								"data-inspector-source": "pages/AICompanion.tsx:151:15:af78228bc2530a3064e163cb4c2189fb87b7fd77a8d0e457c734e67d16c8c85a:1",
								className: "space-y-3",
								children: [
									"otherAI1",
									"otherAI2",
									"otherAI3",
									"otherAI4",
									"otherAI5",
									"otherAI6",
									"otherAI7"
								].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									"data-inspector-source": "pages/AICompanion.tsx:153:19:0aa6a46b7883d4bd036210d9b00c497395fcc784455afaf20e498e5db8541abb:1",
									className: "flex items-start gap-2 text-sm text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "pages/AICompanion.tsx:154:21:1bd6613c5fc5b1ddc51467b55ec489c19c00706462ea75e045705efdcb31ce3a:1",
										className: "text-destructive shrink-0",
										children: "✗"
									}), copy(key)]
								}, key))
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-primary/30 bg-primary/5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								"data-inspector-source": "pages/AICompanion.tsx:164:15:ec01969a958ba7072de0bca1073c6d3ce4adca7a946da7ef366343f2a03d05d8:1",
								className: "font-bold text-primary mb-4",
								children: copy("ourAITitle")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								"data-inspector-source": "pages/AICompanion.tsx:165:15:af78228bc2530a3064e163cb4c2189fb87b7fd77a8d0e457c734e67d16c8c85a:1",
								className: "space-y-3",
								children: [
									"ourAI1",
									"ourAI2",
									"ourAI3",
									"ourAI4",
									"ourAI5",
									"ourAI6",
									"ourAI7"
								].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									"data-inspector-source": "pages/AICompanion.tsx:167:19:df276d4f8fa7de89cbcea8ea191cc5ba3fbe497dd3662b28fd87c96f71842034:1",
									className: "flex items-start gap-2 text-sm text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "pages/AICompanion.tsx:168:21:70cef14c765b6bb3c3f2d6655d2a14d025131c7c483cd01f048f31a143d52693:1",
										className: "text-primary shrink-0",
										children: "✓"
									}), copy(key)]
								}, key))
							})]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				"data-inspector-source": "pages/AICompanion.tsx:179:7:a5a5486eb569eff269feea416e191d9e833f02c5aa08aa50ed41f7788fdf946a:1",
				className: "hero-gradient py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/AICompanion.tsx:180:9:9019cf9d2e998e61c4ddf426596bb66f37cb3b5374bb64bc5f73eaacbbdc30bb:1",
					className: "max-w-4xl mx-auto px-4 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							"data-inspector-source": "pages/AICompanion.tsx:181:11:3568c07f7c85ebe67875b3ae3ec176a88dbe9c8f5cdc8596ab08b259ba2b2bee:1",
							className: "text-2xl md:text-3xl font-bold text-primary-foreground mb-4",
							children: copy("ctaTitle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/AICompanion.tsx:184:11:3857ea6d64a83d0c4ddccee2c882ed4dd91d24765beb95c27e7ac3da8ed6c75d:1",
							className: "text-primary-foreground/80 mb-8 max-w-xl mx-auto",
							children: copy("ctaSubtitle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "coral",
							size: "lg",
							onClick: openAi,
							children: [
								copy("tryNow"),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4" })
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				"data-inspector-source": "pages/AICompanion.tsx:194:7:b393691e15015e9d8dc3aa850ce329bb5f5ad44167a52774d56ad68c7e375a9a:1",
				className: "max-w-4xl mx-auto px-4 py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "pages/AICompanion.tsx:195:9:9f3161f7926990ede95e9a0e9ccad542d3a542904d7c49a86c826eb1ac86fd56:1",
					className: "bg-muted/50 rounded-xl p-6 border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/AICompanion.tsx:196:11:bc4884f8b93656f40d8b363111a4b5f86dce419c432ad0c3945b511007b8a418:1",
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 text-muted-foreground shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/AICompanion.tsx:198:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								"data-inspector-source": "pages/AICompanion.tsx:199:15:35f3bc8587d2bae177d4f949fd11777b7368f04a9bc5db214d1b29b9d43f7731:1",
								className: "font-semibold text-foreground mb-2",
								children: copy("disclaimerTitle")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/AICompanion.tsx:200:15:b817edae258f77b4c58b8270398b71d833a8f20a732b1aa6a63266434449bed7:1",
								className: "text-sm text-muted-foreground leading-relaxed",
								children: copy("disclaimerText")
							})]
						})]
					})
				})
			})
		]
	});
};
//#endregion
export { AICompanion as t };
