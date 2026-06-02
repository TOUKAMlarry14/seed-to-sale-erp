import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CURRENCY } from "@/lib/constants";
import { useTranslation } from "@/contexts/I18nContext";
import { ShoppingCart, FileText, Users, TrendingUp } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DateRangeFilter, type DateRangePreset } from "@/components/DateRangeFilter";
import { useOrders } from "@/hooks/useOrders";
import { useInvoices } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const COLORS = ["hsl(214, 89%, 34%)", "hsl(148, 58%, 26%)", "hsl(38, 92%, 50%)", "hsl(4, 84%, 47%)", "hsl(215, 16%, 47%)"];

function rangeStart(range: DateRangePreset): Date {
  const d = new Date();
  if (range === "day") d.setHours(0, 0, 0, 0);
  else if (range === "week") d.setDate(d.getDate() - 7);
  else if (range === "month") d.setMonth(d.getMonth() - 1);
  else if (range === "year") d.setFullYear(d.getFullYear() - 1);
  else d.setFullYear(d.getFullYear() - 10);
  return d;
}

export default function CommercialDashboard() {
  const { t } = useTranslation();
  const [range, setRange] = useState<DateRangePreset>("month");

  const { data: orders = [] } = useOrders();
  const { data: invoices = [] } = useInvoices();
  const { data: clients = [] } = useClients();
  const { data: topItems = [] } = useQuery({
    queryKey: ["dashboard-top-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("quantity, products(name)")
        .limit(1000);
      if (error) throw error;
      return data ?? [];
    },
  });

  const start = useMemo(() => rangeStart(range), [range]);

  const filteredOrders = useMemo(
    () => orders.filter((o: any) => new Date(o.created_at) >= start),
    [orders, start]
  );

  const todayStart = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);
  const dailyOrdersCount = orders.filter((o: any) => new Date(o.created_at) >= todayStart).length;

  const monthStart = useMemo(() => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d;
  }, []);
  const monthlyRevenue = invoices
    .filter((i: any) => i.status === "paye" && new Date(i.paid_at ?? i.created_at) >= monthStart)
    .reduce((s: number, i: any) => s + Number(i.amount_paid || 0), 0);

  const unpaidInvoices = invoices.filter((i: any) => i.status !== "paye").length;
  const activeClients = clients.length;

  const weeklyOrders = useMemo(() => {
    const buckets = new Map<string, number>();
    filteredOrders.forEach((o: any) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({ semaine: k.slice(5), commandes: v }));
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    (topItems as any[]).forEach((it) => {
      const name = it.products?.name ?? "—";
      map.set(name, (map.get(name) ?? 0) + Number(it.quantity || 0));
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [topItems]);

  const fmt = (n: number) => `${n.toLocaleString("fr-FR")} ${CURRENCY}`;
  const kpis = [
    { label: t("dashboard.daily_orders"), value: String(dailyOrdersCount), icon: ShoppingCart, color: "text-primary" },
    { label: t("dashboard.monthly_revenue"), value: fmt(monthlyRevenue), icon: TrendingUp, color: "text-success" },
    { label: t("reporting.unpaid_invoices"), value: String(unpaidInvoices), icon: FileText, color: "text-destructive" },
    { label: t("dashboard.active_clients"), value: String(activeClients), icon: Users, color: "text-primary" },
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
              <BarChart data={weeklyOrders}>
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
