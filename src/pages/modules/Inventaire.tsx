import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useStockMovements, useCreateStockMovement } from "@/hooks/useStock";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useTranslation } from "@/contexts/I18nContext";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";

export function Inventaire() {
  const { t, lang } = useTranslation();
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
          <h1 className="text-2xl font-heading font-bold">{t("inventory.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("inventory.subtitle")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> {t("inventory.movement")}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("inventory.new_movement")}</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>{t("common.type")}</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entree">{t("inventory.entry")}</SelectItem>
                    <SelectItem value="sortie">{t("inventory.exit")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t("common.product")}</Label>
                <Select value={form.product_id} onValueChange={v => setForm({ ...form, product_id: v })}>
                  <SelectTrigger><SelectValue placeholder={t("common.select")} /></SelectTrigger>
                  <SelectContent>{products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (stock: {p.stock_qty})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{t("common.quantity")}</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })} /></div>
              {form.type === "entree" && (
                <div><Label>{t("inventory.supplier")}</Label>
                  <Select value={form.supplier_id} onValueChange={v => setForm({ ...form, supplier_id: v })}>
                    <SelectTrigger><SelectValue placeholder={t("common.optional")} /></SelectTrigger>
                    <SelectContent>{suppliers?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div><Label>{t("common.reason")}</Label><Input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
              <Button onClick={handleSubmit} disabled={!form.product_id || form.quantity <= 0 || createMovement.isPending}>
                {createMovement.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}{t("common.save")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">{t("inventory.stock_state")}</TabsTrigger>
          <TabsTrigger value="mouvements">{t("inventory.movements_history")}</TabsTrigger>
        </TabsList>
        <TabsContent value="stock">
          <DataTable
            data={products || []}
            searchKey="name"
            columns={[
              { key: "name", label: t("common.product") },
              { key: "category", label: t("common.category") },
              { key: "stock_qty", label: t("inventory.current_stock"), render: (r) => (
                <span className={r.stock_qty <= r.stock_min ? "text-destructive font-bold" : "font-semibold"}>{r.stock_qty} {r.unit}</span>
              )},
              { key: "stock_min", label: t("inventory.min_threshold"), render: (r) => `${r.stock_min} ${r.unit}` },
              { key: "alerte", label: t("inventory.alert"), render: (r) => r.stock_qty <= r.stock_min ? <Badge variant="destructive" className="text-[10px]">{t("inventory.low")}</Badge> : <Badge variant="outline" className="text-[10px] text-success border-success/30">{t("inventory.ok")}</Badge> },
            ]}
          />
        </TabsContent>
        <TabsContent value="mouvements">
          <DataTable
            data={movements || []}
            searchKey="reason"
            columns={[
              { key: "created_at", label: t("common.date"), render: (r) => new Date(r.created_at).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR") },
              { key: "product", label: t("common.product"), render: (r) => (r as any).products?.name || "—" },
              { key: "type", label: t("common.type"), render: (r) => (
                <Badge variant="outline" className={`text-[10px] ${r.type === "entree" ? "text-success border-success/30" : "text-destructive border-destructive/30"}`}>
                  {t(`movement.${r.type}`)}
                </Badge>
              )},
              { key: "quantity", label: t("common.quantity"), render: (r) => r.quantity },
              { key: "reason", label: t("common.reason") },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
