import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CURRENCY } from "@/lib/constants";
import { useTranslation } from "@/contexts/I18nContext";
import { Users, CalendarCheck, Wallet, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DateRangeFilter, getRangeStart, type DateRangePreset } from "@/components/DateRangeFilter";
import { useEmployees } from "@/hooks/useEmployees";
import { useAllAttendances } from "@/hooks/useAttendances";
import { usePayslips } from "@/hooks/usePayslips";

const fmt = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} ${CURRENCY}`;

export default function RHDashboard() {
  const { t } = useTranslation();
  const [range, setRange] = useState<DateRangePreset>("month");

  const { data: employees = [] } = useEmployees();
  const { data: attendances = [] } = useAllAttendances();
  const { data: payslips = [] } = usePayslips();

  const start = useMemo(() => getRangeStart(range), [range]);
  const today = new Date().toISOString().split("T")[0];
  const activeEmployees = (employees as any[]).filter((e) => e.is_active !== false);

  const presentToday = (attendances as any[]).filter((a) => a.date === today && a.status === "present").length;
  const ongoingLeaves = (attendances as any[]).filter((a) => {
    if (a.status !== "conge") return false;
    const s = a.start_date ? new Date(a.start_date) : new Date(a.date);
    const e = a.end_date ? new Date(a.end_date) : s;
    const now = new Date();
    return s <= now && now <= e;
  }).length;

  const now = new Date();
  const payrollTotal = (payslips as any[])
    .filter((p) => p.year === now.getFullYear() && p.month === now.getMonth() + 1)
    .reduce((s, p) => s + Number(p.net_salary || 0), 0);

  const filteredAtt = (attendances as any[]).filter((a) => !start || new Date(a.date) >= start);
  const presenceRate = filteredAtt.length
    ? Math.round((filteredAtt.filter((a) => a.status === "present").length / filteredAtt.length) * 100)
    : 0;

  const kpis = [
    { label: t("dashboard.present_today"), value: `${presentToday} / ${activeEmployees.length}`, icon: Users, color: "text-success" },
    { label: t("dashboard.ongoing_leaves"), value: String(ongoingLeaves), icon: CalendarCheck, color: "text-warning" },
    { label: t("dashboard.payroll_total"), value: fmt(payrollTotal), icon: Wallet, color: "text-primary" },
    { label: t("dashboard.presence_rate"), value: `${presenceRate}%`, icon: TrendingUp, color: "text-primary" },
  ];

  const filteredPresence = useMemo(() => {
    const buckets = new Map<string, { total: number; present: number }>();
    filteredAtt.forEach((a) => {
      const d = new Date(a.date);
      // ISO week-ish key: YYYY-Wn
      const onejan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
      const key = `S${week}`;
      const b = buckets.get(key) ?? { total: 0, present: 0 };
      b.total += 1;
      if (a.status === "present") b.present += 1;
      buckets.set(key, b);
    });
    return Array.from(buckets.entries())
      .map(([semaine, b]) => ({ semaine, taux: b.total ? Math.round((b.present / b.total) * 100) : 0 }))
      .slice(-8);
  }, [filteredAtt]);

  const conges = (attendances as any[])
    .filter((a) => a.status === "conge")
    .slice(0, 5)
    .map((a) => ({
      nom: a.employees?.name ?? "—",
      debut: a.start_date ? new Date(a.start_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—",
      fin: a.end_date ? new Date(a.end_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—",
      statut: t("dashboard.approved"),
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t("dashboard.rh_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.rh_subtitle")}</p>
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
            <p className="text-sm font-heading font-semibold mb-4">{t("dashboard.weekly_presence")}</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredPresence}>
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
