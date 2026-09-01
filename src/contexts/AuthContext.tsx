import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Profile } from "@/types/care-connector";
import {
  wpLogin as wpAuthLogin,
  wpRegister as wpAuthRegister,
  wpValidateToken,
  wpLogout as wpAuthLogout,
  getStoredWPUser,
  type WPUser,
  type WPAuthResult,
} from "@/services/wp-auth";
import { fetchMyAppUserName, saveMyAppUserName } from "@/features/profile/app-user-name";

export type AuthSource = "wordpress" | null;

interface AuthContextType {
  user: Profile | null;
  session: null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authSource: AuthSource;
  login: (email: string, password: string) => Promise<void>;
  loginWithWP: (username: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convert a WP user into a Profile-compatible object.
 * The display name is NOT taken from WordPress (that name is shared by every
 * app on this backend) — it is hydrated from this app's own column on
 * JetEngine CCT 151 (a556 ChallengeD / a557 CareCNC) right after login.
 */
function wpUserToProfile(wp: WPUser, appName = ""): Profile {
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authSource, setAuthSource] = useState<AuthSource>(null);

  useEffect(() => {
    let cancelled = false;

    // Proactively purge stale tokens issued by old hostnames (pre domain migration).
    // NOTE: simple-jwt-login on this install issues tokens WITHOUT `iss`/`site`
    // claims, so absence of those claims must never invalidate a token — only a
    // claim that explicitly points at a foreign host, or an expired token, does.
    try {
      const token = localStorage.getItem("cc_wp_token");
      if (token) {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(parts[1].length / 4) * 4, "=")));
          const iss: string = payload?.iss || "";
          const site: string = payload?.site || "";
          const hasHostClaim = !!(iss || site);
          const hostOk =
            !hasHostClaim ||
            /challenged-dementia\.com/i.test(iss) ||
            /challenged-dementia\.com/i.test(site) ||
            /170\.106\.171\.59/.test(iss);
          // Also drop if expired
          const expired = typeof payload?.exp === "number" && payload.exp * 1000 <= Date.now();
          if (!hostOk || expired) {
            localStorage.removeItem("cc_wp_token");
            localStorage.removeItem("cc_wp_user");
          }
        }
      }
    } catch {
      // If we can't parse, leave it — the API call will trigger auto-recovery
    }


    // Restore WP session from localStorage (fast, no network)
    const storedWP = getStoredWPUser();
    if (storedWP) {
      setUser(wpUserToProfile(storedWP));
      setAuthSource("wordpress");
      setIsLoading(false);

      // Hydrate the display name from CCT 151 (this app's own column).
      fetchMyAppUserName()
        .then((appName) => { if (!cancelled) setUser(wpUserToProfile(storedWP, appName)); })
        .catch(() => { /* name stays empty until the profile row exists */ });

      wpValidateToken().then((validated) => {
        if (cancelled) return;
        if (!validated) {
          const stillHasToken = !!localStorage.getItem("cc_wp_token");
          if (!stillHasToken) {
            setUser(null);
            setAuthSource(null);
          }
        }
      });
    } else {
      setIsLoading(false);
    }

    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result: WPAuthResult = await wpAuthLogin(email, password);
    const wpUser: WPUser = {
      user_id: result.user_id,
      user_email: result.user_email,
      user_login: result.user_login,
      user_display_name: result.user_display_name,
    };
    setUser(wpUserToProfile(wpUser, await fetchMyAppUserName().catch(() => "")));
    setAuthSource("wordpress");
    setIsLoading(false);
  }, []);

  const loginWithWP = useCallback(async (username: string, password: string) => {
    const result: WPAuthResult = await wpAuthLogin(username, password);
    const wpUser: WPUser = {
      user_id: result.user_id,
      user_email: result.user_email,
      user_login: result.user_login,
      user_display_name: result.user_display_name,
    };
    setUser(wpUserToProfile(wpUser, await fetchMyAppUserName().catch(() => "")));
    setAuthSource("wordpress");
    setIsLoading(false);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, _role: string) => {
    const result: WPAuthResult = await wpAuthRegister(email, password, name);
    const wpUser: WPUser = {
      user_id: result.user_id,
      user_email: result.user_email,
      user_login: result.user_login,
      user_display_name: result.user_display_name,
    };
    // The name the user typed at signup belongs to this app's own column.
    await saveMyAppUserName(name);
    setUser(wpUserToProfile(wpUser, name));
    setAuthSource("wordpress");
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    wpAuthLogout();
    setUser(null);
    setAuthSource(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session: null,
      isAuthenticated: !!user,
      isLoading,
      authSource,
      login,
      loginWithWP,
      signup,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Signed-out fallback. A missing provider (only possible after a hot reload in
 * development) must never blow up a whole page in a caregiver's face — the app
 * simply renders as "not signed in".
 */
const SIGNED_OUT: AuthContextType = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  authSource: null,
  login: async () => {},
  loginWithWP: async () => {},
  signup: async () => {},
  logout: async () => {},
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    console.error("useAuth used outside AuthProvider — falling back to signed-out state");
    return SIGNED_OUT;
  }
  return ctx;
};

