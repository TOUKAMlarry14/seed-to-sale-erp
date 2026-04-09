import { useState } from "react";
import { useDeliveries, useCreateDelivery, useUpdateDelivery } from "@/hooks/useDeliveries";
import { useOrders } from "@/hooks/useOrders";
import { useEmployees } from "@/hooks/useEmployees";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DELIVERY_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Plus, Loader2 } from "lucide-react";

export function Livraisons() {
  const { data: deliveries, isLoading } = useDeliveries();
  const { data: orders } = useOrders();
  const { data: employees } = useEmployees();
  const createDelivery = useCreateDelivery();
  const updateDelivery = useUpdateDelivery();
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [form, setForm] = useState({ order_id: "", driver_id: "", scheduled_date: "", notes: "" });

  const drivers = employees?.filter(e => e.role === "livreur" && e.is_active) || [];
  // Only show orders with status "livree" for delivery creation
  const deliverableOrders = orders?.filter(o => o.status === "livree") || [];

  const handleSubmit = () => {
    createDelivery.mutate({
      order_id: form.order_id,
      driver_id: form.driver_id || undefined,
      scheduled_date: form.scheduled_date || undefined,
      notes: form.notes,
    }, {
      onSuccess: () => { setOpen(false); setForm({ order_id: "", driver_id: "", scheduled_date: "", notes: "" }); }
    });
  };

  const filtered = deliveries?.filter(d => statusFilter === "all" || d.status === statusFilter) || [];

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Livraisons</h1>
          <p className="text-sm text-muted-foreground">Planifiez et suivez les livraisons</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Nouvelle livraison</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle livraison</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Commande (livrée)</Label>
                <Select value={form.order_id} onValueChange={v => setForm({ ...form, order_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {deliverableOrders.length === 0 ? (
                      <SelectItem value="none" disabled>Aucune commande livrée</SelectItem>
                    ) : (
                      deliverableOrders.map(o => (
                        <SelectItem key={o.id} value={o.id}>
                          {(o as any).clients?.name || "—"} — {o.total?.toLocaleString()} FCFA
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Livreur</Label>
                <Select value={form.driver_id} onValueChange={v => setForm({ ...form, driver_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Assigner un livreur" /></SelectTrigger>
                  <SelectContent>{drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Date prévue</Label><Input type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} /></div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleSubmit} disabled={!form.order_id || form.order_id === "none" || createDelivery.isPending}>
                {createDelivery.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Créer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>Tout</Button>
        {Object.entries(DELIVERY_STATUS_LABELS).map(([k, v]) => (
          <Button key={k} variant={statusFilter === k ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(k)}>{v}</Button>
        ))}
      </div>

      <DataTable data={filtered} searchKey="notes" columns={[
        { key: "scheduled_date", label: "Date", render: (r) => formatDate(r.scheduled_date) },
        { key: "client", label: "Client", render: (r) => (r as any).orders?.clients?.name || "—" },
        { key: "status", label: "Statut", render: (r) => <StatusBadge status={r.status} /> },
        { key: "actions", label: "", render: (r) => (
          <div className="flex gap-1">
            {r.status === "en_attente" && <Button variant="outline" size="sm" className="text-xs" onClick={() => updateDelivery.mutate({ id: r.id, status: "en_cours" })}>Démarrer</Button>}
            {r.status === "en_cours" && (
              <>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => updateDelivery.mutate({ id: r.id, status: "livree", delivered_at: new Date().toISOString() })}>Livrée</Button>
                <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => updateDelivery.mutate({ id: r.id, status: "echouee" })}>Échec</Button>
              </>
            )}
          </div>
        )},
      ]} />
    </div>
  );
}
