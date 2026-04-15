import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * vendor-register Edge Function
 * 
 * Promotes a WordPress user to Dokan 'seller' role using admin credentials.
 * This MUST run server-side because role assignment requires admin auth.
 *
 * Flow (as designed by Dokan):
 * 1. Frontend calls this with user's JWT → we verify the user
 * 2. We use WP admin Application Password to set the user's role to 'seller'
 * 3. Dokan automatically recognizes the user as a vendor
 * 4. Frontend can then use dokan/v1/products with vendor's JWT to create products
 *
 * POST body: { "user_id": number, "store_name": string, "phone"?: string, "location"?: string }
 */

const WP_BASE_URL = "https://app.challenged-dementia.com/careconnected";
const WP_ADMIN_USER = "challenged";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Verify the caller is authenticated via their JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the JWT against WP to get the caller's user info
    const meResponse = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/users/me`, {
      headers: { Authorization: authHeader },
    });
    if (!meResponse.ok) {
      return new Response(JSON.stringify({ error: "Invalid JWT token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerUser = await meResponse.json();

    // 2. Parse request body
    const body = await req.json();
    const targetUserId = body.user_id || callerUser.id;
    const storeName = body.store_name || `${callerUser.name} Care Services`;

    // Security: users can only promote themselves (unless admin)
    const callerRoles: string[] = callerUser.roles || [];
    if (targetUserId !== callerUser.id && !callerRoles.includes("administrator")) {
      return new Response(JSON.stringify({ error: "Cannot modify another user's role" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Use WP admin Application Password to set the user role to 'seller'
    const wpAppPassword = Deno.env.get("WP_APP_PASSWORD");
    if (!wpAppPassword) {
      return new Response(JSON.stringify({ error: "Server configuration error: missing WP_APP_PASSWORD" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminAuth = btoa(`${WP_ADMIN_USER}:${wpAppPassword}`);

    // Check current roles — if already seller, skip role assignment
    const userCheckResp = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/users/${targetUserId}?context=edit`, {
      headers: { Authorization: `Basic ${adminAuth}` },
    });
    
    if (!userCheckResp.ok) {
      const errText = await userCheckResp.text();
      return new Response(JSON.stringify({ error: `Failed to fetch user: ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userData = await userCheckResp.json();
    const currentRoles: string[] = userData.roles || [];

    let roleUpdated = false;
    if (!currentRoles.includes("seller")) {
      // Add seller role — keep existing roles by adding seller
      const newRoles = [...new Set([...currentRoles, "seller"])];
      const roleResp = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/users/${targetUserId}`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${adminAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roles: newRoles }),
      });

      if (!roleResp.ok) {
        const errText = await roleResp.text();
        return new Response(JSON.stringify({ error: `Failed to set seller role: ${errText}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      roleUpdated = true;
    }

    // 4. Update Dokan store settings via admin API
    let storeResult = null;
    try {
      const storeResp = await fetch(`${WP_BASE_URL}/wp-json/dokan/v1/stores/${targetUserId}`, {
        method: "PUT",
        headers: {
          Authorization: `Basic ${adminAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store_name: storeName,
          phone: body.phone || "",
          address: { street_1: body.location || "" },
        }),
      });
      if (storeResp.ok) {
        storeResult = await storeResp.json();
      } else {
        console.warn("Store update failed:", await storeResp.text());
      }
    } catch (e) {
      console.warn("Store setup error:", e);
    }

    return new Response(JSON.stringify({
      success: true,
      user_id: targetUserId,
      role_updated: roleUpdated,
      roles: roleUpdated ? [...currentRoles, "seller"] : currentRoles,
      store: storeResult ? { id: storeResult.id, store_name: storeResult.store_name } : null,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
