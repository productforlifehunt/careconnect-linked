import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import { buildAuthNav, buildPublicNav } from "@/config/nav";
import { Shield } from "lucide-react";


export function AppSidebar() {
  const { isAuthenticated } = useAuth();
  const site = useSite();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");

  // Single source of truth — same lists the header and drawer use.
  const publicItems = buildPublicNav({ site, t, isChinese, withHome: true });
  const authItems = buildAuthNav({ site, t, isChinese });


  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="pt-0">
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.browse")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicItems.map((item) => {
                const title = item.title;
                return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={title}>
                    <NavLink to={item.url} end={item.url === "/"} className="hover:bg-accent/50" activeClassName="bg-accent text-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAuthenticated && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("nav.myCare")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {authItems.map((item) => {
                  const title = item.title;
                  return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={title}>
                      <NavLink to={item.url} className="hover:bg-accent/50" activeClassName="bg-accent text-accent-foreground font-medium">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("nav.trustSafety")}>
                  <NavLink to="/trust-safety" className="hover:bg-accent/50" activeClassName="bg-accent text-accent-foreground font-medium">
                    <Shield className="h-4 w-4" />
                    {!collapsed && <span>{t("nav.trustSafety")}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
