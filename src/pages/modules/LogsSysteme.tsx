import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/DataTable";
import { ExportButtons } from "@/components/ExportButtons";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";

export function LogsSysteme() {
  const { t } = useTranslation();
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["activity_logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  // Subscribe to realtime
  useEffect(() => {
    const channel = supabase
      .channel("logs-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_logs" }, () => {})
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  let filtered = logs || [];
  if (actionFilter !== "all") filtered = filtered.filter(l => l.action === actionFilter);
  if (userFilter !== "all") filtered = filtered.filter(l => l.user_name === userFilter);

  const actions = [...new Set(logs?.map(l => l.action) || [])];
  const users = [...new Set(logs?.map(l => l.user_name).filter(Boolean) || [])];

  const exportColumns = [
    { key: "created_at", label: t("common.date"), render: (r: any) => new Date(r.created_at).toLocaleString("fr-FR") },
    { key: "user_name", label: t("logs.user") },
    { key: "action", label: t("logs.action") },
    { key: "entity_type", label: t("logs.entity_type") },
    { key: "entity_id", label: t("logs.entity_id") },
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("logs.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("logs.subtitle")}</p>
        </div>
        <ExportButtons data={filtered} columns={exportColumns} filename="logs_systeme" title={t("logs.title")} />
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder={t("logs.filter_action")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("logs.all_actions")}</SelectItem>
            {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder={t("logs.filter_user")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les utilisateurs</SelectItem>
            {users.map(u => <SelectItem key={u!} value={u!}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filtered} searchKey="user_name" columns={[
        { key: "created_at", label: t("common.date"), render: (r) => new Date(r.created_at).toLocaleString("fr-FR") },
        { key: "user_name", label: t("logs.user") },
        { key: "action", label: t("logs.action"), render: (r) => (
          <Badge variant="outline" className={`text-[10px] ${
            r.action === "Suppression" ? "text-destructive border-destructive/30" :
            r.action === "Création" ? "text-success border-success/30" :
            r.action === "Connexion" ? "text-primary border-primary/30" :
            r.action === "Modification" ? "text-warning border-warning/30" :
            "text-muted-foreground"
          }`}>{r.action}</Badge>
        )},
        { key: "entity_type", label: t("logs.entity_type") },
        { key: "entity_id", label: t("logs.entity_id"), render: (r) => r.entity_id ? <span className="text-xs font-mono">{r.entity_id.slice(0, 8)}...</span> : "—" },
      ]} />
    </div>
  );
}