import { Card, CardContent } from "@/components/ui/card";
import { CURRENCY } from "@/lib/constants";
import { ShoppingCart, FileText, Users, TrendingUp } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const kpis = [
  { label: "Commandes du jour", value: "23", icon: ShoppingCart, color: "text-primary" },
  { label: "CA du mois", value: "12 450 000 FCFA", icon: TrendingUp, color: "text-success" },
  { label: "Factures impayées", value: "8", icon: FileText, color: "text-destructive" },
  { label: "Clients actifs", value: "47", icon: Users, color: "text-primary" },
];

const topProducts = [
  { name: "Riz parfumé 25kg", value: 85 }, { name: "Huile de palme 5L", value: 62 },
  { name: "Sucre en poudre 50kg", value: 45 }, { name: "Farine de blé 25kg", value: 38 }, { name: "Sel fin 1kg", value: 30 },
];
const COLORS = ["hsl(214, 89%, 34%)", "hsl(148, 58%, 26%)", "hsl(38, 92%, 50%)", "hsl(4, 84%, 47%)", "hsl(215, 16%, 47%)"];

const weeklyOrders = [
  { semaine: "S1", commandes: 45 }, { semaine: "S2", commandes: 52 }, { semaine: "S3", commandes: 48 }, { semaine: "S4", commandes: 61 },
];

export default function CommercialDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Tableau de bord — Commercial</h1>
        <p className="text-sm text-muted-foreground">Suivi des ventes et de la clientèle</p>
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
            <p className="text-sm font-heading font-semibold mb-4">Commandes par semaine</p>
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
            <p className="text-sm font-heading font-semibold mb-4">Top 5 produits vendus</p>
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
