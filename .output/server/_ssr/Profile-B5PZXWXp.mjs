import { s as __toESM } from "../_runtime.mjs";
import { r as maskEmail } from "./utils-CcHv9xqZ.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { i as getStoredWPUser, p as wpUploadMedia } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as getCurrentUserIdNumber } from "./current-user-CV-pp6xq.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { a as filterAppScope, t as appScopeBody } from "./app-scope-Cq6C10CZ.mjs";
import { t as readLinkedCCTRows } from "./cct-rows-C0yQLswP.mjs";
import { Dt as MapPin, Fn as Camera, Gn as Bell, L as Shield, Ln as CalendarDays, U as Settings2, c as Users, f as UserMinus, jt as LoaderCircle, l as User, on as ExternalLink, p as Upload, un as Download, y as Trash2, yt as Monitor } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { c as fetchMyCommunityName, h as saveMyCommunityName, i as ensureAppProfile } from "./app-profile-DeZHIfiB.mjs";
import { n as fetchWPUserProfile } from "./wp-users-C2nRIR2f.mjs";
import { n as encodeRel219Meta, t as decodeRel219Status } from "./rel219-meta-CiKakwJu.mjs";
import { b as runSettingSkill, f as fetchAppSettings, h as permissionSkillStates, i as SETTING_GROUPS, m as openAppSettings, p as isNative, s as askPermissionSkill, t as DEFAULT_APP_SETTINGS, x as settingSkillsInGroup } from "./ai-dynamic-knowledge-C5tnjGCy.mjs";
import { mn as useMyProfile } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-B2Az5zRn.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { t as Switch } from "./switch-Coli7fra.mjs";
import { i as useNavigate$1 } from "./router-compat-3gk8yjav.mjs";
import { t as Skeleton } from "./skeleton-BTLGg-Aw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Profile-B5PZXWXp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Push notification tokens — JetEngine CCT 186 `users_notif_token`
* Relation 189: users → user's notification token (1:M)
* Shared across apps: field APP scopes each token to one app.
*
* Live opaque field map (verified):
*   a55 endpoint_or_token (Text)
*   a56 notification_provider (Radio: b55 web_push | b56 fcm | b57 apn | b58 jpush | b59 wechat)
*   a57 device_label (Text)
*   a58 auth_key (Text)
*   a59 p256dh (Text)
*   a60 is_active (Radio: b55 Yes | b56 No)
*/
var SLUG = T.notificationToken.slug;
var REL_USER_TOKEN = R.userNotificationTokens;
var F = T.notificationToken.f;
var PROVIDER_TO_CODE = {
	web_push: "b55",
	fcm: "b56",
	apn: "b57",
	jpush: "b58",
	wechat: "b59"
};
var PROVIDER_FROM_CODE = {
	b55: "web_push",
	b56: "fcm",
	b57: "apn",
	b58: "jpush",
	b59: "wechat"
};
var YES = "b55";
function decode(t) {
	return {
		id: String(t.id ?? t._ID ?? ""),
		endpoint_or_token: t[F.ENDPOINT_OR_TOKEN] || "",
		notification_provider: PROVIDER_FROM_CODE[String(t[F.NOTIFICATION_PROVIDER])] || "web_push",
		device_label: t[F.DEVICE_LABEL] || "",
		auth_key: t[F.AUTH_KEY] || "",
		p256dh: t[F.P256DH] || "",
		is_active: String(t[F.IS_ACTIVE]) === YES
	};
}
async function fetchMyNotificationTokens() {
	const userId = getCurrentUserIdNumber();
	if (!userId) return [];
	try {
		const links = await wordpressFetch(`jet-rel/${REL_USER_TOKEN}/children/${userId}`);
		if (!Array.isArray(links) || links.length === 0) return [];
		const ids = links.map((l) => String(l.child_object_id || "")).filter(Boolean);
		if (ids.length === 0) return [];
		return filterAppScope("notificationToken", await readLinkedCCTRows(SLUG, ids)).map(decode);
	} catch {
		return [];
	}
}
async function registerNotificationToken(input) {
	const userId = getCurrentUserIdNumber();
	if (!userId) return null;
	const dup = (await fetchMyNotificationTokens()).find((t) => t.endpoint_or_token === input.endpoint_or_token);
	if (dup) {
		if (!dup.is_active) await wordpressCCTFetch(SLUG, {
			id: dup.id,
			method: "PUT",
			body: { [F.IS_ACTIVE]: YES }
		});
		return {
			...dup,
			is_active: true
		};
	}
	const created = await wordpressCCTFetch(SLUG, {
		method: "POST",
		body: {
			[F.ENDPOINT_OR_TOKEN]: input.endpoint_or_token,
			[F.NOTIFICATION_PROVIDER]: PROVIDER_TO_CODE[input.notification_provider] || PROVIDER_TO_CODE.web_push,
			[F.DEVICE_LABEL]: input.device_label || (typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : ""),
			[F.AUTH_KEY]: input.auth_key || "",
			[F.P256DH]: input.p256dh || "",
			[F.IS_ACTIVE]: YES,
			...appScopeBody("notificationToken")
		}
	});
	const newId = Number(created?.item_id ?? created?._ID ?? created?.id ?? 0);
	if (!newId) return null;
	try {
		await wordpressFetch(`jet-rel/${REL_USER_TOKEN}`, {
			method: "POST",
			body: {
				parent_id: userId,
				child_id: newId,
				context: "child",
				store_items_type: "update"
			}
		});
	} catch {}
	return {
		id: String(newId),
		endpoint_or_token: input.endpoint_or_token,
		notification_provider: input.notification_provider,
		device_label: input.device_label,
		auth_key: input.auth_key,
		p256dh: input.p256dh,
		is_active: true
	};
}
async function subscribeWebPushAndRegister(vapidPublicKey) {
	if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return null;
	if (!vapidPublicKey) return null;
	try {
		const reg = await navigator.serviceWorker.ready;
		let sub = await reg.pushManager.getSubscription();
		if (!sub) sub = await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer
		});
		const json = sub.toJSON();
		return await registerNotificationToken({
			endpoint_or_token: json.endpoint || sub.endpoint,
			notification_provider: "web_push",
			auth_key: json.keys?.auth || "",
			p256dh: json.keys?.p256dh || ""
		});
	} catch {
		return null;
	}
}
function urlBase64ToUint8Array(base64String) {
	const base64 = (base64String + "=".repeat((4 - base64String.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/");
	const raw = atob(base64);
	const out = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
	return out;
}
/**
* General app settings — rendered entirely from the SETTING SKILLS in
* src/lib/ai-dynamic-knowledge.ts. This file only draws rows; it decides nothing
* about wording, app scope, storage or persistence, and it stores no data shape.
*/
var PERM_ICON = {
	"set-permission-phone-alerts": Bell,
	"set-permission-location": MapPin,
	"set-permission-calendar": CalendarDays
};
function stateBadge(state, Z) {
	const m = {
		granted: {
			text: Z("已允许", "On"),
			variant: "default"
		},
		denied: {
			text: Z("已在手机设置里关闭", "Turned off in your settings"),
			variant: "destructive"
		},
		prompt: {
			text: Z("还没设置", "Not chosen yet"),
			variant: "secondary"
		},
		unsupported: {
			text: Z("这台设备用不了", "Not available on this device"),
			variant: "outline"
		}
	}[state ?? "prompt"];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: m.variant,
		children: m.text
	});
}
function AppSettingsPanel({ sections = [
	"channels",
	"categories",
	"quiet",
	"display",
	"permissions"
] } = {}) {
	const show = (id) => sections.includes(id);
	const { i18n } = useTranslation();
	const isCN = !!i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const { toast } = useToast();
	const qc = useQueryClient();
	const { data: settings, isLoading } = useQuery({
		queryKey: ["appSettings"],
		queryFn: () => fetchAppSettings()
	});
	const local = settings ?? DEFAULT_APP_SETTINGS;
	const save = useMutation({
		mutationFn: ({ name, value }) => runSettingSkill(name, value, { settings: local }),
		onSuccess: (next) => {
			qc.setQueryData(["appSettings"], next);
			toast({ title: Z("已保存", "Saved") });
		},
		onError: () => toast({
			title: Z("没能保存，请再试一次", "Could not save — please try again"),
			variant: "destructive"
		})
	});
	const set = (name, value) => save.mutate({
		name,
		value
	});
	const [perm, setPerm] = (0, import_react.useState)({});
	const [busy, setBusy] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		permissionSkillStates().then(setPerm).catch(() => {});
	}, []);
	const ask = async (spec) => {
		setBusy(spec.name);
		try {
			const { state, settings: next } = await askPermissionSkill(spec.name, local);
			setPerm((p) => ({
				...p,
				[spec.name]: state
			}));
			qc.setQueryData(["appSettings"], next);
			if (spec.permission === "push" && state === "granted") {
				await subscribeWebPushAndRegister({
					"BASE_URL": "/",
					"DEV": false,
					"MODE": "production",
					"PROD": true,
					"SSR": true,
					"TSS_DEV_SERVER": "false",
					"TSS_DEV_SSR_STYLES_BASEPATH": "/",
					"TSS_DEV_SSR_STYLES_ENABLED": "true",
					"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
					"TSS_INLINE_CSS_ENABLED": "false",
					"TSS_ROUTER_BASEPATH": "",
					"TSS_SERVER_FN_BASE": "/_serverFn/",
					"VITE_SUPABASE_PROJECT_ID": "fofewspvoaylmzzgpyrg",
					"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_4ZCLp6URt0IVeFm6-aSD4g_dxkJY7Ps",
					"VITE_SUPABASE_URL": "https://fofewspvoaylmzzgpyrg.supabase.co",
					"VITE_WP_BASE_URL": "https://app.challenged-dementia.com/afresh"
				}["VITE_VAPID_PUBLIC_KEY"]);
				set("set-alerts-on-phone", true);
			}
			if (state === "denied") toast({
				title: Z("这一项目前是关着的", "This is switched off right now"),
				description: isNative() ? Z("打开手机的设置，找到这个应用，把它打开就可以了。", "Open your phone settings, find this app, and switch it on.") : Z("在浏览器的网站设置里把它打开，然后刷新页面。", "Switch it on in your browser's settings for this site, then refresh the page.")
			});
		} finally {
			setBusy(null);
		}
	};
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/settings/AppSettingsPanel.tsx:112:7:a379f87ffe9b47bc9bb70cb1bf6388f46a3f27ca5184597168d9af48c5ae229f:1",
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-56 w-full" })]
	});
	const renderSwitch = (spec) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/settings/AppSettingsPanel.tsx:120:5:2724071e4e7ed42b28414cb8b3fe467a53174b2e68ca3635f73d326662a6af46:1",
		className: "flex items-start justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "components/settings/AppSettingsPanel.tsx:121:7:d3016254f859c3f30a8e1f6888a14b31d7a3116dfa22c8c6a1eef23610d6d487:1",
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: spec.name,
				className: "text-sm font-medium",
				children: spec.label(isCN)
			}), spec.hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/settings/AppSettingsPanel.tsx:123:23:206ea9edd18f6aee20ea368ae734afe1c056e1150e6e6245a67574f348c50613:1",
				className: "text-xs text-muted-foreground mt-0.5",
				children: spec.hint(isCN)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			id: spec.name,
			checked: !!spec.readFrom?.(local),
			onCheckedChange: (v) => set(spec.name, v),
			disabled: save.isPending || spec.locked
		})]
	}, spec.name);
	const renderChoice = (spec) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/settings/AppSettingsPanel.tsx:135:5:3975888d719ed01ff53b980a99faef2e61256868dbb01d9821e1d414975bfca4:1",
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-sm font-medium",
			children: spec.label(isCN)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-source": "components/settings/AppSettingsPanel.tsx:137:7:379d77194854700f5f426c480d28f7077b2b0c156b7d71c05b381d83bd1a421d:1",
			className: "flex flex-wrap gap-2",
			children: (spec.options?.(isCN) ?? []).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: spec.readFrom?.(local) === o.value ? "default" : "outline",
				onClick: () => set(spec.name, o.value),
				disabled: save.isPending,
				children: o.label
			}, o.value))
		})]
	}, spec.name);
	const quietSpecs = settingSkillsInGroup("quiet");
	const quietEnabled = quietSpecs.find((s) => s.name === "set-quiet-hours");
	const quietTimes = quietSpecs.filter((s) => s.kind === "time");
	const groupTitle = (id) => SETTING_GROUPS.find((g) => g.id === id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/settings/AppSettingsPanel.tsx:160:5:e8152ec757d91b474394261df6fbd17235cd92293da6049d8573bfc7e827e690:1",
		className: "space-y-6",
		children: [
			["channels", "categories"].filter(show).map((gid) => {
				const g = groupTitle(gid);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-transparent card-elevated",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base sm:text-lg",
						children: g.title(isCN)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-sm",
						children: g.description(isCN)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "space-y-4",
						children: settingSkillsInGroup(gid).map(renderSwitch)
					})]
				}, gid);
			}),
			show("quiet") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-transparent card-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base sm:text-lg",
					children: groupTitle("quiet").title(isCN)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "text-sm",
					children: groupTitle("quiet").description(isCN)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [quietEnabled && renderSwitch(quietEnabled), quietEnabled?.readFrom?.(local) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/settings/AppSettingsPanel.tsx:183:13:9a2aac01354b38c80e2cf75c3916cb920054d16b840ad082b1a51496892dad6e:1",
						className: "flex items-center gap-3",
						children: quietTimes.map((spec) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/settings/AppSettingsPanel.tsx:185:17:ef93c17b2e2f6c7e9c30d1f487964426e8e113125f7552a6ac43bbb9a214ae12:1",
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: spec.name,
								className: "text-xs text-muted-foreground",
								children: spec.label(isCN)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: spec.name,
								type: "time",
								value: spec.readFrom?.(local) ?? "",
								onChange: (e) => set(spec.name, e.target.value),
								className: "w-28"
							})]
						}, spec.name))
					})]
				})]
			}),
			show("display") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-transparent card-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base sm:text-lg",
					children: groupTitle("display").title(isCN)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "text-sm",
					children: groupTitle("display").description(isCN)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-5",
					children: settingSkillsInGroup("display").map((spec) => spec.kind === "choice" ? renderChoice(spec) : renderSwitch(spec))
				})]
			}),
			show("permissions") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-transparent card-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base sm:text-lg",
					children: groupTitle("permissions").title(isCN)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "text-sm",
					children: groupTitle("permissions").description(isCN)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [settingSkillsInGroup("permissions").map((spec) => {
						const Icon = PERM_ICON[spec.name] ?? Bell;
						const state = perm[spec.name];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/settings/AppSettingsPanel.tsx:227:15:f3bd56ad225859e7fe4c5aac4ac4fe4043ec407d94bb18d86879e5b7ffa94909:1",
							className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/settings/AppSettingsPanel.tsx:228:17:2e602b502e4f39b78bbc61b62f5a6a6856bb253c756ef45c9e1f5d3e0075c9ba:1",
								className: "flex items-start gap-3 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/settings/AppSettingsPanel.tsx:230:19:c9f728a842791bc673f3eea21cc2466fdcc0c68f3bf384588614aad87566b9cb:1",
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/settings/AppSettingsPanel.tsx:231:21:ef1ddffb4c5df7d044deed3b3ead476a5c17acd1d1f7bc1cab893436e44f4a56:1",
										className: "flex items-center gap-2 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "components/settings/AppSettingsPanel.tsx:232:23:f3b2bab09e4f1bb019b394663bbce462f68f580f7650aecd2baf8dbedcedfbce:1",
											className: "text-sm font-medium",
											children: spec.label(isCN)
										}), stateBadge(state, Z)]
									}), spec.hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "components/settings/AppSettingsPanel.tsx:235:35:9bcbb6f62f9367698b0a9169d0ee091caa092c8129f2bad987655d4c48a41f2f:1",
										className: "text-xs text-muted-foreground mt-0.5",
										children: spec.hint(isCN)
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/settings/AppSettingsPanel.tsx:238:17:f312b46210deed1eb084966f4d08d73d6a6c4d17c86892f27f736fe5e25a4c85:1",
								className: "shrink-0",
								children: state === "denied" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									onClick: openAppSettings,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "h-4 w-4 mr-1.5" }),
										" ",
										Z("打开设置", "Open settings")
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: state === "granted" ? "ghost" : "outline",
									onClick: () => ask(spec),
									disabled: busy === spec.name,
									children: busy === spec.name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : state === "granted" ? Z("重新检查", "Check again") : Z("允许", "Allow")
								})
							})]
						}, spec.name);
					}), !isNative() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-inspector-source": "components/settings/AppSettingsPanel.tsx:264:13:f432969bac1932148af2b361d18fc9208b84d29924997841e35825c4356db393:1",
						className: "text-xs text-muted-foreground flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" }),
							" ",
							Z("如果你把这个应用装到手机上，这些会由手机自己弹窗来问你。", "If you install this app on your phone, your phone will ask you these instead.")
						]
					})]
				})]
			})
		]
	});
}
var REL_USER_CARED_ONE = R.userCaredOnes;
/** Everyone who has listed the signed-in user as the person they care for. */
async function fetchMyCaregiversWordPress() {
	const stored = getStoredWPUser();
	if (!stored?.user_id) return [];
	const me = String(stored.user_id).replace(/^wp-/, "");
	const rels = await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE}/parents/${me}`);
	if (!Array.isArray(rels) || rels.length === 0) return [];
	const byId = /* @__PURE__ */ new Map();
	for (const r of rels) {
		const id = String(r?.parent_object_id ?? r?.parent_id ?? "").replace(/^wp-/, "");
		if (!id || id === me) continue;
		const status = decodeRel219Status(r?.meta);
		if (status === "declined") continue;
		if (!byId.has(id) || status === "accepted") byId.set(id, status);
	}
	return await Promise.all(Array.from(byId.entries()).map(async ([id, status]) => {
		const u = await fetchWPUserProfile(id);
		return {
			user_id: `wp-${u.id}`,
			full_name: u.full_name ?? null,
			email: u.email ?? null,
			avatar_url: u.avatar_url ?? null,
			invitation_status: status
		};
	}));
}
/**
* Answer a request: accepting turns sharing on, declining keeps everything
* hidden. Both write Relation 219 · a58 — the link row itself is untouched, so
* the same request is never duplicated.
*/
async function respondToCaregiverRequestWordPress(caregiverUserId, answer) {
	const stored = getStoredWPUser();
	if (!stored?.user_id) throw new Error("Not authenticated");
	const parentId = Number(String(caregiverUserId).replace(/^wp-/, ""));
	const childId = Number(String(stored.user_id).replace(/^wp-/, ""));
	if (!parentId || !childId) throw new Error("Invalid care link");
	await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE}`, {
		method: "POST",
		body: {
			parent_id: parentId,
			child_id: childId,
			context: "child",
			store_items_type: "update",
			meta: encodeRel219Meta(answer)
		}
	});
	try {
		const { sendNotification } = await import("./dispatch-D0Zv_RsR.mjs");
		await sendNotification({
			user_id: parentId,
			type: "system",
			title: answer === "accepted" ? "Your care request was accepted" : "Your care request was declined",
			message: answer === "accepted" ? "You are now listed as their caregiver, so their care information is shared with you." : "They declined the request, so none of their care information is shared with you.",
			action_url: "/cared-ones"
		});
	} catch {}
}
/** Cut the link from my side: they lose access immediately. */
async function removeMyCaregiverWordPress(caregiverUserId) {
	const stored = getStoredWPUser();
	if (!stored?.user_id) throw new Error("Not authenticated");
	const parentId = Number(String(caregiverUserId).replace(/^wp-/, ""));
	const childId = Number(String(stored.user_id).replace(/^wp-/, ""));
	if (!parentId || !childId) throw new Error("Invalid care link");
	await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE}`, {
		method: "POST",
		body: {
			parent_id: parentId,
			child_id: childId,
			context: "child",
			store_items_type: "disconnect"
		}
	});
	try {
		const { sendNotification } = await import("./dispatch-D0Zv_RsR.mjs");
		await sendNotification({
			user_id: parentId,
			type: "system",
			title: "A care link was ended",
			message: "The person you listed as the one you care for has ended the link, so their care information is no longer shared with you.",
			action_url: "/cared-ones"
		});
	} catch {}
}
/**
* "Who cares for me" — the other side of the cared-one link.
*
* Anyone who has added you can see the care information kept about you, so this
* panel shows that list on your own settings page and lets you cut the link at
* any time without asking them.
*/
function WhoCaresForMePanel() {
	const { i18n } = useTranslation();
	const zh = i18n.language?.startsWith("zh");
	const Z = (cn, en) => zh ? cn : en;
	const { toast } = useToast();
	const qc = useQueryClient();
	const { data: caregivers, isLoading } = useQuery({
		queryKey: ["myCaregivers"],
		queryFn: fetchMyCaregiversWordPress
	});
	const remove = useMutation({
		mutationFn: (userId) => removeMyCaregiverWordPress(userId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["myCaregivers"] });
			toast({ title: Z("已解除，对方不再能看到你的信息", "Removed — they can no longer see your information") });
		},
		onError: (err) => toast({
			title: Z("解除失败", "Could not remove"),
			description: err?.message,
			variant: "destructive"
		})
	});
	const respond = useMutation({
		mutationFn: (v) => respondToCaregiverRequestWordPress(v.userId, v.answer),
		onSuccess: (_d, v) => {
			qc.invalidateQueries({ queryKey: ["myCaregivers"] });
			toast({ title: v.answer === "accepted" ? Z("已同意，对方现在可以看到你的信息", "Accepted — they can now see your information") : Z("已拒绝，对方看不到你的任何信息", "Declined — they cannot see any of your information") });
		},
		onError: (err) => toast({
			title: Z("操作失败", "Could not save"),
			description: err?.message,
			variant: "destructive"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
		className: "flex items-center gap-2 text-base",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" }), Z("谁在照护我", "Who cares for me")]
	}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			"data-inspector-source": "components/settings/WhoCaresForMePanel.tsx:74:9:b2f0a238223c5c6503b9874bcb3b135c0f53dc3a8524def68f71dd8a6333cbc1:1",
			className: "text-sm text-muted-foreground",
			children: Z("下面这些人把你列为被照护的人，可以看到你的用药、签到、记录和位置共享。你可以随时解除。", "These people list you as the person they care for, so they can see your medicines, check-ins, notes and location sharing. You can end that at any time.")
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "components/settings/WhoCaresForMePanel.tsx:82:11:94490c180d4f0469c17deda0b1a4d7cc86527230dc532ba16ef5120fe55a0723:1",
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 rounded-xl" })]
		}) : !caregivers || caregivers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			"data-inspector-source": "components/settings/WhoCaresForMePanel.tsx:87:11:b139adbc8a0250633a9cff3737cffcc019d49ec169ff3d4855c5617614d3e17a:1",
			className: "text-sm text-muted-foreground",
			children: Z("目前没有人把你列为被照护的人。", "Nobody lists you as the person they care for.")
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			"data-inspector-source": "components/settings/WhoCaresForMePanel.tsx:91:11:e6e7975a4fad3454aa53215be63c9efc1c49bb21471ff254227e217fe995fce2:1",
			className: "space-y-2",
			children: caregivers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				"data-inspector-source": "components/settings/WhoCaresForMePanel.tsx:93:15:eb9dc3560940424a58a6cb4d514580f4ed66cbdf65297e1f76d0ac22d68af277:1",
				className: "flex items-center gap-3 rounded-xl border p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/settings/WhoCaresForMePanel.tsx:94:17:47bd43583c17f36814fe5f42a491a4aeedeac6f4e9b0d1ebf65ca7e7e6875c9f:1",
						className: "h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0",
						children: c.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							"data-inspector-source": "components/settings/WhoCaresForMePanel.tsx:96:21:4f0a59a282256231c683e8635dfb72845d393c6b8d40e12c486dace765b9b727:1",
							src: c.avatar_url,
							alt: "",
							className: "h-9 w-9 object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "components/settings/WhoCaresForMePanel.tsx:98:21:d5f484ff6fea7029ccaafdeac5f7f29453bd902b05a66f534c7835bea23adaf1:1",
							className: "text-primary text-xs font-medium",
							children: (c.full_name || "?").charAt(0).toUpperCase()
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/settings/WhoCaresForMePanel.tsx:103:17:0609ea2756528d20bd9fb5e28ebbd836467f0c7d0d394cb37e1364524450fc44:1",
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/settings/WhoCaresForMePanel.tsx:104:19:5e0a7a20feac0b3baf06e6903bdf2417ea929584264aa95ddd9a48b068e4ae87:1",
								className: "text-sm font-medium text-foreground truncate",
								children: c.full_name || Z("未填写姓名", "No name set")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/settings/WhoCaresForMePanel.tsx:107:19:25ac1f518b9e44b817fbd30253e9993202744166cc38032eae17ae524f19eb70:1",
								className: "text-xs text-muted-foreground truncate",
								children: maskEmail(c.email)
							}),
							c.invitation_status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/settings/WhoCaresForMePanel.tsx:109:21:df3d8fb227b8d9b9881eb20e71236904171befb347a21241f8c9b865c2200e56:1",
								className: "text-xs text-muted-foreground mt-1",
								children: Z("还在等你同意，现在他看不到你的任何信息。", "Waiting for your answer — they cannot see anything yet.")
							})
						]
					}),
					c.invitation_status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/settings/WhoCaresForMePanel.tsx:118:19:1d1df25fdb51744c601baa8c606e470e3b9ed2b9c6636fbec241294840f51e03:1",
						className: "flex gap-2 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							disabled: respond.isPending,
							onClick: () => respond.mutate({
								userId: c.user_id,
								answer: "accepted"
							}),
							children: Z("同意", "Accept")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							disabled: respond.isPending,
							onClick: () => respond.mutate({
								userId: c.user_id,
								answer: "declined"
							}),
							children: Z("拒绝", "Decline")
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: "gap-1.5 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMinus, { className: "h-4 w-4" }), Z("解除", "Remove")]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: Z("解除照护关系？", "End this care link?") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: Z("解除后，对方立刻看不到你的用药、签到、记录、文件和位置。", "They immediately lose access to your medicines, check-ins, notes, documents and location.") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: Z("取消", "Cancel") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
						onClick: () => remove.mutate(c.user_id),
						children: Z("解除", "Remove")
					})] })] })] })
				]
			}, c.user_id))
		})]
	})] });
}
function Profile() {
	const { t } = useTranslation();
	const { user, logout } = useAuth();
	useSite();
	const navigate = useNavigate$1();
	const { data: profile, isLoading } = useMyProfile();
	const { toast } = useToast();
	const qc = useQueryClient();
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [bio, setBio] = (0, import_react.useState)("");
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)("");
	const [roles, setRoles] = (0, import_react.useState)([]);
	const [avatarUploading, setAvatarUploading] = (0, import_react.useState)(false);
	const [downloadingData, setDownloadingData] = (0, import_react.useState)(false);
	const [deletingAccount, setDeletingAccount] = (0, import_react.useState)(false);
	const [savingProfile, setSavingProfile] = (0, import_react.useState)(false);
	const fileInputRef = (0, import_react.useRef)(null);
	const [communityName, setCommunityName] = (0, import_react.useState)("");
	const [emailNotifs, setEmailNotifs] = (0, import_react.useState)(true);
	const [pushNotifs, setPushNotifs] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let cancelled = false;
		ensureAppProfile().then((res) => {
			if (cancelled || !res?.grantedCredits) return;
			toast({
				title: t("settings.creditsGrantedTitle", { defaultValue: "10 AI credits added" }),
				description: t("settings.creditsGrantedBody", { defaultValue: "You have 10 AI credits to try the assistant in this app." })
			});
		}).catch(() => null);
		return () => {
			cancelled = true;
		};
	}, [
		user,
		toast,
		t
	]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let cancelled = false;
		fetchMyCommunityName().then((value) => {
			if (!cancelled) setCommunityName(value);
		}).catch(() => null);
		return () => {
			cancelled = true;
		};
	}, [user]);
	(0, import_react.useEffect)(() => {
		if (profile) {
			setName(profile.full_name || "");
			setEmail(profile.email || "");
			setPhone(profile.phone || "");
			setAddress(profile.location || "");
			setBio(profile.bio || "");
			setAvatarUrl(profile.avatar_url || "");
			setRoles((profile.general_user_role || []).filter((role) => role === "cared one" || role === "caring one"));
			setEmailNotifs(true);
			setPushNotifs(true);
		}
	}, [profile]);
	const handleSave = async () => {
		setSavingProfile(true);
		try {
			await runSettingSkill("set-personal-profile", {
				full_name: name,
				phone,
				location: address,
				bio,
				avatar_url: avatarUrl || null,
				general_user_role: roles
			});
			await saveMyCommunityName(communityName);
			await qc.invalidateQueries({ queryKey: ["myProfile"] });
			toast({ title: t("profile.profileUpdated") });
		} catch (err) {
			toast({
				title: t("profile.updateFailed"),
				description: err.message,
				variant: "destructive"
			});
		} finally {
			setSavingProfile(false);
		}
	};
	const handleDownloadData = async () => {
		setDownloadingData(true);
		try {
			const exportData = await runSettingSkill("download-my-data");
			const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `my-data-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
			a.click();
			URL.revokeObjectURL(url);
			toast({ title: t("profile.dataDownloaded", "Your data has been downloaded") });
		} catch (err) {
			toast({
				title: t("profile.downloadFailed"),
				description: err.message,
				variant: "destructive"
			});
		} finally {
			setDownloadingData(false);
		}
	};
	const handleDeleteAccount = async () => {
		setDeletingAccount(true);
		try {
			await runSettingSkill("close-my-account");
			toast({
				title: t("profile.accountDeleted", "Account Deleted"),
				description: t("profile.accountDeletedDesc", "Your account data has been anonymized and you have been logged out.")
			});
			navigate("/");
		} catch (err) {
			toast({
				title: t("profile.deletionFailed"),
				description: err.message,
				variant: "destructive"
			});
		} finally {
			setDeletingAccount(false);
		}
	};
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/Profile.tsx:155:7:c7e31c5eeaa4da0969b1c992a98fa3a4440ba092f6bef56a4c13c87c3a4415a8:1",
		className: "max-w-3xl mx-auto px-4 py-6 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-40" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/Profile.tsx:158:9:bd03054b2a604e45699796f34d31386d8e9313a46ce9005fd33f3f6bfa9d1411:1",
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full rounded-xl" })]
			})
		]
	});
	const displayName = name || user?.full_name || "User";
	const roleLabel = roles.length ? roles.join(" · ") : "—";
	const toggleRole = (role, checked) => setRoles((current) => checked ? [.../* @__PURE__ */ new Set([...current, role])] : current.filter((item) => item !== role));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/Profile.tsx:168:5:41a3ad4da040094834c4804d8e84f8024ba734a3596a2449ad63feeaba6fd399:1",
		className: "max-w-3xl mx-auto px-4 py-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			"data-inspector-source": "pages/Profile.tsx:169:7:25d24d51dd25881b85f9e99649a1cfa8f434fa7b64b337523e4453b70c210290:1",
			className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-5",
			children: t("nav.settings", "Settings")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "personal",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "mb-6 flex flex-wrap h-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "personal",
							className: "gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" }),
								" ",
								t("common.personal")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "display",
							className: "gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "h-4 w-4" }),
								" ",
								t("common.display", "Display")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "notifications",
							className: "gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" }),
								" ",
								t("common.notifications")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "privacy",
							className: "gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4" }),
								" ",
								t("common.privacy")
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "personal",
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "border-transparent card-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-4 sm:p-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/Profile.tsx:182:15:a2197c7c6c04590c3401076c0c80d9ffde02887e6678e465b3e25a74765d195d:1",
									className: "flex items-center gap-4 sm:gap-6 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/Profile.tsx:183:17:dca47498d036ff8abc08fa4a714c19932433d7c0adec1411f1398507fece522b:1",
										className: "relative group shrink-0",
										children: [
											profile?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												"data-inspector-source": "pages/Profile.tsx:185:21:c84a8a036b5207cdc961c377863b1b77ff32d8930034adfcc78344686536b24b:1",
												src: profile.avatar_url,
												alt: "",
												className: "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-source": "pages/Profile.tsx:187:21:3eb4a59d1ecbfbfca2b458b0fb03f20d362859e5b56d255745d216faaa550da1:1",
												className: "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary flex items-center justify-center",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-source": "pages/Profile.tsx:188:23:911e41b3b2cb7f3280d4d7df3dbac9401855bd66db3ee7ce7183c127698e9f76:1",
													className: "text-primary-foreground text-xl sm:text-2xl font-bold",
													children: displayName.charAt(0).toUpperCase()
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												"data-inspector-source": "pages/Profile.tsx:191:20:5ec17f881d3c58997e89333a85d2608ea87b52ed7716cfc63a06dcdf0b04c6cd:1",
												type: "button",
												"aria-label": t("profile.changeAvatar", "Change profile photo"),
												className: "absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex items-center justify-center cursor-pointer",
												onClick: () => fileInputRef.current?.click(),
												disabled: avatarUploading,
												children: avatarUploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 text-white animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-5 w-5 text-white" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												"data-inspector-source": "pages/Profile.tsx:194:19:df5020b7b00d37044cca1aa319329a560397f35306180d5b692b79931e2fb5ff:1",
												ref: fileInputRef,
												type: "file",
												accept: "image/*",
												className: "hidden",
												onChange: async (e) => {
													const file = e.target.files?.[0];
													if (!file) return;
													if (file.size > 5 * 1024 * 1024) {
														toast({
															title: t("profile.fileTooLarge"),
															description: t("profile.maxSize"),
															variant: "destructive"
														});
														return;
													}
													setAvatarUploading(true);
													try {
														const url = await wpUploadMedia(file);
														setAvatarUrl(url);
														toast({ title: t("profile.avatarUploaded", "Avatar uploaded") });
													} catch (err) {
														toast({
															title: t("profile.uploadFailed"),
															description: err.message,
															variant: "destructive"
														});
													} finally {
														setAvatarUploading(false);
														if (fileInputRef.current) fileInputRef.current.value = "";
													}
												}
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/Profile.tsx:208:17:0609ea2756528d20bd9fb5e28ebbd836467f0c7d0d394cb37e1364524450fc44:1",
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												"data-inspector-source": "pages/Profile.tsx:209:19:ede15c6b8311a58bdbf115aa95c93dd97ccb16b9a47c427e5446f9bc96a63ee5:1",
												className: "text-base sm:text-lg font-semibold text-foreground truncate",
												children: displayName
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "pages/Profile.tsx:210:19:1ca2e5745ef8dde48c96319f1aa89dee28ecb68a6f421905adc177331e3a2ee3:1",
												className: "text-xs sm:text-sm text-muted-foreground truncate",
												children: email
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "pages/Profile.tsx:211:19:258f03d6de9e5a03b20b1aa4fc55edaeb4c402b52534d3e4dae1e21d87613015:1",
												className: "text-[11px] sm:text-xs text-muted-foreground mt-1 truncate",
												children: roleLabel
											})
										]
									})]
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-transparent card-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("profile.personalInfo") }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								"data-inspector-scope": "settings-personal-form",
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/Profile.tsx:220:15:64761617ee86aa17462f72bcdaa5d71682b506d62119e9762fab871dad83ecbf:1",
										className: "grid sm:grid-cols-2 gap-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/Profile.tsx:221:17:7e096ff65e880f73cd3785cb1c4841dcfe12f8094e42a26ae30f2d221b9164a5:1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("common.fullName") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: name,
													onChange: (e) => setName(e.target.value)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/Profile.tsx:222:17:8fb462bfcc9b7189d6d11ecea810706f25aedb2bf7ca5bf0f5fc1c29120afb9e:1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("common.email") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: email,
													disabled: true,
													className: "opacity-60"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/Profile.tsx:223:17:dd16381108cd9034a22d21955f18329858777a190d0060e9263f1cd2de35cc9a:1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("common.phone") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: phone,
													onChange: (e) => setPhone(e.target.value)
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/Profile.tsx:225:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("profile.avatar") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/Profile.tsx:227:17:7631d2efd1b3445452244788a1dc4c7603d574eb03982d5d4a0bf55e44509b39:1",
											className: "flex gap-2 items-center mt-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: avatarUrl,
												onChange: (e) => setAvatarUrl(e.target.value),
												placeholder: t("profile.avatarUrlPlaceholder"),
												className: "flex-1"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "button",
												variant: "outline",
												size: "sm",
												onClick: () => fileInputRef.current?.click(),
												disabled: avatarUploading,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4 mr-1" }),
													" ",
													t("common.upload")
												]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/Profile.tsx:232:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("common.address") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/Profile.tsx:234:17:c2896d405530598d39fe33a726b02e0129e7b7df906deb54dadef67618374707:1",
											className: "relative",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: address,
												onChange: (e) => setAddress(e.target.value),
												className: "pl-9"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/Profile.tsx:236:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "community-name",
												children: t("profile.communityName", "Your name on the forum")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "community-name",
												value: communityName,
												onChange: (e) => setCommunityName(e.target.value),
												placeholder: t("profile.communityNamePlaceholder", "Shown on posts and replies")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "pages/Profile.tsx:239:17:c17316e663d4635d685ca36a20e75bcc362dff9aacce511d7f70cd9c555c7d82:1",
												className: "text-xs text-muted-foreground mt-1",
												children: t("profile.communityNameHelp", "Only used on this forum, so you can pick a different one in each app.")
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/Profile.tsx:241:15:a942f026e2ca46904ebd10eaa428e63b4cb61e7a145815303ec0f0b40ee9de86:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("profile.aboutMe") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											value: bio,
											onChange: (e) => setBio(e.target.value),
											rows: 3
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/Profile.tsx:242:15:42e90dccce7e84c974ece10adac1404bffeb077c1784338ffc1e89c432b77bf6:1",
										className: "space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("common.role", "Role") }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "pages/Profile.tsx:244:17:373dbddaf2cb540b84384d1b7b7f6a5a633ef213b2fd12c584cacab21ec69e14:1",
												className: "text-xs text-muted-foreground",
												children: t("profile.roleHelp", "Turn on everything that describes you. This decides which care tools you see.")
											}),
											[{
												value: "cared one",
												label: t("profile.roleCaredOne", "I receive care")
											}, {
												value: "caring one",
												label: t("profile.roleCaringOne", "I care for someone")
											}].map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/Profile.tsx:251:19:4778fd340aef64a000a0b6af08faac334a0ba5c288ed883a507dc6f9f0270c17:1",
												className: "flex items-center justify-between rounded-lg border p-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-source": "pages/Profile.tsx:252:21:247644200263734ff85539de5da92959e5704bc5f3fc274a9b3df41de2c22e58:1",
													className: "text-sm font-medium",
													children: role.label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
													checked: roles.includes(role.value),
													onCheckedChange: (checked) => toggleRole(role.value, checked),
													"aria-label": role.label
												})]
											}, role.value))
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "coral",
							onClick: handleSave,
							disabled: savingProfile,
							children: savingProfile ? t("common.saving") : t("profile.saveChanges")
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "display",
					className: "space-y-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSettingsPanel, { sections: ["display"] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "notifications",
					className: "space-y-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSettingsPanel, { sections: [
						"channels",
						"categories",
						"quiet",
						"permissions"
					] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "privacy",
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhoCaresForMePanel, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-transparent card-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("profile.yourData") }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "pages/Profile.tsx:278:15:edfcb2c65c05f34184625644b980e782dffa65af3541483713d38c574a949c47:1",
									className: "text-sm text-muted-foreground",
									children: t("profile.downloadDesc")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									className: "w-full",
									onClick: handleDownloadData,
									disabled: downloadingData,
									children: [downloadingData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 mr-2" }), downloadingData ? t("profile.preparingDownload") : t("profile.downloadMyData")]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-transparent card-elevated border-destructive/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-destructive",
								children: t("profile.dangerZone")
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "pages/Profile.tsx:289:15:1fecbe977c894c9abbf268bc06e0df7e5482f55789b8ec2ba623f24bf06e6d46:1",
									className: "text-sm text-muted-foreground",
									children: t("profile.deleteConfirmDesc")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "destructive",
										className: "w-full",
										disabled: deletingAccount,
										children: [deletingAccount ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-2" }), t("profile.deleteAccount")]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: t("profile.deleteConfirmTitle") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: t("profile.deleteConfirmDesc") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: t("common.cancel") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
									onClick: handleDeleteAccount,
									className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
									children: t("profile.yesDeleteAccount")
								})] })] })] })]
							})]
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { Profile as t };
