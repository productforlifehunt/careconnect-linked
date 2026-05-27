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
  serviceType: string; // term name e.g. "Elder Care" (legacy, kept for back-compat)
  hourlyRate: number;
}

/**
 * @deprecated Replaced by flat ServiceResource model. Kept only so older
 * callers compile while we migrate. Local/Virtual surcharges no longer exist —
 * each resource (e.g. "老人陪伴(当面)" / "老人陪伴(远程)") IS a complete
 * service package with its own per-hour rate.
 */
export interface DeliveryResourceCosts {
  localCost?: number;
  virtualCost?: number;
}

/**
 * NEW flat service resource model. Vendor maintains a list of service
 * packages, each tied to one `pa_service-type` term + one `pa_service-location`
 * term. Each entry becomes 1 bookable_resource on the product (block_cost =
 * full per-hour rate). The same selections are also written to product
 * attributes so the marketplace search can filter by category & location.
 *
 * Customer picks exactly one resource at checkout. Total = ratePerHour × hours.
 */
export interface ServiceResource {
  /** Display name (auto-derived "<service-type> · <location>" if blank). */
  name: string;
  /** pa_service-type term slug, e.g. "elder-care". REQUIRED for filtering. */
  serviceTypeSlug?: string;
  /** pa_service-location term slug: "in-person" | "remote" | "hybrid". */
  locationSlug?: string;
  ratePerHour: number;
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
    /** NEW: flat list of service packages — each becomes one bookable_resource. */
    serviceResources?: ServiceResource[];
    /**
     * Real Dokan store/vendor id (NOT the WP user id). Used as `_provider_id`
     * meta so the marketplace listing (which keys cards by `dokan/v1/stores.id`)
     * can join product → store. Falls back to `providerId` for back-compat.
     */
    dokanStoreId?: number | string | null;
    /** @deprecated use serviceResources */
    serviceRates?: ServiceRateEntry[];
    /** @deprecated use serviceResources */
    deliveryCosts?: DeliveryResourceCosts;
  }
) {
  try {
    const parentCat = await ensureCategoryBySlug(CARE_SERVICES_CATEGORY, 'Care Services');
    const categoryIds = [parentCat.id];
    const sku = `care-provider-${providerId}`;
    // Listing-join key: prefer the real Dokan store id (matches what
    // dokan/v1/stores returns and what marketplace cards use).
    const providerJoinId = String(providerData.dokanStoreId || providerId);

    // Check if product already exists.
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

    // Resolve flat serviceResources from new field (preferred) or legacy
    // serviceRates list (back-compat — treats each rate as a flat resource
    // with no delivery surcharge).
    const flatResources: ServiceResource[] = providerData.serviceResources?.length
      ? providerData.serviceResources
      : (providerData.serviceRates || []).map(r => ({
          name: r.serviceType,
          ratePerHour: r.hourlyRate,
        }));

    const serviceTypeNames = flatResources.map(r => r.name);

    // Persist a {name: rate} JSON map for catalog/profile display.
    const serviceRatesMap: Record<string, number> = {};
    flatResources.forEach(r => {
      serviceRatesMap[r.name] = r.ratePerHour;
    });

    // Aggregate the unique service-type and location slugs across all resources
    // so we can write them as product attributes for search filtering.
    const serviceTypeSlugs = Array.from(
      new Set(flatResources.map(r => r.serviceTypeSlug).filter(Boolean) as string[]),
    );
    const locationSlugs = Array.from(
      new Set(flatResources.map(r => r.locationSlug).filter(Boolean) as string[]),
    );

    // Base product price = 0. The full hourly rate lives on each resource's
    // block_cost so the cart math stays clean (resource.cost × hours).
    const baseProductPrice = '0';

    const minBlockCost = flatResources.reduce(
      (min, r) => (r.ratePerHour > 0 && (min === 0 || r.ratePerHour < min) ? r.ratePerHour : min),
      0,
    );

    const productData: any = {
      name: `${providerData.fullName} – Care Service`,
      type: 'simple',
      description: providerData.bio || '',
      short_description: `Professional care service by ${providerData.fullName}`,
      sku,
      categories: categoryIds.map(id => ({ id })),
      meta_data: [
        { key: '_provider_id', value: providerJoinId },
        { key: '_provider_user_id', value: providerId },
        { key: '_hourly_rate', value: providerData.hourlyRate.toString() },
        { key: '_specialties', value: JSON.stringify(providerData.specialties || []) },
        { key: '_certifications', value: JSON.stringify(providerData.certifications || []) },
        { key: '_years_of_experience', value: (providerData.yearsOfExperience || 0).toString() },
        { key: '_location', value: providerData.location || '' },
        { key: '_service_types', value: JSON.stringify(serviceTypeNames) },
        { key: '_service_rates', value: JSON.stringify(serviceRatesMap) },
        // Structured backup so Provider Settings can hydrate the 3-field rows
        // (service-type slug, location slug, rate) without lossy name parsing.
        { key: '_service_packages', value: JSON.stringify(flatResources.map(r => ({
          serviceTypeSlug: r.serviceTypeSlug || '',
          locationSlug: r.locationSlug || 'in-person',
          ratePerHour: r.ratePerHour,
          name: r.name,
        }))) },
        // Search-cache: minimum block_cost across resources for "from $X" labels.
        { key: '_min_block_cost', value: String(minBlockCost) },
      ],
      virtual: true,
      downloadable: false,
      manage_stock: false,
      stock_status: 'instock' as const,
      status: 'publish',
      regular_price: baseProductPrice,
    };

    const attributes: any[] = [];
    if (serviceTypeSlugs.length > 0) {
      attributes.push({
        id: 3, // pa_service-type — primary category for marketplace search
        visible: true,
        variation: false,
        options: serviceTypeSlugs,
      });
    }
    if (locationSlugs.length > 0) {
      attributes.push({
        id: 4, // pa_service-location — in-person / remote / hybrid
        visible: true,
        variation: false,
        options: locationSlugs,
      });
    }
    if (attributes.length > 0) {
      productData.attributes = attributes;
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

    if (product?.id) {
      // Vendor (Dokan) API silently drops `categories` on POST/PUT — force it
      // via the admin WC API so the listing's category filter ("care-services")
      // actually finds this product.
      try {
        await wcFetch(`products/${product.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            type: 'booking',
            status: 'publish',
            regular_price: baseProductPrice,
            categories: categoryIds.map(id => ({ id })),
          }),
        });
      } catch (e) {
        console.warn('Failed to convert/publish/categorize product:', e);
      }

      // Bookings & availability are handled by our Calendar CCT (users_calendar_even),
      // not WooCommerce Bookings. Packages live in `_service_packages` product meta only.
      // await configureBookingProduct(product.id, providerData.hourlyRate, flatResources);
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
  serviceResources: ServiceResource[] = [],
) {
  try {
    // Base product price stays at 0 — the full hourly rate lives on each
    // resource's block_cost. Cart math: resource.blockCost × hours.
    const baseCost = 0;

    const hasResources = serviceResources.length > 0;

    // 1. Upsert one bookable_resource per service package.
    let resourceIds: number[] = [];
    if (hasResources) {
      try {
        resourceIds = await syncBookingResources(productId, serviceResources);
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
      has_persons: false, // Persons no longer used — flat resource model
      has_resources: hasResources && resourceIds.length > 0,
      resources_assignment: 'customer',
    };

    await wcBookingsFetch(`products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(bookingConfig),
    });

    // 2. Cleanup: remove any legacy bookable_person stubs left over from the
    //    previous person-types model so the storefront only shows the resource picker.
    try {
      await purgeBookingPersons(productId);
    } catch (e) {
      console.warn('Failed to purge legacy persons:', e);
    }

    // 3. Trigger WC product setter so resource_ids cache on the booking product.
    if (hasResources) {
      try {
        await syncBookingProductResources(productId);
      } catch (e) {
        console.warn('Failed to trigger WC resource setter:', e);
      }
    }

    // Mirror base cost (0) to the WC product price.
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

/** Trash all bookable_person posts attached to a product (legacy cleanup). */
async function purgeBookingPersons(productId: number) {
  try {
    const url = buildWPUrl(`wp/v2/bookable_person?product_id=${productId}&per_page=100&status=publish,draft`);
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) return;
    const persons = await res.json();
    for (const p of persons || []) {
      try {
        await fetch(buildWPUrl(`wp/v2/bookable_person/${p.id}?force=true`), {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
}

/**
 * Sync flat service-package Resources for a product. Each entry in
 * `serviceResources` becomes one bookable_resource whose block_cost IS the
 * full per-hour rate (no separate base + surcharge math). Customer picks
 * exactly ONE at booking time. Total = resource.blockCost × hours.
 *
 * Strategy: list existing resources for product → upsert by name match → trash extras.
 * Returns the resource IDs the caller must include in the booking-config PUT.
 */
async function syncBookingResources(
  productId: number,
  serviceResources: ServiceResource[],
): Promise<number[]> {
  let existingResources: any[] = [];
  try {
    const url = buildWPUrl(`wp/v2/bookable_resource?product_id=${productId}&per_page=100&status=publish,draft`);
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) existingResources = await res.json();
  } catch { /* ignore */ }

  const existingByName: Record<string, any> = {};
  existingResources.forEach((r: any) => {
    const title = (r?.title?.rendered || r?.title?.raw || '').toString().trim();
    if (title) existingByName[title] = r;
  });

  const desiredNames = new Set<string>();
  const linkedIds: number[] = [];

  for (const sr of serviceResources) {
    const name = sr.name.trim();
    if (!name) continue;
    desiredNames.add(name);
    const cost = Number(sr.ratePerHour) || 0;
    const body = {
      title: name,
      status: 'publish',
      product_id: productId,
      meta: {
        _wc_booking_base_cost: cost,
        _wc_booking_block_cost: cost,
        _wc_booking_qty: 1,
      },
    };
    const existing = existingByName[name];
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
      console.warn(`Failed to upsert resource "${name}":`, e);
    }
    if (upsertedId) {
      await forceLinkBookingChild(upsertedId, productId);
      linkedIds.push(upsertedId);
    }
  }

  // Trash any resource not in our desired set (legacy "Local (In-Person)" /
  // "Virtual (Remote)" stubs from the old delivery-cost model).
  for (const [name, r] of Object.entries(existingByName)) {
    if (desiredNames.has(name)) continue;
    try {
      await fetch(buildWPUrl(`wp/v2/bookable_resource/${r.id}?force=true`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch { /* ignore */ }
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


function matchesProviderProduct(product: any, providerId: string) {
  const meta: any[] = Array.isArray(product?.meta_data) ? product.meta_data : [];
  const providerJoinId = meta.find((item: any) => item?.key === '_provider_id')?.value;
  const providerUserId = meta.find((item: any) => item?.key === '_provider_user_id')?.value;
  const storeId = product?.store?.id;
  const authorId = product?.author ?? product?.post_author;
  return [providerJoinId, providerUserId, storeId, authorId].some(
    (value) => value != null && String(value) === String(providerId),
  );
}

export async function getProviderProducts(providerId: string) {
  try {
    // NOTE: WC REST `type` enum only accepts simple|grouped|external|variable.
    // Custom `booking` type is rejected (400). Fetch all and filter client-side.
    const products = await wpAdminFetch(`wc/v3/products?per_page=100&status=publish`);
    if (!Array.isArray(products)) return [];

    return products
      .filter((product: any) => matchesProviderProduct(product, providerId))
      .sort((a: any, b: any) => Number(b?.id || 0) - Number(a?.id || 0));
  } catch {
    return [];
  }
}

export async function getProviderProduct(providerId: string) {
  const matchesProvider = (product: any) => {
    const meta: any[] = Array.isArray(product?.meta_data) ? product.meta_data : [];
    const providerJoinId = meta.find((item: any) => item?.key === '_provider_id')?.value;
    const providerUserId = meta.find((item: any) => item?.key === '_provider_user_id')?.value;
    const storeId = product?.store?.id;
    const authorId = product?.author ?? product?.post_author;
    return [providerJoinId, providerUserId, storeId, authorId].some(
      (value) => value != null && String(value) === String(providerId),
    );
  };

  try {
    const sku = `care-provider-${providerId}`;

    try {
      const products = await wcFetch(`products?sku=${sku}`);
      if (products && products.length > 0) return products[0];
    } catch {
      /* visitors may not have Woo read capability */
    }

    try {
      const oldProducts = await wcFetch(`products?sku=provider-${providerId}`);
      if (oldProducts && oldProducts.length > 0) return oldProducts[0];
    } catch {
      /* visitors may not have Woo read capability */
    }

    try {
      const allProducts = await wpAdminFetch(`wc/v3/products?per_page=100&status=any`);
      if (Array.isArray(allProducts)) {
        const matchedProduct = allProducts.find(matchesProvider);
        if (matchedProduct) return matchedProduct;
      }
    } catch {
      /* fall through */
    }

    try {
      const providerProducts = await wcBookingsFetch('products');
      const matchedBookingProduct = (providerProducts || []).find(matchesProvider);
      if (matchedBookingProduct) return matchedBookingProduct;
    } catch {
      /* fall through */
    }

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

/**
 * Fetch the bookable_resource list for a product (Local / Virtual delivery
 * options) along with their per-block costs. Returns [] if the product has
 * no resources or the endpoint is unreachable.
 */
export interface BookingResourceOption {
  id: number;
  productId?: number;
  name: string;
  blockCost: number;
  baseCost: number;
}

function extractBookingResourcesFromProductMeta(product: any): BookingResourceOption[] {
  const meta: any[] = Array.isArray(product?.meta_data) ? product.meta_data : [];
  const raw = meta.find((item: any) => item?.key === '_service_packages')?.value;
  if (!raw) return [];

  try {
    const packages = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(packages)) return [];
    return packages
      .map((pkg: any, index: number) => ({
        id: Number(pkg?.id) || -(index + 1),
        name: String(pkg?.name || '').trim(),
        blockCost: Number(pkg?.ratePerHour ?? 0),
        baseCost: Number(pkg?.ratePerHour ?? 0),
      }))
      .filter((pkg: BookingResourceOption) => Boolean(pkg.name) && pkg.blockCost > 0);
  } catch {
    return [];
  }
}

export async function fetchProductBookingResources(productId: number): Promise<BookingResourceOption[]> {
  // Service packages are stored on the product's `_service_packages` meta — we
  // no longer query WooCommerce Bookings' `bookable_resource` endpoint.
  try {
    const product = await wpAdminFetch(`wc/v3/products/${productId}`);
    return extractBookingResourcesFromProductMeta(product);
  } catch (e) {
    console.warn('fetchProductBookingResources failed:', e);
    return [];
  }
}

export async function fetchProviderBookingOptions(providerId: string): Promise<BookingResourceOption[]> {
  try {
    const products = await getProviderProducts(providerId);
    if (!products.length) return [];

    const resourceGroups = await Promise.all(
      products.map(async (product: any) => {
        const productId = Number(product?.id);
        if (!productId) return [] as BookingResourceOption[];

        const resources = await fetchProductBookingResources(productId);
        if (resources.length > 0) {
          return resources.map((resource) => ({ ...resource, productId }));
        }

        const meta: any[] = Array.isArray(product?.meta_data) ? product.meta_data : [];
        const minBlockCost = Number(
          meta.find((item: any) => item?.key === '_min_block_cost')?.value ??
            product?.price ??
            product?.regular_price ??
            0,
        );
        const name = String(product?.name || '').trim();
        if (!name || minBlockCost <= 0) return [] as BookingResourceOption[];

        return [
          {
            id: productId,
            productId,
            name,
            blockCost: minBlockCost,
            baseCost: minBlockCost,
          },
        ];
      }),
    );

    const deduped = new Map<string, BookingResourceOption>();
    resourceGroups.flat().forEach((resource) => {
      const key = `${resource.productId ?? 0}:${resource.id}`;
      if (!deduped.has(key)) deduped.set(key, resource);
    });

    return Array.from(deduped.values()).sort((a, b) => a.blockCost - b.blockCost || a.name.localeCompare(b.name));
  } catch (e) {
    console.warn('fetchProviderBookingOptions failed:', e);
    return [];
  }
}

/**
 * Bulk-load every care-provider booking product so the marketplace listing can
 * enrich each Dokan store card with min price + offered service-type/location
 * slugs in a single round-trip (instead of N requests).
 *
 * Returns a Map keyed by provider_id (the Dokan store id stored in `_provider_id`
 * meta). Empty map on failure — callers should fall back gracefully.
 */
export interface ProviderProductSummary {
  productId: number;
  minBlockCost: number;
  serviceTypeSlugs: string[];
  serviceLocationSlugs: string[];
}

export async function fetchAllProviderProductSummaries(): Promise<Map<string, ProviderProductSummary>> {
  const map = new Map<string, ProviderProductSummary>();
  try {
    // Use admin Basic Auth via wpAdminFetch so unauthenticated visitors and
    // non-admin logged-in customers can still hydrate the marketplace listing
    // (WC `/products` listing requires `read` cap → JWT alone returns 401).
    // NOTE: WC REST `type` enum only accepts simple|grouped|external|variable.
    // Custom `booking` type is rejected (400). Fetch all and filter client-side via `_provider_id`.
    const products = await wpAdminFetch(
      `wc/v3/products?per_page=100&status=publish`,
    );
    if (!Array.isArray(products)) return map;

    const toSlug = (s: string) => String(s).trim().toLowerCase().replace(/\s+/g, '-');
    const candidates: Array<{ p: any; providerId: string }> = [];
    for (const p of products) {
      const meta: any[] = Array.isArray(p?.meta_data) ? p.meta_data : [];
      const providerId = meta.find((m) => m?.key === '_provider_id')?.value;
      if (!providerId) continue;
      candidates.push({ p, providerId: String(providerId) });
    }

    // For products missing `_min_block_cost`, fall back to fetching the actual
    // bookable_resources so the marketplace card shows the right "from $X/hr"
    // even when the meta wasn't refreshed by an older save.
    await Promise.all(
      candidates.map(async ({ p, providerId }) => {
        const meta: any[] = Array.isArray(p?.meta_data) ? p.meta_data : [];
        const minRaw = meta.find((m) => m?.key === '_min_block_cost')?.value;
        let minBlockCost = Number(minRaw) || 0;

        if (minBlockCost === 0) {
          try {
            const resources = await fetchProductBookingResources(Number(p.id));
            const costs = resources.map((r) => r.blockCost).filter((c) => c > 0);
            if (costs.length > 0) minBlockCost = Math.min(...costs);
          } catch { /* ignore */ }
        }

        const attrs: any[] = Array.isArray(p?.attributes) ? p.attributes : [];
        const findAttr = (slug: string) =>
          attrs.find(
            (a) => a?.slug === slug || a?.slug === `pa_${slug}` || a?.name?.toLowerCase().includes(slug),
          );
        const stOptions: string[] = (findAttr('service-type')?.options as string[]) || [];
        const slOptions: string[] = (findAttr('service-location')?.options as string[]) || [];

        // Aggregate across ALL products of this provider — a single provider
        // typically offers multiple packages (e.g. Companionship Remote $25 +
        // Dementia In-Person $65). Take the MIN price and the UNION of
        // service-type / service-location slugs so the marketplace card and
        // filters reflect the full catalogue, not just the last-seen product.
        const existing = map.get(providerId);
        const stSlugs = stOptions.map(toSlug).filter(Boolean);
        const slSlugs = slOptions.map(toSlug).filter(Boolean);
        if (!existing) {
          map.set(providerId, {
            productId: Number(p.id),
            minBlockCost,
            serviceTypeSlugs: stSlugs,
            serviceLocationSlugs: slSlugs,
          });
        } else {
          const mergedMin =
            existing.minBlockCost > 0 && minBlockCost > 0
              ? Math.min(existing.minBlockCost, minBlockCost)
              : existing.minBlockCost || minBlockCost;
          map.set(providerId, {
            productId: existing.productId,
            minBlockCost: mergedMin,
            serviceTypeSlugs: Array.from(new Set([...existing.serviceTypeSlugs, ...stSlugs])),
            serviceLocationSlugs: Array.from(
              new Set([...existing.serviceLocationSlugs, ...slSlugs]),
            ),
          });
        }
      }),
    );
  } catch (e) {
    console.warn('fetchAllProviderProductSummaries failed:', e);
  }
  return map;
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
    productId?: number;
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
    const product = bookingData.productId
      ? await wpAdminFetch(`wc/v3/products/${bookingData.productId}`)
      : await getProviderProduct(providerId);
    
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

    await createBookingCalendarEvent({
      providerId,
      clientId: bookingData.clientId,
      appointmentDate: bookingData.appointmentDate,
      appointmentTime: bookingData.appointmentTime,
      durationHours: bookingData.durationHours,
      serviceType: bookingData.serviceType,
      orderId: order?.id,
      note: bookingData.specialInstructions,
    }).catch((error) => console.warn('Order created but calendar booking event failed:', error));

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
  return getProviderCalendarAvailability(providerId);
}

export async function upsertProviderAvailability(providerId: string, slots: any[]) {
  return upsertProviderCalendarAvailability(providerId, slots);
}

// ─── Server-side Cart (careconnect/v1/cart) + Elevated Checkout ─────────────
// Cart lives in WP user_meta via the careconnect-cart Code Snippet, so it
// persists across devices/sessions per logged-in buyer. Frontend just calls
// the REST endpoints — no localStorage involved.

export interface CartItem {
  key: string;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  provider_id?: string;
  /** WC Bookings line meta — when set, checkout() will pass these through to
   *  the order's line_items meta_data so WC Bookings auto-creates a booking. */
  booking?: {
    resourceId?: number;
    persons?: Record<string | number, number>; // { person_type_id: count }
    startDate?: string; // YYYY-MM-DD
    startTime?: string; // HH:MM
    durationHours?: number;
    serviceType?: string;
    notes?: string;
  };
}

async function ccCartFetch(path: string, init: RequestInit = {}) {
  const url = buildWPUrl(`careconnect/v1/${path}`);
  const res = await fetch(url, { ...init, headers: { ...getAuthHeaders(), ...init.headers } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cart API ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getCart() {
  return ccCartFetch('cart', { method: 'GET' });
}

export async function addToCart({
  productId,
  quantity = 1,
  booking,
  priceOverride,
}: {
  productId: number;
  quantity?: number;
  booking?: CartItem['booking'];
  /** For quote products: pass the agreed total so server doesn't multiply by hours. */
  priceOverride?: number;
}) {
  const body: Record<string, unknown> = { product_id: productId, quantity };
  if (booking) body.booking = booking;
  if (priceOverride != null) body.price_override = priceOverride;
  return ccCartFetch('cart/items', { method: 'POST', body: JSON.stringify(body) });
}

export async function removeCartItem(itemKey: string) {
  return ccCartFetch(`cart/items/${encodeURIComponent(itemKey)}`, { method: 'DELETE' });
}

export async function clearCart() {
  return ccCartFetch('cart', { method: 'DELETE' });
}

export async function checkout(billingData?: {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}) {
  // Server cart is auto-pulled by the careconnect-checkout snippet's
  // rest_pre_dispatch filter when line_items is omitted.
  const orderPayload: Record<string, unknown> = {
    payment_method: 'cod',
    payment_method_title: 'Cash on delivery',
    set_paid: true,
    status: 'processing',
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

  const checkoutUrl = buildWPUrl(`careconnect/v1/checkout`);
  const checkoutRes = await fetch(checkoutUrl, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderPayload),
  });
  if (!checkoutRes.ok) {
    const text = await checkoutRes.text();
    throw new Error(`Checkout failed ${checkoutRes.status}: ${text}`);
  }
  const order = await checkoutRes.json();

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
  return getProviderCalendarBookingConflictMessage(providerId, date, time, durationHours);
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
  let bookingProduct: any = null;
  try {
    bookingProduct = await wcBookingsFetch(`products/${p.id}`);
  } catch {
    bookingProduct = await wpAdminFetch(`wc-bookings/v1/products/${p.id}`);
  }
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
  } catch (error: any) {
    // Non-vendor users (or expired JWT) will fail signature verification — that's expected.
    if (!String(error?.message || '').includes('Signature verification')) {
      console.warn('getDokanVendorOrders skipped:', error?.message || error);
    }
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

// Vendor requests a manual withdrawal (admin then pays out via PayPal/bank/Alipay).
export async function createDokanWithdrawalRequest(opts: {
  amount: number;
  method: 'paypal' | 'bank' | 'alipay' | 'stripe';
  note?: string;
}) {
  return dokanFetch('withdraw', {
    method: 'POST',
    body: JSON.stringify({
      amount: opts.amount,
      method: opts.method,
      note: opts.note || '',
    }),
  });
}

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
    const me = await dokanFetch('stores/current') as any;
    return me?.id || null;
  } catch {
    try {
      const wpUser = getStoredWPUser();
      if (!wpUser?.user_id) return null;
      const stores = await dokanFetch(`stores?author=${wpUser.user_id}`) as any[];
      return Array.isArray(stores) && stores[0]?.id ? stores[0].id : null;
    } catch {
      return null;
    }
  }
}

