import { useAuth } from "@/hooks/useAuth";
import { getFilteredNavigation } from "@/lib/navigation";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { LogOut, ChevronRight } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";
import logoWhiteSrc from "@/assets/logo_agroconnect_blanc.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { roles, profile, signOut } = useAuth();
  const { state } = useSidebar();
  const { t } = useTranslation();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const sections = getFilteredNavigation(roles);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl bg-white/10 flex items-center justify-center shrink-0 overflow-hidden transition-all duration-200 ${collapsed ? "w-8 h-8" : "w-9 h-9"}`}>
            <img src={logoWhiteSrc} alt="AgroConnect" className={`object-contain ${collapsed ? "h-5 w-5" : "h-6 w-6"}`} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-heading font-bold text-sidebar-foreground text-sm tracking-tight">AgroConnect</span>
              <span className="text-[10px] text-sidebar-foreground/40 font-medium">ERP Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {sections.map((section) => (
          <SidebarGroup key={section.labelKey}>
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/30 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 mb-1">
                {t(section.labelKey)}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <NavLink
                          to={item.url}
                          end
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-150 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{t(item.titleKey)}</span>}
                          {!collapsed && isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {!collapsed && profile && (
          <div className="mb-2 px-3">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{profile.full_name || profile.email}</p>
            <p className="text-[10px] text-sidebar-foreground/40">{roles.map((r) => t(`role.${r}`)).join(", ")}</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-all duration-150">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="text-[13px]">{t("auth.logout")}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
