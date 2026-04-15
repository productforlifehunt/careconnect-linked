// WooCommerce REST API Service Layer
// Headless integration for Care Connector marketplace
// Auth: uses Vite dev-proxy + Supabase edge proxy + JWT Bearer token

import { getWPToken } from './wp-auth';
import { buildWPUrl, buildWPHeaders } from '@/lib/wp-url';

// Parent category slug for all care service products
export const CARE_SERVICES_CATEGORY = 'care-services';

/**
 * Build auth headers using JWT Bearer token
 */
function getAuthHeaders(): Record<string, string> {
  const token = getWPToken();
  return buildWPHeaders(token, 'application/json');
}

/**
 * Fetch wrapper for WooCommerce REST API v3 (admin endpoints)
 */
async function wcFetch(endpoint: string, options: RequestInit = {}) {
  const url = buildWPUrl(`wc/v3/${endpoint}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WooCommerce API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Fetch wrapper for WooCommerce Store API (cart / checkout — public, cookie-based)
 */
async function storeApiFetch(endpoint: string, options: RequestInit = {}) {
  const url = buildWPUrl(`wc/store/v1/${endpoint}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WC Store API error: ${response.status} - ${error}`);
  }

  const nonce = response.headers.get('Nonce') || response.headers.get('X-WC-Store-API-Nonce') || '';
  const data = await response.json();
  if (nonce) (data as any)._nonce = nonce;
  return data;
}

async function wcBookingsFetch(endpoint: string, options: RequestInit = {}) {
  const url = buildWPUrl(`wc-bookings/v1/${endpoint}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WooCommerce Bookings API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get or ensure a product category exists by slug
 */
export async function ensureCategoryBySlug(slug: string, name?: string, parentId?: number) {
  try {
    const categories = await wcFetch(`products/categories?slug=${slug}`);
    if (categories && categories.length > 0) {
      return categories[0];
    }
    // Create if missing
    const body: any = { name: name || slug, slug };
    if (parentId) body.parent = parentId;
    return await wcFetch('products/categories', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error(`Error ensuring category ${slug}:`, error);
    throw error;
  }
}

/**
 * Provider Product Management
 * Products are VARIABLE type with pa_service-type as the variation attribute.
 * Each service type the provider offers becomes a variation with its own price.
 */

export interface ServiceRateEntry {
  serviceType: string; // term name e.g. "Elder Care"
  hourlyRate: number;
}

// ─── Admin Basic Auth for Dokan admin operations ───────────
// Dokan REST API is designed to use WP Application Password for admin ops
// (role promotion, store management). This is the documented approach.
const WP_ADMIN_USER = 'challenged';
const WP_APP_PASSWORD = 'vPKl An2l fwQi TmUl ASPCYIoM'.replace(/ /g, '');

function getAdminBasicAuth(): string {
  return btoa(`${WP_ADMIN_USER}:${WP_APP_PASSWORD}`);
}

function getAdminHeaders(contentType?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Authorization': `Basic ${getAdminBasicAuth()}`,
  };
  if (contentType) headers['Content-Type'] = contentType;
  // Include Supabase apikey when routing through edge function proxy
  const server = getActiveServer();
  const useEdgeFunction = !IS_DEV || !server.isPrimary;
  if (useEdgeFunction) {
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (anonKey) headers['apikey'] = anonKey;
  }
  return headers;
}

/**
 * Fetch wrapper for admin-level WP REST API calls using Application Password.
 * Used for operations that require admin privileges (role changes, store management).
 */
async function wpAdminFetch(wpJsonPath: string, options: RequestInit = {}) {
  const url = buildWPUrl(wpJsonPath);
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAdminHeaders('application/json'),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WP Admin API error: ${response.status} - ${error}`);
  }
  return response.json();
}

/**
 * Fetch wrapper for Dokan admin API using Application Password.
 * Dokan docs: admin endpoints require Basic Auth with Application Password.
 */
async function dokanAdminFetch(endpoint: string, options: RequestInit = {}) {
  const url = buildWPUrl(`dokan/v1/${endpoint}`);
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAdminHeaders('application/json'),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dokan Admin API error: ${response.status} - ${error}`);
  }
  return response.json();
}

/**
 * Ensure the current user is a Dokan vendor (has `seller` role and store).
 * 
 * This follows Dokan's designed flow:
 * 1. Check if user already has a Dokan store → update & return
 * 2. If not, use admin Application Password to set role to `seller`
 *    (This is how Dokan is designed — role promotion requires admin auth)
 * 3. Configure the Dokan store via dokan/v1/stores/{id} (admin endpoint)
 * 
 * After this, the vendor can use their own JWT with dokan/v1/products
 * to create/manage their products (vendor-scoped by Dokan).
 */
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

  // Step 1: Check if user already has a Dokan store (admin endpoint)
  try {
    const stores = await dokanAdminFetch(`stores?include=${wpUserId}`);
    if (Array.isArray(stores) && stores.length > 0) {
      const store = stores[0];
      // Update store settings
      try {
        return await dokanAdminFetch(`stores/${store.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            store_name: userData.fullName ? `${userData.fullName} Care Services` : store.store_name,
            phone: userData.phone || store.phone || '',
            address: { street_1: userData.location || '' },
          }),
        });
      } catch {
        return store;
      }
    }
  } catch {
    // No store found — proceed to create
  }

  // Step 2: Promote user to 'seller' role via WP REST API (admin Basic Auth)
  // This is how Dokan is designed — the WP registration form sets role=seller,
  // and for existing users, an admin changes the role.
  try {
    await wpAdminFetch(`wp/v2/users/${wpUserId}`, {
      method: 'POST',
      body: JSON.stringify({ roles: ['seller'] }),
    });
    console.log('ensureDokanVendor: seller role assigned successfully');
  } catch (e) {
    console.warn('ensureDokanVendor: role assignment error', e);
    // Continue — they may already be a seller
  }

  // Step 3: Configure the Dokan store (admin endpoint — store config requires admin)
  try {
    const store = await dokanAdminFetch(`stores/${wpUserId}`, {
      method: 'PUT',
      body: JSON.stringify({
        store_name: `${userData.fullName} Care Services`,
        phone: userData.phone || '',
        address: { street_1: userData.location || '' },
      }),
    });
    return store;
  } catch (e) {
    console.warn('ensureDokanVendor: store setup error', e);
    return null;
  }
}

// Get or create provider's service product via DOKAN API so product is vendor-owned
export async function getOrCreateProviderProduct(
  providerId: string,
  providerData: {
    fullName: string;
    hourlyRate: number; // default rate (fallback)
    bio?: string;
    specialties?: string[];
    certifications?: string[];
    yearsOfExperience?: number;
    location?: string;
    serviceRates?: ServiceRateEntry[]; // per-service-type pricing
  }
) {
  try {
    const parentCat = await ensureCategoryBySlug(CARE_SERVICES_CATEGORY, 'Care Services');
    const categoryIds = [parentCat.id];

    const sku = `care-provider-${providerId}`;
    
    // Check if product already exists (search via WC admin API for SKU lookup)
    let existingProduct: any = null;
    try {
      const existingProducts = await wcFetch(`products?sku=${sku}`);
      if (existingProducts && existingProducts.length > 0) {
        existingProduct = existingProducts[0];
      }
    } catch { /* no existing product */ }

    // Determine which service types this provider offers
    const serviceRates = providerData.serviceRates || [];
    const serviceTypeOptions = serviceRates.length > 0
      ? serviceRates.map(r => r.serviceType)
      : (providerData.specialties || []);

    const productData: any = {
      name: `${providerData.fullName} – Care Service`,
      type: serviceTypeOptions.length > 0 ? 'variable' : 'simple',
      description: providerData.bio || '',
      short_description: `Professional care service by ${providerData.fullName}`,
      sku,
      categories: categoryIds.map(id => ({ id })),
      meta_data: [
        { key: '_provider_id', value: providerId },
        { key: '_hourly_rate', value: providerData.hourlyRate.toString() },
        { key: '_specialties', value: JSON.stringify(providerData.specialties || []) },
        { key: '_certifications', value: JSON.stringify(providerData.certifications || []) },
        { key: '_years_of_experience', value: (providerData.yearsOfExperience || 0).toString() },
        { key: '_location', value: providerData.location || '' },
      ],
      virtual: true,
      downloadable: false,
      manage_stock: false,
      stock_status: 'instock' as const,
      status: 'publish',
    };

    // For variable products, add service-type as a product attribute
    if (serviceTypeOptions.length > 0) {
      productData.attributes = [{
        name: 'Service Type',
        slug: 'pa_service-type',
        visible: true,
        variation: true,
        options: serviceTypeOptions,
      }];
    } else {
      productData.regular_price = providerData.hourlyRate.toString();
    }

    let product;
    if (existingProduct) {
      // Update existing product via Dokan vendor API
      product = await dokanFetch(`products/${existingProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
    } else {
      // Create new product via Dokan vendor API — this makes it vendor-owned
      product = await dokanFetch('products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    }

    // Sync variations (one per service type with its own price)
    if (product && serviceRates.length > 0) {
      await syncProviderVariations(product.id, serviceRates, providerData.hourlyRate);
    }

    return product;
  } catch (error) {
    console.error('Error managing provider product:', error);
    throw error;
  }
}

/**
 * Sync WooCommerce product variations for each service type with its own hourly rate.
 * Creates missing variations, updates existing ones.
 */
/**
 * Sync WooCommerce product variations via Dokan API for vendor ownership.
 */
async function syncProviderVariations(
  productId: number,
  serviceRates: ServiceRateEntry[],
  defaultRate: number
) {
  try {
    // Fetch existing variations — use WC admin API for read (dokan may not list all)
    const existing = await wcFetch(`products/${productId}/variations?per_page=100`);
    const existingMap = new Map<string, any>();
    (existing || []).forEach((v: any) => {
      const attr = (v.attributes || []).find((a: any) => a.name === 'Service Type' || a.slug === 'pa_service-type');
      if (attr) existingMap.set(attr.option, v);
    });

    for (const rate of serviceRates) {
      const existingVariation = existingMap.get(rate.serviceType);
      const variationData = {
        regular_price: (rate.hourlyRate || defaultRate).toString(),
        attributes: [{ name: 'Service Type', option: rate.serviceType }],
        virtual: true,
        status: 'publish',
      };

      if (existingVariation) {
        await wcFetch(`products/${productId}/variations/${existingVariation.id}`, {
          method: 'PUT',
          body: JSON.stringify(variationData),
        });
      } else {
        await wcFetch(`products/${productId}/variations`, {
          method: 'POST',
          body: JSON.stringify(variationData),
        });
      }
    }
  } catch (error) {
    console.error('Error syncing provider variations:', error);
  }
}
/** Get all variations for a provider product */
export async function getProviderVariations(productId: number): Promise<any[]> {
  try {
    return await wcFetch(`products/${productId}/variations?per_page=100`);
  } catch {
    return [];
  }
}

// Get provider's product by provider ID
export async function getProviderProduct(providerId: string) {
  try {
    const sku = `care-provider-${providerId}`;
    const products = await wcFetch(`products?sku=${sku}`);
    if (products && products.length > 0) return products[0];

    const oldProducts = await wcFetch(`products?sku=provider-${providerId}`);
    if (oldProducts && oldProducts.length > 0) return oldProducts[0];

    const providerProducts = await wcBookingsFetch('products');
    const matchedBookingProduct = (providerProducts || []).find((product: any) => {
      const storeId = Number(product?.store?.id ?? 0);
      const authorId = Number(product?.author ?? product?.post_author ?? 0);
      const metaProviderId = Array.isArray(product?.meta_data)
        ? product.meta_data.find((item: any) => item?.key === '_provider_id')?.value
        : null;
      return storeId === Number(providerId) || authorId === Number(providerId) || String(metaProviderId || '') === String(providerId);
    });

    if (matchedBookingProduct) return matchedBookingProduct;

    return null;
  } catch (error) {
    console.error('Error getting provider product:', error);
    return null;
  }
}

// Update provider product status (active/inactive)
export async function updateProviderProductStatus(
  providerId: string,
  isActive: boolean
) {
  try {
    const product = await getProviderProduct(providerId);
    
    if (!product) {
      throw new Error('Provider product not found');
    }

    return await wcFetch(`products/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: isActive ? 'publish' : 'draft',
      }),
    });
  } catch (error) {
    console.error('Error updating provider product status:', error);
    throw error;
  }
}

/**
 * Service Search & Filtering
 */

// Search for care services (all virtual products under care-services category)
export async function searchCareServices(filters?: {
  query?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  specialties?: string[];
  location?: string;
}) {
  try {
    const params: string[] = ['status=publish', 'per_page=100'];

    if (filters?.categorySlug) {
      params.push(`category=${encodeURIComponent(filters.categorySlug)}`);
    }
    if (filters?.minPrice !== undefined) params.push(`min_price=${filters.minPrice}`);
    if (filters?.maxPrice !== undefined) params.push(`max_price=${filters.maxPrice}`);
    if (filters?.query) params.push(`search=${encodeURIComponent(filters.query)}`);

    const products = await wcFetch(`products?${params.join('&')}`);

    // Client-side specialty filter
    if (filters?.specialties && filters.specialties.length > 0) {
      return products.filter((product: any) => {
        const meta = product.meta_data?.find((m: any) => m.key === '_specialties');
        if (meta) {
          const ps = JSON.parse(meta.value || '[]');
          return filters.specialties?.some(s => ps.includes(s));
        }
        return false;
      });
    }

    return products;
  } catch (error) {
    console.error('Error searching care services:', error);
    return [];
  }
}

/**
 * Order & Booking Integration
 */

// Create an order for a care service booking
export async function createServiceOrder(
  providerId: string,
  bookingData: {
    clientId: string;
    appointmentDate: string;
    appointmentTime: string;
    durationHours: number;
    hourlyRate: number;
    totalCost: number;
    serviceType?: string;
    specialInstructions?: string;
  }
) {
  try {
    // Get provider's product
    const product = await getProviderProduct(providerId);
    
    if (!product) {
      throw new Error('Provider service product not found');
    }

    const bookingConflictMessage = await getProviderBookingConflictMessage(
      providerId,
      bookingData.appointmentDate,
      bookingData.appointmentTime,
      bookingData.durationHours,
    );
    if (bookingConflictMessage) {
      throw new Error(bookingConflictMessage);
    }

    // Calculate line item total
    const lineItemTotal = (bookingData.durationHours * bookingData.hourlyRate).toFixed(2);

    // Create order
    const order = await wcFetch('orders', {
      method: 'POST',
      body: JSON.stringify({
        status: 'pending', // Will be confirmed after payment
        line_items: [
          {
            product_id: product.id,
            quantity: bookingData.durationHours,
            total: lineItemTotal,
            meta_data: [
              { key: '_appointment_date', value: bookingData.appointmentDate },
              { key: '_appointment_time', value: bookingData.appointmentTime },
              { key: '_duration_hours', value: bookingData.durationHours.toString() },
              { key: '_hourly_rate', value: bookingData.hourlyRate.toString() },
              { key: '_provider_id', value: providerId },
              { key: '_client_id', value: bookingData.clientId },
              { key: '_service_type', value: bookingData.serviceType || 'care' },
              { key: '_special_instructions', value: bookingData.specialInstructions || '' },
            ],
          },
        ],
        meta_data: [
          { key: '_booking_type', value: 'care_service' },
          { key: '_provider_id', value: providerId },
          { key: '_client_id', value: bookingData.clientId },
          { key: '_appointment_date', value: bookingData.appointmentDate },
          { key: '_appointment_time', value: bookingData.appointmentTime },
        ],
      }),
    });

    return order;
  } catch (error) {
    console.error('Error creating service order:', error);
    throw error;
  }
}

// ─── Booking Availability Types ────────────────────────────

interface WooBookingAvailabilityRule {
  type: string;
  bookable: string;
  priority?: number;
  from?: string;
  to?: string;
}

interface NormalizedBookingAvailabilityRule {
  kind: 'weekly' | 'date';
  type: string;
  day_of_week?: number;
  specific_date?: string;
  start_time?: string | null;
  end_time?: string | null;
  is_available: boolean;
  priority: number;
  bookable: string;
  from?: string;
  to?: string;
}

const RULE_TO_DAY: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

function normalizeBookingAvailabilityRules(rules: WooBookingAvailabilityRule[] = []): NormalizedBookingAvailabilityRule[] {
  return rules
    .filter((rule) => !!rule?.type)
    .map((rule) => {
      if (rule.type.startsWith('time:')) {
        const dayName = rule.type.split(':')[1];
        return {
          kind: 'weekly' as const,
          type: rule.type,
          day_of_week: RULE_TO_DAY[dayName],
          start_time: rule.from || '09:00',
          end_time: rule.to || '17:00',
          is_available: rule.bookable === 'yes',
          priority: Number(rule.priority ?? 10),
          bookable: rule.bookable,
        };
      }

      const fromValue = rule.from || '';
      const toValue = rule.to || '';
      const isDateTimeRange = rule.type.includes('daterange') && fromValue.includes(' ');
      return {
        kind: 'date' as const,
        type: rule.type,
        specific_date: isDateTimeRange ? fromValue.split(' ')[0] : fromValue,
        start_time: isDateTimeRange ? fromValue.split(' ')[1] : null,
        end_time: isDateTimeRange ? (toValue.split(' ')[1] || null) : null,
        is_available: rule.bookable === 'yes',
        priority: Number(rule.priority ?? 10),
        bookable: rule.bookable,
        from: fromValue,
        to: toValue,
      };
    });
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

// ─── Vendor sync (legacy wrapper — delegates to ensureDokanVendor) ─────
// Kept for backward compat; prefer ensureDokanVendor directly.
export async function syncProviderToVendor(
  _providerId: string,
  data: { fullName: string; email: string; location?: string; bio?: string; phone?: string }
) {
  return ensureDokanVendor(data);
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

export async function getProviderOrders(providerId: string) {
  try {
    const orders = await wcFetch(`orders?per_page=100&meta_key=_provider_id&meta_value=${providerId}`);
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

export async function getProviderAvailability(providerId: string): Promise<NormalizedBookingAvailabilityRule[]> {
  try {
    const product = await getProviderProduct(providerId);
    if (!product) return [];
    const bookingProduct = await wcBookingsFetch(`products/${product.id}`);
    return normalizeBookingAvailabilityRules(bookingProduct?.availability || []);
  } catch {
    return [];
  }
}

export async function upsertProviderAvailability(providerId: string, slots: any[]) {
  const product = await getProviderProduct(providerId);
  if (!product) throw new Error('Provider product not found');
  // Update availability rules on the booking product
  const res = await wcBookingsFetch(`products/${product.id}`, {
    method: 'POST',
    body: JSON.stringify({ availability: slots }),
  });
  return res;
}

// ─── Client-side Cart + WC REST API v3 Checkout ─────────────
// The WC Store API requires cookie/nonce auth which doesn't work
// cross-origin with JWT. We use a client-side cart (localStorage)
// and create WC orders directly via the admin REST API at checkout.

const CART_STORAGE_KEY = 'cc_cart_items';

export interface CartItem {
  key: string;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  provider_id?: string;
}

function loadCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCartItems(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export async function getCart() {
  const items = loadCartItems();
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return {
    items: items.map(i => ({
      key: i.key,
      id: i.product_id,
      name: i.name,
      quantity: i.quantity,
      prices: { price: String(Math.round(i.price * 100)), currency_code: 'USD' },
      images: i.image ? [{ src: i.image }] : [],
      totals: { line_total: String(Math.round(i.price * i.quantity * 100)) },
    })),
    totals: {
      total_price: String(Math.round(total * 100)),
      total_items: String(Math.round(total * 100)),
      currency_code: 'USD',
    },
    items_count: items.reduce((s, i) => s + i.quantity, 0),
  };
}

export async function addToCart({ productId, quantity = 1 }: { productId: number; quantity?: number }) {
  // Fetch product info from WC REST API to get name/price
  let product: any;
  try {
    product = await wcFetch(`products/${productId}`);
  } catch {
    product = { id: productId, name: `Product #${productId}`, price: '0', images: [] };
  }

  const items = loadCartItems();
  const existing = items.find(i => i.product_id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      key: `${productId}_${Date.now()}`,
      product_id: productId,
      name: product.name || `Product #${productId}`,
      price: parseFloat(product.price || '0'),
      quantity,
      image: product.images?.[0]?.src,
      provider_id: product.meta_data?.find?.((m: any) => m.key === 'provider_id')?.value,
    });
  }
  saveCartItems(items);
  return getCart();
}

export async function removeCartItem(itemKey: string) {
  const items = loadCartItems().filter(i => i.key !== itemKey);
  saveCartItems(items);
  return getCart();
}

export async function clearCart() {
  saveCartItems([]);
  return getCart();
}

export async function checkout(billingData?: {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}) {
  const items = loadCartItems();
  if (items.length === 0) throw new Error('Cart is empty');

  // Create a WC order via REST API v3 (supports JWT auth)
  const lineItems = items.map(i => ({
    product_id: i.product_id,
    quantity: i.quantity,
  }));

  const orderPayload: any = {
    payment_method: 'cod',
    payment_method_title: 'Cash on delivery',
    set_paid: true,
    status: 'processing',
    line_items: lineItems,
  };

  if (billingData) {
    orderPayload.billing = {
      first_name: billingData.first_name || '',
      last_name: billingData.last_name || '',
      email: billingData.email || '',
      phone: billingData.phone || '',
      address_1: '',
      city: '',
      state: '',
      postcode: '',
      country: 'US',
    };
  }

  const order = await wcFetch('orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });

  // Clear client-side cart after successful order
  saveCartItems([]);

  return {
    order_id: order.id,
    id: order.id,
    order_key: order.order_key || '',
    status: order.status,
    total: order.total,
    totals: { total_price: String(Math.round(parseFloat(order.total || '0') * 100)) },
  };
}

// ─── Refund helpers ────────────────────────────────────────

export async function createOrderRefund(
  orderId: number,
  options?: { amount?: string; reason?: string }
) {
  const body: any = { api_refund: false };
  if (options?.amount) body.amount = options.amount;
  if (options?.reason) body.reason = options.reason;
  return wcFetch(`orders/${orderId}/refunds`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getOrderRefunds(orderId: number) {
  try {
    return await wcFetch(`orders/${orderId}/refunds`);
  } catch {
    return [];
  }
}

// ─── Conflict / availability types & helpers ───────────────

type ProviderBookingConflictCheck = {
  orderId: number;
  appointmentDate: string;
  appointmentTime: string;
  durationHours: number;
  status: string;
};

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

async function getProviderBookedTimeRanges(providerId: string) {
  const orders = await getProviderOrders(providerId);
  if (!Array.isArray(orders)) return [] as ProviderBookingConflictCheck[];

  return orders
    .map((order: any) => {
      const appointmentDate = Array.isArray(order?.meta_data)
        ? order.meta_data.find((item: any) => item?.key === '_appointment_date')?.value || ''
        : '';
      const appointmentTime = Array.isArray(order?.meta_data)
        ? order.meta_data.find((item: any) => item?.key === '_appointment_time')?.value || ''
        : '';
      const durationValue = Array.isArray(order?.meta_data)
        ? order.meta_data.find((item: any) => item?.key === '_duration_hours')?.value || ''
        : '';

      return {
        orderId: Number(order?.id || 0),
        appointmentDate,
        appointmentTime,
        durationHours: Number(durationValue || order?.line_items?.[0]?.quantity || 0),
        status: String(order?.status || ''),
      };
    })
    .filter((booking) => {
      if (!booking.orderId || !booking.appointmentDate || !booking.appointmentTime || !booking.durationHours) return false;
      return ['pending', 'on-hold', 'processing', 'completed'].includes(booking.status);
    });
}

export async function getProviderBookingConflictMessage(
  providerId: string,
  date: string,
  time: string,
  durationHours = 0,
  options?: { excludeOrderId?: number },
) {
  const availability = await getProviderAvailability(providerId);
  const scheduleConflict = getAvailabilityConflictMessage(availability, date, time, durationHours);
  if (scheduleConflict) return scheduleConflict;

  if (!durationHours) return null;

  const bookedRanges = await getProviderBookedTimeRanges(providerId);
  const requestedEnd = addHoursToTime(time, durationHours);
  const conflictingBooking = bookedRanges.find((booking) => {
    if (options?.excludeOrderId && booking.orderId === options.excludeOrderId) return false;
    if (booking.appointmentDate !== date) return false;
    const bookingEnd = addHoursToTime(booking.appointmentTime, booking.durationHours);
    return rangesOverlap(time, requestedEnd, booking.appointmentTime, bookingEnd);
  });

  if (!conflictingBooking) return null;

  return `Provider already has a booking from ${conflictingBooking.appointmentTime} to ${addHoursToTime(conflictingBooking.appointmentTime, conflictingBooking.durationHours)} on this date.`;
}

export function getAvailabilityConflictMessage(
  availability: NormalizedBookingAvailabilityRule[] = [],
  date: string,
  time: string,
  durationHours = 0,
) {
  if (!date || !time || !availability || availability.length === 0) return null;

  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
  const specificSlots = availability.filter((slot) => slot.specific_date === date);

  const evaluateDuration = (slot: NormalizedBookingAvailabilityRule) => {
    if (!durationHours || !slot.end_time) return null;
    const endMinutes = toTimeMinutes(time) + durationHours * 60;
    const slotEndMinutes = toTimeMinutes(slot.end_time);
    if (endMinutes > slotEndMinutes) {
      return `Session would end at ${Math.floor(endMinutes / 60)}:${String(endMinutes % 60).padStart(2, '0')} but provider is available until ${slot.end_time}.`;
    }
    return null;
  };

  if (specificSlots.length > 0) {
    const blockedForDate = specificSlots.some((slot) => !slot.is_available && !slot.start_time && !slot.end_time);
    if (blockedForDate) return 'Provider is not available on this date.';

    const matchingSpecificSlot = specificSlots.find((slot) => slot.is_available && slot.start_time && slot.end_time && time >= slot.start_time && time < slot.end_time);
    if (matchingSpecificSlot) {
      return evaluateDuration(matchingSpecificSlot);
    }

    const specificRanges = specificSlots
      .filter((slot) => slot.is_available && slot.start_time && slot.end_time)
      .map((slot) => `${slot.start_time}–${slot.end_time}`)
      .join(', ');

    if (specificRanges) {
      return `Provider is available ${specificRanges} on this date.`;
    }
  }

  const weeklySlots = availability.filter((slot) => typeof slot.day_of_week === 'number' && slot.day_of_week === dayOfWeek);
  if (weeklySlots.length === 0) {
    return 'Provider has no availability set for this day.';
  }

  const matchingWeeklySlot = weeklySlots.find((slot) => slot.is_available && slot.start_time && slot.end_time && time >= slot.start_time && time < slot.end_time);
  if (matchingWeeklySlot) {
    return evaluateDuration(matchingWeeklySlot);
  }

  const ranges = weeklySlots
    .filter((slot) => slot.is_available)
    .map((slot) => `${slot.start_time}–${slot.end_time}`)
    .join(', ');

  return ranges ? `Provider is available: ${ranges}` : 'Provider is not available on this day.';
}

export async function getProviderAvailabilitySetting(pid: string) {
  const p = await getProviderProduct(pid);
  if (!p) return null;
  const bookingProduct = await wcBookingsFetch(`products/${p.id}`);
  const minNoticeHours = bookingProduct.min_date_unit === 'day'
    ? Number(bookingProduct.min_date_value || 0) * 24
    : Number(bookingProduct.min_date_value || 0);
  return {
    min_notice_hours: minNoticeHours,
    booking_window_days: Number(bookingProduct.max_date_value || 60),
    allow_same_day: Number(bookingProduct.min_date_value || 0) === 0,
    requires_confirmation: Boolean(bookingProduct.requires_confirmation),
    buffer_period: Number(bookingProduct.buffer_period || 0),
    default_date_availability: bookingProduct.default_date_availability || 'available',
  };
}

export async function updateProviderAvailabilitySetting(pid: string, setting: any) {
  const p = await getProviderProduct(pid);
  if (!p) throw new Error('Product not found');
  const minNoticeHours = Number(setting.min_notice_hours || 0);
  const minDateValue = setting.allow_same_day ? 0 : Math.max(1, minNoticeHours);
  return wcBookingsFetch(`products/${p.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      min_date_value: minDateValue,
      min_date_unit: 'hour',
      max_date_value: Number(setting.booking_window_days || 60),
      max_date_unit: 'day',
      requires_confirmation: Boolean(setting.requires_confirmation),
      buffer_period: Number(setting.buffer_period || 0),
      default_date_availability: setting.default_date_availability || 'available',
    }),
  });
}

export async function getProviderBookingSlots(pid: string, minDate: string, maxDate: string) {
  const p = await getProviderProduct(pid);
  if (!p) return { records: [], count: 0 };
  const availability = await getProviderAvailability(pid);
  const bookings = await getProviderBookedTimeRanges(pid);
  const startDate = new Date(`${minDate}T12:00:00`);
  const endDate = new Date(`${maxDate}T12:00:00`);
  const records: Array<{ date: string; duration: number; available: number; booked: number; product_id: number }> = [];

  for (const cursor = new Date(startDate); cursor <= endDate; cursor.setDate(cursor.getDate() + 1)) {
    const date = cursor.toISOString().split('T')[0];
    const specificSlots = availability.filter((slot) => slot.specific_date === date);
    const hasSpecificRules = specificSlots.length > 0;
    const candidateSlots = hasSpecificRules
      ? specificSlots.filter((slot) => slot.is_available && slot.start_time && slot.end_time)
      : availability.filter((slot) => slot.day_of_week === cursor.getDay() && slot.is_available && slot.start_time && slot.end_time);

    for (const slot of candidateSlots) {
      if (!slot.start_time || !slot.end_time) continue;
      for (let minutes = toTimeMinutes(slot.start_time); minutes < toTimeMinutes(slot.end_time); minutes += 60) {
        const time = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
        const slotEnd = addHoursToTime(time, 1);
        if (toTimeMinutes(slotEnd) > toTimeMinutes(slot.end_time)) continue;
        const overlappingBooking = bookings.find((booking) => booking.appointmentDate === date && rangesOverlap(time, slotEnd, booking.appointmentTime, addHoursToTime(booking.appointmentTime, booking.durationHours)));
        records.push({
          date: `${date}T${time}`,
          duration: 1,
          available: overlappingBooking ? 0 : 1,
          booked: overlappingBooking ? 1 : 0,
          product_id: Number(p.id),
        });
      }
    }
  }

  return { records, count: records.length };
}

// Get bookings/orders for the current vendor (via Dokan)
export async function getDokanVendorOrders(perPage = 50) {
  try {
    return await dokanFetch(`orders?per_page=${perPage}`);
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    return [];
  }
}

// Get vendor withdrawal history (payouts) from Dokan
export async function getDokanVendorWithdrawals() {
  try {
    const data = await dokanFetch('withdraw');
    if (!Array.isArray(data)) return [];
    return data.map((w: any) => ({
      id: w.id,
      amount: w.amount || 0,
      status: w.status || 'pending',
      method: w.method || '',
      note: w.note || '',
      created_at: w.date || w.created || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching vendor withdrawals:', error);
    return [];
  }
}
