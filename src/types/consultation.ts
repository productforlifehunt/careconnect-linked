/**
 * Consultation Delivery System Types
 * 
 * 4 delivery modes for telemedicine / care services, all stored as
 * WC `order_itemmeta` on a regular WooCommerce order (no new tables).
 */

export type DeliveryType = 'video' | 'text' | 'async' | 'care_plan';

export type DeliveryStatus =
  | 'pending'      // paid, awaiting provider
  | 'in_progress'  // session active / chat open
  | 'delivered'    // provider marked complete, awaiting buyer sign-off
  | 'confirmed'    // buyer signed off → triggers Dokan payout
  | 'auto_confirmed' // 7-day cron timeout
  | 'disputed';

/**
 * SOAP note — the standard medical consultation record.
 * Saved as 4 separate order_itemmeta keys to keep them queryable.
 */
export interface SOAPNote {
  subjective: string;   // S — patient-reported symptoms
  objective: string;    // O — observed/measured findings
  assessment: string;   // A — provider's diagnosis/impression
  plan: string;         // P — treatment plan, follow-up, prescriptions
  signed_at?: string;   // ISO timestamp when provider signed
  signed_by?: string;   // provider WP user_id
}

/**
 * Unified delivery payload extracted from order_itemmeta.
 * Every consultation order item (line item) carries this shape.
 */
export interface ConsultationDelivery {
  order_id: number;
  item_id: number;
  product_id: number;
  delivery_type: DeliveryType;
  delivery_status: DeliveryStatus;
  meeting_url?: string;          // Jitsi / Zoom / Meet URL (video only)
  conversation_id?: string;      // chat_conversation CCT id (text only)
  async_post_id?: string;        // care_community_post id (async only)
  care_plan_id?: string;         // care_plan CCT id (care_plan only)
  document_ids?: number[];       // WP Media attachment IDs (care_plan only)
  cared_one_id?: string;         // patient identifier
  soap?: SOAPNote;
  created_at?: string;
  delivered_at?: string;
  confirmed_at?: string;
  auto_confirm_at?: string;      // delivered_at + 7d
}

/**
 * Order_itemmeta key registry — single source of truth.
 * Keep in sync with WP-side hooks.
 */
export const ITEMMETA_KEYS = {
  delivery_type: '_delivery_type',
  delivery_status: '_delivery_status',
  meeting_url: '_meeting_url',
  conversation_id: '_conversation_id',
  async_post_id: '_async_post_id',
  care_plan_id: '_care_plan_id',
  document_ids: '_document_ids',
  cared_one_id: '_cared_one_id',
  soap_subjective: '_soap_subjective',
  soap_objective: '_soap_objective',
  soap_assessment: '_soap_assessment',
  soap_plan: '_soap_plan',
  soap_signed_at: '_soap_signed_at',
  soap_signed_by: '_soap_signed_by',
  delivered_at: '_delivered_at',
  confirmed_at: '_confirmed_at',
  auto_confirm_at: '_auto_confirm_at',
} as const;

export const DELIVERY_LABELS: Record<DeliveryType, { en: string; zh: string }> = {
  video:     { en: 'Video Consultation',    zh: '视频问诊' },
  text:      { en: 'Text Chat Consultation', zh: '文字咨询' },
  async:     { en: 'Async Q&A',              zh: '异步图文问诊' },
  care_plan: { en: 'Care Plan Document',     zh: '护理方案文档' },
};
