import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { TablesInsert } from "@/integrations/supabase/types";

export function useAttendances(date?: string) {
  return useQuery({
    queryKey: ["attendances", date],
    queryFn: async () => {
      let q = supabase.from("attendances").select("*, employees(name, department)").order("created_at", { ascending: false });
      if (date) q = q.eq("date", date);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useAllAttendances() {
  return useQuery({
    queryKey: ["attendances_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("attendances").select("*, employees(name, department)").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: TablesInsert<"attendances">) => {
      // Delete existing attendance for this employee+date first
      await supabase.from("attendances").delete().eq("employee_id", a.employee_id).eq("date", a.date || new Date().toISOString().split("T")[0]);
      // Insert new
      const { data, error } = await supabase.from("attendances").insert(a).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendances"] }); },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}