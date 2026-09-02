import { useEffect, useMemo, useRef, useState } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoreHorizontal, Check, GripVertical, ArrowUp, ArrowDown, ListOrdered, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface GroupTabDef {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface GroupTabsBarProps {
  tabs: GroupTabDef[];
  activeTab: string;
  onSelect: (value: string) => void;
  allLabel: string;
  isCN: boolean;
}

const ORDER_KEY = "careGroupTabOrder.v1";

function readSavedOrder(): string[] {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Long tab set handled the way mainstream apps do it: one horizontally
 * scrollable row that never wraps, the active tab auto-centres itself, and an
 * overflow menu that lists every tab. On top of that the user can drag their
 * own tab order — saved locally on this device only, no backend involved.
 */
export function GroupTabsBar({ tabs, activeTab, onSelect, allLabel, isCN }: GroupTabsBarProps) {
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<string[]>(() => readSavedOrder());
  const [reorderOpen, setReorderOpen] = useState(false);
  const dragFrom = useRef<number | null>(null);

  // Saved order first (only tabs that still exist), then any new tab appended.
  const orderedTabs = useMemo(() => {
    const byValue = new Map(tabs.map((t) => [t.value, t]));
    const picked: GroupTabDef[] = [];
    for (const v of order) {
      const t = byValue.get(v);
      if (t) { picked.push(t); byValue.delete(v); }
    }
    return [...picked, ...byValue.values()];
  }, [tabs, order]);

  const persist = (values: string[]) => {
    setOrder(values);
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(values)); } catch { /* device storage unavailable */ }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= orderedTabs.length || from === to) return;
    const next = orderedTabs.map((t) => t.value);
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    persist(next);
  };

  useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-tab-value="${activeTab}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeTab, orderedTabs]);

  return (
    <div className="sticky top-0 z-20 -mx-4 mb-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-2">
        <div ref={scrollerRef} className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="inline-flex h-auto w-max gap-1 bg-transparent p-0">
            {orderedTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-tab-value={tab.value}
                className="shrink-0 gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-full" aria-label={allLabel}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            collisionPadding={12}
            avoidCollisions
            className="w-60 overflow-y-auto"
            style={{ maxHeight: "var(--radix-dropdown-menu-content-available-height)" }}
          >
            {orderedTabs.map((tab) => (
              <DropdownMenuItem key={tab.value} onClick={() => onSelect(tab.value)} className="gap-2">
                <tab.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">{tab.label}</span>
                {activeTab === tab.value && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setReorderOpen(true)} className="gap-2">
              <ListOrdered className="h-3.5 w-3.5 shrink-0" />
              {Z("调整标签顺序", "Reorder tabs")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={reorderOpen} onOpenChange={setReorderOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{Z("调整标签顺序", "Reorder tabs")}</DialogTitle>
            <DialogDescription>
              {Z("拖动或用箭头把你最常用的标签排到前面。顺序只保存在这台设备上。", "Drag, or use the arrows, to move the tabs you use most to the front. The order is saved on this device only.")}
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-1.5">
            {orderedTabs.map((tab, index) => (
              <li
                key={tab.value}
                draggable
                onDragStart={() => { dragFrom.current = index; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (dragFrom.current !== null) move(dragFrom.current, index); dragFrom.current = null; }}
                onDragEnd={() => { dragFrom.current = null; }}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                <tab.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-sm">{tab.label}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} aria-label={Z("上移", "Move up")} onClick={() => move(index, index - 1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === orderedTabs.length - 1} aria-label={Z("下移", "Move down")} onClick={() => move(index, index + 1)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>

          <Button variant="outline" size="sm" className="w-full" onClick={() => persist([])}>
            <RotateCcw className="h-3.5 w-3.5 mr-2" /> {Z("恢复默认顺序", "Reset to default order")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
