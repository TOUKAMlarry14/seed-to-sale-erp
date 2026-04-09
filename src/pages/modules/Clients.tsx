import { useState } from "react";
import { useClients, useCreateClient, useUpdateClient } from "@/hooks/useClients";
import { DataTable } from "@/components/DataTable";
import { ExportButtons } from "@/components/ExportButtons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCY } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Loader2 } from "lucide-react";

const CLIENT_TYPES = [
  { value: "pro", label: "Professionnel" },
  { value: "particulier", label: "Particulier" },
  { value: "revendeur", label: "Revendeur" },
  { value: "restaurateur", label: "Restaurateur" },
  { value: "grossiste", label: "Grossiste" },
];

export function Clients() {
  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const [open, setOpen] = useState(false);
  const [editClient, setEditClient] = useState<any>(null);
  const [form, setForm] = useState({ name: "", type: "pro", phone: "", email: "", address: "" });

  const resetForm = () => setForm({ name: "", type: "pro", phone: "", email: "", address: "" });

  const handleSubmit = () => {
    if (editClient) {
      updateClient.mutate({ id: editClient.id, ...form }, { onSuccess: () => { setOpen(false); setEditClient(null); resetForm(); } });
    } else {
      createClient.mutate(form, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const openEdit = (c: any) => {
    setEditClient(c);
    setForm({ name: c.name, type: c.type, phone: c.phone || "", email: c.email || "", address: c.address || "" });
    setOpen(true);
  };

  const exportColumns = [
    { key: "name", label: "Nom" },
    { key: "type", label: "Type", render: (r: any) => CLIENT_TYPES.find(t => t.value === r.type)?.label || r.type },
    { key: "phone", label: "Téléphone" },
    { key: "email", label: "Email" },
    { key: "balance", label: "Solde", render: (r: any) => String(r.balance) },
    { key: "address", label: "Adresse" },
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Gestion des clients</h1>
          <p className="text-sm text-muted-foreground">Répertoire et suivi de vos clients</p>
        </div>
        <div className="flex gap-2">
          <ExportButtons data={clients || []} columns={exportColumns} filename="clients" title="Liste des Clients" />
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditClient(null); resetForm(); } }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Ajouter</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editClient ? "Modifier le client" : "Nouveau client"}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label>Nom</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CLIENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div><Label>Adresse</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                <Button onClick={handleSubmit} disabled={!form.name || createClient.isPending || updateClient.isPending}>
                  {(createClient.isPending || updateClient.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  {editClient ? "Modifier" : "Créer"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable
        data={clients || []}
        searchKey="name"
        columns={[
          { key: "name", label: "Nom" },
          { key: "type", label: "Type", render: (r) => <Badge variant="outline" className="text-[10px]">{CLIENT_TYPES.find(t => t.value === r.type)?.label || r.type}</Badge> },
          { key: "phone", label: "Téléphone" },
          { key: "email", label: "Email" },
          { key: "balance", label: `Solde (${CURRENCY})`, render: (r) => <span className={r.balance < 0 ? "text-destructive" : ""}>{r.balance?.toLocaleString()}</span> },
          { key: "actions", label: "", render: (r) => <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button> },
        ]}
      />
    </div>
  );
}
