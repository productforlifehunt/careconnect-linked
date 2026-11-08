import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Profile } from "@/types/care-connector";
import {
  wpLogin as wpAuthLogin,
  wpRegister as wpAuthRegister,
  wpValidateToken,
  wpLogout as wpAuthLogout,
  getStoredWPUser,
  getWPToken,
  type WPUser,
  type WPAuthResult,
} from "@/services/wp-auth";
import {
  fetchMyAppUserName,
  saveMyAppUserName,
} from "@/features/profile/app-user-name";
import { APP_PROFILE_F, ensureAppProfile } from "@/features/shared/app-profile";
import { useQueryClient } from "@tanstack/react-query";

export type AuthSource = "wordpress" | null;

interface AuthContextType {
  user: Profile | null;
  session: null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authSource: AuthSource;
  login: (email: string, password: string) => Promise<void>;
  loginWithWP: (username: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: string,
  ) => Promise<void>;
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

function readInitialAuthState(): {
  user: Profile | null;
  authSource: AuthSource;
  wpUser: WPUser | null;
} {
  if (typeof window === "undefined")
    return { user: null, authSource: null, wpUser: null };

  try {
    // Reject locally known stale tokens before cached identity reaches protected routes.
    const token = localStorage.getItem("cc_wp_token");
    if (token) {
      const parts = token.split(".");
      if (parts.length === 3 && parts[1]) {
        const payload = JSON.parse(
          atob(
            parts[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/")
              .padEnd(Math.ceil(parts[1].length / 4) * 4, "="),
          ),
        );
        const iss: string = payload?.iss || "";
        const site: string = payload?.site || "";
        const hasHostClaim = !!(iss || site);
        const hostOk =
          !hasHostClaim ||
          /challenged-dementia\.com/i.test(iss) ||
          /challenged-dementia\.com/i.test(site) ||
          /170\.106\.171\.59/.test(iss);
        const expired =
          typeof payload?.exp === "number" && payload.exp * 1000 <= Date.now();
        if (!hostOk || expired) {
          localStorage.removeItem("cc_wp_token");
          localStorage.removeItem("cc_wp_user");
        }
      }
    }

    const storedWP = getStoredWPUser();
    return storedWP
      ? {
          user: wpUserToProfile(storedWP),
          authSource: "wordpress",
          wpUser: storedWP,
        }
      : { user: null, authSource: null, wpUser: null };
  } catch {
    // Preserve the previous offline restore behavior if only token decoding failed.
    try {
      const storedWP = getStoredWPUser();
      return storedWP
        ? {
            user: wpUserToProfile(storedWP),
            authSource: "wordpress",
            wpUser: storedWP,
          }
        : { user: null, authSource: null, wpUser: null };
    } catch {
      return { user: null, authSource: null, wpUser: null };
    }
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const clearAccountReads = useCallback(() => {
    queryClient.clear();
    window.dispatchEvent(new CustomEvent("wp-write"));
  }, [queryClient]);
  const [initialAuth] = useState(readInitialAuthState);
  const [user, setUser] = useState<Profile | null>(initialAuth.user);
  const [isLoading, setIsLoading] = useState(false);
  const [authSource, setAuthSource] = useState<AuthSource>(
    initialAuth.authSource,
  );

  useEffect(() => {
    let cancelled = false;

    // The cached session is already available to the first render. Refresh the
    // app-specific display name and validate its token in the background.
    const storedWP = initialAuth.wpUser;
    if (storedWP) {
      // Hydrate the display name from CCT 151 (this app's own column).
      fetchMyAppUserName()
        .then((appName) => {
          if (!cancelled) setUser(wpUserToProfile(storedWP, appName));
        })
        .catch(() => {
          /* name stays empty until the profile row exists */
        });

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
    }

    return () => {
      cancelled = true;
    };
  }, [initialAuth.wpUser]);

  const finishLogin = useCallback((wpUser: WPUser, token: string) => {
    // Credentials and the current WP user are verified by wpLogin. Let the
    // caller enter the app now; app-specific profile repair/name hydration can
    // finish in the background without delaying navigation.
    setUser(wpUserToProfile(wpUser));
    setAuthSource("wordpress");
    setIsLoading(false);

    void ensureAppProfile()
      .then((profile) => {
        if (!profile || getWPToken() !== token) return;
        const storedName = profile.row?.[APP_PROFILE_F.NAME];
        const appName = typeof storedName === "string" ? storedName.trim() : "";
        setUser(wpUserToProfile(wpUser, appName));
      })
      .catch(async () => {
        if (getWPToken() !== token) return;
        const appName = await fetchMyAppUserName().catch(() => "");
        if (getWPToken() === token) setUser(wpUserToProfile(wpUser, appName));
      });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result: WPAuthResult = await wpAuthLogin(email, password);
      clearAccountReads();
      const wpUser: WPUser = {
        user_id: result.user_id,
        user_email: result.user_email,
        user_login: result.user_login,
        user_display_name: result.user_display_name,
      };
      finishLogin(wpUser, result.token);
    },
    [clearAccountReads, finishLogin],
  );

  const loginWithWP = useCallback(
    async (username: string, password: string) => {
      const result: WPAuthResult = await wpAuthLogin(username, password);
      clearAccountReads();
      const wpUser: WPUser = {
        user_id: result.user_id,
        user_email: result.user_email,
        user_login: result.user_login,
        user_display_name: result.user_display_name,
      };
      finishLogin(wpUser, result.token);
    },
    [clearAccountReads, finishLogin],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string, _role: string) => {
      const result: WPAuthResult = await wpAuthRegister(email, password, name);
      clearAccountReads();
      const wpUser: WPUser = {
        user_id: result.user_id,
        user_email: result.user_email,
        user_login: result.user_login,
        user_display_name: result.user_display_name,
      };
      // The name the user typed at signup belongs to this app's own row (a55).
      await ensureAppProfile().catch(() => null);
      await saveMyAppUserName(name);
      setUser(wpUserToProfile(wpUser, name));
      setAuthSource("wordpress");
      setIsLoading(false);
    },
    [clearAccountReads],
  );

  const logout = useCallback(async () => {
    wpAuthLogout();
    clearAccountReads();
    setUser(null);
    setAuthSource(null);
  }, [clearAccountReads]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session: null,
        isAuthenticated: !!user,
        isLoading,
        authSource,
        login,
        loginWithWP,
        signup,
        logout,
      }}
    >
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
    console.error(
      "useAuth used outside AuthProvider — falling back to signed-out state",
    );
    return SIGNED_OUT;
  }
  return ctx;
};
