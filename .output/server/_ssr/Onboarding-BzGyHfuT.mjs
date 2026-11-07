import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Input } from "./input-JWLlmFeK.mjs";
import { j as Sparkles, jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { c as fetchMyCommunityName, n as completeOnboarding, r as currentAppId, s as fetchMyAppUserName } from "./app-profile-DeZHIfiB.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1, o as useSearchParams } from "./router-compat-CRbRSfhz.mjs";
import { t as safeNextPath } from "./return-path-B1QN16Ol.mjs";
import { t as BrandMark } from "./BrandMark-D6cHrAws.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Onboarding-BzGyHfuT.js
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
		className: "max-w-md mx-auto px-4 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-id": "pages/Onboarding/Onboarding/div/0",
			"data-inspector-source": "pages/Onboarding.tsx:106:7:0ef86b4b15e29950bf7f1fc901d6db2a7783ea2793b573b612eee8a08b96f753:1",
			className: "text-center mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
					"data-inspector-id": "pages/Onboarding/Onboarding/BrandMark/0",
					"data-inspector-source": "pages/Onboarding.tsx:108:11:93573cec2ac891a92170e566bfa0fbc8ff8748df8d4f78a70d24dc0a5ce83322:1",
					size: 48,
					showWordmark: true
				})
			}), site.tagline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-id": "pages/Onboarding/Onboarding/p/0",
				"data-inspector-source": "pages/Onboarding.tsx:111:11:4452a90f6119881e34f8e926563371b8da284e63a6077f5ba972e69ee52eccc1:1",
				className: "text-sm text-muted-foreground mt-1",
				children: site.tagline
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "border-transparent card-elevated",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-5 space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						"data-inspector-id": "pages/Onboarding/Onboarding/h2/0",
						"data-inspector-source": "pages/Onboarding.tsx:118:13:3fe390e4e030f72fd5851bdc143b96c03f770ce79fd4c7a0ce4186ba63ad54ec:1",
						className: "text-lg font-semibold",
						children: t("onboarding.welcome", { defaultValue: "Welcome" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/Onboarding/Onboarding/p/1",
						"data-inspector-source": "pages/Onboarding.tsx:121:13:ba89a11c79123dd6250f377b22ef343c6c29cdcd67f39fe777ef49e6af10deae:1",
						className: "text-sm text-muted-foreground mt-1",
						children: intro
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							"data-inspector-id": "pages/Onboarding/Onboarding/Label/0",
							"data-inspector-source": "pages/Onboarding.tsx:125:13:8a4094bde9413c6b18e6cd3857bc9780781037daf0845a35494b072af3f0cdc0:1",
							htmlFor: "ob-name",
							children: t("onboarding.nameLabel", { defaultValue: "Your name here" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"data-inspector-id": "pages/Onboarding/Onboarding/Input/1c1965be1469",
							"data-inspector-source": "pages/Onboarding.tsx:128:13:f8dc2d8b298e828184f92f8f9e5eae0e54d3df44a3c49a90dfb735edcc2d1bc1:1",
							id: "ob-name",
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: t("onboarding.namePlaceholder", { defaultValue: "How your family sees you" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								"data-inspector-id": "pages/Onboarding/Onboarding/Label/1",
								"data-inspector-source": "pages/Onboarding.tsx:137:13:f53f282b21da63759579878b2dc92e944b5e78416cb1ed60615ea16c2fb0ca9c:1",
								htmlFor: "ob-community",
								children: t("onboarding.communityLabel", { defaultValue: "Your name on the forum" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"data-inspector-id": "pages/Onboarding/Onboarding/Input/8d88a3612925",
								"data-inspector-source": "pages/Onboarding.tsx:140:13:f8dc2d8b298e828184f92f8f9e5eae0e54d3df44a3c49a90dfb735edcc2d1bc1:1",
								id: "ob-community",
								value: communityName,
								onChange: (e) => setCommunityName(e.target.value),
								placeholder: t("onboarding.communityPlaceholder", { defaultValue: "Shown on posts and replies" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Onboarding/Onboarding/p/2",
								"data-inspector-source": "pages/Onboarding.tsx:146:13:7092a605bb0ee468f54cfd5cd2af559f4d0717ca74addc443319cf46d0cfdc7a:1",
								className: "text-xs text-muted-foreground",
								children: t("onboarding.communityHelp", { defaultValue: "This forum name is only used here, so you can pick a different one in each app." })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-muted/50 p-3 flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/Onboarding/Onboarding/p/3",
							"data-inspector-source": "pages/Onboarding.tsx:155:13:7092a605bb0ee468f54cfd5cd2af559f4d0717ca74addc443319cf46d0cfdc7a:1",
							className: "text-xs text-muted-foreground",
							children: t("onboarding.creditsHint", { defaultValue: "You get 10 free AI credits to try the assistant." })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/Onboarding/Onboarding/Button/42af43e3616e",
							"data-inspector-source": "pages/Onboarding.tsx:163:13:c6b2cda94b398829a8c11067411764a52ec0c374380e4b1ded6ee38dfaf8b6c7:1",
							variant: "coral",
							onClick: () => finish("done"),
							disabled: saving !== null,
							children: [saving === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null, t("onboarding.continue", { defaultValue: "Save and continue" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/Onboarding/Onboarding/Button/42af43e3616e",
							"data-inspector-source": "pages/Onboarding.tsx:167:13:579be1677c87885bfa78020d020b1bce8c1d23c059da125caf0382ddf9b7c64a:1",
							variant: "ghost",
							onClick: () => finish("skip"),
							disabled: saving !== null,
							children: [saving === "skip" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null, t("onboarding.skip", { defaultValue: "Skip for now" })]
						})]
					})
				]
			})
		})]
	});
}
//#endregion
export { Onboarding as t };
