import { NavLink } from "@/components/NavLink";
import { useSite } from "@/contexts/SiteContext";
import { useTranslation } from "react-i18next";
import { buildSidebarNav } from "@/config/nav";

/** Sidebar links come from src/config/nav.ts — the one navigation list. */
function useSidebarItems() {
  const site = useSite();
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  return buildSidebarNav({ site, t, isChinese });
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const sidebarItems = useSidebarItems();
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r bg-sidebar-background md:sticky md:top-0 md:h-[calc(100dvh-4rem)] md:overflow-y-auto">
        <nav className="flex flex-col gap-0.5 px-3 pb-3 pt-0">


          {sidebarItems.map((item) => (
            <NavLink
              key={item.url + item.title}
              to={item.url}
              end={item.url === "/dashboard"}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>

  );
}
