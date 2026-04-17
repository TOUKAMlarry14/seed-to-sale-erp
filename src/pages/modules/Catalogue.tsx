import { useState, useMemo } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { DataTable } from "@/components/DataTable";
import { ExportButtons } from "@/components/ExportButtons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PRODUCT_CATEGORIES, PRODUCT_UNITS, CURRENCY } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Loader2, Trash2 } from "lucide-react";

export function Catalogue() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ ids: string[]; label: string } | null>(null);

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

  const filtered = useMemo(
    () => products?.filter(p => categoryFilter === "all" || p.category === categoryFilter) || [],
    [products, categoryFilter]
  );

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (filtered.every(p => selected.has(p.id))) setSelected(new Set());
    else setSelected(new Set(filtered.map(p => p.id)));
  };

  const performDelete = async (ids: string[]) => {
    for (const id of ids) await deleteProduct.mutateAsync(id);
    setSelected(new Set());
    setConfirmDelete(null);
  };

  const exportColumns = [
    { key: "name", label: "Nom" },
    { key: "category", label: "Catégorie" },
    { key: "unit", label: "Unité" },
    { key: "price_buy", label: "Prix achat", render: (r: any) => String(r.price_buy) },
    { key: "price_sell", label: "Prix vente", render: (r: any) => String(r.price_sell) },
    { key: "stock_qty", label: "Stock", render: (r: any) => String(r.stock_qty) },
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const allChecked = filtered.length > 0 && filtered.every(p => selected.has(p.id));

  return (
    <div className="space-y-4 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Catalogue produits</h1>
          <p className="text-sm text-muted-foreground">Gérez votre catalogue de produits agroalimentaires</p>
        </div>
        <div className="flex gap-2">
          <ExportButtons data={filtered} columns={exportColumns} filename="catalogue_produits" title="Catalogue des Produits" />
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditProduct(null); resetForm(); } }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Ajouter</Button></DialogTrigger>
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
                  <div><Label>Prix achat ({CURRENCY})</Label><Input type="number" value={form.price_buy || ""} onFocus={e => { if (form.price_buy === 0) e.target.select(); }} onChange={e => setForm({ ...form, price_buy: +e.target.value })} /></div>
                  <div><Label>Prix vente ({CURRENCY})</Label><Input type="number" value={form.price_sell || ""} onFocus={e => { if (form.price_sell === 0) e.target.select(); }} onChange={e => setForm({ ...form, price_sell: +e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Stock actuel</Label><Input type="number" value={form.stock_qty || ""} onFocus={e => { if (form.stock_qty === 0) e.target.select(); }} onChange={e => setForm({ ...form, stock_qty: +e.target.value })} /></div>
                  <div><Label>Stock minimum</Label><Input type="number" value={form.stock_min || ""} onFocus={e => { if (form.stock_min === 0) e.target.select(); }} onChange={e => setForm({ ...form, stock_min: +e.target.value })} /></div>
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
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={categoryFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter("all")}>Tout</Button>
        {PRODUCT_CATEGORIES.map(c => (
          <Button key={c} variant={categoryFilter === c ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter(c)}>{c}</Button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border bg-accent/50 animate-in">
          <p className="text-sm font-medium"><span className="text-primary">{selected.size}</span> produit(s) sélectionné(s)</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Annuler</Button>
            <Button
              variant="destructive" size="sm"
              onClick={() => setConfirmDelete({ ids: Array.from(selected), label: `${selected.size} produit(s)` })}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer la sélection
            </Button>
          </div>
        </div>
      )}

      <DataTable
        data={filtered}
        searchKey="name"
        columns={[
          {
            key: "_select",
            label: "",
            render: (r) => (
              <Checkbox
                checked={selected.has(r.id)}
                onCheckedChange={() => toggleOne(r.id)}
                onClick={(e) => e.stopPropagation()}
                aria-label="Sélectionner"
              />
            ),
          },
          { key: "name", label: (<div className="flex items-center gap-2"><Checkbox checked={allChecked} onCheckedChange={toggleAll} aria-label="Tout sélectionner" />Nom</div>) as any },
          { key: "category", label: "Catégorie", render: (r) => <Badge variant="outline" className="text-[10px]">{r.category}</Badge> },
          { key: "unit", label: "Unité" },
          { key: "price_buy", label: `Achat (${CURRENCY})`, render: (r) => r.price_buy?.toLocaleString() },
          { key: "price_sell", label: `Vente (${CURRENCY})`, render: (r) => r.price_sell?.toLocaleString() },
          { key: "stock_qty", label: "Stock", render: (r) => (
            <span className={r.stock_qty <= r.stock_min ? "text-destructive font-semibold" : ""}>{r.stock_qty}{r.stock_qty <= r.stock_min ? " ⚠" : ""}</span>
          )},
          { key: "actions", label: "", render: (r) => (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(r)} title="Modifier"><Pencil className="h-3.5 w-3.5" /></Button>
              <Button
                variant="ghost" size="icon"
                onClick={() => setConfirmDelete({ ids: [r.id], label: r.name })}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Supprimer"
              ><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          )},
        ]}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => { if (!v) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{confirmDelete?.label}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && performDelete(confirmDelete.ids)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
