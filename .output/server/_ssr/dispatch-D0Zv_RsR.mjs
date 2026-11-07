import "../_runtime.mjs";
import { a as getWPToken } from "./wp-auth-DL1jfVY7.mjs";
import { i as currentAppScope } from "./app-scope-Cq6C10CZ.mjs";
import { n as detectSite } from "./SiteContext-Br0kF93Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dispatch-D0Zv_RsR.js
/**
* Single client entry point for sending a notification.
*
* Each app has exactly ONE notification edge function:
*   ChallengeD → `challenged-notify`
*   CareCNC    → `carecnc-notify`
*   Notch Safety shares ChallengeD's data scope but carries its own brand.
*
* Those functions own every channel (in-app inbox row, web push, email, SMS)
* and enforce the user's notification preferences, so the frontend never writes
* a notification row directly and can never double-send.
*/
var SUPABASE_URL = {
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
}["VITE_SUPABASE_URL"] || "";
var ANON_KEY = {
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
}["VITE_SUPABASE_PUBLISHABLE_KEY"] || "";
/** Resolve the notification function for the running app. */
function notifyFunctionName() {
	return currentAppScope() === "carecnc" ? "carecnc-notify" : "challenged-notify";
}
async function sendNotification(input) {
	const fn = notifyFunctionName();
	const detected = detectSite();
	const brand = detected === "notchsafety" ? "notchsafety" : detected === "carecnc" ? "carecnc" : "challenged";
	const branded = (item) => ({
		...item,
		brand
	});
	const payload = Array.isArray(input) ? { notifications: input.map(branded) } : branded(input);
	try {
		return (await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				apikey: ANON_KEY,
				"x-wp-token": getWPToken() ?? ""
			},
			body: JSON.stringify(payload)
		})).ok;
	} catch {
		return false;
	}
}
//#endregion
export { sendNotification };
