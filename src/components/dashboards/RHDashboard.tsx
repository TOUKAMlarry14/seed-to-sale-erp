import { Card, CardContent } from "@/components/ui/card";
import { CURRENCY } from "@/lib/constants";
import { useTranslation } from "@/contexts/I18nContext";
import { Users, CalendarCheck, Wallet, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function RHDashboard() {
  const { t } = useTranslation();

  const kpis = [
    { label: t("dashboard.present_today"), value: "18 / 22", icon: Users, color: "text-success" },
    { label: t("dashboard.ongoing_leaves"), value: "2", icon: CalendarCheck, color: "text-warning" },
    { label: t("dashboard.payroll_total"), value: `3 100 000 ${CURRENCY}`, icon: Wallet, color: "text-primary" },
    { label: t("dashboard.presence_rate"), value: "82%", icon: TrendingUp, color: "text-primary" },
  ];

  const presenceData = [
    { semaine: "S1", taux: 90 }, { semaine: "S2", taux: 85 }, { semaine: "S3", taux: 78 }, { semaine: "S4", taux: 82 },
  ];

  const conges = [
    { nom: "Jean-Pierre Nkomo", debut: "25 Mar", fin: "28 Mar", statut: t("dashboard.pending") },
    { nom: "Marie Fotso", debut: "01 Avr", fin: "05 Avr", statut: t("dashboard.approved") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t("dashboard.rh_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.rh_subtitle")}</p>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <kpi.icon className={`h-4 w-4 ${kpi.color} mb-2`} />
              <p className="text-lg font-heading font-bold">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.weekly_presence")}</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={presenceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="semaine" tick={{ fill: 'hsl(215, 16%, 47%)' }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'hsl(215, 16%, 47%)' }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="taux" fill="hsl(148, 58%, 26%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.leaves_pending")}</p>
            <div className="space-y-3">
              {conges.map((c) => (
                <div key={c.nom} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <div>
                    <p className="text-sm font-medium">{c.nom}</p>
                    <p className="text-xs text-muted-foreground">{c.debut} — {c.fin}</p>
                  </div>
                  <span className={`text-xs font-semibold ${c.statut === t("dashboard.pending") ? "text-warning" : "text-success"}`}>{c.statut}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
