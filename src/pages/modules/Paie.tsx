import { useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { usePayslips, useCreatePayslip, useUpdatePayslip } from "@/hooks/usePayslips";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCY, CNPS_RATE } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Wallet } from "lucide-react";

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export function Paie() {
  const { data: employees, isLoading: le } = useEmployees();
  const { data: payslips, isLoading: lp } = usePayslips();
  const createPayslip = useCreatePayslip();
  const updatePayslip = useUpdatePayslip();
  const [open, setOpen] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({ employee_id: "", month: now.getMonth() + 1, year: now.getFullYear() });

  const activeEmployees = employees?.filter(e => e.is_active) || [];
  const selectedEmp = activeEmployees.find(e => e.id === form.employee_id);

  const handleGenerate = () => {
    if (!selectedEmp) return;
    createPayslip.mutate({ employee_id: form.employee_id, month: form.month, year: form.year, gross_salary: Number(selectedEmp.salary) }, {
      onSuccess: () => { setOpen(false); setForm({ ...form, employee_id: "" }); }
    });
  };

  const handleGenerateAll = () => {
    activeEmployees.forEach(emp => {
      const exists = payslips?.find(p => p.employee_id === emp.id && p.month === form.month && p.year === form.year);
      if (!exists) {
        createPayslip.mutate({ employee_id: emp.id, month: form.month, year: form.year, gross_salary: Number(emp.salary) });
      }
    });
  };

  const currentPayslips = payslips?.filter(p => p.month === form.month && p.year === form.year) || [];
  const masseSalariale = currentPayslips.reduce((s, p) => s + Number(p.net_salary), 0);

  if (le || lp) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Gestion de la paie</h1>
          <p className="text-sm text-muted-foreground">Calcul et suivi des salaires</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="h-4 w-4 mr-1" /> Fiche individuelle</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Générer une fiche de paie</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label>Employé</Label>
                  <Select value={form.employee_id} onValueChange={v => setForm({ ...form, employee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>{activeEmployees.map(e => <SelectItem key={e.id} value={e.id}>{e.name} ({Number(e.salary).toLocaleString()} {CURRENCY})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Mois</Label>
                    <Select value={String(form.month)} onValueChange={v => setForm({ ...form, month: +v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Année</Label>
                    <Select value={String(form.year)} onValueChange={v => setForm({ ...form, year: +v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{[2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedEmp && (
                  <div className="p-3 bg-muted/50 rounded-md text-sm space-y-1">
                    <p>Salaire brut : <strong>{Number(selectedEmp.salary).toLocaleString()} {CURRENCY}</strong></p>
                    <p>CNPS (2.8%) : <strong>-{Math.round(Number(selectedEmp.salary) * CNPS_RATE).toLocaleString()} {CURRENCY}</strong></p>
                    <p>Impôt (~11%) : <strong>-{Math.round(Number(selectedEmp.salary) * 0.11).toLocaleString()} {CURRENCY}</strong></p>
                    <p className="font-bold">Net : {Math.round(Number(selectedEmp.salary) * (1 - CNPS_RATE - 0.11)).toLocaleString()} {CURRENCY}</p>
                  </div>
                )}
                <Button onClick={handleGenerate} disabled={!form.employee_id || createPayslip.isPending}>
                  {createPayslip.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Générer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleGenerateAll}>Générer tout le mois</Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <Card><CardContent className="p-4 flex items-center gap-3"><Wallet className="h-5 w-5 text-primary" /><div><p className="text-lg font-heading font-bold">{masseSalariale.toLocaleString()} {CURRENCY}</p><p className="text-[10px] text-muted-foreground">Masse salariale nette — {MONTHS[form.month - 1]} {form.year}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div><p className="text-lg font-heading font-bold">{currentPayslips.length} / {activeEmployees.length}</p><p className="text-[10px] text-muted-foreground">Fiches générées</p></div></CardContent></Card>
      </div>

      <DataTable data={payslips || []} searchKey="" columns={[
        { key: "employee", label: "Employé", render: (r) => (r as any).employees?.name || "—" },
        { key: "period", label: "Période", render: (r) => `${MONTHS[r.month - 1]} ${r.year}` },
        { key: "gross_salary", label: `Brut (${CURRENCY})`, render: (r) => Number(r.gross_salary).toLocaleString() },
        { key: "cnps_deduction", label: "CNPS", render: (r) => Number(r.cnps_deduction).toLocaleString() },
        { key: "tax_deduction", label: "Impôt", render: (r) => Number(r.tax_deduction).toLocaleString() },
        { key: "net_salary", label: `Net (${CURRENCY})`, render: (r) => <strong>{Number(r.net_salary).toLocaleString()}</strong> },
        { key: "paid", label: "Statut", render: (r) => r.paid ? <Badge className="text-[10px] bg-success/15 text-success border-success/30" variant="outline">Payé</Badge> : <Badge variant="outline" className="text-[10px] text-warning border-warning/30">En attente</Badge> },
        { key: "actions", label: "", render: (r) => !r.paid && <Button variant="outline" size="sm" className="text-xs" onClick={() => updatePayslip.mutate({ id: r.id, paid: true })}>Marquer payé</Button> },
      ]} />
    </div>
  );
}
