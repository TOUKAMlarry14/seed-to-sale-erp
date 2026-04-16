import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserToCreate {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const users: UserToCreate[] = [
      // Admin
      { email: "admin@agroconnect.cm", password: "Admin2026!", full_name: "Admin AgroConnect", role: "admin" },
      // Chefs de service
      { email: "chef.commercial@agroconnect.cm", password: "Chef2026!", full_name: "Claudine Ngassa", role: "commercial" },
      { email: "chef.logistique@agroconnect.cm", password: "Chef2026!", full_name: "Paul Atangana", role: "logistique" },
      { email: "chef.finance@agroconnect.cm", password: "Chef2026!", full_name: "Cécile Eyanga", role: "financier" },
      { email: "chef.rh@agroconnect.cm", password: "Chef2026!", full_name: "André Tamba", role: "rh" },
      // Employés commerciaux
      { email: "jean.nkomo@agroconnect.cm", password: "Employe2026!", full_name: "Jean-Pierre Nkomo", role: "commercial" },
      { email: "sylvie.mbala@agroconnect.cm", password: "Employe2026!", full_name: "Sylvie Mbala", role: "commercial" },
      // Employés logistique
      { email: "marie.fotso@agroconnect.cm", password: "Employe2026!", full_name: "Marie Fotso", role: "logistique" },
      // Employé finance
      { email: "diane.mbouda@agroconnect.cm", password: "Employe2026!", full_name: "Diane Mbouda", role: "financier" },
      // Livreurs
      { email: "fabrice.onana@agroconnect.cm", password: "Employe2026!", full_name: "Fabrice Onana", role: "livreur" },
      { email: "herve.kamga@agroconnect.cm", password: "Employe2026!", full_name: "Hervé Kamga", role: "livreur" },
      { email: "samuel.ekotto@agroconnect.cm", password: "Employe2026!", full_name: "Samuel Ekotto", role: "livreur" },
      { email: "eric.tchinda@agroconnect.cm", password: "Employe2026!", full_name: "Eric Tchinda", role: "livreur" },
      { email: "patrick.nkwelle@agroconnect.cm", password: "Employe2026!", full_name: "Patrick Nkwelle", role: "livreur" },
      // Employés RH
      { email: "rose.biya@agroconnect.cm", password: "Employe2026!", full_name: "Rose Biya", role: "rh" },
    ];

    const results: any[] = [];

    for (const u of users) {
      // Check if user already exists
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
      const found = existing?.users?.find((eu: any) => eu.email === u.email);
      if (found) {
        // Ensure role exists
        const { data: roleCheck } = await supabaseAdmin
          .from("user_roles")
          .select("id")
          .eq("user_id", found.id)
          .eq("role", u.role)
          .maybeSingle();
        if (!roleCheck) {
          await supabaseAdmin.from("user_roles").insert({ user_id: found.id, role: u.role });
        }
        results.push({ email: u.email, status: "exists", id: found.id });
        continue;
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      });

      if (authError) {
        results.push({ email: u.email, status: "error", error: authError.message });
        continue;
      }

      // Assign role
      await supabaseAdmin.from("user_roles").insert({ user_id: authData.user.id, role: u.role });

      results.push({ email: u.email, status: "created", id: authData.user.id });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
