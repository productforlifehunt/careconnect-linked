/**
 * WordPress REST API Data Service
 * Fetches data from WordPress CPTs/JetEngine CCTs when user is authenticated via WP JWT.
 * This is the primary (and only) data layer for the application.
 */

import { getWPToken } from "./wp-auth";
import { buildWPUrl, buildWPHeaders } from "@/lib/wp-url";
import { T } from "@/integrations/wp-schema";

interface WPFetchOptions {
  method?: string;
  body?: any;
  params?: Record<string, string | number>;
}

async function wpFetch<T = any>(endpoint: string, options: WPFetchOptions = {}): Promise<T> {
  const token = getWPToken();
  const { method = "GET", body, params } = options;

  const url = buildWPUrl(endpoint, params);
  const headers = buildWPHeaders(token, "application/json");

  const resp = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!resp.ok) {
    throw new Error(`WP API ${endpoint}: ${resp.status} ${resp.statusText}`);
  }

  return resp.json();
}

// ─── Profile / Users ────────────────────────────────────────
export async function wpFetchCurrentUser() {
  return wpFetch("wp/v2/users/me", { params: { context: "edit" } });
}

// ─── WooCommerce Orders (as bookings proxy) ─────────────────
export async function wpFetchOrders(perPage = 20) {
  try {
    // Orders are read through the edge function, which pins the query to the
    // signed-in customer id — the browser never lists the whole store.
    const { getMyCustomerOrders } = await import("./woocommerce-api");
    return await getMyCustomerOrders(perPage);
  } catch {
    return [];
  }
}



// ─── WooCommerce Products (services) ────────────────────────
export async function wpFetchProducts(perPage = 50) {
  try {
    return await wpFetch("wc/v3/products", { params: { per_page: perPage, status: "publish" } });
  } catch {
    return [];
  }
}

// ─── WordPress Posts (articles/community) ───────────────────
export async function wpFetchPosts(perPage = 20, category?: number) {
  const params: Record<string, string | number> = { per_page: perPage, _embed: 1 };
  if (category) params.categories = category;
  try {
    const posts = await wpFetch("wp/v2/posts", { params });
    if (!Array.isArray(posts)) return [];
    return posts.map((p: any) => ({
      id: String(p.id),
      title: p.title?.rendered || "",
      content: p.content?.rendered || "",
      excerpt: p.excerpt?.rendered || "",
      slug: p.slug,
      author_name: p._embedded?.author?.[0]?.name || "Author",
      author_avatar: p._embedded?.author?.[0]?.avatar_urls?.["48"] || null,
      featured_image: p._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      created_at: p.date,
      updated_at: p.modified,
      comment_count: 0,
      vote_count: 0,
      categories: (p._embedded?.["wp:term"]?.[0] || []).map((t: any) => t.name),
    }));
  } catch {
    return [];
  }
}

// ─── WordPress Pages ────────────────────────────────────────
export async function wpFetchPages(perPage = 50) {
  return wpFetch("wp/v2/pages", { params: { per_page: perPage } });
}

// ─── WordPress Comments (as reviews or post comments) ───────
export async function wpFetchComments(postId?: number, perPage = 50) {
  try {
    const params: Record<string, string | number> = { per_page: perPage };
    if (postId) params.post = postId;
    const comments = await wpFetch("wp/v2/comments", { params });
    if (!Array.isArray(comments)) return [];
    return comments.map((c: any) => ({
      id: String(c.id),
      content: c.content?.rendered || "",
      author_name: c.author_name || "Anonymous",
      author_avatar: c.author_avatar_urls?.["48"] || null,
      created_at: c.date,
      rating: null,
    }));
  } catch {
    return [];
  }
}

// ─── Custom Post Types (if registered in WP) ───────────────
export async function wpFetchCPT(cptSlug: string, perPage = 50) {
  return wpFetch(`wp/v2/${cptSlug}`, { params: { per_page: perPage } });
}

// ─── Dashboard Stats (computed from WP data) ────────────────
export interface WPDashboardStats {
  upcomingBookings: number;
  careGroups: number;
  pendingTasks: number;
  unreadMessages: number;
}

export async function wpFetchDashboardStats(): Promise<WPDashboardStats> {
  let upcomingBookings = 0;
  try {
    const orders = await wpFetchOrders(100);
    upcomingBookings = Array.isArray(orders)
      ? orders.filter((o: any) => ["processing", "on-hold", "pending"].includes(o.status)).length
      : 0;
  } catch { /* */ }

  return {
    upcomingBookings,
    careGroups: 0,
    pendingTasks: 0,
    unreadMessages: 0,
  };
}

// ─── Bookings from WooCommerce Orders (with rich metadata) ──
export interface WPBooking {
  id: string;
  wc_order_id: number;
  status: string;
  appointment_date: string;
  appointment_time: string;
  duration_hour: string;
  service_type: string;
  hourly_rate: number;
  total_cost: number;
  special_instruction: string;
  provider_id: string;
  provider?: { full_name: string };
  client?: { full_name: string; email?: string };
  payment_status: string;
  created_at: string;
}

/** Store data comes back HTML-escaped (e.g. "&amp;"); show real characters. */
function decodeEntities(value: string): string {
  if (!value) return '';
  if (typeof document === 'undefined') return value;
  const el = document.createElement('textarea');
  el.innerHTML = value;
  return el.value;
}

function getOrderMeta(order: any, key: string): string {
  return order.meta_data?.find((m: any) => m.key === key)?.value || '';
}

function mapWcOrderToBooking(o: any, nativeBookingMap?: Map<number, any>): WPBooking {
  const wcStatus = o.status;
  let status = wcStatus;
  if (wcStatus === 'processing') status = 'confirmed';
  else if (wcStatus === 'on-hold') status = 'pending';
  else if (wcStatus === 'completed') status = 'completed';
  else if (wcStatus === 'cancelled') status = 'cancelled';

  // Prefer native WooCommerce Bookings (plugin) as source of truth for schedule.
  const nativeBooking = nativeBookingMap?.get(Number(o.id));
  let appointmentDate = '';
  let appointmentTime = '';
  let durationHour = '';
  if (nativeBooking?.start) {
    const d = new Date(nativeBooking.start * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    appointmentDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    appointmentTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    if (nativeBooking.end > nativeBooking.start) {
      durationHour = String(Math.round(((nativeBooking.end - nativeBooking.start) / 3600) * 100) / 100);
    }
  }
  // Fallback to legacy order meta for orders predating the WC Bookings plugin.
  if (!appointmentDate) appointmentDate = getOrderMeta(o, '_appointment_date');
  if (!appointmentTime) appointmentTime = getOrderMeta(o, '_appointment_time');
  if (!durationHour) durationHour = getOrderMeta(o, '_duration_hours') || String(o.line_items?.[0]?.quantity || '');

  const hourlyRate = parseFloat(getOrderMeta(o, '_hourly_rate') || '0');
  const serviceType = decodeEntities(getOrderMeta(o, '_service_type') || o.line_items?.[0]?.name || 'Care Service');
  const providerId = getOrderMeta(o, '_provider_id');
  const specialInstruction = getOrderMeta(o, '_special_instructions');
  const providerName = decodeEntities(o.line_items?.[0]?.name?.replace(/ – Care Service$/, '') || 'Provider');
  const billingFirst = o.billing?.first_name || '';
  const billingLast = o.billing?.last_name || '';
  const billingName = `${billingFirst} ${billingLast}`.trim() || o.billing?.email || 'Client';

  return {
    id: String(o.id),
    wc_order_id: o.id,
    status,
    appointment_date: appointmentDate || o.date_created?.split('T')[0] || '',
    appointment_time: appointmentTime,
    duration_hour: durationHour,
    service_type: serviceType,
    hourly_rate: hourlyRate,
    total_cost: parseFloat(o.total || '0'),
    special_instruction: specialInstruction,
    provider_id: providerId,
    provider: { full_name: providerName },
    client: { full_name: billingName, email: o.billing?.email || '' },
    payment_status: o.date_paid ? 'paid' : 'pending',
    // Refund state lives on the order meta so both sides see the same answer.
    refund_status: getOrderMeta(o, '_refund_status'),
    refund_reason: getOrderMeta(o, '_refund_reason'),
    refund_amount: getOrderMeta(o, '_refund_amount'),
    created_at: o.date_created,

  };
}

export async function wpFetchBookings(): Promise<WPBooking[]> {
  try {
    const orders = await wpFetchOrders(50);
    if (!Array.isArray(orders)) return [];
    return orders.map((o: any) => mapWcOrderToBooking(o));
  } catch {
    return [];
  }
}

// ─── Care Tasks ─────────────────────────────────────────────
export async function wpFetchCareTasks(): Promise<any[]> {
  try {
    // Care tasks live in JetEngine CCT `care_task_real`, not as a CPT
    const { wordpressCCTFetch } = await import("@/features/shared/wordpress-client");
    const tasks = await wordpressCCTFetch<any[]>(T.careTask.slug, { params: { _limit: 100 } });
    if (!Array.isArray(tasks)) return [];
    return tasks.map((t: any) => ({
      id: String(t._ID || t.id),
      title: t.a55 || "Task",
      status: String(t.a66 ?? "b55") === "b56" ? "completed" : "pending",
      priority: "medium",
      due_date: t.a61 || null,
      assignee_profile: null,
      created_at: t.cct_created || null,
    }));
  } catch {
    return [];
  }
}

// ─── Cared Ones ─────────────────────────────────────────────
export async function wpFetchCaredOnes(): Promise<any[]> {
  try {
    const items = await wpFetchCPT("cared_one");
    if (!Array.isArray(items)) return [];
    return items.map((c: any) => ({
      user_id: String(c.id),
      relationship: c.acf?.relationship || null,
      cared_one: {
        full_name: c.title?.rendered || "Cared One",
        first_name: c.title?.rendered?.split(" ")[0] || null,
        avatar_url: c.acf?.avatar_url || null,
        dementia_stage: c.acf?.dementia_stage || null,
      },
    }));
  } catch {
    return [];
  }
}

// ─── Providers (Dokan stores) ───────────────────────────────
export async function wpFetchProviders(): Promise<any[]> {
  try {
    const stores = await wpFetch("dokan/v1/stores", { params: { per_page: 50 } });
    if (!Array.isArray(stores)) return [];
    return stores.map((s: any) => ({
      id: String(s.id),
      user_id: `wp-${s.id}`,
      full_name: s.store_name || s.first_name || "Provider",
      email: s.email || null,
      avatar_url: s.gravatar || null,
      bio: s.description || null,
      location: s.address?.city || null,
      address: s.address ? `${s.address.street_1 || ""}, ${s.address.city || ""}, ${s.address.state || ""}`.replace(/^, |, $/g, "") : null,
      is_care_provider: true,
      provider_is_active: true,
      hourly_rate: null,
      specialty: [],
      rating: s.rating?.rating || null,
      rating_average: s.rating?.rating || null,
      rating_count: s.rating?.count || 0,
      review_count: s.rating?.count || 0,
      years_of_experience: null,
    }));
  } catch {
    return [];
  }
}

// ─── Care Groups ────────────────────────────────────────────
export async function wpFetchCareGroups(): Promise<any[]> {
  try {
    const { wordpressCCTFetch } = await import("@/features/shared/wordpress-client");
    const groups = await wordpressCCTFetch<any[]>(T.careGroup.slug, { params: { _limit: 50 } });
    if (!Array.isArray(groups)) return [];
    return groups.map((g: any) => ({
      id: String(g.id || g._ID),
      name: g.a55 || "Care Group",
      description: g.a56 || null,
      is_private: String(g.a57) === "b56",
      created_at: g.created_at,
      owner_id: null,
    }));
  } catch {
    return [];
  }
}

// ─── Care Group Members ─────────────────────────────────────
export async function wpFetchCareGroupMembers(_groupId: string): Promise<any[]> {
  return [];
}

// ─── Conversations (empty in WP mode — no real-time chat) ───
export async function wpFetchConversations(): Promise<any[]> {
  return [];
}

// ─── Notifications ──────────────────────────────────────────
export async function wpFetchNotifications(): Promise<any[]> {
  try {
    const { wordpressCCTFetch } = await import("@/features/shared/wordpress-client");
    const { T } = await import("@/integrations/wp-schema");
    const { appScopeParams, filterAppScope } = await import("@/features/shared/app-scope");
    const F = T.notification.f;
    const notifs = await wordpressCCTFetch<any[]>(T.notification.slug, {
      params: { _limit: 100, ...appScopeParams("notification") },
    });
    if (!Array.isArray(notifs)) return [];
    return filterAppScope("notification", notifs).map((n: any) => ({
      id: String(n.id || n._ID),
      type: n[F.NOTIFICATION_TYPE] || "info",
      title: n[F.NOTIFICATION_TITLE] || "Notification",
      content: n[F.NOTIFICATION_CONTENT] || "",
      link_url: n[F.ACTION_URL] || null,
      is_read: String(n[F.NOTIFICATION_IS_READ]) === T.notification.opt.NOTIFICATION_IS_READ.YES,
      created_at: n.created_at,
    }));
  } catch {
    return [];
  }
}

// ─── Reviews (WP comments as reviews) ───────────────────────
export async function wpFetchReviews(entityId?: string): Promise<any[]> {
  try {
    const postId = entityId ? parseInt(entityId.replace("wp-", ""), 10) : undefined;
    if (postId && isNaN(postId)) return [];
    return wpFetchComments(postId);
  } catch {
    return [];
  }
}

// ─── Provider Bookings (orders for the current vendor via Dokan) ────
export async function wpFetchProviderBookings(): Promise<WPBooking[]> {
  try {
    const { getDokanVendorOrders } = await import('./woocommerce-api');
    const orders = await getDokanVendorOrders();
    if (!Array.isArray(orders)) return [];
    return orders.map((o: any) => mapWcOrderToBooking(o));
  } catch {
    return [];
  }
}

// ─── Service Categories ─────────────────────────────────────
export async function wpFetchServiceCategories(): Promise<any[]> {
  try {
    const cats = await wpFetch("wp/v2/categories", { params: { per_page: 100 } });
    if (!Array.isArray(cats)) return [];
    return cats.map((c: any) => ({
      id: String(c.id),
      name: c.name,
      slug: c.slug,
      description: c.description || null,
      parent_id: c.parent ? String(c.parent) : null,
      count: c.count,
    }));
  } catch {
    return [];
  }
}

// ─── Care Facilities ────────────────────────────────────────
export async function wpFetchCareFacilities(): Promise<any[]> {
  try {
    const { wordpressCCTFetch } = await import("@/features/shared/wordpress-client");
    const facilities = await wordpressCCTFetch<any[]>(T.careFacility.slug, { params: { _limit: 100 } });
    if (!Array.isArray(facilities)) return [];
    return facilities.map((f: any) => ({
      id: String(f.id || f._ID),
      title: f.a55 || "Facility",
      name: f.a55 || "Facility",
      description: f.a56 || null,
      location: f.a63 || null,
      address: f.a64 || null,
      phone: f.acf?.phone || null,
      email: f.acf?.email || null,
      website: f.acf?.website || null,
      rating_average: f.acf?.rating || null,
      review_count: f.acf?.review_count || 0,
      type: f.a57 || null,
      created_at: f.created_at,
    }));
  } catch {
    return [];
  }
}

// ─── Saved Providers (empty in WP mode) ─────────────────────
export async function wpFetchSavedProviders(): Promise<any[]> {
  return [];
}

// ─── Location Shares (empty in WP mode) ─────────────────────
export async function wpFetchLocationShares(): Promise<any[]> {
  return [];
}
