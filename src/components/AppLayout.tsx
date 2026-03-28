import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/lib/constants";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout() {
  const { profile, roles } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-sm font-heading font-semibold text-foreground hidden sm:block">
                AgroConnect ERP
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-destructive rounded-full text-[8px] text-destructive-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium">{profile?.full_name || "Utilisateur"}</p>
                <p className="text-[10px] text-muted-foreground">
                  {roles.map((r) => ROLE_LABELS[r]).join(", ") || "—"}
                </p>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
