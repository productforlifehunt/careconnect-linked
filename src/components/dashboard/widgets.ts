import type { WidgetDef } from "./DashboardWidgetConfig";

/**
 * Master widget registry.
 * `roles` controls who sees the widget by default.
 *   "all" = everyone, "caregiver" = caregivers, "provider" = care providers, "caredOne" = loved ones
 */
export const WIDGET_REGISTRY: WidgetDef[] = [
  // ── Challenged-only (dementia) — visible to caregivers AND providers ──
  { id: "emergency-sos",       label: "Emergency SOS",            roles: ["all"],                    challengedOnly: true },
  { id: "patient-summaries",   label: "Patient Summaries",        roles: ["caregiver", "provider"],  challengedOnly: true },
  { id: "dementia-stage",      label: "Cognitive Stage Selector",  roles: ["caregiver", "provider"], challengedOnly: true },
  { id: "ai-insights",        label: "AI Insights Panel",         roles: ["caregiver", "provider"],  challengedOnly: true },
  { id: "daily-timeline",     label: "Daily Timeline",            roles: ["caregiver", "provider"],  challengedOnly: true },
  { id: "symptom-tracker",    label: "Symptom & Behavior Tracker", roles: ["caregiver", "provider"], challengedOnly: true },
  { id: "caregiver-wellness", label: "Caregiver Wellness",         roles: ["caregiver", "provider"], challengedOnly: true },
  { id: "ai-daily-summary",   label: "AI Daily Summary",           roles: ["caregiver", "provider"], challengedOnly: true },
  { id: "ai-care-tips",       label: "AI Care Tips",               roles: ["caregiver", "provider"], challengedOnly: true },

  // ── Shared widgets ──
  { id: "stats",              label: "Stats Overview",             roles: ["all"] },
  { id: "upcoming-bookings",  label: "Upcoming Bookings",          roles: ["all"] },
  { id: "care-tasks",         label: "Care Tasks",                 roles: ["caregiver", "provider"] },
  { id: "quick-actions",      label: "Quick Actions",              roles: ["all"] },

  // ── Challenged-only footer ──
  { id: "dementia-assistant",  label: "AI Dementia Assistant",     roles: ["caregiver", "provider"], challengedOnly: true },
];

/** Filter widgets to those relevant for the current user & site */
export function getAvailableWidgets(
  isChallenged: boolean,
  userRole: "caregiver" | "provider" | "caredOne"
): WidgetDef[] {
  return WIDGET_REGISTRY.filter((w) => {
    if (w.challengedOnly && !isChallenged) return false;
    if (w.defaultOnly && isChallenged) return false;
    if (w.roles.includes("all")) return true;
    return w.roles.includes(userRole);
  });
}

/** Build default visibility map (all available = true) */
export function getDefaultVisibility(widgets: WidgetDef[]): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  widgets.forEach((w) => { map[w.id] = true; });
  return map;
}
