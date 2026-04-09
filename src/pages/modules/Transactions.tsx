import { useState } from "react";
import { useTransactions, useCreateTransaction } from "@/hooks/useTransactions";
import { DataTable } from "@/components/DataTable";
import { ExportButtons } from "@/components/ExportButtons";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCY, TRANSACTION_CATEGORIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Plus, Loader2, TrendingUp, TrendingDown, Wallet, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export function Transactions() {
  const { data: transactions, isLoading } = useTransactions();
  const createTransaction = useCreateTransaction();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [form, setForm] = useState({ type: "recette", amount: 0, category: "Ventes", description: "", date: new Date().toISOString().split("T")[0] });

  const resetForm = () => setForm({ type: "recette", amount: 0, category: "Ventes", description: "", date: new Date().toISOString().split("T")[0] });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from("transactions").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); toast({ title: "Transaction modifiée" }); setOpen(false); setEditItem(null); resetForm(); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); toast({ title: "Transaction supprimée" }); setDeleteTarget(null); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = () => {
    if (editItem) {
      updateTransaction.mutate({ id: editItem.id, ...form });
    } else {
      createTransaction.mutate(form, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const openEdit = (t: any) => {
    setEditItem(t);
    setForm({ type: t.type, amount: t.amount, category: t.category, description: t.description || "", date: t.date });
    setOpen(true);
  };

  // Filters
  let filtered = transactions?.filter(t => typeFilter === "all" || t.type === typeFilter) || [];
  if (monthFilter !== "all") {
    filtered = filtered.filter(t => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === monthFilter;
    });
  }

  // Get unique months for filter
  const months = [...new Set(transactions?.map(t => {
    const d = new Date(t.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }) || [])].sort().reverse();

  const totalRecettes = filtered.filter(t => t.type === "recette").reduce((s, t) => s + Number(t.amount), 0);
  const totalDepenses = filtered.filter(t => t.type === "depense").reduce((s, t) => s + Number(t.amount), 0);
  const solde = totalRecettes - totalDepenses;

  const exportColumns = [
    { key: "date", label: "Date", render: (r: any) => formatDate(r.date) },
    { key: "type", label: "Type", render: (r: any) => r.type === "recette" ? "Recette" : "Dépense" },
    { key: "category", label: "Catégorie" },
    { key: "amount", label: "Montant", render: (r: any) => String(Number(r.amount).toLocaleString()) },
    { key: "description", label: "Description" },
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Journal des transactions</h1>
          <p className="text-sm text-muted-foreground">Suivi des recettes et dépenses</p>
        </div>
        <div className="flex gap-2">
          <ExportButtons data={filtered} columns={exportColumns} filename="transactions" title="Journal des Transactions" />
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditItem(null); resetForm(); } }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Ajouter</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editItem ? "Modifier la transaction" : "Nouvelle transaction"}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recette">Recette</SelectItem>
                      <SelectItem value="depense">Dépense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Montant ({CURRENCY})</Label><Input type="number" value={form.amount || ""} onFocus={e => { if (form.amount === 0) e.target.select(); }} onChange={e => setForm({ ...form, amount: +e.target.value })} /></div>
                <div><Label>Catégorie</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TRANSACTION_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <Button onClick={handleSubmit} disabled={form.amount <= 0 || createTransaction.isPending || updateTransaction.isPending}>
                  {(createTransaction.isPending || updateTransaction.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  {editItem ? "Modifier" : "Enregistrer"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="h-5 w-5 text-success" /><div><p className="text-lg font-heading font-bold">{totalRecettes.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Recettes ({CURRENCY})</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><TrendingDown className="h-5 w-5 text-destructive" /><div><p className="text-lg font-heading font-bold">{totalDepenses.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Dépenses ({CURRENCY})</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Wallet className={`h-5 w-5 ${solde >= 0 ? "text-success" : "text-destructive"}`} /><div><p className="text-lg font-heading font-bold">{solde.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Solde ({CURRENCY})</p></div></CardContent></Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={typeFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setTypeFilter("all")}>Tout</Button>
        <Button variant={typeFilter === "recette" ? "default" : "outline"} size="sm" onClick={() => setTypeFilter("recette")}>Recettes</Button>
        <Button variant={typeFilter === "depense" ? "default" : "outline"} size="sm" onClick={() => setTypeFilter("depense")}>Dépenses</Button>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="Filtrer par mois" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les mois</SelectItem>
            {months.map(m => {
              const [y, mo] = m.split("-");
              const label = new Date(+y, +mo - 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
              return <SelectItem key={m} value={m}>{label}</SelectItem>;
            })}
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filtered} searchKey="description" columns={[
        { key: "date", label: "Date", render: (r) => formatDate(r.date) },
        { key: "type", label: "Type", render: (r) => (
          <Badge variant="outline" className={`text-[10px] ${r.type === "recette" ? "text-success border-success/30" : "text-destructive border-destructive/30"}`}>
            {r.type === "recette" ? "Recette" : "Dépense"}
          </Badge>
        )},
        { key: "category", label: "Catégorie" },
        { key: "amount", label: `Montant (${CURRENCY})`, render: (r) => <span className={r.type === "recette" ? "text-success" : "text-destructive"}>{Number(r.amount).toLocaleString()}</span> },
        { key: "description", label: "Description" },
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
        title="Supprimer la transaction"
        description="Êtes-vous sûr de vouloir supprimer cette transaction ?"
        confirmLabel="Supprimer"
        onConfirm={() => deleteTarget && deleteTransaction.mutate(deleteTarget.id)}
      />
    </div>
  );
}
