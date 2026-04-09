import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  en_attente: "bg-warning/15 text-warning border-warning/30",
  confirme: "bg-primary/15 text-primary border-primary/30",
  confirmee: "bg-primary/15 text-primary border-primary/30",
  en_preparation: "bg-primary/15 text-primary border-primary/30",
  livre: "bg-success/15 text-success border-success/30",
  livree: "bg-success/15 text-success border-success/30",
  annule: "bg-destructive/15 text-destructive border-destructive/30",
  annulee: "bg-destructive/15 text-destructive border-destructive/30",
  en_cours: "bg-primary/15 text-primary border-primary/30",
  echoue: "bg-destructive/15 text-destructive border-destructive/30",
  echouee: "bg-destructive/15 text-destructive border-destructive/30",
  paye: "bg-success/15 text-success border-success/30",
  impaye: "bg-destructive/15 text-destructive border-destructive/30",
  partiel: "bg-warning/15 text-warning border-warning/30",
  present: "bg-success/15 text-success border-success/30",
  absent: "bg-destructive/15 text-destructive border-destructive/30",
  conge: "bg-warning/15 text-warning border-warning/30",
  mission: "bg-primary/15 text-primary border-primary/30",
  actif: "bg-success/15 text-success border-success/30",
  suspendu: "bg-warning/15 text-warning border-warning/30",
  renvoye: "bg-destructive/15 text-destructive border-destructive/30",
};

const statusLabels: Record<string, string> = {
  en_attente: "En attente",
  confirme: "Confirmée",
  confirmee: "Confirmée",
  en_preparation: "En préparation",
  livre: "Livrée",
  livree: "Livrée",
  annule: "Annulée",
  annulee: "Annulée",
  en_cours: "En cours",
  echoue: "Échouée",
  echouee: "Échouée",
  paye: "Payée",
  impaye: "Impayée",
  partiel: "Partielle",
  present: "Présent",
  absent: "Absent",
  conge: "Congé",
  mission: "Mission",
  actif: "Actif",
  suspendu: "Suspendu",
  renvoye: "Renvoyé",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`text-[10px] font-medium ${statusStyles[status] || ""}`}>
      {statusLabels[status] || status}
    </Badge>
  );
}
