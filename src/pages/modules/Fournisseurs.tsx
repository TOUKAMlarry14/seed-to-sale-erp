import { useState } from "react";
import { useSuppliers, useCreateSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import { DataTable } from "@/components/DataTable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export function Fournisseurs() {
  const { data: suppliers, isLoading } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [cityFilter, setCityFilter] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  const resetForm = () => setForm({ name: "", phone: "", email: "", address: "" });

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["suppliers"] }); toast({ title: "Fournisseur supprimé" }); setDeleteTarget(null); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = () => {
    if (editItem) {
      updateSupplier.mutate({ id: editItem.id, ...form }, { onSuccess: () => { setOpen(false); setEditItem(null); resetForm(); } });
    } else {
      createSupplier.mutate(form, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const openEdit = (s: any) => {
    setEditItem(s);
    setForm({ name: s.name, phone: s.phone || "", email: s.email || "", address: s.address || "" });
    setOpen(true);
  };

  const filtered = suppliers?.filter(s => !cityFilter || (s.address || "").toLowerCase().includes(cityFilter.toLowerCase())) || [];

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Fournisseurs</h1>
          <p className="text-sm text-muted-foreground">Gérez vos fournisseurs et approvisionnements</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditItem(null); resetForm(); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Ajouter</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? "Modifier le fournisseur" : "Nouveau fournisseur"}</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Nom</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><Label>Adresse / Zone</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <Button onClick={handleSubmit} disabled={!form.name || createSupplier.isPending || updateSupplier.isPending}>
                {(createSupplier.isPending || updateSupplier.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {editItem ? "Modifier" : "Créer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input placeholder="Filtrer par ville/adresse..." value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="max-w-xs" />

      <DataTable data={filtered} searchKey="name" columns={[
        { key: "name", label: "Nom" },
        { key: "phone", label: "Téléphone" },
        { key: "email", label: "Email" },
        { key: "address", label: "Adresse / Zone" },
        { key: "actions", label: "", render: (r) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteTarget(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        )},
      ]} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        title="Supprimer le fournisseur"
        description={`Supprimer définitivement "${deleteTarget?.name}" ?`}
        confirmLabel="Supprimer"
        onConfirm={() => deleteTarget && deleteSupplier.mutate(deleteTarget.id)}
      />
    </div>
  );
}
