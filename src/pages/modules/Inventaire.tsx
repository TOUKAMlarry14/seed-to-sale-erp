import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useStockMovements, useCreateStockMovement } from "@/hooks/useStock";
import { useSuppliers } from "@/hooks/useSuppliers";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CURRENCY } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export function Inventaire() {
  const { data: products, isLoading: loadingP } = useProducts();
  const { data: movements, isLoading: loadingM } = useStockMovements();
  const { data: suppliers } = useSuppliers();
  const createMovement = useCreateStockMovement();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ product_id: "", type: "entree", quantity: 0, reason: "", supplier_id: "" });

  const handleSubmit = () => {
    createMovement.mutate({ product_id: form.product_id, type: form.type, quantity: form.quantity, reason: form.reason, supplier_id: form.supplier_id || undefined }, {
      onSuccess: () => { setOpen(false); setForm({ product_id: "", type: "entree", quantity: 0, reason: "", supplier_id: "" }); }
    });
  };

  const isLoading = loadingP || loadingM;
  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Inventaire</h1>
          <p className="text-sm text-muted-foreground">Suivi des stocks et mouvements</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Mouvement</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau mouvement de stock</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entree">Entrée</SelectItem>
                    <SelectItem value="sortie">Sortie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Produit</Label>
                <Select value={form.product_id} onValueChange={v => setForm({ ...form, product_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (stock: {p.stock_qty})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Quantité</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })} /></div>
              {form.type === "entree" && (
                <div><Label>Fournisseur</Label>
                  <Select value={form.supplier_id} onValueChange={v => setForm({ ...form, supplier_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                    <SelectContent>{suppliers?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div><Label>Motif</Label><Input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
              <Button onClick={handleSubmit} disabled={!form.product_id || form.quantity <= 0 || createMovement.isPending}>
                {createMovement.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">État du stock</TabsTrigger>
          <TabsTrigger value="mouvements">Historique mouvements</TabsTrigger>
        </TabsList>
        <TabsContent value="stock">
          <DataTable
            data={products || []}
            searchKey="name"
            columns={[
              { key: "name", label: "Produit" },
              { key: "category", label: "Catégorie" },
              { key: "stock_qty", label: "Stock actuel", render: (r) => (
                <span className={r.stock_qty <= r.stock_min ? "text-destructive font-bold" : "font-semibold"}>{r.stock_qty} {r.unit}</span>
              )},
              { key: "stock_min", label: "Seuil min", render: (r) => `${r.stock_min} ${r.unit}` },
              { key: "alerte", label: "Alerte", render: (r) => r.stock_qty <= r.stock_min ? <Badge variant="destructive" className="text-[10px]">Bas</Badge> : <Badge variant="outline" className="text-[10px] text-success border-success/30">OK</Badge> },
            ]}
          />
        </TabsContent>
        <TabsContent value="mouvements">
          <DataTable
            data={movements || []}
            searchKey="reason"
            columns={[
              { key: "created_at", label: "Date", render: (r) => new Date(r.created_at).toLocaleDateString("fr-FR") },
              { key: "product", label: "Produit", render: (r) => (r as any).products?.name || "—" },
              { key: "type", label: "Type", render: (r) => (
                <Badge variant="outline" className={`text-[10px] ${r.type === "entree" ? "text-success border-success/30" : "text-destructive border-destructive/30"}`}>
                  {r.type === "entree" ? "↓ Entrée" : "↑ Sortie"}
                </Badge>
              )},
              { key: "quantity", label: "Quantité", render: (r) => r.quantity },
              { key: "reason", label: "Motif" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
