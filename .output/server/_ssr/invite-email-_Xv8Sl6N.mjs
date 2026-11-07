import "../_runtime.mjs";
import { a as getWPToken } from "./wp-auth-DL1jfVY7.mjs";
import { i as currentAppScope } from "./app-scope-Cq6C10CZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invite-email-_Xv8Sl6N.js
/**
* Emails a care-group invite link to an address that does not belong to an app
* user yet. Registered app users receive the same link as an in-app
* notification instead, so this path is only for outside addresses.
*
* The email travels through the app's single notification edge function
* (challenged-notify / carecnc-notify) with the email channel forced on and the
* inbox/push channels off — there is no inbox row to write for a stranger.
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
async function sendGroupInviteEmail(email, groupName, inviteUrl, joinCode) {
	const address = (email || "").trim();
	if (!address.includes("@")) return false;
	const fn = currentAppScope() === "carecnc" ? "carecnc-notify" : "challenged-notify";
	const name = groupName || "";
	const code = String(joinCode || "").trim();
	const codeLine = code ? ` After opening it, enter the join code: ${code}` : " After opening it, tap “Ask to join” and an admin will let you in.";
	try {
		const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				apikey: ANON_KEY,
				"x-wp-token": getWPToken() ?? ""
			},
			body: JSON.stringify({
				user_id: 0,
				type: "system",
				title: name ? `Invitation to join ${name}` : "Care group invitation",
				message: (name ? `You have been invited to join the care group "${name}". Open this link: ${inviteUrl}.` : `You have been invited to join a care group. Open this link: ${inviteUrl}.`) + codeLine,
				action_url: inviteUrl,
				email: address,
				channels: {
					inbox: false,
					push: false,
					email: true
				}
			})
		});
		if (!res.ok) return false;
		const body = await res.json().catch(() => null);
		const result = body?.result?.email ?? body?.email;
		return result ? result === "sent" : true;
	} catch {
		return false;
	}
}
//#endregion
export { sendGroupInviteEmail };
