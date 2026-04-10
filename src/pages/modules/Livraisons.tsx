import { useState } from "react";
import { useDeliveries, useCreateDelivery, useUpdateDelivery } from "@/hooks/useDeliveries";
import { useOrders } from "@/hooks/useOrders";
import { useEmployees } from "@/hooks/useEmployees";
import { DataTable } from "@/components/DataTable";
import { ExportButtons } from "@/components/ExportButtons";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DELIVERY_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Plus, Loader2 } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";
import { logActivity } from "@/hooks/useActivityLog";

export function Livraisons() {
  const { t } = useTranslation();
  const { data: deliveries, isLoading } = useDeliveries();
  const { data: orders } = useOrders();
  const { data: employees } = useEmployees();
  const createDelivery = useCreateDelivery();
  const updateDelivery = useUpdateDelivery();
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [form, setForm] = useState({ order_id: "", driver_id: "", scheduled_date: "", notes: "", destination: "" });

  const drivers = employees?.filter(e => e.role === "livreur" && e.is_active) || [];
  const deliverableOrders = orders?.filter(o => o.status === "confirmee" || o.status === "en_preparation") || [];

  const handleSubmit = () => {
    createDelivery.mutate({
      order_id: form.order_id,
      driver_id: form.driver_id || undefined,
      scheduled_date: form.scheduled_date || undefined,
      notes: form.notes,
      destination: form.destination,
    }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ order_id: "", driver_id: "", scheduled_date: "", notes: "", destination: "" });
        logActivity("Création", "Livraison");
      }
    });
  };

  const handleStatusChange = (id: string, status: string) => {
    const updates: Record<string, unknown> = { status };
    if (status === "livree") updates.delivered_at = new Date().toISOString();
    updateDelivery.mutate({ id, ...updates } as any, {
      onSuccess: () => logActivity("Modification", "Livraison", id, { status }),
    });
  };

  const filtered = deliveries?.filter(d => statusFilter === "all" || d.status === statusFilter) || [];

  const exportColumns = [
    { key: "scheduled_date", label: t("deliveries.scheduled_date"), render: (r: any) => formatDate(r.scheduled_date) },
    { key: "client", label: t("orders.client"), render: (r: any) => r.orders?.clients?.name || "—" },
    { key: "destination", label: t("deliveries.destination"), render: (r: any) => r.destination || "—" },
    { key: "driver", label: t("deliveries.driver"), render: (r: any) => r.employees?.name || "—" },
    { key: "status", label: t("common.status"), render: (r: any) => DELIVERY_STATUS_LABELS[r.status] || r.status },
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("deliveries.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("deliveries.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <ExportButtons data={filtered} columns={exportColumns} filename="livraisons" title={t("deliveries.title")} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> {t("deliveries.new_delivery")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("deliveries.new_delivery")}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label>{t("deliveries.order_confirmed")}</Label>
                  <Select value={form.order_id} onValueChange={v => setForm({ ...form, order_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {deliverableOrders.length === 0 ? (
                        <SelectItem value="none" disabled>Aucune commande disponible</SelectItem>
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
                <div><Label>{t("deliveries.destination")}</Label>
                  <Input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="Ex: Akwa, Douala" />
                </div>
                <div><Label>{t("deliveries.driver")}</Label>
                  <Select value={form.driver_id} onValueChange={v => setForm({ ...form, driver_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Assigner un livreur" /></SelectTrigger>
                    <SelectContent>{drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>{t("deliveries.scheduled_date")}</Label><Input type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} /></div>
                <div><Label>{t("common.notes")}</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <Button onClick={handleSubmit} disabled={!form.order_id || form.order_id === "none" || createDelivery.isPending}>
                  {createDelivery.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}{t("common.create")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>{t("common.all")}</Button>
        {Object.entries(DELIVERY_STATUS_LABELS).map(([k, v]) => (
          <Button key={k} variant={statusFilter === k ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(k)}>{v}</Button>
        ))}
      </div>

      <DataTable data={filtered} searchKey="destination" columns={[
        { key: "scheduled_date", label: t("deliveries.scheduled_date"), render: (r) => formatDate(r.scheduled_date) },
        { key: "client", label: t("orders.client"), render: (r) => (r as any).orders?.clients?.name || "—" },
        { key: "destination", label: t("deliveries.destination"), render: (r) => r.destination || "—" },
        { key: "driver", label: t("deliveries.driver"), render: (r) => (r as any).employees?.name || "Non assigné" },
        { key: "status", label: t("common.status"), render: (r) => <StatusBadge status={r.status} /> },
        { key: "actions", label: "", render: (r) => (
          <div className="flex gap-1">
            {r.status === "en_attente" && <Button variant="outline" size="sm" className="text-xs" onClick={() => handleStatusChange(r.id, "en_cours")}>{t("deliveries.start")}</Button>}
            {r.status === "en_cours" && (
              <>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => handleStatusChange(r.id, "livree")}>{t("deliveries.delivered")}</Button>
                <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => handleStatusChange(r.id, "echouee")}>{t("deliveries.failed")}</Button>
              </>
            )}
          </div>
        )},
      ]} />
    </div>
  );
}