import { useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { useAttendances, useUpsertAttendance } from "@/hooks/useAttendances";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle, Palmtree, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const STATUSES = [
  { value: "present", label: "Présent", icon: CheckCircle, color: "text-success" },
  { value: "absent", label: "Absent", icon: XCircle, color: "text-destructive" },
  { value: "conge", label: "Congé", icon: Palmtree, color: "text-warning" },
  { value: "mission", label: "Mission", icon: Briefcase, color: "text-primary" },
];

const DEPARTMENTS = ["Direction", "Commercial", "Logistique", "Finance", "RH", "Livraison"];

export function Presences() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { data: employees, isLoading: le } = useEmployees();
  const { data: attendances, isLoading: la } = useAttendances(date);
  const upsert = useUpsertAttendance();
  const qc = useQueryClient();
  const [deptFilter, setDeptFilter] = useState("all");
  const [modalData, setModalData] = useState<{ empId: string; status: string } | null>(null);
  const [modalForm, setModalForm] = useState({ start_date: "", end_date: "", reason: "" });

  const activeEmployees = employees?.filter(e => e.is_active) || [];
  const filteredEmployees = activeEmployees.filter(e => deptFilter === "all" || e.department === deptFilter);
  const getStatus = (empId: string) => attendances?.find(a => a.employee_id === empId)?.status || null;
  const getAttendanceId = (empId: string) => attendances?.find(a => a.employee_id === empId)?.id || null;

  const markAttendance = (empId: string, status: string) => {
    const current = getStatus(empId);
    // Toggle: if same status clicked, remove attendance
    if (current === status) {
      const attId = getAttendanceId(empId);
      if (attId) {
        supabase.from("attendances").delete().eq("id", attId).then(() => {
          qc.invalidateQueries({ queryKey: ["attendances", date] });
        });
      }
      return;
    }
    // For mission/conge, open modal
    if (status === "mission" || status === "conge") {
      setModalData({ empId, status });
      setModalForm({ start_date: date, end_date: date, reason: "" });
      return;
    }
    upsert.mutate({ employee_id: empId, date, status });
  };

  const handleModalSubmit = () => {
    if (!modalData) return;
    upsert.mutate({
      employee_id: modalData.empId, date, status: modalData.status,
      start_date: modalForm.start_date || undefined,
      end_date: modalForm.end_date || undefined,
      reason: modalForm.reason || undefined,
    } as any);
    setModalData(null);
  };

  const present = activeEmployees.filter(e => getStatus(e.id) === "present").length;
  const total = activeEmployees.length;

  if (le || la) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Pointage des présences</h1>
          <p className="text-sm text-muted-foreground">Suivi quotidien des présences du personnel</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">{present}/{total} présents</Badge>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-40" />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={deptFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setDeptFilter("all")}>Tout</Button>
        {DEPARTMENTS.map(d => (
          <Button key={d} variant={deptFilter === d ? "default" : "outline"} size="sm" onClick={() => setDeptFilter(d)}>{d}</Button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredEmployees.map(emp => {
          const status = getStatus(emp.id);
          return (
            <Card key={emp.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.department || emp.role}</p>
                  </div>
                  {status && <StatusBadge status={status} />}
                </div>
                <div className="flex gap-1">
                  {STATUSES.map(s => (
                    <Button
                      key={s.value}
                      variant={status === s.value ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => markAttendance(emp.id, s.value)}
                      disabled={upsert.isPending}
                    >
                      <s.icon className={`h-3 w-3 mr-1 ${status === s.value ? "" : s.color}`} />
                      {s.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal for Mission/Congé */}
      <Dialog open={!!modalData} onOpenChange={(v) => { if (!v) setModalData(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalData?.status === "mission" ? "Déclarer une mission" : "Déclarer un congé"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date début</Label><Input type="date" value={modalForm.start_date} onChange={e => setModalForm({ ...modalForm, start_date: e.target.value })} /></div>
              <div><Label>Date fin</Label><Input type="date" value={modalForm.end_date} onChange={e => setModalForm({ ...modalForm, end_date: e.target.value })} /></div>
            </div>
            <div><Label>Motif</Label><Input value={modalForm.reason} onChange={e => setModalForm({ ...modalForm, reason: e.target.value })} placeholder="Raison de la mission/congé" /></div>
            <Button onClick={handleModalSubmit} disabled={upsert.isPending}>
              {upsert.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
