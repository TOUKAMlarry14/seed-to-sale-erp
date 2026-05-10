import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CURRENCY } from "@/lib/constants";
import { useTranslation } from "@/contexts/I18nContext";
import { ShoppingCart, FileText, Users, TrendingUp } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DateRangeFilter, type DateRangePreset } from "@/components/DateRangeFilter";

const COLORS = ["hsl(214, 89%, 34%)", "hsl(148, 58%, 26%)", "hsl(38, 92%, 50%)", "hsl(4, 84%, 47%)", "hsl(215, 16%, 47%)"];

const topProducts = [
  { name: "Riz parfumé 25kg", value: 85 }, { name: "Huile de palme 5L", value: 62 },
  { name: "Sucre en poudre 50kg", value: 45 }, { name: "Farine de blé 25kg", value: 38 }, { name: "Sel fin 1kg", value: 30 },
];

const weeklyOrders = [
  { semaine: "S1", commandes: 45 }, { semaine: "S2", commandes: 52 }, { semaine: "S3", commandes: 48 }, { semaine: "S4", commandes: 61 },
];

export default function CommercialDashboard() {
  const { t } = useTranslation();
  const [range, setRange] = useState<DateRangePreset>("month");
  const filteredWeeklyOrders = useMemo(() => {
    if (range === "day") return weeklyOrders.slice(-1);
    if (range === "week") return weeklyOrders.slice(-1);
    if (range === "month") return weeklyOrders;
    if (range === "year") return weeklyOrders;
    return weeklyOrders;
  }, [range]);
  const kpis = [
    { label: t("dashboard.daily_orders"), value: "23", icon: ShoppingCart, color: "text-primary" },
    { label: t("dashboard.monthly_revenue"), value: `12 450 000 ${CURRENCY}`, icon: TrendingUp, color: "text-success" },
    { label: t("reporting.unpaid_invoices"), value: "8", icon: FileText, color: "text-destructive" },
    { label: t("dashboard.active_clients"), value: "47", icon: Users, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t("dashboard.commercial_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.commercial_subtitle")}</p>
      </div>
      <DateRangeFilter value={range} onChange={setRange} />
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
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.weekly_orders")}</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredWeeklyOrders}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="semaine" tick={{ fill: 'hsl(215, 16%, 47%)' }} />
                <YAxis tick={{ fill: 'hsl(215, 16%, 47%)' }} />
                <Tooltip />
                <Bar dataKey="commandes" fill="hsl(148, 58%, 26%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.top_products")}</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={topProducts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false} className="text-[9px]">
                  {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
