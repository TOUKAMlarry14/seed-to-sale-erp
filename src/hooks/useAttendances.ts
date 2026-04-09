import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useAttendances(date?: string) {
  return useQuery({
    queryKey: ["attendances", date],
    queryFn: async () => {
      let q = supabase.from("attendances").select("*, employees(name)").order("created_at", { ascending: false });
      if (date) q = q.eq("date", date);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: { employee_id: string; date: string; status: string; start_date?: string; end_date?: string; reason?: string }) => {
      // Delete existing attendance for this employee+date first
      await supabase.from("attendances").delete().eq("employee_id", a.employee_id).eq("date", a.date);
      // Insert new
      const { data, error } = await supabase.from("attendances").insert(a as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendances"] }); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}
