import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { c as wpLogin, d as wpRegister, i as getStoredWPUser, l as wpLogout, m as wpValidateToken } from "./wp-auth-DL1jfVY7.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { i as ensureAppProfile, m as saveMyAppUserName, s as fetchMyAppUserName } from "./app-profile-DeZHIfiB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AuthContext-BAA6n6xi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)(void 0);
/**
* Convert a WP user into a Profile-compatible object.
* The display name is NOT taken from WordPress (that name is shared by every
* app on this backend) — it is hydrated from this app's own column on
* JetEngine CCT 151 (a556 ChallengeD / a557 CareCNC) right after login.
*/
function wpUserToProfile(wp, appName = "") {
	const nameParts = appName.split(" ");
	return {
		id: `wp-${wp.user_id}`,
		user_id: `wp-${wp.user_id}`,
		email: wp.user_email,
		first_name: nameParts[0] || null,
		last_name: nameParts.slice(1).join(" ") || null,
		full_name: appName,
		user_name: wp.user_login,
		avatar_url: null,
		bio: null,
		general_user_role: null,
		is_care_provider: false,
		provider_is_active: false,
		care_provider_is_background_checked: false,
		care_provider_background_check_detail: null,
		care_provider_starts_hourly_rate: null,
		phone: null,
		location: null,
		years_of_experience: null,
		certifications: null,
		specialty: null,
		rating_average: null,
		rating_count: null,
		created_at: (/* @__PURE__ */ new Date()).toISOString(),
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
var AuthProvider = ({ children }) => {
	const queryClient = useQueryClient();
	const clearAccountReads = (0, import_react.useCallback)(() => {
		queryClient.clear();
		window.dispatchEvent(new CustomEvent("wp-write"));
	}, [queryClient]);
	const [user, setUser] = (0, import_react.useState)(null);
	const [isLoading, setIsLoading] = (0, import_react.useState)(true);
	const [authSource, setAuthSource] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		try {
			const token = localStorage.getItem("cc_wp_token");
			if (token) {
				const parts = token.split(".");
				if (parts.length === 3) {
					const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(parts[1].length / 4) * 4, "=")));
					const iss = payload?.iss || "";
					const site = payload?.site || "";
					const hostOk = !!!(iss || site) || /challenged-dementia\.com/i.test(iss) || /challenged-dementia\.com/i.test(site) || /170\.106\.171\.59/.test(iss);
					const expired = typeof payload?.exp === "number" && payload.exp * 1e3 <= Date.now();
					if (!hostOk || expired) {
						localStorage.removeItem("cc_wp_token");
						localStorage.removeItem("cc_wp_user");
					}
				}
			}
		} catch {}
		const storedWP = getStoredWPUser();
		if (storedWP) {
			setUser(wpUserToProfile(storedWP));
			setAuthSource("wordpress");
			setIsLoading(false);
			fetchMyAppUserName().then((appName) => {
				if (!cancelled) setUser(wpUserToProfile(storedWP, appName));
			}).catch(() => {});
			wpValidateToken().then((validated) => {
				if (cancelled) return;
				if (!validated) {
					if (!!!localStorage.getItem("cc_wp_token")) {
						setUser(null);
						setAuthSource(null);
					}
				}
			});
		} else setIsLoading(false);
		return () => {
			cancelled = true;
		};
	}, []);
	const login = (0, import_react.useCallback)(async (email, password) => {
		const result = await wpLogin(email, password);
		clearAccountReads();
		const wpUser = {
			user_id: result.user_id,
			user_email: result.user_email,
			user_login: result.user_login,
			user_display_name: result.user_display_name
		};
		await ensureAppProfile().catch(() => null);
		setUser(wpUserToProfile(wpUser, await fetchMyAppUserName().catch(() => "")));
		setAuthSource("wordpress");
		setIsLoading(false);
	}, [clearAccountReads]);
	const loginWithWP = (0, import_react.useCallback)(async (username, password) => {
		const result = await wpLogin(username, password);
		clearAccountReads();
		const wpUser = {
			user_id: result.user_id,
			user_email: result.user_email,
			user_login: result.user_login,
			user_display_name: result.user_display_name
		};
		await ensureAppProfile().catch(() => null);
		setUser(wpUserToProfile(wpUser, await fetchMyAppUserName().catch(() => "")));
		setAuthSource("wordpress");
		setIsLoading(false);
	}, [clearAccountReads]);
	const signup = (0, import_react.useCallback)(async (name, email, password, _role) => {
		const result = await wpRegister(email, password, name);
		clearAccountReads();
		const wpUser = {
			user_id: result.user_id,
			user_email: result.user_email,
			user_login: result.user_login,
			user_display_name: result.user_display_name
		};
		await ensureAppProfile().catch(() => null);
		await saveMyAppUserName(name);
		setUser(wpUserToProfile(wpUser, name));
		setAuthSource("wordpress");
		setIsLoading(false);
	}, [clearAccountReads]);
	const logout = (0, import_react.useCallback)(async () => {
		wpLogout();
		clearAccountReads();
		setUser(null);
		setAuthSource(null);
	}, [clearAccountReads]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			user,
			session: null,
			isAuthenticated: !!user,
			isLoading,
			authSource,
			login,
			loginWithWP,
			signup,
			logout
		},
		children
	});
};
/**
* Signed-out fallback. A missing provider (only possible after a hot reload in
* development) must never blow up a whole page in a caregiver's face — the app
* simply renders as "not signed in".
*/
var SIGNED_OUT = {
	user: null,
	session: null,
	isAuthenticated: false,
	isLoading: false,
	authSource: null,
	login: async () => {},
	loginWithWP: async () => {},
	signup: async () => {},
	logout: async () => {}
};
var useAuth = () => {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) {
		console.error("useAuth used outside AuthProvider — falling back to signed-out state");
		return SIGNED_OUT;
	}
	return ctx;
};
//#endregion
export { useAuth as n, AuthProvider as t };
