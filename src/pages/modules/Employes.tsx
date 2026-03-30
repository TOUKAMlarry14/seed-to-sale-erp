import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees, useCreateEmployee, useUpdateEmployee } from "@/hooks/useEmployees";
import { DataTable } from "@/components/DataTable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CURRENCY, ROLE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Loader2, Trash2, Eye, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const DEPARTMENTS = ["Direction", "Commercial", "Logistique", "Finance", "RH", "Livraison"];
const ROLES = ["admin", "commercial", "logistique", "financier", "rh", "livreur"];

export function Employes() {
  const navigate = useNavigate();
  const { data: employees, isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deptFilter, setDeptFilter] = useState("all");
  const [form, setForm] = useState({
    name: "", role: "commercial", phone: "", email: "", salary: 0,
    hire_date: new Date().toISOString().split("T")[0], department: "Commercial",
    bonus_amount: 0, bonus_reason: "",
  });

  const resetForm = () => setForm({
    name: "", role: "commercial", phone: "", email: "", salary: 0,
    hire_date: new Date().toISOString().split("T")[0], department: "Commercial",
    bonus_amount: 0, bonus_reason: "",
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast({ title: "Employé supprimé" }); setDeleteTarget(null); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = () => {
    const payload = { name: form.name, role: form.role, phone: form.phone, email: form.email, salary: form.salary, hire_date: form.hire_date, department: form.department, bonus_amount: form.bonus_amount, bonus_reason: form.bonus_reason };
    if (editItem) {
      updateEmployee.mutate({ id: editItem.id, ...payload } as any, { onSuccess: () => { setOpen(false); setEditItem(null); resetForm(); } });
    } else {
      createEmployee.mutate(payload as any, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const openEdit = (e: any) => {
    setEditItem(e);
    setForm({ name: e.name, role: e.role, phone: e.phone || "", email: e.email || "", salary: e.salary, hire_date: e.hire_date, department: e.department || "Général", bonus_amount: e.bonus_amount || 0, bonus_reason: e.bonus_reason || "" });
    setOpen(true);
  };

  const filtered = employees?.filter(e => deptFilter === "all" || e.department === deptFilter) || [];

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
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editItem ? "Modifier l'employé" : "Nouvel employé"}</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Nom complet</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="employe@agroconnect.cm" required={!editItem} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Poste / Rôle</Label>
                  <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r] || r}</SelectItem>)}</SelectContent>
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
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Bonus ({CURRENCY})</Label><Input type="number" value={form.bonus_amount} onChange={e => setForm({ ...form, bonus_amount: +e.target.value })} /></div>
                <div><Label>Motif bonus</Label><Input value={form.bonus_reason} onChange={e => setForm({ ...form, bonus_reason: e.target.value })} placeholder="Ex: Performance" /></div>
              </div>
              <Button onClick={handleSubmit} disabled={!form.name || createEmployee.isPending || updateEmployee.isPending}>
                {(createEmployee.isPending || updateEmployee.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {editItem ? "Modifier" : "Créer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={deptFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setDeptFilter("all")}>Tout</Button>
        {DEPARTMENTS.map(d => (
          <Button key={d} variant={deptFilter === d ? "default" : "outline"} size="sm" onClick={() => setDeptFilter(d)}>{d}</Button>
        ))}
      </div>

      <DataTable data={filtered} searchKey="name" columns={[
        { key: "name", label: "Nom" },
        { key: "email", label: "Email", render: (r) => r.email || "—" },
        { key: "role", label: "Poste", render: (r) => <Badge variant="outline" className="text-[10px]">{ROLE_LABELS[r.role] || r.role}</Badge> },
        { key: "department", label: "Département" },
        { key: "phone", label: "Téléphone" },
        { key: "salary", label: `Salaire (${CURRENCY})`, render: (r) => (
          <div className="flex items-center gap-1">
            <span>{Number(r.salary).toLocaleString()}</span>
            {r.bonus_amount > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge className="text-[8px] bg-warning/15 text-warning border-warning/30 px-1" variant="outline">
                    <PlusCircle className="h-2.5 w-2.5" />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bonus: {Number(r.bonus_amount).toLocaleString()} {CURRENCY}</p>
                  {r.bonus_reason && <p className="text-xs text-muted-foreground">{r.bonus_reason}</p>}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )},
        { key: "is_active", label: "Statut", render: (r) => r.is_active ? <Badge className="text-[10px] bg-success/15 text-success border-success/30" variant="outline">Actif</Badge> : <Badge variant="outline" className="text-[10px]">Inactif</Badge> },
        { key: "actions", label: "", render: (r) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/employes/${r.id}`)}><Eye className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteTarget(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        )},
      ]} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        title="Supprimer l'employé"
        description={`Êtes-vous sûr de vouloir supprimer définitivement "${deleteTarget?.name}" ? Cette action est irréversible.`}
        confirmLabel="Oui, supprimer"
        onConfirm={() => deleteTarget && deleteEmployee.mutate(deleteTarget.id)}
      />
    </div>
  );
}
