import { useState } from "react";
import { useTransactions, useCreateTransaction } from "@/hooks/useTransactions";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCY, TRANSACTION_CATEGORIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export function Transactions() {
  const { data: transactions, isLoading } = useTransactions();
  const createTransaction = useCreateTransaction();
  const [open, setOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [form, setForm] = useState({ type: "recette", amount: 0, category: "Ventes", description: "", date: new Date().toISOString().split("T")[0] });

  const handleSubmit = () => {
    createTransaction.mutate(form, { onSuccess: () => { setOpen(false); setForm({ type: "recette", amount: 0, category: "Ventes", description: "", date: new Date().toISOString().split("T")[0] }); } });
  };

  const filtered = transactions?.filter(t => typeFilter === "all" || t.type === typeFilter) || [];
  const totalRecettes = transactions?.filter(t => t.type === "recette").reduce((s, t) => s + Number(t.amount), 0) || 0;
  const totalDepenses = transactions?.filter(t => t.type === "depense").reduce((s, t) => s + Number(t.amount), 0) || 0;
  const solde = totalRecettes - totalDepenses;

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Journal des transactions</h1>
          <p className="text-sm text-muted-foreground">Suivi des recettes et dépenses</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Ajouter</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle transaction</DialogTitle></DialogHeader>
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
              <div><Label>Montant ({CURRENCY})</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} /></div>
              <div><Label>Catégorie</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TRANSACTION_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <Button onClick={handleSubmit} disabled={form.amount <= 0 || createTransaction.isPending}>
                {createTransaction.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="h-5 w-5 text-success" /><div><p className="text-lg font-heading font-bold">{totalRecettes.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Recettes ({CURRENCY})</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><TrendingDown className="h-5 w-5 text-destructive" /><div><p className="text-lg font-heading font-bold">{totalDepenses.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Dépenses ({CURRENCY})</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Wallet className={`h-5 w-5 ${solde >= 0 ? "text-success" : "text-destructive"}`} /><div><p className="text-lg font-heading font-bold">{solde.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Solde ({CURRENCY})</p></div></CardContent></Card>
      </div>

      <div className="flex gap-2">
        <Button variant={typeFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setTypeFilter("all")}>Tout</Button>
        <Button variant={typeFilter === "recette" ? "default" : "outline"} size="sm" onClick={() => setTypeFilter("recette")}>Recettes</Button>
        <Button variant={typeFilter === "depense" ? "default" : "outline"} size="sm" onClick={() => setTypeFilter("depense")}>Dépenses</Button>
      </div>

      <DataTable data={filtered} searchKey="description" columns={[
        { key: "date", label: "Date", render: (r) => new Date(r.date).toLocaleDateString("fr-FR") },
        { key: "type", label: "Type", render: (r) => (
          <Badge variant="outline" className={`text-[10px] ${r.type === "recette" ? "text-success border-success/30" : "text-destructive border-destructive/30"}`}>
            {r.type === "recette" ? "Recette" : "Dépense"}
          </Badge>
        )},
        { key: "category", label: "Catégorie" },
        { key: "amount", label: `Montant (${CURRENCY})`, render: (r) => <span className={r.type === "recette" ? "text-success" : "text-destructive"}>{Number(r.amount).toLocaleString()}</span> },
        { key: "description", label: "Description" },
      ]} />
    </div>
  );
}
