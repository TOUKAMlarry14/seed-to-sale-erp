import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { resetOnboardingTour } from "@/components/OnboardingTour";
import { Loader2, Moon, Sun, Globe, RotateCcw } from "lucide-react";

export function Parametres() {
  const { profile, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, setLang } = useTranslation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async () => {
    if (password.length < 6) {
      toast({ title: t("error.generic"), description: t("settings.pw_min_6"), variant: "destructive" });
      return;
    }
    if (password !== confirmPw) {
      toast({ title: t("error.generic"), description: t("settings.pw_mismatch"), variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast({ title: t("error.generic"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("settings.pw_success") });
      setPassword("");
      setConfirmPw("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">{t("settings.profile")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("settings.preferences")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("settings.notifications")}</TabsTrigger>
          <TabsTrigger value="support">{t("settings.support")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">{t("settings.personal_info")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>{t("settings.full_name")}</Label><Input value={profile?.full_name || ""} disabled className="bg-muted" /></div>
              <div><Label>{t("common.email")}</Label><Input value={user?.email || ""} disabled className="bg-muted" /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("settings.change_password")}</CardTitle>
              <CardDescription>{t("settings.change_password_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><Label>{t("settings.new_password")}</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div>
              <div><Label>{t("settings.confirm_pw")}</Label><Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" /></div>
              <Button onClick={handlePasswordChange} disabled={saving || !password}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}{t("settings.btn_change_pw")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("settings.theme_title")}</CardTitle>
              <CardDescription>{t("settings.theme_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span className="text-sm">{theme === "dark" ? t("theme.dark") : t("theme.light")}</span>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("settings.lang_title")}</CardTitle>
              <CardDescription>{t("settings.lang_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <div className="flex gap-2">
                  <Button variant={lang === "fr" ? "default" : "outline"} size="sm" onClick={() => setLang("fr")}>🇫🇷 {t("lang.fr")}</Button>
                  <Button variant={lang === "en" ? "default" : "outline"} size="sm" onClick={() => setLang("en")}>🇬🇧 {t("lang.en")}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("settings.notif_title")}</CardTitle>
              <CardDescription>{t("settings.notif_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: t("settings.low_stock_alert"), desc: t("settings.low_stock_desc") },
                { label: t("settings.unpaid_alert"), desc: t("settings.unpaid_desc") },
                { label: t("settings.new_order_alert"), desc: t("settings.new_order_desc") },
                { label: t("settings.late_delivery_alert"), desc: t("settings.late_delivery_desc") },
              ].map((notif, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{notif.label}</p><p className="text-xs text-muted-foreground">{notif.desc}</p></div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">{t("settings.faq_title")}</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="q1"><AccordionTrigger>{t("settings.faq_q1")}</AccordionTrigger><AccordionContent>{t("settings.faq_a1")}</AccordionContent></AccordionItem>
                <AccordionItem value="q2"><AccordionTrigger>{t("settings.faq_q2")}</AccordionTrigger><AccordionContent>{t("settings.faq_a2")}</AccordionContent></AccordionItem>
                <AccordionItem value="q3"><AccordionTrigger>{t("settings.faq_q3")}</AccordionTrigger><AccordionContent>{t("settings.faq_a3")}</AccordionContent></AccordionItem>
                <AccordionItem value="q4"><AccordionTrigger>{t("settings.faq_q4")}</AccordionTrigger><AccordionContent>{t("settings.faq_a4")}</AccordionContent></AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("settings.tour_title")}</CardTitle>
              <CardDescription>{t("settings.tour_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={resetOnboardingTour}><RotateCcw className="h-4 w-4 mr-2" />{t("settings.restart_tour")}</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">{t("settings.contact_title")}</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm">📧 support@agroconnect.cm</p>
              <p className="text-sm">📞 +237 6XX XXX XXX</p>
              <p className="text-sm">📍 Douala, Cameroun</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
