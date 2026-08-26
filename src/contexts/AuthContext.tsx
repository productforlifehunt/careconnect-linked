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

/** Convert a WP user into a Profile-compatible object so the whole app works */
function wpUserToProfile(wp: WPUser): Profile {
  const nameParts = (wp.user_display_name || wp.user_login).split(" ");
  return {
    id: `wp-${wp.user_id}`,
    user_id: `wp-${wp.user_id}`,
    email: wp.user_email,
    first_name: nameParts[0] || null,
    last_name: nameParts.slice(1).join(" ") || null,
    full_name: wp.user_display_name || wp.user_login,
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
    setUser(wpUserToProfile(wpUser));
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
    setUser(wpUserToProfile(wpUser));
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
    setUser(wpUserToProfile(wpUser));
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

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
