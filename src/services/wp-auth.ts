/**
 * WordPress JWT Authentication Service
 */

const WP_SITE_PATH = import.meta.env.VITE_WP_SITE_PATH || 'careconnected';
const REMOTE_WP_BASE_URL = import.meta.env.VITE_WP_BASE_URL || `http://170.106.171.59:8080/${WP_SITE_PATH}`;
const WP_BASE_URL = import.meta.env.DEV ? `/wp-proxy/${WP_SITE_PATH}` : REMOTE_WP_BASE_URL;
const TOKEN_KEY = 'cc_wp_token';
const USER_KEY = 'cc_wp_user';

export interface WPUser {
  user_id: number;
  user_email: string;
  user_login: string;
  user_display_name: string;
}

export interface WPAuthResult {
  success: boolean;
  token: string;
  expires: number;
  user_id: number;
  user_email: string;
  user_login: string;
  user_display_name: string;
}

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function userFromToken(token: string, fallbackIdentifier: string): WPUser {
  const payload = decodeJwtPayload(token) || {};
  const data = payload.data ?? payload;
  const userEmail = String(data.user_email ?? payload.email ?? fallbackIdentifier);
  const userLogin = String(data.user_login ?? payload.username ?? userEmail);
  const userId = Number(data.user_id ?? payload.id ?? 0);
  const userDisplayName = String(data.user_display_name ?? payload.username ?? (userLogin || fallbackIdentifier));

  return {
    user_id: userId,
    user_email: userEmail,
    user_login: userLogin,
    user_display_name: userDisplayName,
  };
}

async function fetchCurrentWpUser(token: string): Promise<WPUser | null> {
  try {
    const response = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/users/me?context=edit`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) return null;

    const data = await response.json();
    const userId = Number(data?.id ?? 0);
    const userEmail = String(data?.email ?? '');
    const userLogin = String(data?.slug ?? data?.username ?? '');
    const userDisplayName = String(data?.name ?? userLogin);

    if (!userId || !userLogin) return null;

    return {
      user_id: userId,
      user_email: userEmail,
      user_login: userLogin,
      user_display_name: userDisplayName,
    };
  } catch {
    return null;
  }
}

async function tryJwtAuthLogin(identifier: string, password: string): Promise<any | null> {
  const response = await fetch(`${WP_BASE_URL}/wp-json/jwt-auth/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username: identifier, password }),
  });

  const data = await response.json().catch(() => null);
  if (response.ok && data?.token) {
    return data;
  }

  return null;
}

async function trySimpleJwtLogin(identifier: string, password: string): Promise<any | null> {
  const body = identifier.includes('@')
    ? { email: identifier, password }
    : { username: identifier, password };

  const response = await fetch(`${WP_BASE_URL}/wp-json/simple-jwt-login/v1/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (response.ok && data?.success && data.data?.jwt) {
    return data;
  }

  return null;
}

/**
 * Authenticate against WordPress and receive a JWT token.
 */
export async function wpLogin(usernameOrEmail: string, password: string): Promise<WPAuthResult> {
  const sjlData = await trySimpleJwtLogin(usernameOrEmail, password);

  if (!sjlData?.success || !sjlData.data?.jwt) {
    const message = sjlData?.data?.message || 'WordPress authentication failed';
    throw new Error(message);
  }

  const sjlToken = sjlData.data.jwt;
  const wpUser = await fetchCurrentWpUser(sjlToken) || userFromToken(sjlToken, usernameOrEmail);

  localStorage.setItem(TOKEN_KEY, sjlToken);
  localStorage.setItem(USER_KEY, JSON.stringify(wpUser));

  return {
    success: true,
    token: sjlToken,
    expires: 0,
    user_id: wpUser.user_id,
    user_email: wpUser.user_email,
    user_login: wpUser.user_login,
    user_display_name: wpUser.user_display_name,
  };
}

/**
 * Validate a stored token against WordPress.
 */
export async function wpValidateToken(): Promise<WPUser | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const payload = decodeJwtPayload(token);
    if (!payload) {
      wpLogout();
      return null;
    }

    const exp = typeof payload.exp === 'number' ? payload.exp : null;
    if (exp && exp * 1000 <= Date.now()) {
      wpLogout();
      return null;
    }

    const verifiedUser = await fetchCurrentWpUser(token);
    if (verifiedUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser));
      return verifiedUser;
    }

    const storedUser = getStoredWPUser();
    if (!storedUser) {
      wpLogout();
      return null;
    }

    return storedUser;
  } catch {
    wpLogout();
    return null;
  }
}

/**
 * Clear WP auth state.
 */
export function wpLogout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Get the stored WP token.
 */
export function getWPToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Check if user is currently in WP auth mode (has a stored WP token).
 */
export function isWPAuthMode(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

/**
 * Get the stored WP user (without network call).
 */
export function getStoredWPUser(): WPUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WPUser;
  } catch {
    return null;
  }
}

export async function wpUploadMedia(file: File): Promise<string> {
  const token = getWPToken();
  if (!token) throw new Error('Not authenticated');
  const formData = new FormData();
  formData.append('file', file, file.name);
  const res = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${res.status} - ${err}`);
  }
  const data = await res.json();
  return data.source_url || data.guid?.rendered || '';
}

export async function wpRequestPasswordReset(email: string): Promise<void> {
  // Try Simple JWT Login reset endpoint first (fully headless REST)
  const sjlRes = await fetch(`${WP_BASE_URL}/wp-json/simple-jwt-login/v1/user/reset_password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (sjlRes.ok) return;

  // Fallback: POST to WP lost-password handler (still headless — no browser redirect)
  const res = await fetch(`${WP_BASE_URL}/wp-login.php?action=lostpassword`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `user_login=${encodeURIComponent(email)}&redirect_to=&wp-submit=Get+New+Password`,
  });
  if (!res.ok && res.status !== 302) {
    throw new Error('Password reset request failed. Please try again.');
  }
}

export async function wpRegister(email: string, password: string, displayName?: string): Promise<WPAuthResult> {
  // Try Simple JWT Login register endpoint
  const res = await fetch(`${WP_BASE_URL}/wp-json/simple-jwt-login/v1/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, user_login: email, display_name: displayName || email }),
  });
  const data = await res.json();
  if (!res.ok || (!data?.success && !data?.user)) {
    const msg = data?.data?.message || data?.message || 'Registration failed';
    throw new Error(msg);
  }
  // Auto-login after registration
  return wpLogin(email, password);
}

export async function wpDeleteAccount(): Promise<void> {
  const token = getWPToken();
  if (!token) throw new Error('Not authenticated');
  // Anonymize user data (GDPR soft-delete — users can't self-delete via WP REST without admin)
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const res = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/users/me`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      first_name: 'Deleted',
      last_name: 'User',
      name: `deleted_${randomSuffix}`,
      description: '',
      url: '',
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Account deletion failed: ${res.status} - ${err}`);
  }
  // Clear local session
  wpLogout();
}

export async function wpChangePassword(newPassword: string): Promise<void> {
  const token = getWPToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/users/me`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ password: newPassword }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Password change failed: ${res.status} - ${err}`);
  }
}
