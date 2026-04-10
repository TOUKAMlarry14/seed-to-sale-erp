import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: { type: string; amount: number; category: string; description?: string; date?: string }) => {
      const user = (await supabase.auth.getUser()).data.user;
      const { data, error } = await supabase.from("transactions").insert({
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description || "",
        date: t.date || new Date().toISOString().split("T")[0],
        created_by: user?.id || null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); toast({ title: "Transaction enregistrée" }); },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & TablesUpdate<"transactions">) => {
      const { error } = await supabase.from("transactions").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); toast({ title: "Transaction modifiée" }); },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); toast({ title: "Transaction supprimée" }); },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}