import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PASSWORDS: Record<string, string> = {
  "admin@agroconnect.cm": "Admin2026!",
  "chef.commercial@agroconnect.cm": "Chef2026!",
  "chef.logistique@agroconnect.cm": "Chef2026!",
  "chef.finance@agroconnect.cm": "Chef2026!",
  "chef.rh@agroconnect.cm": "Chef2026!",
  "jean.nkomo@agroconnect.cm": "Employe2026!",
  "sylvie.mbala@agroconnect.cm": "Employe2026!",
  "marie.fotso@agroconnect.cm": "Employe2026!",
  "diane.mbouda@agroconnect.cm": "Employe2026!",
  "fabrice.onana@agroconnect.cm": "Employe2026!",
  "herve.kamga@agroconnect.cm": "Employe2026!",
  "samuel.ekotto@agroconnect.cm": "Employe2026!",
  "eric.tchinda@agroconnect.cm": "Employe2026!",
  "patrick.nkwelle@agroconnect.cm": "Employe2026!",
  "rose.biya@agroconnect.cm": "Employe2026!",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const out: any[] = [];
    for (const u of data?.users || []) {
      const pwd = PASSWORDS[u.email || ""];
      if (!pwd) continue;
      const { error } = await admin.auth.admin.updateUserById(u.id, {
        password: pwd,
        email_confirm: true,
      });
      out.push({ email: u.email, status: error ? `error: ${error.message}` : "reset" });
    }
    return new Response(JSON.stringify({ ok: true, results: out }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
