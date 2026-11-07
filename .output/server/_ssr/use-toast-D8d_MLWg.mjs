import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { t as instance } from "../_libs/i18next.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-toast-D8d_MLWg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Plain-language messages for older caregivers.
*
* Nobody using this app is a programmer. Any technical text that leaks out of a
* failed request (HTTP codes, "Failed to fetch", REST error slugs, stack
* traces, JSON blobs, context/provider errors) gets replaced with a sentence a
* 70-year-old caregiver can act on.
*/
var isZh = () => (instance.language || "").startsWith("zh");
var TEXT = {
	offline: {
		zh: "网络好像断开了。请检查手机或电脑的网络，然后再试一次。",
		en: "The internet connection seems to be down. Please check your network and try again."
	},
	signedOut: {
		zh: "您已经退出登录了。请重新登录后再继续。",
		en: "You have been signed out. Please sign in again to continue."
	},
	noPermission: {
		zh: "这一项您暂时没有权限查看或修改。如果需要，请让护理小组的管理员开通。",
		en: "You don't have permission for this. Ask the care group organiser to give you access."
	},
	notFound: {
		zh: "没有找到这条内容，可能已经被删除了。",
		en: "We couldn't find this item — it may have been removed."
	},
	server: {
		zh: "系统暂时忙不过来，请稍等一会儿再试。您填写的内容没有丢。",
		en: "The system is having trouble right now. Please wait a moment and try again — nothing you typed is lost."
	},
	tooMany: {
		zh: "操作太频繁了，请休息一分钟再试。",
		en: "That was a bit too fast. Please wait a minute and try again."
	},
	timeout: {
		zh: "等待时间太长了，请再试一次。",
		en: "That took too long. Please try again."
	},
	invalid: {
		zh: "有些信息填得不完整或格式不对，请检查后再保存。",
		en: "Some details are missing or don't look right. Please check them and save again."
	},
	unknown: {
		zh: "刚才没有成功，请再试一次。如果一直不行，请稍后再来。",
		en: "That didn't work. Please try again, and come back a little later if it keeps failing."
	}
};
var say = (kind) => isZh() ? TEXT[kind].zh : TEXT[kind].en;
/** Patterns that mean "this text is for developers, not for people". */
var TECHNICAL = [
	/\b(fetch|network(request)?|networkerror|err_|econn|enotfound|dns)\b/i,
	/\b(undefined|null|nan|typeerror|referenceerror|syntaxerror|json|parse)\b/i,
	/\b(provider|context|hook|render|component|props|useauth|usecontext)\b/i,
	/\b(rest_|wp_|jetengine|supabase|postgres|sql|cct|api|endpoint|payload|token|cors)\b/i,
	/\b(http|status|code)\s*[:=]?\s*\d{3}\b/i,
	/\b\d{3}\s*(bad request|unauthorized|forbidden|not found|error)\b/i,
	/[{}[\]<>]|\bat\s+\w+\s*\(/
];
function classify(raw) {
	const t = raw.toLowerCase();
	if (/failed to fetch|networkerror|offline|err_internet|err_network|econnrefused|dns/.test(t)) return "offline";
	if (/\b401\b|unauthorized|invalid token|jwt|not logged in|session expired|useauth/.test(t)) return "signedOut";
	if (/\b403\b|forbidden|not allowed|permission|rest_forbidden/.test(t)) return "noPermission";
	if (/\b404\b|not found|rest_no_route|does not exist/.test(t)) return "notFound";
	if (/\b429\b|rate limit|too many/.test(t)) return "tooMany";
	if (/timeout|timed out|aborted/.test(t)) return "timeout";
	if (/\b4\d\d\b|invalid|required|missing|validation|bad request/.test(t)) return "invalid";
	if (/\b5\d\d\b|server error|internal|gateway|unavailable/.test(t)) return "server";
	return null;
}
/** True when the text reads like developer output. */
function isTechnical(text) {
	return TECHNICAL.some((re) => re.test(text));
}
/**
* Turn anything (Error, string, unknown) into a sentence a caregiver can read.
* Human-written messages are left alone.
*/
function friendlyMessage(input) {
	const text = (typeof input === "string" ? input : input instanceof Error ? input.message : typeof input?.message === "string" ? input.message : "").trim();
	if (!text) return say("unknown");
	const kind = classify(text);
	if (kind) return say(kind);
	if (isTechnical(text) || text.length > 180) return say("unknown");
	return text;
}
/**
* Same, but only rewrites strings; other React nodes pass through untouched.
*
* Toast titles are usually written by hand for caregivers ("Valid coordinates
* required. Use 'Pick on Map'."). Those must survive verbatim — replacing them
* with a generic sentence hides the one instruction that fixes the problem.
* Only text that reads like developer output gets rewritten here.
*/
function friendlyNode(value) {
	if (typeof value !== "string") return value;
	const text = value.trim();
	if (!text) return value;
	if (!isTechnical(text) && text.length <= 180) return value;
	return say(classify(text) ?? "unknown");
}
/** Generic heading for an error screen. */
function friendlyErrorTitle() {
	return isZh() ? "刚才出了点小问题" : "Something didn't work";
}
function friendlyRetryLabel() {
	return isZh() ? "重新加载" : "Try again";
}
var TOAST_LIMIT = 1;
var TOAST_REMOVE_DELAY = 1e6;
var count = 0;
function genId() {
	count = (count + 1) % Number.MAX_SAFE_INTEGER;
	return count.toString();
}
var toastTimeouts = /* @__PURE__ */ new Map();
var addToRemoveQueue = (toastId) => {
	if (toastTimeouts.has(toastId)) return;
	const timeout = setTimeout(() => {
		toastTimeouts.delete(toastId);
		dispatch({
			type: "REMOVE_TOAST",
			toastId
		});
	}, TOAST_REMOVE_DELAY);
	toastTimeouts.set(toastId, timeout);
};
var reducer = (state, action) => {
	switch (action.type) {
		case "ADD_TOAST": return {
			...state,
			toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
		};
		case "UPDATE_TOAST": return {
			...state,
			toasts: state.toasts.map((t) => t.id === action.toast.id ? {
				...t,
				...action.toast
			} : t)
		};
		case "DISMISS_TOAST": {
			const { toastId } = action;
			if (toastId) addToRemoveQueue(toastId);
			else state.toasts.forEach((toast) => {
				addToRemoveQueue(toast.id);
			});
			return {
				...state,
				toasts: state.toasts.map((t) => t.id === toastId || toastId === void 0 ? {
					...t,
					open: false
				} : t)
			};
		}
		case "REMOVE_TOAST":
			if (action.toastId === void 0) return {
				...state,
				toasts: []
			};
			return {
				...state,
				toasts: state.toasts.filter((t) => t.id !== action.toastId)
			};
	}
};
var listeners = [];
var memoryState = { toasts: [] };
function dispatch(action) {
	memoryState = reducer(memoryState, action);
	listeners.forEach((listener) => {
		listener(memoryState);
	});
}
function toast({ ...props }) {
	const id = genId();
	const humanize = (t) => ({
		...t,
		title: friendlyNode(t.title),
		description: friendlyNode(t.description)
	});
	const update = (props) => dispatch({
		type: "UPDATE_TOAST",
		toast: {
			...humanize(props),
			id
		}
	});
	const dismiss = () => dispatch({
		type: "DISMISS_TOAST",
		toastId: id
	});
	dispatch({
		type: "ADD_TOAST",
		toast: {
			...humanize(props),
			id,
			open: true,
			onOpenChange: (open) => {
				if (!open) dismiss();
			}
		}
	});
	return {
		id,
		dismiss,
		update
	};
}
function useToast() {
	const [state, setState] = import_react.useState(memoryState);
	import_react.useEffect(() => {
		listeners.push(setState);
		return () => {
			const index = listeners.indexOf(setState);
			if (index > -1) listeners.splice(index, 1);
		};
	}, [state]);
	return {
		...state,
		toast,
		dismiss: (toastId) => dispatch({
			type: "DISMISS_TOAST",
			toastId
		})
	};
}
//#endregion
export { useToast as a, toast as i, friendlyMessage as n, friendlyRetryLabel as r, friendlyErrorTitle as t };
