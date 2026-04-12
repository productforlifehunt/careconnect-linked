import { getStoredWPUser } from "@/services/wp-auth";
import type { Booking, CareGroup, Profile } from "@/types/care-connector";
import { stripHtml } from "@/features/shared/wordpress-client";

export type WordPressSchemaStatus = "confirmed" | "provisional" | "unresolved";

export type WordPressFeatureKey =
  // ─── Core / Auth ───────────────────────────────────────────
  | "providers"
  | "provider"
  | "bookings"
  | "booking"
  | "profile_me"
  | "wp_user"
  // ─── Content ───────────────────────────────────────────────
  | "articles"
  | "article"
  | "generic_posts"
  | "generic_post"
  | "categories"
  | "reviews"
  | "review_create"
  // ─── Care Domain ──────────────────────────────────────────
  | "care_groups"
  | "care_group"
  | "care_group_members"
  | "care_group_member"
  | "care_group_posts"
  | "care_group_galleries"
  | "care_group_invites"
  | "member_categories"
  | "cared_ones"
  | "cared_one"
  | "care_tasks"
  | "care_task"
  | "care_plans"
  | "care_plan"
  | "care_plan_goals"
  | "care_notes"
  | "care_tips"
  | "care_documents"
  | "activity_logs"
  // ─── Health ────────────────────────────────────────────────
  | "checkins"
  | "medicines"
  | "medicine_logs"
  | "health_vitals"
  | "symptom_logs"
  | "wellness_logs"
  | "emergency_contacts"
  // ─── Chat ──────────────────────────────────────────────────
  | "conversations"
  | "conversation_messages"
  | "conversation_message"
  | "chat_participants"
  // ─── Notifications ─────────────────────────────────────────
  | "notifications"
  // ─── Location / Safety ─────────────────────────────────────
  | "location_shares"
  | "location_share_me"
  | "location_history"
  | "location_requests"
  | "safe_zones"
  | "safe_zone_alerts"
  // ─── Facilities ────────────────────────────────────────────
  | "care_facilities"
  | "care_facility"
  | "entity_members"
  | "ownership_claims"
  | "ownership_disputes"
  // ─── Jobs ──────────────────────────────────────────────────
  | "job_postings"
  | "job_applications"
  | "job_application"
  // ─── Provider ──────────────────────────────────────────────
  | "saved_providers"
  | "saved_provider"
  | "provider_availability"
  | "provider_payouts"
  // ─── Social ────────────────────────────────────────────────
  | "votes";

export interface WordPressSchemaEntry<TResponse = unknown, TApp = unknown, TInput = unknown> {
  status: WordPressSchemaStatus;
  endpoint: string | ((args?: Record<string, any>) => string);
  defaultParams?: Record<string, string | number | boolean>;
  mapList?: (response: TResponse, args?: Record<string, any>) => TApp | Promise<TApp>;
  mapDetail?: (response: TResponse, args?: Record<string, any>) => TApp | Promise<TApp>;
  buildCreateBody?: (input: TInput, args?: Record<string, any>) => unknown;
  buildUpdateBody?: (input: TInput, args?: Record<string, any>) => unknown;
}

interface WPDokanStore {
  id: number;
  store_name?: string;
  first_name?: string;
  email?: string;
  gravatar?: string;
  description?: string;
  address?: { street_1?: string; city?: string; state?: string };
  rating?: { rating?: number; count?: number };
}

interface WPWooOrder {
  id: number;
  status: string;
  date_created: string;
  line_items?: Array<{ name?: string; price?: string }>;
  total?: string;
}

interface WPUserEntity {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  slug?: string;
  avatar_urls?: Record<string, string>;
  description?: string;
}

interface WPPostEntity {
  id: number;
  type?: string;
  slug?: string;
  status?: string;
  date?: string;
  modified?: string;
  author?: number;
  title?: { rendered?: string };
  content?: { rendered?: string };
  excerpt?: { rendered?: string };
  acf?: Record<string, any>;
  _embedded?: {
    author?: Array<{ name?: string; avatar_urls?: Record<string, string> }>;
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

interface WPNotificationEntity {
  id: number;
  title?: { rendered?: string };
  content?: { rendered?: string };
  date?: string;
  acf?: { type?: string; link_url?: string; is_read?: boolean };
}

interface WPCareGroupEntity {
  id: number;
  title?: { rendered?: string };
  content?: { rendered?: string };
  date?: string;
  acf?: { is_private?: boolean; member_count?: number; owner_id?: number; members?: number[] };
}

interface WPFacilityEntity {
  id: number;
  title?: { rendered?: string };
  content?: { rendered?: string };
  date?: string;
  modified?: string;
  acf?: {
    location?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    rating?: number;
    review_count?: number;
    type?: string;
    country?: string;
    c_province?: string;
    c_city?: string;
    service_category?: string[];
    service_type?: string[];
  };
}

interface WPCategoryEntity {
  id: number;
  name?: string;
  slug?: string;
  description?: string;
  count?: number;
  parent?: number;
}

interface WPComment {
  id: number;
  post: number;
  author_name?: string;
  author_avatar_urls?: Record<string, string>;
  content?: { rendered?: string };
  date?: string;
  meta?: { rating?: number };
}

interface WPCareTask {
  id: number;
  title?: { rendered?: string };
  date?: string;
  acf?: { status?: string; priority?: string; due_date?: string; description?: string };
}

interface WPCaredOneEntity {
  id: number;
  title?: { rendered?: string };
  date?: string;
  acf?: { relationship?: string; avatar_url?: string; dementia_stage?: string };
}

interface WPSavedProviderEntity {
  id: number;
  acf?: { provider_id?: number; provider_name?: string; provider_avatar?: string };
}

interface WPLocationShareEntity {
  id: number;
  date?: string;
  modified?: string;
  acf?: {
    latitude?: number;
    longitude?: number;
    is_sharing_enabled?: boolean;
    user_name?: string;
    user_avatar?: string;
    user_id?: number;
  };
}

interface WPConversationEntity {
  id: number;
  title?: { rendered?: string };
  date?: string;
  modified?: string;
  acf?: { participants?: number[]; last_message?: string; last_message_date?: string };
}

interface WPChatMessageEntity {
  id: number;
  date?: string;
  content?: { rendered?: string };
  acf?: { conversation_id?: number; sender_id?: number; sender_name?: string; sender_avatar?: string };
}

function mapDokanStoreToProfile(store: WPDokanStore): Profile {
  const addr = store.address;
  const addrStr = addr ? [addr.street_1, addr.city, addr.state].filter(Boolean).join(", ") : null;
  return {
    id: String(store.id),
    user_id: `wp-${store.id}`,
    email: store.email || null,
    first_name: store.store_name?.split(" ")[0] || store.first_name || null,
    last_name: store.store_name?.split(" ").slice(1).join(" ") || null,
    full_name: store.store_name || store.first_name || "Provider",
    user_name: null,
    phone_number: null,
    avatar_url: store.gravatar || null,
    bio: store.description || null,
    location: addr?.city || null,
    address: addrStr,
    address_latitude: null,
    address_longitude: null,
    timezone: null,
    currency: null,
    email_notification: null,
    push_notification: null,
    quiet_hour_start: null,
    quiet_hour_end: null,
    is_care_provider: true,
    is_cared_one: false,
    is_admin: false,
    provider_type: null,
    hourly_rate: null,
    specialty: [],
    service_offered: null,
    years_of_experience: null,
    certification: null,
    background_check_status: null,
    stripe_account_id: null,
    stripe_onboarding_complete: null,
    instant_book_enabled: null,
    provider_is_active: true,
    rating_average: store.rating?.rating != null ? parseFloat(String(store.rating.rating)) || null : null,
    rating_count: store.rating?.count != null ? parseInt(String(store.rating.count), 10) || 0 : 0,
    total_booking_count: null,
    response_time_minute: null,
    cancellation_policy: null,
    service_area: null,
    created_by_user_id: null,
    relationship_to_creator: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function mapWooOrderToBooking(order: WPWooOrder): Booking {
  let status = order.status;
  if (status === "processing") status = "confirmed";
  else if (status === "on-hold") status = "pending";
  return {
    id: String(order.id),
    user_id: "",
    provider_id: "",
    care_recipient_id: null,
    start_time: null,
    end_time: null,
    appointment_date: order.date_created,
    appointment_time: null,
    duration_hour: null,
    service_type: order.line_items?.[0]?.name || "Service",
    hourly_rate: null,
    total_cost: order.total ? parseFloat(order.total) : null,
    status,
    payment_status: order.status === "completed" ? "paid" : "pending",
    payment_intent_id: null,
    location: null,
    special_instruction: null,
    check_in_time: null,
    check_out_time: null,
    created_at: order.date_created,
    updated_at: order.date_created,
    provider: { full_name: "Provider" } as any,
  };
}

function mapWPUserToProfile(user: WPUserEntity): Profile {
  return {
    id: `wp-${user.id}`,
    user_id: `wp-${user.id}`,
    email: user.email || null,
    first_name: user.first_name || null,
    last_name: user.last_name || null,
    full_name: user.name || [user.first_name, user.last_name].filter(Boolean).join(" ") || "User",
    user_name: user.slug || null,
    phone_number: null,
    avatar_url: user.avatar_urls?.["96"] || user.avatar_urls?.["48"] || null,
    bio: user.description || null,
    location: null,
    address: null,
    address_latitude: null,
    address_longitude: null,
    timezone: null,
    currency: null,
    email_notification: null,
    push_notification: null,
    quiet_hour_start: null,
    quiet_hour_end: null,
    is_care_provider: false,
    is_cared_one: false,
    is_admin: false,
    provider_type: null,
    hourly_rate: null,
    specialty: null,
    service_offered: null,
    years_of_experience: null,
    certification: null,
    background_check_status: null,
    stripe_account_id: null,
    stripe_onboarding_complete: null,
    instant_book_enabled: null,
    provider_is_active: null,
    rating_average: null,
    rating_count: null,
    total_booking_count: null,
    response_time_minute: null,
    cancellation_policy: null,
    service_area: null,
    created_by_user_id: null,
    relationship_to_creator: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function mapStoredWPUserToProfile(): Profile | null {
  const stored = getStoredWPUser();
  if (!stored) return null;
  const nameParts = (stored.user_display_name || stored.user_login).split(" ");
  return {
    id: `wp-${stored.user_id}`,
    user_id: `wp-${stored.user_id}`,
    email: stored.user_email,
    first_name: nameParts[0] || null,
    last_name: nameParts.slice(1).join(" ") || null,
    full_name: stored.user_display_name || stored.user_login,
    user_name: stored.user_login,
    phone_number: null,
    avatar_url: null,
    bio: null,
    location: null,
    address: null,
    address_latitude: null,
    address_longitude: null,
    timezone: null,
    currency: null,
    email_notification: null,
    push_notification: null,
    quiet_hour_start: null,
    quiet_hour_end: null,
    is_care_provider: false,
    is_cared_one: false,
    is_admin: false,
    provider_type: null,
    hourly_rate: null,
    specialty: null,
    service_offered: null,
    years_of_experience: null,
    certification: null,
    background_check_status: null,
    stripe_account_id: null,
    stripe_onboarding_complete: null,
    instant_book_enabled: null,
    provider_is_active: null,
    rating_average: null,
    rating_count: null,
    total_booking_count: null,
    response_time_minute: null,
    cancellation_policy: null,
    service_area: null,
    created_by_user_id: null,
    relationship_to_creator: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function mapWPPostToArticle(post: WPPostEntity) {
  return {
    id: String(post.id),
    title: post.title?.rendered || "",
    content: post.content?.rendered || "",
    excerpt: stripHtml(post.excerpt?.rendered),
    slug: post.slug,
    author_name: post._embedded?.author?.[0]?.name || "Author",
    author_avatar: post._embedded?.author?.[0]?.avatar_urls?.["48"] || null,
    featured_image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    created_at: post.date,
    updated_at: post.modified,
    comment_count: 0,
    vote_count: 0,
    categories: (post._embedded?.["wp:term"]?.[0] || []).map((t) => t.name),
  };
}

function mapGenericWPPost(post: WPPostEntity, args?: Record<string, any>) {
  return {
    id: String(post.id),
    post_type_id: null,
    post_type: args?.postType || post.type || "post",
    title: post.title?.rendered || null,
    slug: post.slug || null,
    content: stripHtml(post.content?.rendered) || null,
    excerpt: stripHtml(post.excerpt?.rendered) || null,
    status: post.status || "publish",
    featured_image_url: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || post.acf?.featured_image || null,
    hunter_id: post.author ? String(post.author) : null,
    author_id: post.author ? String(post.author) : null,
    created_at: post.date,
    updated_at: post.modified,
  };
}

function mapWPJobPosting(post: WPPostEntity) {
  return {
    id: String(post.id),
    posted_by: post.author ? String(post.author) : null,
    title: post.title?.rendered || null,
    description: stripHtml(post.content?.rendered) || null,
    location: post.acf?.location || null,
    status: post.acf?.status || "open",
    job_source_type: post.acf?.job_source_type || "general",
    start_date: post.acf?.start_date || null,
    created_at: post.date,
    poster: post.acf?.poster_name ? { full_name: post.acf.poster_name, avatar_url: post.acf.poster_avatar || null } : null,
  };
}

function mapWPJobApplication(post: WPPostEntity, args?: Record<string, any>) {
  return {
    id: String(post.id),
    job_id: args?.jobId ? String(args.jobId) : (post.acf?.job_id ? String(post.acf.job_id) : null),
    applicant_id: post.acf?.applicant_id ? String(post.acf.applicant_id) : null,
    status: post.acf?.status || "pending",
    cover_letter: stripHtml(post.content?.rendered) || null,
    created_at: post.date,
    applicant: post.acf?.applicant_name ? { id: String(post.acf.applicant_id), full_name: post.acf.applicant_name, avatar_url: post.acf.applicant_avatar || null } : null,
    job: post.acf?.job_title ? { id: String(post.acf.job_id), title: post.acf.job_title, status: post.acf?.job_status || "open" } : null,
  };
}

/** Generic mapper for any ACF-backed CPT: extracts id, title, date, and all acf fields. */
function mapAcfPost(post: WPPostEntity) {
  return {
    id: String(post.id),
    title: post.title?.rendered || null,
    ...((post.acf && typeof post.acf === "object" && !Array.isArray(post.acf)) ? post.acf : {}),
    created_at: post.date,
    updated_at: post.modified || post.date,
  };
}

function mapCareGroup(entity: WPPostEntity): CareGroup {
  return {
    id: String(entity.id),
    name: entity.title?.rendered || "",
    description: stripHtml(entity.content?.rendered) || null,
    is_private: entity.acf?.is_private || false,
    created_at: entity.date || new Date().toISOString(),
    created_by: entity.author ? `wp-${entity.author}` : null,
    member_count: entity.acf?.member_count ?? 0,
  } as CareGroup;
}

export const wordpressSchema: Record<WordPressFeatureKey, WordPressSchemaEntry<any, any, any>> = {
  providers: {
    status: "confirmed",
    endpoint: "dokan/v1/stores",
    defaultParams: { per_page: 50 },
    mapList: (stores: WPDokanStore[]) => (Array.isArray(stores) ? stores.map(mapDokanStoreToProfile) : []),
  },
  provider: {
    status: "confirmed",
    endpoint: ({ id }) => `dokan/v1/stores/${String(id).replace("wp-", "")}`,
    mapDetail: (store: WPDokanStore) => mapDokanStoreToProfile(store),
  },
  bookings: {
    status: "confirmed",
    endpoint: "wc/v3/orders",
    defaultParams: { per_page: 50 },
    mapList: (orders: WPWooOrder[]) => (Array.isArray(orders) ? orders.map(mapWooOrderToBooking) : []),
  },
  booking: {
    status: "confirmed",
    endpoint: ({ id }) => `wc/v3/orders/${id}`,
    mapDetail: (order: WPWooOrder) => mapWooOrderToBooking(order),
    buildCreateBody: (booking: Partial<Booking>) => ({
      status: "pending",
      line_items: [{ name: booking.service_type || "Care Service", quantity: 1, total: booking.total_cost ? String(booking.total_cost) : "0" }],
    }),
    buildUpdateBody: ({ status }: { status: string }) => {
      let wcStatus = status;
      if (status === "confirmed") wcStatus = "processing";
      else if (status === "pending") wcStatus = "on-hold";
      return { status: wcStatus };
    },
  },
  profile_me: {
    status: "confirmed",
    endpoint: "wp/v2/users/me",
    defaultParams: { context: "edit" },
    mapDetail: (user: WPUserEntity) => mapWPUserToProfile(user),
    buildUpdateBody: (updates: Partial<Profile>) => {
      const body: Record<string, any> = {};
      if (updates.first_name !== undefined) body.first_name = updates.first_name;
      if (updates.last_name !== undefined) body.last_name = updates.last_name;
      if (updates.full_name !== undefined) body.name = updates.full_name;
      if (updates.bio !== undefined) body.description = updates.bio;
      return body;
    },
  },
  articles: {
    status: "confirmed",
    endpoint: "wp/v2/posts",
    defaultParams: { per_page: 20, _embed: 1 },
    mapList: (posts: WPPostEntity[]) => (Array.isArray(posts) ? posts.map(mapWPPostToArticle) : []),
  },
  article: {
    status: "confirmed",
    endpoint: ({ id }) => `wp/v2/posts/${id}`,
    defaultParams: { _embed: 1 },
    mapDetail: (post: WPPostEntity) => mapWPPostToArticle(post),
  },
  notifications: {
    status: "confirmed",
    endpoint: "wp/v2/notification",
    defaultParams: { per_page: 50 },
    mapList: (notifs: WPNotificationEntity[]) => (Array.isArray(notifs) ? notifs.map((n) => ({
      id: String(n.id),
      type: n.acf?.type || "info",
      title: n.title?.rendered || "Notification",
      content: stripHtml(n.content?.rendered),
      link_url: n.acf?.link_url || null,
      is_read: n.acf?.is_read || false,
      created_at: n.date,
    })) : []),
  },
  care_groups: {
    status: "confirmed",
    endpoint: "wp/v2/care_group",
    defaultParams: { per_page: 50 },
    mapList: (groups: WPCareGroupEntity[]) => (Array.isArray(groups) ? groups.map(mapCareGroup) : []),
    buildCreateBody: (group: { name: string; description?: string; is_private?: boolean }) => ({
      title: group.name,
      content: group.description || "",
      status: "publish",
      acf: { is_private: group.is_private || false },
    }),
  },
  care_group: {
    status: "confirmed",
    endpoint: ({ id }) => `wp/v2/care_group/${id}`,
    mapDetail: (group: WPCareGroupEntity) => mapCareGroup(group),
  },
  care_group_members: {
    status: "confirmed",
    endpoint: "wp/v2/care_group_member",
    defaultParams: { per_page: 100 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map((m) => ({
      id: String(m.id),
      group_id: m.acf?.group_id ? String(m.acf.group_id) : null,
      user_id: m.acf?.user_id ? String(m.acf.user_id) : null,
      role: m.acf?.role || "member",
      invitation_status: m.acf?.invitation_status || "accepted",
      joined_at: m.acf?.joined_at || m.date,
      invited_by: m.acf?.invited_by ? String(m.acf.invited_by) : null,
      profile: null,
    })) : []),
    buildCreateBody: (input: { group_id: string; user_id: string; role?: string }) => ({
      title: `Member ${input.user_id} in ${input.group_id}`,
      status: "publish",
      acf: { group_id: input.group_id, user_id: input.user_id, role: input.role || "member", invitation_status: "accepted" },
    }),
  },
  care_group_member: {
    status: "confirmed",
    endpoint: ({ id }) => `wp/v2/care_group_member/${id}`,
    mapDetail: (m: WPPostEntity) => mapAcfPost(m),
  },
  care_group_posts: {
    status: "confirmed",
    endpoint: "wp/v2/care_group_post",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { group_id: string; content: string }) => ({
      title: "Group Post",
      content: input.content,
      status: "publish",
      acf: { group_id: input.group_id },
    }),
  },
  care_group_galleries: {
    status: "confirmed",
    endpoint: "wp/v2/care_group_gallery",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
  },
  care_group_invites: {
    status: "confirmed",
    endpoint: "wp/v2/care_group_invite",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { invitee_email: string }) => ({
      title: "Group Invite",
      status: "publish",
      acf: { invitee_email: input.invitee_email, status: "pending" },
    }),
  },
  member_categories: {
    status: "confirmed",
    endpoint: "wp/v2/member_category",
    defaultParams: { per_page: 100 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
  },
  care_facilities: {
    status: "confirmed",
    endpoint: "wp/v2/care_facility",
    defaultParams: { per_page: 100 },
    mapList: (facilities: WPFacilityEntity[]) => (Array.isArray(facilities) ? facilities.map((f) => ({
      id: String(f.id),
      name: f.title?.rendered || "Facility",
      description: stripHtml(f.content?.rendered),
      location: f.acf?.location || null,
      address: f.acf?.address || null,
      phone: f.acf?.phone || null,
      email: f.acf?.email || null,
      website: f.acf?.website || null,
      rating_average: f.acf?.rating != null ? parseFloat(String(f.acf.rating)) || null : null,
      review_count: f.acf?.review_count != null ? parseInt(String(f.acf.review_count), 10) || 0 : 0,
      type: f.acf?.type || null,
      country: f.acf?.country || null,
      c_province: f.acf?.c_province || null,
      c_city: f.acf?.c_city || null,
      service_category: f.acf?.service_category || [],
      service_type: f.acf?.service_type || [],
      created_at: f.date,
    })) : []),
  },
  care_facility: {
    status: "confirmed",
    endpoint: ({ id }) => `wp/v2/care_facility/${id}`,
    mapDetail: (f: WPFacilityEntity) => ({
      id: String(f.id),
      name: f.title?.rendered || "Facility",
      description: stripHtml(f.content?.rendered),
      location: f.acf?.location || null,
      address: f.acf?.address || null,
      phone: f.acf?.phone || null,
      email: f.acf?.email || null,
      website: f.acf?.website || null,
      rating_average: f.acf?.rating != null ? parseFloat(String(f.acf.rating)) || null : null,
      review_count: f.acf?.review_count != null ? parseInt(String(f.acf.review_count), 10) || 0 : 0,
      type: f.acf?.type || null,
      country: f.acf?.country || null,
      c_province: f.acf?.c_province || null,
      c_city: f.acf?.c_city || null,
      service_category: f.acf?.service_category || [],
      service_type: f.acf?.service_type || [],
      created_at: f.date,
      updated_at: f.modified || f.date,
    }),
  },
  categories: {
    status: "confirmed",
    endpoint: ({ taxonomy }) => {
      if (taxonomy === "post" || taxonomy === "categories") return "wp/v2/categories";
      return "wc/store/v1/products/categories";
    },
    defaultParams: { per_page: 100 },
    mapList: (cats: WPCategoryEntity[]) => (Array.isArray(cats) ? cats.map((c) => ({
      id: String(c.id),
      name: c.name || "",
      slug: c.slug || "",
      description: c.description || null,
      count: c.count ?? 0,
      parent_id: c.parent ? String(c.parent) : null,
    })) : []),
  },
  reviews: {
    status: "confirmed",
    endpoint: "dokan/v1/store-reviews",
    defaultParams: { per_page: 20 },
    mapList: (reviews: any[]) => (Array.isArray(reviews) ? reviews.map((r) => ({
      id: String(r.id),
      entity_id: r.store_id ? String(r.store_id) : null,
      entity_type: "provider",
      reviewer_id: r.reviewer_id ? String(r.reviewer_id) : null,
      rating: r.rating ?? 5,
      comment: r.content || r.review || null,
      created_at: r.date || r.created_at || new Date().toISOString(),
      reviewer: {
        id: r.reviewer_id ? String(r.reviewer_id) : null,
        full_name: r.reviewer?.name || r.author_name || "Anonymous",
        avatar_url: r.reviewer?.avatar || r.author_avatar_urls?.["96"] || null,
      },
    })) : []),
    buildCreateBody: (review: { entity_id: string; rating: number; comment?: string }) => ({
      store_id: parseInt(review.entity_id.replace("wp-", ""), 10),
      rating: review.rating,
      content: review.comment || "",
    }),
  },
  review_create: {
    status: "confirmed",
    endpoint: (args?: { id?: number }) => `dokan/v1/stores/${args?.id || 0}/reviews`,
    buildCreateBody: (review: { entity_id: string; rating: number; comment?: string }) => ({
      title: "Caregiver Review",
      rating: review.rating,
      content: review.comment || "",
    }),
  },
  care_tasks: {
    status: "confirmed",
    endpoint: "jet-cct/universal_care_task",
    defaultParams: { per_page: 100 },
    mapList: (tasks: WPCareTask[]) => (Array.isArray(tasks) ? tasks.map((t) => ({
      id: String(t.id),
      title: t.title?.rendered || "Task",
      status: t.acf?.status || "pending",
      priority: t.acf?.priority || "medium",
      due_date: t.acf?.due_date || null,
      description: t.acf?.description || null,
      care_group_id: null,
      assigned_to: null,
      assignee_profile: null,
      created_at: t.date,
    })) : []),
  },
  cared_ones: {
    status: "confirmed",
    endpoint: "wp/v2/cared_one",
    defaultParams: { per_page: 50 },
    mapList: (items: WPCaredOneEntity[]) => (Array.isArray(items) ? items.map((c) => ({
      user_id: String(c.id),
      relationship: c.acf?.relationship || null,
      cared_one: {
        id: String(c.id),
        full_name: c.title?.rendered || "Loved One",
        first_name: c.title?.rendered?.split(" ")[0] || null,
        avatar_url: c.acf?.avatar_url || null,
        dementia_stage: c.acf?.dementia_stage || null,
      },
    })) : []),
    buildCreateBody: (input: { full_name: string; relationship?: string; dementia_stage?: string }) => ({
      title: input.full_name,
      status: "publish",
      acf: { relationship: input.relationship, dementia_stage: input.dementia_stage },
    }),
  },
  cared_one: {
    status: "confirmed",
    endpoint: ({ id }) => `wp/v2/cared_one/${id}`,
    mapDetail: (c: WPCaredOneEntity) => mapAcfPost(c as any),
  },
  care_task: {
    status: "confirmed",
    endpoint: ({ id }) => `jet-cct/universal_care_task/${id}`,
    mapDetail: (t: WPCareTask) => ({
      id: String(t.id),
      title: t.title?.rendered || "Task",
      status: t.acf?.status || "pending",
      priority: t.acf?.priority || "medium",
      due_date: t.acf?.due_date || null,
      description: t.acf?.description || null,
      care_group_id: null,
      assigned_to: null,
      created_at: t.date,
    }),
    buildCreateBody: (input: { title: string; description?: string; status?: string; priority?: string; due_date?: string; care_group_id?: string; assigned_to?: string }) => ({
      title: input.title,
      status: "publish",
      acf: { status: input.status || "pending", priority: input.priority || "medium", due_date: input.due_date, description: input.description },
    }),
    buildUpdateBody: (input: { status?: string; priority?: string; assigned_to?: string }) => ({ acf: { status: input.status, priority: input.priority } }),
  },
  care_plans: {
    status: "confirmed",
    endpoint: "wp/v2/care_plan",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { title: string; description?: string }) => ({
      title: input.title,
      content: input.description || "",
      status: "publish",
      acf: {},
    }),
  },
  care_plan: {
    status: "confirmed",
    endpoint: ({ id }) => `wp/v2/care_plan/${id}`,
    mapDetail: (p: WPPostEntity) => mapAcfPost(p),
  },
  care_plan_goals: {
    status: "confirmed",
    endpoint: "wp/v2/care_plan_goal",
    defaultParams: { per_page: 100 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { description: string }) => ({
      title: input.description,
      status: "publish",
      acf: {},
    }),
  },
  care_notes: {
    status: "confirmed",
    endpoint: "jet-cct/care_note",
    defaultParams: { _limit: 50 },
    mapList: (items: any[]) => (Array.isArray(items) ? items : []),
    buildCreateBody: (input: { content: string }) => ({
      content: input.content,
    }),
  },
  care_tips: {
    status: "confirmed",
    endpoint: "wp/v2/care_tip",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
  },
  care_documents: {
    status: "confirmed",
    endpoint: "wp/v2/care_document",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { document_type?: string; file_url?: number; title: string }) => ({
      title: input.title,
      status: "publish",
      acf: { document_type: input.document_type, ...(input.file_url ? { file_url: input.file_url } : {}) },
    }),
  },
  activity_logs: {
    status: "confirmed",
    endpoint: "jet-cct/activity_log",
    defaultParams: { _limit: 50 },
    mapList: (items: any[]) => (Array.isArray(items) ? items : []),
    buildCreateBody: (input: { user_id: string; action: string; activity_type?: string; entity_type?: string; entity_id?: string }) => ({
      user_id: input.user_id, action: input.action, activity_type: input.activity_type || "general", entity_type: input.entity_type, entity_id: input.entity_id,
    }),
  },
  saved_providers: {
    status: "confirmed",
    endpoint: "jet-cct/saved_provider",
    defaultParams: { _limit: 100 },
    mapList: (items: any[]) => (Array.isArray(items) ? items.map((s: any) => ({
      id: String(s._ID || s.id),
      provider_id: s.provider_id || null,
      provider_name: s.provider_name || null,
      provider_avatar: s.provider_avatar || null,
    })) : []),
    buildCreateBody: (input: { provider_id: string }) => ({ provider_id: input.provider_id }),
  },
  saved_provider: {
    status: "confirmed",
    endpoint: ({ id }: { id: string }) => `jet-cct/saved_provider/${id}`,
  },
  location_shares: {
    status: "provisional",
    endpoint: "wp/v2/location_share",
    defaultParams: { per_page: 100 },
    mapList: (items: WPLocationShareEntity[]) => (Array.isArray(items) ? items.map((l) => ({
      id: String(l.id),
      user_id: l.acf?.user_id ? String(l.acf.user_id) : null,
      user_name: l.acf?.user_name || null,
      user_avatar: l.acf?.user_avatar || null,
      latitude: l.acf?.latitude ?? null,
      longitude: l.acf?.longitude ?? null,
      is_sharing_enabled: l.acf?.is_sharing_enabled ?? false,
      updated_at: l.modified || l.date,
    })) : []),
  },
  location_share_me: {
    status: "provisional",
    endpoint: "wp/v2/location_share",
    defaultParams: { per_page: 1 },
    mapDetail: (items: WPLocationShareEntity[]) => {
      const l = Array.isArray(items) && items.length > 0 ? items[0] : null;
      if (!l) return null;
      return {
        id: String(l.id),
        latitude: l.acf?.latitude ?? null,
        longitude: l.acf?.longitude ?? null,
        is_sharing_enabled: l.acf?.is_sharing_enabled ?? false,
        updated_at: l.modified || l.date,
      };
    },
    buildUpdateBody: (input: { latitude: number; longitude: number; is_sharing_enabled?: boolean }) => ({
      acf: { latitude: input.latitude, longitude: input.longitude, is_sharing_enabled: input.is_sharing_enabled ?? true },
    }),
  },
  conversations: {
    status: "provisional",
    endpoint: "wp/v2/conversation",
    defaultParams: { per_page: 50 },
    mapList: (items: WPConversationEntity[]) => (Array.isArray(items) ? items.map((c) => ({
      id: String(c.id),
      title: c.title?.rendered || "Conversation",
      participants: c.acf?.participants || [],
      last_message: c.acf?.last_message || null,
      last_message_date: c.acf?.last_message_date || c.modified || c.date,
      created_at: c.date,
    })) : []),
  },
  conversation_messages: {
    status: "provisional",
    endpoint: ({ conversationId }) => `wp/v2/chat_message?conversation_id=${conversationId}`,
    defaultParams: { per_page: 100 },
    mapList: (items: WPChatMessageEntity[]) => (Array.isArray(items) ? items.map((m) => ({
      id: String(m.id),
      conversation_id: m.acf?.conversation_id ? String(m.acf.conversation_id) : null,
      sender_id: m.acf?.sender_id ? String(m.acf.sender_id) : null,
      sender_name: m.acf?.sender_name || null,
      sender_avatar: m.acf?.sender_avatar || null,
      content: stripHtml(m.content?.rendered),
      created_at: m.date,
    })) : []),
  },
  conversation_message: {
    status: "confirmed",
    endpoint: "wp/v2/chat_message",
    buildCreateBody: (input: { conversation_id: string; content: string }) => ({
      status: "publish",
      content: input.content,
      acf: { conversation_id: parseInt(input.conversation_id, 10) },
    }),
  },
  chat_participants: {
    status: "confirmed",
    endpoint: "wp/v2/chat_participant",
    defaultParams: { per_page: 100 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { conversation_id: string; user_id: string }) => ({
      title: `Participant ${input.user_id}`,
      status: "publish",
      acf: { conversation_id: input.conversation_id, user_id: input.user_id },
    }),
  },
  // ─── Health Domain ─────────────────────────────────────────
  checkins: {
    status: "confirmed",
    endpoint: "wp/v2/checkin",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { mood?: string; sleep_hours?: string; notes?: string }) => ({
      title: "Check-in",
      status: "publish",
      acf: { mood: input.mood, sleep_hours: input.sleep_hours, notes: input.notes },
    }),
  },
  medicines: {
    status: "confirmed",
    endpoint: "wp/v2/medicine",
    defaultParams: { per_page: 100 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { name: string; dosage?: string; frequency?: string }) => ({
      title: input.name,
      status: "publish",
      acf: { dosage: input.dosage, frequency: input.frequency },
    }),
  },
  medicine_logs: {
    status: "confirmed",
    endpoint: "wp/v2/medicine_log",
    defaultParams: { per_page: 100 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { medicine_id: string; administered_by?: string; status?: string }) => ({
      title: "Med Log",
      status: "publish",
      acf: { medicine_id: input.medicine_id, administered_by: input.administered_by, status: input.status || "taken" },
    }),
  },
  health_vitals: {
    status: "confirmed",
    endpoint: "wp/v2/health_vital",
    defaultParams: { per_page: 100 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { vital_type: string; value: string; unit?: string }) => ({
      title: input.vital_type,
      status: "publish",
      acf: { vital_type: input.vital_type, value: input.value, unit: input.unit },
    }),
  },
  symptom_logs: {
    status: "confirmed",
    endpoint: "jet-cct/health_vital",
    defaultParams: { _limit: 100, vital_type: "symptom" },
    mapList: (items: any[]) => (Array.isArray(items) ? items : []),
    buildCreateBody: (input: { symptom_type: string; severity?: number }) => ({
      vital_type: "symptom", symptom: input.symptom_type, severity: input.severity, value: input.severity,
    }),
  },
  wellness_logs: {
    status: "confirmed",
    endpoint: "jet-cct/caregiver_wellness_log",
    defaultParams: { _limit: 100 },
    mapList: (items: any[]) => (Array.isArray(items) ? items : []),
    buildCreateBody: (input: { user_id: string; mood?: string; stress_level?: number; notes?: string }) => ({
      user_id: input.user_id, mood: input.mood, stress_level: input.stress_level, notes: input.notes,
    }),
  },
  emergency_contacts: {
    status: "confirmed",
    endpoint: "wp/v2/emergency_contact",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { name: string; phone: string; relationship?: string }) => ({
      title: input.name,
      status: "publish",
      acf: { phone: input.phone, relationship: input.relationship },
    }),
  },
  job_postings: {
    status: "provisional",
    endpoint: "wp/v2/job_posting",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapWPJobPosting) : []),
    buildCreateBody: (job: { title: string; description: string; location?: string; start_date?: string }) => ({
      title: job.title,
      content: job.description,
      status: "publish",
      acf: { location: job.location, start_date: job.start_date, status: "open", job_source_type: "general" },
    }),
  },
  job_applications: {
    status: "provisional",
    endpoint: "wp/v2/job_application",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[], args?: Record<string, any>) => (Array.isArray(items) ? items.map((item) => mapWPJobApplication(item, args)) : []),
    buildCreateBody: (input: { job_id: string; cover_letter?: string }) => ({
      title: `Application for job ${input.job_id}`,
      content: input.cover_letter || "",
      status: "publish",
      acf: { job_id: parseInt(String(input.job_id).replace("wp-", ""), 10), status: "pending" },
    }),
  },
  job_application: {
    status: "confirmed",
    endpoint: ({ id }) => `wp/v2/job_application/${id}`,
    buildUpdateBody: (input: { status: string }) => ({ acf: { status: input.status } }),
  },
  // ─── Location / Safety ─────────────────────────────────────
  location_history: {
    status: "confirmed",
    endpoint: "wp/v2/location_history",
    defaultParams: { per_page: 100 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { user_id: string; latitude: number; longitude: number; accuracy_meters?: number; address_text?: string; battery_level?: number; is_emergency?: boolean }) => ({
      title: "Location",
      status: "publish",
      acf: { user_id: input.user_id, latitude: String(input.latitude), longitude: String(input.longitude), accuracy_meters: input.accuracy_meters, address_text: input.address_text, battery_level: input.battery_level, is_emergency: input.is_emergency || false, captured_at: new Date().toISOString() },
    }),
  },
  location_requests: {
    status: "confirmed",
    endpoint: "wp/v2/location_request",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { requester_id: string; target_user_id: string; message?: string }) => ({
      title: "Location Request",
      status: "publish",
      acf: { requester_id: input.requester_id, target_user_id: input.target_user_id, status: "pending", message: input.message },
    }),
  },
  safe_zones: {
    status: "confirmed",
    endpoint: "wp/v2/safe_zone",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { name: string; latitude: number; longitude: number; radius_meters: number }) => ({
      title: input.name,
      status: "publish",
      acf: { latitude: String(input.latitude), longitude: String(input.longitude), radius_meters: String(input.radius_meters), is_active: true },
    }),
  },
  safe_zone_alerts: {
    status: "confirmed",
    endpoint: "wp/v2/safe_zone_alert",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { safe_zone_id: string; alert_type: string; latitude?: number; longitude?: number; message?: string }) => ({
      title: input.alert_type,
      status: "publish",
      acf: { safe_zone_id: input.safe_zone_id, alert_type: input.alert_type, latitude: input.latitude ? String(input.latitude) : undefined, longitude: input.longitude ? String(input.longitude) : undefined, message: input.message, is_read: false },
    }),
  },
  // ─── Facility Membership / Ownership ───────────────────────
  entity_members: {
    status: "confirmed",
    endpoint: "wp/v2/entity_member",
    defaultParams: { per_page: 100 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { entity_id: string; user_id: string; role?: string; is_owner?: boolean }) => ({
      title: `Member ${input.user_id}`,
      status: "publish",
      acf: { entity_id: input.entity_id, user_id: input.user_id, role: input.role || "member", is_owner: input.is_owner || false, is_admin: false },
    }),
  },
  ownership_claims: {
    status: "confirmed",
    endpoint: "wp/v2/ownership_claim",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { entity_id: string; user_id: string; claim: string }) => ({
      title: "Ownership Claim",
      status: "publish",
      acf: { entity_id: input.entity_id, user_id: input.user_id, claim: input.claim, status: "pending" },
    }),
  },
  ownership_disputes: {
    status: "confirmed",
    endpoint: "wp/v2/ownership_dispute",
    defaultParams: { per_page: 50 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { entity_id: string; user_id: string; claim: string }) => ({
      title: "Ownership Dispute",
      status: "publish",
      acf: { entity_id: input.entity_id, user_id: input.user_id, claim: input.claim, status: "pending" },
    }),
  },
  // ─── Provider (uses native WC Bookings + Dokan) ────────────
  provider_availability: {
    status: "confirmed",
    endpoint: "wc-bookings/v1/products",
    defaultParams: { per_page: 100 },
    mapList: (items: any[]) => (Array.isArray(items) ? items.map((p) => ({
      id: String(p.id),
      provider_id: p.post_author ? String(p.post_author) : null,
      name: p.name || "Service",
      availability: p.availability || [],
      min_duration: p.min_duration || null,
      max_duration: p.max_duration || null,
      duration_unit: p.duration_unit || null,
      price: p.price || null,
      created_at: p.date_created,
    })) : []),
  },
  provider_payouts: {
    status: "confirmed",
    endpoint: "dokan/v1/withdraw",
    defaultParams: { per_page: 50 },
    mapList: (items: any[]) => (Array.isArray(items) ? items.map((w) => ({
      id: String(w.id),
      provider_id: w.user_id ? String(w.user_id) : null,
      amount: w.amount ? Number(w.amount) : 0,
      status: w.status || "pending",
      method: w.method || null,
      note: w.note || null,
      created_at: w.date || w.created,
    })) : []),
  },
  // ─── Social ────────────────────────────────────────────────
  votes: {
    status: "confirmed",
    endpoint: "wp/v2/vote",
    defaultParams: { per_page: 100 },
    mapList: (items: WPPostEntity[]) => (Array.isArray(items) ? items.map(mapAcfPost) : []),
    buildCreateBody: (input: { entity_id: string; entity_type: string; user_id: string; value: number }) => ({
      title: `Vote on ${input.entity_type} ${input.entity_id}`,
      status: "publish",
      acf: { entity_id: input.entity_id, entity_type: input.entity_type, user_id: input.user_id, value: input.value },
    }),
  },
  generic_posts: {
    status: "provisional",
    endpoint: ({ postType }) => `wp/v2/${postType && postType !== "post" ? postType : "posts"}`,
    defaultParams: { per_page: 50, _embed: 1 },
    mapList: (items: WPPostEntity[], args?: Record<string, any>) => (Array.isArray(items) ? items.map((item) => mapGenericWPPost(item, args)) : []),
    buildCreateBody: (post: { title: string; content?: string; status?: string }) => ({
      title: post.title,
      content: post.content || "",
      status: post.status || "publish",
    }),
  },
  generic_post: {
    status: "provisional",
    endpoint: ({ id, postType }) => `wp/v2/${postType && postType !== "post" ? postType : "posts"}/${id}`,
    defaultParams: { _embed: 1 },
    mapDetail: (item: WPPostEntity, args?: Record<string, any>) => mapGenericWPPost(item, args),
    buildUpdateBody: (updates: { title?: string; content?: string; status?: string }) => {
      const body: Record<string, any> = {};
      if (updates.title !== undefined) body.title = updates.title;
      if (updates.content !== undefined) body.content = updates.content;
      if (updates.status !== undefined) body.status = updates.status;
      return body;
    },
  },
  wp_user: {
    status: "confirmed",
    endpoint: ({ id }) => `wp/v2/users/${id}`,
    mapDetail: (user: any) => ({
      id: `wp-${user.id}`,
      full_name: user.name || "User",
      avatar_url: user.avatar_urls?.["48"] || user.avatar_urls?.["96"] || null,
      email: null,
    }),
  },
};

export function getStoredWordPressProfileFallback() {
  return mapStoredWPUserToProfile();
}
