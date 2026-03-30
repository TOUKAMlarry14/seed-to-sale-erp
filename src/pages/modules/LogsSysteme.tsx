import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, FileText } from "lucide-react";

export function LogsSysteme() {
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["activity_logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });

  const filtered = logs?.filter(l => actionFilter === "all" || l.action === actionFilter) || [];
  const actions = [...new Set(logs?.map(l => l.action) || [])];

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">Logs Système</h1>
        <p className="text-sm text-muted-foreground">Historique de toutes les actions effectuées dans l'ERP</p>
      </div>

      <div className="flex gap-3">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer par action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les actions</SelectItem>
            {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filtered} searchKey="user_name" columns={[
        { key: "created_at", label: "Date", render: (r) => new Date(r.created_at).toLocaleString("fr-FR") },
        { key: "user_name", label: "Utilisateur" },
        { key: "action", label: "Action", render: (r) => (
          <Badge variant="outline" className={`text-[10px] ${
            r.action === "Suppression" ? "text-destructive border-destructive/30" :
            r.action === "Création" ? "text-success border-success/30" :
            "text-primary border-primary/30"
          }`}>{r.action}</Badge>
        )},
        { key: "entity_type", label: "Type" },
        { key: "entity_id", label: "ID Entité", render: (r) => r.entity_id ? <span className="text-xs font-mono">{r.entity_id.slice(0, 8)}...</span> : "—" },
      ]} />
    </div>
  );
}
