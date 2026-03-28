import { useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { useAttendances, useUpsertAttendance } from "@/hooks/useAttendances";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Loader2, CheckCircle, XCircle, Palmtree, Briefcase } from "lucide-react";

const STATUSES = [
  { value: "present", label: "Présent", icon: CheckCircle, color: "text-success" },
  { value: "absent", label: "Absent", icon: XCircle, color: "text-destructive" },
  { value: "conge", label: "Congé", icon: Palmtree, color: "text-warning" },
  { value: "mission", label: "Mission", icon: Briefcase, color: "text-primary" },
];

export function Presences() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { data: employees, isLoading: le } = useEmployees();
  const { data: attendances, isLoading: la } = useAttendances(date);
  const upsert = useUpsertAttendance();

  const activeEmployees = employees?.filter(e => e.is_active) || [];
  const getStatus = (empId: string) => attendances?.find(a => a.employee_id === empId)?.status || null;

  const markAttendance = (empId: string, status: string) => {
    upsert.mutate({ employee_id: empId, date, status });
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

      <div className="space-y-2">
        {activeEmployees.map(emp => {
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
    </div>
  );
}
