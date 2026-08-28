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
  | "get_bookings_product"
  | "create_service_product"
  | "list_my_orders"
  | "list_my_vendor_orders"
  | "set_order_status"
  | "get_my_payout"
  | "save_my_payout"
  | "request_withdrawal";



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

/**
 * The agreed schedule lives on the just-in-time care product's meta. wc/v3
 * orders do not expand product meta, so pull it once per product and merge the
 * booking keys onto the order the UI reads.
 */
async function enrichOrdersWithServiceMeta(wpBase: string, orders: any[]): Promise<any[]> {
  const auth = `Basic ${btoa(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`)}`;
  const cache = new Map<number, any[]>();
  const out: any[] = [];
  for (const order of orders) {
    const productId = Number(order?.line_items?.[0]?.product_id);
    let productMeta: any[] = [];
    if (Number.isFinite(productId) && productId > 0) {
      if (cache.has(productId)) {
        productMeta = cache.get(productId)!;
      } else {
        try {
          const res = await fetch(`${wpBase}/wp-json/wc/v3/products/${productId}`, {
            headers: { Authorization: auth },
          });
          const product = res.ok ? await res.json().catch(() => null) : null;
          productMeta = Array.isArray(product?.meta_data) ? product.meta_data : [];
        } catch {
          productMeta = [];
        }
        cache.set(productId, productMeta);
      }
    }
    const pick = (key: string) => {
      const hit = productMeta.find((m: any) => m?.key === key);
      return hit?.value !== undefined && hit?.value !== null ? String(hit.value) : "";
    };
    const merged = Array.isArray(order?.meta_data) ? [...order.meta_data] : [];
    const has = (key: string) => merged.some((m: any) => m?.key === key && String(m?.value ?? "") !== "");
    const add = (key: string, value: string) => {
      if (value && !has(key)) merged.push({ key, value });
    };
    add("_appointment_date", pick("_care_service_start_date"));
    add("_appointment_time", pick("_care_service_start_time"));
    add("_duration_hours", pick("_care_service_quantity"));
    add("_hourly_rate", pick("_care_service_rate"));
    add("_service_type", pick("_care_service_label"));
    add("_special_instructions", pick("_care_service_notes"));
    add("_provider_id", pick("_dokan_vendor_id"));
    out.push({ ...order, meta_data: merged });
  }
  return out;
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
        const newId = Number(data?.id);
        // wc/v3 creates the product under the store-key owner (an admin), which
        // makes Dokan treat the admin as the seller: commissions land in the
        // wrong account and an admin buyer is blocked from purchasing their own
        // product. Hand the product over to the caregiver through Dokan's own
        // vendor-assignment endpoint, falling back to the core post author
        // field on builds that expose it.
        let authorAssigned = false;
        if (Number.isFinite(newId) && newId > 0) {
          const attempts: Array<[string, RequestInit]> = [
            [
              `${wpBase}/wp-json/dokan/v1/products/${newId}`,
              { method: "PUT", headers: adminHeaders(), body: JSON.stringify({ post_author: vendorId }) },
            ],
            [
              `${wpBase}/wp-json/wc/v3/products/${newId}`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Basic ${btoa(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`)}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ post_author: vendorId }),
              },
            ],
            [
              `${wpBase}/wp-json/wp/v2/product/${newId}`,
              { method: "POST", headers: adminHeaders(), body: JSON.stringify({ author: vendorId }) },
            ],
          ];
          for (const [url, init] of attempts) {
            const attemptRes = await fetch(url, init).catch(() => null);
            if (!attemptRes) continue;
            const body = await attemptRes.text().catch(() => "");
            if (attemptRes.ok) {
              // Confirm Dokan now lists the product under the caregiver's store.
              const check = await fetch(`${wpBase}/wp-json/dokan/v1/stores/${vendorId}/products?per_page=20`, {
                headers: adminHeaders(),
              }).catch(() => null);
              const list = check && check.ok ? await check.json().catch(() => []) : [];
              authorAssigned = Array.isArray(list)
                ? list.some((prod: any) => Number(prod?.id) === newId)
                : false;
              if (authorAssigned) break;
            }
            console.error(`author assign attempt failed [${attemptRes.status}] ${url}`, body.slice(0, 200));
          }
          if (!authorAssigned) {
            console.error(`create_service_product could not assign vendor ${vendorId} to product ${newId}`);
          }
        }
        return json({
          ok: true,
          id: newId,
          price: Number(data?.price || amount),
          vendor_assigned: authorAssigned,
        });


      }

      // Orders the caller placed as a client. Buyers have no wc/v3 read
      // capability, so the store keys read them here and the query is always
      // pinned to the caller's own customer id.
      case "list_my_orders": {
        if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
          return json({ error: "Server is missing WooCommerce store keys" }, 500);
        }
        const perPage = Math.min(Math.max(Number(payload?.per_page) || 50, 1), 100);
        const res = await fetch(
          `${wpBase}/wp-json/wc/v3/orders?per_page=${perPage}&customer=${userId}`,
          {
            headers: {
              Authorization: `Basic ${btoa(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`)}`,
            },
          },
        );
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          console.error(`list_my_orders failed [${res.status}]`, JSON.stringify(data));
          return json({ error: "WooCommerce order list failed", status: res.status, details: data }, 502);
        }
        const list = Array.isArray(data) ? data : [];
        return json({ ok: true, data: await enrichOrdersWithServiceMeta(wpBase, list) });
      }

      // Orders that contain the caller's own vendor products (incoming work).
      case "list_my_vendor_orders": {
        if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
          return json({ error: "Server is missing WooCommerce store keys" }, 500);
        }
        const perPage = Math.min(Math.max(Number(payload?.per_page) || 100, 1), 100);
        const res = await fetch(`${wpBase}/wp-json/wc/v3/orders?per_page=${perPage}`, {
          headers: {
            Authorization: `Basic ${btoa(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`)}`,
          },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          console.error(`list_my_vendor_orders failed [${res.status}]`, JSON.stringify(data));
          return json({ error: "WooCommerce order list failed", status: res.status, details: data }, 502);
        }
        // The vendor id lives on the just-in-time product's meta, not on the
        // order or its line items, so enrich first (that copies
        // _dokan_vendor_id onto the order as _provider_id) and filter after.
        const enriched = await enrichOrdersWithServiceMeta(wpBase, Array.isArray(data) ? data : []);
        const mine = enriched.filter((order: any) => {
          const metaHit = (Array.isArray(order?.meta_data) ? order.meta_data : []).some(
            (m: any) =>
              (m?.key === "_dokan_vendor_id" || m?.key === "_provider_id") && Number(m?.value) === userId,
          );
          const itemHit = (Array.isArray(order?.line_items) ? order.line_items : []).some((li: any) =>
            (Array.isArray(li?.meta_data) ? li.meta_data : []).some(
              (m: any) => (m?.key === "_dokan_vendor_id" || m?.key === "_provider_id") && Number(m?.value) === userId,
            ),
          );
          return metaHit || itemHit;
        });
        return json({ ok: true, data: mine });

      }

      // Confirm / complete / cancel a booking. Neither the buyer nor the
      // caregiver has wc/v3 write capability, so the store keys apply the
      // change here — but only after proving the caller is the order's own
      // customer or the caregiver the service product belongs to.
      case "set_order_status": {
        if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
          return json({ error: "Server is missing WooCommerce store keys" }, 500);
        }
        const orderId = Number(payload?.order_id);
        const status = String(payload?.status ?? "");
        const allowed = ["processing", "completed", "cancelled", "on-hold", "refunded"];
        if (!Number.isFinite(orderId) || orderId <= 0) {
          return json({ error: "order_id must be a positive number" }, 400);
        }
        if (!allowed.includes(status)) {
          return json({ error: `status must be one of ${allowed.join(", ")}` }, 400);
        }
        const auth = `Basic ${btoa(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`)}`;
        const orderRes = await fetch(`${wpBase}/wp-json/wc/v3/orders/${orderId}`, {
          headers: { Authorization: auth },
        });
        const order = await orderRes.json().catch(() => null);
        if (!orderRes.ok || !order?.id) {
          return json({ error: "Order not found", status: orderRes.status }, 404);
        }
        const isCustomer = Number(order?.customer_id) === userId;
        const [enriched] = await enrichOrdersWithServiceMeta(wpBase, [order]);
        const isVendor = (Array.isArray(enriched?.meta_data) ? enriched.meta_data : []).some(
          (m: any) =>
            (m?.key === "_dokan_vendor_id" || m?.key === "_provider_id") && Number(m?.value) === userId,
        );
        if (!isCustomer && !isVendor) {
          return json({ error: "This booking does not belong to you" }, 403);
        }
        // A client may only cancel; the caregiver drives the rest.
        if (isCustomer && !isVendor && status !== "cancelled") {
          return json({ error: "Clients can only cancel a booking" }, 403);
        }
        const putRes = await fetch(`${wpBase}/wp-json/wc/v3/orders/${orderId}`, {
          method: "PUT",
          headers: { Authorization: auth, "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const putBody = await putRes.json().catch(() => null);
        if (!putRes.ok) {
          console.error(`set_order_status failed [${putRes.status}]`, JSON.stringify(putBody));
          return json({ error: "Order update failed", status: putRes.status, details: putBody }, 502);
        }
        return json({ ok: true, id: orderId, status: putBody?.status ?? status });
      }

      // Payout account + withdrawals. Dokan derives the vendor from the logged
      // in user and ignores a user_id parameter, so these run with the
      // caller's own token — never admin credentials, which would read and
      // write the admin's balance instead of the caregiver's.
      case "get_my_payout": {
        const callerHeaders = { Authorization: `Bearer ${token}` };
        const [balanceRes, listRes, storeRes] = await Promise.all([
          fetch(`${wpBase}/wp-json/dokan/v1/withdraw/balance`, { headers: callerHeaders }),
          fetch(`${wpBase}/wp-json/dokan/v1/withdraw?per_page=20`, { headers: callerHeaders }),
          fetch(`${wpBase}/wp-json/dokan/v1/stores/${userId}`, { headers: callerHeaders }),
        ]);
        const balance = balanceRes.ok ? await balanceRes.json().catch(() => null) : null;
        const withdrawals = listRes.ok ? await listRes.json().catch(() => null) : null;
        const store = storeRes.ok ? await storeRes.json().catch(() => null) : null;
        return json({
          ok: true,
          data: {
            balance,
            withdrawals: Array.isArray(withdrawals) ? withdrawals : [],
            payment: (store as any)?.payment ?? {},
          },
        });
      }

      case "save_my_payout": {
        const payment = payload?.payment;
        if (!payment || typeof payment !== "object") {
          return json({ error: "payment object is required" }, 400);
        }
        // Dokan's vendor settings endpoint writes the caller's own store.
        let res = await fetch(`${wpBase}/wp-json/dokan/v1/settings`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ payment }),
        });
        if (!res.ok) {
          // Older Dokan builds only expose the store record for this write.
          res = await fetch(`${wpBase}/wp-json/dokan/v1/stores/${userId}`, {
            method: "PUT",
            headers: adminHeaders(),
            body: JSON.stringify({ payment }),
          });
        }
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          console.error(`save_my_payout failed [${res.status}]`, JSON.stringify(data));
          return json({ error: "Payout settings update failed", status: res.status, details: data }, 502);
        }
        return json({ ok: true, data: (data as any)?.payment ?? {} });
      }

      case "request_withdrawal": {
        const amount = Number(payload?.amount);
        const method = String(payload?.method ?? "bank");
        if (!Number.isFinite(amount) || amount <= 0) {
          return json({ error: "amount must be > 0" }, 400);
        }
        const res = await fetch(`${wpBase}/wp-json/dokan/v1/withdraw`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ amount, method }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          console.error(`request_withdrawal failed [${res.status}]`, JSON.stringify(data));
          return json({ error: "Withdrawal request failed", status: res.status, details: data }, 502);
        }
        return json({ ok: true, data });
      }



      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    return json({ error: String(error) }, 500);

  }
});
