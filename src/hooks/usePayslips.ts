import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CNPS_RATE } from "@/lib/constants";

export function usePayslips() {
  return useQuery({
    queryKey: ["payslips"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payslips").select("*, employees(name)").order("year", { ascending: false }).order("month", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePayslip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { employee_id: string; month: number; year: number; gross_salary: number }) => {
      const cnps = Math.round(p.gross_salary * CNPS_RATE);
      const tax = Math.round(p.gross_salary * 0.11); // simplified tax rate
      const net = p.gross_salary - cnps - tax;
      const { data, error } = await supabase.from("payslips").insert({ ...p, cnps_deduction: cnps, tax_deduction: tax, net_salary: net }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payslips"] }); toast({ title: "Fiche de paie générée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

export function useUpdatePayslip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...u }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from("payslips").update(u).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payslips"] }); toast({ title: "Fiche de paie mise à jour" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}
