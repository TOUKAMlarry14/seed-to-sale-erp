import { useState } from "react";
import { useEmployees, useCreateEmployee, useUpdateEmployee } from "@/hooks/useEmployees";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCY, ROLE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Loader2 } from "lucide-react";

const DEPARTMENTS = ["Direction", "Commercial", "Logistique", "Finance", "RH", "Livraison"];
const ROLES = ["admin", "commercial", "logistique", "financier", "rh", "livreur"];

export function Employes() {
  const { data: employees, isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: "", role: "commercial", phone: "", salary: 0, hire_date: new Date().toISOString().split("T")[0], department: "Commercial" });

  const resetForm = () => setForm({ name: "", role: "commercial", phone: "", salary: 0, hire_date: new Date().toISOString().split("T")[0], department: "Commercial" });

  const handleSubmit = () => {
    if (editItem) {
      updateEmployee.mutate({ id: editItem.id, ...form }, { onSuccess: () => { setOpen(false); setEditItem(null); resetForm(); } });
    } else {
      createEmployee.mutate(form, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const openEdit = (e: any) => {
    setEditItem(e);
    setForm({ name: e.name, role: e.role, phone: e.phone || "", salary: e.salary, hire_date: e.hire_date, department: e.department || "Général" });
    setOpen(true);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Gestion des employés</h1>
          <p className="text-sm text-muted-foreground">Répertoire et gestion du personnel</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditItem(null); resetForm(); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Ajouter</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? "Modifier l'employé" : "Nouvel employé"}</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Nom complet</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Poste / Rôle</Label>
                  <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r as keyof typeof ROLE_LABELS]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Département</Label>
                  <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Salaire brut ({CURRENCY})</Label><Input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: +e.target.value })} /></div>
              </div>
              <div><Label>Date d'embauche</Label><Input type="date" value={form.hire_date} onChange={e => setForm({ ...form, hire_date: e.target.value })} /></div>
              <Button onClick={handleSubmit} disabled={!form.name || createEmployee.isPending || updateEmployee.isPending}>
                {(createEmployee.isPending || updateEmployee.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {editItem ? "Modifier" : "Créer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable data={employees || []} searchKey="name" columns={[
        { key: "name", label: "Nom" },
        { key: "role", label: "Poste", render: (r) => <Badge variant="outline" className="text-[10px]">{ROLE_LABELS[r.role as keyof typeof ROLE_LABELS] || r.role}</Badge> },
        { key: "department", label: "Département" },
        { key: "phone", label: "Téléphone" },
        { key: "salary", label: `Salaire (${CURRENCY})`, render: (r) => Number(r.salary).toLocaleString() },
        { key: "is_active", label: "Statut", render: (r) => r.is_active ? <Badge className="text-[10px] bg-success/15 text-success border-success/30" variant="outline">Actif</Badge> : <Badge variant="outline" className="text-[10px]">Inactif</Badge> },
        { key: "actions", label: "", render: (r) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
            {r.is_active && <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => updateEmployee.mutate({ id: r.id, is_active: false })}>Archiver</Button>}
          </div>
        )},
      ]} />
    </div>
  );
}
