import { Card, CardContent } from "@/components/ui/card";
import { CURRENCY } from "@/lib/constants";
import { TodoWidget } from "@/components/TodoWidget";
import { useTranslation } from "@/contexts/I18nContext";
import { TrendingUp, ShoppingCart, Wallet, AlertTriangle, Truck, Users } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["hsl(214, 89%, 34%)", "hsl(148, 58%, 26%)", "hsl(38, 92%, 50%)", "hsl(4, 84%, 47%)", "hsl(215, 16%, 47%)"];
const formatCFA = (v: number) => `${(v / 1000000).toFixed(1)}M`;

export default function AdminDashboard() {
  const { t } = useTranslation();

  const kpis = [
    { label: t("dashboard.monthly_revenue"), value: "12 450 000", suffix: CURRENCY, icon: TrendingUp, trend: "+8.2%", color: "text-primary" },
    { label: t("dashboard.daily_orders"), value: "23", suffix: "", icon: ShoppingCart, trend: "+3", color: "text-primary" },
    { label: t("dashboard.cash_balance"), value: "8 320 000", suffix: CURRENCY, icon: Wallet, trend: "+2.1%", color: "text-success" },
    { label: t("dashboard.stock_alerts"), value: "4", suffix: t("dashboard.products"), icon: AlertTriangle, trend: "", color: "text-destructive" },
    { label: t("dashboard.daily_deliveries"), value: "7", suffix: "", icon: Truck, trend: `2 ${t("dashboard.late")}`, color: "text-warning" },
    { label: t("dashboard.employees_present"), value: "18/22", suffix: "", icon: Users, trend: "82%", color: "text-primary" },
  ];

  const caData = [
    { mois: t("chart.month.oct"), ca: 9200000 }, { mois: t("chart.month.nov"), ca: 10500000 }, { mois: t("chart.month.dec"), ca: 11800000 },
    { mois: t("chart.month.jan"), ca: 10200000 }, { mois: t("chart.month.feb"), ca: 11400000 }, { mois: t("chart.month.mar"), ca: 12450000 },
  ];
  const commandesData = [
    { semaine: "S1", commandes: 45 }, { semaine: "S2", commandes: 52 }, { semaine: "S3", commandes: 48 }, { semaine: "S4", commandes: 61 },
  ];
  const depensesData = [
    { name: t("chart.purchases"), value: 5200000 }, { name: t("chart.salaries"), value: 3100000 }, { name: t("chart.transport"), value: 1400000 },
    { name: t("chart.rent"), value: 800000 }, { name: t("chart.other"), value: 600000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                {kpi.trend && <span className="text-[10px] text-muted-foreground">{kpi.trend}</span>}
              </div>
              <p className="text-lg font-heading font-bold leading-tight">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.suffix ? `${kpi.suffix} — ` : ""}{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.revenue_chart")}</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={caData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mois" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <YAxis tickFormatter={formatCFA} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} ${CURRENCY}`, t("dashboard.revenue")]} />
                <Line type="monotone" dataKey="ca" stroke="hsl(214, 89%, 34%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(214, 89%, 34%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.expenses_chart")}</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={depensesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} className="text-[9px]">
                  {depensesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} ${CURRENCY}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.orders_chart")}</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={commandesData}>
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
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.alerts_title")}</p>
            <div className="space-y-2">
              {[
                { type: "destructive" as const, message: `${t("alert.stock_critical")} : Huile de palme (5L) — 3 ${t("alert.units_remaining")}` },
                { type: "destructive" as const, message: `Facture #F-2024-089 ${t("alert.unpaid_since")} 12 ${t("alert.days")} — Client: Supermarché Akwa` },
                { type: "default" as const, message: `Livraison #L-156 ${t("alert.delivery_late")} — Restaurant Le Plateau` },
                { type: "default" as const, message: `${t("alert.leave_request")} — Jean-Pierre Nkomo (3 ${t("alert.days")})` },
              ].map((alert, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                  <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${alert.type === "destructive" ? "text-destructive" : "text-warning"}`} />
                  <p className="text-xs leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <TodoWidget />
      </div>
    </div>
  );
}
