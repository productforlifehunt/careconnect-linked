import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SiteContext-Br0kF93Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var careCNCConfig = {
	id: "carecnc",
	family: "carecnc",
	name: "CareCNC",
	tagline: "Connect. Care. Continue.",
	logoText: "Care",
	logoAccent: "CNC",
	heroTitle: "Find Trusted Care,",
	heroHighlight: "Stay Connected",
	heroSubtitle: "Search caregivers, book appointments, coordinate with your care team, and track care in real-time — all in one place.",
	ctaTitle: "Ready to find the perfect caregiver?",
	ctaSubtitle: "Search caregivers, compare rates, and book in a few steps.",
	ctaButton: "Find Caregivers",
	searchPlaceholder: "What type of care do you need?",
	howItWorksTitle: "How CareCNC Works",
	footerBrand: "CareCNC",
	footerTagline: "Connect. Care. Continue. — Find caregivers and coordinate care.",
	metaTitle: "CareCNC — Connect. Care. Continue.",
	metaDescription: "Search caregivers, book appointments, and coordinate care in one place.",
	cssClass: "site-carecnc",
	contactEmail: "hello@carecnc.com",
	brandSlug: "carecnc",
	caredOneSingular: "Cared One",
	careGroupSingular: "Care Group",
	navLabels: {
		careGroups: "Care Groups",
		findCare: "Find Care",
		caredOnes: "Cared Ones",
		dashboard: "Dashboard",
		gpsTracking: "GPS Tracking"
	},
	howItWorksSteps: [
		{
			step: "1",
			titleKey: "step1Title",
			descKey: "step1Desc"
		},
		{
			step: "2",
			titleKey: "step2Title",
			descKey: "step2Desc"
		},
		{
			step: "3",
			titleKey: "step3Title",
			descKey: "step3Desc"
		}
	],
	trustBadges: [
		"badge1",
		"badge2",
		"badge3"
	]
};
var challengedConfig = {
	id: "challenged",
	family: "challenged",
	name: "ChallengeD",
	tagline: "Together in dementia care",
	logoText: "Ch",
	logoAccent: "allengeD",
	heroTitle: "Challenge Dementia,",
	heroHighlight: "Together",
	heroSubtitle: "Your all-in-one dementia care platform — knowledge guides, care coordination, GPS safety, AI companionship, and professional support.",
	ctaTitle: "Your dementia care journey starts here",
	ctaSubtitle: "Join families who trust ChallengeD to coordinate compassionate dementia care.",
	ctaButton: "Find Dementia Caregivers",
	searchPlaceholder: "What dementia care do you need?",
	howItWorksTitle: "How ChallengeD Works",
	footerBrand: "ChallengeD",
	footerTagline: "Dementia care knowledge, coordination and location safety.",
	metaTitle: "ChallengeD — Dementia Care Together",
	metaDescription: "Coordinate dementia care, find specialized caregivers, and keep your cared one safe.",
	cssClass: "site-challenged",
	contactEmail: "safety@challenged.com",
	brandSlug: "challenged",
	caredOneSingular: "Cared One",
	careGroupSingular: "Care Team",
	navLabels: {
		careGroups: "Care Teams",
		findCare: "Find Help",
		caredOnes: "Cared Ones",
		dashboard: "Dashboard",
		gpsTracking: "FinD",
		awareD: "AwareD",
		careD: "CareD",
		copeD: "CopeD",
		safeD: "SafeD",
		accompanieD: "AccompanieD",
		manageD: "ManageD"
	},
	howItWorksSteps: [
		{
			step: "1",
			titleKey: "step1Title",
			descKey: "step1Desc"
		},
		{
			step: "2",
			titleKey: "step2Title",
			descKey: "step2Desc"
		},
		{
			step: "3",
			titleKey: "step3Title",
			descKey: "step3Desc"
		}
	],
	trustBadges: [
		"badge1",
		"badge2",
		"badge3",
		"badge4"
	]
};
/** Map hostnames to site slugs */
var DOMAIN_MAP = {
	"challenged.com": "challenged",
	"www.challenged.com": "challenged",
	"carecnc.com": "carecnc",
	"www.carecnc.com": "carecnc",
	"localhost:5174": "challenged"
};
/** Legacy / friendly aliases → canonical slug. */
var SLUG_ALIASES = {
	careconnected: "carecnc",
	safety: "notchsafety"
};
/**
* Release slug grammar: `<brand>[-<channel><n>]-v<version>[-<region>]`
*   challenged                → internal full build (superset of everything)
*   challenged-b1-v1          → beta, "Beta" shown
*   challenged-b2-v1          → beta, no "Beta" label
*   challenged-p1-v1          → public release (international)
*   challenged-p1-v1-cn       → public release, mainland China
*   challenged-t1-v1          → internal test build
* Public / beta builds are always a SUBSET of the internal build — never a
* second codebase.
*/
var SLUG_RE = /^(challenged|carecnc|notchsafety|esm_survey|researcher|consent|sick)(?:-([bpt])(\d+))?(?:-v(\d+))?(?:-([a-z]{2}))?$/;
function parseSlug(raw) {
	const slug = SLUG_ALIASES[raw] || raw;
	const m = SLUG_RE.exec(slug);
	if (!m) return null;
	const [, brand, letter, num, version, region] = m;
	return {
		brand,
		release: {
			slug,
			channel: letter === "b" ? "beta" : letter === "p" ? "public" : letter === "t" ? "test" : "internal",
			channelNumber: num ? parseInt(num, 10) : 0,
			version: version ? parseInt(version, 10) : 0,
			region: region || void 0
		}
	};
}
/**
* Feature set for a release. Beta and public builds drop the three
* compliance-heavy areas: the paid caregiver marketplace, senior facilities
* and the open discussion community.
*/
function featuresFor(release, brand) {
	if (brand === "notchsafety" || brand === "consent" || brand === "sick") return {
		paidCaregivers: false,
		facilities: false,
		community: false
	};
	const trimmed = release.channel === "beta" || release.channel === "public";
	return {
		paidCaregivers: !trimmed,
		facilities: !trimmed,
		community: !trimmed
	};
}
/** Only b1 carries a visible "Beta" label; b2 is the same build without it. */
function showsBetaLabel(release) {
	return release.channel === "beta" && release.channelNumber === 1;
}
/** The raw release slug for this tab (query param → domain → stored choice). */
function detectSiteSlug() {
	if (typeof window === "undefined") return "challenged";
	const host = window.location.host;
	const hostname = window.location.hostname;
	const storageKey = `__site_id:${host}`;
	const siteParam = (new URLSearchParams(window.location.search).get("__site") || "").trim().toLowerCase();
	const parsed = siteParam ? parseSlug(siteParam) : null;
	if (parsed) {
		try {
			sessionStorage.setItem(storageKey, parsed.release.slug);
		} catch {}
		return parsed.release.slug;
	}
	const mappedSite = DOMAIN_MAP[host] || DOMAIN_MAP[hostname];
	if (mappedSite) {
		try {
			sessionStorage.removeItem(storageKey);
		} catch {}
		return mappedSite;
	}
	try {
		const stored = sessionStorage.getItem(storageKey);
		if (stored && parseSlug(stored)) return stored;
	} catch {}
	return "challenged";
}
/** The brand behind the running release. */
function detectSite() {
	return parseSlug(detectSiteSlug())?.brand ?? "challenged";
}
var notchSafetyConfig = {
	...careCNCConfig,
	id: "notchsafety",
	family: "notchsafety",
	name: "Notch Safety",
	tagline: "Know everyone is safe.",
	logoText: "Notch",
	logoAccent: "Safety",
	footerBrand: "Notch Safety",
	metaTitle: "Notch Safety — Family location & safe zones",
	metaDescription: "See where your family is, get alerts when they leave or enter a safe zone, and send SOS in one tap.",
	cssClass: "site-notchsafety",
	brandSlug: "notchsafety",
	navLabels: {
		...careCNCConfig.navLabels,
		gpsTracking: "Map"
	}
};
/** The research study app — a survey instrument, not a care product. */
var esmSurveyConfig = {
	...careCNCConfig,
	id: "esm_survey",
	family: "esm_survey",
	name: "A Week in the Life of Dementia Caregivers",
	tagline: "An hourly caregiving diary study",
	logoText: "Week in the Life",
	logoAccent: "",
	footerBrand: "A Week in the Life of Dementia Caregivers",
	metaTitle: "A Week in the Life of Dementia Caregivers — Study",
	metaDescription: "An hourly and daily caregiving diary study for dementia caregivers. Every question can be answered by voice.",
	cssClass: "site-esm-survey",
	brandSlug: "esm_survey"
};
/** Informed-consent micro site: one page for study participants, no app. */
var consentConfig = {
	...esmSurveyConfig,
	id: "consent",
	family: "consent",
	name: "Informed Consent",
	tagline: "知情同意书",
	logoText: "知情同意",
	logoAccent: "",
	footerBrand: "School of Nursing, Hangzhou Normal University",
	metaTitle: "知情同意书 — Informed Consent",
	metaDescription: "阿尔茨海默症患者居家照顾现状与照顾者需求研究 — 参加本研究前请阅读并确认知情同意书。",
	cssClass: "site-consent",
	brandSlug: "consent"
};
/** Sick-leave notice micro site: one picture, no words, no app shell, no brand. */
var sickConfig = {
	...esmSurveyConfig,
	id: "sick",
	family: "sick",
	name: "Sick Leave",
	tagline: "病假",
	logoText: "",
	logoAccent: "",
	footerBrand: "",
	metaTitle: "Sick Leave · 病假",
	metaDescription: "A one-picture sick-leave notice. 一张图片说明请假，页面上没有任何文字。",
	cssClass: "site-sick",
	brandSlug: "sick"
};
var BRAND_CONFIGS = {
	challenged: challengedConfig,
	carecnc: careCNCConfig,
	notchsafety: notchSafetyConfig,
	esm_survey: esmSurveyConfig,
	researcher: {
		...esmSurveyConfig,
		id: "researcher",
		family: "researcher",
		name: "Study Researcher",
		brandSlug: "researcher",
		metaTitle: "Researcher dashboard — A Week in the Life study"
	},
	consent: consentConfig,
	sick: sickConfig
};
var INTERNAL_RELEASE = {
	slug: "challenged",
	channel: "internal",
	channelNumber: 0,
	version: 0
};
/** Brand config + the running release, with its trimmed feature set. */
function resolveSite(slug = detectSiteSlug()) {
	const parsed = parseSlug(slug) ?? {
		brand: "challenged",
		release: INTERNAL_RELEASE
	};
	const brand = BRAND_CONFIGS[parsed.brand];
	const showBetaLabel = showsBetaLabel(parsed.release);
	return {
		...brand,
		metaTitle: showBetaLabel ? `${brand.metaTitle} (Beta)` : brand.metaTitle,
		release: parsed.release,
		features: featuresFor(parsed.release, parsed.brand),
		showBetaLabel
	};
}
var SiteContext = (0, import_react.createContext)(resolveSite("challenged"));
var SiteProvider = ({ children }) => {
	const config = (0, import_react.useMemo)(() => resolveSite(), []);
	const { i18n: language } = useTranslation();
	const isChinese = language.language?.startsWith("zh");
	(0, import_react.useEffect)(() => {
		const html = document.documentElement;
		html.classList.remove("site-carecnc", "site-challenged", "site-notchsafety", "site-esm-survey", "site-consent", "site-sick");
		html.classList.add(config.cssClass);
		const localizedName = isChinese ? config.family === "challenged" ? "忆畅" : config.family === "carecnc" ? "护畅" : config.family === "notchsafety" ? "诺驰安全" : config.name : config.name;
		const localizedTitle = isChinese && [
			"challenged",
			"carecnc",
			"notchsafety"
		].includes(config.family ?? "") ? `${localizedName}${config.showBetaLabel ? "（测试版）" : ""}` : config.metaTitle;
		const localizedDescription = isChinese && config.family === "notchsafety" ? "家人位置、地点提醒与紧急求助。" : isChinese && config.family === "carecnc" ? "查找护理服务，预约并协调照护。" : isChinese && config.family === "challenged" ? "失智症照护知识、家庭协作与位置安全。" : config.metaDescription;
		const faviconHref = config.family === "researcher" || config.family === "esm_survey" || config.family === "consent" || config.family === "sick" ? "/favicon-research.svg" : config.family === "notchsafety" ? "/favicon-notchsafety.png" : config.family === "carecnc" ? isChinese ? "/favicon-huchang.png" : "/favicon-carecnc-en.png" : isChinese ? "/favicon-yichang.png" : "/favicon-challenged.png";
		document.querySelector("meta[name=\"robots\"]")?.remove();
		if (config.family === "sick") {
			const robots = document.createElement("meta");
			robots.name = "robots";
			robots.content = "noindex, nofollow";
			document.head.appendChild(robots);
		}
		document.documentElement.lang = isChinese ? "zh-CN" : "en";
		document.title = localizedTitle;
		const setMeta = (selector, content) => {
			document.querySelector(selector)?.setAttribute("content", content);
		};
		setMeta("meta[name=\"description\"]", localizedDescription);
		setMeta("meta[name=\"author\"]", localizedName);
		setMeta("meta[property=\"og:title\"]", localizedTitle);
		setMeta("meta[property=\"og:description\"]", localizedDescription);
		setMeta("meta[name=\"twitter:title\"]", localizedTitle);
		setMeta("meta[name=\"twitter:description\"]", localizedDescription);
		["icon", "apple-touch-icon"].forEach((rel) => {
			document.querySelectorAll(`link[rel="${rel}"]`).forEach((el) => el.remove());
			const link = document.createElement("link");
			link.rel = rel;
			link.href = `${faviconHref}?v=flat-20261012`;
			if (faviconHref.endsWith(".svg")) link.type = "image/svg+xml";
			document.head.appendChild(link);
		});
	}, [config, isChinese]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteContext.Provider, {
		value: config,
		children
	});
};
var useSite = () => {
	const base = (0, import_react.useContext)(SiteContext);
	const { i18n: i18nInstance } = useTranslation();
	if (!(i18nInstance.language || "en").startsWith("zh")) return base;
	if (base.family === "notchsafety") return {
		...base,
		name: "诺驰安全",
		tagline: "让家人始终安全",
		caredOneSingular: "家人",
		careGroupSingular: "圈子",
		navLabels: {
			...base.navLabels,
			gpsTracking: "地图",
			careGroups: "圈子",
			dashboard: "地图"
		}
	};
	const isChallenged = base.family === "challenged";
	return {
		...base,
		name: isChallenged ? "忆畅" : base.family === "carecnc" ? "护畅" : base.name,
		caredOneSingular: isChallenged ? "被护理者" : "被照顾者",
		careGroupSingular: isChallenged ? "护理群组" : "照护小组",
		navLabels: {
			...base.navLabels,
			careGroups: isChallenged ? "护理群组" : "照护小组",
			findCare: isChallenged ? "寻求帮助" : "寻找护理",
			caredOnes: isChallenged ? "被护理者" : "被照顾者",
			dashboard: "控制面板",
			gpsTracking: isChallenged ? "定位" : "定位追踪",
			awareD: "认知助手",
			careD: "护理助手",
			copeD: "情绪助手",
			safeD: "安全助手",
			accompanieD: "陪伴助手",
			manageD: "管理助手"
		}
	};
};
//#endregion
export { detectSite as n, useSite as r, SiteProvider as t };
