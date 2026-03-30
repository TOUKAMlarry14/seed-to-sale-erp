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
  const { lang, setLang } = useTranslation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async () => {
    if (password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit avoir au moins 6 caractères.", variant: "destructive" });
      return;
    }
    if (password !== confirmPw) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mot de passe modifié avec succès" });
      setPassword("");
      setConfirmPw("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Configuration de votre compte et de l'application</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil & Sécurité</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="support">Support & Aide</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Nom complet</Label>
                <Input value={profile?.full_name || ""} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Modifier le mot de passe</CardTitle>
              <CardDescription>Choisissez un nouveau mot de passe sécurisé</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Nouveau mot de passe</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <Label>Confirmer</Label>
                <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" />
              </div>
              <Button onClick={handlePasswordChange} disabled={saving || !password}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Changer le mot de passe
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thème</CardTitle>
              <CardDescription>Choisissez entre le mode clair et sombre</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span className="text-sm">{theme === "dark" ? "Mode sombre" : "Mode clair"}</span>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Langue</CardTitle>
              <CardDescription>Choisissez la langue de l'interface</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <div className="flex gap-2">
                  <Button variant={lang === "fr" ? "default" : "outline"} size="sm" onClick={() => setLang("fr")}>🇫🇷 Français</Button>
                  <Button variant={lang === "en" ? "default" : "outline"} size="sm" onClick={() => setLang("en")}>🇬🇧 English</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paramètres de notifications</CardTitle>
              <CardDescription>Configurez les alertes que vous souhaitez recevoir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Alertes stocks bas", desc: "Notification quand un produit atteint le seuil minimum" },
                { label: "Factures impayées", desc: "Alerte pour les factures non réglées depuis +7 jours" },
                { label: "Nouvelles commandes", desc: "Notification à chaque nouvelle commande reçue" },
                { label: "Livraisons en retard", desc: "Alerte quand une livraison dépasse la date prévue" },
              ].map((notif, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{notif.label}</p>
                    <p className="text-xs text-muted-foreground">{notif.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">FAQ — Questions fréquentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="q1">
                  <AccordionTrigger>Comment créer une commande ?</AccordionTrigger>
                  <AccordionContent>Rendez-vous dans le module Ventes → Commandes. Cliquez sur "Nouvelle commande", sélectionnez un client, ajoutez les produits et validez.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2">
                  <AccordionTrigger>Comment générer une fiche de paie ?</AccordionTrigger>
                  <AccordionContent>Allez dans RH → Paie. Cliquez sur "Fiche individuelle" pour un employé, ou "Générer tout le mois" pour l'ensemble. Le calcul CNPS (2.8%) et impôts est automatique.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="q3">
                  <AccordionTrigger>Comment suivre les stocks ?</AccordionTrigger>
                  <AccordionContent>Le module Stocks → Inventaire affiche l'état du stock en temps réel. Les produits en alerte sont signalés en rouge. Utilisez "Mouvement" pour enregistrer les entrées/sorties.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="q4">
                  <AccordionTrigger>Comment contacter le support ?</AccordionTrigger>
                  <AccordionContent>Envoyez un email à support@agroconnect.cm ou utilisez le chatbot IA (bouton vert en bas à droite) pour une aide immédiate.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visite guidée</CardTitle>
              <CardDescription>Relancez la présentation interactive de l'ERP</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={resetOnboardingTour}>
                <RotateCcw className="h-4 w-4 mr-2" />Relancer la visite guidée
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact support</CardTitle>
            </CardHeader>
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
