/**
 * WordPress native-endpoint feature registry.
 *
 * SCOPE: Native WP/Woo/Dokan REST endpoints ONLY.
 * Do NOT add JetEngine CCT mappings here — those use opaque WP.cct.* codes
 * from src/integrations/wp-schema.ts and call wordpressCCTFetch() directly.
 */
import { getStoredWPUser } from "@/services/wp-auth";
import type { Booking, Profile } from "@/types/care-connector";
import { stripHtml } from "@/features/shared/wordpress-client";

export type WordPressSchemaStatus = "confirmed";

export type WordPressFeatureKey =
  | "providers"
  | "provider"
  | "bookings"
  | "booking"
  | "profile_me"
  | "wp_user"
  | "articles"
  | "article"
  | "generic_posts"
  | "generic_post"
  | "categories"
  | "reviews"
  | "review_create";

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
  _embedded?: {
    author?: Array<{ name?: string; avatar_urls?: Record<string, string> }>;
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string }>>;
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
    avatar_url: store.gravatar || null,
    bio: store.description || null,
    general_user_role: ["caring one"],
    is_care_provider: true,
    provider_is_active: true,
    care_provider_is_background_checked: false,
    care_provider_background_check_detail: null,
    care_provider_starts_hourly_rate: null,
    phone: null,
    location: addr?.city || addrStr || null,
    years_of_experience: null,
    certifications: null,
    specialty: [],
    rating_average: store.rating?.rating != null ? parseFloat(String(store.rating.rating)) || null : null,
    rating_count: store.rating?.count != null ? parseInt(String(store.rating.count), 10) || 0 : 0,
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
    // Never the shared WP user name — the per-app display name is read from
    // CCT 151 by the caller (see features/profile/app-user-name.ts).
    full_name: "",
    user_name: user.slug || null,
    avatar_url: user.avatar_urls?.["96"] || user.avatar_urls?.["48"] || null,
    bio: user.description || null,
    general_user_role: null,
    is_care_provider: false,
    provider_is_active: false,
    care_provider_is_background_checked: false,
    care_provider_background_check_detail: null,
    care_provider_starts_hourly_rate: null,
    phone: null,
    location: null,
    years_of_experience: null,
    certifications: null,
    specialty: null,
    rating_average: null,
    rating_count: null,
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
    featured_image_url: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    hunter_id: post.author ? String(post.author) : null,
    author_id: post.author ? String(post.author) : null,
    created_at: post.date,
    updated_at: post.modified,
  };
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
  generic_posts: {
    status: "confirmed",
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
    status: "confirmed",
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
        // Name comes only from the profile; no invented "Anonymous".
        full_name: r.reviewer?.name || "",
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
};

