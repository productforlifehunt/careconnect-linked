/**
 * Centralized WordPress base URL helper.
 * Reads the active server from wp-servers registry.
 * - In dev with main server: uses Vite proxy (/wp-proxy)
 * - Otherwise: uses Supabase edge function proxy
 */

import { getActiveServer } from "@/lib/wp-servers";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

/** Production: edge function proxy URL */
const PROD_WP_PROXY = `${SUPABASE_URL}/functions/v1/wp-proxy`;

export const IS_DEV = import.meta.env.DEV;

function canUseLocalViteProxy(): boolean {
  if (!IS_DEV || typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname);
}

/**
 * Returns the WP API URL for the given path.
 * In dev mode with the primary server, uses Vite proxy.
 * Otherwise routes through the edge function with a dynamic base URL header.
 */
export function buildWPUrl(wpJsonPath: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const server = getActiveServer();
  const qs = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      qs.set(key, String(value));
    });
  }

  const path = wpJsonPath.startsWith('/') ? wpJsonPath : `/wp-json/${wpJsonPath}`;

  // Local dev with primary server → use Vite proxy. Remote previews must use the backend proxy.
  if (canUseLocalViteProxy() && server.isPrimary) {
    const devBase = `/wp-proxy/${server.sitePath}`;
    const query = qs.toString();
    return `${devBase}${path}${query ? `?${query}` : ''}`;
  }

  // All other cases → edge function proxy
  qs.set('path', path);
  qs.set('wp_base', server.baseUrl);
  return `${PROD_WP_PROXY}?${qs.toString()}`;
}

/**
 * Build headers for WP requests. In production, includes the Supabase anon key.
 */
export function buildWPHeaders(token?: string | null, contentType?: string): Record<string, string> {
  const server = getActiveServer();
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  // Need anon key when going through edge function (prod, or dev with non-primary server)
  const useEdgeFunction = !canUseLocalViteProxy() || !server.isPrimary;
  if (useEdgeFunction) {
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (anonKey) headers['apikey'] = anonKey;
  }
  
  return headers;
}
