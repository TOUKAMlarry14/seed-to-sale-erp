import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/contexts/I18nContext";
import { AlertTriangle, Package, Truck, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DateRangeFilter, getRangeStart, type DateRangePreset } from "@/components/DateRangeFilter";
import { useProducts } from "@/hooks/useProducts";
import { useDeliveries } from "@/hooks/useDeliveries";
import { useStockMovements } from "@/hooks/useStock";

export default function LogistiqueDashboard() {
  const { t } = useTranslation();
  const [range, setRange] = useState<DateRangePreset>("week");

  const { data: products = [] } = useProducts();
  const { data: deliveries = [] } = useDeliveries();
  const { data: movements = [] } = useStockMovements();

  const start = useMemo(() => getRangeStart(range), [range]);
  const todayStart = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const outOfStock = (products as any[]).filter((p) => (p.stock_qty ?? 0) <= (p.stock_min ?? 0)).length;
  const dailyDeliveries = (deliveries as any[]).filter((d) => new Date(d.created_at) >= todayStart).length;
  const filteredMovements = (movements as any[]).filter((m) => !start || new Date(m.created_at) >= start);
  const weeklyEntries = filteredMovements.filter((m) => m.type === "entree").reduce((s, m) => s + Number(m.quantity || 0), 0);

  const filteredDeliveries = (deliveries as any[]).filter((d) => !start || new Date(d.created_at) >= start);
  const delivered = filteredDeliveries.filter((d) => d.status === "livree").length;
  const deliveryRate = filteredDeliveries.length ? Math.round((delivered / filteredDeliveries.length) * 100) : 0;

  const kpis = [
    { label: t("dashboard.out_of_stock"), value: String(outOfStock), icon: AlertTriangle, color: "text-destructive" },
    { label: t("dashboard.daily_deliveries"), value: String(dailyDeliveries), icon: Truck, color: "text-primary" },
    { label: t("dashboard.weekly_entries"), value: String(weeklyEntries), icon: Package, color: "text-success" },
    { label: t("dashboard.delivery_rate"), value: `${deliveryRate}%`, icon: TrendingDown, color: "text-warning" },
  ];

  const filteredEntries = useMemo(() => {
    const buckets = new Map<string, number>();
    filteredMovements.filter((m) => m.type === "entree").forEach((m) => {
      const d = new Date(m.created_at);
      const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, (buckets.get(key) ?? 0) + Number(m.quantity || 0));
    });
    return Array.from(buckets.entries()).map(([jour, entrees]) => ({ jour, entrees }));
  }, [filteredMovements]);

  const restock = (products as any[])
    .filter((p) => (p.stock_qty ?? 0) <= (p.stock_min ?? 0))
    .sort((a, b) => (a.stock_qty ?? 0) - (b.stock_qty ?? 0))
    .slice(0, 5)
    .map((p) => ({ produit: p.name, stock: p.stock_qty ?? 0, min: p.stock_min ?? 0 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t("dashboard.logistique_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.logistique_subtitle")}</p>
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
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.stock_entries_week")}</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredEntries}>
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
