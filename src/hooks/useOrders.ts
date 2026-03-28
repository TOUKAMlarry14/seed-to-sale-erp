import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, clients(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useOrderItems(orderId: string | null) {
  return useQuery({
    queryKey: ["order_items", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase.from("order_items").select("*, products(name, unit)").eq("order_id", orderId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: { client_id: string; notes?: string; delivery_address?: string; items: { product_id: string; quantity: number; unit_price: number }[] }) => {
      const total = order.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
      const { data, error } = await supabase.from("orders").insert({ client_id: order.client_id, notes: order.notes || "", delivery_address: order.delivery_address || "", total, created_by: (await supabase.auth.getUser()).data.user?.id }).select().single();
      if (error) throw error;
      const items = order.items.map(i => ({ order_id: data.id, product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price, total: i.quantity * i.unit_price }));
      const { error: e2 } = await supabase.from("order_items").insert(items);
      if (e2) throw e2;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["orders"] }); toast({ title: "Commande créée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["orders"] }); toast({ title: "Commande mise à jour" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}
