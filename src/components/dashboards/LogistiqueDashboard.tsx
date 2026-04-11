import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/contexts/I18nContext";
import { AlertTriangle, Package, Truck, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function LogistiqueDashboard() {
  const { t } = useTranslation();

  const kpis = [
    { label: t("dashboard.out_of_stock"), value: "4", icon: AlertTriangle, color: "text-destructive" },
    { label: t("dashboard.daily_deliveries"), value: "7", icon: Truck, color: "text-primary" },
    { label: t("dashboard.weekly_entries"), value: "12", icon: Package, color: "text-success" },
    { label: t("dashboard.delivery_rate"), value: "89%", icon: TrendingDown, color: "text-warning" },
  ];

  const stockEntries = [
    { jour: t("chart.day.mon"), entrees: 5 }, { jour: t("chart.day.tue"), entrees: 3 }, { jour: t("chart.day.wed"), entrees: 7 },
    { jour: t("chart.day.thu"), entrees: 2 }, { jour: t("chart.day.fri"), entrees: 4 },
  ];

  const restock = [
    { produit: "Huile de palme 5L", stock: 3, min: 20 },
    { produit: "Sucre 50kg", stock: 5, min: 15 },
    { produit: "Farine de blé 25kg", stock: 8, min: 20 },
    { produit: "Sel fin 1kg", stock: 12, min: 30 },
    { produit: "Lait concentré", stock: 6, min: 25 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t("dashboard.logistique_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.logistique_subtitle")}</p>
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
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.stock_entries_week")}</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stockEntries}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="jour" tick={{ fill: 'hsl(215, 16%, 47%)' }} />
                <YAxis tick={{ fill: 'hsl(215, 16%, 47%)' }} />
                <Tooltip />
                <Bar dataKey="entrees" fill="hsl(148, 58%, 26%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.top_restock")}</p>
            <div className="space-y-3">
              {restock.map((p) => (
                <div key={p.produit} className="flex items-center justify-between">
                  <span className="text-sm">{p.produit}</span>
                  <span className="text-xs text-destructive font-semibold">{p.stock} / {p.min}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
