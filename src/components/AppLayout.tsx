import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { NotificationsPopover } from "@/components/NotificationsPopover";
import { ChatbotFAB } from "@/components/ChatbotFAB";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function AppLayout() {
  const { profile, roles } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useTranslation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card/80 glass px-4 shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-accent transition-colors rounded-md" />
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              <h1 className="text-sm font-heading font-semibold text-foreground hidden sm:block tracking-tight">
                {t("app.name")}
              </h1>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent btn-press"
                onClick={toggleTheme}
                title={theme === "dark" ? t("theme.switch_light") : t("theme.switch_dark")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent btn-press"
                onClick={() => setLang(lang === "fr" ? "en" : "fr")}
                title={lang === "fr" ? t("lang.switch_en") : t("lang.switch_fr")}
              >
                <Globe className="h-4 w-4" />
              </Button>
              <NotificationsPopover />
              <Separator orientation="vertical" className="h-5 mx-1 hidden sm:block" />
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium leading-tight">{profile?.full_name || t("app.user")}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {roles.map((r) => t(`role.${r}`)).join(", ") || "—"}
                </p>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 pb-20">
            <Outlet />
          </main>
        </div>
      </div>
      <ChatbotFAB />
      <OnboardingTour />
    </SidebarProvider>
  );
}
