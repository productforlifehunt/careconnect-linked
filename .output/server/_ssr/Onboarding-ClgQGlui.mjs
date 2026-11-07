import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Input } from "./input-4rcasKp7.mjs";
import { j as Sparkles, jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { c as fetchMyCommunityName, n as completeOnboarding, r as currentAppId, s as fetchMyAppUserName } from "./app-profile-DeZHIfiB.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1, o as useSearchParams } from "./router-compat-DbWBz8c6.mjs";
import { t as safeNextPath } from "./return-path-B1QN16Ol.mjs";
import { t as BrandMark } from "./BrandMark-Czr1po2V.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Onboarding-ClgQGlui.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* One short welcome screen per sub-app. Same file, same shell, brand wording
* comes from the active site config — no separate onboarding app per brand.
*
* It writes only to this app's own CCT 151 row (a55 name, a56 forum name,
* a70 finished/skipped) and triggers the 10 welcome AI credits on paid apps,
* on both "Continue" and "Skip".
*/
function Onboarding() {
	const { t } = useTranslation();
	const site = useSite();
	const navigate = useNavigate$1();
	const { user } = useAuth();
	const { toast } = useToast();
	const qc = useQueryClient();
	const app = currentAppId();
	const isSafety = app === "notchsafety";
	const [searchParams] = useSearchParams();
	const home = safeNextPath(searchParams.get("next")) || (isSafety ? "/map" : "/dashboard");
	const [name, setName] = (0, import_react.useState)("");
	const [communityName, setCommunityName] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			const [existingName, existingCommunity] = await Promise.all([fetchMyAppUserName().catch(() => ""), fetchMyCommunityName().catch(() => "")]);
			if (cancelled) return;
			setName(existingName || user?.full_name || "");
			setCommunityName(existingCommunity || "");
		})();
		return () => {
			cancelled = true;
		};
	}, [user]);
	const finish = async (mode) => {
		setSaving(mode);
		try {
			if (await completeOnboarding(mode === "done" ? {
				name,
				communityName
			} : {}) > 0) toast({
				title: t("settings.creditsGrantedTitle", { defaultValue: "10 AI credits added" }),
				description: t("settings.creditsGrantedBody", { defaultValue: "You have 10 AI credits to try the assistant in this app." })
			});
			await qc.invalidateQueries({ queryKey: ["appOnboarding"] });
			navigate(home, { replace: true });
		} catch (err) {
			toast({
				title: t("onboarding.saveFailed", { defaultValue: "Could not save" }),
				description: err?.message,
				variant: "destructive"
			});
		} finally {
			setSaving(null);
		}
	};
	const intro = isSafety ? t("onboarding.introSafety", { defaultValue: "See where your family is, get told when they arrive home, and call for help fast." }) : app === "carecnc" ? t("onboarding.introCare", { defaultValue: "Find caregivers you can trust and keep everyone caring for your loved one on the same page." }) : t("onboarding.introChallenged", { defaultValue: "Learn about dementia care, keep daily routines in one place, and share the care with your family." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/Onboarding/Onboarding/div/0",
		"data-inspector-source": "pages/Onboarding.tsx:105:5:af2be5ed70837789e6715dd02245314c09af8911223364ba6cb2d05bae4f49ba:1",
		className: "max-w-md mx-auto px-4 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-id": "pages/Onboarding/Onboarding/div/a14a8eff0d56/0",
			"data-inspector-source": "pages/Onboarding.tsx:106:7:0ef86b4b15e29950bf7f1fc901d6db2a7783ea2793b573b612eee8a08b96f753:1",
			className: "text-center mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				"data-inspector-id": "pages/Onboarding/Onboarding/h1/0",
				"data-inspector-source": "pages/Onboarding.tsx:107:9:6a8b22bce15806717b8f74fc589d9fb6a87dd69f772decabf00a30241c9168b5:1",
				className: "flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
					"data-inspector-id": "pages/Onboarding/Onboarding/BrandMark/0",
					"data-inspector-source": "pages/Onboarding.tsx:108:11:93573cec2ac891a92170e566bfa0fbc8ff8748df8d4f78a70d24dc0a5ce83322:1",
					size: 48,
					showWordmark: true
				})
			}), site.tagline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-id": "pages/Onboarding/Onboarding/p/92e832ccf91b/0",
				"data-inspector-source": "pages/Onboarding.tsx:111:11:4452a90f6119881e34f8e926563371b8da284e63a6077f5ba972e69ee52eccc1:1",
				className: "text-sm text-muted-foreground mt-1",
				children: site.tagline
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			"data-inspector-id": "pages/Onboarding/Onboarding/Card/0",
			"data-inspector-source": "pages/Onboarding.tsx:115:7:039d2db110948c41f5fd5821238fa2f58d5407416b66a6391c6ce2fec801415b:1",
			className: "border-transparent card-elevated",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				"data-inspector-id": "pages/Onboarding/Onboarding/CardContent/0",
				"data-inspector-source": "pages/Onboarding.tsx:116:9:d32a506576682b69038c20c6fdcf17681c3d187e26e52679433b15fb9eb52b84:1",
				className: "p-5 space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Onboarding/Onboarding/div/1",
						"data-inspector-source": "pages/Onboarding.tsx:117:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							"data-inspector-id": "pages/Onboarding/Onboarding/h2/c79871f9d7ef/0",
							"data-inspector-source": "pages/Onboarding.tsx:118:13:3fe390e4e030f72fd5851bdc143b96c03f770ce79fd4c7a0ce4186ba63ad54ec:1",
							className: "text-lg font-semibold",
							children: t("onboarding.welcome", { defaultValue: "Welcome" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/Onboarding/Onboarding/p/c432b372e0e3/0",
							"data-inspector-source": "pages/Onboarding.tsx:121:13:ba89a11c79123dd6250f377b22ef343c6c29cdcd67f39fe777ef49e6af10deae:1",
							className: "text-sm text-muted-foreground mt-1",
							children: intro
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Onboarding/Onboarding/div/2",
						"data-inspector-source": "pages/Onboarding.tsx:124:11:94490c180d4f0469c17deda0b1a4d7cc86527230dc532ba16ef5120fe55a0723:1",
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							"data-inspector-id": "pages/Onboarding/Onboarding/Label/c79871f9d7ef/0",
							"data-inspector-source": "pages/Onboarding.tsx:125:13:8a4094bde9413c6b18e6cd3857bc9780781037daf0845a35494b072af3f0cdc0:1",
							htmlFor: "ob-name",
							children: t("onboarding.nameLabel", { defaultValue: "Your name here" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"data-inspector-id": "pages/Onboarding/Onboarding/Input/28c9dbcd11b2/0",
							"data-inspector-source": "pages/Onboarding.tsx:128:13:f8dc2d8b298e828184f92f8f9e5eae0e54d3df44a3c49a90dfb735edcc2d1bc1:1",
							id: "ob-name",
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: t("onboarding.namePlaceholder", { defaultValue: "How your family sees you" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Onboarding/Onboarding/div/3",
						"data-inspector-source": "pages/Onboarding.tsx:136:11:94490c180d4f0469c17deda0b1a4d7cc86527230dc532ba16ef5120fe55a0723:1",
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								"data-inspector-id": "pages/Onboarding/Onboarding/Label/c79871f9d7ef/1",
								"data-inspector-source": "pages/Onboarding.tsx:137:13:f53f282b21da63759579878b2dc92e944b5e78416cb1ed60615ea16c2fb0ca9c:1",
								htmlFor: "ob-community",
								children: t("onboarding.communityLabel", { defaultValue: "Your name on the forum" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"data-inspector-id": "pages/Onboarding/Onboarding/Input/95ea3a2e8bc5/0",
								"data-inspector-source": "pages/Onboarding.tsx:140:13:f8dc2d8b298e828184f92f8f9e5eae0e54d3df44a3c49a90dfb735edcc2d1bc1:1",
								id: "ob-community",
								value: communityName,
								onChange: (e) => setCommunityName(e.target.value),
								placeholder: t("onboarding.communityPlaceholder", { defaultValue: "Shown on posts and replies" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Onboarding/Onboarding/p/c79871f9d7ef/0",
								"data-inspector-source": "pages/Onboarding.tsx:146:13:7092a605bb0ee468f54cfd5cd2af559f4d0717ca74addc443319cf46d0cfdc7a:1",
								className: "text-xs text-muted-foreground",
								children: t("onboarding.communityHelp", { defaultValue: "This forum name is only used here, so you can pick a different one in each app." })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Onboarding/Onboarding/div/4",
						"data-inspector-source": "pages/Onboarding.tsx:153:11:1bb25b85e4391fb6b72186421d5e49e562dbfda4fab79e57a0b9eff416e35dc9:1",
						className: "rounded-lg bg-muted/50 p-3 flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
							"data-inspector-id": "pages/Onboarding/Onboarding/Sparkles/0",
							"data-inspector-source": "pages/Onboarding.tsx:154:13:01ad81457bf3f2de0a287b9308269e10baf6c4c9b181e926bc635e5f2ae7d435:1",
							className: "h-4 w-4 text-primary mt-0.5 shrink-0"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/Onboarding/Onboarding/p/c79871f9d7ef/1",
							"data-inspector-source": "pages/Onboarding.tsx:155:13:7092a605bb0ee468f54cfd5cd2af559f4d0717ca74addc443319cf46d0cfdc7a:1",
							className: "text-xs text-muted-foreground",
							children: t("onboarding.creditsHint", { defaultValue: "You get 10 free AI credits to try the assistant." })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Onboarding/Onboarding/div/5",
						"data-inspector-source": "pages/Onboarding.tsx:162:11:1100e2b87606e9482e306838846ee26b38dc85c33e4ca4e7113d70b1e12fb2ec:1",
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/Onboarding/Onboarding/Button/3661443c4cde/0",
							"data-inspector-source": "pages/Onboarding.tsx:163:13:c6b2cda94b398829a8c11067411764a52ec0c374380e4b1ded6ee38dfaf8b6c7:1",
							variant: "coral",
							onClick: () => finish("done"),
							disabled: saving !== null,
							children: [saving === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								"data-inspector-id": "pages/Onboarding/Onboarding/Loader2/0",
								"data-inspector-source": "pages/Onboarding.tsx:164:36:6f00ffaf4bae404e58ee503580f4986137ca833614432fa0c4f41f0f2fb443f5:1",
								className: "h-4 w-4 animate-spin mr-2"
							}) : null, t("onboarding.continue", { defaultValue: "Save and continue" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/Onboarding/Onboarding/Button/3661443c4cde/1",
							"data-inspector-source": "pages/Onboarding.tsx:167:13:579be1677c87885bfa78020d020b1bce8c1d23c059da125caf0382ddf9b7c64a:1",
							variant: "ghost",
							onClick: () => finish("skip"),
							disabled: saving !== null,
							children: [saving === "skip" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								"data-inspector-id": "pages/Onboarding/Onboarding/Loader2/1",
								"data-inspector-source": "pages/Onboarding.tsx:168:36:633a5398814ca83bd5ac37dc4f46fff60350421ede4bd93a836a18ca5c4d8d78:1",
								className: "h-4 w-4 animate-spin mr-2"
							}) : null, t("onboarding.skip", { defaultValue: "Skip for now" })]
						})]
					})
				]
			})
		})]
	});
}
//#endregion
export { Onboarding as t };
