import { useState } from "react";
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from "@/hooks/useTodos";
import { useTranslation } from "@/contexts/I18nContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2, Trash2, ListTodo } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  haute: "text-destructive border-destructive/30",
  moyenne: "text-warning border-warning/30",
  basse: "text-muted-foreground border-muted-foreground/30",
};

export function TodoWidget() {
  const { t, lang } = useTranslation();
  const { data: todos, isLoading } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "moyenne", due_date: "" });

  const STATUS_LABELS: Record<string, string> = {
    a_faire: t("todo.status_todo"),
    en_cours: t("todo.status_in_progress"),
    termine: t("todo.status_done"),
  };
  const PRIORITY_LABELS: Record<string, string> = {
    haute: t("todo.priority_high"),
    moyenne: t("todo.priority_medium"),
    basse: t("todo.priority_low"),
  };

  const handleCreate = () => {
    createTodo.mutate(form, {
      onSuccess: () => { setOpen(false); setForm({ title: "", description: "", priority: "moyenne", due_date: "" }); }
    });
  };

  const toggleStatus = (todo: any) => {
    const next = todo.status === "a_faire" ? "en_cours" : todo.status === "en_cours" ? "termine" : "a_faire";
    updateTodo.mutate({ id: todo.id, status: next });
  };

  const activeTodos = todos?.filter(t => t.status !== "termine") || [];
  const doneTodos = todos?.filter(t => t.status === "termine").slice(0, 5) || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            {t("todo.title")}
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />{t("common.add")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("todo.new_task")}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <Input placeholder={t("todo.task_title")} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <Input placeholder={t("todo.task_desc")} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haute">{t("todo.priority_high")}</SelectItem>
                      <SelectItem value="moyenne">{t("todo.priority_medium")}</SelectItem>
                      <SelectItem value="basse">{t("todo.priority_low")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <Button onClick={handleCreate} disabled={!form.title || createTodo.isPending}>
                  {createTodo.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}{t("common.create")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
        ) : activeTodos.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">{t("todo.no_tasks")}</p>
        ) : (
          activeTodos.slice(0, 10).map(todo => (
            <div key={todo.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group">
              <Checkbox checked={todo.status === "termine"} onCheckedChange={() => toggleStatus(todo)} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${todo.status === "termine" ? "line-through text-muted-foreground" : ""}`}>{todo.title}</p>
                {todo.due_date && <p className="text-[10px] text-muted-foreground">{t("todo.due_date")}: {new Date(todo.due_date).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR")}</p>}
              </div>
              <Badge variant="outline" className={`text-[8px] ${PRIORITY_COLORS[todo.priority] || ""}`}>{PRIORITY_LABELS[todo.priority] || todo.priority}</Badge>
              <Badge variant="outline" className="text-[8px]">{STATUS_LABELS[todo.status] || todo.status}</Badge>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteTodo.mutate(todo.id)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))
        )}
        {doneTodos.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-[10px] text-muted-foreground mb-1">{t("todo.done_recent")}</p>
            {doneTodos.map(todo => (
              <div key={todo.id} className="flex items-center gap-2 p-1">
                <Checkbox checked disabled />
                <p className="text-[10px] text-muted-foreground line-through truncate">{todo.title}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
