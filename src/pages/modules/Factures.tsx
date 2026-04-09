import { useState } from "react";
import { useInvoices, useUpdateInvoice } from "@/hooks/useInvoices";
import { DataTable } from "@/components/DataTable";
import { ExportButtons } from "@/components/ExportButtons";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCY, INVOICE_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Loader2, CreditCard } from "lucide-react";

const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "orange_money", label: "Orange Money" },
  { value: "mtn_momo", label: "MTN MoMo" },
  { value: "virement", label: "Virement bancaire" },
];

export function Factures() {
  const { data: invoices, isLoading } = useInvoices();
  const updateInvoice = useUpdateInvoice();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentDialog, setPaymentDialog] = useState<any>(null);
  const [payForm, setPayForm] = useState({ amount: 0, mode: "cash" });

  const handlePayment = () => {
    if (!paymentDialog) return;
    const newPaid = (paymentDialog.amount_paid || 0) + payForm.amount;
    const status = newPaid >= paymentDialog.amount ? "paye" : "partiel";
    updateInvoice.mutate({
      id: paymentDialog.id,
      amount_paid: newPaid,
      payment_mode: payForm.mode,
      status,
      ...(status === "paye" ? { paid_at: new Date().toISOString() } : {}),
    }, { onSuccess: () => { setPaymentDialog(null); setPayForm({ amount: 0, mode: "cash" }); } });
  };

  const filtered = invoices?.filter(i => statusFilter === "all" || i.status === statusFilter) || [];

  const exportColumns = [
    { key: "invoice_number", label: "N° Facture" },
    { key: "client", label: "Client", render: (r: any) => r.clients?.name || "—" },
    { key: "amount", label: "Montant", render: (r: any) => String(r.amount) },
    { key: "amount_paid", label: "Payé", render: (r: any) => String(r.amount_paid || 0) },
    { key: "due_date", label: "Échéance", render: (r: any) => r.due_date ? formatDate(r.due_date) : "—" },
    { key: "status", label: "Statut", render: (r: any) => INVOICE_STATUS_LABELS[r.status as keyof typeof INVOICE_STATUS_LABELS] || r.status },
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Factures</h1>
          <p className="text-sm text-muted-foreground">Générez et gérez les factures</p>
        </div>
        <ExportButtons data={filtered} columns={exportColumns} filename="factures" title="Liste des Factures" />
      </div>

      <div className="flex gap-2">
        <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>Tout</Button>
        {Object.entries(INVOICE_STATUS_LABELS).map(([k, v]) => (
          <Button key={k} variant={statusFilter === k ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(k)}>{v}</Button>
        ))}
      </div>

      <DataTable
        data={filtered}
        searchKey="invoice_number"
        columns={[
          { key: "invoice_number", label: "N° Facture" },
          { key: "client", label: "Client", render: (r) => (r as any).clients?.name || "—" },
          { key: "amount", label: `Montant (${CURRENCY})`, render: (r) => r.amount?.toLocaleString() },
          { key: "amount_paid", label: `Payé (${CURRENCY})`, render: (r) => (r.amount_paid || 0).toLocaleString() },
          { key: "due_date", label: "Échéance", render: (r) => r.due_date ? formatDate(r.due_date) : "—" },
          { key: "status", label: "Statut", render: (r) => <StatusBadge status={r.status} /> },
          { key: "actions", label: "", render: (r) => r.status !== "paye" && (
            <Button variant="outline" size="sm" className="text-xs" onClick={() => { setPaymentDialog(r); setPayForm({ amount: r.amount - (r.amount_paid || 0), mode: "cash" }); }}>
              <CreditCard className="h-3 w-3 mr-1" />Paiement
            </Button>
          )},
        ]}
      />

      <Dialog open={!!paymentDialog} onOpenChange={(v) => { if (!v) setPaymentDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <p className="text-sm">Facture : <strong>{paymentDialog?.invoice_number}</strong></p>
            <p className="text-sm">Reste à payer : <strong>{((paymentDialog?.amount || 0) - (paymentDialog?.amount_paid || 0)).toLocaleString()} {CURRENCY}</strong></p>
            <div><Label>Montant reçu ({CURRENCY})</Label><Input type="number" value={payForm.amount || ""} onFocus={e => { if (payForm.amount === 0) e.target.select(); }} onChange={e => setPayForm({ ...payForm, amount: +e.target.value })} /></div>
            <div><Label>Mode de paiement</Label>
              <Select value={payForm.mode} onValueChange={v => setPayForm({ ...payForm, mode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_MODES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={handlePayment} disabled={payForm.amount <= 0 || updateInvoice.isPending}>
              {updateInvoice.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
