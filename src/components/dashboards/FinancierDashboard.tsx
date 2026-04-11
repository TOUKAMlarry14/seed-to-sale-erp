import { Card, CardContent } from "@/components/ui/card";
import { CURRENCY } from "@/lib/constants";
import { useTranslation } from "@/contexts/I18nContext";
import { Wallet, TrendingUp, FileText, ArrowDownRight } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["hsl(214, 89%, 34%)", "hsl(148, 58%, 26%)", "hsl(38, 92%, 50%)", "hsl(4, 84%, 47%)", "hsl(215, 16%, 47%)"];
const formatCFA = (v: number) => `${(v / 1000000).toFixed(1)}M`;

const tresorerieData = [
  { mois: "Oct", solde: 6200000 }, { mois: "Nov", solde: 6800000 }, { mois: "Déc", solde: 7500000 },
  { mois: "Jan", solde: 7100000 }, { mois: "Fév", solde: 7900000 }, { mois: "Mar", solde: 8320000 },
];

export default function FinancierDashboard() {
  const { t } = useTranslation();

  const depensesData = [
    { name: t("chart.purchases"), value: 5200000 }, { name: t("chart.salaries"), value: 3100000 }, { name: t("chart.transport"), value: 1400000 },
    { name: t("chart.rent"), value: 800000 }, { name: t("chart.other"), value: 600000 },
  ];

  const kpis = [
    { label: t("dashboard.cash_balance"), value: `8 320 000 ${CURRENCY}`, icon: Wallet, color: "text-success" },
    { label: t("dashboard.monthly_revenue"), value: `12 450 000 ${CURRENCY}`, icon: TrendingUp, color: "text-primary" },
    { label: t("reporting.unpaid_invoices"), value: `1 850 000 ${CURRENCY}`, icon: FileText, color: "text-destructive" },
    { label: t("dashboard.month_expenses"), value: `4 130 000 ${CURRENCY}`, icon: ArrowDownRight, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t("dashboard.finance_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.finance_subtitle")}</p>
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
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.cash_evolution")}</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={tresorerieData}>
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
