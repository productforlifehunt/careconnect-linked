import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings2, GripVertical } from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface WidgetDef {
  id: string;
  label: string;
  roles: ("caregiver" | "provider" | "caredOne" | "all")[];
  challengedOnly?: boolean;
  defaultOnly?: boolean;
}

const VIS_KEY = "dashboard-widget-prefs";
const ORDER_KEY = "dashboard-widget-order";

export function getWidgetPrefs(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(VIS_KEY) || "{}"); } catch { return {}; }
}
export function setWidgetPrefs(prefs: Record<string, boolean>) {
  try { localStorage.setItem(VIS_KEY, JSON.stringify(prefs)); } catch {}
}

export function getWidgetOrder(): string[] {
  try { return JSON.parse(localStorage.getItem(ORDER_KEY) || "[]"); } catch { return []; }
}
export function setWidgetOrder(order: string[]) {
  try { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch {}
}

/** Merge saved order with available widgets (saved first, then any new widgets appended) */
export function resolveOrder(available: WidgetDef[], saved: string[]): string[] {
  const ids = available.map((w) => w.id);
  const filtered = saved.filter((id) => ids.includes(id));
  const missing = ids.filter((id) => !filtered.includes(id));
  return [...filtered, ...missing];
}

export function isWidgetVisible(id: string, defaults: Record<string, boolean>): boolean {
  const prefs = getWidgetPrefs();
  return prefs[id] ?? defaults[id] ?? true;
}

const ZH_WIDGET_LABELS: Record<string, string> = {
  "patient-summaries": "被护理者概览",
  "daily-timeline": "每日时间线",
  "stats": "统计概览",
  "quick-actions": "快捷操作",
  "upcoming-bookings": "即将到来的预约",
  "care-tasks": "护理任务",
  "community-feed": "社区动态",
  "dementia-assistant": "智能陪伴",
};
function localizeWidgetLabel(id: string, fallback: string, isZh: boolean): string {
  return isZh ? (ZH_WIDGET_LABELS[id] || fallback) : fallback;
}

interface SortableRowProps {
  widget: WidgetDef;
  checked: boolean;
  onToggle: (v: boolean) => void;
}

function SortableRow({ widget, checked, onToggle }: SortableRowProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: widget.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 touch-none"
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none p-1 -m-1"
          aria-label={isZh ? "拖动重新排序" : "Drag to reorder"}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-medium truncate">{widget.label}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}

interface Props {
  widgets: WidgetDef[];
  visibility: Record<string, boolean>;
  order: string[];
  onChange: (id: string, visible: boolean) => void;
  onReorder: (order: string[]) => void;
}

export function DashboardWidgetConfig({ widgets, visibility, order, onChange, onReorder }: Props) {
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const orderedWidgets = order
    .map((id) => widgets.find((w) => w.id === id))
    .filter((w): w is WidgetDef => !!w);

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = order.indexOf(String(active.id));
    const newIdx = order.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    onReorder(arrayMove(order, oldIdx, newIdx));
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">{isZh ? "自定义" : "Customize"}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>{isZh ? "面板小部件" : "Dashboard Widgets"}</SheetTitle>
        </SheetHeader>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          {isZh ? "拖动重新排序，点击开关显示或隐藏。" : "Drag to reorder. Toggle to show or hide."}
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {orderedWidgets.map((w) => (
                <SortableRow
                  key={w.id}
                  widget={{ ...w, label: localizeWidgetLabel(w.id, w.label, isZh) }}
                  checked={visibility[w.id] ?? true}
                  onToggle={(v) => onChange(w.id, v)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </SheetContent>
    </Sheet>
  );
}
