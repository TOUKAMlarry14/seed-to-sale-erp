import { useTransactions } from "@/hooks/useTransactions";
import { useInvoices } from "@/hooks/useInvoices";
import { Card, CardContent } from "@/components/ui/card";
import { CURRENCY } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["hsl(214, 89%, 34%)", "hsl(148, 58%, 26%)", "hsl(38, 92%, 50%)", "hsl(4, 84%, 47%)", "hsl(215, 16%, 47%)", "hsl(280, 60%, 50%)"];
const formatCFA = (v: number) => `${(v / 1000000).toFixed(1)}M`;

export function Reporting() {
  const { data: transactions, isLoading: lt } = useTransactions();
  const { data: invoices, isLoading: li } = useInvoices();

  if (lt || li) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const recettes = transactions?.filter(t => t.type === "recette") || [];
  const depenses = transactions?.filter(t => t.type === "depense") || [];
  const totalRecettes = recettes.reduce((s, t) => s + Number(t.amount), 0);
  const totalDepenses = depenses.reduce((s, t) => s + Number(t.amount), 0);
  const resultat = totalRecettes - totalDepenses;

  // Group depenses by category
  const depByCategory: Record<string, number> = {};
  depenses.forEach(d => { depByCategory[d.category] = (depByCategory[d.category] || 0) + Number(d.amount); });
  const depPieData = Object.entries(depByCategory).map(([name, value]) => ({ name, value }));

  // Monthly CA (from recettes)
  const monthlyCA: Record<string, number> = {};
  recettes.forEach(r => {
    const m = new Date(r.date).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    monthlyCA[m] = (monthlyCA[m] || 0) + Number(r.amount);
  });
  const caData = Object.entries(monthlyCA).map(([mois, ca]) => ({ mois, ca })).slice(-6);

  // Unpaid invoices
  const unpaid = invoices?.filter(i => i.status === "impaye") || [];
  const totalUnpaid = unpaid.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Reporting financier</h1>
        <p className="text-sm text-muted-foreground">Tableaux de bord et analyses financières</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-[10px] text-muted-foreground">Recettes totales</p><p className="text-lg font-heading font-bold text-success">{totalRecettes.toLocaleString()} {CURRENCY}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[10px] text-muted-foreground">Dépenses totales</p><p className="text-lg font-heading font-bold text-destructive">{totalDepenses.toLocaleString()} {CURRENCY}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[10px] text-muted-foreground">Résultat net</p><p className={`text-lg font-heading font-bold ${resultat >= 0 ? "text-success" : "text-destructive"}`}>{resultat.toLocaleString()} {CURRENCY}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[10px] text-muted-foreground">Factures impayées</p><p className="text-lg font-heading font-bold text-destructive">{unpaid.length} ({totalUnpaid.toLocaleString()} {CURRENCY})</p></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {caData.length > 0 && (
          <Card><CardContent className="pt-6">
            <p className="text-sm font-heading font-semibold mb-4">CA mensuel</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={caData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mois" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <YAxis tickFormatter={formatCFA} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} ${CURRENCY}`} />
                <Line type="monotone" dataKey="ca" stroke="hsl(148, 58%, 26%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent></Card>
        )}
        {depPieData.length > 0 && (
          <Card><CardContent className="pt-6">
            <p className="text-sm font-heading font-semibold mb-4">Dépenses par catégorie</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={depPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} className="text-[9px]">
                  {depPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} ${CURRENCY}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent></Card>
        )}
      </div>

      {unpaid.length > 0 && (
        <Card><CardContent className="pt-6">
          <p className="text-sm font-heading font-semibold mb-4">Factures impayées</p>
          <div className="space-y-2">
            {unpaid.slice(0, 10).map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div>
                  <p className="text-sm font-medium">{inv.invoice_number}</p>
                  <p className="text-xs text-muted-foreground">{(inv as any).clients?.name} — Échéance: {inv.due_date ? new Date(inv.due_date).toLocaleDateString("fr-FR") : "—"}</p>
                </div>
                <span className="text-sm font-semibold text-destructive">{Number(inv.amount).toLocaleString()} {CURRENCY}</span>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}
