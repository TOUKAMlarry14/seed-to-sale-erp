import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCY } from "@/lib/constants";
import { TodoWidget } from "@/components/TodoWidget";
import { useTranslation } from "@/contexts/I18nContext";
import { TrendingUp, ShoppingCart, Wallet, AlertTriangle, Truck, Users, CalendarRange } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useInvoices } from "@/hooks/useInvoices";
import { useOrders } from "@/hooks/useOrders";
import { useTransactions } from "@/hooks/useTransactions";
import { useDeliveries } from "@/hooks/useDeliveries";
import { useProducts } from "@/hooks/useProducts";
import { useEmployees } from "@/hooks/useEmployees";
import { useAttendances } from "@/hooks/useAttendances";

const COLORS = ["hsl(214, 89%, 34%)", "hsl(148, 58%, 26%)", "hsl(38, 92%, 50%)", "hsl(4, 84%, 47%)", "hsl(215, 16%, 47%)"];
const formatCFA = (v: number) => `${(v / 1000000).toFixed(1)}M`;

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<"day" | "month" | "year">("month");
  const today = new Date().toISOString().split("T")[0];
  const { data: invoices = [] } = useInvoices();
  const { data: orders = [] } = useOrders();
  const { data: transactions = [] } = useTransactions();
  const { data: deliveries = [] } = useDeliveries();
  const { data: products = [] } = useProducts();
  const { data: employees = [] } = useEmployees();
  const { data: attendances = [] } = useAttendances(today);

  const { kpis, caData, commandesData, depensesData } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === "day") start.setHours(0, 0, 0, 0);
    else if (period === "month") start.setDate(1);
    else start.setMonth(0, 1);
    const startMs = start.getTime();

    const inRange = (d?: string | null) => d ? new Date(d).getTime() >= startMs : false;

    const revenue = (invoices as any[])
      .filter(i => i.status === "payee" && inRange(i.created_at))
      .reduce((s, i) => s + Number(i.amount || 0), 0);
    const ordersCount = (orders as any[]).filter(o => inRange(o.created_at)).length;
    const cash = (transactions as any[]).reduce((s, t) =>
      s + (t.type === "revenu" ? Number(t.amount) : -Number(t.amount)), 0);
    const lowStock = (products as any[]).filter(p => (p.stock_qty ?? 0) <= (p.stock_alert_threshold ?? 0)).length;
    const delivCount = (deliveries as any[]).filter(d => inRange(d.created_at)).length;
    const lateDeliv = (deliveries as any[]).filter(d => d.status === "retard").length;
    const present = (attendances as any[]).filter(a => a.status === "present").length;
    const totalEmp = (employees as any[]).filter(e => e.status === "actif").length;

    const kpis = [
      { label: t("dashboard.monthly_revenue"), value: revenue.toLocaleString(), suffix: CURRENCY, icon: TrendingUp, trend: "", color: "text-primary" },
      { label: t("dashboard.daily_orders"), value: String(ordersCount), suffix: "", icon: ShoppingCart, trend: "", color: "text-primary" },
      { label: t("dashboard.cash_balance"), value: cash.toLocaleString(), suffix: CURRENCY, icon: Wallet, trend: "", color: cash >= 0 ? "text-success" : "text-destructive" },
      { label: t("dashboard.stock_alerts"), value: String(lowStock), suffix: t("dashboard.products"), icon: AlertTriangle, trend: "", color: "text-destructive" },
      { label: t("dashboard.daily_deliveries"), value: String(delivCount), suffix: "", icon: Truck, trend: lateDeliv ? `${lateDeliv} ${t("dashboard.late")}` : "", color: "text-warning" },
      { label: t("dashboard.employees_present"), value: `${present}/${totalEmp}`, suffix: "", icon: Users, trend: totalEmp ? `${Math.round((present / totalEmp) * 100)}%` : "—", color: "text-primary" },
    ];

    // CA & commandes — buckets adaptés à la période
    const buckets = period === "day" ? 12 : period === "month" ? 30 : 12;
    const caData: any[] = [];
    const commandesData: any[] = [];
    for (let i = buckets - 1; i >= 0; i--) {
      let bStart: Date, bEnd: Date, label: string;
      if (period === "day") {
        bStart = new Date(now); bStart.setHours(now.getHours() - i, 0, 0, 0);
        bEnd = new Date(bStart); bEnd.setHours(bStart.getHours() + 1);
        label = `${bStart.getHours()}h`;
      } else if (period === "month") {
        bStart = new Date(now); bStart.setDate(now.getDate() - i); bStart.setHours(0, 0, 0, 0);
        bEnd = new Date(bStart); bEnd.setDate(bStart.getDate() + 1);
        label = String(bStart.getDate());
      } else {
        bStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        bEnd = new Date(bStart.getFullYear(), bStart.getMonth() + 1, 1);
        label = bStart.toLocaleString("fr", { month: "short" });
      }
      const ca = (invoices as any[])
        .filter(inv => inv.status === "payee" && inv.created_at && new Date(inv.created_at) >= bStart && new Date(inv.created_at) < bEnd)
        .reduce((s, inv) => s + Number(inv.amount || 0), 0);
      const cmd = (orders as any[]).filter(o => o.created_at && new Date(o.created_at) >= bStart && new Date(o.created_at) < bEnd).length;
      caData.push({ mois: label, ca });
      commandesData.push({ semaine: label, commandes: cmd });
    }

    // Dépenses par catégorie (sur la période)
    const expenseMap = new Map<string, number>();
    (transactions as any[])
      .filter(t => t.type === "depense" && inRange(t.date))
      .forEach(t => expenseMap.set(t.category || "autre", (expenseMap.get(t.category || "autre") || 0) + Number(t.amount || 0)));
    const depensesData = Array.from(expenseMap.entries()).map(([name, value]) => ({ name, value }));
    if (depensesData.length === 0) depensesData.push({ name: t("chart.other"), value: 0 });

    return { kpis, caData, commandesData, depensesData };
  }, [period, invoices, orders, transactions, deliveries, products, employees, attendances, t]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Jour</SelectItem>
              <SelectItem value="month">Mois</SelectItem>
              <SelectItem value="year">Année</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
