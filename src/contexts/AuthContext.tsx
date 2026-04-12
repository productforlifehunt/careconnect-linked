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
    phone_number: null,
    avatar_url: null,
    bio: null,
    location: null,
    address: null,
    address_latitude: null,
    address_longitude: null,
    timezone: null,
    currency: null,
    email_notification: true,
    push_notification: true,
    quiet_hour_start: null,
    quiet_hour_end: null,
    is_care_provider: false,
    is_cared_one: false,
    is_admin: false,
    provider_type: null,
    hourly_rate: null,
    specialty: null,
    service_offered: null,
    years_of_experience: null,
    certification: null,
    background_check_status: null,
    stripe_account_id: null,
    stripe_onboarding_complete: null,
    instant_book_enabled: null,
    provider_is_active: null,
    rating_average: null,
    rating_count: null,
    total_booking_count: null,
    response_time_minute: null,
    cancellation_policy: null,
    service_area: null,
    created_by_user_id: null,
    relationship_to_creator: null,
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
