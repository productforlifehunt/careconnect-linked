import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

/** Standard three colours the dictionary requires on every zone, plus extras. */
export const ZONE_COLOR_PRESETS = [
  "#10B981", // green — safe
  "#EF4444", // red — danger
  "#3B82F6", // blue — custom
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#0EA5E9",
  "#6B7280",
];

/** Default colour per dictionary zone type (a55): Safe green, Danger red, Custom blue. */
export function defaultZoneColor(typeCode: string, codes: { SAFE: string; DANGER: string }): string {
  if (typeCode === codes.DANGER) return "#EF4444";
  if (typeCode === codes.SAFE) return "#10B981";
  return "#3B82F6";
}

/** Colour any zone is actually painted with — its own colour wins (a59). */
export function zoneColorOf(zone: any, fallback: string): string {
  const c = typeof zone?.color === "string" ? zone.color.trim() : "";
  return /^#[0-9a-fA-F]{3,8}$/.test(c) ? c : fallback;
}

/** Colour chooser for CCT 214 a59 — used by every zone form. */
export function ZoneColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  return (
    <div className="space-y-1.5">
      <Label>{isCN ? "区域颜色" : "Zone colour"}</Label>
      <div className="flex flex-wrap items-center gap-2">
        {ZONE_COLOR_PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={c}
            onClick={() => onChange(c)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border"
            style={{ backgroundColor: c }}
          >
            {value?.toLowerCase() === c.toLowerCase() && <Check className="h-4 w-4 text-white" />}
          </button>
        ))}
        <input
          type="color"
          aria-label={isCN ? "自选颜色" : "Pick a colour"}
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#3B82F6"}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-10 cursor-pointer rounded border border-border bg-transparent p-0"
        />
      </div>
    </div>
  );
}
