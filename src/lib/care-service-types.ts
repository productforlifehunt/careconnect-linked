/**
 * Care service catalogue — Bible-native (data dictionary §护理市场).
 *
 * Source of truth: JetEngine CCT 258 "User's extended profile 2"
 *   a65 "Care provider offers service type"      (Checkbox: b55 In person | b56 Virtual)
 *   a68 "Care provider offers care service type" (Checkbox: b55…b68, care.com-aligned)
 *   a66 hourly rate (in person) / a67 hourly rate (remote)
 *   a69 rate for remote check-ins / a70 rate for remote medicine supervision
 *
 * Per the dictionary: "护理者的护理服务只使用我们的CCT来储存，当用户加入购物车时才写入
 * woo/dokan新建一个产品". So browsing, filtering and price display MUST come from
 * this catalogue + CCT 258 — never from WooCommerce products or pa_service-type terms.
 */

export interface CareServiceType {
  /** CCT 258 a68 option id (b55…b68). */
  id: string;
  /** Stable URL/filter slug. */
  slug: string;
  en: string;
  zh: string;
  /** Delivery mode implied by the option itself, when the label states it. */
  delivery?: "in-person" | "remote";
}

/** a68 — "Care provider offers care service type" (14 options, b55…b68). */
export const CARE_SERVICE_TYPES: CareServiceType[] = [
  { id: "b55", slug: "pet-care-and-companion", en: "Pet Care & Companion", zh: "宠物照护与陪伴" },
  { id: "b56", slug: "in-person-child-care-and-companion", en: "Child Care & Companion (In Person)", zh: "上门儿童照护与陪伴", delivery: "in-person" },
  { id: "b57", slug: "remote-child-companion", en: "Child Companion (Remote)", zh: "远程儿童陪伴", delivery: "remote" },
  { id: "b58", slug: "adult-care-and-companion", en: "Adult Care & Companion", zh: "成人照护与陪伴" },
  { id: "b59", slug: "adult-remote-companion", en: "Adult Companion (Remote)", zh: "远程成人陪伴", delivery: "remote" },
  { id: "b60", slug: "in-person-elderly-care-and-companion", en: "Elderly Care & Companion (In Person)", zh: "上门长者照护与陪伴", delivery: "in-person" },
  { id: "b61", slug: "remote-elderly-companion", en: "Elderly Companion (Remote)", zh: "远程长者陪伴", delivery: "remote" },
  { id: "b62", slug: "housekeeping", en: "Housekeeping", zh: "家务整理" },
  { id: "b63", slug: "errand-and-delivery", en: "Errands & Delivery", zh: "跑腿与代购" },
  { id: "b64", slug: "transportation", en: "Transportation", zh: "接送出行" },
  { id: "b65", slug: "medical-escort", en: "Medical Escort", zh: "陪同就医" },
  { id: "b66", slug: "in-person-checkin", en: "Check-in Visit (In Person)", zh: "上门探访签到", delivery: "in-person" },
  { id: "b67", slug: "remote-checkin", en: "Check-in Call (Remote)", zh: "远程电话签到", delivery: "remote" },
  { id: "b68", slug: "remote-medicine-supervision", en: "Medication Reminder (Remote)", zh: "远程用药提醒", delivery: "remote" },
];

/** a65 — "Care provider offers service type" (delivery mode). */
export const SERVICE_DELIVERY_MODES: { id: string; slug: "in-person" | "remote"; en: string; zh: string }[] = [
  { id: "b55", slug: "in-person", en: "In-Person", zh: "上门" },
  { id: "b56", slug: "remote", en: "Remote", zh: "远程" },
];

const BY_ID = new Map(CARE_SERVICE_TYPES.map((s) => [s.id, s]));
const BY_SLUG = new Map(CARE_SERVICE_TYPES.map((s) => [s.slug, s]));
const DELIVERY_BY_ID = new Map(SERVICE_DELIVERY_MODES.map((s) => [s.id, s]));

export function careServiceTypeById(id: string): CareServiceType | undefined {
  return BY_ID.get(String(id));
}

export function careServiceTypeBySlug(slug: string): CareServiceType | undefined {
  return BY_SLUG.get(String(slug).toLowerCase());
}

export function careServiceTypeLabel(idOrSlug: string, zh: boolean): string {
  const hit = BY_ID.get(String(idOrSlug)) || BY_SLUG.get(String(idOrSlug).toLowerCase());
  return hit ? (zh ? hit.zh : hit.en) : String(idOrSlug);
}

export function deliveryModeLabel(idOrSlug: string, zh: boolean): string {
  const hit =
    DELIVERY_BY_ID.get(String(idOrSlug)) ||
    SERVICE_DELIVERY_MODES.find((m) => m.slug === String(idOrSlug).toLowerCase());
  return hit ? (zh ? hit.zh : hit.en) : String(idOrSlug);
}

/** Convert stored a68 checkbox values (option ids) into filter slugs. */
export function careServiceIdsToSlugs(ids: unknown): string[] {
  return toIdList(ids)
    .map((id) => BY_ID.get(id)?.slug)
    .filter(Boolean) as string[];
}

/** Convert stored a65 checkbox values into delivery slugs. */
export function deliveryIdsToSlugs(ids: unknown): ("in-person" | "remote")[] {
  return toIdList(ids)
    .map((id) => DELIVERY_BY_ID.get(id)?.slug)
    .filter(Boolean) as ("in-person" | "remote")[];
}

/** Convert filter slugs back into a68 checkbox option ids. */
export function careServiceSlugsToIds(slugs: string[] | null | undefined): string[] {
  return (slugs || []).map((slug) => BY_SLUG.get(String(slug).toLowerCase())?.id).filter(Boolean) as string[];
}

/** Convert delivery slugs back into a65 checkbox option ids. */
export function deliverySlugsToIds(slugs: string[] | null | undefined): string[] {
  return (slugs || [])
    .map((slug) => SERVICE_DELIVERY_MODES.find((m) => m.slug === String(slug).toLowerCase())?.id)
    .filter(Boolean) as string[];
}

/** JetEngine checkbox values arrive as array, JSON string, or comma list. */
export function toIdList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      if (parsed && typeof parsed === "object") {
        return Object.entries(parsed)
          .filter(([, v]) => v === true || v === 1 || v === "1")
          .map(([k]) => k);
      }
    } catch {}
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v === true || v === 1 || v === "1")
      .map(([k]) => k);
  }
  return [];
}
