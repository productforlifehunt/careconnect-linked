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
const WC_CONSUMER_KEY = Deno.env.get("WC_CONSUMER_KEY") ?? "";
const WC_CONSUMER_SECRET = Deno.env.get("WC_CONSUMER_SECRET") ?? "";

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

      // Just-in-time care-service product: created at the exact moment the
      // client adds a booking (or accepts a quote) to the cart. Buyers have no
      // wc/v3 product-create capability, so the store keys do it here and the
      // product is tagged with the caregiver's Dokan vendor id for commission.
      case "create_service_product": {
        const name = String(payload?.name ?? "").trim().slice(0, 200);
        const amount = Number(payload?.amount);
        const vendorId = Number(payload?.vendor_user_id);
        if (!name) return json({ error: "name is required" }, 400);
        if (!Number.isFinite(amount) || amount <= 0) return json({ error: "amount must be > 0" }, 400);
        if (!Number.isFinite(vendorId) || vendorId <= 0) return json({ error: "vendor_user_id must be a positive number" }, 400);
        if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
          return json({ error: "Server is missing WooCommerce store keys" }, 500);
        }

        const rawMeta = Array.isArray(payload?.meta) ? payload.meta : [];
        const meta = rawMeta
          .filter((m: any) => m && typeof m.key === "string")
          .slice(0, 30)
          .map((m: any) => ({ key: String(m.key).slice(0, 80), value: String(m.value ?? "").slice(0, 500) }));
        if (!meta.some((m: { key: string }) => m.key === "_dokan_vendor_id")) {
          meta.push({ key: "_dokan_vendor_id", value: String(vendorId) });
        }
        meta.push({ key: "_care_buyer_user_id", value: String(userId) });

        const res = await fetch(`${wpBase}/wp-json/wc/v3/products`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            type: "simple",
            status: "publish",
            catalog_visibility: "hidden",
            virtual: true,
            sold_individually: true,
            regular_price: String(amount),
            description: String(payload?.description ?? "").slice(0, 2000),
            meta_data: meta,
          }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          console.error(`create_service_product failed [${res.status}]`, JSON.stringify(data));
          return json({ error: "WooCommerce product creation failed", status: res.status, details: data }, 502);
        }
        return json({ ok: true, id: Number(data?.id), price: Number(data?.price || amount) });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    return json({ error: String(error) }, 500);
  }
});
