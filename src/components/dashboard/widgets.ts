import type { WidgetDef } from "./DashboardWidgetConfig";

/**
 * Master widget registry.
 * `roles` controls who sees the widget by default.
 *   "all" = everyone, "caregiver" = caregivers, "provider" = care providers, "caredOne" = cared ones
 */
export const WIDGET_REGISTRY: WidgetDef[] = [
  // ── Challenged-only (dementia) — visible to caregivers AND providers ──
  // NOTE: Several AI/clinical-flavoured widgets removed (cognitive stage selector,
  // symptom & behavior tracker, AI insights/care tips/daily summary) to avoid
  // implying medical assessment. The app provides companionship + logistics only.
  { id: "patient-summaries",   label: "Cared One Overview",       roles: ["caregiver", "provider"],  challengedOnly: true },
  { id: "daily-timeline",     label: "Today's Events",            roles: ["caregiver", "provider"],  challengedOnly: true },

  // ── Shared widgets ──
  { id: "ai-briefing",        label: "Today's Smart Briefing",     roles: ["all"] },
  { id: "stats",              label: "Stats Overview",             roles: ["all"] },
  
  { id: "upcoming-bookings",  label: "Upcoming Bookings",          roles: ["all"] },
  { id: "care-tasks",         label: "Care Tasks",                 roles: ["caregiver", "provider"] },
  { id: "community-feed",     label: "Community Feed",             roles: ["all"] },
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
