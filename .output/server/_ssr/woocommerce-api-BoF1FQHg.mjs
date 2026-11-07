import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { a as getWPToken, n as buildWPUrl, r as getActiveServer, t as buildWPHeaders } from "./wp-auth-DL1jfVY7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/woocommerce-api-BoF1FQHg.js
var woocommerce_api_exports = /* @__PURE__ */ __exportAll({
	addOrderCustomerNote: () => addOrderCustomerNote,
	addToCart: () => addToCart,
	applyCartCoupon: () => applyCartCoupon,
	cancelWithdrawal: () => cancelWithdrawal,
	checkout: () => checkout,
	clearCart: () => clearCart,
	clearStoreSession: () => clearStoreSession,
	createServiceProduct: () => createServiceProduct,
	ensureDokanVendor: () => ensureDokanVendor,
	getCart: () => getCart,
	getDokanVendorOrders: () => getDokanVendorOrders,
	getMyCustomerOrders: () => getMyCustomerOrders,
	getMyPayout: () => getMyPayout,
	getOrderNotes: () => getOrderNotes,
	getStoreCountries: () => getStoreCountries,
	removeCartCoupon: () => removeCartCoupon,
	removeCartItem: () => removeCartItem,
	requestOrderRefund: () => requestOrderRefund,
	requestWithdrawal: () => requestWithdrawal,
	resolveOrderRefund: () => resolveOrderRefund,
	saveMyPayout: () => saveMyPayout,
	updateCartItemQuantity: () => updateCartItemQuantity,
	updateOrderBookingDetails: () => updateOrderBookingDetails,
	updateOrderStatus: () => updateOrderStatus,
	wpAdminOps: () => wpAdminOps
});
/**
* Build auth headers using JWT Bearer token
*/
function getAuthHeaders(forceEdge = false) {
	return buildWPHeaders(getWPToken(), "application/json", { forceEdge });
}
/**
* Fetch wrapper for WooCommerce REST API v3 (admin endpoints).
*
* Anonymous visitors have no JWT, so read-only catalog calls are routed through
* the backend proxy, which attaches server-side read-only store keys. This keeps
* public browsing (services, attributes, categories) working without login while
* never exposing credentials to the browser.
*/
async function wcFetch(endpoint, options = {}) {
	const url = buildWPUrl(`wc/v3/${endpoint}`);
	const headers = {
		...getAuthHeaders(),
		...options.headers
	};
	const response = await fetch(url, {
		...options,
		headers
	});
	if (!response.ok) {
		const error = await response.text();
		throw new Error(`WooCommerce API error: ${response.status} - ${error}`);
	}
	return response.json();
}
var ADMIN_OPS_URL = `${{
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_SUPABASE_PROJECT_ID": "fofewspvoaylmzzgpyrg",
	"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_4ZCLp6URt0IVeFm6-aSD4g_dxkJY7Ps",
	"VITE_SUPABASE_URL": "https://fofewspvoaylmzzgpyrg.supabase.co",
	"VITE_WP_BASE_URL": "https://app.challenged-dementia.com/afresh"
}["VITE_SUPABASE_URL"]}/functions/v1/wp-admin-ops`;
async function adminOp(action, body = {}) {
	const token = getWPToken();
	if (!token) return null;
	const response = await fetch(ADMIN_OPS_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
			apikey: {
				"BASE_URL": "/",
				"DEV": false,
				"MODE": "production",
				"PROD": true,
				"SSR": true,
				"TSS_DEV_SERVER": "false",
				"TSS_DEV_SSR_STYLES_BASEPATH": "/",
				"TSS_DEV_SSR_STYLES_ENABLED": "true",
				"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
				"TSS_INLINE_CSS_ENABLED": "false",
				"TSS_ROUTER_BASEPATH": "",
				"TSS_SERVER_FN_BASE": "/_serverFn/",
				"VITE_SUPABASE_PROJECT_ID": "fofewspvoaylmzzgpyrg",
				"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_4ZCLp6URt0IVeFm6-aSD4g_dxkJY7Ps",
				"VITE_SUPABASE_URL": "https://fofewspvoaylmzzgpyrg.supabase.co",
				"VITE_WP_BASE_URL": "https://app.challenged-dementia.com/afresh"
			}["VITE_SUPABASE_PUBLISHABLE_KEY"] || ""
		},
		body: JSON.stringify({
			action,
			wp_base: getActiveServer().baseUrl,
			...body
		})
	});
	const payload = await response.json().catch(() => null);
	if (!response.ok) {
		const reason = typeof payload?.error === "string" ? payload.error : "";
		throw new Error(reason || `wp-admin-ops ${action} failed: ${response.status}`);
	}
	return payload?.data ?? payload;
}
/** Shared entry point for other modules that need a privileged WP operation. */
var wpAdminOps = adminOp;
async function ensureDokanVendor(userData) {
	if (!(await import("../_libs/_.mjs").then((n) => n.f)).getStoredWPUser()?.user_id) {
		console.warn("ensureDokanVendor: no stored WP user");
		return null;
	}
	const storePayload = {
		store_name: userData.fullName ? `${userData.fullName} Care Services` : void 0,
		phone: userData.phone || "",
		address: { street_1: userData.location || "" },
		...userData.bio !== void 0 ? { description: userData.bio || "" } : {}
	};
	let existingStore = null;
	try {
		const stores = await adminOp("get_my_store");
		if (Array.isArray(stores) && stores.length > 0) existingStore = stores[0];
	} catch {}
	if (!existingStore) try {
		await adminOp("ensure_seller_role");
	} catch (e) {
		console.warn("ensureDokanVendor: role assignment error", e);
	}
	try {
		return await adminOp("upsert_my_store", { store: storePayload });
	} catch (e) {
		console.warn("ensureDokanVendor: store setup error", e);
		return existingStore;
	}
}
async function dokanFetch(endpoint, options = {}) {
	const url = buildWPUrl(`dokan/v1/${endpoint}`);
	const response = await fetch(url, {
		...options,
		headers: {
			...getAuthHeaders(),
			...options.headers
		}
	});
	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Dokan API error: ${response.status} - ${error}`);
	}
	return response.json();
}
async function updateOrderStatus(orderId, status) {
	return adminOp("set_order_status", {
		order_id: orderId,
		status
	});
}
async function updateOrderBookingDetails(orderId, details) {
	const metaData = [];
	if (details.appointmentDate) metaData.push({
		key: "_appointment_date",
		value: details.appointmentDate
	});
	if (details.appointmentTime) metaData.push({
		key: "_appointment_time",
		value: details.appointmentTime
	});
	if (details.durationHours !== void 0) metaData.push({
		key: "_duration_hours",
		value: details.durationHours.toString()
	});
	if (details.specialInstructions !== void 0) metaData.push({
		key: "_special_instructions",
		value: details.specialInstructions
	});
	return wcFetch(`orders/${orderId}`, {
		method: "PUT",
		body: JSON.stringify({ meta_data: metaData })
	});
}
var CART_TOKEN_KEY = "wc_store_cart_token";
var NONCE_KEY = "wc_store_nonce";
function getStoreToken() {
	if (typeof window === "undefined") return {};
	return {
		cartToken: localStorage.getItem(CART_TOKEN_KEY) || void 0,
		nonce: localStorage.getItem(NONCE_KEY) || void 0
	};
}
function persistStoreToken(res) {
	if (typeof window === "undefined") return;
	const token = res.headers.get("Cart-Token");
	if (token) localStorage.setItem(CART_TOKEN_KEY, token);
	const nonce = res.headers.get("Nonce");
	if (nonce) localStorage.setItem(NONCE_KEY, nonce);
}
function clearStoreSession() {
	if (typeof window === "undefined") return;
	localStorage.removeItem(CART_TOKEN_KEY);
	localStorage.removeItem(NONCE_KEY);
}
async function storeApiFetch(path, init = {}) {
	if ((init.method || "GET").toUpperCase() !== "GET" && !getStoreToken().nonce) try {
		persistStoreToken(await fetch(buildWPUrl("wc/store/v1/cart"), { headers: getAuthHeaders() }));
	} catch {}
	const url = buildWPUrl(`wc/store/v1/${path}`);
	const { cartToken, nonce } = getStoreToken();
	const headers = {
		...getAuthHeaders(),
		...init.headers
	};
	if (cartToken) headers["Cart-Token"] = cartToken;
	if (nonce) headers["Nonce"] = nonce;
	const res = await fetch(url, {
		...init,
		headers
	});
	persistStoreToken(res);
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Store API ${res.status}: ${text}`);
	}
	if (res.status === 204) return null;
	return res.json();
}
/** Normalize a Store API cart response into our internal CartItem[] shape. */
function normalizeStoreCart(cart) {
	if (!cart) return {
		items: [],
		totals: cart?.totals,
		raw: cart
	};
	return {
		items: (cart.items || []).map((it) => ({
			key: it.key,
			product_id: it.id,
			name: it.name,
			price: parseFloat(it.prices?.price || "0") / Math.pow(10, it.prices?.currency_minor_unit ?? 2),
			quantity: it.quantity,
			image: it.images?.[0]?.thumbnail,
			description: it.description,
			item_data: it.item_data
		})),
		totals: cart.totals,
		raw: cart
	};
}
var CART_INTENT_KEY = "cc_cart_intent";
function readCartIntent() {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(CART_INTENT_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : [];
	} catch {
		return [];
	}
}
function writeCartIntent(ids) {
	if (typeof window === "undefined") return;
	localStorage.setItem(CART_INTENT_KEY, JSON.stringify(ids));
}
function addCartIntent(productId) {
	const ids = readCartIntent();
	ids.push(Number(productId));
	writeCartIntent(ids);
}
function dropCartIntent(productId) {
	if (!productId) return;
	const ids = readCartIntent();
	const at = ids.indexOf(Number(productId));
	if (at >= 0) ids.splice(at, 1);
	writeCartIntent(ids);
}
/**
* Remove every store line this device did not add, so the cart the client sees
* is exactly the cart WooCommerce will invoice.
*/
async function purgeGhostLines(cart) {
	const intent = readCartIntent();
	const ghosts = (cart?.items || []).filter((it) => !intent.includes(Number(it.id)));
	if (!ghosts.length) return cart;
	let current = cart;
	for (const ghost of ghosts) try {
		current = await storeApiFetch("cart/remove-item", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ key: ghost.key })
		});
	} catch {}
	return current;
}
/** GET /wc/store/v1/cart */
async function getCart() {
	return normalizeStoreCart(await purgeGhostLines(await storeApiFetch("cart", { method: "GET" })));
}
/**
* POST /wc/store/v1/cart/add-item
*
* The line is a plain simple product: the agreed price, service type, date,
* time and notes are already baked into the just-in-time product created a
* moment earlier, so no cart-line extensions (and no Bookings plugin) are
* involved.
*/
async function addToCart({ productId, quantity = 1 }) {
	let lastError = null;
	for (let attempt = 0; attempt < 8; attempt += 1) try {
		const cart = await storeApiFetch("cart/add-item", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: productId,
				quantity
			})
		});
		addCartIntent(productId);
		return normalizeStoreCart(await purgeGhostLines(cart));
	} catch (error) {
		lastError = error;
		if (!String(error).includes("not_purchasable")) throw error;
		await new Promise((resolve) => setTimeout(resolve, 2500));
	}
	throw lastError instanceof Error ? lastError : /* @__PURE__ */ new Error("Could not add the service to the cart");
}
/** POST /wc/store/v1/cart/remove-item */
async function removeCartItem(itemKey) {
	const line = ((await storeApiFetch("cart", { method: "GET" }))?.items || []).find((it) => it.key === itemKey);
	const cart = await storeApiFetch("cart/remove-item", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ key: itemKey })
	});
	dropCartIntent(line?.id);
	return normalizeStoreCart(cart);
}
/**
* POST /wc/store/v1/cart/update-item — change the quantity of one line.
* Setting the quantity to 0 lets WooCommerce drop the line itself.
*/
async function updateCartItemQuantity(itemKey, quantity) {
	const qty = Math.max(0, Math.floor(quantity));
	if (qty === 0) return removeCartItem(itemKey);
	return normalizeStoreCart(await storeApiFetch("cart/update-item", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			key: itemKey,
			quantity: qty
		})
	}));
}
/** POST /wc/store/v1/cart/apply-coupon */
async function applyCartCoupon(code) {
	return normalizeStoreCart(await storeApiFetch("cart/apply-coupon", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ code: code.trim() })
	}));
}
/** POST /wc/store/v1/cart/remove-coupon */
async function removeCartCoupon(code) {
	return normalizeStoreCart(await storeApiFetch("cart/remove-coupon", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ code })
	}));
}
/** DELETE /wc/store/v1/cart/items */
async function clearCart() {
	const cart = await storeApiFetch("cart/items", { method: "DELETE" });
	writeCartIntent([]);
	return normalizeStoreCart(cart);
}
/**
* POST /wc/store/v1/checkout
* Native WooCommerce headless checkout. Returns the created order plus the
* payment_result the gateway emitted. We pick `payment_method = ''` so WC
* leaves the order `pending` and routes the customer to the hosted
* pay-for-order page where they choose a real gateway (Stripe, PayPal,
* Alipay, etc.) — the platform never holds funds in escrow.
*/
async function checkout(billingData) {
	const billing = {
		first_name: billingData?.first_name || "",
		last_name: billingData?.last_name || "",
		email: billingData?.email || "",
		phone: billingData?.phone || "",
		address_1: billingData?.address_1 || "",
		address_2: "",
		city: billingData?.city || "",
		state: billingData?.state || "",
		postcode: billingData?.postcode || "",
		country: billingData?.country || "US"
	};
	const verified = await getCart();
	if (!verified.items.length) throw new Error("Your cart is empty — please add a booking again before paying.");
	let method = "bacs";
	try {
		const available = Array.isArray(verified.raw?.payment_methods) ? verified.raw.payment_methods : [];
		if (available.length) method = available.find((m) => m === "bacs") || available.find((m) => m === "cheque") || available[0];
	} catch {}
	const result = await storeApiFetch("checkout", {
		method: "POST",
		body: JSON.stringify({
			billing_address: billing,
			shipping_address: billing,
			payment_method: method,
			payment_data: [],
			extensions: {}
		})
	});
	const orderId = result?.order_id;
	const orderKey = result?.order_key || "";
	const server = getActiveServer();
	const payment_url = (result?.payment_result?.payment_status || "") !== "success" && ![
		"bacs",
		"cheque",
		"cod"
	].includes(method) ? `${server.baseUrl.replace(/\/$/, "")}/checkout/order-pay/${orderId}/?pay_for_order=true&key=${encodeURIComponent(orderKey)}` : "";
	clearStoreSession();
	return {
		order_id: orderId,
		id: orderId,
		order_key: orderKey,
		status: result?.status || "pending",
		total: result?.totals?.total_price ? String(parseFloat(result.totals.total_price) / Math.pow(10, result.totals.currency_minor_unit ?? 2)) : "0",
		payment_url,
		totals: result?.totals
	};
}
/** Client asks for a refund. Records the request + posts it to the thread. */
async function requestOrderRefund(orderId, options) {
	return adminOp("request_refund", {
		order_id: orderId,
		reason: options.reason,
		...options.amount ? { amount: Number(options.amount) } : {}
	});
}
/** Caregiver settles an open refund request. */
async function resolveOrderRefund(orderId, decision, note) {
	return adminOp("resolve_refund", {
		order_id: orderId,
		decision,
		note: note ?? ""
	});
}
/** Shared message thread on a booking — used for disputes and issue reports. */
async function getOrderNotes(orderId) {
	const notes = await adminOp("list_order_notes", { order_id: orderId });
	return Array.isArray(notes) ? notes : [];
}
async function addOrderCustomerNote(orderId, note) {
	return adminOp("add_order_note", {
		order_id: orderId,
		note
	});
}
async function getDokanVendorOrders(perPage = 50) {
	try {
		return await adminOp("list_my_vendor_orders", { per_page: perPage }) ?? [];
	} catch {}
	try {
		const viaDokan = await dokanFetch(`orders?per_page=${perPage}`);
		return Array.isArray(viaDokan) ? viaDokan : [];
	} catch {
		return [];
	}
}
/** Orders the signed-in user placed as a client (read server-side, scoped). */
var myOrdersCache = null;
async function getMyCustomerOrders(perPage = 50) {
	const now = Date.now();
	if (myOrdersCache && now - myOrdersCache.at < 5e3 && myOrdersCache.perPage >= perPage) return myOrdersCache.promise;
	const promise = adminOp("list_my_orders", { per_page: perPage }).then((orders) => Array.isArray(orders) ? orders : []);
	myOrdersCache = {
		at: now,
		perPage,
		promise
	};
	promise.catch(() => {
		myOrdersCache = null;
	});
	return promise;
}
async function getMyPayout() {
	return adminOp("get_my_payout");
}
async function saveMyPayout(payment) {
	return adminOp("save_my_payout", { payment });
}
async function requestWithdrawal(amount, method) {
	return adminOp("request_withdrawal", {
		amount,
		method
	});
}
/** Cancel a still-pending payout request so a new one can be submitted. */
async function cancelWithdrawal(withdrawId) {
	return adminOp("cancel_withdrawal", { withdraw_id: withdrawId });
}
/**
* Just-in-time care-service product.
*
* Discovery, rates and scheduling live entirely in JetEngine CCTs. This is the
* single moment WooCommerce is touched before checkout: the agreed price is
* written into a hidden simple product owned by the caregiver (Dokan vendor id
* in meta) so cart, checkout, payment, orders and payouts are 100% Woo/Dokan.
*/
async function createServiceProduct(input) {
	const vendorId = Number(String(input.vendorUserId).replace(/^wp-/, ""));
	const result = await adminOp("create_service_product", {
		name: input.name,
		description: input.description ?? "",
		amount: input.amount,
		vendor_user_id: vendorId,
		meta: input.meta ?? []
	});
	if (!result?.id) throw new Error("Could not create the service product");
	const id = Number(result.id);
	for (let attempt = 0; attempt < 8; attempt += 1) {
		try {
			const res = await fetch(buildWPUrl(`wc/store/v1/products/${id}`), { headers: getAuthHeaders() });
			if (res.ok) {
				if ((await res.json())?.is_purchasable) break;
			}
		} catch {}
		await new Promise((resolve) => setTimeout(resolve, 1200));
	}
	return {
		id,
		price: Number(result.price || input.amount)
	};
}
async function getStoreCountries() {
	try {
		const list = await adminOp("get_countries", {});
		return Array.isArray(list) ? list : [];
	} catch {
		return [];
	}
}
//#endregion
export { wpAdminOps as S, saveMyPayout as _, checkout as a, updateOrderStatus as b, getCart as c, getStoreCountries as d, removeCartCoupon as f, resolveOrderRefund as g, requestWithdrawal as h, cancelWithdrawal as i, getMyPayout as l, requestOrderRefund as m, addToCart as n, clearCart as o, removeCartItem as p, applyCartCoupon as r, createServiceProduct as s, addOrderCustomerNote as t, getOrderNotes as u, updateCartItemQuantity as v, woocommerce_api_exports as x, updateOrderBookingDetails as y };
