// Types matching the care_connector schema

export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  user_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  address: string | null;
  address_latitude: number | null;
  address_longitude: number | null;
  timezone: string | null;
  currency: string | null;
  email_notification: boolean | null;
  push_notification: boolean | null;
  quiet_hour_start: string | null;
  quiet_hour_end: string | null;
  is_care_provider: boolean;
  is_cared_one: boolean;
  is_admin: boolean;
  provider_type: string | null;
  hourly_rate: number | null;
  specialty: string[] | null;
  service_offered: string[] | null;
  years_of_experience: number | null;
  certification: string[] | null;
  background_check_status: string | null;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean | null;
  instant_book_enabled: boolean | null;
  provider_is_active: boolean | null;
  rating_average: number | null;
  rating_count: number | null;
  total_booking_count: number | null;
  response_time_minute: number | null;
  cancellation_policy: string | null;
  service_area: string[] | null;
  created_by_user_id: string | null;
  relationship_to_creator: string | null;
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

export interface Review {
  id: string;
  entity_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  response_text: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface CareGroup {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  is_private: boolean;
  join_code: string | null;
  member_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface CareGroupMember {
  id: string;
  group_id: string;
  user_id: string;
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
  care_recipient_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  due_date: string | null;
  job_id: string | null;
  created_at: string;
  updated_at: string;
  assignee_profile?: Profile;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  group_id: string | null;
  message_content: string;
  attachment_url: string | null;
  message_type: string;
  read_at: string | null;
  reply_to_id: string | null;
  created_at: string;
  updated_at: string;
  sender?: Profile;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string | null;
  created_at: string;
  participant_1?: Profile;
  participant_2?: Profile;
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
  parent_id: string | null;
  description: string | null;
  icon: string | null;
}
