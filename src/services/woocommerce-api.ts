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
async function wcFetch(endpoint: string, options: RequestInit = {}) {
  // WooCommerce is only ever touched for order-level operations (status,
  // booking meta, refunds, notes). Catalog, pricing, availability and
  // discovery all live in the JetEngine CCTs, so nothing here reads products.
  const url = buildWPUrl(`wc/v3/${endpoint}`);

  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(url, { ...options, headers });


  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WooCommerce API error: ${response.status} - ${error}`);
  }

  return response.json();
}



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
  // Neither clients nor caregivers can write to wc/v3 directly (WooCommerce
  // returns 403), so the change goes through the server-side helper, which
  // checks the caller owns the booking before applying it.
  return adminOp<{ id: number; status: string }>('set_order_status', {
    order_id: orderId,
    status,
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
  /** Store API line description — carries the rate math and the schedule. */
  description?: string;
  /** Store API line meta (e.g. Dokan vendor name). */
  item_data?: Array<{ name?: string; value?: string; type?: string }>;
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
    // The just-in-time product bakes the agreed rate, hours and schedule into
    // its description; the cart line shows it so identical services booked at
    // different times stay distinguishable.
    description: it.description,
    item_data: it.item_data,
  }));
  return { items, totals: cart.totals, raw: cart };
}

// ---------------------------------------------------------------------------
// Cart intent guard
//
// WooCommerce keeps a *persistent* cart per logged-in customer and merges it
// back into whatever session shows up next. That means bookings a client added
// days ago in an abandoned session can silently reappear and get charged at
// checkout (observed: a cart showing one $40 booking produced a $340 order with
// seven resurrected lines). The app is therefore the single source of truth:
// we record the products this device actually put in the cart and purge any
// line the store hands back that we did not add.
// ---------------------------------------------------------------------------
const CART_INTENT_KEY = 'cc_cart_intent';

function readCartIntent(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_INTENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeCartIntent(ids: number[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_INTENT_KEY, JSON.stringify(ids));
}

function addCartIntent(productId: number) {
  const ids = readCartIntent();
  ids.push(Number(productId));
  writeCartIntent(ids);
}

function dropCartIntent(productId?: number) {
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
async function purgeGhostLines(cart: any) {
  const intent = readCartIntent();
  const ghosts = (cart?.items || []).filter((it: any) => !intent.includes(Number(it.id)));
  if (!ghosts.length) return cart;

  let current = cart;
  for (const ghost of ghosts) {
    try {
      current = await storeApiFetch('cart/remove-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: ghost.key }),
      });
    } catch {
      /* keep purging the rest; checkout re-verifies below */
    }
  }
  return current;
}

/** GET /wc/store/v1/cart */
export async function getCart() {
  const cart = await storeApiFetch('cart', { method: 'GET' });
  return normalizeStoreCart(await purgeGhostLines(cart));
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
  // A just-in-time service product can still be warming up in the store's
  // caches, in which case the Store API answers "not available for purchase".
  // Retry briefly instead of failing the booking.
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const cart = await storeApiFetch('cart/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, quantity }),
      });
      return normalizeStoreCart(cart);
    } catch (error) {
      lastError = error;
      if (!String(error).includes('not_purchasable')) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Could not add the service to the cart');
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

  // The store requires a payment method on the order. Read the gateways the
  // store currently offers and prefer one that leaves the order awaiting
  // payment, so the customer still settles it on the secure payment page.
  let method = 'bacs';
  try {
    const cart = await storeApiFetch('cart', { method: 'GET' });
    const available: string[] = Array.isArray(cart?.payment_methods) ? cart.payment_methods : [];
    if (available.length) {
      method = available.find((m) => m === 'bacs') || available.find((m) => m === 'cheque') || available[0];
    }
  } catch {
    // fall back to the default below
  }

  const result = await storeApiFetch('checkout', {
    method: 'POST',
    body: JSON.stringify({
      billing_address: billing,
      shipping_address: billing,
      payment_method: method,
      payment_data: [],
      extensions: {},
    }),
  });


  const orderId = result?.order_id;
  const orderKey = result?.order_key || '';
  const server = getActiveServer();
  // When the gateway already accepted the order (offline / bank transfer), the
  // redirect_url is just WordPress's own "order received" page — we stay
  // headless and show our own confirmation screen instead. Only hand the
  // customer off when payment still has to be collected by a gateway.
  const paymentStatus = result?.payment_result?.payment_status || '';
  const needsPayment = paymentStatus !== 'success';
  const payment_url = needsPayment
    ? `${server.baseUrl.replace(/\/$/, '')}/checkout/order-pay/${orderId}/?pay_for_order=true&key=${encodeURIComponent(orderKey)}`
    : '';


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

// ─── Refunds & order conversation (dispute thread) ─────────
// Buyers and caregivers have no wc/v3 capability, so every one of these runs in
// the edge function with the store keys after it proves the caller owns the
// order. A client can only *ask*; the caregiver approves or declines. Nobody
// ever has to open the WordPress admin.

export type OrderNote = { id: number; note: string; date_created: string };

/** Client asks for a refund. Records the request + posts it to the thread. */
export async function requestOrderRefund(
  orderId: number,
  options: { amount?: string | number; reason: string },
) {
  return adminOp('request_refund', {
    order_id: orderId,
    reason: options.reason,
    ...(options.amount ? { amount: Number(options.amount) } : {}),
  });
}

/** Caregiver settles an open refund request. */
export async function resolveOrderRefund(
  orderId: number,
  decision: 'approve' | 'decline',
  note?: string,
) {
  return adminOp('resolve_refund', { order_id: orderId, decision, note: note ?? '' });
}

/** Shared message thread on a booking — used for disputes and issue reports. */
export async function getOrderNotes(orderId: number): Promise<OrderNote[]> {
  const notes = await adminOp<OrderNote[]>('list_order_notes', { order_id: orderId });
  return Array.isArray(notes) ? notes : [];
}

export async function addOrderCustomerNote(orderId: number, note: string) {
  return adminOp('add_order_note', { order_id: orderId, note });
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
    // Preferred: the edge function reads the caller's vendor orders with store
    // keys AND copies the service schedule meta (date / time / duration) from
    // the just-in-time product onto the order. Dokan's own vendor-orders
    // endpoint omits that meta, which left the caregiver's request list showing
    // the order date instead of the appointment. It also scopes the list to
    // care-marketplace orders — the WooCommerce store is shared with the other
    // apps on this backend, so an unscoped list leaks unrelated purchases into
    // the care schedule. An empty result is therefore a valid answer, not a
    // reason to fall back to Dokan's unscoped list.
    return await adminOp<any[]>('list_my_vendor_orders', { per_page: perPage }) ?? [];
  } catch {
    // Fall through to Dokan's endpoint below only when the scoped read failed.
  }
  try {
    const viaDokan = await dokanFetch(`orders?per_page=${perPage}`);
    return Array.isArray(viaDokan) ? viaDokan : [];
  } catch {
    return [];
  }
}



/** Orders the signed-in user placed as a client (read server-side, scoped). */
export async function getMyCustomerOrders(perPage = 50) {
  try {
    const orders = await adminOp<any[]>('list_my_orders', { per_page: perPage });
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}


// ─── Dokan payout account, balance and withdrawals ─────────
// Dokan's own REST endpoints reject a caregiver's bearer token, so these read
// and write through the server-side helper, always scoped to the caller.

export interface MyPayoutData {
  balance: {
    current_balance: number;
    withdraw_limit: number | string;
    withdraw_threshold: number | string;
    withdraw_methods: string[];
  } | null;
  withdrawals: Array<{ id: number; amount: string; status: string; method: string; created: string }>;
  payment: {
    paypal?: { email?: string };
    bank?: Record<string, string>;
  };
}

export async function getMyPayout(): Promise<MyPayoutData | null> {
  return adminOp<MyPayoutData>('get_my_payout');
}

export async function saveMyPayout(payment: {
  paypal?: { email: string };
  bank?: Record<string, string>;
}) {
  return adminOp('save_my_payout', { payment });
}

export async function requestWithdrawal(amount: number, method: string) {
  return adminOp('request_withdrawal', { amount, method });
}

/**
 * Display names for arbitrary WP user ids. WordPress hides users who never
 * authored content from non-admin callers, so chat counterparts (clients)
 * are invisible to caregivers through wp/v2/users. Resolved server-side.
 */
export async function lookupUserNames(
  ids: number[],
): Promise<Array<{ id: number; name: string; avatar: string | null }>> {
  const clean = Array.from(new Set(ids.filter((n) => Number.isFinite(n) && n > 0)));
  if (clean.length === 0) return [];
  try {
    const rows = await adminOp<Array<{ id: number; name: string; avatar: string | null }>>(
      'get_user_names',
      { ids: clean },
    );
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
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
  const id = Number(result.id);

  // The store's object cache can lag a second or two behind a freshly created
  // product, and the Store API refuses to add a line it still sees as
  // non-purchasable. Wait until it reports the product as ready.
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const res = await fetch(buildWPUrl(`wc/store/v1/products/${id}`), { headers: getAuthHeaders() });
      if (res.ok) {
        const product = await res.json();
        if (product?.is_purchasable) break;
      }
    } catch {
      /* keep waiting */
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  return { id, price: Number(result.price || input.amount) };
}

// ─── Store country / state codes ───────────────────────────
// WooCommerce validates billing state against its own per-country code list
// ("BJ" is rejected for CN, it wants "CN2"), so the cart reads the real list.
export interface WcCountry {
  code: string;
  name: string;
  states: Array<{ code: string; name: string }>;
}

export async function getStoreCountries(): Promise<WcCountry[]> {
  try {
    const list = await adminOp<WcCountry[]>('get_countries', {});
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
