import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ClipboardList, Trash2, UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from "@/hooks/useTodos";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import { createNotification } from "@/hooks/useNotifications";

interface Member { id: string; full_name: string; email: string; roles: string[]; }

const PRIORITY_COLORS: Record<string, string> = {
  haute: "text-destructive border-destructive/30",
  moyenne: "text-warning border-warning/30",
  basse: "text-muted-foreground border-muted-foreground/30",
};

export function Management() {
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin") || roles.includes("techadmin" as any);
  const { data: todos = [] } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", priority: "moyenne", due_date: "", assigned_to: "", department: "" });
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const [pRes, rRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const rolesByUser = new Map<string, string[]>();
      (rRes.data || []).forEach((r: any) => {
        const arr = rolesByUser.get(r.user_id) || [];
        arr.push(r.role); rolesByUser.set(r.user_id, arr);
      });
      const list: Member[] = (pRes.data || []).map((p: any) => ({
        id: p.id, full_name: p.full_name, email: p.email,
        roles: rolesByUser.get(p.id) || [],
      }));
      setMembers(list);
      setLoading(false);
    })();
  }, []);

  const chefs = useMemo(() =>
    members.filter(m => m.roles.some(r => ["commercial", "logistique", "financier", "rh"].includes(r))),
  [members]);

  const handleCreate = () => {
    if (!form.title || !form.assigned_to) {
      toast({ title: "Champs requis", description: "Titre et destinataire sont obligatoires", variant: "destructive" });
      return;
    }
    createTodo.mutate(form as any, {
      onSuccess: async () => {
        await createNotification(form.assigned_to, "Nouvelle tâche assignée", form.title, "info", "/");
        setForm({ title: "", description: "", priority: "moyenne", due_date: "", assigned_to: "", department: "" });
      },
    });
  };

  const assignedTodos = useMemo(() =>
    (todos as any[])
      .filter(t => t.assigned_to && t.assigned_by)
      .filter(t => filterStatus === "all" ? true : t.status === filterStatus)
      .filter(t => filterUser === "all" ? true : t.assigned_to === filterUser),
  [todos, filterStatus, filterUser]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <UserCog className="h-10 w-10 mx-auto mb-2 opacity-40" />
        Accès réservé aux administrateurs.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Management</h1>
        <p className="text-sm text-muted-foreground">Assigner et suivre les tâches des chefs de service.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Nouvelle assignation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Titre" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.assigned_to} onValueChange={v => {
                const m = chefs.find(c => c.id === v);
                setForm({ ...form, assigned_to: v, department: m?.roles[0] || "" });
              }}>
                <SelectTrigger><SelectValue placeholder="Destinataire" /></SelectTrigger>
                <SelectContent>
                  {chefs.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name} — {m.roles.map(r => ROLE_LABELS[r] || r).join(", ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="basse">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            <Button onClick={handleCreate} disabled={createTodo.isPending} className="w-full">
              {createTodo.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Assigner la tâche
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading">Tâches assignées</CardTitle>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="a_faire">À faire</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="termine">Terminé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Chef" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous chefs</SelectItem>
                  {chefs.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
            ) : assignedTodos.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">Aucune tâche assignée.</p>
            ) : assignedTodos.map((t: any) => {
              const m = members.find(mm => mm.id === t.assigned_to);
              return (
                <div key={t.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/40 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      → {m?.full_name || "—"}{t.due_date ? ` · ${new Date(t.due_date).toLocaleDateString("fr-FR")}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[8px] ${PRIORITY_COLORS[t.priority] || ""}`}>{t.priority}</Badge>
                  <Select value={t.status} onValueChange={(v) => updateTodo.mutate({ id: t.id, status: v })}>
                    <SelectTrigger className="h-6 w-24 text-[10px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a_faire">À faire</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="termine">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteTodo.mutate(t.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Management;