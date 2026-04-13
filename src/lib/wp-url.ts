/**
 * Centralized WordPress base URL helper.
 * - In dev: uses Vite proxy (/wp-proxy/careconnected)
 * - In production: uses Supabase edge function proxy (HTTPS → HTTP)
 */

const WP_SITE_PATH = import.meta.env.VITE_WP_SITE_PATH || 'careconnected';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

/** Dev proxy path */
const DEV_WP_BASE = `/wp-proxy/${WP_SITE_PATH}`;

/** Production: edge function proxy URL */
const PROD_WP_PROXY = `${SUPABASE_URL}/functions/v1/wp-proxy`;

export const IS_DEV = import.meta.env.DEV;

/**
 * In dev mode, returns a direct URL like `/wp-proxy/careconnected/wp-json/...`
 * In production, returns a Supabase edge function URL with the WP path as a query param.
 */
export function buildWPUrl(wpJsonPath: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const qs = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      qs.set(key, String(value));
    });
  }

  if (IS_DEV) {
    const path = wpJsonPath.startsWith('/') ? wpJsonPath : `/wp-json/${wpJsonPath}`;
    const query = qs.toString();
    return `${DEV_WP_BASE}${path}${query ? `?${query}` : ''}`;
  }

  // Production: route through edge function
  qs.set('path', wpJsonPath.startsWith('/') ? wpJsonPath : `/wp-json/${wpJsonPath}`);
  return `${PROD_WP_PROXY}?${qs.toString()}`;
}

/**
 * Build headers for WP requests. In production, includes the Supabase anon key.
 */
export function buildWPHeaders(token?: string | null, contentType?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  if (!IS_DEV) {
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (anonKey) headers['apikey'] = anonKey;
  }
  
  return headers;
}
