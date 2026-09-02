import { useEffect, useRef } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Check } from "lucide-react";
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
}

/**
 * Standard pattern for a long tab set (Slack / GitHub / Notion):
 * one horizontally scrollable row that never wraps, the active tab is scrolled
 * into view automatically, and an always-visible "all tabs" overflow menu on
 * the right lets you jump straight to any tab without scrolling.
 */
export function GroupTabsBar({ tabs, activeTab, onSelect, allLabel }: GroupTabsBarProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-tab-value="${activeTab}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeTab]);

  return (
    <div className="sticky top-0 z-20 -mx-4 mb-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-2">
        <div ref={scrollerRef} className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="inline-flex h-auto w-max gap-1 bg-transparent p-0">
            {tabs.map((tab) => (
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
          <DropdownMenuContent align="end" className="max-h-[70vh] w-56 overflow-y-auto">
            {tabs.map((tab) => (
              <DropdownMenuItem key={tab.value} onClick={() => onSelect(tab.value)} className="gap-2">
                <tab.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">{tab.label}</span>
                {activeTab === tab.value && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
