import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cron-invoked function: notifies admin/RH 7 days before any employee bonus expires.
// Idempotent per (employee, expiry) day — we re-check existing notifications by title prefix.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const expected = Deno.env.get("CRON_SECRET");
    const provided = req.headers.get("x-cron-secret");
    if (!expected || provided !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const today = new Date();
    const target = new Date(today);
    target.setDate(target.getDate() + 7);
    const targetIso = target.toISOString().slice(0, 10);

    const { data: employees, error: empErr } = await supabaseAdmin
      .from("employees")
      .select("id, name, bonus_amount, bonus_expiry")
      .not("bonus_expiry", "is", null)
      .gt("bonus_amount", 0)
      .lte("bonus_expiry", targetIso)
      .gte("bonus_expiry", today.toISOString().slice(0, 10));
    if (empErr) throw empErr;

    const { data: rhAdmins, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "rh"]);
    if (roleErr) throw roleErr;
    const recipients = Array.from(new Set((rhAdmins ?? []).map((r: any) => r.user_id)));

    let created = 0;
    for (const emp of employees ?? []) {
      const title = `Bonus expirant : ${emp.name}`;
      for (const userId of recipients) {
        const { data: existing } = await supabaseAdmin
          .from("notifications")
          .select("id")
          .eq("user_id", userId)
          .eq("title", title)
          .gte("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString())
          .maybeSingle();
        if (existing) continue;
        await supabaseAdmin.from("notifications").insert({
          user_id: userId,
          title,
          message: `Le bonus de ${emp.name} (${Number(emp.bonus_amount).toLocaleString("fr-FR")} FCFA) expire le ${emp.bonus_expiry}.`,
          type: "warning",
          route: `/modules/employes`,
        });
        created++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, employees_checked: employees?.length ?? 0, notifications_created: created }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});