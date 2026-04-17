import { useState, useMemo } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { useAttendances, useUpsertAttendance } from "@/hooks/useAttendances";
import { useTranslation } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle, Palmtree, Briefcase, FileDown, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function Presences() {
  const { t } = useTranslation();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [date, setDate] = useState(today.toISOString().split("T")[0]);
  const { data: employees, isLoading: le } = useEmployees();
  const { data: attendances, isLoading: la } = useAttendances(date);
  const upsert = useUpsertAttendance();
  const qc = useQueryClient();
  const [deptFilter, setDeptFilter] = useState("all");
  const [modalData, setModalData] = useState<{ empId: string; status: string } | null>(null);
  const [modalForm, setModalForm] = useState({ start_date: "", end_date: "", reason: "" });

  const STATUSES = [
    { value: "present", label: t("attendance.present"), icon: CheckCircle, color: "text-success" },
    { value: "absent", label: t("attendance.absent"), icon: XCircle, color: "text-destructive" },
    { value: "conge", label: t("attendance.leave"), icon: Palmtree, color: "text-warning" },
    { value: "mission", label: t("attendance.mission"), icon: Briefcase, color: "text-primary" },
  ];

  const DEPARTMENTS = ["Direction", "Commercial", "Logistique", "Finance", "RH", "Livraison"];
  const YEARS = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);

  const activeEmployees = employees?.filter(e => e.is_active) || [];
  const filteredEmployees = activeEmployees.filter(e => deptFilter === "all" || e.department === deptFilter);
  const getStatus = (empId: string) => attendances?.find(a => a.employee_id === empId)?.status || null;
  const getAttendanceId = (empId: string) => attendances?.find(a => a.employee_id === empId)?.id || null;

  // sync date when month/year changes
  const onMonthChange = (m: number) => {
    setMonth(m);
    const d = new Date(year, m, Math.min(today.getDate(), new Date(year, m + 1, 0).getDate()));
    setDate(d.toISOString().split("T")[0]);
  };
  const onYearChange = (y: number) => {
    setYear(y);
    const d = new Date(y, month, Math.min(today.getDate(), new Date(y, month + 1, 0).getDate()));
    setDate(d.toISOString().split("T")[0]);
  };

  const markAttendance = (empId: string, status: string) => {
    const current = getStatus(empId);
    if (current === status) {
      const attId = getAttendanceId(empId);
      if (attId) {
        supabase.from("attendances").delete().eq("id", attId).then(() => {
          qc.invalidateQueries({ queryKey: ["attendances", date] });
        });
      }
      return;
    }
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

  const exportRows = useMemo(() => filteredEmployees.map(e => ({
    name: e.name,
    department: e.department || "—",
    role: e.role,
    date,
    status: getStatus(e.id) || "non_marque",
  })), [filteredEmployees, attendances, date]);

  const exportCols = [
    { key: "name", label: "Nom" },
    { key: "department", label: "Département" },
    { key: "role", label: "Poste" },
    { key: "date", label: "Date" },
    { key: "status", label: "Statut" },
  ];

  if (le || la) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("attendance.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("attendance.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-sm">{present}/{total} {t("attendance.present_count")}</Badge>
          <Select value={String(month)} onValueChange={(v) => onMonthChange(+v)}>
            <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => onYearChange(+v)}>
            <SelectTrigger className="w-24 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-40 h-9" />
          <Button variant="outline" size="sm" onClick={() => exportToCSV(exportRows, exportCols, `presences-${date}`)}>
            <FileDown className="h-3.5 w-3.5 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToPDF(exportRows, exportCols, `Présences — ${date}`, `presences-${date}`)}>
            <Printer className="h-3.5 w-3.5 mr-1" /> PDF
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={deptFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setDeptFilter("all")}>{t("common.all")}</Button>
        {DEPARTMENTS.map(d => (
          <Button key={d} variant={deptFilter === d ? "default" : "outline"} size="sm" onClick={() => setDeptFilter(d)}>{d}</Button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredEmployees.map(emp => {
          const status = getStatus(emp.id);
          return (
            <Card key={emp.id} className="card-hover">
              <CardContent className="p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{emp.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{emp.department || emp.role}</p>
                  </div>
                  {status && <StatusBadge status={status} />}
                </div>
                <div className="flex gap-1 flex-wrap">
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

      <Dialog open={!!modalData} onOpenChange={(v) => { if (!v) setModalData(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalData?.status === "mission" ? t("attendance.declare_mission") : t("attendance.declare_leave")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t("attendance.start_date")}</Label><Input type="date" value={modalForm.start_date} onChange={e => setModalForm({ ...modalForm, start_date: e.target.value })} /></div>
              <div><Label>{t("attendance.end_date")}</Label><Input type="date" value={modalForm.end_date} onChange={e => setModalForm({ ...modalForm, end_date: e.target.value })} /></div>
            </div>
            <div><Label>{t("attendance.reason")}</Label><Input value={modalForm.reason} onChange={e => setModalForm({ ...modalForm, reason: e.target.value })} placeholder={t("attendance.mission_leave_reason")} /></div>
            <Button onClick={handleModalSubmit} disabled={upsert.isPending}>
              {upsert.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}{t("common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
