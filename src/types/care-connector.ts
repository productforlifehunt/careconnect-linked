// Types matching WordPress user + JetEngine CCT "User's extended profile"

export interface Profile {
  // ─── WordPress core user fields ─────────────────────────────
  id: string;
  user_id: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  user_name: string | null;
  avatar_url: string | null;
  bio: string | null;

  // ─── CCT: User's extended profile (exact match) ─────────────
  general_user_role: string[] | null;       // checkbox: ["cared one", "caring one"]
  is_care_provider: boolean;                // radio: yes/no
  provider_is_active: boolean;              // radio: yes/no
  care_provider_is_background_checked: boolean; // radio: yes/no
  care_provider_background_check_detail: string | null; // text
  care_provider_starts_hourly_rate: number | null;      // number (cheapest published rate)

  // ─── CCT 258 published rates (a66 / a67 / a69 / a70) ────────
  /** a66 — hourly rate for in-person service. */
  care_provider_hourly_rate_in_person?: number | null;
  /** a67 — hourly rate for remote service. */
  care_provider_hourly_rate_remote?: number | null;
  /** a69 — rate for remote check-ins. */
  care_provider_rate_remote_checkin?: number | null;
  /** a70 — rate for remote medicine supervision. */
  care_provider_rate_remote_medicine?: number | null;
  /** a63 — cancellation policy. */
  care_provider_cancellation_policy?: string | null;

  // ─── CCT: Additional provider fields (added to CCT) ─────────
  phone: string | null;
  location: string | null;
  years_of_experience: number | null;
  certifications: string[] | null;
  specialty: string[] | null;

  // ─── Computed ───────────────────────────────────────────────
  rating_average: number | null;
  rating_count: number | null;
  /** Lowest published rate (mirrors care_provider_starts_hourly_rate). */
  min_block_cost?: number | null;
  /** Care service slugs offered by this provider (CCT 258 a68). */
  service_type_slugs?: string[];
  /** Delivery-mode slugs (CCT 258 a65): in-person | remote. */
  service_location_slugs?: string[];


  // ─── Timestamps ─────────────────────────────────────────────
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  provider_id: string;
  care_recipient_id: string | null;
  start_time: string | null;
  end_time: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  duration_hour: number | null;
  service_type: string | null;
  hourly_rate: number | null;
  total_cost: number | null;
  status: string;
  payment_status: string | null;
  payment_intent_id: string | null;
  location: string | null;
  special_instruction: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  provider?: Profile;
  client?: Profile;
}

export interface CareFacility {
  id: string;
  post_type_id?: string | null;
  child_post_type_id?: string | null;
  name: string;
  description: string | null;
  type: string | null;
  service_type: string[] | string | null;
  service_category: string[] | string | null;
  country: string | null;
  c_province: string | null;
  c_city: string | null;
  c_district: string | null;
  c_town: string | null;
  c_village: string | null;
  hunter_id: string | null;
  address: string | null;
  location: string | null;
  phone: string | null;
  phone_number: string | null;
  email: string | null;
  website_url: string | null;
  avatar_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocationRecord {
  id: string;
  entity_id: string;
  post_id?: string | null;
  product_id?: string | null;
  shop_id?: string | null;
  user_id?: string | null;
  address: string | null;
  country: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  town: string | null;
  village: string | null;
  locality?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  postal_code?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EntityMember {
  id: string;
  entity_id: string;
  post_id?: string | null;
  product_id?: string | null;
  shop_id?: string | null;
  target_user_id?: string | null;
  user_id: string;
  is_owner: boolean | null;
  is_admin: boolean | null;
  role: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EntityMemberWithProfile extends EntityMember {
  profile?: Pick<Profile, "id" | "user_id" | "full_name" | "email" | "avatar_url"> | null;
}

export interface EntityOwnershipClaim {
  id: string;
  entity_id: string;
  post_id?: string | null;
  product_id?: string | null;
  shop_id?: string | null;
  target_user_id?: string | null;
  claim: string | null;
  attachment_urls: string[] | null;
  status: "pending" | "approved" | "rejected" | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface EntityOwnershipDispute {
  id: string;
  entity_id: string;
  post_id?: string | null;
  product_id?: string | null;
  shop_id?: string | null;
  target_user_id?: string | null;
  claim: string | null;
  attachment_urls: string[] | null;
  status: "pending" | "approved" | "rejected" | null;
  reject_reason: string | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export type FacilityMember = EntityMember & {
  facility_id?: string | null;
};

export type FacilityMemberWithProfile = EntityMemberWithProfile & {
  facility_id?: string | null;
};

export type FacilityOwnershipClaim = EntityOwnershipClaim & {
  facility_id?: string | null;
};

export type FacilityOwnershipDispute = EntityOwnershipDispute & {
  facility_id?: string | null;
};

export interface Review {
  id: string;
  entity_id: string;
  reviewer_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  content?: string | null;
  response_text?: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface PostType {
  id: string;
  level: 1 | 2 | 3 | 4;
  code: string | null;
  key: string;
  name: string | null;
  description: string | null;
  slug: string | null;
  status: string | null;
  author_id: string | null;
  parent_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryType {
  id: string;
  parent_id: string | null;
  code: string | null;
  key: string;
  name: string | null;
  description: string | null;
  slug: string | null;
  status: string | null;
  author_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryOption {
  id: string;
  category_type_id: string;
  parent_id: string | null;
  key: string;
  code: string | null;
  name: string | null;
  description: string | null;
  slug: string | null;
  sort_order: number | null;
  status: string | null;
  author_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EntityCategoryOption {
  id: string;
  entity_id: string;
  post_id?: string | null;
  product_id?: string | null;
  shop_id?: string | null;
  category_type_id: string;
  category_option_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomFieldType {
  id: string;
  code: string | null;
  key: string;
  name: string | null;
  description: string | null;
  slug: string | null;
  status: string | null;
  author_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EntityCustomFieldValue {
  id: string;
  entity_id: string;
  post_id?: string | null;
  product_id?: string | null;
  shop_id?: string | null;
  custom_field_type_id: string;
  value: string | null;
  status: string | null;
  author_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  post_type_id: string | null;
  child_post_type_id?: string | null;
  grandchild_post_type_id?: string | null;
  great_grandchild_post_type_id?: string | null;
  post_type?: string | null;
  title: string;
  content_area: string | null;
  area?: string | null;
  content: string | null;
  excerpt?: string | null;
  slug?: string | null;
  logo_url?: string | null;
  thumbnail_url?: string | null;
  status?: string | null;
  author_id: string;
  hunter_id?: string | null;
  phone?: string | null;
  mail?: string | null;
  website_url?: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
  vote_count?: number;
  user_voted?: boolean;
  vote_score?: number;
  upvote_count?: number;
  downvote_count?: number;
  user_vote?: -1 | 0 | 1;
}

export interface Comment {
  id: string;
  comment_entity_id: string;
  comment_post_id?: string | null;
  comment_review_id?: string | null;
  comment_parent_id: string | null;
  author_id: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
  replies?: Comment[];
  vote_count?: number;
  user_voted?: boolean;
  vote_score?: number;
  upvote_count?: number;
  downvote_count?: number;
  user_vote?: -1 | 0 | 1;
}

export interface Vote {
  id: string;
  vote_entity_id: string;
  vote_post_id?: string | null;
  vote_comment_id?: string | null;
  vote_review_id?: string | null;
  voter_id: string;
  author_id?: string;
  upvote_or_downvote: "upvote" | "downvote";
  created_at: string;
}

export interface CareGroup {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  is_private: boolean;
  group_type: string;
  join_code: string | null;
  invite_code: string | null;
  is_active: boolean;
  member_count: number | null;
  created_at: string;
  updated_at?: string;
}

export interface CareGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  display_name: string | null;
  member_types: string[];
  member_roles: string[];
  is_owner: boolean;
  is_admin: boolean;
  is_cared_one: boolean;
  invitation_status: string;
  relationship: string | null;
  profile?: Profile;
}

export interface CareTask {
  id: string;
  group_id: string | null;
  created_by: string;
  assigned_to: string | null;
  assigned_to_ids?: string[];
  care_recipient_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  job_id: string | null;
  created_at: string;
  updated_at: string;
  assignee_profile?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string | null;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface SavedProvider {
  id: string;
  user_id: string;
  provider_id: string;
  created_at: string;
  provider?: Profile;
}

export interface CareGroupPost {
  id: string;
  group_id: string;
  author_id: string;
  type: string;
  title: string | null;
  content: string | null;
  is_draft: boolean | null;
  is_pinned: boolean | null;
  scheduled_at: string | null;
  wish_message_type: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface LocationShare {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  address: string | null;
  is_sharing: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}
