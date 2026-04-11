import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/I18nContext";

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

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const label = t(`status.${status}`);
  return (
    <Badge variant="outline" className={`text-[10px] font-medium ${statusStyles[status] || ""}`}>
      {label !== `status.${status}` ? label : status}
    </Badge>
  );
}
