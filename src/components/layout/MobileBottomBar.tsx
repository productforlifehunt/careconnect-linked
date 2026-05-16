import { useState } from "react";
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
  ShoppingCart,
  Bot,
  Building2,
  MessageSquare,
  Newspaper,
  UserPlus,
  Briefcase,
  Star,
  ClipboardList,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AICompanionChatDialog } from "@/components/ai/AICompanionChatDialog";

type ToolItem = {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
};

export function MobileBottomBar() {
  const site = useSite();
  const { isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const { data: notifications } = useNotifications();
  const unreadCount = (notifications || []).filter((n) => !n.is_read).length;
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const location = useLocation();

  const isChallenged = site.family === "challenged";
  const moreActive = open;

  const caredOnesLabel = isChinese ? "亲人" : site.navLabels.caredOnes;
  const careGroupLabel = isChinese
    ? (isChallenged ? "团队" : "圈子")
    : site.navLabels.careGroups.split(" ")[0];

  const items = [
    { title: isChinese ? "首页" : "Home", url: "/dashboard", icon: LayoutDashboard },
    { title: caredOnesLabel, url: "/cared-ones", icon: HeartIcon },
    { title: careGroupLabel, url: "/care-circle", icon: Users },
    { title: isChinese ? "收件箱" : "Inbox", url: "/inbox", icon: Inbox },
  ];

  const moreLabel = isChinese ? "工具" : "More";

  // Tools — only meaningful entries; settings/notifications/profile already reachable elsewhere
  const groups: { label: string; items: ToolItem[] }[] = isChallenged
    ? [
        {
          label: isChinese ? "寻找服务" : "Find Care",
          items: [
            { title: isChinese ? "找护理者" : "Hire Caregivers", url: "/search?service_category=care", icon: Search },
            { title: isChinese ? "本地陪伴" : "Local Companion", url: "/search?service_type=local&service_category=companionship", icon: HeartIcon },
            { title: isChinese ? "远程陪伴" : "Remote Companion", url: "/search?service_type=remote&service_category=companionship", icon: MessageSquare },
            { title: isChinese ? "养老机构" : "Facilities", url: "/search?service_category=facility", icon: Building2 },
          ],
        },
        {
          label: isChinese ? "日常照护" : "Daily Care",
          items: [
            { title: isChinese ? "日历" : "Calendar", url: "/calendar", icon: CalendarDays },
            { title: isChinese ? "预约" : "Bookings", url: "/bookings", icon: ClipboardList },
            { title: isChinese ? "定位" : "GPS", url: "/gps-tracking", icon: MapPin },
            { title: isChinese ? "AI 小忆" : "AI Companion", icon: Bot, onClick: () => { setOpen(false); setAiOpen(true); } },
          ],
        },
        {
          label: isChinese ? "资源" : "Resources",
          items: [
            { title: isChinese ? "资源与帮助" : "Resources & Help", url: "/resources", icon: BookOpen },
          ],
        },
        {
          label: isChinese ? "社区" : "Community",
          items: [
            { title: isChinese ? "社区" : "Community", url: "/community", icon: Newspaper },
          ],
        },
      ]
    : [
        {
          label: isChinese ? "寻找服务" : "Find Care",
          items: [
            { title: isChinese ? "找护理者" : "Hire Caregivers", url: "/search", icon: Search },
            { title: isChinese ? "AI 助手" : "AI Companion", icon: Bot, onClick: () => { setOpen(false); setAiOpen(true); } },
          ],
        },
        {
          label: isChinese ? "日常照护" : "Daily Care",
          items: [
            { title: isChinese ? "日历" : "Calendar", url: "/calendar", icon: CalendarDays },
            { title: isChinese ? "预约" : "Bookings", url: "/bookings", icon: ClipboardList },
            { title: isChinese ? "定位" : "GPS", url: "/gps-tracking", icon: MapPin },
          ],
        },
        {
          label: isChinese ? "工作与社区" : "Work & Community",
          items: [
            { title: isChinese ? "工作机会" : "Jobs", url: "/jobs", icon: Briefcase },
            { title: isChinese ? "成为护理者" : "Become Caregiver", url: "/become-caregiver", icon: UserPlus },
            { title: isChinese ? "社区" : "Community", url: "/community", icon: Newspaper },
            { title: isChinese ? "文章" : "Articles", url: "/articles", icon: Newspaper },
          ],
        },
        {
          label: isChinese ? "我的" : "Mine",
          items: [
            { title: isChinese ? "服务商面板" : "Provider Dashboard", url: "/provider-dashboard", icon: LayoutDashboard },
          ],
        },
      ];

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
              <DialogPrimitive.Title className="text-base font-semibold p-4 pb-2">
                {moreLabel}
              </DialogPrimitive.Title>
              <div className="px-4 pb-6 space-y-4">
                {groups.map((group) =>
                  group.items.length === 0 ? null : (
                    <div key={group.label}>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                        {group.label}
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        {group.items.map((tool) => {
                          const cls = "flex flex-col items-center justify-start gap-1.5 p-2 rounded-xl hover:bg-accent transition-colors text-center min-h-[72px]";
                          const inner = (
                            <>
                              <div className="h-10 w-10 rounded-xl bg-accent/60 flex items-center justify-center text-foreground">
                                <tool.icon className="h-5 w-5" />
                              </div>
                              <span className="text-[10px] leading-tight line-clamp-2">
                                {tool.title}
                              </span>
                            </>
                          );
                          if (tool.onClick) {
                            return (
                              <button
                                key={tool.title}
                                type="button"
                                onClick={() => { setOpen(false); tool.onClick!(); }}
                                className={cls}
                              >
                                {inner}
                              </button>
                            );
                          }
                          return (
                            <Link
                              key={tool.url}
                              to={tool.url!}
                              onClick={() => setOpen(false)}
                              className={cls}
                            >
                              {inner}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </nav>
      <AICompanionChatDialog open={aiOpen} onOpenChange={setAiOpen} />
    </>
  );
}
