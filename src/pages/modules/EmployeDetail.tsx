import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CURRENCY, ROLE_LABELS, CNPS_RATE } from "@/lib/constants";
import { ArrowLeft, Loader2, User, Phone, Mail, Building2, Calendar, Wallet } from "lucide-react";

export function EmployeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: employee, isLoading: le } = useQuery({
    queryKey: ["employee", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: attendances } = useQuery({
    queryKey: ["attendances-emp", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("attendances").select("*").eq("employee_id", id!).order("date", { ascending: false }).limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: payslips } = useQuery({
    queryKey: ["payslips-emp", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("payslips").select("*").eq("employee_id", id!).order("year", { ascending: false }).order("month", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (le) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!employee) return <p className="text-center text-muted-foreground">Employé introuvable</p>;

  const totalPresent = attendances?.filter(a => a.status === "present").length || 0;
  const totalRecords = attendances?.length || 0;
  const presenceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

  const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/employes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold">{employee.name}</h1>
          <p className="text-sm text-muted-foreground">{ROLE_LABELS[employee.role as keyof typeof ROLE_LABELS] || employee.role} — {employee.department || "Général"}</p>
        </div>
        <Badge className={`ml-auto ${employee.is_active ? "bg-success/15 text-success border-success/30" : ""}`} variant="outline">
          {employee.is_active ? "Actif" : "Inactif"}
        </Badge>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Téléphone</p>
              <p className="text-sm font-medium">{employee.phone || "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{(employee as any).email || "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Date d'embauche</p>
              <p className="text-sm font-medium">{new Date(employee.hire_date).toLocaleDateString("fr-FR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Salaire brut</p>
              <p className="text-sm font-medium">{Number(employee.salary).toLocaleString()} {CURRENCY}</p>
              {(employee as any).bonus_amount > 0 && (
                <p className="text-[10px] text-warning">+ {Number((employee as any).bonus_amount).toLocaleString()} bonus</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Taux de présence</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-heading font-bold ${presenceRate >= 80 ? "text-success" : presenceRate >= 60 ? "text-warning" : "text-destructive"}`}>{presenceRate}%</p>
            <p className="text-xs text-muted-foreground">{totalPresent} présent(s) sur {totalRecords} jours enregistrés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Fiches de paie</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-heading font-bold">{payslips?.length || 0}</p>
            <p className="text-xs text-muted-foreground">fiches générées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Salaire net estimé</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-heading font-bold">{Math.round(Number(employee.salary) * (1 - CNPS_RATE - 0.11)).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{CURRENCY} / mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Payslips History */}
      {payslips && payslips.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Historique des paies</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payslips.slice(0, 12).map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <span className="text-sm">{MONTHS[p.month - 1]} {p.year}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{Number(p.net_salary).toLocaleString()} {CURRENCY}</span>
                    {p.paid ? (
                      <Badge className="text-[10px] bg-success/15 text-success border-success/30" variant="outline">Payé</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-warning border-warning/30">En attente</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
