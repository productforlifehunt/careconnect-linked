/**
 * Consultation Delivery Service
 * 
 * Reads/writes delivery state via WooCommerce REST API order meta.
 * No new tables, no JetEngine relations — everything lives on the order.
 */

import { getWPToken } from './wp-auth';
import { buildWPUrl, buildWPHeaders } from '@/lib/wp-url';
import {
  ConsultationDelivery,
  DeliveryStatus,
  DeliveryType,
  ITEMMETA_KEYS,
  SOAPNote,
} from '@/types/consultation';

function authHeaders(): Record<string, string> {
  return buildWPHeaders(getWPToken(), 'application/json');
}

async function wcFetch(endpoint: string, options: RequestInit = {}) {
  const url = buildWPUrl(`wc/v3/${endpoint}`);
  const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...options.headers } });
  if (!res.ok) throw new Error(`WC ${res.status}: ${await res.text()}`);
  return res.json();
}

interface RawMeta { id: number; key: string; value: any }
interface RawLineItem {
  id: number;
  product_id: number;
  meta_data: RawMeta[];
}
interface RawOrder {
  id: number;
  status: string;
  line_items: RawLineItem[];
  meta_data: RawMeta[];
}

function readMeta(meta: RawMeta[], key: string): string | undefined {
  const m = meta.find((x) => x.key === key);
  return m?.value !== undefined && m?.value !== null && m?.value !== '' ? String(m.value) : undefined;
}

/**
 * Parse a raw WC line item into a typed ConsultationDelivery object.
 */
function parseDelivery(orderId: number, item: RawLineItem): ConsultationDelivery {
  const m = item.meta_data || [];
  const docIdsRaw = readMeta(m, ITEMMETA_KEYS.document_ids);
  let document_ids: number[] | undefined;
  if (docIdsRaw) {
    try { document_ids = JSON.parse(docIdsRaw); } catch { document_ids = docIdsRaw.split(',').map(Number).filter(Boolean); }
  }

  const subjective = readMeta(m, ITEMMETA_KEYS.soap_subjective);
  const objective = readMeta(m, ITEMMETA_KEYS.soap_objective);
  const assessment = readMeta(m, ITEMMETA_KEYS.soap_assessment);
  const plan = readMeta(m, ITEMMETA_KEYS.soap_plan);
  const soap: SOAPNote | undefined = (subjective || objective || assessment || plan)
    ? {
        subjective: subjective || '',
        objective: objective || '',
        assessment: assessment || '',
        plan: plan || '',
        signed_at: readMeta(m, ITEMMETA_KEYS.soap_signed_at),
        signed_by: readMeta(m, ITEMMETA_KEYS.soap_signed_by),
      }
    : undefined;

  return {
    order_id: orderId,
    item_id: item.id,
    product_id: item.product_id,
    delivery_type: (readMeta(m, ITEMMETA_KEYS.delivery_type) as DeliveryType) || 'video',
    delivery_status: (readMeta(m, ITEMMETA_KEYS.delivery_status) as DeliveryStatus) || 'pending',
    meeting_url: readMeta(m, ITEMMETA_KEYS.meeting_url),
    conversation_id: readMeta(m, ITEMMETA_KEYS.conversation_id),
    async_post_id: readMeta(m, ITEMMETA_KEYS.async_post_id),
    care_plan_id: readMeta(m, ITEMMETA_KEYS.care_plan_id),
    document_ids,
    cared_one_id: readMeta(m, ITEMMETA_KEYS.cared_one_id),
    soap,
    delivered_at: readMeta(m, ITEMMETA_KEYS.delivered_at),
    confirmed_at: readMeta(m, ITEMMETA_KEYS.confirmed_at),
    auto_confirm_at: readMeta(m, ITEMMETA_KEYS.auto_confirm_at),
  };
}

/**
 * Fetch one consultation delivery by order id + item id.
 */
export async function fetchConsultation(orderId: number, itemId: number): Promise<ConsultationDelivery | null> {
  const order: RawOrder = await wcFetch(`orders/${orderId}`);
  const item = order.line_items.find((x) => x.id === itemId);
  if (!item) return null;
  return parseDelivery(orderId, item);
}

/**
 * List all consultations for the current customer (across orders).
 */
export async function listMyConsultations(customerId: number): Promise<ConsultationDelivery[]> {
  const orders: RawOrder[] = await wcFetch(`orders?customer=${customerId}&per_page=50&status=processing,completed,on-hold`);
  const out: ConsultationDelivery[] = [];
  for (const o of orders) {
    for (const li of o.line_items || []) {
      // Only include items that have a delivery_type set
      if (li.meta_data?.some((m) => m.key === ITEMMETA_KEYS.delivery_type)) {
        out.push(parseDelivery(o.id, li));
      }
    }
  }
  return out;
}

/**
 * Update line-item meta. WC REST allows PUT on the order with line_items array.
 */
async function updateItemMeta(orderId: number, itemId: number, meta: Record<string, string>) {
  const meta_data = Object.entries(meta).map(([key, value]) => ({ key, value }));
  return wcFetch(`orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({
      line_items: [{ id: itemId, meta_data }],
    }),
  });
}

/** Provider marks the consultation as delivered (awaiting buyer sign-off) */
export async function markDelivered(orderId: number, itemId: number) {
  const now = new Date().toISOString();
  const autoConfirm = new Date(Date.now() + 7 * 86400_000).toISOString();
  return updateItemMeta(orderId, itemId, {
    [ITEMMETA_KEYS.delivery_status]: 'delivered',
    [ITEMMETA_KEYS.delivered_at]: now,
    [ITEMMETA_KEYS.auto_confirm_at]: autoConfirm,
  });
}

/** Buyer confirms delivery → triggers Dokan payout (server-side hook releases commission) */
export async function confirmDelivery(orderId: number, itemId: number) {
  const now = new Date().toISOString();
  await updateItemMeta(orderId, itemId, {
    [ITEMMETA_KEYS.delivery_status]: 'confirmed',
    [ITEMMETA_KEYS.confirmed_at]: now,
  });
  // Also bump WC order status → completed so Dokan releases vendor balance
  return wcFetch(`orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'completed' }),
  });
}

/** Provider saves SOAP note */
export async function saveSOAP(orderId: number, itemId: number, soap: SOAPNote, providerId: string) {
  return updateItemMeta(orderId, itemId, {
    [ITEMMETA_KEYS.soap_subjective]: soap.subjective,
    [ITEMMETA_KEYS.soap_objective]: soap.objective,
    [ITEMMETA_KEYS.soap_assessment]: soap.assessment,
    [ITEMMETA_KEYS.soap_plan]: soap.plan,
    [ITEMMETA_KEYS.soap_signed_at]: new Date().toISOString(),
    [ITEMMETA_KEYS.soap_signed_by]: providerId,
  });
}

/** Provider sets meeting URL (Jitsi auto-generated or manual Zoom/Meet paste) */
export async function setMeetingUrl(orderId: number, itemId: number, url: string) {
  return updateItemMeta(orderId, itemId, {
    [ITEMMETA_KEYS.meeting_url]: url,
    [ITEMMETA_KEYS.delivery_status]: 'in_progress',
  });
}

/** Generate a deterministic Jitsi room URL for an order item */
export function generateJitsiUrl(orderId: number, itemId: number): string {
  const room = `cc-${orderId}-${itemId}-${Math.random().toString(36).slice(2, 8)}`;
  return `https://meet.jit.si/${room}`;
}
