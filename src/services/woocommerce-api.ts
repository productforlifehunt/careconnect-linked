// WooCommerce REST API Service Layer
// Headless integration for Care Connector marketplace
// Auth: uses Vite dev-proxy + Supabase edge proxy + JWT Bearer token

import { getWPToken, getStoredWPUser } from './wp-auth';
import { buildWPUrl, buildWPHeaders, IS_DEV } from '@/lib/wp-url';
import { getActiveServer } from '@/lib/wp-servers';
import {
  createBookingCalendarEvent,
  getProviderCalendarAvailability,
  getProviderCalendarBookingConflictMessage,
  upsertProviderCalendarAvailability,
} from '@/features/calendar/booking-availability';

// Parent category slug for all care service products
export const CARE_SERVICES_CATEGORY = 'care-services';

/**
 * Build auth headers using JWT Bearer token
 */
function getAuthHeaders(forceEdge = false): Record<string, string> {
  const token = getWPToken();
  return buildWPHeaders(token, 'application/json', { forceEdge });
}

/**
 * Fetch wrapper for WooCommerce REST API v3 (admin endpoints).
 *
 * Anonymous visitors have no JWT, so read-only catalog calls are routed through
 * the backend proxy, which attaches server-side read-only store keys. This keeps
 * public browsing (services, attributes, categories) working without login while
 * never exposing credentials to the browser.
 */
/** Read-only catalog endpoints that any visitor (logged in or not) may read. */
const PUBLIC_CATALOG_PREFIXES = [
  'products',
  'products/categories',
  'products/attributes',
  'products/tags',
  'products/reviews',
];

function isPublicCatalogEndpoint(endpoint: string): boolean {
  const path = endpoint.split('?')[0].replace(/^\/+|\/+$/g, '');
  return PUBLIC_CATALOG_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

async function wcFetch(endpoint: string, options: RequestInit = {}) {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  // Store keys live server-side in the proxy. Subscriber-level JWTs are not
  // allowed to read wc/v3, so ALL catalog GETs go through the proxy — whether
  // the visitor is anonymous or signed in.
  const useProxyKeys = isGet && isPublicCatalogEndpoint(endpoint);
  const url = buildWPUrl(`wc/v3/${endpoint}`, undefined, { forceEdge: useProxyKeys });

  const headers: Record<string, string> = {
    ...getAuthHeaders(useProxyKeys),
    ...(options.headers as Record<string, string> | undefined),
  };
  // Never send a user JWT on proxy-key calls — WP would prefer it and 401.
  if (useProxyKeys) delete headers.Authorization;

  const response = await fetch(url, { ...options, headers });


  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WooCommerce API error: ${response.status} - ${error}`);
  }

  return response.json();
}


// ─── Service attribute ID resolution (avoid hard-coding 3/4) ────────────
// We cache the result for the session — the IDs rarely change.
let _serviceAttrIdCache: { type?: number; location?: number } | null = null;


// ─── Privileged WP/Dokan operations (admin creds live server-side) ───────
// The browser never holds WordPress admin credentials. The `wp-admin-ops`
// edge function validates the caller's own WP JWT and performs the operation
// scoped to that user only.
const ADMIN_OPS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wp-admin-ops`;

async function adminOp<T = any>(action: string, body: Record<string, unknown> = {}): Promise<T | null> {
  const token = getWPToken();
  if (!token) return null;
  const response = await fetch(ADMIN_OPS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    },
    body: JSON.stringify({ action, wp_base: getActiveServer().baseUrl, ...body }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`wp-admin-ops ${action} failed: ${response.status} - ${payload?.error ?? ''}`);
  }
  return (payload?.data ?? payload) as T;
}

export async function ensureDokanVendor(userData: {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
}): Promise<any> {
  const storedUser = (await import('@/services/wp-auth')).getStoredWPUser();
  const wpUserId = storedUser?.user_id;
  if (!wpUserId) {
    console.warn('ensureDokanVendor: no stored WP user');
    return null;
  }

  const storePayload = {
    store_name: userData.fullName ? `${userData.fullName} Care Services` : undefined,
    phone: userData.phone || '',
    address: { street_1: userData.location || '' },
    // Mirror bio into the Dokan store description so the public store page
    // stays in sync with the caregiver profile.
    ...(userData.bio !== undefined ? { description: userData.bio || '' } : {}),
  };

  let existingStore: any = null;
  try {
    const stores = await adminOp<any[]>('get_my_store');
    if (Array.isArray(stores) && stores.length > 0) existingStore = stores[0];
  } catch { /* no store yet */ }

  if (!existingStore) {
    try {
      await adminOp('ensure_seller_role');
    } catch (e) {
      console.warn('ensureDokanVendor: role assignment error', e);
    }
  }

  try {
    return await adminOp('upsert_my_store', { store: storePayload });
  } catch (e) {
    console.warn('ensureDokanVendor: store setup error', e);
    return existingStore;
  }
}


// ─── Dokan API fetch wrapper ───────────────────────────────

async function dokanFetch(endpoint: string, options: RequestInit = {}) {
  const url = buildWPUrl(`dokan/v1/${endpoint}`);
  const response = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dokan API error: ${response.status} - ${error}`);
  }
  return response.json();
}


// ─── Order helpers ─────────────────────────────────────────

export async function updateOrderStatus(orderId: number, status: string) {
  return wcFetch(`orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function updateOrderBookingDetails(
  orderId: number,
  details: {
    appointmentDate?: string;
    appointmentTime?: string;
    durationHours?: number;
    specialInstructions?: string;
  }
) {
  // Schedule lives in our JetEngine calendar CCT; the Woo order only
  // carries the agreed schedule as meta for invoice/receipt readability.
  const metaData: { key: string; value: string }[] = [];
  if (details.appointmentDate) metaData.push({ key: '_appointment_date', value: details.appointmentDate });
  if (details.appointmentTime) metaData.push({ key: '_appointment_time', value: details.appointmentTime });
  if (details.durationHours !== undefined) metaData.push({ key: '_duration_hours', value: details.durationHours.toString() });
  if (details.specialInstructions !== undefined) metaData.push({ key: '_special_instructions', value: details.specialInstructions });

  return wcFetch(`orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ meta_data: metaData }),
  });
}


// ─── Native WooCommerce Store API bridge ───────────────────────────────────
// Everything below talks to /wp-json/wc/store/v1/* — the official headless
// API that ships in WooCommerce core. No custom PHP snippets. WC Bookings
// line meta, Dokan vendor split, taxes, coupons, fees, gateway selection
// and stock are all handled by the native Store API path.
//
// Session is tracked via the `Cart-Token` JWT the Store API issues on the
// first cart response. We persist it in localStorage and echo it back on
// every subsequent request so the same cart follows the user across reloads.

const CART_TOKEN_KEY = 'wc_store_cart_token';
const NONCE_KEY = 'wc_store_nonce';

function getStoreToken(): { cartToken?: string; nonce?: string } {
  if (typeof window === 'undefined') return {};
  return {
    cartToken: localStorage.getItem(CART_TOKEN_KEY) || undefined,
    nonce: localStorage.getItem(NONCE_KEY) || undefined,
  };
}

function persistStoreToken(res: Response) {
  if (typeof window === 'undefined') return;
  const token = res.headers.get('Cart-Token');
  if (token) localStorage.setItem(CART_TOKEN_KEY, token);
  const nonce = res.headers.get('Nonce');
  if (nonce) localStorage.setItem(NONCE_KEY, nonce);
}

export function clearStoreSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_TOKEN_KEY);
  localStorage.removeItem(NONCE_KEY);
}

async function storeApiFetch(path: string, init: RequestInit = {}) {
  const method = (init.method || 'GET').toUpperCase();

  // The Store API rejects writes without a nonce. On a fresh session we have
  // none yet, so bootstrap it with a harmless GET /cart first — that response
  // carries both the Nonce and the Cart-Token we then echo back.
  if (method !== 'GET' && !getStoreToken().nonce) {
    try {
      const boot = await fetch(buildWPUrl('wc/store/v1/cart'), { headers: getAuthHeaders() });
      persistStoreToken(boot);
    } catch {
      /* non-fatal: the request below will surface the real error */
    }
  }

  const url = buildWPUrl(`wc/store/v1/${path}`);
  const { cartToken, nonce } = getStoreToken();
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(init.headers as Record<string, string> | undefined),
  };
  if (cartToken) headers['Cart-Token'] = cartToken;
  if (nonce) headers['Nonce'] = nonce;

  const res = await fetch(url, { ...init, headers });
  persistStoreToken(res);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Store API ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export interface CartItem {
  key: string;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  provider_id?: string;
  booking?: {
    resourceId?: number;
    persons?: Record<string | number, number>;
    startDate?: string;
    startTime?: string;
    durationHours?: number;
    serviceType?: string;
    notes?: string;
  };
}

/** Normalize a Store API cart response into our internal CartItem[] shape. */
function normalizeStoreCart(cart: any) {
  if (!cart) return { items: [] as CartItem[], totals: cart?.totals, raw: cart };
  const items: CartItem[] = (cart.items || []).map((it: any) => ({
    key: it.key,
    product_id: it.id,
    name: it.name,
    price: parseFloat(it.prices?.price || '0') / Math.pow(10, it.prices?.currency_minor_unit ?? 2),
    quantity: it.quantity,
    image: it.images?.[0]?.thumbnail,
  }));
  return { items, totals: cart.totals, raw: cart };
}

/** GET /wc/store/v1/cart */
export async function getCart() {
  const cart = await storeApiFetch('cart', { method: 'GET' });
  return normalizeStoreCart(cart);
}

/**
 * POST /wc/store/v1/cart/add-item
 *
 * The line is a plain simple product: the agreed price, service type, date,
 * time and notes are already baked into the just-in-time product created a
 * moment earlier, so no cart-line extensions (and no Bookings plugin) are
 * involved.
 */
export async function addToCart({
  productId,
  quantity = 1,
}: {
  productId: number;
  quantity?: number;
  booking?: CartItem['booking'];
  /** @deprecated price overrides are not supported by the native Store API */
  priceOverride?: number;
}) {
  const cart = await storeApiFetch('cart/add-item', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: productId, quantity }),
  });
  return normalizeStoreCart(cart);
}

/** POST /wc/store/v1/cart/remove-item */
export async function removeCartItem(itemKey: string) {
  const cart = await storeApiFetch('cart/remove-item', {
    method: 'POST',
    body: JSON.stringify({ key: itemKey }),
  });
  return normalizeStoreCart(cart);
}

/** DELETE /wc/store/v1/cart/items */
export async function clearCart() {
  const cart = await storeApiFetch('cart/items', { method: 'DELETE' });
  return normalizeStoreCart(cart);
}

/** POST /wc/store/v1/cart/apply-coupon */
export async function applyCoupon(code: string) {
  const cart = await storeApiFetch('cart/apply-coupon', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
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
export async function checkout(billingData?: {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address_1?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}) {
  const billing = {
    first_name: billingData?.first_name || '',
    last_name: billingData?.last_name || '',
    email: billingData?.email || '',
    phone: billingData?.phone || '',
    address_1: billingData?.address_1 || '',
    address_2: '',
    city: billingData?.city || '',
    state: billingData?.state || '',
    postcode: billingData?.postcode || '',
    country: billingData?.country || 'US',
  };

  const result = await storeApiFetch('checkout', {
    method: 'POST',
    body: JSON.stringify({
      billing_address: billing,
      shipping_address: billing,
      payment_method: '',
      payment_data: [],
      extensions: {},
    }),
  });

  const orderId = result?.order_id;
  const orderKey = result?.order_key || '';
  const server = getActiveServer();
  const payment_url = result?.payment_result?.redirect_url
    || `${server.baseUrl.replace(/\/$/, '')}/checkout/order-pay/${orderId}/?pay_for_order=true&key=${encodeURIComponent(orderKey)}`;

  // Cart is empty after a successful checkout — drop the stale token so the
  // next add-to-cart starts a fresh session.
  clearStoreSession();

  return {
    order_id: orderId,
    id: orderId,
    order_key: orderKey,
    status: result?.status || 'pending',
    total: result?.totals?.total_price
      ? String(parseFloat(result.totals.total_price) / Math.pow(10, result.totals.currency_minor_unit ?? 2))
      : '0',
    payment_url,
    totals: result?.totals,
  };
}

// ─── Refund helpers ────────────────────────────────────────

export async function createOrderRefund(
  orderId: number,
  options?: { amount?: string; reason?: string }
) {
  // api_refund:true → WC asks the payment gateway (Stripe, PayPal) to
  // actually return money to the customer's card. If no gateway supports
  // refunds for that order, WC still records the refund as bookkeeping.
  const body: any = { api_refund: true };
  if (options?.amount) body.amount = options.amount;
  if (options?.reason) body.reason = options.reason;
  return wcFetch(`orders/${orderId}/refunds`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// Post a customer-facing note on an order (used for dispute / issue reports).
export async function addOrderCustomerNote(orderId: number, note: string) {
  return wcFetch(`orders/${orderId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note, customer_note: true }),
  });
}

export async function getOrderRefunds(orderId: number) {
  try {
    return await wcFetch(`orders/${orderId}/refunds`);
  } catch {
    return [];
  }
}

// ─── Product Reviews (WooCommerce native) ──────────────────
// Uses /wc/v3/products/reviews — zero custom CCT, fully Woo.
export async function fetchProductReviews(productId: number) {
  try {
    return await wcFetch(`products/reviews?product=${productId}&per_page=50&status=approved`);
  } catch {
    return [];
  }
}

export async function createProductReview(args: {
  productId: number;
  rating: number;
  review: string;
  reviewer?: string;
  reviewerEmail?: string;
}) {
  const user = getStoredWPUser();
  const body = {
    product_id: args.productId,
    review: args.review || '',
    reviewer: args.reviewer || (user as any)?.display_name || user?.user_login || 'Customer',
    reviewer_email: args.reviewerEmail || (user as any)?.user_email || 'noreply@careconnected.local',
    rating: Math.max(1, Math.min(5, Math.round(args.rating))),
    status: 'approved',
  };
  return wcFetch('products/reviews', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}


function toTimeMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function addHoursToTime(value: string, durationHours: number) {
  const totalMinutes = toTimeMinutes(value) + durationHours * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function rangesOverlap(startA: string, endA: string, startB: string, endB: string) {
  return toTimeMinutes(startA) < toTimeMinutes(endB) && toTimeMinutes(startB) < toTimeMinutes(endA);
}


// Get bookings/orders for the current vendor (via Dokan)
export async function getDokanVendorOrders(perPage = 50) {
  try {
    return await dokanFetch(`orders?per_page=${perPage}`);
  } catch (error: any) {
    // Non-vendor users (or expired JWT) will fail signature verification, and
    // sites without the Dokan vendor-orders endpoint return 404 HTML. Both are
    // expected; swallow silently so the UI doesn't surface a runtime error.
    return [];
  }
}

// Note: Dokan withdrawal/payout APIs intentionally removed.
// Platform does not handle funds (UrbanSitter-style); clients pay caregivers directly.


// ─── Vendor payout-account settings ────────────────────────
// Stored on the Dokan store record (PayPal native; Stripe/Alipay as custom keys).
export async function getVendorPayoutSettings(storeId: number) {
  try {
    const store = await dokanFetch(`stores/${storeId}`);
    const payment = (store as any)?.payment || {};
    return {
      paypalEmail: payment?.paypal?.email || '',
      stripeAccountId: payment?.custom?.stripe_account_id || '',
      alipayId: payment?.custom?.alipay_id || '',
      bank: payment?.bank || null,
    };
  } catch {
    return { paypalEmail: '', stripeAccountId: '', alipayId: '', bank: null };
  }
}

export async function saveVendorPayoutSettings(
  storeId: number,
  data: { paypalEmail?: string; stripeAccountId?: string; alipayId?: string }
) {
  const payment: any = {};
  if (data.paypalEmail !== undefined) payment.paypal = { email: data.paypalEmail };
  if (data.stripeAccountId !== undefined || data.alipayId !== undefined) {
    payment.custom = {
      ...(data.stripeAccountId !== undefined ? { stripe_account_id: data.stripeAccountId } : {}),
      ...(data.alipayId !== undefined ? { alipay_id: data.alipayId } : {}),
    };
  }
  return dokanFetch(`stores/${storeId}`, {
    method: 'PUT',
    body: JSON.stringify({ payment }),
  });
}

// Returns the Dokan store id for the currently logged-in vendor.
export async function getMyDokanStoreId(): Promise<number | null> {
  try {
    // This Dokan version doesn't ship the v3 `stores/current` endpoint, so
    // skip it (it would return 404 and surface as an edge-function error) and
    // go straight to the `stores?author=` lookup which works on Dokan v2+.
    const wpUser = getStoredWPUser();
    if (!wpUser?.user_id) return null;
    const stores = await dokanFetch(`stores?author=${wpUser.user_id}`) as any[];
    return Array.isArray(stores) && stores[0]?.id ? stores[0].id : null;
  } catch {
    return null;
  }
}


/**
 * Just-in-time care-service product.
 *
 * Discovery, rates and scheduling live entirely in JetEngine CCTs. This is the
 * single moment WooCommerce is touched before checkout: the agreed price is
 * written into a hidden simple product owned by the caregiver (Dokan vendor id
 * in meta) so cart, checkout, payment, orders and payouts are 100% Woo/Dokan.
 */
export async function createServiceProduct(input: {
  name: string;
  description?: string;
  amount: number;
  vendorUserId: string | number;
  meta?: Array<{ key: string; value: string }>;
}): Promise<{ id: number; price: number }> {
  const vendorId = Number(String(input.vendorUserId).replace(/^wp-/, ''));
  const result = await adminOp<{ id: number; price: number }>('create_service_product', {
    name: input.name,
    description: input.description ?? '',
    amount: input.amount,
    vendor_user_id: vendorId,
    meta: input.meta ?? [],
  });
  if (!result?.id) throw new Error('Could not create the service product');
  return { id: Number(result.id), price: Number(result.price || input.amount) };
}
