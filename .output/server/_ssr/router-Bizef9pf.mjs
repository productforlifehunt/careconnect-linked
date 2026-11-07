import { s as __toESM } from "../_runtime.mjs";
import { n as __name$1 } from "./rolldown-runtime-CNktS9qV.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./utils-CcHv9xqZ.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime, _ as DialogTrigger, f as DialogContent, g as DialogTitle, h as DialogPortal, m as DialogOverlay, u as Dialog } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { a as getWPToken, i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { a as inspectModeOn, c as setInspectMode, o as isResearcherAccount } from "./recorder-CZ3Gd8pJ.mjs";
import { Bn as Briefcase, Dt as MapPin, G as Search, Gn as Bell, H as Settings, Hn as Bot, Kt as House, Ln as CalendarDays, Lt as LayoutGrid, M as Smile, Nn as ChevronDown, Qt as HandHeart, Rt as LayoutDashboard, St as MessageSquare, Tt as Menu, U as Settings2, Un as BookOpen, Ut as Inbox, Vn as Brain, Yt as Heart, Zt as HeartHandshake, bn as ClipboardList, c as Users, d as UserPlus, ht as Newspaper, kt as LogOut, n as X, q as ScanSearch, wn as CircleQuestionMark, z as ShieldCheck, zn as Building2 } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { C as useRouter, J as redirect, _ as lazyRouteComponent, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, v as createFileRoute, y as createRootRouteWithContext } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient, n as useQuery, r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { r as useSite, t as SiteProvider } from "./SiteContext-Br0kF93Q.mjs";
import { b as runSettingSkill, f as fetchAppSettings, o as applyDisplaySettings, t as DEFAULT_APP_SETTINGS } from "./ai-dynamic-knowledge-C5tnjGCy.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as objectType, o as stringType, r as enumType } from "../_libs/zod.mjs";
import { n as aiBrand } from "./AICompanionChat-BkMG0AtV.mjs";
import { n as useAIAssistant, t as AIAssistantProvider } from "./AIAssistantContext-XrOQCrX9.mjs";
import { n as useAuth, t as AuthProvider } from "./AuthContext-BAA6n6xi.mjs";
import { t as Switch } from "./switch-Coli7fra.mjs";
import { i as useNavigate$1, r as useLocation$1, t as Link$1 } from "./router-compat-CRbRSfhz.mjs";
import { t as ErrorBoundary } from "./ErrorBoundary-BRNNp_WV.mjs";
import { n as getCurrentPosition } from "./geolocation-BbrvI7XV.mjs";
import { t as inspectorNotesCache } from "./notes-cache-Bdl5H6YR.mjs";
import { t as BrandMark } from "./BrandMark-s4GFHX6D.mjs";
import { t as NotFound } from "./NotFound-DfIIQwXK.mjs";
import { t as lazyRetry } from "./lazy-retry-gN02cENW.mjs";
import { a as DropdownMenuTrigger, i as DropdownMenuSeparator, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-BehT_ZHg.mjs";
import { n as PageBackButton, t as LanguageSwitcher } from "./PageBackButton-DmkR5_86.mjs";
import { a as SheetTrigger, n as SheetContent, t as Sheet } from "./sheet-8EK9o9cK.mjs";
import { n as TooltipProvider$1, t as TooltipContent$1 } from "../_libs/radix-ui__react-tooltip.mjs";
import { n as z, t as j } from "../_libs/next-themes.mjs";
import { a as ToastProvider$1, i as ToastDescription$1, n as ToastAction$1, o as ToastTitle$1, r as ToastClose$1, s as ToastViewport$1, t as Toast$1 } from "../_libs/radix-ui__react-toast.mjs";
import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Bizef9pf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TooltipProvider = TooltipProvider$1;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent$1, {
	ref,
	sideOffset,
	className: cn("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className),
	...props
}));
TooltipContent.displayName = TooltipContent$1.displayName;
var styles_default = "/assets/styles-BjFzgg6Y.css";
var ToastProvider = ToastProvider$1;
var ToastViewport = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastViewport$1, {
	ref,
	className: cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className),
	...props
}));
ToastViewport.displayName = ToastViewport$1.displayName;
var toastVariants = cva("group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full", {
	variants: { variant: {
		default: "border bg-background text-foreground",
		destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
	} },
	defaultVariants: { variant: "default" }
});
var Toast = import_react.forwardRef(({ className, variant, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toast$1, {
		ref,
		className: cn(toastVariants({ variant }), className),
		...props
	});
});
Toast.displayName = Toast$1.displayName;
var ToastAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastAction$1, {
	ref,
	className: cn("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50", className),
	...props
}));
ToastAction.displayName = ToastAction$1.displayName;
var ToastClose = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastClose$1, {
	ref,
	className: cn("absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:outline-hidden focus:ring-2 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600", className),
	"toast-close": "",
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
		"data-inspector-id": "components/ui/toast/ToastClose/X/0",
		"data-inspector-source": "components/ui/toast.tsx:76:5:07ab2607ae91e8e320c0ce87cd32f715b9d4f88844d14dc85b4cdcdcee040eee:1",
		className: "h-4 w-4"
	})
}));
ToastClose.displayName = ToastClose$1.displayName;
var ToastTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastTitle$1, {
	ref,
	className: cn("text-sm font-semibold", className),
	...props
}));
ToastTitle.displayName = ToastTitle$1.displayName;
var ToastDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastDescription$1, {
	ref,
	className: cn("text-sm opacity-90", className),
	...props
}));
ToastDescription.displayName = ToastDescription$1.displayName;
function Toaster$2() {
	const { toasts } = useToast();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ToastProvider, {
		"data-inspector-id": "components/ui/toaster/Toaster/ToastProvider/0",
		"data-inspector-source": "components/ui/toaster.tsx:8:5:09fce3b5d0ab8750924bd4f887032e7785b62e70b7d8f7c5e14269dcf8390852:1",
		children: [toasts.map(function({ id, title, description, action, ...props }) {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toast, {
				"data-inspector-id": "components/ui/toaster/Toaster/Toast/0",
				"data-inspector-source": "components/ui/toaster.tsx:11:11:b68733cf9c7f0a54f007b311735d07302cda1cf2645d425e6e3ef543ca5918ae:1",
				...props,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/ui/toaster/Toaster/div/0",
						"data-inspector-source": "components/ui/toaster.tsx:12:13:f6b20544dce7763aee52aa9668e3b05209018e5fcc22ff0a18e80fd0cd0e0dbb:1",
						className: "grid gap-1",
						children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastTitle, {
							"data-inspector-id": "components/ui/toaster/Toaster/ToastTitle/0",
							"data-inspector-source": "components/ui/toaster.tsx:13:25:e85a7bc12629a968037a157755d09d68e7f4e59f8a0ab8e9cda19d49b3fa837b:1",
							children: title
						}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastDescription, {
							"data-inspector-id": "components/ui/toaster/Toaster/ToastDescription/0",
							"data-inspector-source": "components/ui/toaster.tsx:14:31:0425c6e16623069b605fb74237719355764be01fe39e266ae49f378a077b899d:1",
							children: description
						})]
					}),
					action,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastClose, {
						"data-inspector-id": "components/ui/toaster/Toaster/ToastClose/0",
						"data-inspector-source": "components/ui/toaster.tsx:17:13:0c801bf34c1d553de7ff35456126101eb92c3f29654fa133cfdfb80bcb45fa62:1"
					})
				]
			}, id);
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastViewport, {
			"data-inspector-id": "components/ui/toaster/Toaster/ToastViewport/0",
			"data-inspector-source": "components/ui/toaster.tsx:21:7:706f6cf99ac7a55d9a1a54341dc68683267c28cee1056e2d799d14d60d087ddc:1"
		})]
	});
}
__name$1(Toaster$2, "Toaster");
var Toaster$1 = /* @__PURE__ */ __name$1(({ ...props }) => {
	const { theme = "system" } = j();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		"data-inspector-id": "components/ui/sonner/Toaster/Sonner/0",
		"data-inspector-source": "components/ui/sonner.tsx:10:5:68766989436e868b5f51215f6c310d7b46a6ced4292a9ddb384a13a551457b6c:1",
		theme,
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
}, "Toaster");
/**
* Keeps the screen in sync with the display settings. It stores nothing: the
* values, their allowed options and the write path all live in the setting
* skills in src/lib/ai-dynamic-knowledge.ts.
*/
/** Mount once, high in the tree. */
function useApplyDisplaySettings() {
	const { data } = useQuery({
		queryKey: ["appSettings"],
		queryFn: () => fetchAppSettings(),
		staleTime: 6e4
	});
	const display = (data ?? DEFAULT_APP_SETTINGS).display;
	(0, import_react.useEffect)(() => {
		applyDisplaySettings(display);
	}, [display.text_size, display.reduce_motion]);
}
var SHARE_EVERY_MS = 180 * 1e3;
var POLL_EVERY_MS = 30 * 1e3;
/**
* Runs on the signed-in person's own device while the app is open.
* - CCT 258 a56 = b55 (sharing on): sends a location snapshot every 3 minutes.
* - An unread emergency location request + a55 = b55: answers it at once,
*   without asking (a68 b55 when ordinary sharing is off).
*/
function LocationSharingAgent() {
	const { isAuthenticated } = useAuth();
	const site = useSite();
	const careSite = ![
		"researcher",
		"esm_survey",
		"consent",
		"sick"
	].includes(site.id);
	const qc = useQueryClient();
	const lastShare = (0, import_react.useRef)(0);
	const busy = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!isAuthenticated || !careSite) return;
		let stopped = false;
		const tick = async () => {
			if (stopped || busy.current || document.visibilityState !== "visible") return;
			const me = getStoredWPUser()?.user_id;
			if (!me) return;
			busy.current = true;
			try {
				const [{ fetchLocationSharingFlags }, ext, { runNotificationSkill }] = await Promise.all([
					import("../_libs/_18.mjs").then((n) => n.r),
					import("../_libs/_19.mjs").then((n) => n.g),
					import("../_libs/_11.mjs").then((n) => n.i)
				]);
				const flags = await fetchLocationSharingFlags(me);
				if (flags.emergencyAllowed) {
					const unread = await runNotificationSkill("list-notifications", { unreadOnly: true }).catch(() => []);
					const emergencies = (Array.isArray(unread) ? unread : []).filter((n) => typeof n.action_url === "string" && n.action_url.includes("emergency=1") && n.action_url.includes("request_from="));
					if (emergencies.length) {
						const pos = await getCurrentPosition({ timeout: 15e3 });
						if (pos) {
							for (const n of emergencies) {
								const requester = new URL(String(n.action_url), window.location.origin).searchParams.get("request_from");
								if (requester) await ext.answerEmergencyRequestWordPress({
									requesterId: requester,
									position: pos
								}).catch(() => {});
								await runNotificationSkill("mark-notification-read", { id: n.id }).catch(() => {});
							}
							lastShare.current = Date.now();
							qc.invalidateQueries({ queryKey: ["caredOneLocation"] });
						}
					}
				}
				if (flags.shareOn && Date.now() - lastShare.current >= SHARE_EVERY_MS) {
					const pos = await getCurrentPosition({ timeout: 15e3 });
					if (pos) {
						await ext.writeCaredOneSnapshot(pos, false);
						lastShare.current = Date.now();
						qc.invalidateQueries({ queryKey: ["caredOneLocation"] });
					}
				}
			} catch {} finally {
				busy.current = false;
			}
		};
		tick();
		const id = window.setInterval(tick, POLL_EVERY_MS);
		return () => {
			stopped = true;
			window.clearInterval(id);
		};
	}, [
		isAuthenticated,
		careSite,
		qc
	]);
	return null;
}
/**
* Detects whether the app is running as an installed app
* (PWA standalone, iOS home-screen app, or Capacitor native shell)
* vs. a regular browser tab.
*
* In a regular browser tab we want to behave like a marketing website:
* no bottom navigation, prominent "Enter App" CTA.
*/
function useStandaloneMode() {
	const compute = () => {
		if (typeof window === "undefined") return false;
		if (window.Capacitor?.isNativePlatform?.()) return true;
		if (window.navigator.standalone === true) return true;
		try {
			if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
			if (window.matchMedia?.("(display-mode: fullscreen)").matches) return true;
			if (window.matchMedia?.("(display-mode: minimal-ui)").matches) return true;
		} catch {}
		return false;
	};
	const [standalone, setStandalone] = (0, import_react.useState)(compute);
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia?.("(display-mode: standalone)");
		const handler = () => setStandalone(compute());
		mq?.addEventListener?.("change", handler);
		return () => mq?.removeEventListener?.("change", handler);
	}, []);
	return standalone;
}
/** Public entries: visible to everyone, signed in or not. */
function buildPublicNav({ site, t, isChinese, withHome }) {
	const isChallenged = site.family === "challenged";
	const isCareCNC = site.id === "carecnc";
	const paidCare = site.features?.paidCaregivers !== false;
	const facilities = site.features?.facilities !== false;
	const community = site.features?.community !== false;
	const home = withHome ? [{
		title: t("nav.dashboard"),
		url: "/",
		icon: House
	}] : [];
	if (isChallenged) return [
		...home,
		{
			title: t("nav.awareD"),
			url: "/awared",
			icon: Search
		},
		{
			title: t("nav.careD"),
			url: "/cared",
			icon: Heart
		},
		{
			title: t("nav.copeD"),
			url: "/coped",
			icon: Heart
		},
		{
			title: t("nav.safeD"),
			url: "/safed",
			icon: Heart
		},
		{
			title: t("nav.accompanieD"),
			url: "/accompanied",
			icon: Heart
		},
		...paidCare ? [
			{
				title: t("nav.findCaregivers"),
				url: "/search-caregiver",
				icon: Search
			},
			{
				title: t("nav.findLocalCompanion"),
				url: "/search-local-caregiver",
				icon: Heart
			},
			{
				title: t("nav.findRemoteCompanion"),
				url: "/search-remote-caregiver",
				icon: MessageSquare
			}
		] : [],
		{
			title: t("nav.aiCompanion"),
			url: "/ai-companion",
			icon: Bot,
			badge: aiBrand(isChinese ? "zh" : "en")
		},
		...facilities ? [{
			title: t("nav.seniorFacilities"),
			url: "/search-care-facility",
			icon: Building2
		}] : [],
		{
			title: isChinese ? t("nav.united") : site.navLabels.careGroups,
			url: "/care-circle",
			icon: Users
		},
		...community ? [{
			title: t("nav.community"),
			url: "/community",
			icon: Newspaper
		}] : [],
		{
			title: t("nav.howItWorks"),
			url: "/how-it-works",
			icon: CircleQuestionMark
		}
	];
	return [
		...home,
		{
			title: t("nav.careGroups"),
			url: "/care-circle",
			icon: Users
		},
		...paidCare ? [{
			title: t("nav.findCare"),
			url: "/search",
			icon: Search
		}] : [],
		...isCareCNC || !community ? [] : [{
			title: t("nav.community"),
			url: "/community",
			icon: Newspaper
		}],
		{
			title: t("nav.articles"),
			url: "/articles",
			icon: Newspaper
		},
		{
			title: t("nav.howItWorks"),
			url: "/how-it-works",
			icon: CircleQuestionMark
		},
		...paidCare ? [{
			title: t("nav.becomeCaregiver"),
			url: "/become-caregiver",
			icon: UserPlus
		}] : []
	];
}
/** The four fixed tabs of the mobile bottom bar (the 5th slot is "More"). */
function buildBottomTabs({ site, t, isChinese }) {
	const isChallenged = site.family === "challenged";
	const caredOnesLabel = isChinese ? "被护理者" : site.navLabels.caredOnes;
	const careGroupLabel = isChinese ? isChallenged ? "护理群组" : "照护小组" : isChallenged ? "Care Teams" : site.navLabels.careGroups;
	return [
		{
			title: isChinese ? "首页" : "Home",
			url: "/dashboard",
			icon: LayoutDashboard
		},
		{
			title: caredOnesLabel,
			url: "/cared-ones",
			icon: Heart
		},
		{
			title: careGroupLabel,
			url: "/care-circle",
			icon: Users
		},
		{
			title: isChinese ? "收件箱" : "Inbox",
			url: "/inbox",
			icon: Inbox
		}
	];
}
function AppHeader() {
	const { user, isAuthenticated, logout, authSource } = useAuth();
	const site = useSite();
	const navigate = useNavigate$1();
	const location = useLocation$1();
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const { t, i18n } = useTranslation();
	const isChinese = i18n.language?.startsWith("zh");
	const dashboardLabel = useStandaloneMode() ? t("nav.dashboard") : t("nav.enterApp");
	const isChallenged = site.family === "challenged";
	const isCareCNC = site.id === "carecnc";
	const paidCare = site.features.paidCaregivers;
	const logoWordmarkText = site.family === "notchsafety" ? isChinese ? "诺驰安全" : "Notch Safety" : isCareCNC ? isChinese ? "护畅" : "CareCNC" : isChinese ? "忆畅" : "ChallengeD";
	const publicNav = buildPublicNav({
		site,
		t,
		isChinese
	});
	const PRIMARY_COUNT = 5;
	const primaryNav = publicNav.slice(0, PRIMARY_COUNT);
	const overflowNav = publicNav.slice(PRIMARY_COUNT);
	const currentUrl = `${location.pathname}${location.search}`;
	const isNavActive = (url) => url.includes("?") ? currentUrl === url : location.pathname === url;
	const displayName = user?.full_name || user?.username || user?.user_login || t("common.anonymous");
	const initials = displayName.charAt(0).toUpperCase();
	const handleLogout = async () => {
		await logout();
		navigate("/");
	};
	const mobileMenu = isAuthenticated ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
		"data-inspector-id": "components/layout/AppHeader/mobileMenu/Sheet/0",
		"data-inspector-source": "components/layout/AppHeader.tsx:71:5:fdebaf3986fad4742dfe400c9ce9d39e5049e60d5736d1862ce923da2e0246a6:1",
		open: mobileOpen,
		onOpenChange: setMobileOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
			"data-inspector-id": "components/layout/AppHeader/mobileMenu/SheetTrigger/0",
			"data-inspector-source": "components/layout/AppHeader.tsx:72:7:b9287833979ff87a0d0fc091940b4f9f4ae5759fdd7604f59a1e902be1bd7aa2:1",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				"data-inspector-id": "components/layout/AppHeader/mobileMenu/Button/0",
				"data-inspector-source": "components/layout/AppHeader.tsx:73:9:115e206fdd52b2c611b7eb6f478c055a03af23179dfa59aca2a6893d1aad8984:1",
				variant: "ghost",
				size: "icon",
				className: "min-h-11 min-w-11 lg:hidden shrink-0",
				"aria-label": t("nav.browse"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {
					"data-inspector-id": "components/layout/AppHeader/mobileMenu/Menu/0",
					"data-inspector-source": "components/layout/AppHeader.tsx:74:11:ae2754586814710a960eeac2cb5a5a1573436b7f220e7d954951f38a4a8eef39:1",
					className: "h-5 w-5"
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			"data-inspector-id": "components/layout/AppHeader/mobileMenu/SheetContent/0",
			"data-inspector-source": "components/layout/AppHeader.tsx:77:7:7b11431104b50260b12d4a455b9b1d1cb27eb4e83f6d2a6cc10f112ffcdba335:1",
			side: "right",
			className: "w-72 p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "components/layout/AppHeader/mobileMenu/div/0",
				"data-inspector-source": "components/layout/AppHeader.tsx:78:9:be585d105e5d93ee46fd5fe8e42298bc0f0ead2867d327e965061de83e225628:1",
				className: "p-4 border-b",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					"data-inspector-id": "components/layout/AppHeader/mobileMenu/Link/0",
					"data-inspector-source": "components/layout/AppHeader.tsx:79:11:695adb48c84f2ea8d6c1876dec5de98692669527c3da12aad525a713d92942fe:1",
					to: "/",
					onClick: () => setMobileOpen(false),
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
						"data-inspector-id": "components/layout/AppHeader/mobileMenu/BrandMark/0",
						"data-inspector-source": "components/layout/AppHeader.tsx:80:13:2e3bdaaad2c3e8827d3d15af2522d129ae957ce4df6923e09e19eff314304a69:1",
						size: 40,
						showWordmark: true
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				"data-inspector-id": "components/layout/AppHeader/mobileMenu/nav/0",
				"data-inspector-source": "components/layout/AppHeader.tsx:83:9:d460fd661617fcadce92b04d92f4710f716ceb524a84b79f444f1a0e9875f064:1",
				className: "p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-6rem)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "components/layout/AppHeader/mobileMenu/p/0",
						"data-inspector-source": "components/layout/AppHeader.tsx:84:11:226cbdf7841a56a1c77a5f0320712e190a6324b0478d1e5e82376e81589c59ee:1",
						className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3",
						children: t("nav.browse")
					}),
					publicNav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
						"data-inspector-id": "components/layout/AppHeader/mobileMenu/Link/1",
						"data-inspector-source": "components/layout/AppHeader.tsx:86:13:92416e7051c16a1af8cfb17011e581e06ebc5cca70849a08ce179f74e10cdeca:1",
						to: item.url,
						onClick: () => setMobileOpen(false),
						className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isNavActive(item.url) ? "bg-accent text-accent-foreground font-medium" : "text-foreground hover:bg-accent/50"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "components/layout/AppHeader/mobileMenu/span/0",
							"data-inspector-source": "components/layout/AppHeader.tsx:93:15:281ae10b0535f5258607bb2ea217859c5b8b1880e802251902df461637e0c8c0:1",
							className: "truncate",
							children: item.title
						})]
					}, item.url)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/layout/AppHeader/mobileMenu/div/1",
						"data-inspector-source": "components/layout/AppHeader.tsx:96:11:f98ce8300ba9baa70dfdca335dae8b61f557b7447715b7be1a146ba2dd7e298e:1",
						className: "pt-4 mt-4 border-t space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "components/layout/AppHeader/mobileMenu/Button/1",
							"data-inspector-source": "components/layout/AppHeader.tsx:97:13:60054442b94c42177db5b21fb03d894a904d65d6c0a0f642d1b4d56fb66f23b7:1",
							variant: "outline",
							className: "w-full",
							onClick: () => {
								setMobileOpen(false);
								navigate("/auth");
							},
							children: t("common.signIn")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "components/layout/AppHeader/mobileMenu/Button/2",
							"data-inspector-source": "components/layout/AppHeader.tsx:104:13:60054442b94c42177db5b21fb03d894a904d65d6c0a0f642d1b4d56fb66f23b7:1",
							variant: "coral",
							className: "w-full",
							onClick: () => {
								setMobileOpen(false);
								navigate("/auth?mode=signup");
							},
							children: t("common.getStarted")
						})]
					})
				]
			})]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		"data-inspector-id": "components/layout/AppHeader/AppHeader/header/0",
		"data-inspector-source": "components/layout/AppHeader.tsx:122:5:24c685da1ecf85a40b2410076d5c9f0479b5873a78a490f4a052d8eb018d117b:1",
		className: "sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-id": "components/layout/AppHeader/AppHeader/div/0",
			"data-inspector-source": "components/layout/AppHeader.tsx:123:7:e3a7348e2ced7b7de20b841b9362c65142a87ef3d069437db849dec6c721e750:1",
			className: "mx-auto flex h-[72px] w-full max-w-6xl items-center gap-2 px-4 sm:gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					"data-inspector-id": "components/layout/AppHeader/AppHeader/Link/0",
					"data-inspector-source": "components/layout/AppHeader.tsx:125:9:2993d12203aaf85bd292f27fd5c0db0b49939faf505a355e532b13f189b4577a:1",
					to: "/",
					className: "flex shrink-0 items-center",
					"aria-label": logoWordmarkText,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
						"data-inspector-id": "components/layout/AppHeader/AppHeader/BrandMark/0",
						"data-inspector-source": "components/layout/AppHeader.tsx:126:11:100f67ca77b2905951cae3f35d61a5e8a46f682e371aefc01ae1473f46add408:1",
						size: 42,
						showWordmark: true,
						className: "[&>span:last-child]:text-xl"
					}), site.showBetaLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-id": "components/layout/AppHeader/AppHeader/span/0",
						"data-inspector-source": "components/layout/AppHeader.tsx:128:13:52f5d7964218b2d1939382d4ce656821519d92ab34e23ad1b6269f17d293ab75:1",
						className: "px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-coral bg-coral/10 border border-coral/30 rounded-full leading-tight",
						children: "Beta"
					})]
				}),
				!isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					"data-inspector-id": "components/layout/AppHeader/AppHeader/nav/0",
					"data-inspector-source": "components/layout/AppHeader.tsx:137:9:5e0f93b1fc15039db14d43e12457c14f09f856f4e9f2bf541bc402809647bd1e:1",
					className: "ml-4 hidden min-w-0 flex-nowrap items-center gap-1 lg:flex",
					children: [primaryNav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						"data-inspector-id": "components/layout/AppHeader/AppHeader/Link/1",
						"data-inspector-source": "components/layout/AppHeader.tsx:141:13:92416e7051c16a1af8cfb17011e581e06ebc5cca70849a08ce179f74e10cdeca:1",
						to: item.url,
						className: `flex h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-3 text-sm transition-colors ${isNavActive(item.url) ? "text-primary font-medium bg-accent/50" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							"data-inspector-id": "components/layout/AppHeader/AppHeader/span/1",
							"data-inspector-source": "components/layout/AppHeader.tsx:150:15:be1dbaaed034907e0fbad1ab7c53e77f3df218621f3dce11cd9466d15ef71cdf:1",
							className: "relative",
							children: [item.title, "badge" in item && item.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "components/layout/AppHeader/AppHeader/span/2",
								"data-inspector-source": "components/layout/AppHeader.tsx:153:19:2b6a30c57d09dc04785fe9a8e704ab5cb15d741c102a245cf0408fefd5be8dcb:1",
								className: "absolute -top-2.5 -right-7 px-1 py-px text-[9px] font-bold text-coral bg-coral/10 border border-coral/30 rounded-full whitespace-nowrap leading-tight",
								children: item.badge
							})]
						})
					}, item.url)), overflowNav.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
						"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenu/0",
						"data-inspector-source": "components/layout/AppHeader.tsx:161:13:83073324732090ac801fac798be2f9b7520fbf35e581bc6f101530d563e16dbe:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuTrigger/0",
							"data-inspector-source": "components/layout/AppHeader.tsx:162:15:495dd07c3d767e300bb46b1a0df4b8973d529fab44c612e5ec313f521e9994b4:1",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "components/layout/AppHeader/AppHeader/Button/0",
								"data-inspector-source": "components/layout/AppHeader.tsx:163:17:83093c5dd40eefa9a326580cb039dd23bda539fc554c635e789f353914cfe9ce:1",
								variant: "ghost",
								size: "sm",
								className: "shrink-0 text-sm text-muted-foreground hover:text-foreground gap-1",
								children: [t("nav.more", "More"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/ChevronDown/0",
									"data-inspector-source": "components/layout/AppHeader.tsx:165:19:fa93724f4ddf0079c97f0964bab97ee13ca33a53988ea0fe2249b97d49d8f000:1",
									className: "h-3.5 w-3.5"
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
							"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuContent/0",
							"data-inspector-source": "components/layout/AppHeader.tsx:168:15:7c93ffc1d9a5dadd2b69b7ae7514abc234acee7bf8da781eb33f36dfff5f6ab2:1",
							align: "start",
							className: "w-56 bg-card border shadow-lg z-[60]",
							children: overflowNav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuItem/0",
								"data-inspector-source": "components/layout/AppHeader.tsx:170:19:cca2c75d2e5043caefcea1e5e7730e3d76f7de57d59a958237949e67f6e86855:1",
								onClick: () => navigate(item.url),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "mr-2 h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/span/3",
									"data-inspector-source": "components/layout/AppHeader.tsx:172:21:dfa1ddb8084c59e97667287794be0449e7845b82ca06d4bb7d26c623ecaba0c8:1",
									className: "truncate",
									children: item.title
								})]
							}, item.url))
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "components/layout/AppHeader/AppHeader/div/1",
					"data-inspector-source": "components/layout/AppHeader.tsx:181:9:4a1116928815b11e7ac8eff1ef498978573741d4104c933816f74ab6f8bb8f48:1",
					className: "flex-1"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageSwitcher, {
					"data-inspector-id": "components/layout/AppHeader/AppHeader/LanguageSwitcher/0",
					"data-inspector-source": "components/layout/AppHeader.tsx:184:9:6bb826486edcf2f13f4ea4c73724b23eb6a2c209e635f41dd85a9ac7f188c206:1"
				}),
				isAuthenticated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "components/layout/AppHeader/AppHeader/div/2",
					"data-inspector-source": "components/layout/AppHeader.tsx:188:11:da03dd891f550bf7d8df9033ade6b535ef98f3ad8571f52feb42fd87bef67a56:1",
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "components/layout/AppHeader/AppHeader/Button/1",
						"data-inspector-source": "components/layout/AppHeader.tsx:190:13:60054442b94c42177db5b21fb03d894a904d65d6c0a0f642d1b4d56fb66f23b7:1",
						variant: "ghost",
						size: "icon",
						className: "relative min-h-11 min-w-11 shrink-0",
						onClick: () => navigate("/inbox"),
						title: isChinese ? "收件箱" : "Inbox",
						"aria-label": isChinese ? "收件箱" : "Inbox",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
							"data-inspector-id": "components/layout/AppHeader/AppHeader/Bell/0",
							"data-inspector-source": "components/layout/AppHeader.tsx:198:15:b172fab362384020e82c2b12b161be8569b3a3458defcef804da6b59f8317467:1",
							className: "h-5 w-5"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
						"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenu/1",
						"data-inspector-source": "components/layout/AppHeader.tsx:201:13:83073324732090ac801fac798be2f9b7520fbf35e581bc6f101530d563e16dbe:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuTrigger/1",
							"data-inspector-source": "components/layout/AppHeader.tsx:202:15:495dd07c3d767e300bb46b1a0df4b8973d529fab44c612e5ec313f521e9994b4:1",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "components/layout/AppHeader/AppHeader/Button/2",
								"data-inspector-source": "components/layout/AppHeader.tsx:203:17:45e1070aedadfef03fe374041bd305772589d03ca630d0d6d411d40f6511978f:1",
								variant: "ghost",
								className: "gap-2 px-2 max-w-[18rem]",
								"aria-label": displayName,
								children: [user?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/img/0",
									"data-inspector-source": "components/layout/AppHeader.tsx:206:21:35fa6d5e3a1142f47219cdd2991a97c3d27b977393452b0a7ba95a405ac7feaf:1",
									src: user.avatar_url,
									alt: "",
									className: "h-8 w-8 rounded-full object-cover shrink-0"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/div/3",
									"data-inspector-source": "components/layout/AppHeader.tsx:208:21:9853c44512319e8fc5e9719c5361b75b0b1306236495258c4a8d385c07541b77:1",
									className: "h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "components/layout/AppHeader/AppHeader/span/4",
										"data-inspector-source": "components/layout/AppHeader.tsx:209:23:b7ed80e5b4b9cbe5c4932f31daedfe3953f971ab7d58b285170a82013aac2c1c:1",
										className: "text-primary-foreground text-sm font-medium",
										children: initials
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/span/5",
									"data-inspector-source": "components/layout/AppHeader.tsx:212:19:3947b9238e46d98461c99b6d1c896ddb1ce107ed5c0e129ae5b01c4d87c695eb:1",
									className: "hidden md:inline text-sm font-medium truncate",
									children: displayName
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
							"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuContent/1",
							"data-inspector-source": "components/layout/AppHeader.tsx:215:15:898cd415acfcfcc915251abeb254ea53a37c981a13b77d004092d24e89b8d528:1",
							align: "end",
							className: "w-52 bg-card border shadow-lg z-[60]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/div/4",
									"data-inspector-source": "components/layout/AppHeader.tsx:216:17:f9d25045c095667c47d40c4e65072abb1e6147df272c812c4d691d8faf33d43c:1",
									className: "px-3 py-2 border-b",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "components/layout/AppHeader/AppHeader/p/0",
										"data-inspector-source": "components/layout/AppHeader.tsx:217:19:9dbbb5405b0352c553a6c3004c26892bfae7b228f53cf793c2eac3d241a84def:1",
										className: "text-sm font-medium text-foreground truncate",
										children: displayName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "components/layout/AppHeader/AppHeader/p/1",
										"data-inspector-source": "components/layout/AppHeader.tsx:218:19:99f794d277b3c4633b585e36722aaedf687766eb036ffab6619f90d8afa963b5:1",
										className: "text-xs text-muted-foreground truncate",
										children: user?.email
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuItem/1",
									"data-inspector-source": "components/layout/AppHeader.tsx:221:17:8739457adb6b0671d7e9bc77daa63d3233b53e58896c66ffa33807f0f47e2f4d:1",
									onClick: () => navigate("/dashboard"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, {
											"data-inspector-id": "components/layout/AppHeader/AppHeader/LayoutDashboard/0",
											"data-inspector-source": "components/layout/AppHeader.tsx:222:19:b87825f011b37f1edf36b433fc309f571a8583482896f697f937ca3e0a704e79:1",
											className: "mr-2 h-4 w-4"
										}),
										" ",
										dashboardLabel
									]
								}),
								paidCare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuItem/2",
									"data-inspector-source": "components/layout/AppHeader.tsx:225:19:b678fe8510e71b2d896d6d820bb750e61b3d7b27ec636730d5b6c32d89c93b52:1",
									onClick: () => navigate("/bookings"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
											"data-inspector-id": "components/layout/AppHeader/AppHeader/CalendarDays/0",
											"data-inspector-source": "components/layout/AppHeader.tsx:226:21:662e67492994a20adca3de81b931384b130459e8558911ac6c3f30f1f73529fb:1",
											className: "mr-2 h-4 w-4"
										}),
										" ",
										t("nav.myBookings")
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuItem/3",
									"data-inspector-source": "components/layout/AppHeader.tsx:229:17:bf83dec06c925c51a994e1583be5301a0e3b65d17ed9452f54a4a0079b907d48:1",
									onClick: () => navigate("/care-circle"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
											"data-inspector-id": "components/layout/AppHeader/AppHeader/Users/0",
											"data-inspector-source": "components/layout/AppHeader.tsx:230:19:2ebdd28f611b6641d642a4f60a6c0f136265559aa0ebcfeb6116f33853b5d62a:1",
											className: "mr-2 h-4 w-4"
										}),
										" ",
										isChallenged ? t("nav.united") : t(site.family === "challenged" ? "nav.careTeams" : "nav.careGroups")
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuItem/4",
									"data-inspector-source": "components/layout/AppHeader.tsx:232:17:c5f564f9bd89581196773f1441d60acac83340033507a07c9ed032166973e607:1",
									onClick: () => navigate("/find"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
											"data-inspector-id": "components/layout/AppHeader/AppHeader/MapPin/0",
											"data-inspector-source": "components/layout/AppHeader.tsx:233:19:79cbb76759da169ccd0378e8de3c063902d427de7951b640a083720e39d3cdd6:1",
											className: "mr-2 h-4 w-4"
										}),
										" ",
										isChallenged ? t("nav.find") : t("nav.gpsTracking")
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuItem/5",
									"data-inspector-source": "components/layout/AppHeader.tsx:235:17:ef316db6bf5f55dda2d797c46d5055af3a96610afde3e0a1020430ba8876b054:1",
									onClick: () => navigate("/inbox?tab=messages"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, {
											"data-inspector-id": "components/layout/AppHeader/AppHeader/MessageSquare/0",
											"data-inspector-source": "components/layout/AppHeader.tsx:236:19:9425b9fe44985991319223d2c4bc357fc8a63d236466da27b2d857c81a9f3647:1",
											className: "mr-2 h-4 w-4"
										}),
										" ",
										t("nav.messages")
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuSeparator/0",
									"data-inspector-source": "components/layout/AppHeader.tsx:238:17:71ff830a9a86f0f1b518f7a580745a382a25fe72b32dbff0bfb5080573f4a5f6:1"
								}),
								paidCare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuItem/6",
									"data-inspector-source": "components/layout/AppHeader.tsx:240:19:f9a18a910ecdecf7e106f1ab410bb51d7ec5cba09a3abce388ade9ff19e86b89:1",
									onClick: () => navigate("/favorite-caregiver"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
											"data-inspector-id": "components/layout/AppHeader/AppHeader/Heart/0",
											"data-inspector-source": "components/layout/AppHeader.tsx:241:21:17b186717719096b6f207db669e4926979c8946d458557e7461f57e9e94c0885:1",
											className: "mr-2 h-4 w-4"
										}),
										" ",
										t("nav.favorites")
									]
								}),
								site.features.facilities && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuItem/7",
									"data-inspector-source": "components/layout/AppHeader.tsx:245:19:33e2f7b66eddf41fb4319fef79468e7c9c11db9dd1d46214f6814bb351753957:1",
									onClick: () => navigate("/facilities/new"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, {
											"data-inspector-id": "components/layout/AppHeader/AppHeader/Building2/0",
											"data-inspector-source": "components/layout/AppHeader.tsx:246:21:be4fef125adf19c1067b072eecad4006942458b821f981c39401feb54107ea24:1",
											className: "mr-2 h-4 w-4"
										}),
										" ",
										isChinese ? "提交养老院" : "Submit Facility"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuItem/8",
									"data-inspector-source": "components/layout/AppHeader.tsx:249:17:e3d6ecbd420a9670addbb4d4ae404fa2411fcf3d8d75fb3f584d52c0274d6f36:1",
									onClick: () => navigate("/settings"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
											"data-inspector-id": "components/layout/AppHeader/AppHeader/Settings/0",
											"data-inspector-source": "components/layout/AppHeader.tsx:250:19:594bed2905d585dd10352c7baa763884e2c5d90ebbfce47567fc256a76953c8a:1",
											className: "mr-2 h-4 w-4"
										}),
										" ",
										isChinese ? "设置" : "Settings"
									]
								}),
								paidCare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuItem/9",
									"data-inspector-source": "components/layout/AppHeader.tsx:253:19:30340a1a9ee399e56151debe52d1109736baad4901f53b923eb06cf5df465c1f:1",
									onClick: () => navigate("/caregiver-setting?tab=profile"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, {
											"data-inspector-id": "components/layout/AppHeader/AppHeader/Briefcase/0",
											"data-inspector-source": "components/layout/AppHeader.tsx:254:21:620b820d509cd1c5cef931929a9333ec34f9fce9b2cb8e8693a0af4cad9ed95e:1",
											className: "mr-2 h-4 w-4"
										}),
										" ",
										isChinese ? "护理者设置" : "Caregiver Settings"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuItem/10",
									"data-inspector-source": "components/layout/AppHeader.tsx:257:17:d2b0e21a12cf7662e977dc07cb3f5324e0ee5994aa2ea81ba052fbcff2301376:1",
									onClick: () => navigate("/how-it-works"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, {
											"data-inspector-id": "components/layout/AppHeader/AppHeader/HelpCircle/0",
											"data-inspector-source": "components/layout/AppHeader.tsx:258:19:f3cfab68270a9621c78b36c609f4e362b2fce25889c34c13cd132c3fc5a362c3:1",
											className: "mr-2 h-4 w-4"
										}),
										" ",
										isChinese ? "帮助" : "Help"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuSeparator/1",
									"data-inspector-source": "components/layout/AppHeader.tsx:260:17:71ff830a9a86f0f1b518f7a580745a382a25fe72b32dbff0bfb5080573f4a5f6:1"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									"data-inspector-id": "components/layout/AppHeader/AppHeader/DropdownMenuItem/11",
									"data-inspector-source": "components/layout/AppHeader.tsx:261:17:4d8b4faaef6f450c468d4f6c96ef976dbdbc65c94b31d82dd05e863676d5b9bc:1",
									onClick: handleLogout,
									className: "text-destructive",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {
											"data-inspector-id": "components/layout/AppHeader/AppHeader/LogOut/0",
											"data-inspector-source": "components/layout/AppHeader.tsx:262:19:b8cff34cff6b868f184b35b74929acffedde44bf2348de629a5559f3cc20f3f1:1",
											className: "mr-2 h-4 w-4"
										}),
										" ",
										t("common.signOut")
									]
								})
							]
						})]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "components/layout/AppHeader/AppHeader/div/5",
					"data-inspector-source": "components/layout/AppHeader.tsx:268:11:85005e044a1c4b3cdd7e5f9705dc10912d97810eca38926bd56b1b10f18ffab1:1",
					className: "flex items-center gap-1 sm:gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "components/layout/AppHeader/AppHeader/Button/3",
						"data-inspector-source": "components/layout/AppHeader.tsx:269:13:eaeeaf9bd9cae7969932a59a11ba0946d84d10c11d8a3381f03bb9d337e2678a:1",
						variant: "ghost",
						onClick: () => navigate("/auth"),
						className: "hidden h-10 px-3 sm:inline-flex",
						children: t("common.signIn")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "components/layout/AppHeader/AppHeader/Button/4",
						"data-inspector-source": "components/layout/AppHeader.tsx:272:13:531e3783a61e788189ba3ecc960b624edf7116e3503a007dd8f46fbe03ef5e55:1",
						variant: "coral",
						className: "hidden h-10 shrink-0 px-4 shadow-xs sm:inline-flex sm:px-5",
						onClick: () => navigate("/auth?mode=signup"),
						children: t("common.getStarted")
					})]
				}),
				mobileMenu
			]
		})
	});
}
/** Path-only part of a link target ("/inbox?tab=x" → "/inbox"). */
function targetPath(to) {
	return (to.split("#")[0] ?? "").split("?")[0] || "/";
}
var NavLink = (0, import_react.forwardRef)(({ className, activeClassName, pendingClassName: _pending, to, end, ...props }, ref) => {
	const { pathname } = useLocation$1();
	const path = targetPath(to);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
		"data-inspector-id": "components/NavLink/NavLink/Link/0",
		"data-inspector-source": "components/NavLink.tsx:29:7:69ba1bc97fc14ec672c32f2014c77bd6db4296257541e289a769fd7af8d99096:1",
		ref,
		to,
		className: cn(className, (end || path === "/" ? pathname === path : pathname === path || pathname.startsWith(path.endsWith("/") ? path : `${path}/`)) && activeClassName),
		...props
	});
});
NavLink.displayName = "NavLink";
var PREFS_KEY = "bottom-bar-prefs-v1";
function loadPrefs() {
	try {
		const raw = localStorage.getItem(PREFS_KEY);
		if (!raw) return {
			hidden: [],
			defaultFindTab: "care"
		};
		const p = JSON.parse(raw);
		return {
			hidden: Array.isArray(p.hidden) ? p.hidden : [],
			defaultFindTab: p.defaultFindTab === "work" ? "work" : "care"
		};
	} catch {
		return {
			hidden: [],
			defaultFindTab: "care"
		};
	}
}
function savePrefs(p) {
	try {
		localStorage.setItem(PREFS_KEY, JSON.stringify(p));
	} catch {}
}
function MobileBottomBar() {
	const site = useSite();
	const { isAuthenticated } = useAuth();
	const { t, i18n } = useTranslation();
	const isChinese = i18n.language?.startsWith("zh");
	useStandaloneMode();
	const [open, setOpen] = (0, import_react.useState)(false);
	const { openAssistant } = useAIAssistant();
	const [customizeOpen, setCustomizeOpen] = (0, import_react.useState)(false);
	const [prefs, setPrefs] = (0, import_react.useState)(() => loadPrefs());
	const [findTab, setFindTab] = (0, import_react.useState)(prefs.defaultFindTab);
	const location = useLocation$1();
	const qc = useQueryClient();
	const { toast } = useToast();
	const { data: appSettings } = useQuery({
		queryKey: ["appSettings"],
		queryFn: () => fetchAppSettings(),
		enabled: isAuthenticated
	});
	const showHelpBubble = appSettings?.display.help_bubble !== false;
	/**
	* Same AI chat component as the main bubble — this shortcut just switches on
	* the built-in app guide (fixed common questions, answered with no AI call).
	*/
	const openHelp = () => openAssistant({
		id: "app-help",
		title: isChinese ? "使用帮助" : "App guide",
		appGuide: true,
		onHideGuide: hideHelpBubble,
		contextScope: { topics: ["app-basics"] },
		contextPrompt: isChinese ? "用户正在问“怎么使用这个应用”的问题。只用应用功能本身回答，一步一步说，句子短，不用专业词。不知道就说不知道，并建议用户问 AI 助手或联系家人。不要给医疗或财务建议。" : "The user is asking how to use this app. Answer only with the app's own features, step by step, in short plain sentences, no jargon. If you don't know, say so and suggest asking the AI assistant or a family member. No medical or financial advice."
	});
	const hideHelpBubble = async () => {
		try {
			const next = await runSettingSkill("set-help-bubble", false, { settings: appSettings });
			qc.setQueryData(["appSettings"], next);
			toast({
				title: isChinese ? "已藏起来" : "Hidden",
				description: isChinese ? "想再看到小问号时，到“设置”里打开“显示问号帮助按钮”就好。" : "To bring the “?” back, turn on “Show the help button” in Settings."
			});
		} catch {
			toast({
				title: isChinese ? "没能保存，请再试一次" : "Could not save — please try again",
				variant: "destructive"
			});
		}
	};
	(0, import_react.useEffect)(() => {
		setFindTab(prefs.defaultFindTab);
	}, [prefs.defaultFindTab]);
	const isChallenged = site.family === "challenged";
	const paidCare = site.features.paidCaregivers;
	const facilitiesOn = site.features.facilities;
	const communityOn = site.features.community;
	const moreActive = open;
	isChinese || isChallenged || site.navLabels.careGroups;
	const items = buildBottomTabs({
		site,
		t,
		isChinese
	});
	const moreLabel = isChinese ? "工具" : "More";
	const openAi = () => {
		setOpen(false);
		openAssistant();
	};
	const findCareItems = !paidCare ? [] : isChallenged ? [
		{
			id: "find-care",
			title: isChinese ? "找护理者" : "Hire Caregivers",
			url: "/search?service_category=care",
			icon: Search
		},
		{
			id: "find-local-comp",
			title: isChinese ? "本地陪伴" : "Local Companion",
			url: "/search?service_type=local&service_category=companionship",
			icon: Heart
		},
		{
			id: "find-remote-comp",
			title: isChinese ? "远程陪伴" : "Remote Companion",
			url: "/search?service_type=remote&service_category=companionship",
			icon: MessageSquare
		},
		...facilitiesOn ? [{
			id: "find-facilities",
			title: isChinese ? "养老机构" : "Facilities",
			url: "/search?service_category=facility",
			icon: Building2
		}] : []
	] : [{
		id: "find-care",
		title: isChinese ? "找护理者" : "Hire Caregivers",
		url: "/search",
		icon: Search
	}, ...facilitiesOn ? [{
		id: "find-facilities",
		title: isChinese ? "养老机构" : "Facilities",
		url: "/search?service_category=facility",
		icon: Building2
	}] : []];
	const findWorkItems = !paidCare ? [{
		id: "tasks",
		title: isChinese ? "需要帮手的任务" : "Tasks Needing Help",
		url: "/tasks",
		icon: HeartHandshake
	}] : [
		{
			id: "tasks",
			title: isChinese ? "需要帮手的任务" : "Tasks Needing Help",
			url: "/tasks",
			icon: HeartHandshake
		},
		{
			id: "work-become",
			title: isChinese ? "成为护理者" : "Become Caregiver",
			url: "/become-caregiver",
			icon: UserPlus
		},
		{
			id: "work-provider",
			title: isChinese ? "护理者面板" : "Caregiver Dashboard",
			url: "/caregiver-setting",
			icon: LayoutDashboard
		}
	];
	const dailyCareItems = isChallenged ? [
		{
			id: "daily-calendar",
			title: isChinese ? "日历" : "Calendar",
			url: "/calendar",
			icon: CalendarDays
		},
		...paidCare ? [{
			id: "daily-bookings",
			title: isChinese ? "预约" : "Bookings",
			url: "/bookings",
			icon: ClipboardList
		}] : [],
		{
			id: "daily-gps",
			title: isChinese ? "定位" : "GPS",
			url: "/find",
			icon: MapPin
		},
		{
			id: "daily-ai",
			title: aiBrand(isChinese ? "zh" : "en", site.id),
			icon: Bot,
			onClick: openAi
		}
	] : [
		...paidCare ? [{
			id: "daily-bookings",
			title: isChinese ? "预约" : "Bookings",
			url: "/bookings",
			icon: ClipboardList
		}] : [],
		{
			id: "daily-gps",
			title: isChinese ? "定位" : "GPS",
			url: "/find",
			icon: MapPin
		},
		{
			id: "daily-ai",
			title: isChinese ? "AI 助手" : "AI Assistant",
			icon: Bot,
			onClick: openAi
		}
	];
	const resourceItems = isChallenged ? [
		{
			id: "community-resources",
			title: isChinese ? "资源与帮助" : "Resources & Help",
			url: "/resources",
			icon: BookOpen
		},
		{
			id: "res-cared",
			title: isChinese ? "护理篇" : "CareD",
			url: "/cared",
			icon: HeartHandshake
		},
		{
			id: "res-safed",
			title: isChinese ? "安全篇" : "SafeD",
			url: "/safed",
			icon: ShieldCheck
		},
		{
			id: "res-coped",
			title: isChinese ? "应对篇" : "CopeD",
			url: "/coped",
			icon: Smile
		},
		{
			id: "res-awared",
			title: isChinese ? "认知篇" : "AwareD",
			url: "/awared",
			icon: Brain
		},
		{
			id: "res-accompd",
			title: isChinese ? "陪伴篇" : "AccompanieD",
			url: "/accompanied",
			icon: HandHeart
		}
	] : [];
	const communityItems = isChallenged && communityOn ? [{
		id: "community-community",
		title: isChinese ? "社区" : "Community",
		url: "/community",
		icon: Newspaper
	}] : [];
	const visible = (arr) => arr.filter((t) => !prefs.hidden.includes(t.id));
	const renderToolButton = (tool) => {
		const cls = "flex flex-col items-center justify-start gap-1.5 p-2 rounded-xl hover:bg-accent transition-colors text-center min-h-[72px]";
		const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-id": "components/layout/MobileBottomBar/inner/div/0",
			"data-inspector-source": "components/layout/MobileBottomBar.tsx:211:9:d468a0d41d4d0af45d2dc6d2237b1f815e63af933d0345b54d3151b069352f78:1",
			className: "h-10 w-10 rounded-xl bg-accent/60 flex items-center justify-center text-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(tool.icon, { className: "h-5 w-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"data-inspector-id": "components/layout/MobileBottomBar/inner/span/0",
			"data-inspector-source": "components/layout/MobileBottomBar.tsx:214:9:af58d9d9c6d961084507e5409bdc9a6777db0f0a882ba12d37ece6a74d25a16a:1",
			className: "text-[10px] leading-tight line-clamp-2",
			children: tool.title
		})] });
		if (tool.onClick) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			"data-inspector-id": "components/layout/MobileBottomBar/renderToolButton/button/0",
			"data-inspector-source": "components/layout/MobileBottomBar.tsx:219:9:ccb222e51c32a8db195e515b289db58da995f40fb4a3362104f225a4af34b77c:1",
			type: "button",
			onClick: () => {
				setOpen(false);
				tool.onClick();
			},
			className: cls,
			children: inner
		}, tool.id);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
			"data-inspector-id": "components/layout/MobileBottomBar/renderToolButton/Link/0",
			"data-inspector-source": "components/layout/MobileBottomBar.tsx:225:7:8a2fc965eddab738d9e7e7b9e07ecc94f4966a36465d9ad1550bfab22bb16c2e:1",
			to: tool.url,
			onClick: () => setOpen(false),
			className: cls,
			children: inner
		}, tool.id);
	};
	const findActive = findTab === "care" ? visible(findCareItems) : visible(findWorkItems);
	const allGroups = [
		{
			id: "daily",
			label: isChinese ? "日常照护" : "Daily Care",
			items: dailyCareItems
		},
		{
			id: "resources",
			label: isChinese ? "资源与帮助" : "Resources & Help",
			items: resourceItems
		},
		{
			id: "find-care",
			label: isChinese ? "寻找护理服务" : "Find Care",
			items: findCareItems
		},
		{
			id: "find-work",
			label: isChinese ? "寻找护理工作" : "Find Work",
			items: findWorkItems
		},
		{
			id: "community",
			label: isChinese ? "社区" : "Community",
			items: communityItems
		}
	].filter((g) => g.items.length > 0);
	const togglePref = (id, show) => {
		setPrefs((prev) => {
			const next = {
				...prev,
				hidden: show ? prev.hidden.filter((x) => x !== id) : Array.from(/* @__PURE__ */ new Set([...prev.hidden, id]))
			};
			savePrefs(next);
			return next;
		});
	};
	const setDefaultTab = (tab) => {
		setPrefs((prev) => {
			const next = {
				...prev,
				defaultFindTab: tab
			};
			savePrefs(next);
			return next;
		});
	};
	if (!isAuthenticated || location.pathname === "/") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/nav/0",
			"data-inspector-source": "components/layout/MobileBottomBar.tsx:268:7:454a0e0b9130c35dea6f07c454e50466616a311112bb667fcc02129864ba8ca1:1",
			"data-bottom-nav": true,
			className: "fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex items-center justify-around h-14 px-1",
			children: [items.map((item) => {
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NavLink, {
					"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/NavLink/0",
					"data-inspector-source": "components/layout/MobileBottomBar.tsx:271:13:d486dbf7a039ace3d44aa3733ad720d2006c39669e28ea0298b2b90890d97997:1",
					to: item.url,
					end: item.url === "/dashboard",
					className: "relative flex flex-col items-center gap-0.5 px-2 py-1 text-muted-foreground transition-colors min-w-0",
					activeClassName: "text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/0",
						"data-inspector-source": "components/layout/MobileBottomBar.tsx:278:15:c0f4cd389b3df51cc6404c9c96ad7dfe256f2b81a879f3e9e75e6657edbe69ad:1",
						className: "relative",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-5 w-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/span/0",
						"data-inspector-source": "components/layout/MobileBottomBar.tsx:281:15:fbe399e96e141ee3ce9810e5495eeb3f61cf2ca4bbf601f09dfe8b7aa4f4e790:1",
						className: "text-[11px] leading-tight truncate",
						children: item.title
					})]
				}, item.url);
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/button/0",
						"data-inspector-source": "components/layout/MobileBottomBar.tsx:288:13:a3b579ee303d0cab98ee81bdba245eb3089583d5c87a311fe484ba754cd07fc0:1",
						type: "button",
						className: `relative flex flex-col items-center gap-0.5 px-2 py-1 transition-colors min-w-0 ${moreActive ? "text-primary" : "text-muted-foreground"}`,
						"aria-label": moreLabel,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, {
							"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/LayoutGrid/0",
							"data-inspector-source": "components/layout/MobileBottomBar.tsx:295:15:22bc3194c5d64ea2176ec01b76e8742037e6519929d9e8bfc46447b977bad3c0:1",
							className: "h-5 w-5"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/span/1",
							"data-inspector-source": "components/layout/MobileBottomBar.tsx:296:15:18443bc4a3725e709aa5a935fd88207df27b7531d35ef937149bc6266dda19f7:1",
							className: "text-[10px] leading-tight truncate",
							children: moreLabel
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					onInteractOutside: (e) => {
						if (e.target.closest("[data-bottom-nav]")) e.preventDefault();
					},
					className: "fixed inset-x-0 bottom-14 z-50 rounded-t-2xl bg-background shadow-lg border-t max-h-[75vh] overflow-y-auto p-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/1",
						"data-inspector-source": "components/layout/MobileBottomBar.tsx:307:15:79ea62749df853f47e5a6e7655e273a4820afce9729ee03a0f3760c3cd6fab1a:1",
						className: "flex items-center justify-between p-4 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-base font-semibold",
							children: moreLabel
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/button/1",
							"data-inspector-source": "components/layout/MobileBottomBar.tsx:311:17:ca904882b6631c4b370d8cd02a036b03f523c6fcaa909d06b9d5911eb6cf0c5e:1",
							type: "button",
							onClick: () => setCustomizeOpen(true),
							className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
								"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/Settings2/0",
								"data-inspector-source": "components/layout/MobileBottomBar.tsx:316:19:4c7e81e86ac45ebb28014e09bc50f533522b340eca540114251a661ec30dd2c7:1",
								className: "h-3.5 w-3.5"
							}), isChinese ? "自定义" : "Customize"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/2",
						"data-inspector-source": "components/layout/MobileBottomBar.tsx:321:15:f113b9dc349cc57affb626bb6b9564d878369702e0b77b53dfd6d1444432a991:1",
						className: "px-4 pb-6 space-y-5",
						children: [
							visible(dailyCareItems).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/3",
								"data-inspector-source": "components/layout/MobileBottomBar.tsx:324:19:1bc93ee7afa00675b5eaacf65fb77591ecc6a1e0b98a66b196f925023f85861e:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/h3/0",
									"data-inspector-source": "components/layout/MobileBottomBar.tsx:325:21:6ce52ef887c00a5e5622e1226eea0a7b1ee5e0bb47bf016cda3b37aa2c54a485:1",
									className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1",
									children: isChinese ? "日常照护" : "Daily Care"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/4",
									"data-inspector-source": "components/layout/MobileBottomBar.tsx:328:21:a3344eab25caf90d8a4273904275ee399cc3c34175f6760e1380312785ed48a1:1",
									className: "grid grid-cols-4 gap-2",
									children: visible(dailyCareItems).map(renderToolButton)
								})]
							}),
							visible(resourceItems).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/5",
								"data-inspector-source": "components/layout/MobileBottomBar.tsx:336:19:1bc93ee7afa00675b5eaacf65fb77591ecc6a1e0b98a66b196f925023f85861e:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/h3/1",
									"data-inspector-source": "components/layout/MobileBottomBar.tsx:337:21:6ce52ef887c00a5e5622e1226eea0a7b1ee5e0bb47bf016cda3b37aa2c54a485:1",
									className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1",
									children: isChinese ? "资源与帮助" : "Resources & Help"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/6",
									"data-inspector-source": "components/layout/MobileBottomBar.tsx:340:21:a3344eab25caf90d8a4273904275ee399cc3c34175f6760e1380312785ed48a1:1",
									className: "grid grid-cols-4 gap-2",
									children: visible(resourceItems).map(renderToolButton)
								})]
							}),
							(visible(findCareItems).length > 0 || visible(findWorkItems).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/7",
								"data-inspector-source": "components/layout/MobileBottomBar.tsx:348:19:1bc93ee7afa00675b5eaacf65fb77591ecc6a1e0b98a66b196f925023f85861e:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/8",
									"data-inspector-source": "components/layout/MobileBottomBar.tsx:349:21:dc83eddfc3c93701148ea6dda0d56186dc4ebf98528b7e0800c86a41b1018a82:1",
									className: "flex items-center gap-1 mb-3 p-1 bg-muted/60 rounded-xl",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/button/2",
										"data-inspector-source": "components/layout/MobileBottomBar.tsx:350:23:0501e81826713a1d9dd4f9fc3372c18d73062b22bc5a35370b4beb11fedbcd39:1",
										type: "button",
										onClick: () => setFindTab("care"),
										className: `flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${findTab === "care" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`,
										children: isChinese ? "寻找护理服务" : "Find Care"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/button/3",
										"data-inspector-source": "components/layout/MobileBottomBar.tsx:359:23:0501e81826713a1d9dd4f9fc3372c18d73062b22bc5a35370b4beb11fedbcd39:1",
										type: "button",
										onClick: () => setFindTab("work"),
										className: `flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${findTab === "work" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`,
										children: isChinese ? "寻找护理工作" : "Find Work"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/9",
									"data-inspector-source": "components/layout/MobileBottomBar.tsx:369:21:a3344eab25caf90d8a4273904275ee399cc3c34175f6760e1380312785ed48a1:1",
									className: "grid grid-cols-4 gap-2",
									children: findActive.map(renderToolButton)
								})]
							}),
							visible(communityItems).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/10",
								"data-inspector-source": "components/layout/MobileBottomBar.tsx:377:19:1bc93ee7afa00675b5eaacf65fb77591ecc6a1e0b98a66b196f925023f85861e:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/h3/2",
									"data-inspector-source": "components/layout/MobileBottomBar.tsx:378:21:6ce52ef887c00a5e5622e1226eea0a7b1ee5e0bb47bf016cda3b37aa2c54a485:1",
									className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1",
									children: isChinese ? "社区" : "Community"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/11",
									"data-inspector-source": "components/layout/MobileBottomBar.tsx:381:21:a3344eab25caf90d8a4273904275ee399cc3c34175f6760e1380312785ed48a1:1",
									className: "grid grid-cols-4 gap-2",
									children: visible(communityItems).map(renderToolButton)
								})]
							})
						]
					})]
				}) })]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: customizeOpen,
			onOpenChange: setCustomizeOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-[60] bg-black/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "fixed inset-x-0 bottom-0 z-[60] rounded-t-2xl bg-background shadow-2xl border-t max-h-[85vh] overflow-y-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/12",
					"data-inspector-source": "components/layout/MobileBottomBar.tsx:397:13:54e33dd70452a1cb849307f577f32be7e82f1a7940aa2049d46b9e7bd108c15c:1",
					className: "p-4 border-b",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "text-base font-semibold",
						children: isChinese ? "自定义工具" : "Customize Tools"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/p/0",
						"data-inspector-source": "components/layout/MobileBottomBar.tsx:401:15:6c0a1513abf0393bb6cec2e8afbf23ee5c5fdefaecc636e8ffbb567960e9c419:1",
						className: "text-xs text-muted-foreground mt-1",
						children: isChinese ? "选择要显示的项目；在分组右侧勾选默认显示" : "Pick which items show; mark default with the checkbox"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/13",
					"data-inspector-source": "components/layout/MobileBottomBar.tsx:406:13:dbb79e81d179ca372f0d4b187a81cb84cbfa22bdf2623826774284d71c319ed2:1",
					className: "p-4 space-y-5",
					children: allGroups.map((g) => {
						const isFindCare = g.id === "find-care";
						const isFindWork = g.id === "find-work";
						const isFindGroup = isFindCare || isFindWork;
						const isDefault = isFindCare && prefs.defaultFindTab === "care" || isFindWork && prefs.defaultFindTab === "work";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/14",
							"data-inspector-source": "components/layout/MobileBottomBar.tsx:416:19:c3055802c730e3d70158c3fc44673abdd402f528eda6a16cee5e109c8eaee68b:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/15",
								"data-inspector-source": "components/layout/MobileBottomBar.tsx:417:21:8d27fec7c785dfe0f2482556e4feb0f248aaaebcb975fad3c64bb72d2fcd2e81:1",
								className: "flex items-center justify-between mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/h3/3",
									"data-inspector-source": "components/layout/MobileBottomBar.tsx:418:23:df3b172cbb384fb38ec8bcdfceb2430473ba5aba0e5d407dd7a2c09c7781f90d:1",
									className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide",
									children: g.label
								}), isFindGroup && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/button/4",
									"data-inspector-source": "components/layout/MobileBottomBar.tsx:422:25:bd14c58dec5b3fe07c94bdbfdaeddcc281a0be3d696ffbf25044f010329e2cc4:1",
									type: "button",
									onClick: () => setDefaultTab(isFindCare ? "care" : "work"),
									className: `flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors ${isDefault ? "bg-primary/10 text-primary border-primary/40" : "bg-card text-muted-foreground border-border hover:text-foreground"}`,
									"aria-pressed": isDefault,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/span/2",
										"data-inspector-source": "components/layout/MobileBottomBar.tsx:432:27:8b39de7b20b82b553931b4b26f96355b56b52fbaba741df59ce5b77f6958f02e:1",
										className: `inline-flex h-3.5 w-3.5 items-center justify-center rounded-xs border ${isDefault ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/50"}`,
										children: isDefault && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/span/3",
											"data-inspector-source": "components/layout/MobileBottomBar.tsx:437:43:f4ca7822ae31bfdef48bdcf87547e1eb42fa994361657c22994d745683ef90c7:1",
											className: "text-[10px] leading-none",
											children: "✓"
										})
									}), isChinese ? "设为默认" : "Set default"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/16",
								"data-inspector-source": "components/layout/MobileBottomBar.tsx:443:21:7797cf625e2a6da5c13ad2e5d24962cf5996f825e6686aafdbff036a8ac646a3:1",
								className: "space-y-2",
								children: g.items.map((t) => {
									const shown = !prefs.hidden.includes(t.id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/17",
										"data-inspector-source": "components/layout/MobileBottomBar.tsx:447:27:983b4feb896ffb9f4baa0525a433bb50aeaeb4c141bac36d22cbd9fd8c97b66c:1",
										className: "flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/div/18",
											"data-inspector-source": "components/layout/MobileBottomBar.tsx:448:29:8789731352fc158815f81d7eefb118860ef2e83922f86fe5172bc45d02221c1a:1",
											className: "flex items-center gap-2 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "h-4 w-4 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/span/4",
												"data-inspector-source": "components/layout/MobileBottomBar.tsx:450:31:0f8b5c7b892f1d5a8ca17ccd4c51722091aac2fdd775ad6367f0cf36c54365ed:1",
												className: "text-sm truncate",
												children: t.title
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/Switch/0",
											"data-inspector-source": "components/layout/MobileBottomBar.tsx:452:29:3508f89820e9883ffbd2dea98c41f3f27e3cc63511fe592655b8dcc5ce7f8376:1",
											checked: shown,
											onCheckedChange: (v) => togglePref(t.id, v)
										})]
									}, t.id);
								})
							})]
						}, g.id);
					})
				})]
			})] })
		}),
		isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/button/5",
			"data-inspector-source": "components/layout/MobileBottomBar.tsx:467:11:8c368e75324f39218072cbe2158a018716f2db9df494990d6585f50bfb5db9fb:1",
			type: "button",
			onClick: () => openAssistant(),
			"aria-label": isChinese ? "AI 助手" : "AI Assistant",
			className: "fixed right-4 bottom-[8rem] z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, {
				"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/Bot/0",
				"data-inspector-source": "components/layout/MobileBottomBar.tsx:473:13:4ab07bdac19fee5888a0943b3b3aa7677c0b5c7d615996cbd8644268098bae92:1",
				className: "h-5 w-5"
			})
		}), showHelpBubble && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/button/6",
			"data-inspector-source": "components/layout/MobileBottomBar.tsx:476:13:a3b579ee303d0cab98ee81bdba245eb3089583d5c87a311fe484ba754cd07fc0:1",
			type: "button",
			onClick: openHelp,
			"aria-label": isChinese ? "使用帮助" : "App guide",
			className: "fixed right-4 bottom-[4.75rem] z-40 h-12 w-12 rounded-full bg-card border text-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, {
				"data-inspector-id": "components/layout/MobileBottomBar/MobileBottomBar/HelpCircle/0",
				"data-inspector-source": "components/layout/MobileBottomBar.tsx:482:15:eecbd3bace04b2a6b4dca1e3c818ac17d324367f8152bc2442e9ce78e7460cb9:1",
				className: "h-5 w-5"
			})
		})] })
	] });
}
function AppLayout({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/layout/AppLayout/AppLayout/div/0",
		"data-inspector-source": "components/layout/AppLayout.tsx:11:5:f2fa8a3d6bf9a4eb42a5218ac65976085f39600da1ad6fb9a978de2f3f2f64cb:1",
		className: "min-h-dvh flex flex-col w-full overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
				"data-inspector-id": "components/layout/AppLayout/AppLayout/AppHeader/0",
				"data-inspector-source": "components/layout/AppLayout.tsx:12:9:80f966c308ac7e3b82afba1459d60af22ede2ffb1e426c72795ea95dc94f2c2c:1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				"data-inspector-id": "components/layout/AppLayout/AppLayout/main/0",
				"data-inspector-source": "components/layout/AppLayout.tsx:14:9:792044fc6e58a3d983509c639f59f9fe8cefe02e24d2622807ce5eb9b3c840d8:1",
				className: "flex-1 overflow-x-hidden pb-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "components/layout/AppLayout/AppLayout/div/1",
					"data-inspector-source": "components/layout/AppLayout.tsx:15:11:bd92afd379c3705871e68e722147e8e76378ead5a31008a18c1d8aa00d608b07:1",
					className: "mx-auto w-full max-w-6xl px-4 pt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageBackButton, {
						"data-inspector-id": "components/layout/AppLayout/AppLayout/PageBackButton/0",
						"data-inspector-source": "components/layout/AppLayout.tsx:16:13:53efa9ac8615146a5c7706e44609366494eaf3597224590ce179a86779746ef1:1"
					})
				}), children]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileBottomBar, {
				"data-inspector-id": "components/layout/AppLayout/AppLayout/MobileBottomBar/0",
				"data-inspector-source": "components/layout/AppLayout.tsx:20:9:049941712339b15a3433e85e839cb4d9984a021c3bd3a57e7df9c085116dca86:1"
			})
		]
	});
}
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message: describeThrown(error),
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var MAX_SERIALIZED_LENGTH = 2e3;
function describeThrown(error) {
	if (error instanceof Response) return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	const { message } = error ?? {};
	if (typeof message === "string" && message.length > 0) return message;
	try {
		return JSON.stringify(error)?.slice(0, MAX_SERIALIZED_LENGTH) ?? String(error);
	} catch {
		return String(error);
	}
}
var ReadWriteInspector = lazyRetry(() => import("./ReadWriteInspector-CWYmHV79.mjs"), "ReadWriteInspector");
/** Loads the read/write inspector only for the signed-in researcher account. */
function InspectorGate() {
	const [researcher, setResearcher] = (0, import_react.useState)(isResearcherAccount());
	const [opened, setOpened] = (0, import_react.useState)(inspectModeOn());
	(0, import_react.useEffect)(() => {
		const inside = (n) => n instanceof Element && !!n.closest("[data-rw-inspector]");
		const guard = (e) => {
			const rel = e.relatedTarget ?? null;
			if (inside(e.target) || e.type === "focusout" && inside(rel)) e.stopImmediatePropagation();
		};
		const evs = [
			"pointerdown",
			"mousedown",
			"touchstart",
			"focusin",
			"focusout"
		];
		evs.forEach((ev) => document.addEventListener(ev, guard));
		return () => evs.forEach((ev) => document.removeEventListener(ev, guard));
	}, []);
	(0, import_react.useEffect)(() => {
		let session = "";
		const check = () => {
			const allowed = isResearcherAccount();
			const next = allowed ? getWPToken() || "" : "";
			setResearcher(allowed);
			if (next === session) return;
			session = next;
			inspectorNotesCache.reset();
			if (!allowed) setOpened(false);
		};
		check();
		const t = setInterval(check, 2e3);
		window.addEventListener("storage", check);
		return () => {
			clearInterval(t);
			window.removeEventListener("storage", check);
			inspectorNotesCache.reset();
		};
	}, []);
	if (!researcher) return null;
	if (!opened) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "components/inspector/InspectorGate/InspectorGate/div/0",
		"data-inspector-source": "components/inspector/InspectorGate.tsx:45:23:df9762a01ebb3a8a009b3b7fd435f2a41527785f8d7ac403b600581bb4071644:1",
		"data-rw-inspector": true,
		className: "fixed right-2 top-16 z-[9999]",
		style: { pointerEvents: "auto" },
		onPointerDown: (e) => e.stopPropagation(),
		onMouseDown: (e) => e.stopPropagation(),
		onTouchStart: (e) => e.stopPropagation(),
		onFocus: (e) => e.stopPropagation(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			"data-inspector-id": "components/inspector/InspectorGate/InspectorGate/Button/0",
			"data-inspector-source": "components/inspector/InspectorGate.tsx:47:5:b000b44c73d9afce69927dd6fb353fa174505b02133932fcd1453de989bffecf:1",
			size: "sm",
			variant: "outline",
			className: "bg-background",
			onClick: () => {
				setInspectMode(true);
				setOpened(true);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanSearch, {
				"data-inspector-id": "components/inspector/InspectorGate/InspectorGate/ScanSearch/0",
				"data-inspector-source": "components/inspector/InspectorGate.tsx:48:7:933b40ce07616b969751e2d9f03068983421d1c79246d65a5727f1eea1fccf98:1",
				className: "mr-1 h-3 w-3"
			}), "读写核对 / Inspect"]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		"data-inspector-id": "components/inspector/InspectorGate/InspectorGate/Suspense/0",
		"data-inspector-source": "components/inspector/InspectorGate.tsx:51:10:79fe9e0586985c865982ebec127f996ffa76a5ec268037f20e28820239098e4f:1",
		fallback: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadWriteInspector, {
			"data-inspector-id": "components/inspector/InspectorGate/InspectorGate/ReadWriteInspector/0",
			"data-inspector-source": "components/inspector/InspectorGate.tsx:51:36:79fe9e0586985c865982ebec127f996ffa76a5ec268037f20e28820239098e4f:1"
		})
	});
}
var SafetyApp = lazyRetry(() => import("./SafetyApp-_aYRwCbc.mjs"), "SafetyApp");
var EsmApp = lazyRetry(() => import("./EsmApp-CW9M8mi7.mjs"), "EsmApp");
var ResearcherApp = lazyRetry(() => import("./ResearcherApp-BjylCTd0.mjs"), "ResearcherApp");
var ConsentApp = lazyRetry(() => import("./ConsentApp-D4WS2lFG.mjs"), "ConsentApp");
var SickApp = lazyRetry(() => import("./SickApp-Izy4ahRd.mjs"), "SickApp");
var FAVICON_BOOTSTRAP = `(function () {
  try {
    var host = location.host, hostname = location.hostname;
    var key = "__site_id:" + host;
    var p = (new URLSearchParams(location.search).get("__site") || "").trim().toLowerCase();
    var map = { "challenged.com": "challenged", "www.challenged.com": "challenged", "carecnc.com": "carecnc", "www.carecnc.com": "carecnc" };
    var slug = p || map[host] || map[hostname] || "";
    if (!slug) { try { slug = sessionStorage.getItem(key) || ""; } catch (e) {} }
    if (slug.indexOf("careconnected") === 0) slug = "carecnc";
    if (slug.indexOf("safety") === 0) slug = "notchsafety";
    var lang = "";
    try { lang = localStorage.getItem("i18nextLng") || ""; } catch (e) {}
    if (!lang) lang = navigator.language || "en";
    var zh = lang.toLowerCase().indexOf("zh") === 0;
    var href;
    if (slug.indexOf("researcher") === 0 || slug.indexOf("esm_survey") === 0 || slug.indexOf("consent") === 0 || slug.indexOf("sick") === 0) href = "/favicon-research.svg";
    else if (slug.indexOf("notchsafety") === 0) href = "/favicon-notchsafety.png";
    else if (slug.indexOf("carecnc") === 0) href = zh ? "/favicon-huchang.png" : "/favicon-carecnc-en.png";
    else href = zh ? "/favicon-yichang.png" : "/favicon-challenged.png";
    ["icon", "apple-touch-icon"].forEach(function (rel) {
      var link = document.createElement("link");
      link.rel = rel;
      link.href = href + "?v=flat-20261011";
      document.head.appendChild(link);
    });
  } catch (e) {}
})();`;
var Route$76 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no"
			},
			{ title: "Family Care & Safety" },
			{
				name: "description",
				content: "Family care, coordination, knowledge and location safety."
			},
			{
				name: "author",
				content: "Family Care & Safety"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			},
			{
				name: "theme-color",
				content: "#1a8a7a"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				property: "og:title",
				content: "Family Care & Safety"
			},
			{
				name: "twitter:title",
				content: "Family Care & Safety"
			},
			{
				property: "og:description",
				content: "Family care, coordination, knowledge and location safety."
			},
			{
				name: "twitter:description",
				content: "Family care, coordination, knowledge and location safety."
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Color+Emoji&display=swap"
			}
		],
		scripts: [{ children: FAVICON_BOOTSTRAP }]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFound,
	errorComponent: RootErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
/**
* Which app runs (care app, NotchSafety, survey, researcher) and in which
* language depends on the browser tab (query flag, stored choice, saved
* language), which the server cannot see. So the server and the first browser
* paint show the same quiet loading screen, and the real app mounts right
* after — no flash of the wrong brand or language.
*/
function useMounted() {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	return mounted;
}
function BootScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-background",
		"aria-busy": "true"
	});
}
function SiteRouter() {
	const site = useSite();
	useApplyDisplaySettings();
	if (site.id === "notchsafety") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SafetyApp, {});
	if (site.id === "researcher") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResearcherApp, {});
	if (site.id === "esm_survey") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EsmApp, {});
	if (site.id === "consent") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConsentApp, {});
	if (site.id === "sick") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SickApp, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) });
}
function RootComponent() {
	const { queryClient } = Route$76.useRouteContext();
	const mounted = useMounted();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(z, {
		attribute: "class",
		forcedTheme: "light",
		enableSystem: false,
		disableTransitionOnChange: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
			client: queryClient,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$2, {}), mounted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteProvider, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationSharingAgent, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorGate, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AIAssistantProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
					fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {}),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteRouter, {})
				}) })
			] }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {})] })
		})
	});
}
function RootErrorComponent({ error, reset }) {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		console.error(error);
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh flex items-center justify-center bg-background text-foreground p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md w-full text-center space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Something went wrong on our end. You can try again or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 justify-center flex-wrap",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "px-4 py-2 rounded-md bg-primary text-primary-foreground",
						onClick: () => {
							router.invalidate();
							reset();
						},
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "px-4 py-2 rounded-md border border-border bg-background",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var $$splitComponentImporter$72 = /* @__PURE__ */ __name$1(() => import("./routes-C0vvQALI.mjs"), "$$splitComponentImporter");
var Route$75 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "ChallengeD · Family Care & Safety" },
		{
			name: "description",
			content: "Family care knowledge, shared care coordination, and location safety."
		},
		{
			property: "og:title",
			content: "ChallengeD · Family Care & Safety"
		},
		{
			property: "og:description",
			content: "Family care knowledge, shared care coordination, and location safety."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$72, "component")
});
var $$splitComponentImporter$71 = /* @__PURE__ */ __name$1(() => import("../_-DZeF-Zij.mjs"), "$$splitComponentImporter");
var Route$74 = createFileRoute("/$")({ component: lazyRouteComponent($$splitComponentImporter$71, "component") });
var $$splitComponentImporter$70 = /* @__PURE__ */ __name$1(() => import("./ai-CE9HbYA8.mjs"), "$$splitComponentImporter");
var Route$73 = createFileRoute("/ai")({ component: lazyRouteComponent($$splitComponentImporter$70, "component") });
var $$splitComponentImporter$69 = /* @__PURE__ */ __name$1(() => import("./ai-companion-uoJVpFH7.mjs"), "$$splitComponentImporter");
var Route$72 = createFileRoute("/ai-companion")({ component: lazyRouteComponent($$splitComponentImporter$69, "component") });
var $$splitComponentImporter$68 = /* @__PURE__ */ __name$1(() => import("./appointments-9P_QD7wC.mjs"), "$$splitComponentImporter");
var Route$71 = createFileRoute("/appointments")({ component: lazyRouteComponent($$splitComponentImporter$68, "component") });
var $$splitComponentImporter$67 = /* @__PURE__ */ __name$1(() => import("./assistant-thc3j8aM.mjs"), "$$splitComponentImporter");
var Route$70 = createFileRoute("/assistant")({ component: lazyRouteComponent($$splitComponentImporter$67, "component") });
var $$splitComponentImporter$66 = /* @__PURE__ */ __name$1(() => import("./auth-BdFstnlb.mjs"), "$$splitComponentImporter");
var Route$69 = createFileRoute("/auth")({ component: lazyRouteComponent($$splitComponentImporter$66, "component") });
var $$splitComponentImporter$65 = /* @__PURE__ */ __name$1(() => import("./become-caregiver-D4-H_AbZ.mjs"), "$$splitComponentImporter");
var Route$68 = createFileRoute("/become-caregiver")({ component: lazyRouteComponent($$splitComponentImporter$65, "component") });
var $$splitComponentImporter$64 = /* @__PURE__ */ __name$1(() => import("./bookings-CQk7H5Ec.mjs"), "$$splitComponentImporter");
var Route$67 = createFileRoute("/bookings")({ component: lazyRouteComponent($$splitComponentImporter$64, "component") });
var $$splitComponentImporter$63 = /* @__PURE__ */ __name$1(() => import("./brand-compare-BHE1_jd7.mjs"), "$$splitComponentImporter");
var Route$66 = createFileRoute("/brand-compare")({ component: lazyRouteComponent($$splitComponentImporter$63, "component") });
var $$splitComponentImporter$62 = /* @__PURE__ */ __name$1(() => import("./calendar-y-PPKeaT.mjs"), "$$splitComponentImporter");
var Route$65 = createFileRoute("/calendar")({ component: lazyRouteComponent($$splitComponentImporter$62, "component") });
var $$splitComponentImporter$61 = /* @__PURE__ */ __name$1(() => import("./care-circle-DGT9jH2l.mjs"), "$$splitComponentImporter");
var Route$64 = createFileRoute("/care-circle")({ component: lazyRouteComponent($$splitComponentImporter$61, "component") });
var $$splitComponentImporter$60 = /* @__PURE__ */ __name$1(() => import("./caregiver-setting-BQvMh15L.mjs"), "$$splitComponentImporter");
var Route$63 = createFileRoute("/caregiver-setting")({ component: lazyRouteComponent($$splitComponentImporter$60, "component") });
var $$splitComponentImporter$59 = /* @__PURE__ */ __name$1(() => import("./cart-BOb670pB.mjs"), "$$splitComponentImporter");
var Route$62 = createFileRoute("/cart")({ component: lazyRouteComponent($$splitComponentImporter$59, "component") });
var $$splitComponentImporter$58 = /* @__PURE__ */ __name$1(() => import("./chat-Vpbo-Ds7.mjs"), "$$splitComponentImporter");
var Route$61 = createFileRoute("/chat")({ component: lazyRouteComponent($$splitComponentImporter$58, "component") });
var $$splitComponentImporter$57 = /* @__PURE__ */ __name$1(() => import("./check-ins-2yCVCBtZ.mjs"), "$$splitComponentImporter");
var Route$60 = createFileRoute("/check-ins")({ component: lazyRouteComponent($$splitComponentImporter$57, "component") });
var $$splitComponentImporter$56 = /* @__PURE__ */ __name$1(() => import("./checkin-D3ewNrJO.mjs"), "$$splitComponentImporter");
var Route$59 = createFileRoute("/checkin")({ component: lazyRouteComponent($$splitComponentImporter$56, "component") });
var $$splitComponentImporter$55 = /* @__PURE__ */ __name$1(() => import("./companion-D_AxK5Rb.mjs"), "$$splitComponentImporter");
var Route$58 = createFileRoute("/companion")({ component: lazyRouteComponent($$splitComponentImporter$55, "component") });
var $$splitComponentImporter$54 = /* @__PURE__ */ __name$1(() => import("./dashboard-CGRfKSTE.mjs"), "$$splitComponentImporter");
var Route$57 = createFileRoute("/dashboard")({
	head: () => ({ meta: [
		{ title: "Care Dashboard · Family Care" },
		{
			name: "description",
			content: "Your family care schedules, tasks and unread inbox summary."
		},
		{
			property: "og:title",
			content: "Care Dashboard · Family Care"
		},
		{
			property: "og:description",
			content: "Your family care schedules, tasks and unread inbox summary."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$54, "component")
});
var $$splitComponentImporter$53 = /* @__PURE__ */ __name$1(() => import("./delete-after-read-CrkxRhHn.mjs"), "$$splitComponentImporter");
var Route$56 = createFileRoute("/delete-after-read")({ component: lazyRouteComponent($$splitComponentImporter$53, "component") });
var $$splitComponentImporter$52 = /* @__PURE__ */ __name$1(() => import("./documents-D3XXMh-x.mjs"), "$$splitComponentImporter");
var Route$55 = createFileRoute("/documents")({ component: lazyRouteComponent($$splitComponentImporter$52, "component") });
var $$splitComponentImporter$51 = /* @__PURE__ */ __name$1(() => import("./favorite-caregiver-DqkzWgHo.mjs"), "$$splitComponentImporter");
var Route$54 = createFileRoute("/favorite-caregiver")({ component: lazyRouteComponent($$splitComponentImporter$51, "component") });
var $$splitComponentImporter$50 = /* @__PURE__ */ __name$1(() => import("./find-BUUZ-5mR.mjs"), "$$splitComponentImporter");
var Route$53 = createFileRoute("/find")({ component: lazyRouteComponent($$splitComponentImporter$50, "component") });
var $$splitComponentImporter$49 = /* @__PURE__ */ __name$1(() => import("./get-started-BMLOr8cA.mjs"), "$$splitComponentImporter");
var Route$52 = createFileRoute("/get-started")({ component: lazyRouteComponent($$splitComponentImporter$49, "component") });
var $$splitComponentImporter$48 = /* @__PURE__ */ __name$1(() => import("./help-CBhr64U6.mjs"), "$$splitComponentImporter");
var Route$51 = createFileRoute("/help")({ component: lazyRouteComponent($$splitComponentImporter$48, "component") });
var $$splitComponentImporter$47 = /* @__PURE__ */ __name$1(() => import("./how-it-works-DDHgzWSM.mjs"), "$$splitComponentImporter");
var Route$50 = createFileRoute("/how-it-works")({ component: lazyRouteComponent($$splitComponentImporter$47, "component") });
var $$splitComponentImporter$46 = /* @__PURE__ */ __name$1(() => import("./inbox-CwkNYAG7.mjs"), "$$splitComponentImporter");
var Route$49 = createFileRoute("/inbox")({
	head: () => ({ meta: [
		{ title: "Inbox · Family Care" },
		{
			name: "description",
			content: "Your care messages, notifications and unread items."
		},
		{
			property: "og:title",
			content: "Inbox · Family Care"
		},
		{
			property: "og:description",
			content: "Your care messages, notifications and unread items."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$46, "component")
});
var $$splitComponentImporter$45 = /* @__PURE__ */ __name$1(() => import("./learn-CQsNAP1f.mjs"), "$$splitComponentImporter");
var Route$48 = createFileRoute("/learn")({ component: lazyRouteComponent($$splitComponentImporter$45, "component") });
var $$splitComponentImporter$44 = /* @__PURE__ */ __name$1(() => import("./medicine-BbriYeGB.mjs"), "$$splitComponentImporter");
var Route$47 = createFileRoute("/medicine")({ component: lazyRouteComponent($$splitComponentImporter$44, "component") });
var $$splitComponentImporter$43 = /* @__PURE__ */ __name$1(() => import("./messages-CPJo-e6w.mjs"), "$$splitComponentImporter");
var Route$46 = createFileRoute("/messages")({ component: lazyRouteComponent($$splitComponentImporter$43, "component") });
var $$splitComponentImporter$42 = /* @__PURE__ */ __name$1(() => import("./notifications-COh7Uose.mjs"), "$$splitComponentImporter");
var Route$45 = createFileRoute("/notifications")({ component: lazyRouteComponent($$splitComponentImporter$42, "component") });
var $$splitComponentImporter$41 = /* @__PURE__ */ __name$1(() => import("./onboarding-CuPR5w5i.mjs"), "$$splitComponentImporter");
var Route$44 = createFileRoute("/onboarding")({ component: lazyRouteComponent($$splitComponentImporter$41, "component") });
var $$splitComponentImporter$40 = /* @__PURE__ */ __name$1(() => import("./order-confirmation-qtIlnGan.mjs"), "$$splitComponentImporter");
var Route$43 = createFileRoute("/order-confirmation")({ component: lazyRouteComponent($$splitComponentImporter$40, "component") });
var $$splitComponentImporter$39 = /* @__PURE__ */ __name$1(() => import("./places-DbqtUGaE.mjs"), "$$splitComponentImporter");
var Route$42 = createFileRoute("/places")({ component: lazyRouteComponent($$splitComponentImporter$39, "component") });
var $$splitComponentImporter$38 = /* @__PURE__ */ __name$1(() => import("./profile-BDyWWzPO.mjs"), "$$splitComponentImporter");
var Route$41 = createFileRoute("/profile")({ component: lazyRouteComponent($$splitComponentImporter$38, "component") });
var $$splitComponentImporter$37 = /* @__PURE__ */ __name$1(() => import("./reset-password-B9wxDAAZ.mjs"), "$$splitComponentImporter");
var Route$40 = createFileRoute("/reset-password")({ component: lazyRouteComponent($$splitComponentImporter$37, "component") });
var $$splitComponentImporter$36 = /* @__PURE__ */ __name$1(() => import("./resources-CipNajAq.mjs"), "$$splitComponentImporter");
var Route$39 = createFileRoute("/resources")({ component: lazyRouteComponent($$splitComponentImporter$36, "component") });
var $$splitComponentImporter$35 = /* @__PURE__ */ __name$1(() => import("./search-Cympk8fL.mjs"), "$$splitComponentImporter");
var Route$38 = createFileRoute("/search")({ component: lazyRouteComponent($$splitComponentImporter$35, "component") });
var $$splitComponentImporter$34 = /* @__PURE__ */ __name$1(() => import("./search-care-facility-CKSjcCZL.mjs"), "$$splitComponentImporter");
var Route$37 = createFileRoute("/search-care-facility")({ component: lazyRouteComponent($$splitComponentImporter$34, "component") });
var $$splitComponentImporter$33 = /* @__PURE__ */ __name$1(() => import("./search-caregiver-B6RsL82S.mjs"), "$$splitComponentImporter");
var Route$36 = createFileRoute("/search-caregiver")({ component: lazyRouteComponent($$splitComponentImporter$33, "component") });
var $$splitComponentImporter$32 = /* @__PURE__ */ __name$1(() => import("./search-local-caregiver-lIeg-alK.mjs"), "$$splitComponentImporter");
var Route$35 = createFileRoute("/search-local-caregiver")({ component: lazyRouteComponent($$splitComponentImporter$32, "component") });
var $$splitComponentImporter$31 = /* @__PURE__ */ __name$1(() => import("./search-remote-caregiver-Cp6ysvcz.mjs"), "$$splitComponentImporter");
var Route$34 = createFileRoute("/search-remote-caregiver")({ component: lazyRouteComponent($$splitComponentImporter$31, "component") });
var $$splitComponentImporter$30 = /* @__PURE__ */ __name$1(() => import("./settings-ZneauF0X.mjs"), "$$splitComponentImporter");
var Route$33 = createFileRoute("/settings")({ component: lazyRouteComponent($$splitComponentImporter$30, "component") });
var $$splitComponentImporter$29 = /* @__PURE__ */ __name$1(() => import("./sync-test-draftbit-BB9hreAK.mjs"), "$$splitComponentImporter");
var Route$32 = createFileRoute("/sync-test-draftbit")({
	head: () => ({ meta: [{ title: "Care Connect — Draftbit Sync Test" }] }),
	component: lazyRouteComponent($$splitComponentImporter$29, "component")
});
var $$splitComponentImporter$28 = /* @__PURE__ */ __name$1(() => import("./tasks-ldZCi_cE.mjs"), "$$splitComponentImporter");
var Route$31 = createFileRoute("/tasks")({ component: lazyRouteComponent($$splitComponentImporter$28, "component") });
var $$splitComponentImporter$27 = /* @__PURE__ */ __name$1(() => import("./trust-safety-CJ7VOgF5.mjs"), "$$splitComponentImporter");
var Route$30 = createFileRoute("/trust-safety")({ component: lazyRouteComponent($$splitComponentImporter$27, "component") });
var $$splitComponentImporter$26 = /* @__PURE__ */ __name$1(() => import("./welcome-BEuA02rc.mjs"), "$$splitComponentImporter");
var Route$29 = createFileRoute("/welcome")({ component: lazyRouteComponent($$splitComponentImporter$26, "component") });
var $$splitComponentImporter$25 = /* @__PURE__ */ __name$1(() => import("./xianyu-listings-DiPcptFD.mjs"), "$$splitComponentImporter");
var Route$28 = createFileRoute("/xianyu-listings")({ component: lazyRouteComponent($$splitComponentImporter$25, "component") });
var $$splitComponentImporter$24 = /* @__PURE__ */ __name$1(() => import("./accompanied-C4zlDJ9M.mjs"), "$$splitComponentImporter");
var Route$27 = createFileRoute("/accompanied/")({ component: lazyRouteComponent($$splitComponentImporter$24, "component") });
var $$splitComponentImporter$23 = /* @__PURE__ */ __name$1(() => import("../_id-B1RMKrnJ.mjs"), "$$splitComponentImporter");
var Route$26 = createFileRoute("/accompanied/$id")({ component: lazyRouteComponent($$splitComponentImporter$23, "component") });
var $$splitComponentImporter$22 = /* @__PURE__ */ __name$1(() => import("./articles-Ut0FN5gu.mjs"), "$$splitComponentImporter");
var Route$25 = createFileRoute("/articles/")({ component: lazyRouteComponent($$splitComponentImporter$22, "component") });
var $$splitComponentImporter$21 = /* @__PURE__ */ __name$1(() => import("../_id-C6ERe8x0.mjs"), "$$splitComponentImporter");
var Route$24 = createFileRoute("/articles/$id")({ component: lazyRouteComponent($$splitComponentImporter$21, "component") });
var $$splitComponentImporter$20 = /* @__PURE__ */ __name$1(() => import("./awared-Bi4kT9WF.mjs"), "$$splitComponentImporter");
var Route$23 = createFileRoute("/awared/")({ component: lazyRouteComponent($$splitComponentImporter$20, "component") });
var $$splitComponentImporter$19 = /* @__PURE__ */ __name$1(() => import("../_id-B9qKhaRv.mjs"), "$$splitComponentImporter");
var Route$22 = createFileRoute("/awared/$id")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = /* @__PURE__ */ __name$1(() => import("./care-circle_._groupId-D569KILK.mjs"), "$$splitComponentImporter");
/**
* A care group's home page — also the one link the group shares.
* No head() here, like /care-circle: signed-out visitors are sent to sign-in
* during the first render, and a head change at that moment crashed the
* sign-in page (blank form).
*/
var Route$21 = createFileRoute("/care-circle_/$groupId")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = /* @__PURE__ */ __name$1(() => import("./cared-ones-CegtZtmJ.mjs"), "$$splitComponentImporter");
var Route$20 = createFileRoute("/cared-ones/")({
	head: () => ({ meta: [
		{ title: "Cared Ones · Family Care" },
		{
			name: "description",
			content: "Your family members and their care tasks and records."
		},
		{
			property: "og:title",
			content: "Cared Ones · Family Care"
		},
		{
			property: "og:description",
			content: "Your family members and their care tasks and records."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = /* @__PURE__ */ __name$1(() => import("./cared-DunQJx4g.mjs"), "$$splitComponentImporter");
var Route$19 = createFileRoute("/cared/")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = /* @__PURE__ */ __name$1(() => import("../_id-5I99Zg4T.mjs"), "$$splitComponentImporter");
var Route$18 = createFileRoute("/cared/$id")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = /* @__PURE__ */ __name$1(() => import("../_id-C-NsNIFs.mjs"), "$$splitComponentImporter");
var Route$17 = createFileRoute("/caregiver/$id")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = /* @__PURE__ */ __name$1(() => import("./community-CYA65_D1.mjs"), "$$splitComponentImporter");
var Route$16 = createFileRoute("/community/")({
	head: () => ({ meta: [
		{ title: "Community · Family Care" },
		{
			name: "description",
			content: "Care community posts and family discussions."
		},
		{
			property: "og:title",
			content: "Community · Family Care"
		},
		{
			property: "og:description",
			content: "Care community posts and family discussions."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = /* @__PURE__ */ __name$1(() => import("../_id-BBU2nDiC.mjs"), "$$splitComponentImporter");
var Route$15 = createFileRoute("/community/$id")({
	head: () => ({ meta: [
		{ title: "Community Discussion · Family Care" },
		{
			name: "description",
			content: "Read a care community post and its discussion."
		},
		{
			property: "og:title",
			content: "Community Discussion · Family Care"
		},
		{
			property: "og:description",
			content: "Read a care community post and its discussion."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = /* @__PURE__ */ __name$1(() => import("./coped-RUsxlpSF.mjs"), "$$splitComponentImporter");
var Route$14 = createFileRoute("/coped/")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = /* @__PURE__ */ __name$1(() => import("../_id-Ci06WLfS.mjs"), "$$splitComponentImporter");
var Route$13 = createFileRoute("/coped/$id")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = /* @__PURE__ */ __name$1(() => import("./new-DI3Rcvgx.mjs"), "$$splitComponentImporter");
var Route$12 = createFileRoute("/facilities/new")({
	head: () => ({ meta: [
		{ title: "Submit care facility | 提交护理场所" },
		{
			name: "description",
			content: "Submit a care facility and an optional ownership application for manual review."
		},
		{
			property: "og:title",
			content: "Submit care facility | 提交护理场所"
		},
		{
			property: "og:description",
			content: "Care-facility directory submissions and ownership applications."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = /* @__PURE__ */ __name$1(() => import("../_id-DHl5r285.mjs"), "$$splitComponentImporter");
var Route$11 = createFileRoute("/facility/$id")({
	head: () => ({ meta: [
		{ title: "Care facility profile | 护理场所资料" },
		{
			name: "description",
			content: "View care-facility services, contact details, reviews and ownership applications."
		},
		{
			property: "og:title",
			content: "Care facility profile | 护理场所资料"
		},
		{
			property: "og:description",
			content: "Care-facility directory details, member roles and reviews."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
/** Older shared address: forwards to the group's one page, /care-circle/<id>. */
var Route$10 = createFileRoute("/group/$groupId")({ beforeLoad: ({ params, location }) => {
	const id = String(params.groupId || "").replace(/\D/g, "");
	const search = location.searchStr ? location.searchStr.startsWith("?") ? location.searchStr : `?${location.searchStr}` : "";
	throw redirect({
		href: id ? `/care-circle/${id}${search}` : "/care-circle",
		replace: true
	});
} });
var $$splitComponentImporter$7 = /* @__PURE__ */ __name$1(() => import("../_code-D0Mws2AS.mjs"), "$$splitComponentImporter");
var Route$9 = createFileRoute("/join/$code")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = /* @__PURE__ */ __name$1(() => import("./safed-DnOnG86l.mjs"), "$$splitComponentImporter");
var Route$8 = createFileRoute("/safed/")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = /* @__PURE__ */ __name$1(() => import("../_id-B8p3nCe3.mjs"), "$$splitComponentImporter");
var Route$7 = createFileRoute("/safed/$id")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = /* @__PURE__ */ __name$1(() => import("./note-BicA6muu.mjs"), "$$splitComponentImporter");
var Route$6 = createFileRoute("/share/note")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var CORS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization, X-WP-Token",
	"Cache-Control": "private, no-store"
};
var input = objectType({
	action: enumType(["list", "speak"]),
	caredOneId: stringType().regex(/^\d+$/).optional(),
	id: stringType().regex(/^\d+$/).optional(),
	text: stringType().trim().min(1).max(2e3).optional()
});
var json = (body, status = 200) => Response.json(body, {
	status,
	headers: CORS
});
var Route$5 = createFileRoute("/api/public/family-voices")({ server: { handlers: {
	OPTIONS: async () => new Response(null, {
		status: 204,
		headers: CORS
	}),
	POST: async ({ request }) => {
		try {
			const parsed = input.safeParse(await request.json().catch(() => null));
			if (!parsed.success) return json({ error: "Invalid request" }, 400);
			const data = parsed.data;
			const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
			const token = request.headers.get("X-WP-Token") || bearer;
			const { verifiedActor, wordpressStore } = await import("./store.server-LsTp-Uay.mjs");
			let actor;
			try {
				actor = await verifiedActor(token);
			} catch {
				return json({ error: "Please sign in" }, 401);
			}
			const store = wordpressStore(processModule.env["WP_ADMIN_USER"] || "", processModule.env["WP_ADMIN_APP_PASSWORD"] || "");
			if (data.action === "list") {
				if (!data.caredOneId) return json({ error: "Cared one is required" }, 400);
				return json({ voices: await store.list(actor.id, data.caredOneId) });
			}
			if (!data.id || !data.text) return json({ error: "Voice and text are required" }, 400);
			const { FAMILY_VOICE_CCT: C, FAMILY_VOICE_STATE: STATE } = await import("../_libs/_24.mjs").then((n) => n.r);
			const { resolveFamilyVoiceModel } = await import("../_libs/_23.mjs").then((n) => n.n);
			const { row } = await store.owned(actor.id, data.id, data.caredOneId);
			const voiceId = String(row[C.fields.voiceId] || "");
			if (!voiceId || row[C.fields.state] !== STATE.ready) return json({ error: "Voice is not ready" }, 409);
			const key = processModule.env["DASHSCOPE_API_KEY"] || "";
			if (!key) return json({ error: "Voice playback is not configured" }, 503);
			const { synthesizeVoice } = await import("../_libs/_35.mjs");
			return json(await synthesizeVoice(key, voiceId, resolveFamilyVoiceModel(String(row[C.fields.model] || "")), data.text));
		} catch (error) {
			return json({ error: error instanceof Error ? error.message : "Request failed" }, 403);
		}
	}
} } });
var $$splitComponentImporter$3 = /* @__PURE__ */ __name$1(() => import("../_personId-R8xcw5c9.mjs"), "$$splitComponentImporter");
var Route$4 = createFileRoute("/cared-ones/$personId/")({
	head: () => ({ meta: [
		{ title: "Family Member Care · Family Care" },
		{
			name: "description",
			content: "Care tasks, schedules and records for your family member."
		},
		{
			property: "og:title",
			content: "Family Member Care · Family Care"
		},
		{
			property: "og:description",
			content: "Care tasks, schedules and records for your family member."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = /* @__PURE__ */ __name$1(() => import("../_card-DIJ7SkEj.mjs"), "$$splitComponentImporter");
var Route$3 = createFileRoute("/cared-ones/$personId/$card")({
	head: ({ params }) => ({ meta: [
		{ title: `${params.card === "family-voice" ? "Family Voices" : params.card === "tasks" ? "Care Tasks" : params.card === "documents" ? "Care Documents" : "Care Tools"} · Family Care` },
		{
			name: "description",
			content: params.card === "family-voice" ? "Record and listen to familiar family voices." : "Manage a family member's care records and tools."
		},
		{
			property: "og:title",
			content: `${params.card === "family-voice" ? "Family Voices" : params.card === "tasks" ? "Care Tasks" : params.card === "documents" ? "Care Documents" : "Care Tools"} · Family Care`
		},
		{
			property: "og:description",
			content: params.card === "family-voice" ? "Record and listen to familiar family voices." : "Manage a family member's care records and tools."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = /* @__PURE__ */ __name$1(() => import("./edit-8Xz49gUT.mjs"), "$$splitComponentImporter");
var Route$2 = createFileRoute("/facilities/$id/edit")({
	head: () => ({ meta: [
		{ title: "Edit care facility | 编辑护理场所" },
		{
			name: "description",
			content: "Edit an existing care facility's directory details."
		},
		{
			property: "og:title",
			content: "Edit care facility | 编辑护理场所"
		},
		{
			property: "og:description",
			content: "Update care-facility contact information and services."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("../_token-BW_p4k9n.mjs");
var Route$1 = createFileRoute("/share/card/$token")({
	head: () => ({ meta: [
		{ title: "Care information card / 护理信息卡" },
		{
			name: "description",
			content: "View a care information card according to its current visibility. 按当前可见范围查看护理信息卡。"
		},
		{
			property: "og:title",
			content: "Care information card / 护理信息卡"
		},
		{
			property: "og:description",
			content: "A shared care information card. Access is determined by the card's current visibility. 护理信息卡按当前可见范围开放。"
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$75.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$76
});
var SplatRoute = Route$74.update({
	id: "/$",
	path: "/$",
	getParentRoute: () => Route$76
});
var AiRoute = Route$73.update({
	id: "/ai",
	path: "/ai",
	getParentRoute: () => Route$76
});
var AiCompanionRoute = Route$72.update({
	id: "/ai-companion",
	path: "/ai-companion",
	getParentRoute: () => Route$76
});
var AppointmentsRoute = Route$71.update({
	id: "/appointments",
	path: "/appointments",
	getParentRoute: () => Route$76
});
var AssistantRoute = Route$70.update({
	id: "/assistant",
	path: "/assistant",
	getParentRoute: () => Route$76
});
var AuthRoute = Route$69.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$76
});
var BecomeCaregiverRoute = Route$68.update({
	id: "/become-caregiver",
	path: "/become-caregiver",
	getParentRoute: () => Route$76
});
var BookingsRoute = Route$67.update({
	id: "/bookings",
	path: "/bookings",
	getParentRoute: () => Route$76
});
var BrandCompareRoute = Route$66.update({
	id: "/brand-compare",
	path: "/brand-compare",
	getParentRoute: () => Route$76
});
var CalendarRoute = Route$65.update({
	id: "/calendar",
	path: "/calendar",
	getParentRoute: () => Route$76
});
var CareCircleRoute = Route$64.update({
	id: "/care-circle",
	path: "/care-circle",
	getParentRoute: () => Route$76
});
var CaregiverSettingRoute = Route$63.update({
	id: "/caregiver-setting",
	path: "/caregiver-setting",
	getParentRoute: () => Route$76
});
var CartRoute = Route$62.update({
	id: "/cart",
	path: "/cart",
	getParentRoute: () => Route$76
});
var ChatRoute = Route$61.update({
	id: "/chat",
	path: "/chat",
	getParentRoute: () => Route$76
});
var CheckInsRoute = Route$60.update({
	id: "/check-ins",
	path: "/check-ins",
	getParentRoute: () => Route$76
});
var CheckinRoute = Route$59.update({
	id: "/checkin",
	path: "/checkin",
	getParentRoute: () => Route$76
});
var CompanionRoute = Route$58.update({
	id: "/companion",
	path: "/companion",
	getParentRoute: () => Route$76
});
var DashboardRoute = Route$57.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => Route$76
});
var DeleteAfterReadRoute = Route$56.update({
	id: "/delete-after-read",
	path: "/delete-after-read",
	getParentRoute: () => Route$76
});
var DocumentsRoute = Route$55.update({
	id: "/documents",
	path: "/documents",
	getParentRoute: () => Route$76
});
var FavoriteCaregiverRoute = Route$54.update({
	id: "/favorite-caregiver",
	path: "/favorite-caregiver",
	getParentRoute: () => Route$76
});
var FindRoute = Route$53.update({
	id: "/find",
	path: "/find",
	getParentRoute: () => Route$76
});
var GetStartedRoute = Route$52.update({
	id: "/get-started",
	path: "/get-started",
	getParentRoute: () => Route$76
});
var HelpRoute = Route$51.update({
	id: "/help",
	path: "/help",
	getParentRoute: () => Route$76
});
var HowItWorksRoute = Route$50.update({
	id: "/how-it-works",
	path: "/how-it-works",
	getParentRoute: () => Route$76
});
var InboxRoute = Route$49.update({
	id: "/inbox",
	path: "/inbox",
	getParentRoute: () => Route$76
});
var LearnRoute = Route$48.update({
	id: "/learn",
	path: "/learn",
	getParentRoute: () => Route$76
});
var MedicineRoute = Route$47.update({
	id: "/medicine",
	path: "/medicine",
	getParentRoute: () => Route$76
});
var MessagesRoute = Route$46.update({
	id: "/messages",
	path: "/messages",
	getParentRoute: () => Route$76
});
var NotificationsRoute = Route$45.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => Route$76
});
var OnboardingRoute = Route$44.update({
	id: "/onboarding",
	path: "/onboarding",
	getParentRoute: () => Route$76
});
var OrderConfirmationRoute = Route$43.update({
	id: "/order-confirmation",
	path: "/order-confirmation",
	getParentRoute: () => Route$76
});
var PlacesRoute = Route$42.update({
	id: "/places",
	path: "/places",
	getParentRoute: () => Route$76
});
var ProfileRoute = Route$41.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => Route$76
});
var ResetPasswordRoute = Route$40.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$76
});
var ResourcesRoute = Route$39.update({
	id: "/resources",
	path: "/resources",
	getParentRoute: () => Route$76
});
var SearchRoute = Route$38.update({
	id: "/search",
	path: "/search",
	getParentRoute: () => Route$76
});
var SearchCareFacilityRoute = Route$37.update({
	id: "/search-care-facility",
	path: "/search-care-facility",
	getParentRoute: () => Route$76
});
var SearchCaregiverRoute = Route$36.update({
	id: "/search-caregiver",
	path: "/search-caregiver",
	getParentRoute: () => Route$76
});
var SearchLocalCaregiverRoute = Route$35.update({
	id: "/search-local-caregiver",
	path: "/search-local-caregiver",
	getParentRoute: () => Route$76
});
var SearchRemoteCaregiverRoute = Route$34.update({
	id: "/search-remote-caregiver",
	path: "/search-remote-caregiver",
	getParentRoute: () => Route$76
});
var SettingsRoute = Route$33.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$76
});
var SyncTestDraftbitRoute = Route$32.update({
	id: "/sync-test-draftbit",
	path: "/sync-test-draftbit",
	getParentRoute: () => Route$76
});
var TasksRoute = Route$31.update({
	id: "/tasks",
	path: "/tasks",
	getParentRoute: () => Route$76
});
var TrustSafetyRoute = Route$30.update({
	id: "/trust-safety",
	path: "/trust-safety",
	getParentRoute: () => Route$76
});
var WelcomeRoute = Route$29.update({
	id: "/welcome",
	path: "/welcome",
	getParentRoute: () => Route$76
});
var XianyuListingsRoute = Route$28.update({
	id: "/xianyu-listings",
	path: "/xianyu-listings",
	getParentRoute: () => Route$76
});
var AccompaniedIndexRoute = Route$27.update({
	id: "/accompanied/",
	path: "/accompanied/",
	getParentRoute: () => Route$76
});
var AccompaniedIdRoute = Route$26.update({
	id: "/accompanied/$id",
	path: "/accompanied/$id",
	getParentRoute: () => Route$76
});
var ArticlesIndexRoute = Route$25.update({
	id: "/articles/",
	path: "/articles/",
	getParentRoute: () => Route$76
});
var ArticlesIdRoute = Route$24.update({
	id: "/articles/$id",
	path: "/articles/$id",
	getParentRoute: () => Route$76
});
var AwaredIndexRoute = Route$23.update({
	id: "/awared/",
	path: "/awared/",
	getParentRoute: () => Route$76
});
var AwaredIdRoute = Route$22.update({
	id: "/awared/$id",
	path: "/awared/$id",
	getParentRoute: () => Route$76
});
var CareCircleGroupIdRoute = Route$21.update({
	id: "/care-circle_/$groupId",
	path: "/care-circle/$groupId",
	getParentRoute: () => Route$76
});
var CaredOnesIndexRoute = Route$20.update({
	id: "/cared-ones/",
	path: "/cared-ones/",
	getParentRoute: () => Route$76
});
var CaredIndexRoute = Route$19.update({
	id: "/cared/",
	path: "/cared/",
	getParentRoute: () => Route$76
});
var CaredIdRoute = Route$18.update({
	id: "/cared/$id",
	path: "/cared/$id",
	getParentRoute: () => Route$76
});
var CaregiverIdRoute = Route$17.update({
	id: "/caregiver/$id",
	path: "/caregiver/$id",
	getParentRoute: () => Route$76
});
var CommunityIndexRoute = Route$16.update({
	id: "/community/",
	path: "/community/",
	getParentRoute: () => Route$76
});
var CommunityIdRoute = Route$15.update({
	id: "/community/$id",
	path: "/community/$id",
	getParentRoute: () => Route$76
});
var CopedIndexRoute = Route$14.update({
	id: "/coped/",
	path: "/coped/",
	getParentRoute: () => Route$76
});
var CopedIdRoute = Route$13.update({
	id: "/coped/$id",
	path: "/coped/$id",
	getParentRoute: () => Route$76
});
var FacilitiesNewRoute = Route$12.update({
	id: "/facilities/new",
	path: "/facilities/new",
	getParentRoute: () => Route$76
});
var FacilityIdRoute = Route$11.update({
	id: "/facility/$id",
	path: "/facility/$id",
	getParentRoute: () => Route$76
});
var GroupGroupIdRoute = Route$10.update({
	id: "/group/$groupId",
	path: "/group/$groupId",
	getParentRoute: () => Route$76
});
var JoinCodeRoute = Route$9.update({
	id: "/join/$code",
	path: "/join/$code",
	getParentRoute: () => Route$76
});
var SafedIndexRoute = Route$8.update({
	id: "/safed/",
	path: "/safed/",
	getParentRoute: () => Route$76
});
var SafedIdRoute = Route$7.update({
	id: "/safed/$id",
	path: "/safed/$id",
	getParentRoute: () => Route$76
});
var ShareNoteRoute = Route$6.update({
	id: "/share/note",
	path: "/share/note",
	getParentRoute: () => Route$76
});
var ApiPublicFamilyVoicesRoute = Route$5.update({
	id: "/api/public/family-voices",
	path: "/api/public/family-voices",
	getParentRoute: () => Route$76
});
var CaredOnesPersonIdIndexRoute = Route$4.update({
	id: "/cared-ones/$personId/",
	path: "/cared-ones/$personId/",
	getParentRoute: () => Route$76
});
var rootRouteChildren = {
	IndexRoute,
	SplatRoute,
	AiRoute,
	AiCompanionRoute,
	AppointmentsRoute,
	AssistantRoute,
	AuthRoute,
	BecomeCaregiverRoute,
	BookingsRoute,
	BrandCompareRoute,
	CalendarRoute,
	CareCircleRoute,
	CaregiverSettingRoute,
	CartRoute,
	ChatRoute,
	CheckInsRoute,
	CheckinRoute,
	CompanionRoute,
	DashboardRoute,
	DeleteAfterReadRoute,
	DocumentsRoute,
	FavoriteCaregiverRoute,
	FindRoute,
	GetStartedRoute,
	HelpRoute,
	HowItWorksRoute,
	InboxRoute,
	LearnRoute,
	MedicineRoute,
	MessagesRoute,
	NotificationsRoute,
	OnboardingRoute,
	OrderConfirmationRoute,
	PlacesRoute,
	ProfileRoute,
	ResetPasswordRoute,
	ResourcesRoute,
	SearchRoute,
	SearchCareFacilityRoute,
	SearchCaregiverRoute,
	SearchLocalCaregiverRoute,
	SearchRemoteCaregiverRoute,
	SettingsRoute,
	SyncTestDraftbitRoute,
	TasksRoute,
	TrustSafetyRoute,
	WelcomeRoute,
	XianyuListingsRoute,
	AccompaniedIdRoute,
	ArticlesIdRoute,
	AwaredIdRoute,
	CareCircleGroupIdRoute,
	CaredIdRoute,
	CaregiverIdRoute,
	CommunityIdRoute,
	CopedIdRoute,
	FacilitiesNewRoute,
	FacilityIdRoute,
	GroupGroupIdRoute,
	JoinCodeRoute,
	SafedIdRoute,
	ShareNoteRoute,
	AccompaniedIndexRoute,
	ArticlesIndexRoute,
	AwaredIndexRoute,
	CaredOnesIndexRoute,
	CaredIndexRoute,
	CommunityIndexRoute,
	CopedIndexRoute,
	SafedIndexRoute,
	ApiPublicFamilyVoicesRoute,
	CaredOnesPersonIdCardRoute: Route$3.update({
		id: "/cared-ones/$personId/$card",
		path: "/cared-ones/$personId/$card",
		getParentRoute: () => Route$76
	}),
	FacilitiesIdEditRoute: Route$2.update({
		id: "/facilities/$id/edit",
		path: "/facilities/$id/edit",
		getParentRoute: () => Route$76
	}),
	ShareCardTokenRoute: Route$1.update({
		id: "/share/card/$token",
		path: "/share/card/$token",
		getParentRoute: () => Route$76
	}),
	CaredOnesPersonIdIndexRoute
};
var routeTree = Route$76._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient({ defaultOptions: { queries: {
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: false,
			refetchInterval: false,
			staleTime: 300 * 1e3,
			gcTime: 1800 * 1e3,
			retry: 1
		} } }) },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
