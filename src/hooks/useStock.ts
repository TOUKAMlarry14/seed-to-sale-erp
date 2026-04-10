import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useStockMovements() {
  return useQuery({
    queryKey: ["stock_movements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stock_movements").select("*, products(name, unit), suppliers(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateStockMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: { product_id: string; type: string; quantity: number; reason?: string; supplier_id?: string }) => {
      const user = (await supabase.auth.getUser()).data.user;
      const { data, error } = await supabase.from("stock_movements").insert({
        product_id: m.product_id,
        type: m.type,
        quantity: m.quantity,
        reason: m.reason || "",
        supplier_id: m.supplier_id || null,
        created_by: user?.id || null,
      }).select().single();
      if (error) throw error;
      // Update product stock
      const delta = m.type === "entree" ? m.quantity : -m.quantity;
      const { data: prod } = await supabase.from("products").select("stock_qty").eq("id", m.product_id).single();
      if (prod) {
        await supabase.from("products").update({ stock_qty: Math.max(0, (prod.stock_qty || 0) + delta) }).eq("id", m.product_id);
      }
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stock_movements"] }); qc.invalidateQueries({ queryKey: ["products"] }); toast({ title: "Mouvement enregistré" }); },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}