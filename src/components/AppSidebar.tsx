import { useAuth } from "@/hooks/useAuth";
import { getFilteredNavigation } from "@/lib/navigation";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { LogOut, ChevronRight } from "lucide-react";
import logoWhiteSrc from "@/assets/logo_agroconnect_blanc.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { ROLE_LABELS } from "@/lib/constants";

export function AppSidebar() {
  const { roles, profile, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const sections = getFilteredNavigation(roles);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-full bg-white/15 flex items-center justify-center shrink-0 overflow-hidden ${collapsed ? "w-8 h-8" : "w-10 h-10"}`}>
            <img src={logoWhiteSrc} alt="AgroConnect" className={`object-contain ${collapsed ? "h-6 w-6" : "h-7 w-7"}`} />
          </div>
          {!collapsed && <span className="font-heading font-bold text-sidebar-foreground text-sm">AgroConnect</span>}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-widest font-medium">
                {section.label}
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
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                          {!collapsed && isActive && <ChevronRight className="ml-auto h-3 w-3" />}
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
          <div className="mb-2 px-2">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{profile.full_name || profile.email}</p>
            <p className="text-[10px] text-sidebar-foreground/50">{roles.map((r) => ROLE_LABELS[r]).join(", ")}</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Déconnexion</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
