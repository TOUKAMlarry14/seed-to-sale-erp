import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CURRENCY } from "@/lib/constants";
import {
  TrendingUp,
  ShoppingCart,
  Wallet,
  AlertTriangle,
  Truck,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";


const kpis = [
  { label: "CA du mois", value: "12 450 000", suffix: CURRENCY, icon: TrendingUp, trend: "+8.2%", color: "text-primary" },
  { label: "Commandes du jour", value: "23", suffix: "", icon: ShoppingCart, trend: "+3", color: "text-primary" },
  { label: "Solde trésorerie", value: "8 320 000", suffix: CURRENCY, icon: Wallet, trend: "+2.1%", color: "text-success" },
  { label: "Ruptures de stock", value: "4", suffix: "produits", icon: AlertTriangle, trend: "", color: "text-destructive" },
  { label: "Livraisons du jour", value: "7", suffix: "", icon: Truck, trend: "2 en retard", color: "text-warning" },
  { label: "Employés présents", value: "18/22", suffix: "", icon: Users, trend: "82%", color: "text-primary" },
];

const caData = [
  { mois: "Oct", ca: 9200000 },
  { mois: "Nov", ca: 10500000 },
  { mois: "Déc", ca: 11800000 },
  { mois: "Jan", ca: 10200000 },
  { mois: "Fév", ca: 11400000 },
  { mois: "Mar", ca: 12450000 },
];

const commandesData = [
  { semaine: "S1", commandes: 45 },
  { semaine: "S2", commandes: 52 },
  { semaine: "S3", commandes: 48 },
  { semaine: "S4", commandes: 61 },
];

const depensesData = [
  { name: "Achats", value: 5200000 },
  { name: "Salaires", value: 3100000 },
  { name: "Transport", value: 1400000 },
  { name: "Loyer", value: 800000 },
  { name: "Autres", value: 600000 },
];

const COLORS = [
  "hsl(214, 89%, 34%)",
  "hsl(148, 58%, 26%)",
  "hsl(38, 92%, 50%)",
  "hsl(4, 84%, 47%)",
  "hsl(215, 16%, 47%)",
];

const alerts = [
  { type: "destructive" as const, message: "Stock critique : Huile de palme (5L) — 3 unités restantes" },
  { type: "destructive" as const, message: "Facture #F-2024-089 impayée depuis 12 jours — Client: Supermarché Akwa" },
  { type: "default" as const, message: "Livraison #L-156 en retard — Prévue hier pour Restaurant Le Plateau" },
  { type: "default" as const, message: "Demande de congé en attente — Jean-Pierre Nkomo (3 jours)" },
];

const formatCFA = (v: number) => `${(v / 1000000).toFixed(1)}M`;

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Vue d'ensemble de l'activité AgroConnect</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                {kpi.trend && (
                  <span className="text-[10px] text-muted-foreground">{kpi.trend}</span>
                )}
              </div>
              <p className="text-lg font-heading font-bold leading-tight">
                {kpi.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {kpi.suffix ? `${kpi.suffix} — ` : ""}{kpi.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Évolution du CA (6 mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={caData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mois" className="text-xs" tick={{ fill: 'hsl(215, 16%, 47%)' }} />
                <YAxis tickFormatter={formatCFA} className="text-xs" tick={{ fill: 'hsl(215, 16%, 47%)' }} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} ${CURRENCY}`, "CA"]} />
                <Line
                  type="monotone"
                  dataKey="ca"
                  stroke="hsl(214, 89%, 34%)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "hsl(214, 89%, 34%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Répartition des dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={depensesData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  className="text-[9px]"
                >
                  {depensesData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} ${CURRENCY}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Commandes par semaine</CardTitle>
          </CardHeader>
          <CardContent>
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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Alertes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${alert.type === "destructive" ? "text-destructive" : "text-warning"}`} />
                <p className="text-xs leading-relaxed">{alert.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
