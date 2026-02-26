import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings2, GripVertical } from "lucide-react";
import { useSite } from "@/contexts/SiteContext";

export interface WidgetDef {
  id: string;
  label: string;
  /** Which roles can see this widget — empty = everyone */
  roles: ("caregiver" | "provider" | "caredOne" | "all")[];
  /** Only show on challenged site */
  challengedOnly?: boolean;
  /** Only show on default site */
  defaultOnly?: boolean;
}

const STORAGE_KEY = "dashboard-widget-prefs";

export function getWidgetPrefs(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setWidgetPrefs(prefs: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function isWidgetVisible(id: string, defaults: Record<string, boolean>): boolean {
  const prefs = getWidgetPrefs();
  return prefs[id] ?? defaults[id] ?? true;
}

interface Props {
  widgets: WidgetDef[];
  visibility: Record<string, boolean>;
  onChange: (id: string, visible: boolean) => void;
}

export function DashboardWidgetConfig({ widgets, visibility, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Customize</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Dashboard Widgets</SheetTitle>
        </SheetHeader>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Toggle widgets to personalize your dashboard view.
        </p>
        <div className="space-y-3">
          {widgets.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2 min-w-0">
                <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                <span className="text-sm font-medium truncate">{w.label}</span>
              </div>
              <Switch
                checked={visibility[w.id] ?? true}
                onCheckedChange={(checked) => onChange(w.id, checked)}
              />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
