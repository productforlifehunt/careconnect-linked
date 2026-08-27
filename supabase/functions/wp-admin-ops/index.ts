import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * wp-admin-ops
 *
 * Performs the handful of WordPress/Dokan operations that require an
 * administrator application password (vendor role assignment, Dokan store
 * upsert). Admin credentials NEVER leave this function — the browser only
 * sends its own WP JWT, which is validated here, and every operation is
 * scoped to that caller's own user id.
 */

const WP_ADMIN_USER = Deno.env.get("WP_ADMIN_USER") ?? "";
const WP_ADMIN_APP_PASSWORD = Deno.env.get("WP_ADMIN_APP_PASSWORD") ?? "";

const DEFAULT_WP_BASE = "https://app.challenged-dementia.com/afresh";
const ALLOWED_BASES = [DEFAULT_WP_BASE];

type Action =
  | "ensure_seller_role"
  | "get_my_store"
  | "upsert_my_store"
  | "get_bookings_product";

function adminHeaders(contentType = "application/json"): Record<string, string> {
  return {
    Authorization: `Basic ${btoa(`${WP_ADMIN_USER}:${WP_ADMIN_APP_PASSWORD}`)}`,
    "Content-Type": contentType,
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function resolveCaller(wpBase: string, token: string): Promise<number | null> {
  const res = await fetch(`${wpBase}/wp-json/wp/v2/users/me?context=edit`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const user = await res.json().catch(() => null);
  const id = Number(user?.id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!WP_ADMIN_USER || !WP_ADMIN_APP_PASSWORD) {
    return json({ error: "Server is missing WordPress admin credentials" }, 500);
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const action = String(payload?.action ?? "") as Action;
  const wpBase = ALLOWED_BASES.includes(String(payload?.wp_base)) ? String(payload.wp_base) : DEFAULT_WP_BASE;

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return json({ error: "Missing WordPress bearer token" }, 401);

  const userId = await resolveCaller(wpBase, token);
  if (!userId) return json({ error: "Invalid or expired WordPress session" }, 401);

  try {
    switch (action) {
      case "ensure_seller_role": {
        const res = await fetch(`${wpBase}/wp-json/wp/v2/users/${userId}`, {
          method: "POST",
          headers: adminHeaders(),
          body: JSON.stringify({ roles: ["seller"] }),
        });
        return json({ ok: res.ok, status: res.status }, res.ok ? 200 : 502);
      }

      case "get_my_store": {
        // Dokan ignores `include` on some versions, so filter defensively:
        // a Dokan store id is always the vendor's WP user id.
        const res = await fetch(`${wpBase}/wp-json/dokan/v1/stores?include=${userId}&per_page=100`, {
          headers: adminHeaders(),
        });
        const raw = await res.json().catch(() => null);
        const data = Array.isArray(raw)
          ? raw.filter((store: any) => Number(store?.id) === userId)
          : [];
        return json({ ok: res.ok, data }, res.ok ? 200 : 502);
      }

      case "upsert_my_store": {
        const store = payload?.store ?? {};
        const body = {
          ...(store.store_name !== undefined ? { store_name: String(store.store_name) } : {}),
          ...(store.phone !== undefined ? { phone: String(store.phone) } : {}),
          ...(store.address !== undefined ? { address: store.address } : {}),
          ...(store.description !== undefined ? { description: String(store.description) } : {}),
        };
        // Always scoped to the caller's own store id (= WP user id in Dokan).
        const putStore = () =>
          fetch(`${wpBase}/wp-json/dokan/v1/stores/${userId}`, {
            method: "PUT",
            headers: adminHeaders(),
            body: JSON.stringify(body),
          });

        let res = await putStore();
        if (res.status === 404) {
          // No Dokan store yet — promote to seller (this provisions the store),
          // then retry once.
          await fetch(`${wpBase}/wp-json/wp/v2/users/${userId}`, {
            method: "POST",
            headers: adminHeaders(),
            body: JSON.stringify({ roles: ["seller"] }),
          });
          res = await putStore();
        }
        const data = await res.json().catch(() => null);
        return json({ ok: res.ok, data }, res.ok ? 200 : 502);
      }

      case "get_bookings_product": {
        const productId = Number(payload?.product_id);
        if (!Number.isFinite(productId) || productId <= 0) {
          return json({ error: "product_id must be a positive number" }, 400);
        }
        const res = await fetch(`${wpBase}/wp-json/wc-bookings/v1/products/${productId}`, {
          headers: adminHeaders(),
        });
        const data = await res.json().catch(() => null);
        return json({ ok: res.ok, data }, res.ok ? 200 : 502);
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    return json({ error: String(error) }, 500);
  }
});
