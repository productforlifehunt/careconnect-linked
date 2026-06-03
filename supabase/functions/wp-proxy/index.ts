import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/** Default WP base URL - used when no wp_base param is provided */
const DEFAULT_WP_BASE_URL = "https://app.challenged-dementia.com/careconnected";
const FALLBACK_WP_BASE_URL = "https://afresh-1202589.ingress-erytho.ewp.live";
const UPSTREAM_TIMEOUT_MS = 15000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-wp-path, x-wp-method, cart-token, nonce, x-wc-store-api-nonce",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Expose-Headers": "Cart-Token, Nonce, X-WC-Store-API-Nonce, X-WP-Total, X-WP-TotalPages, X-WP-Upstream-Base, X-WP-Fallback-Used",
};

function buildTargetUrl(wpBase: string, wpPath: string, incomingUrl: URL): string {
  const trimmedBase = wpBase.endsWith("/") ? wpBase.slice(0, -1) : wpBase;
  const cleanPath = wpPath.startsWith("/") ? wpPath : `/${wpPath}`;
  const targetUrl = new URL(`${trimmedBase}${cleanPath}`);

  incomingUrl.searchParams.forEach((value, key) => {
    if (key !== "path" && key !== "wp_base") {
      targetUrl.searchParams.append(key, value);
    }
  });

  return targetUrl.toString();
}

function shouldRetryUpstream(status: number, body: string): boolean {
  if ([502, 503, 504, 522, 523, 524].includes(status)) return true;
  if (status >= 500) return true;
  return /bad gateway|cloudflare/i.test(body);
}

function getCandidateBases(requestedBase: string): string[] {
  const normalizedBase = requestedBase.endsWith("/") ? requestedBase.slice(0, -1) : requestedBase;
  if (normalizedBase === DEFAULT_WP_BASE_URL) {
    return [DEFAULT_WP_BASE_URL, FALLBACK_WP_BASE_URL];
  }
  return [normalizedBase];
}

function createErrorResponse(status: number, payload: unknown, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function isOptionalJetRelationLookup(method: string, wpPath: string, status: number): boolean {
  return method === "GET" && status === 404 && /(^|\/)wp-json\/jet-rel\/\d+\/(children|parents|parent)\/\d+\/?$/i.test(wpPath);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // The WP path is passed as a query param or header
    const wpPath = url.searchParams.get("path") || req.headers.get("x-wp-path");
    if (!wpPath) {
      return createErrorResponse(400, { ok: false, error: "Missing 'path' parameter" });
    }

    // Dynamic server: read wp_base from query param, fallback to default
    const wpBase = url.searchParams.get("wp_base") || DEFAULT_WP_BASE_URL;

    // Forward headers (especially Authorization)
    const headers: Record<string, string> = {};
    const authHeader = req.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;
    
    const contentType = req.headers.get("content-type");
    if (contentType) headers["Content-Type"] = contentType;

    // Forward the request body for non-GET methods
    let body: string | null = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.text();
    }

    const candidateBases = getCandidateBases(wpBase);
    let lastError: { baseUrl: string; targetUrl: string; status?: number; body?: string; error?: string } | null = null;

    for (let i = 0; i < candidateBases.length; i++) {
      const baseUrl = candidateBases[i];
      const targetUrl = buildTargetUrl(baseUrl, wpPath, url);

      try {
        const wpResponse = await fetch(targetUrl, {
          method: req.method,
          headers,
          body,
          signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        });

        const responseBody = await wpResponse.text();
        const shouldRetry = i < candidateBases.length - 1 && shouldRetryUpstream(wpResponse.status, responseBody);

        if (shouldRetry) {
          lastError = { baseUrl, targetUrl, status: wpResponse.status, body: responseBody };
          continue;
        }

        if (isOptionalJetRelationLookup(req.method, wpPath, wpResponse.status)) {
          return new Response("[]", {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "X-WP-Upstream-Base": baseUrl,
              "X-WP-Fallback-Used": i > 0 ? "1" : "0",
              "X-WP-Optional-Relation-Missing": "1",
            },
          });
        }

        if (!wpResponse.ok && wpResponse.status >= 500) {
          return createErrorResponse(502, {
            ok: false,
            error: "WordPress upstream returned a gateway/server error",
            diagnostics: {
              requested_base: wpBase,
              attempted_base: baseUrl,
              fallback_used: i > 0,
              requested_path: wpPath,
              target_url: targetUrl,
              upstream_status: wpResponse.status,
              upstream_body_preview: responseBody.slice(0, 400),
            },
          }, {
            "X-WP-Upstream-Base": baseUrl,
            "X-WP-Fallback-Used": i > 0 ? "1" : "0",
          });
        }

        const responseHeaders: Record<string, string> = {
          ...corsHeaders,
          "Content-Type": wpResponse.headers.get("Content-Type") || "application/json",
          "X-WP-Upstream-Base": baseUrl,
          "X-WP-Fallback-Used": i > 0 ? "1" : "0",
        };

        const wpTotal = wpResponse.headers.get("X-WP-Total");
        const wpTotalPages = wpResponse.headers.get("X-WP-TotalPages");
        if (wpTotal) responseHeaders["X-WP-Total"] = wpTotal;
        if (wpTotalPages) responseHeaders["X-WP-TotalPages"] = wpTotalPages;

        return new Response(responseBody, {
          status: wpResponse.status,
          headers: responseHeaders,
        });
      } catch (error) {
        lastError = {
          baseUrl,
          targetUrl,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return createErrorResponse(502, {
      ok: false,
      error: "WordPress upstream is unavailable",
      diagnostics: {
        requested_base: wpBase,
        requested_path: wpPath,
        attempted_bases: candidateBases,
        last_attempt: lastError,
      },
    });
  } catch (error) {
    return createErrorResponse(502, {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
