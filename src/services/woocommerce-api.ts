// WooCommerce REST API Service Layer
// Headless integration for Care Connector marketplace
// Auth: uses Vite dev-proxy + Supabase edge proxy + JWT Bearer token

import { getWPToken } from './wp-auth';
import { buildWPUrl, buildWPHeaders, IS_DEV } from '@/lib/wp-url';
import { getActiveServer } from '@/lib/wp-servers';

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
 * Products are BOOKING (bookable) type via WC Bookings.
 * Per-service-type pricing uses WC Bookings cost rules / resources.
 * Availability is managed natively by WC Bookings on the product.
 */

export interface ServiceRateEntry {
  serviceType: string; // term name e.g. "Elder Care"
  hourlyRate: number;
}

/**
 * Resource costs for delivery mode (Mapping 1: Local vs Virtual).
 * WC Bookings allows multiple resources per product but customer picks ONE.
 * Both costs are per-block (per hour, given duration_unit='hour').
 */
export interface DeliveryResourceCosts {
  localCost?: number;   // surcharge per hour for in-person care
  virtualCost?: number; // surcharge per hour for remote/video care
}

// ─── Admin Basic Auth for Dokan admin operations ───────────
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
  const server = getActiveServer();
  const useEdgeFunction = !IS_DEV || !server.isPrimary;
  if (useEdgeFunction) {
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (anonKey) headers['apikey'] = anonKey;
  }
  return headers;
}

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

  try {
    const stores = await dokanAdminFetch(`stores?include=${wpUserId}`);
    if (Array.isArray(stores) && stores.length > 0) {
      const store = stores[0];
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
  } catch { /* no store found */ }

  try {
    await wpAdminFetch(`wp/v2/users/${wpUserId}`, {
      method: 'POST',
      body: JSON.stringify({ roles: ['seller'] }),
    });
  } catch (e) {
    console.warn('ensureDokanVendor: role assignment error', e);
  }

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

/**
 * Get or create provider's bookable service product.
 * Creates a WC Bookings "booking" type product with:
 * - 1-hour blocks, min 1 / max 8 hours
 * - Base cost from default hourly rate
 * - Per-service-type pricing via WC Bookings cost rules
 * - Default availability: weekdays 9am-6pm
 */
export async function getOrCreateProviderProduct(
  providerId: string,
  providerData: {
    fullName: string;
    hourlyRate: number;
    bio?: string;
    specialties?: string[];
    certifications?: string[];
    yearsOfExperience?: number;
    location?: string;
    serviceRates?: ServiceRateEntry[];
    deliveryCosts?: DeliveryResourceCosts;
  }
) {
  try {
    const parentCat = await ensureCategoryBySlug(CARE_SERVICES_CATEGORY, 'Care Services');
    const categoryIds = [parentCat.id];
    const sku = `care-provider-${providerId}`;

    // Check if product already exists. Try (1) the canonical SKU we generate,
    // then (2) any product with `_provider_id` meta matching this provider —
    // legacy products were created with different prefixes (e.g. `wp-1`)
    // and Dokan sometimes mutates the SKU. Without (2), every save would
    // duplicate the bookable_person stubs.
    let existingProduct: any = null;
    try {
      const existingProducts = await wcFetch(`products?sku=${sku}`);
      if (existingProducts && existingProducts.length > 0) {
        existingProduct = existingProducts[0];
      }
    } catch { /* no existing product */ }
    if (!existingProduct) {
      try {
        const all = await wcFetch(`products?per_page=100&status=any`);
        if (Array.isArray(all)) {
          existingProduct = all.find((p: any) => {
            const m = Array.isArray(p?.meta_data)
              ? p.meta_data.find((x: any) => x?.key === '_provider_id')?.value
              : null;
            return String(m || '') === String(providerId);
          }) || null;
        }
      } catch { /* ignore */ }
    }

    const serviceRates = providerData.serviceRates || [];
    const serviceTypeNames = serviceRates.length > 0
      ? serviceRates.map(r => r.serviceType)
      : (providerData.specialties || []);

    // Build a {serviceType: rate} JSON map so the booking dialog can look up the right rate
    const serviceRatesMap: Record<string, number> = {};
    serviceRates.forEach(r => {
      serviceRatesMap[r.serviceType] = r.hourlyRate;
    });

    // Build product payload — create as 'simple' via Dokan (Dokan doesn't support 'booking' type)
    // Will be converted to 'booking' via WC API after creation
    const productData: any = {
      name: `${providerData.fullName} – Care Service`,
      type: 'simple',
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
        { key: '_service_types', value: JSON.stringify(serviceTypeNames) },
        { key: '_service_rates', value: JSON.stringify(serviceRatesMap) },
        { key: '_delivery_local_cost', value: String(providerData.deliveryCosts?.localCost ?? 0) },
        { key: '_delivery_virtual_cost', value: String(providerData.deliveryCosts?.virtualCost ?? 0) },
      ],
      virtual: true,
      downloadable: false,
      manage_stock: false,
      stock_status: 'instock' as const,
      status: 'publish',
      regular_price: providerData.hourlyRate.toString(),
    };

    // If service types are offered, store them as a visible attribute for display
    if (serviceTypeNames.length > 0) {
      productData.attributes = [{
        name: 'Service Type',
        slug: 'pa_service-type',
        visible: true,
        variation: false,
        options: serviceTypeNames,
      }];
    }

    let product;
    if (existingProduct) {
      product = await dokanFetch(`products/${existingProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
    } else {
      product = await dokanFetch('products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    }

    // Step 2: Convert product type from 'simple' to 'booking' via WC API
    // (Dokan doesn't support booking type natively). Also force-publish:
    // Dokan auto-drafts new vendor products awaiting admin approval, which
    // hides the listing from the catalog and breaks the storefront preview.
    if (product?.id) {
      try {
        await wcFetch(`products/${product.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            type: 'booking',
            status: 'publish',
            regular_price: String(providerData.hourlyRate || 0),
          }),
        });
      } catch (e) {
        console.warn('Failed to convert/publish product:', e);
      }

      // Step 3: Configure WC Bookings core fields, Person Types, and Resources
      await configureBookingProduct(product.id, providerData.hourlyRate, serviceRates, providerData.deliveryCosts);
    }

    return product;
  } catch (error) {
    console.error('Error managing provider product:', error);
    throw error;
  }
}

/**
 * Configure WC Bookings specific settings on a product.
 * Sets duration, pricing, and default availability.
 *
 * IMPORTANT: WC Bookings REST `/wc-bookings/v1/products/{id}` requires PUT
 * (POST returns 200 but silently ignores most fields). Field names also differ
 * from raw post-meta keys (`cost` not `_wc_booking_cost`, etc.).
 * Use numeric values for cost/duration; pricing rules accept strings.
 */
async function configureBookingProduct(
  productId: number,
  defaultHourlyRate: number,
  serviceRates: ServiceRateEntry[] = [],
  deliveryCosts: DeliveryResourceCosts = {},
) {
  try {
    // Effective base — fall back to first service rate if default is 0
    const baseCost = defaultHourlyRate > 0
      ? defaultHourlyRate
      : (serviceRates[0]?.hourlyRate || 0);

    // Persons are enabled when there is more than one priced service.
    // Resources are enabled whenever a delivery surcharge is configured.
    const hasPersons = serviceRates.length > 0;
    const hasResources = (deliveryCosts.localCost ?? 0) >= 0 || (deliveryCosts.virtualCost ?? 0) >= 0;

    // 1. Upsert resources and link them via the `product_id` REST field
    //    (added by the CareConnect Bookable REST v3 snippet — maps to
    //    post_parent). We no longer rely on `resource_ids` in the booking
    //    config PUT because the WC Bookings REST controller silently drops
    //    that field unless every related child post is already a child of
    //    the product (chicken-and-egg). The `product_id` field on each
    //    resource is what WC Bookings actually reads at runtime via
    //    get_children( post_parent=product_id ).
    let resourceIds: number[] = [];
    if (hasResources) {
      try {
        resourceIds = await syncBookingResources(productId, deliveryCosts);
      } catch (e) {
        console.warn('Failed to sync booking resources:', e);
      }
    }

    const bookingConfig: Record<string, any> = {
      duration_type: 'customer',
      duration_unit: 'hour',
      duration: 1,
      min_duration: 1,
      max_duration: 8,
      cost: baseCost,
      base_cost: baseCost,
      display_cost: `$${baseCost}`,
      calendar_display_mode: 'always_visible',
      requires_confirmation: false,
      can_be_cancelled: true,
      default_date_availability: 'available',
      check_start_block_only: true,
      qty: 1,
      max_bookings_per_block: 1,
      enable_range_picker: true,
      pricing: [],
      has_persons: hasPersons,
      has_resources: hasResources && resourceIds.length > 0,
      resources_assignment: 'customer',
    };

    // PUT — POST is silently ignored for most fields by WC Bookings REST
    await wcBookingsFetch(`products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(bookingConfig),
    });

    // 2. Sync Person Types AFTER the parent has has_persons=true. Stub
    //    placeholders auto-spawned by WC Bookings will be cleaned up inside
    //    syncBookingPersons.
    if (hasPersons) {
      try {
        await syncBookingPersons(productId, serviceRates);
      } catch (e) {
        console.warn('Failed to sync booking persons:', e);
      }
    }

    // 3. CRITICAL: Trigger WC product setter via custom endpoint. WC Bookings
    //    caches resource_ids on the WC_Product_Booking object — writing meta
    //    alone won't make the storefront <select> render. This calls
    //    $product->set_resource_ids()->save() server-side which is the only
    //    path that actually persists the resource picker.
    if (hasResources || hasPersons) {
      try {
        await syncBookingProductResources(productId);
      } catch (e) {
        console.warn('Failed to trigger WC resource setter:', e);
      }
    }

    // Mirror base cost to WC product price so it shows in catalog/cart
    try {
      await wcFetch(`products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ regular_price: String(baseCost) }),
      });
    } catch (e) {
      console.warn('Failed to mirror base cost to product price:', e);
    }
  } catch (error) {
    console.error('Error configuring booking product:', error);
    throw error;
  }
}

/**
 * Sync per-service Person Types (`bookable_person` CPT) for a product.
 * Each service becomes a Person Type with its own `block_cost` (per-hour rate)
 * and `cost` (per-booking flat). Customer can multi-select with quantities,
 * and WC Bookings calculates: Σ(person.block_cost × qty × blocks).
 *
 * Requires the CareConnect REST Bridge plugin (v1.2.0+) which exposes
 * `bookable_person` to wp/v2 with writable meta keys.
 *
 * Strategy: list existing persons for product → upsert by title match → trash extras.
 */
async function syncBookingPersons(productId: number, serviceRates: ServiceRateEntry[]) {
  // Fetch existing person posts attached to this product. We filter via the
  // custom `?product_id=` query param (added by snippet v3) because the CPT
  // is non-hierarchical so the standard `?parent=` arg is ignored.
  let existingPersons: any[] = [];
  try {
    const url = buildWPUrl(`wp/v2/bookable_person?product_id=${productId}&per_page=100&status=publish,draft`);
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) existingPersons = await res.json();
  } catch { /* ignore */ }

  const existingByTitle: Record<string, any> = {};
  existingPersons.forEach((p: any) => {
    const title = (p?.title?.rendered || p?.title?.raw || p?.title || '').toString().trim();
    if (title) existingByTitle[title] = p;
  });

  const desiredTitles = new Set<string>();
  for (const rate of serviceRates) {
    const title = rate.serviceType;
    desiredTitles.add(title);
    const blockCost = Number(rate.hourlyRate) || 0;
    const body = {
      title,
      status: 'publish',
      // `product_id` is our custom REST field that writes post_parent.
      // The standard `parent` arg is silently dropped on non-hierarchical
      // CPTs, which is why all previous saves left orphans (parent=0).
      product_id: productId,
      meta: {
        cost: 0,
        block_cost: blockCost,
        min: 0,
        max: 10,
      },
    };
    const existing = existingByTitle[title];
    const url = existing
      ? buildWPUrl(`wp/v2/bookable_person/${existing.id}`)
      : buildWPUrl(`wp/v2/bookable_person`);
    let upsertedId = existing?.id;
    try {
      const res = await fetch(url, {
        method: existing ? 'PUT' : 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.id) upsertedId = data.id;
      }
    } catch (e) {
      console.warn(`Failed to upsert person "${title}":`, e);
    }
    if (upsertedId) {
      // Force-link via direct DB endpoint — wp/v2 strips post_parent on
      // non-hierarchical CPTs even when our product_id field is sent.
      await forceLinkBookingChild(upsertedId, productId);
    }
  }

  // Trash any person not in our desired set — including stub "Person Type #N"
  // entries auto-created by WC Bookings when has_persons=true is first set.
  const STUB_RE = /^\s*Person Type\s*#?\d*\s*$/i;
  for (const [title, person] of Object.entries(existingByTitle)) {
    const isStub = !title || STUB_RE.test(title);
    if (!desiredTitles.has(title) || isStub) {
      // If the stub *happens* to share a title we want, only delete the stub copy
      // (the real upsert above will have already created/updated the named one).
      if (desiredTitles.has(title) && !isStub) continue;
      try {
        await fetch(buildWPUrl(`wp/v2/bookable_person/${person.id}?force=true`), {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
      } catch { /* ignore */ }
    }
  }
}

/**
 * Sync delivery-mode Resources (Local / Virtual) for a product and return
 * the resource IDs the caller must include in the booking-config PUT.
 *
 * IMPORTANT: WC Bookings REST drops `resource_ids` when sent in a PUT that
 * doesn't also carry the full booking config. The link MUST happen in the
 * same PUT as `has_resources` — so this function only upserts and returns
 * IDs; the caller (`configureBookingProduct`) does the linking.
 */
async function syncBookingResources(
  productId: number,
  deliveryCosts: DeliveryResourceCosts,
): Promise<number[]> {
  const desired: Array<{ name: string; cost: number; metaTag: string }> = [
    { name: 'Local (In-Person)', cost: deliveryCosts.localCost ?? 0, metaTag: 'local' },
    { name: 'Virtual (Remote)', cost: deliveryCosts.virtualCost ?? 0, metaTag: 'virtual' },
  ];

  let existingResources: any[] = [];
  try {
    const url = buildWPUrl(`wp/v2/bookable_resource?product_id=${productId}&per_page=50&status=publish,draft`);
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) existingResources = await res.json();
  } catch { /* ignore */ }

  const existingByTag: Record<string, any> = {};
  existingResources.forEach((r: any) => {
    const title = (r?.title?.rendered || r?.title?.raw || '').toString().toLowerCase();
    const tag = title.includes('virtual') ? 'virtual' : 'local';
    existingByTag[tag] = r;
  });

  const linkedIds: number[] = [];
  for (const d of desired) {
    const existing = existingByTag[d.metaTag];
    const body = {
      title: d.name,
      status: 'publish',
      product_id: productId,
      meta: {
        _wc_booking_base_cost: d.cost,
        _wc_booking_block_cost: d.cost,
        _wc_booking_qty: 1,
      },
    };
    let upsertedId = existing?.id;
    try {
      const url = existing
        ? buildWPUrl(`wp/v2/bookable_resource/${existing.id}`)
        : buildWPUrl(`wp/v2/bookable_resource`);
      const res = await fetch(url, {
        method: existing ? 'PUT' : 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.id) upsertedId = data.id;
      }
    } catch (e) {
      console.warn(`Failed to upsert resource "${d.name}":`, e);
    }
    if (upsertedId) {
      // Belt-and-suspenders: force post_parent via custom endpoint in case
      // the wp/v2 product_id REST field didn't persist (snippet v4).
      await forceLinkBookingChild(upsertedId, productId);
      linkedIds.push(upsertedId);
    }
  }

  return linkedIds;
}

/**
 * Force-link a bookable_person/resource to its parent product via the custom
 * /careconnect/v1/link-booking-child endpoint (snippet v4). This is the
 * ONLY reliable way to set post_parent on these non-hierarchical CPTs;
 * the standard wp/v2 PATCH silently strips the parent field, and even our
 * `product_id` REST field can fail when other plugins hijack the update flow.
 */
async function forceLinkBookingChild(childId: number, productId: number): Promise<void> {
  try {
    const url = buildWPUrl(`careconnect/v1/link-booking-child`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ child_id: childId, product_id: productId }),
    });
    if (!res.ok) {
      console.warn(`forceLinkBookingChild ${childId}->${productId} failed:`, res.status, await res.text());
    }
  } catch (e) {
    console.warn(`forceLinkBookingChild ${childId}->${productId} error:`, e);
  }
}

/**
 * Trigger server-side WC product setter for resource_ids. Snippet v6's
 * POST /careconnect/v1/booking-debug/{id} calls $product->set_resource_ids()
 * which is the only path that makes the storefront resource <select> render.
 */
async function syncBookingProductResources(productId: number): Promise<void> {
  try {
    const url = buildWPUrl(`careconnect/v1/booking-debug/${productId}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      console.warn(`syncBookingProductResources ${productId} failed:`, res.status, await res.text());
    }
  } catch (e) {
    console.warn(`syncBookingProductResources ${productId} error:`, e);
  }
}


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

/**
 * Extract per-service rate map and service-type list from a WC product's meta.
 * Returns { services: string[], rates: Record<service, hourly_rate> }.
 * Falls back gracefully if product is null or meta is missing.
 */
export function extractProviderServicesFromProduct(product: any, defaultRate = 0): {
  services: string[];
  rates: Record<string, number>;
} {
  const empty = { services: [] as string[], rates: {} as Record<string, number> };
  if (!product || !Array.isArray(product.meta_data)) return empty;
  const get = (k: string) => product.meta_data.find((m: any) => m?.key === k)?.value;
  let services: string[] = [];
  try { services = JSON.parse(get('_service_types') || '[]'); } catch { services = []; }
  let rates: Record<string, number> = {};
  try {
    const raw = JSON.parse(get('_service_rates') || '{}');
    Object.keys(raw).forEach(k => { rates[k] = Number(raw[k]) || defaultRate; });
  } catch { rates = {}; }
  // Backfill missing rates with default
  services.forEach(s => { if (rates[s] == null) rates[s] = defaultRate; });
  return { services, rates };
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
  let product = await getProviderProduct(providerId);
  if (!product) {
    product = await getOrCreateProviderProduct(providerId, { fullName: `Provider ${providerId}`, hourlyRate: 30 });
  }
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
  let p = await getProviderProduct(pid);
  if (!p) {
    p = await getOrCreateProviderProduct(pid, { fullName: `Provider ${pid}`, hourlyRate: 30 });
  }
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
