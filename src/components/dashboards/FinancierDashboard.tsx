import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CURRENCY } from "@/lib/constants";
import { useTranslation } from "@/contexts/I18nContext";
import { Wallet, TrendingUp, FileText, ArrowDownRight } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DateRangeFilter, getRangeStart, type DateRangePreset } from "@/components/DateRangeFilter";
import { useTransactions } from "@/hooks/useTransactions";
import { useInvoices } from "@/hooks/useInvoices";

const COLORS = ["hsl(214, 89%, 34%)", "hsl(148, 58%, 26%)", "hsl(38, 92%, 50%)", "hsl(4, 84%, 47%)", "hsl(215, 16%, 47%)"];
const formatCFA = (v: number) => `${(v / 1000000).toFixed(1)}M`;
const fmt = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} ${CURRENCY}`;

export default function FinancierDashboard() {
  const { t } = useTranslation();
  const [range, setRange] = useState<DateRangePreset>("month");

  const { data: transactions = [] } = useTransactions();
  const { data: invoices = [] } = useInvoices();

  const start = useMemo(() => getRangeStart(range), [range]);
  const monthStart = useMemo(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; }, []);

  const filteredTx = useMemo(
    () => (transactions as any[]).filter((t) => !start || new Date(t.date) >= start),
    [transactions, start]
  );

  const totalIncome = filteredTx.filter((t) => t.type === "recette").reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = filteredTx.filter((t) => t.type === "depense").reduce((s, t) => s + Number(t.amount || 0), 0);
  const cashBalance = (transactions as any[]).reduce((s, t) => s + (t.type === "recette" ? 1 : -1) * Number(t.amount || 0), 0);

  const monthlyRevenue = (invoices as any[])
    .filter((i) => i.status === "paye" && new Date(i.paid_at ?? i.created_at) >= monthStart)
    .reduce((s, i) => s + Number(i.amount_paid || 0), 0);
  const unpaidAmount = (invoices as any[])
    .filter((i) => i.status !== "paye")
    .reduce((s, i) => s + (Number(i.amount || 0) - Number(i.amount_paid || 0)), 0);

  // Cash evolution: running balance grouped by month over filtered range
  const filteredTresorerie = useMemo(() => {
    const sorted = [...(transactions as any[])].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const buckets = new Map<string, number>();
    let running = 0;
    sorted.forEach((t) => {
      running += (t.type === "recette" ? 1 : -1) * Number(t.amount || 0);
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, running);
    });
    const arr = Array.from(buckets.entries()).map(([mois, solde]) => ({ mois, solde }));
    return start ? arr.filter((p) => new Date(p.mois + "-01") >= start) : arr;
  }, [transactions, start]);

  const depensesData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTx.filter((t) => t.type === "depense").forEach((t) => {
      map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount || 0));
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
  }, [filteredTx]);

  const kpis = [
    { label: t("dashboard.cash_balance"), value: fmt(cashBalance), icon: Wallet, color: "text-success" },
    { label: t("dashboard.monthly_revenue"), value: fmt(monthlyRevenue), icon: TrendingUp, color: "text-primary" },
    { label: t("reporting.unpaid_invoices"), value: fmt(unpaidAmount), icon: FileText, color: "text-destructive" },
    { label: t("dashboard.month_expenses"), value: fmt(totalExpense), icon: ArrowDownRight, color: "text-warning" },
  ];
  void totalIncome;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t("dashboard.finance_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.finance_subtitle")}</p>
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
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.cash_evolution")}</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filteredTresorerie}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mois" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <YAxis tickFormatter={formatCFA} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} ${CURRENCY}`, t("dashboard.balance")]} />
                <Line type="monotone" dataKey="solde" stroke="hsl(148, 58%, 26%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(148, 58%, 26%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-heading font-semibold mb-4">{t("reporting.expenses_by_category")}</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={depensesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} className="text-[9px]">
                  {depensesData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} ${CURRENCY}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
