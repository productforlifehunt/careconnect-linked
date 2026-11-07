export interface WidgetDef {
  id: string;
  label: string;
  roles: ("caregiver" | "provider" | "caredOne" | "all")[];
  challengedOnly?: boolean | undefined;
  defaultOnly?: boolean | undefined;
}

const VIS_KEY = "dashboard-widget-prefs";
const ORDER_KEY = "dashboard-widget-order";

export function getWidgetPrefs(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(VIS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function setWidgetPrefs(prefs: Record<string, boolean>) {
  try {
    localStorage.setItem(VIS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore unavailable local storage.
  }
}

export function getWidgetOrder(): string[] {
  try {
    return JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
  } catch {
    return [];
  }
}

export function setWidgetOrder(order: string[]) {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  } catch {
    // Ignore unavailable local storage.
  }
}

/** Merge saved order with available widgets (saved first, then new widgets). */
export function resolveOrder(
  available: WidgetDef[],
  saved: string[],
): string[] {
  const ids = available.map((widget) => widget.id);
  const filtered = saved.filter((id) => ids.includes(id));
  const missing = ids.filter((id) => !filtered.includes(id));
  return [...filtered, ...missing];
}

export function isWidgetVisible(
  id: string,
  defaults: Record<string, boolean>,
): boolean {
  return getWidgetPrefs()[id] ?? defaults[id] ?? true;
}
