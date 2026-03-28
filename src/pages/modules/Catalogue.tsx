import { useState } from "react";
import { useProducts, useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCT_CATEGORIES, PRODUCT_UNITS, CURRENCY } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import { Loader2 } from "lucide-react";

export function Catalogue() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [form, setForm] = useState({ name: "", category: "Autres", unit: "kg", price_buy: 0, price_sell: 0, stock_qty: 0, stock_min: 10, description: "" });

  const resetForm = () => setForm({ name: "", category: "Autres", unit: "kg", price_buy: 0, price_sell: 0, stock_qty: 0, stock_min: 10, description: "" });

  const handleSubmit = () => {
    if (editProduct) {
      updateProduct.mutate({ id: editProduct.id, ...form }, { onSuccess: () => { setOpen(false); setEditProduct(null); resetForm(); } });
    } else {
      createProduct.mutate(form, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const openEdit = (p: any) => {
    setEditProduct(p);
    setForm({ name: p.name, category: p.category, unit: p.unit, price_buy: p.price_buy, price_sell: p.price_sell, stock_qty: p.stock_qty, stock_min: p.stock_min, description: p.description || "" });
    setOpen(true);
  };

  const filtered = products?.filter(p => categoryFilter === "all" || p.category === categoryFilter) || [];

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Catalogue produits</h1>
          <p className="text-sm text-muted-foreground">Gérez votre catalogue de produits agroalimentaires</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditProduct(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editProduct ? "Modifier le produit" : "Nouveau produit"}</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Nom</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Catégorie</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Unité</Label>
                  <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PRODUCT_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Prix achat ({CURRENCY})</Label><Input type="number" value={form.price_buy} onChange={e => setForm({ ...form, price_buy: +e.target.value })} /></div>
                <div><Label>Prix vente ({CURRENCY})</Label><Input type="number" value={form.price_sell} onChange={e => setForm({ ...form, price_sell: +e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Stock actuel</Label><Input type="number" value={form.stock_qty} onChange={e => setForm({ ...form, stock_qty: +e.target.value })} /></div>
                <div><Label>Stock minimum</Label><Input type="number" value={form.stock_min} onChange={e => setForm({ ...form, stock_min: +e.target.value })} /></div>
              </div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <Button onClick={handleSubmit} disabled={!form.name || createProduct.isPending || updateProduct.isPending}>
                {(createProduct.isPending || updateProduct.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {editProduct ? "Modifier" : "Créer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={categoryFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter("all")}>Tout</Button>
        {PRODUCT_CATEGORIES.map(c => (
          <Button key={c} variant={categoryFilter === c ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter(c)}>{c}</Button>
        ))}
      </div>

      <DataTable
        data={filtered}
        searchKey="name"
        columns={[
          { key: "name", label: "Nom" },
          { key: "category", label: "Catégorie", render: (r) => <Badge variant="outline" className="text-[10px]">{r.category}</Badge> },
          { key: "unit", label: "Unité" },
          { key: "price_buy", label: `Achat (${CURRENCY})`, render: (r) => r.price_buy?.toLocaleString() },
          { key: "price_sell", label: `Vente (${CURRENCY})`, render: (r) => r.price_sell?.toLocaleString() },
          { key: "stock_qty", label: "Stock", render: (r) => (
            <span className={r.stock_qty <= r.stock_min ? "text-destructive font-semibold" : ""}>{r.stock_qty} {r.stock_qty <= r.stock_min && "⚠️"}</span>
          )},
          { key: "actions", label: "", render: (r) => <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button> },
        ]}
      />
    </div>
  );
}
