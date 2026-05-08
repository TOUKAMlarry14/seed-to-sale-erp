import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export type DateRangePreset = "day" | "week" | "month" | "year" | "all";

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "day", label: "Jour" },
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "year", label: "Année" },
  { value: "all", label: "Tout" },
];

/** Returns the lower-bound Date for a preset (null for "all"). */
export function getRangeStart(preset: DateRangePreset): Date | null {
  const now = new Date();
  switch (preset) {
    case "day": {
      const d = new Date(now); d.setHours(0, 0, 0, 0); return d;
    }
    case "week": {
      const d = new Date(now); d.setDate(d.getDate() - 7); return d;
    }
    case "month": {
      const d = new Date(now); d.setMonth(d.getMonth() - 1); return d;
    }
    case "year": {
      const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d;
    }
    default:
      return null;
  }
}

export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRangePreset;
  onChange: (v: DateRangePreset) => void;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
      {PRESETS.map((p) => (
        <Button
          key={p.value}
          size="sm"
          variant={value === p.value ? "default" : "outline"}
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}