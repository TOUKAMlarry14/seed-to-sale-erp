import { supabase } from "@/integrations/supabase/client";

export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    await supabase.from("activity_logs").insert([{
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      user_id: user.id,
      user_name: profile?.full_name || user.email || "Inconnu",
      details: (details || {}) as any,
    }]);
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
}