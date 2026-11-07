import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-4rcasKp7.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { Dn as CircleCheckBig, L as Shield, Xn as ArrowRight, Yt as Heart, Zn as ArrowLeft, dn as DollarSign } from "../_libs/lucide-react.mjs";
import { t as Checkbox } from "./checkbox-LEE7aLq-.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { Hn as useSubmitProviderApplication } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1 } from "./router-compat-DbWBz8c6.mjs";
import { t as Progress } from "./progress-DfJ-TYmP.mjs";
import { t as SiteFeature } from "./SiteFeature-DJLQlP_2.mjs";
import { t as useServiceTypes } from "./use-service-types-BfA6EtiC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/become-caregiver-CzdAZOjA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BecomeCaregiver() {
	const { t, i18n } = useTranslation();
	const isZhLang = i18n.language?.startsWith("zh");
	const navigate = useNavigate$1();
	const { toast } = useToast();
	const { isAuthenticated } = useAuth();
	const site = useSite();
	const submitApplication = useSubmitProviderApplication();
	const { serviceTypes, isLoading: serviceTypesLoading } = useServiceTypes();
	const [step, setStep] = (0, import_react.useState)(1);
	const totalSteps = 4;
	const [phone, setPhone] = (0, import_react.useState)("");
	const [city, setCity] = (0, import_react.useState)("");
	const [bio, setBio] = (0, import_react.useState)("");
	const [selectedServiceSlugs, setSelectedServiceSlugs] = (0, import_react.useState)([]);
	const [hourlyRate, setHourlyRate] = (0, import_react.useState)("");
	const [agreeBackground, setAgreeBackground] = (0, import_react.useState)(false);
	const [agreeTerms, setAgreeTerms] = (0, import_react.useState)(false);
	const [hasInsurance, setHasInsurance] = (0, import_react.useState)(false);
	const toggleItem = (list, item, setter) => {
		setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
	};
	const progress = step / totalSteps * 100;
	const handleSubmit = async () => {
		if (!isAuthenticated) {
			toast({
				title: t("becomeCaregiver.pleaseSignInFirst"),
				variant: "destructive"
			});
			navigate("/auth");
			return;
		}
		try {
			await submitApplication.mutateAsync({
				bio,
				service_type_slugs: selectedServiceSlugs,
				care_provider_starts_hourly_rate: parseFloat(hourlyRate) || 0,
				phone,
				location: city
			});
			toast({
				title: t("becomeCaregiver.applicationSubmitted"),
				description: t("becomeCaregiver.applicationSubmittedDesc")
			});
			navigate("/dashboard");
		} catch (err) {
			toast({
				title: t("becomeCaregiver.submissionFailed"),
				description: err.message,
				variant: "destructive"
			});
		}
	};
	const canProceed = () => {
		if (step === 1) return phone && city;
		if (step === 2) return selectedServiceSlugs.length > 0;
		if (step === 3) return hourlyRate;
		if (step === 4) return agreeBackground && agreeTerms;
		return false;
	};
	const siteKey = site.id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/d2c9a3c422fd/0",
		"data-inspector-source": "pages/BecomeCaregiver.tsx:75:5:a94814f3e746ec667e491a012f69cb31193a04017cf585046e4de899f7630094:1",
		className: "max-w-2xl mx-auto px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Button/eaf7d4484afd/0",
				"data-inspector-source": "pages/BecomeCaregiver.tsx:76:7:8ce5828938aea85a4c310c28130e77bf94787be833473c1cee31b21e3e5197b8:1",
				variant: "ghost",
				size: "sm",
				className: "mb-4 gap-1.5 -ml-2",
				onClick: () => step > 1 ? setStep(step - 1) : navigate(-1),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/ArrowLeft/0",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:77:9:df38ce97b246e9a657fda9953756da5077a4b0af944e6cc7ccdd06d7b14db38b:1",
						className: "h-4 w-4"
					}),
					" ",
					step > 1 ? t("becomeCaregiver.previousStep") : t("common.back")
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/0",
				"data-inspector-source": "pages/BecomeCaregiver.tsx:80:7:0ef86b4b15e29950bf7f1fc901d6db2a7783ea2793b573b612eee8a08b96f753:1",
				className: "text-center mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/1",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:81:9:c261c9381993c249236f996d28a4198ca5ed38accd28c4089b36bc06dd8f9029:1",
						className: "mx-auto w-12 h-12 rounded-2xl hero-gradient flex items-center justify-center mb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
							"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Heart/0",
							"data-inspector-source": "pages/BecomeCaregiver.tsx:81:108:c261c9381993c249236f996d28a4198ca5ed38accd28c4089b36bc06dd8f9029:1",
							className: "h-6 w-6 text-primary-foreground"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/h1/d5d3744f238a/0",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:82:9:0a9243871b7de4b3a20de00a202a24a89c82f897b23ca33c82cc38935b202a00:1",
						className: "text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground",
						children: t(`site.${siteKey}.becomeTitle`)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/p/d5d3744f238a/0",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:83:9:26cd64faba591a92da435b8a62ef3f29e45d6929022d21567d5e07588f665d74:1",
						className: "text-sm text-muted-foreground mt-1.5",
						children: t(`site.${siteKey}.becomeSubtitle`)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/2",
				"data-inspector-source": "pages/BecomeCaregiver.tsx:86:7:5fa24b723f14586da4a1f03eb2f5531a079cfa7db498999dc74d37edecea78e1:1",
				className: "mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/3",
					"data-inspector-source": "pages/BecomeCaregiver.tsx:87:9:4995bce675b7b5b4bd550f5607d8ef121da56fd22499d8129bafd1e82886a23e:1",
					className: "flex justify-between text-sm text-muted-foreground mb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/span/f96a2d44d556/0",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:88:11:b154cdc19bfb02fbb38b9202c4d25c01af5a56b8791c803148be355dcf81aad9:1",
						children: t("becomeCaregiver.stepOf", {
							current: step,
							total: totalSteps
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/span/17847479a06f/0",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:89:11:352352e81e7cff5e54919d89e7b9a8f4a017c4ec409ca11626fe3efdd41771e3:1",
						children: t("becomeCaregiver.percentComplete", { percent: Math.round(progress) })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Progress/b5f90a96e680/0",
					"data-inspector-source": "pages/BecomeCaregiver.tsx:91:9:4b14ff55a543408b12ef6ccf946d1e1b050eb9be046da4552a46babb5339b60b:1",
					value: progress,
					className: "h-2"
				})]
			}),
			step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Card/0",
				"data-inspector-source": "pages/BecomeCaregiver.tsx:95:9:9df5ed3d9553ae45a773e3ae764b4589d00585c17b92b1196958a4188342c189:1",
				className: "border-transparent card-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardHeader/0",
					"data-inspector-source": "pages/BecomeCaregiver.tsx:96:11:761b5d14c22ba35168c0724f9e5adc413fd3ad1ba044d218ef9b990b52e5ae75:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardTitle/e3b98a4da31a/0",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:96:23:761b5d14c22ba35168c0724f9e5adc413fd3ad1ba044d218ef9b990b52e5ae75:1",
						children: t("becomeCaregiver.personalInfo")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardDescription/e3b98a4da31a/0",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:96:81:761b5d14c22ba35168c0724f9e5adc413fd3ad1ba044d218ef9b990b52e5ae75:1",
						children: t("becomeCaregiver.tellAboutYourself")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardContent/0",
					"data-inspector-source": "pages/BecomeCaregiver.tsx:97:11:f75a139c687e2e8aafc0b1bc48f03518fe7502163110c0bcbe09b46d1d9bf080:1",
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/4",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:98:13:e0601eccf8e611ff307e9568f6175a6b694c1a37569604cadd29a780f7ebf228:1",
						className: "grid sm:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/5",
							"data-inspector-source": "pages/BecomeCaregiver.tsx:99:15:9c566b16382960fc69a17546b2ec962a581a119df30b26397840261dbab58c52:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Label/e3b98a4da31a/0",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:99:20:9c566b16382960fc69a17546b2ec962a581a119df30b26397840261dbab58c52:1",
								children: [t("common.phone"), " *"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Input/1ebc49a5f50c/0",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:99:56:9c566b16382960fc69a17546b2ec962a581a119df30b26397840261dbab58c52:1",
								value: phone,
								onChange: (e) => setPhone(e.target.value),
								placeholder: "(555) 000-0000"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/6",
							"data-inspector-source": "pages/BecomeCaregiver.tsx:100:15:8d52f9d8149bc493d7df647a1836e335d771ac4528f9ad4d23defd41ddc4cfdd:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Label/e3b98a4da31a/1",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:100:20:8d52f9d8149bc493d7df647a1836e335d771ac4528f9ad4d23defd41ddc4cfdd:1",
								children: [t("becomeCaregiver.cityZip"), " *"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Input/5813b5967095/0",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:100:67:8d52f9d8149bc493d7df647a1836e335d771ac4528f9ad4d23defd41ddc4cfdd:1",
								value: city,
								onChange: (e) => setCity(e.target.value),
								placeholder: t("becomeCaregiver.cityZipPlaceholder", "Brooklyn, NY")
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/7",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:102:13:272d6886cf859a3da4edc67b80d7f8844d4bbde0220e5bf1ee4093077c93ba10:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Label/e3b98a4da31a/2",
							"data-inspector-source": "pages/BecomeCaregiver.tsx:102:18:272d6886cf859a3da4edc67b80d7f8844d4bbde0220e5bf1ee4093077c93ba10:1",
							children: t("becomeCaregiver.aboutYou")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Textarea/9bfb1e3bb893/0",
							"data-inspector-source": "pages/BecomeCaregiver.tsx:102:64:272d6886cf859a3da4edc67b80d7f8844d4bbde0220e5bf1ee4093077c93ba10:1",
							value: bio,
							onChange: (e) => setBio(e.target.value),
							placeholder: t("becomeCaregiver.aboutYouPlaceholder"),
							rows: 4
						})]
					})]
				})]
			}),
			step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Card/1",
				"data-inspector-source": "pages/BecomeCaregiver.tsx:108:9:9df5ed3d9553ae45a773e3ae764b4589d00585c17b92b1196958a4188342c189:1",
				className: "border-transparent card-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardHeader/1",
					"data-inspector-source": "pages/BecomeCaregiver.tsx:109:11:adfd3fa6f4fcf8517cf7a6792a66ec686974940e458541645f617ac59f045b62:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardTitle/e3b98a4da31a/1",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:109:23:adfd3fa6f4fcf8517cf7a6792a66ec686974940e458541645f617ac59f045b62:1",
						children: t("becomeCaregiver.qualifications")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardDescription/e3b98a4da31a/1",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:109:83:adfd3fa6f4fcf8517cf7a6792a66ec686974940e458541645f617ac59f045b62:1",
						children: t("becomeCaregiver.yourSkills")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardContent/1",
					"data-inspector-source": "pages/BecomeCaregiver.tsx:110:11:b8670205a627aeb5a6d66dcb70ea4fbeab6d3f8504bb29520d6933727e5645f1:1",
					className: "space-y-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/d91c7019002e/0",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:111:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Label/9c2307636a2b/0",
							"data-inspector-source": "pages/BecomeCaregiver.tsx:112:15:78f575055c0f5add2504a9acf2ba643e8c4635a8598206ebc4e3730bf1d4aaeb:1",
							className: "mb-3 block",
							children: [
								isZhLang ? "你提供的服务" : "Services you offer",
								" * (",
								t("becomeCaregiver.selectAllApply"),
								")"
							]
						}), serviceTypesLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/7bfe4abaacc3/0",
							"data-inspector-source": "pages/BecomeCaregiver.tsx:114:17:b30ee0521d20a1ef7b13d5d9a7e21b278e6f1eb4214e12e3fda18a8783ebd804:1",
							className: "flex flex-wrap gap-2",
							children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/8",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:116:21:30d211558b3bd6c93bcde95db788418ea40b863bf44b07f0c4846bdd33f16b26:1",
								className: "h-8 w-24 rounded-full bg-muted animate-pulse"
							}, i))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/e8bfc2e7f56b/0",
							"data-inspector-source": "pages/BecomeCaregiver.tsx:120:17:2e576a13e95e41051b85a3ce5b634749323311ba39f40653735647c554613d24:1",
							className: "flex flex-wrap gap-2",
							children: serviceTypes.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Badge/eae62a7f0ed8/0",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:120:80:2e576a13e95e41051b85a3ce5b634749323311ba39f40653735647c554613d24:1",
								variant: selectedServiceSlugs.includes(st.slug) ? "default" : "outline",
								className: "cursor-pointer text-sm py-1.5 px-3",
								onClick: () => toggleItem(selectedServiceSlugs, st.slug, setSelectedServiceSlugs),
								children: st.name
							}, st.slug))
						})]
					})
				})]
			}),
			step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Card/2",
				"data-inspector-source": "pages/BecomeCaregiver.tsx:128:9:9df5ed3d9553ae45a773e3ae764b4589d00585c17b92b1196958a4188342c189:1",
				className: "border-transparent card-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardHeader/2",
					"data-inspector-source": "pages/BecomeCaregiver.tsx:129:11:54dc87e8eaff606cb4944b74179fcde01ee815baa8cec2e573f58485ab5c2dd2:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardTitle/e3b98a4da31a/2",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:129:23:54dc87e8eaff606cb4944b74179fcde01ee815baa8cec2e573f58485ab5c2dd2:1",
						children: t("becomeCaregiver.pricing")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardDescription/e3b98a4da31a/2",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:129:76:54dc87e8eaff606cb4944b74179fcde01ee815baa8cec2e573f58485ab5c2dd2:1",
						children: t("becomeCaregiver.setYourRates")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardContent/2",
					"data-inspector-source": "pages/BecomeCaregiver.tsx:130:11:b8670205a627aeb5a6d66dcb70ea4fbeab6d3f8504bb29520d6933727e5645f1:1",
					className: "space-y-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/9",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:131:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Label/e3b98a4da31a/3",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:132:15:3f4b6661b7d2ed67929f41c192c22c04f80935986d39d126fa3743dee5311cd6:1",
								children: [t("becomeCaregiver.hourlyRateDollar"), " *"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/10",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:133:15:e55dc308f189dac4b5de30dc0d7ed5054f6a38700728d8f7fb35762834f8fa11:1",
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, {
									"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/DollarSign/0",
									"data-inspector-source": "pages/BecomeCaregiver.tsx:133:41:e55dc308f189dac4b5de30dc0d7ed5054f6a38700728d8f7fb35762834f8fa11:1",
									className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Input/bf069164f32f/0",
									"data-inspector-source": "pages/BecomeCaregiver.tsx:133:138:e55dc308f189dac4b5de30dc0d7ed5054f6a38700728d8f7fb35762834f8fa11:1",
									type: "number",
									value: hourlyRate,
									onChange: (e) => setHourlyRate(e.target.value),
									placeholder: "25",
									className: "pl-9",
									min: 10,
									max: 100
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/p/e3b98a4da31a/0",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:134:15:bf0e6d2859b9a37d8184888ca1d2bab6161008b6b7576fb4542b74291f38ac7d:1",
								className: "text-xs text-muted-foreground mt-1",
								children: t("becomeCaregiver.avgRate")
							})
						]
					})
				})]
			}),
			step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Card/3",
				"data-inspector-source": "pages/BecomeCaregiver.tsx:141:9:9df5ed3d9553ae45a773e3ae764b4589d00585c17b92b1196958a4188342c189:1",
				className: "border-transparent card-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardHeader/3",
					"data-inspector-source": "pages/BecomeCaregiver.tsx:142:11:a04bfe924fbbe27cd6eb28e8dc786b99c76e385a931b21862b917f6016f9f833:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardTitle/e3b98a4da31a/3",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:142:23:a04bfe924fbbe27cd6eb28e8dc786b99c76e385a931b21862b917f6016f9f833:1",
						children: t("becomeCaregiver.bgCheckAgreement")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardDescription/e3b98a4da31a/3",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:142:85:a04bfe924fbbe27cd6eb28e8dc786b99c76e385a931b21862b917f6016f9f833:1",
						children: t("becomeCaregiver.finalStep")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CardContent/3",
					"data-inspector-source": "pages/BecomeCaregiver.tsx:143:11:b8670205a627aeb5a6d66dcb70ea4fbeab6d3f8504bb29520d6933727e5645f1:1",
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/11",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:144:13:7a27401a348bb23c3d07741663031e93de39f06e35a021dbdf31fc07e6ca875c:1",
						className: "p-4 rounded-lg bg-accent/50 space-y-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/12",
							"data-inspector-source": "pages/BecomeCaregiver.tsx:145:15:6a6c8d2dbb6077d5afea16295fc5b37e2bedb0226701bb15854a59bf31bef4bf:1",
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Shield/0",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:146:17:21e17272ec1a776ccee1f879e1c449b22513b63c729b0430d4c3e3af9fe14a46:1",
								className: "h-6 w-6 text-primary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/13",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:147:17:f7b8d55d9a678dcd15031da3f6c03381cf74932e47cd59a1b30aba28a3f1dab4:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/h4/e3b98a4da31a/0",
									"data-inspector-source": "pages/BecomeCaregiver.tsx:147:22:f7b8d55d9a678dcd15031da3f6c03381cf74932e47cd59a1b30aba28a3f1dab4:1",
									className: "font-semibold text-foreground",
									children: t("becomeCaregiver.bgCheckRequired")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/p/e3b98a4da31a/1",
									"data-inspector-source": "pages/BecomeCaregiver.tsx:147:111:f7b8d55d9a678dcd15031da3f6c03381cf74932e47cd59a1b30aba28a3f1dab4:1",
									className: "text-sm text-muted-foreground",
									children: t("becomeCaregiver.bgCheckPartner")
								})]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/14",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:150:13:fc217957b0936f971793d9339d74ac109a1acc1aa32b8677ef382a31b9e9270e:1",
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/label/0",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:151:15:c022c796500babdc6d55260c43f81ad38ab17c7aab6a5f80d8b053079f2de369:1",
								className: "flex items-start gap-3 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Checkbox/7a597b50d8c4/0",
									"data-inspector-source": "pages/BecomeCaregiver.tsx:151:72:c022c796500babdc6d55260c43f81ad38ab17c7aab6a5f80d8b053079f2de369:1",
									checked: agreeBackground,
									onCheckedChange: (c) => setAgreeBackground(!!c),
									className: "mt-1"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/span/e3b98a4da31a/0",
									"data-inspector-source": "pages/BecomeCaregiver.tsx:151:176:c022c796500babdc6d55260c43f81ad38ab17c7aab6a5f80d8b053079f2de369:1",
									className: "text-sm text-foreground",
									children: t("becomeCaregiver.consentBgCheck")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/label/1",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:152:15:da2a3885a12c2ab3285b8840f42db69b29480f469ee406daa269669c7cb6a34d:1",
								className: "flex items-start gap-3 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Checkbox/10eb417fd036/0",
									"data-inspector-source": "pages/BecomeCaregiver.tsx:152:72:da2a3885a12c2ab3285b8840f42db69b29480f469ee406daa269669c7cb6a34d:1",
									checked: hasInsurance,
									onCheckedChange: (c) => setHasInsurance(!!c),
									className: "mt-1"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/span/e3b98a4da31a/1",
									"data-inspector-source": "pages/BecomeCaregiver.tsx:152:170:da2a3885a12c2ab3285b8840f42db69b29480f469ee406daa269669c7cb6a34d:1",
									className: "text-sm text-foreground",
									children: t("becomeCaregiver.hasInsurance")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/label/2",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:153:15:c20c837d009542aa489bca5edf8758d85c25667e6da366f58b1df72f6732245f:1",
								className: "flex items-start gap-3 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Checkbox/f5c16a9e7bc3/0",
									"data-inspector-source": "pages/BecomeCaregiver.tsx:153:72:c20c837d009542aa489bca5edf8758d85c25667e6da366f58b1df72f6732245f:1",
									checked: agreeTerms,
									onCheckedChange: (c) => setAgreeTerms(!!c),
									className: "mt-1"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/span/e3b98a4da31a/2",
									"data-inspector-source": "pages/BecomeCaregiver.tsx:153:166:c20c837d009542aa489bca5edf8758d85c25667e6da366f58b1df72f6732245f:1",
									className: "text-sm text-foreground",
									children: t("becomeCaregiver.agreeTerms")
								})]
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/422372adfcd7/0",
				"data-inspector-source": "pages/BecomeCaregiver.tsx:159:7:e25910cd98c1ab0fd62cdd21727225f02ea7e4977203a602d7d261c280988813:1",
				className: "flex justify-between mt-6",
				children: [step > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Button/f2ec89d203c8/0",
					"data-inspector-source": "pages/BecomeCaregiver.tsx:160:22:07924323d700a4c7db3069aebf6bb09ca3136e53c7ed39b5cfa76f7dd8cc2fbc:1",
					variant: "outline",
					onClick: () => setStep(step - 1),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
							"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/ArrowLeft/1",
							"data-inspector-source": "pages/BecomeCaregiver.tsx:160:82:07924323d700a4c7db3069aebf6bb09ca3136e53c7ed39b5cfa76f7dd8cc2fbc:1",
							className: "h-4 w-4 mr-2"
						}),
						" ",
						t("common.back")
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/div/0394b85b1be6/0",
					"data-inspector-source": "pages/BecomeCaregiver.tsx:161:9:2ea131977d74dc064b6eb2b77b1e8ee1bd222c7c4346aee69485528bb0dc7ec9:1",
					className: "ml-auto",
					children: step < totalSteps ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Button/f2ec89d203c8/1",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:163:13:d57440f46506257ef5cd369c691c678c363306bbd0c5c45fcdbdf59d42038454:1",
						variant: "coral",
						onClick: () => setStep(step + 1),
						disabled: !canProceed(),
						children: [
							t("common.continue"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/ArrowRight/0",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:163:119:d57440f46506257ef5cd369c691c678c363306bbd0c5c45fcdbdf59d42038454:1",
								className: "h-4 w-4 ml-2"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/Button/7536c06bcf46/0",
						"data-inspector-source": "pages/BecomeCaregiver.tsx:165:13:8fd7fb10b1070da0c7c078e20c57def93d190f4cb459bbd70576c30e149bd634:1",
						variant: "coral",
						onClick: handleSubmit,
						disabled: !canProceed() || submitApplication.isPending,
						children: [
							submitApplication.isPending ? t("becomeCaregiver.submitting") : t("becomeCaregiver.submitApplication"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, {
								"data-inspector-id": "pages/BecomeCaregiver/BecomeCaregiver/CheckCircle/0",
								"data-inspector-source": "pages/BecomeCaregiver.tsx:166:120:2a828f4e4fcd1107c963309384b53320fe9d138c6b91f47a49c988fc5e996390:1",
								className: "h-4 w-4 ml-2"
							})
						]
					})
				})]
			})
		]
	});
}
function RouteBecomeCaregiverPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		"data-inspector-id": "routes/become-caregiver/RouteBecomeCaregiverPage/SiteFeature/0",
		"data-inspector-source": "routes/become-caregiver.tsx:4:10:7d5b794a4ee82d3aa1327b5dce7f4b84294a03ebe8a6f1f5ab76f83891389646:1",
		name: "paidCaregivers",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BecomeCaregiver, {
			"data-inspector-id": "routes/become-caregiver/RouteBecomeCaregiverPage/BecomeCaregiver/0",
			"data-inspector-source": "routes/become-caregiver.tsx:4:45:7d5b794a4ee82d3aa1327b5dce7f4b84294a03ebe8a6f1f5ab76f83891389646:1"
		})
	});
}
//#endregion
export { RouteBecomeCaregiverPage as component };
