/**
 * Zone types for CCT 214 "Safe Zone" — dictionary a55.
 *
 * The dictionary defines exactly three zone types:
 *   b55 Safe | b56 Danger | b57 Custom
 *
 * The zone's name lives on the zone itself, in a57 "Zone name":
 *   - Safe / Danger  → a57 holds "Safe" / "Danger", notes go in a58.
 *   - Custom         → a57 holds the user's own zone name (unlimited types).
 *
 * a58 "Custom description" holds the zone's free-text note only; it must never
 * be used to smuggle a name. There are no custom-name slots on any profile CCT.
 */
import { T } from "@/integrations/wp-schema";

export const ZONE_TYPE = T.safeZone.opt.ZONE_TYPE;

/** Ordered list of the three dictionary zone-type codes. */
export const ZONE_TYPE_CODES = [
  ZONE_TYPE.SAFE,
  ZONE_TYPE.DANGER,
  ZONE_TYPE.CUSTOM,
] as const;

export type ZoneTypeCode = (typeof ZONE_TYPE_CODES)[number];

export function isDangerZone(code: string): boolean {
  return code === ZONE_TYPE.DANGER;
}

export function isSafeZone(code: string): boolean {
  return code === ZONE_TYPE.SAFE;
}

export function isCustomZone(code: string): boolean {
  return code === ZONE_TYPE.CUSTOM;
}

/**
 * Canonical value for a57 "Zone name".
 * Safe/Danger are fixed labels; Custom keeps whatever the user typed.
 */
export function zoneNameFor(code: string, customName?: string | null): string {
  if (code === ZONE_TYPE.SAFE) return "Safe";
  if (code === ZONE_TYPE.DANGER) return "Danger";
  const name = (customName || "").trim();
  if (!name) throw new Error("A custom zone requires a name");
  return name;
}

/** Display label for a zone: the stored a57 name, localized for Safe/Danger. */
export function zoneTypeLabel(code: string, zoneName: string | null | undefined, zh: boolean): string {
  if (code === ZONE_TYPE.SAFE) return zh ? "安全区域" : "Safe zone";
  if (code === ZONE_TYPE.DANGER) return zh ? "危险区域" : "Danger zone";
  const name = (zoneName || "").trim();
  if (name) return name;
  return zh ? "自定义区域" : "Custom zone";
}
