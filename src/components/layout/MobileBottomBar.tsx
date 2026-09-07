import { useEffect, useMemo, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Link, useLocation } from "react-router-dom";
import { useSite } from "@/contexts/SiteContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/use-care-data";
import { useTranslation } from "react-i18next";
import {
  Heart as HeartIcon,
  Users,
  LayoutDashboard,
  Inbox,
  LayoutGrid,
  BookOpen,
  Search,
  CalendarDays,
  MapPin,
  Bot,
  Building2,
  MessageSquare,
  Newspaper,
  UserPlus,
  Briefcase,
  ClipboardList,
  Settings2,
  HeartHandshake,
  ShieldCheck,
  Smile,
  Brain,
  HandHeart,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AICompanionChatDialog } from "@/components/ai/AICompanionChatDialog";
import { Switch } from "@/components/ui/switch";
import { useStandaloneMode } from "@/hooks/useStandaloneMode";
import { aiBrand } from "../../../supabase/functions/_shared/ai-prompts";

type ToolItem = {
  id: string;
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
};

type Group = { id: string; label: string; items: ToolItem[] };

const PREFS_KEY = "bottom-bar-prefs-v1";
type Prefs = { hidden: string[]; defaultFindTab: "care" | "work" };

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { hidden: [], defaultFindTab: "care" };
    const p = JSON.parse(raw);
    return {
      hidden: Array.isArray(p.hidden) ? p.hidden : [],
      defaultFindTab: p.defaultFindTab === "work" ? "work" : "care",
    };
  } catch {
    return { hidden: [], defaultFindTab: "care" };
  }
}
function savePrefs(p: Prefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch {}
}

export function MobileBottomBar() {
  const site = useSite();
  const { isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const isStandalone = useStandaloneMode();
  const { data: notifications } = useNotifications();
  const unreadCount = (notifications || []).filter((n) => !n.is_read).length;
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const [findTab, setFindTab] = useState<"care" | "work">(prefs.defaultFindTab);
  const location = useLocation();

  useEffect(() => { setFindTab(prefs.defaultFindTab); }, [prefs.defaultFindTab]);

  const isChallenged = site.family === "challenged";
  // challenged-v1 is the early-launch trim: search-only, no Resources & Help.
  const isV1 = site.id === "challenged-v1";
  const moreActive = open;

  const careGroupLabel = isChinese
    ? (isChallenged ? "护理群组" : "照护小组")
    : (isChallenged ? "Care Teams" : site.navLabels.careGroups);

  // The four fixed tabs come from src/config/nav.ts (one navigation list).
  const items = buildBottomTabs({ site, t, isChinese });

  const moreLabel = isChinese ? "工具" : "More";

  const openAi = () => { setOpen(false); setAiOpen(true); };

  // ── Build tool item registry ──
  const findCareItems: ToolItem[] = isChallenged
    ? [
        { id: "find-care", title: isChinese ? "找护理者" : "Hire Caregivers", url: "/search?service_category=care", icon: Search },
        { id: "find-local-comp", title: isChinese ? "本地陪伴" : "Local Companion", url: "/search?service_type=local&service_category=companionship", icon: HeartIcon },
        { id: "find-remote-comp", title: isChinese ? "远程陪伴" : "Remote Companion", url: "/search?service_type=remote&service_category=companionship", icon: MessageSquare },
        { id: "find-facilities", title: isChinese ? "养老机构" : "Facilities", url: "/search?service_category=facility", icon: Building2 },
      ]
    : [
        { id: "find-care", title: isChinese ? "找护理者" : "Hire Caregivers", url: "/search", icon: Search },
        { id: "find-facilities", title: isChinese ? "养老机构" : "Facilities", url: "/search?service_category=facility", icon: Building2 },
      ];

  const findWorkItems: ToolItem[] = [
    { id: "shared-tasks", title: isChinese ? "需要帮手的任务" : "Tasks Needing Help", url: "/shared-tasks", icon: HeartHandshake },
    { id: "work-become", title: isChinese ? "成为护理者" : "Become Caregiver", url: "/become-caregiver", icon: UserPlus },
    { id: "work-provider", title: isChinese ? "护理者面板" : "Caregiver Dashboard", url: "/provider-dashboard", icon: LayoutDashboard },
  ];

  const dailyCareItems: ToolItem[] = isChallenged
    ? [
        { id: "daily-calendar", title: isChinese ? "日历" : "Calendar", url: "/calendar", icon: CalendarDays },
        { id: "daily-bookings", title: isChinese ? "预约" : "Bookings", url: "/bookings", icon: ClipboardList },
        { id: "daily-gps", title: isChinese ? "定位" : "GPS", url: "/gps-tracking", icon: MapPin },
        { id: "daily-ai", title: aiBrand(isChinese ? "zh" : "en"), icon: Bot, onClick: openAi },
      ]
    : [
        { id: "daily-bookings", title: isChinese ? "预约" : "Bookings", url: "/bookings", icon: ClipboardList },
        { id: "daily-gps", title: isChinese ? "定位" : "GPS", url: "/gps-tracking", icon: MapPin },
        { id: "daily-ai", title: isChinese ? "AI 助手" : "AI Assistant", icon: Bot, onClick: openAi },
      ];

  const resourceItems: ToolItem[] = isChallenged && !isV1
    ? [
        { id: "community-resources", title: isChinese ? "资源与帮助" : "Resources & Help", url: "/resources", icon: BookOpen },
        { id: "res-cared", title: isChinese ? "护理篇" : "CareD", url: "/care-guides", icon: HeartHandshake },
        { id: "res-safed", title: isChinese ? "安全篇" : "SafeD", url: "/safety-guides", icon: ShieldCheck },
        { id: "res-coped", title: isChinese ? "应对篇" : "CopeD", url: "/coping", icon: Smile },
        { id: "res-awared", title: isChinese ? "认知篇" : "AwareD", url: "/aware", icon: Brain },
        { id: "res-accompd", title: isChinese ? "陪伴篇" : "AccompanieD", url: "/accompanied", icon: HandHeart },
      ]
    : [];

  const communityItems: ToolItem[] = isChallenged
    ? [{ id: "community-community", title: isChinese ? "社区" : "Community", url: "/community", icon: Newspaper }]
    : [];

  // Filter by user prefs
  const visible = (arr: ToolItem[]) => arr.filter((t) => !prefs.hidden.includes(t.id));

  // ── Render ──
  const renderToolButton = (tool: ToolItem) => {
    const cls = "flex flex-col items-center justify-start gap-1.5 p-2 rounded-xl hover:bg-accent transition-colors text-center min-h-[72px]";
    const inner = (
      <>
        <div className="h-10 w-10 rounded-xl bg-accent/60 flex items-center justify-center text-foreground">
          <tool.icon className="h-5 w-5" />
        </div>
        <span className="text-[10px] leading-tight line-clamp-2">{tool.title}</span>
      </>
    );
    if (tool.onClick) {
      return (
        <button key={tool.id} type="button" onClick={() => { setOpen(false); tool.onClick!(); }} className={cls}>
          {inner}
        </button>
      );
    }
    return (
      <Link key={tool.id} to={tool.url!} onClick={() => setOpen(false)} className={cls}>
        {inner}
      </Link>
    );
  };

  const findActive = findTab === "care" ? visible(findCareItems) : visible(findWorkItems);

  // All items for customization list
  const allGroups: Group[] = [
    { id: "daily", label: isChinese ? "日常照护" : "Daily Care", items: dailyCareItems },
    { id: "resources", label: isChinese ? "资源与帮助" : "Resources & Help", items: resourceItems },
    { id: "find-care", label: isChinese ? "寻找护理服务" : "Find Care", items: findCareItems },
    { id: "find-work", label: isChinese ? "寻找护理工作" : "Find Work", items: findWorkItems },
    { id: "community", label: isChinese ? "社区" : "Community", items: communityItems },
  ].filter((g) => g.items.length > 0);

  const togglePref = (id: string, show: boolean) => {
    setPrefs((prev) => {
      const next: Prefs = {
        ...prev,
        hidden: show ? prev.hidden.filter((x) => x !== id) : Array.from(new Set([...prev.hidden, id])),
      };
      savePrefs(next);
      return next;
    });
  };
  const setDefaultTab = (tab: "care" | "work") => {
    setPrefs((prev) => {
      const next = { ...prev, defaultFindTab: tab };
      savePrefs(next);
      return next;
    });
  };

  // Hide on marketing surfaces for unauthenticated visitors; once signed in,
  // always show the bottom bar on mobile (browser or installed PWA).
  if (!isAuthenticated) return null;

  return (
    <>
      <nav data-bottom-nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex items-center justify-around h-14 px-1">
        {items.map((item) => {
          const showBadge = item.url === "/inbox" && unreadCount > 0;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/dashboard"}
              className="relative flex flex-col items-center gap-0.5 px-2 py-1 text-muted-foreground transition-colors min-w-0"
              activeClassName="text-primary"
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-coral text-coral-foreground text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight truncate">{item.title}</span>
            </NavLink>
          );
        })}

        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Trigger asChild>
            <button
              type="button"
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1 transition-colors min-w-0 ${
                moreActive ? "text-primary" : "text-muted-foreground"
              }`}
              aria-label={moreLabel}
            >
              <LayoutGrid className="h-5 w-5" />
              <span className="text-[10px] leading-tight truncate">{moreLabel}</span>
            </button>
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Content
              onInteractOutside={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('[data-bottom-nav]')) e.preventDefault();
              }}
              className="fixed inset-x-0 bottom-14 z-50 rounded-t-2xl bg-background shadow-lg border-t max-h-[75vh] overflow-y-auto p-0"
            >
              <div className="flex items-center justify-between p-4 pb-2">
                <DialogPrimitive.Title className="text-base font-semibold">
                  {moreLabel}
                </DialogPrimitive.Title>
                <button
                  type="button"
                  onClick={() => setCustomizeOpen(true)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  {isChinese ? "自定义" : "Customize"}
                </button>
              </div>

              <div className="px-4 pb-6 space-y-5">
                {/* Daily Care */}
                {visible(dailyCareItems).length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                      {isChinese ? "日常照护" : "Daily Care"}
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {visible(dailyCareItems).map(renderToolButton)}
                    </div>
                  </div>
                )}

                {/* Resources & Help */}
                {visible(resourceItems).length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                      {isChinese ? "资源与帮助" : "Resources & Help"}
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {visible(resourceItems).map(renderToolButton)}
                    </div>
                  </div>
                )}

                {/* Find tab (Find Care / Find Work) */}
                {(visible(findCareItems).length > 0 || visible(findWorkItems).length > 0) && (
                  <div>
                    <div className="flex items-center gap-1 mb-3 p-1 bg-muted/60 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setFindTab("care")}
                        className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${
                          findTab === "care" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                        }`}
                      >
                        {isChinese ? "寻找护理服务" : "Find Care"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFindTab("work")}
                        className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${
                          findTab === "work" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                        }`}
                      >
                        {isChinese ? "寻找护理工作" : "Find Work"}
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {findActive.map(renderToolButton)}
                    </div>
                  </div>
                )}

                {/* Community */}
                {visible(communityItems).length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                      {isChinese ? "社区" : "Community"}
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {visible(communityItems).map(renderToolButton)}
                    </div>
                  </div>
                )}
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </nav>

      {/* Customize sheet */}
      <DialogPrimitive.Root open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/40" />
          <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-[60] rounded-t-2xl bg-background shadow-2xl border-t max-h-[85vh] overflow-y-auto">
            <div className="p-4 border-b">
              <DialogPrimitive.Title className="text-base font-semibold">
                {isChinese ? "自定义工具" : "Customize Tools"}
              </DialogPrimitive.Title>
              <p className="text-xs text-muted-foreground mt-1">
                {isChinese ? "选择要显示的项目；在分组右侧勾选默认显示" : "Pick which items show; mark default with the checkbox"}
              </p>
            </div>

            <div className="p-4 space-y-5">
              {/* Item toggles */}
              {allGroups.map((g) => {
                const isFindCare = g.id === "find-care";
                const isFindWork = g.id === "find-work";
                const isFindGroup = isFindCare || isFindWork;
                const isDefault =
                  (isFindCare && prefs.defaultFindTab === "care") ||
                  (isFindWork && prefs.defaultFindTab === "work");
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {g.label}
                      </h3>
                      {isFindGroup && (
                        <button
                          type="button"
                          onClick={() => setDefaultTab(isFindCare ? "care" : "work")}
                          className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors ${
                            isDefault
                              ? "bg-primary/10 text-primary border-primary/40"
                              : "bg-card text-muted-foreground border-border hover:text-foreground"
                          }`}
                          aria-pressed={isDefault}
                        >
                          <span
                            className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm border ${
                              isDefault ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/50"
                            }`}
                          >
                            {isDefault && <span className="text-[10px] leading-none">✓</span>}
                          </span>
                          {isChinese ? "设为默认" : "Set default"}
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {g.items.map((t) => {
                        const shown = !prefs.hidden.includes(t.id);
                        return (
                          <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
                            <div className="flex items-center gap-2 min-w-0">
                              <t.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm truncate">{t.title}</span>
                            </div>
                            <Switch checked={shown} onCheckedChange={(v) => togglePref(t.id, v)} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* AI FAB is owned by <DementiaAssistant /> on the dashboard for challenged sites.
          For non-challenged sites (or non-dashboard surfaces) we expose the chat via
          the "工具/More" drawer instead, to avoid two stacked floating buttons. */}
      {isAuthenticated && !isChallenged && (
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          aria-label={isChinese ? "AI 助手" : "AI Assistant"}
          className="fixed right-4 bottom-20 md:bottom-6 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        >
          <Bot className="h-5 w-5" />
        </button>
      )}

      <AICompanionChatDialog open={aiOpen} onOpenChange={setAiOpen} />
    </>
  );
}
