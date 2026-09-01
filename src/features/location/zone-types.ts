/**
 * Zone types for CCT 214 "Safe Zone" — dictionary a55.
 *
 * The dictionary defines exactly nine zone types:
 *   b55 Safe | b56 Danger | b57..b63 Custom 1..Custom 7
 *
 * CCT 214 has NO per-zone name column. A zone is labelled by its TYPE. The
 * seven custom type names are stored on the cared one's extended profile
 * (CCT 258 a95..a101) — one name per custom slot, shared by every zone of that
 * type. a58 "Custom description" holds the zone's own free-text description
 * only; it must never be used to smuggle a name.
 */
import { T, R } from "@/integrations/wp-schema";
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";

export const ZONE_TYPE = T.safeZone.opt.ZONE_TYPE;

/** Ordered list of the nine dictionary zone-type codes. */
export const ZONE_TYPE_CODES = [
  ZONE_TYPE.SAFE,
  ZONE_TYPE.DANGER,
  ZONE_TYPE.CUSTOM_1,
  ZONE_TYPE.CUSTOM_2,
  ZONE_TYPE.CUSTOM_3,
  ZONE_TYPE.CUSTOM_4,
  ZONE_TYPE.CUSTOM_5,
  ZONE_TYPE.CUSTOM_6,
  ZONE_TYPE.CUSTOM_7,
] as const;

export type ZoneTypeCode = (typeof ZONE_TYPE_CODES)[number];

/** CCT 258 field holding each custom slot's name, in slot order 1..7. */
export const CUSTOM_ZONE_NAME_FIELDS = [
  T.userProfile2.f.CARED_ONE_S_CUSTOM_ZONE_1_NAME,
  T.userProfile2.f.CARED_ONE_S_CUSTOM_ZONE_2_NAME,
  T.userProfile2.f.CARED_ONE_S_CUSTOM_ZONE_3_NAME,
  T.userProfile2.f.CARED_ONE_S_CUSTOM_ZONE_4_NAME,
  T.userProfile2.f.CARED_ONE_S_CUSTOM_ZONE_5_NAME,
  T.userProfile2.f.CARED_ONE_S_CUSTOM_ZONE_6_NAME,
  T.userProfile2.f.CARED_ONE_S_CUSTOM_ZONE_7_NAME,
] as const;

/** 1-based custom slot for a zone type code, or 0 for Safe/Danger. */
export function customSlotOf(code: string): number {
  const idx = ZONE_TYPE_CODES.indexOf(code as ZoneTypeCode);
  return idx >= 2 ? idx - 1 : 0;
}

export function isDangerZone(code: string): boolean {
  return code === ZONE_TYPE.DANGER;
}

export function isSafeZone(code: string): boolean {
  return code === ZONE_TYPE.SAFE;
}

/** Custom slot names for one cared one, indexed 1..7 (index 0 unused). */
export type CustomZoneNames = Record<number, string>;

function normalizeWpUserId(id: string | number): number {
  return Number(String(id).replace(/^wp-/, ""));
}

/** Row id of a given user's CCT 258 profile row over Relation 259, or null. */
async function findProfile2RowId(userId: string | number): Promise<string | null> {
  const parent = normalizeWpUserId(userId);
  if (!parent) throw new Error("Invalid user id for extended profile lookup");
  const rels = await wordpressFetch<any[]>(`jet-rel/${R.userProfile2Rel}/children/${parent}`);
  if (!Array.isArray(rels)) throw new Error(`Relation ${R.userProfile2Rel} returned an invalid response`);
  const childId = rels[0]?.child_object_id;
  return childId ? String(childId) : null;
}

/** Reads the seven custom zone-type names from the cared one's CCT 258 row. */
export async function fetchCustomZoneNames(userId: string | number): Promise<CustomZoneNames> {
  const rowId = await findProfile2RowId(userId);
  const out: CustomZoneNames = {};
  if (!rowId) return out;
  const row = await wordpressCCTFetch<any>(T.userProfile2.slug, { id: rowId });
  CUSTOM_ZONE_NAME_FIELDS.forEach((field, i) => {
    const value = row?.[field];
    if (typeof value === "string" && value.trim()) out[i + 1] = value.trim();
  });
  return out;
}

/**
 * Writes one custom zone-type name onto the cared one's CCT 258 row.
 * The row must already exist — it is created with the profile, never here.
 */
export async function setCustomZoneName(userId: string | number, slot: number, name: string): Promise<void> {
  if (slot < 1 || slot > 7) throw new Error(`Invalid custom zone slot: ${slot}`);
  const rowId = await findProfile2RowId(userId);
  if (!rowId) throw new Error("This person has no extended profile row yet — custom zone names cannot be saved");
  await wordpressCCTFetch(T.userProfile2.slug, {
    id: rowId,
    method: "PUT",
    body: { [CUSTOM_ZONE_NAME_FIELDS[slot - 1]]: name },
  });
}

/** Display label for a zone type code, using the cared one's custom names. */
export function zoneTypeLabel(
  code: string,
  customNames: CustomZoneNames | undefined,
  zh: boolean,
): string {
  if (code === ZONE_TYPE.SAFE) return zh ? "安全区域" : "Safe zone";
  if (code === ZONE_TYPE.DANGER) return zh ? "危险区域" : "Danger zone";
  const slot = customSlotOf(code);
  if (!slot) return zh ? "未知区域类型" : "Unknown zone type";
  const custom = customNames?.[slot];
  if (custom) return custom;
  return zh ? `自定义区域 ${slot}` : `Custom zone ${slot}`;
}
