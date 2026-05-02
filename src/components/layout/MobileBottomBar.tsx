import { NavLink } from "@/components/NavLink";
import { useSite } from "@/contexts/SiteContext";
import { useNotifications } from "@/hooks/use-care-data";
import { useTranslation } from "react-i18next";
import { Heart as HeartIcon, Users, LayoutDashboard, BookOpen, Inbox } from "lucide-react";

export function MobileBottomBar() {
  const site = useSite();
  const { i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const { data: notifications } = useNotifications();
  const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

  const items = [
    { title: "Home", url: "/dashboard", icon: LayoutDashboard },
    { title: site.navLabels.caredOnes, url: "/cared-ones", icon: HeartIcon },
    { title: site.navLabels.careGroups.split(" ")[0], url: "/care-circle", icon: Users },
    { title: isChinese ? "收件箱" : "Inbox", url: "/inbox", icon: Inbox },
    { title: "Resources", url: "/resources", icon: BookOpen },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex items-center justify-around h-14 px-1">
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
    </nav>
  );
}
