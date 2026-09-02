/**
 * Centralized WordPress base URL helper.
 * Reads the active server from wp-servers registry.
 * - Default: direct HTTPS to WordPress (JWT auth, permissive CORS) — no proxy.
 * - Only credentialed guest reads (Woo catalog keys, sanitized provider search)
 *   go through the backend proxy.
 */

import { getActiveServer } from "@/lib/wp-servers";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

/** Backend proxy URL — used only for credentialed guest reads. */
const PROD_WP_PROXY = `${SUPABASE_URL}/functions/v1/wp-proxy`;

export const IS_DEV = import.meta.env.DEV;


/**
 * Returns the WP API URL for the given path.
 * In dev mode with the primary server, uses Vite proxy.
 * Otherwise routes through the edge function with a dynamic base URL header.
 */
export function buildWPUrl(
  wpJsonPath: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  options?: { forceEdge?: boolean },
): string {
  const server = getActiveServer();
  const qs = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      qs.set(key, String(value));
    });
  }

  const path = wpJsonPath.startsWith('/') ? wpJsonPath : `/wp-json/${wpJsonPath}`;

  // WordPress is HTTPS and sends permissive CORS headers, so both dev and
  // production talk to it directly — no proxy hop, no cold start, identical
  // behaviour in every environment.
  if (!options?.forceEdge) {
    const query = qs.toString();
    return `${server.baseUrl}${path}${query ? `?${query}` : ''}`;
  }


  // Guest / credentialed catalog reads → edge function proxy
  qs.set('path', path);
  qs.set('wp_base', server.baseUrl);
  return `${PROD_WP_PROXY}?${qs.toString()}`;

}

/**
 * Build headers for WP requests. In production, includes the Supabase anon key.
 */
export function buildWPHeaders(
  token?: string | null,
  contentType?: string,
  options?: { forceEdge?: boolean },
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  // The anon key is only needed when the request actually goes through the
  // Supabase edge function (guest / credentialed catalog reads).
  const useEdgeFunction = options?.forceEdge === true;
  if (useEdgeFunction) {
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (anonKey) headers['apikey'] = anonKey;
  }

  
  return headers;
}
