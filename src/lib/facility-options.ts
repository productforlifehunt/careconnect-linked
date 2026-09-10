/**
 * Care Facility (CCT 215) option codes — the data dictionary is the only truth.
 * a57 type, a58 dementia stage, a59 room type, a60 room facility,
 * a61 community facility, a62 people number.
 * Codes are meaningless (b55, b56, ...); labels live only here.
 */
import { T } from "@/integrations/wp-schema";

const O = T.careFacility.opt;

export type FacilityOption = { code: string; en: string; zh: string };

export const FACILITY_TYPE_OPTIONS: FacilityOption[] = [
  { code: O.CARE_FACILITY_TYPE.ADULT_DAY_CARE, en: "Adult day care", zh: "日间照料" },
  { code: O.CARE_FACILITY_TYPE.ASSISTED_LIVING, en: "Assisted living", zh: "协助生活" },
  { code: O.CARE_FACILITY_TYPE.HOME_CARE, en: "Home care", zh: "居家照护" },
  { code: O.CARE_FACILITY_TYPE.HOSPICE, en: "Hospice", zh: "临终关怀" },
  { code: O.CARE_FACILITY_TYPE.INDEPENDENT_LIVING, en: "Independent living", zh: "自主生活" },
  { code: O.CARE_FACILITY_TYPE.MEMORY_CARE, en: "Memory care", zh: "失智症专区" },
  { code: O.CARE_FACILITY_TYPE.NURSING_HOMES, en: "Nursing home", zh: "养护院" },
  { code: O.CARE_FACILITY_TYPE.RESIDENTIAL_CARE_HOMES, en: "Residential care home", zh: "住宿型护理院" },
  { code: O.CARE_FACILITY_TYPE.SENIOR_APARTMENTS, en: "Senior apartments", zh: "老年公寓" },
];

export const FACILITY_STAGE_OPTIONS: FacilityOption[] = [
  { code: O.CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE.EARLY_STAGE, en: "Early stage", zh: "早期" },
  { code: O.CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE.MIDDLE_STAGE, en: "Middle stage", zh: "中期" },
  { code: O.CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE.LATE_STAGE, en: "Late stage", zh: "晚期" },
];

export const FACILITY_ROOM_TYPE_OPTIONS: FacilityOption[] = [
  { code: O.CARE_FACILITY_ROOM_TYPE.STUDIO, en: "Studio", zh: "开间" },
  { code: O.CARE_FACILITY_ROOM_TYPE.ONE_BED_ROOM, en: "One bedroom", zh: "一居室" },
  { code: O.CARE_FACILITY_ROOM_TYPE.TWO_BED_ROOM, en: "Two bedroom", zh: "两居室" },
  { code: O.CARE_FACILITY_ROOM_TYPE.MORE_THAN_TWO_BED_ROOM, en: "More than two bedrooms", zh: "两居室以上" },
];

export const FACILITY_ROOM_FACILITY_OPTIONS: FacilityOption[] = [
  { code: O.CARE_FACILITY_PROVIDES_ROOM_FACILITY.BALCONY, en: "Balcony", zh: "阳台" },
  { code: O.CARE_FACILITY_PROVIDES_ROOM_FACILITY.TOILET, en: "Private toilet", zh: "独立卫生间" },
  { code: O.CARE_FACILITY_PROVIDES_ROOM_FACILITY.KITCHEN, en: "Kitchen", zh: "厨房" },
];

export const FACILITY_COMMUNITY_FACILITY_OPTIONS: FacilityOption[] = [
  { code: O.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY.SWIMMING_POOL, en: "Swimming pool", zh: "泳池" },
  { code: O.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY.ACTIVE_LIFESTYLE, en: "Activity programmes", zh: "活动项目" },
  { code: O.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY.ENTERTAINMENT_VENUE, en: "Entertainment venue", zh: "娱乐场所" },
  { code: O.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY.LAUNDRY, en: "Laundry", zh: "洗衣服务" },
];

export const FACILITY_PEOPLE_NUMBER_OPTIONS: FacilityOption[] = [
  { code: O.CARE_FACILITY_PEOPLE_NUMBER.LESS_THAN_5, en: "Fewer than 5 residents", zh: "少于 5 人" },
  { code: O.CARE_FACILITY_PEOPLE_NUMBER["5_20"], en: "5–20 residents", zh: "5–20 人" },
  { code: O.CARE_FACILITY_PEOPLE_NUMBER["20_50"], en: "20–50 residents", zh: "20–50 人" },
  { code: O.CARE_FACILITY_PEOPLE_NUMBER.MORE_THAN_50, en: "More than 50 residents", zh: "50 人以上" },
];

/** Checkbox values arrive as arrays, comma strings, or JSON strings. */
export function toCodeList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  if (raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch { /* fall through to comma split */ }
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function facilityLabel(options: FacilityOption[], code: string, isZh: boolean): string {
  const hit = options.find((o) => o.code === String(code));
  return hit ? (isZh ? hit.zh : hit.en) : String(code);
}

export function facilityLabels(options: FacilityOption[], value: unknown, isZh: boolean): string[] {
  return toCodeList(value).map((code) => facilityLabel(options, code, isZh));
}
