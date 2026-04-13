import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WP_BASE_URL = "http://170.106.171.59:8080/careconnected";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-wp-path, x-wp-method",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // The WP path is passed as a query param or header
    const wpPath = url.searchParams.get("path") || req.headers.get("x-wp-path");
    if (!wpPath) {
      return new Response(JSON.stringify({ error: "Missing 'path' parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the target URL: wpPath should start with /wp-json/...
    // Strip any query params from wpPath if they were embedded, and forward remaining search params
    const cleanPath = wpPath.startsWith("/") ? wpPath : `/${wpPath}`;
    
    // Forward all query params except 'path' itself
    const forwardParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (key !== "path") forwardParams.set(key, value);
    });
    const qs = forwardParams.toString();
    const targetUrl = `${WP_BASE_URL}${cleanPath}${qs ? `?${qs}` : ""}`;

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

    const wpResponse = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // Read response
    const responseBody = await wpResponse.text();
    
    // Forward relevant response headers
    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      "Content-Type": wpResponse.headers.get("Content-Type") || "application/json",
    };
    
    // Forward WP pagination headers
    const wpTotal = wpResponse.headers.get("X-WP-Total");
    const wpTotalPages = wpResponse.headers.get("X-WP-TotalPages");
    if (wpTotal) responseHeaders["X-WP-Total"] = wpTotal;
    if (wpTotalPages) responseHeaders["X-WP-TotalPages"] = wpTotalPages;

    return new Response(responseBody, {
      status: wpResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
