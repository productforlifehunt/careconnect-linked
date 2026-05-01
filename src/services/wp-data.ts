/**
 * WordPress REST API Data Service
 * Fetches data from WordPress CPTs/JetEngine CCTs when user is authenticated via WP JWT.
 * This is the primary (and only) data layer for the application.
 */

import { getWPToken } from "./wp-auth";
import { buildWPUrl, buildWPHeaders } from "@/lib/wp-url";

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
    return await wpFetch("wc/v3/orders", { params: { per_page: perPage } });
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

function getOrderMeta(order: any, key: string): string {
  return order.meta_data?.find((m: any) => m.key === key)?.value || '';
}

function mapWcOrderToBooking(o: any): WPBooking {
  const wcStatus = o.status;
  let status = wcStatus;
  if (wcStatus === 'processing') status = 'confirmed';
  else if (wcStatus === 'on-hold') status = 'pending';
  else if (wcStatus === 'completed') status = 'completed';
  else if (wcStatus === 'cancelled') status = 'cancelled';

  const appointmentDate = getOrderMeta(o, '_appointment_date');
  const appointmentTime = getOrderMeta(o, '_appointment_time');
  const durationHour = getOrderMeta(o, '_duration_hours') || String(o.line_items?.[0]?.quantity || '');
  const hourlyRate = parseFloat(getOrderMeta(o, '_hourly_rate') || '0');
  const serviceType = getOrderMeta(o, '_service_type') || o.line_items?.[0]?.name || 'Care Service';
  const providerId = getOrderMeta(o, '_provider_id');
  const specialInstruction = getOrderMeta(o, '_special_instructions');
  const providerName = o.line_items?.[0]?.name?.replace(/ – Care Service$/, '') || 'Provider';
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
    created_at: o.date_created,
  };
}

export async function wpFetchBookings(): Promise<WPBooking[]> {
  try {
    const orders = await wpFetchOrders(50);
    if (!Array.isArray(orders)) return [];
    return orders.map(mapWcOrderToBooking);
  } catch {
    return [];
  }
}

// ─── Care Tasks ─────────────────────────────────────────────
export async function wpFetchCareTasks(): Promise<any[]> {
  try {
    const tasks = await wpFetchCPT("universal_care_task");
    if (!Array.isArray(tasks)) return [];
    return tasks.map((t: any) => ({
      id: String(t.id),
      title: t.title?.rendered || "Task",
      status: t.acf?.status || "pending",
      priority: t.acf?.priority || "medium",
      due_date: t.acf?.due_date || null,
      assignee_profile: null,
      created_at: t.date,
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
    const groups = await wpFetchCPT("care_group");
    if (!Array.isArray(groups)) return [];
    return groups.map((g: any) => ({
      id: String(g.id),
      name: g.title?.rendered || "Care Group",
      description: g.content?.rendered?.replace(/<[^>]*>/g, "") || null,
      is_private: g.acf?.is_private || false,
      created_at: g.date,
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
    const notifs = await wpFetchCPT("notification");
    if (!Array.isArray(notifs)) return [];
    return notifs.map((n: any) => ({
      id: String(n.id),
      type: n.acf?.type || "info",
      title: n.title?.rendered || "Notification",
      content: n.content?.rendered?.replace(/<[^>]*>/g, "") || "",
      link_url: n.acf?.link_url || null,
      is_read: n.acf?.is_read || false,
      created_at: n.date,
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
    return orders.map(mapWcOrderToBooking);
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
    const facilities = await wpFetchCPT("care_facility");
    if (!Array.isArray(facilities)) return [];
    return facilities.map((f: any) => ({
      id: String(f.id),
      title: f.title?.rendered || "Facility",
      description: f.content?.rendered?.replace(/<[^>]*>/g, "") || null,
      location: f.acf?.location || null,
      address: f.acf?.address || null,
      phone: f.acf?.phone || null,
      email: f.acf?.email || null,
      website: f.acf?.website || null,
      rating_average: f.acf?.rating || null,
      review_count: f.acf?.review_count || 0,
      created_at: f.date,
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
