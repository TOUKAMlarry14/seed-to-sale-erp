import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/contexts/I18nContext";
import { Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

const deliveries = [
  { id: "L-201", client: "Restaurant Le Plateau", adresse: "Rue de la Joie, Douala", statut: "en_attente", heure: "08:30" },
  { id: "L-202", client: "Supermarché Akwa", adresse: "Bd de la Liberté, Douala", statut: "en_cours", heure: "10:00" },
  { id: "L-203", client: "Épicerie Bonabéri", adresse: "Carrefour Bonabéri", statut: "en_attente", heure: "11:30" },
  { id: "L-204", client: "Hôtel Sawa", adresse: "Bd du 20 Mai, Douala", statut: "livre", heure: "14:00" },
];

export default function LivreurDashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t("dashboard.livreur_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.livreur_subtitle")} — {new Date().toLocaleDateString("fr-FR")}</p>
      </div>
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Truck className="h-5 w-5 text-primary" />
            <div><p className="text-lg font-heading font-bold">{deliveries.length}</p><p className="text-[10px] text-muted-foreground">{t("dashboard.total_day")}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning" />
            <div><p className="text-lg font-heading font-bold">{deliveries.filter(d => d.statut !== "livre").length}</p><p className="text-[10px] text-muted-foreground">{t("status.en_attente")}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <div><p className="text-lg font-heading font-bold">{deliveries.filter(d => d.statut === "livre").length}</p><p className="text-[10px] text-muted-foreground">{t("dashboard.delivered_count")}</p></div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        {deliveries.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-heading font-bold">{d.id}</span>
                  <StatusBadge status={d.statut} />
                </div>
                <span className="text-xs text-muted-foreground">{d.heure}</span>
              </div>
              <p className="text-sm font-medium">{d.client}</p>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <MapPin className="h-3 w-3" /><span className="text-xs">{d.adresse}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
