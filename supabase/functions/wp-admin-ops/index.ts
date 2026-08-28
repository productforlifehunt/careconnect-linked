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
  | "get_user_names"
  | "get_countries"

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
    const pickAny = (...keys: string[]) => {
      for (const key of keys) {
        const value = pick(key);
        if (value) return value;
      }
      return "";
    };
    add("_appointment_date", pick("_care_service_start_date"));
    add("_appointment_time", pick("_care_service_start_time"));
    add("_duration_hours", pickAny("_care_service_quantity", "_quote_hours"));
    add("_hourly_rate", pickAny("_care_service_rate", "_quote_rate"));
    add("_service_type", pickAny("_care_service_label", "_quote_service_type"));
    add("_special_instructions", pick("_care_service_notes"));
    add("_provider_id", pick("_dokan_vendor_id"));
    // One WooCommerce store is shared by every app on this backend, so a
    // caregiver who also sells Notch pouches would otherwise see those orders
    // inside the care schedule. Flag care-marketplace orders explicitly.
    const isCare = pick("_is_care_service_product") === "1" || pick("_is_quote_product") === "1";
    add("_is_care_service", isCare ? "1" : "");
    out.push({ ...order, meta_data: merged, _is_care_service: isCare });

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
        // Promoting by role alone skips Dokan's registration hook, which leaves
        // the vendor "pending" with selling disabled — orders then never reach
        // their store. Approve and enable selling explicitly.
        let sellingEnabled = false;
        if (res.ok) {
          const approve = await fetch(`${wpBase}/wp-json/dokan/v1/stores/${userId}/status`, {
            method: "PUT",
            headers: adminHeaders(),
            body: JSON.stringify({ status: "approved" }),
          }).catch(() => null);
          if (!approve || !approve.ok) {
            await fetch(`${wpBase}/wp-json/dokan/v1/stores/${userId}`, {
              method: "PUT",
              headers: adminHeaders(),
              body: JSON.stringify({ enabled: true }),
            }).catch(() => null);
          }
          const check = await fetch(`${wpBase}/wp-json/dokan/v1/stores/${userId}`, {
            headers: adminHeaders(),
          }).catch(() => null);
          const store = check && check.ok ? await check.json().catch(() => null) : null;
          sellingEnabled = Boolean(store?.enabled);
          if (!sellingEnabled) {
            console.error(`ensure_seller_role: vendor ${userId} still not enabled for selling`);
          }
        }
        return json({ ok: res.ok, status: res.status, selling_enabled: sellingEnabled }, res.ok ? 200 : 502);
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

      // Display names for a list of user ids. WordPress only exposes users who
      // authored content to non-admin callers, so chat counterparts would
      // otherwise render as "User 51". Returns names and avatars only.
      case "get_user_names": {
        const ids = Array.isArray(payload?.ids)
          ? payload.ids.map((v: unknown) => Number(v)).filter((n: number) => Number.isFinite(n) && n > 0).slice(0, 100)
          : [];
        if (ids.length === 0) return json({ ok: true, data: [] });
        const res = await fetch(
          `${wpBase}/wp-json/wp/v2/users?include=${ids.join(",")}&per_page=100&context=edit`,
          { headers: adminHeaders() },
        );
        const list = await res.json().catch(() => []);
        if (!res.ok || !Array.isArray(list)) {
          console.error(`get_user_names failed [${res.status}]`, JSON.stringify(list).slice(0, 200));
          return json({ ok: true, data: [] });
        }
        return json({
          ok: true,
          data: list.map((u: any) => ({
            id: Number(u.id),
            name: u.name || u.slug || "",
            avatar: u.avatar_urls?.["96"] || null,
          })),
        });
      }

      // Valid WooCommerce country + state codes, read from the store itself so
      // checkout never fails on a hand-typed state ("BJ" is not a CN code).
      case "get_countries": {
        if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
          return json({ error: "Server is missing WooCommerce store keys" }, 500);
        }
        const res = await fetch(`${wpBase}/wp-json/wc/v3/data/countries`, {
          headers: { Authorization: `Basic ${btoa(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`)}` },
        });
        const body = await res.text();
        if (!res.ok) {
          console.error(`get_countries failed [${res.status}]: ${body.slice(0, 300)}`);
          return json({ error: "Could not read store countries", status: res.status, details: body.slice(0, 300) }, res.status);
        }
        const list = JSON.parse(body || "[]");
        return json({
          ok: true,
          data: (Array.isArray(list) ? list : []).map((c: any) => ({
            code: String(c?.code ?? ""),
            name: String(c?.name ?? ""),
            states: Array.isArray(c?.states)
              ? c.states.map((s: any) => ({ code: String(s?.code ?? ""), name: String(s?.name ?? "") }))
              : [],
          })),
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
        const enrichedMine = await enrichOrdersWithServiceMeta(wpBase, list);
        const careOnly = payload?.care_only !== false;
        return json({
          ok: true,
          data: careOnly ? enrichedMine.filter((o: any) => o?._is_care_service) : enrichedMine,
        });

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
        const vendorCareOnly = payload?.care_only !== false;
        const mine = enriched.filter((order: any) => {
          if (vendorCareOnly && !order?._is_care_service) return false;
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

      // ── Order conversation (dispute / issue thread) ───────────────────
      // Neither the buyer nor the caregiver can read or write wc/v3 order
      // notes, so the store keys do it here after proving the caller owns the
      // order. Notes are the audit trail both sides read in the app, so the
      // customer never needs the WordPress admin.
      case "list_order_notes": {
        const ctx = await loadOrderForCaller(wpBase, Number(payload?.order_id), userId);
        if ("error" in ctx) return json({ error: ctx.error }, ctx.status);
        const res = await fetch(
          `${wpBase}/wp-json/wc/v3/orders/${ctx.order.id}/notes?per_page=50`,
          { headers: { Authorization: storeAuth() } },
        );
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          console.error(`list_order_notes failed [${res.status}]`, JSON.stringify(data));
          return json({ error: "Order notes read failed", status: res.status, details: data }, 502);
        }
        const notes = (Array.isArray(data) ? data : [])
          .filter((n: any) => n?.customer_note === true)
          .map((n: any) => ({
            id: n.id,
            note: String(n.note ?? ""),
            date_created: n.date_created,
          }));
        return json({ ok: true, data: notes });
      }

      case "add_order_note": {
        const note = String(payload?.note ?? "").trim();
        if (!note) return json({ error: "note is required" }, 400);
        if (note.length > 2000) return json({ error: "note is too long" }, 400);
        const ctx = await loadOrderForCaller(wpBase, Number(payload?.order_id), userId);
        if ("error" in ctx) return json({ error: ctx.error }, ctx.status);
        const role = ctx.isVendor ? "Caregiver" : "Client";
        const posted = await postOrderNote(wpBase, ctx.order.id, `[${role}] ${note}`);
        if (!posted.ok) return json({ error: "Order note failed", details: posted.details }, 502);
        return json({ ok: true, data: posted.data });
      }

      // ── Refunds ──────────────────────────────────────────────────────
      // A client asks; the caregiver decides. The client can never move money
      // on their own, and the caregiver never needs the WordPress admin.
      case "request_refund": {
        const reason = String(payload?.reason ?? "").trim();
        if (!reason) return json({ error: "reason is required" }, 400);
        const ctx = await loadOrderForCaller(wpBase, Number(payload?.order_id), userId);
        if ("error" in ctx) return json({ error: ctx.error }, ctx.status);
        if (!ctx.isCustomer) {
          return json({ error: "Only the client who booked can request a refund" }, 403);
        }
        const existing = metaValue(ctx.order, "_refund_status");
        if (existing === "requested") {
          return json({ error: "A refund request is already open for this booking" }, 409);
        }
        if (Number(ctx.order?.total) - Number(ctx.order?.total_tax ?? 0) <= 0) {
          return json({ error: "This booking has nothing left to refund" }, 400);
        }
        const requested = Number(payload?.amount);
        const amount = Number.isFinite(requested) && requested > 0
          ? Math.min(requested, Number(ctx.order?.total))
          : Number(ctx.order?.total);
        const putRes = await fetch(`${wpBase}/wp-json/wc/v3/orders/${ctx.order.id}`, {
          method: "PUT",
          headers: { Authorization: storeAuth(), "Content-Type": "application/json" },
          body: JSON.stringify({
            meta_data: [
              { key: "_refund_status", value: "requested" },
              { key: "_refund_reason", value: reason },
              { key: "_refund_amount", value: String(amount) },
            ],
          }),
        });
        const putBody = await putRes.json().catch(() => null);
        if (!putRes.ok) {
          console.error(`request_refund failed [${putRes.status}]`, JSON.stringify(putBody));
          return json({ error: "Refund request failed", status: putRes.status, details: putBody }, 502);
        }
        await postOrderNote(
          wpBase,
          ctx.order.id,
          `[Client] Refund requested (${amount}): ${reason}`,
        );
        return json({ ok: true, data: { status: "requested", amount } });
      }

      case "resolve_refund": {
        const decision = String(payload?.decision ?? "");
        if (!["approve", "decline"].includes(decision)) {
          return json({ error: "decision must be approve or decline" }, 400);
        }
        const ctx = await loadOrderForCaller(wpBase, Number(payload?.order_id), userId);
        if ("error" in ctx) return json({ error: ctx.error }, ctx.status);
        if (!ctx.isVendor) {
          return json({ error: "Only the caregiver can settle a refund request" }, 403);
        }
        if (metaValue(ctx.order, "_refund_status") !== "requested") {
          return json({ error: "There is no open refund request on this booking" }, 409);
        }
        const message = String(payload?.note ?? "").trim();

        if (decision === "decline") {
          const putRes = await fetch(`${wpBase}/wp-json/wc/v3/orders/${ctx.order.id}`, {
            method: "PUT",
            headers: { Authorization: storeAuth(), "Content-Type": "application/json" },
            body: JSON.stringify({ meta_data: [{ key: "_refund_status", value: "declined" }] }),
          });
          if (!putRes.ok) {
            const details = await putRes.text();
            console.error(`resolve_refund(decline) failed [${putRes.status}]`, details);
            return json({ error: "Refund update failed", status: putRes.status, details }, 502);
          }
          await postOrderNote(
            wpBase,
            ctx.order.id,
            `[Caregiver] Refund declined${message ? `: ${message}` : "."}`,
          );
          return json({ ok: true, data: { status: "declined" } });
        }

        const amountMeta = Number(metaValue(ctx.order, "_refund_amount"));
        const amount = Number.isFinite(amountMeta) && amountMeta > 0
          ? Math.min(amountMeta, Number(ctx.order?.total))
          : Number(ctx.order?.total);
        // api_refund asks the gateway to send the money back. Manual-payment
        // orders have no gateway to call, so fall back to recording the refund.
        let refundRes = await fetch(`${wpBase}/wp-json/wc/v3/orders/${ctx.order.id}/refunds`, {
          method: "POST",
          headers: { Authorization: storeAuth(), "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: String(amount),
            reason: metaValue(ctx.order, "_refund_reason") || message || "Refund approved by caregiver",
            api_refund: true,
          }),
        });
        if (!refundRes.ok) {
          refundRes = await fetch(`${wpBase}/wp-json/wc/v3/orders/${ctx.order.id}/refunds`, {
            method: "POST",
            headers: { Authorization: storeAuth(), "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: String(amount),
              reason: metaValue(ctx.order, "_refund_reason") || message || "Refund approved by caregiver",
              api_refund: false,
            }),
          });
        }
        const refund = await refundRes.json().catch(() => null);
        if (!refundRes.ok) {
          console.error(`resolve_refund(approve) failed [${refundRes.status}]`, JSON.stringify(refund));
          return json({ error: "Refund failed", status: refundRes.status, details: refund }, 502);
        }
        await fetch(`${wpBase}/wp-json/wc/v3/orders/${ctx.order.id}`, {
          method: "PUT",
          headers: { Authorization: storeAuth(), "Content-Type": "application/json" },
          body: JSON.stringify({ meta_data: [{ key: "_refund_status", value: "approved" }] }),
        });
        await postOrderNote(
          wpBase,
          ctx.order.id,
          `[Caregiver] Refund approved (${amount})${message ? `: ${message}` : "."}`,
        );
        return json({ ok: true, data: { status: "approved", amount, refund } });
      }

      default:

        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    return json({ error: String(error) }, 500);

  }
});
