import { useState } from "react";
import { useOrders, useCreateOrder, useUpdateOrder } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCY, ORDER_STATUS_LABELS } from "@/lib/constants";
import { Plus, Loader2 } from "lucide-react";

export function Commandes() {
  const { data: orders, isLoading } = useOrders();
  const { data: clients } = useClients();
  const { data: products } = useProducts();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [form, setForm] = useState({ client_id: "", notes: "", delivery_address: "" });
  const [items, setItems] = useState<{ product_id: string; quantity: number; unit_price: number }[]>([]);

  const addItem = () => setItems([...items, { product_id: "", quantity: 1, unit_price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[i] as any)[field] = value;
    if (field === "product_id") {
      const prod = products?.find(p => p.id === value);
      if (prod) newItems[i].unit_price = prod.price_sell;
    }
    setItems(newItems);
  };

  const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);

  const handleSubmit = () => {
    createOrder.mutate({ client_id: form.client_id, notes: form.notes, delivery_address: form.delivery_address, items }, {
      onSuccess: () => { setOpen(false); setForm({ client_id: "", notes: "", delivery_address: "" }); setItems([]); }
    });
  };

  const filtered = orders?.filter(o => statusFilter === "all" || o.status === statusFilter) || [];

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Commandes</h1>
          <p className="text-sm text-muted-foreground">Créez et suivez les commandes clients</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Nouvelle commande</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nouvelle commande</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Client</Label>
                <Select value={form.client_id} onValueChange={v => setForm({ ...form, client_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                  <SelectContent>{clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Adresse de livraison</Label><Input value={form.delivery_address} onChange={e => setForm({ ...form, delivery_address: e.target.value })} /></div>
              <div>
                <div className="flex items-center justify-between mb-2"><Label>Produits</Label><Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" />Ajouter</Button></div>
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-end">
                    <div className="col-span-5">
                      <Select value={item.product_id} onValueChange={v => updateItem(i, "product_id", v)}>
                        <SelectTrigger className="text-xs"><SelectValue placeholder="Produit" /></SelectTrigger>
                        <SelectContent>{products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateItem(i, "quantity", +e.target.value)} className="text-xs" /></div>
                    <div className="col-span-3"><Input type="number" value={item.unit_price} onChange={e => updateItem(i, "unit_price", +e.target.value)} className="text-xs" /></div>
                    <div className="col-span-2"><Button variant="ghost" size="sm" onClick={() => removeItem(i)} className="text-destructive text-xs">×</Button></div>
                  </div>
                ))}
                <p className="text-sm font-semibold text-right">Total : {total.toLocaleString()} {CURRENCY}</p>
              </div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleSubmit} disabled={!form.client_id || items.length === 0 || createOrder.isPending}>
                {createOrder.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Créer la commande
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>Tout</Button>
        {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
          <Button key={k} variant={statusFilter === k ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(k)}>{v}</Button>
        ))}
      </div>

      <DataTable
        data={filtered}
        searchKey="notes"
        columns={[
          { key: "created_at", label: "Date", render: (r) => new Date(r.created_at).toLocaleDateString("fr-FR") },
          { key: "client", label: "Client", render: (r) => (r as any).clients?.name || "—" },
          { key: "total", label: `Total (${CURRENCY})`, render: (r) => r.total?.toLocaleString() },
          { key: "status", label: "Statut", render: (r) => <StatusBadge status={r.status} /> },
          { key: "actions", label: "", render: (r) => (
            r.status === "en_attente" ? (
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => updateOrder.mutate({ id: r.id, status: "confirme" })}>Confirmer</Button>
                <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => updateOrder.mutate({ id: r.id, status: "annule" })}>Annuler</Button>
              </div>
            ) : r.status === "confirme" ? (
              <Button variant="outline" size="sm" className="text-xs" onClick={() => updateOrder.mutate({ id: r.id, status: "en_preparation" })}>Préparer</Button>
            ) : null
          )},
        ]}
      />
    </div>
  );
}
