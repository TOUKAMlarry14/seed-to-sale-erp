import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserToCreate {
  email: string;
  full_name: string;
  role: string;
}

function generatePassword(length = 16): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let pwd = "";
  for (let i = 0; i < length; i++) pwd += charset[bytes[i] % charset.length];
  // Ensure complexity
  return pwd.replace(/^./, "A").replace(/.$/, "9") + "!";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Require authenticated admin caller
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: userRes, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await authClient
      .from("user_roles").select("role").eq("user_id", userRes.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const users: UserToCreate[] = [
      { email: "admin@agroconnect.cm", full_name: "Admin AgroConnect", role: "admin" },
      { email: "chef.commercial@agroconnect.cm", full_name: "Claudine Ngassa", role: "commercial" },
      { email: "chef.logistique@agroconnect.cm", full_name: "Paul Atangana", role: "logistique" },
      { email: "chef.finance@agroconnect.cm", full_name: "Cécile Eyanga", role: "financier" },
      { email: "chef.rh@agroconnect.cm", full_name: "André Tamba", role: "rh" },
      { email: "jean.nkomo@agroconnect.cm", full_name: "Jean-Pierre Nkomo", role: "commercial" },
      { email: "sylvie.mbala@agroconnect.cm", full_name: "Sylvie Mbala", role: "commercial" },
      { email: "marie.fotso@agroconnect.cm", full_name: "Marie Fotso", role: "logistique" },
      { email: "diane.mbouda@agroconnect.cm", full_name: "Diane Mbouda", role: "financier" },
      { email: "fabrice.onana@agroconnect.cm", full_name: "Fabrice Onana", role: "livreur" },
      { email: "herve.kamga@agroconnect.cm", full_name: "Hervé Kamga", role: "livreur" },
      { email: "samuel.ekotto@agroconnect.cm", full_name: "Samuel Ekotto", role: "livreur" },
      { email: "eric.tchinda@agroconnect.cm", full_name: "Eric Tchinda", role: "livreur" },
      { email: "patrick.nkwelle@agroconnect.cm", full_name: "Patrick Nkwelle", role: "livreur" },
      { email: "rose.biya@agroconnect.cm", full_name: "Rose Biya", role: "rh" },
    ];

    const results: any[] = [];

    for (const u of users) {
      const password = generatePassword();
      // Check if user already exists
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
      const found = existing?.users?.find((eu: any) => eu.email === u.email);
      if (found) {
        await supabaseAdmin.auth.admin.updateUserById(found.id, {
          password,
          email_confirm: true,
          user_metadata: { full_name: u.full_name },
        });
        const { data: roleCheck } = await supabaseAdmin
          .from("user_roles")
          .select("id")
          .eq("user_id", found.id)
          .eq("role", u.role)
          .maybeSingle();
        if (!roleCheck) {
          await supabaseAdmin.from("user_roles").insert({ user_id: found.id, role: u.role });
        }
        results.push({ email: u.email, status: "reset", id: found.id, password });
        continue;
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      });

      if (authError) {
        results.push({ email: u.email, status: "error", error: authError.message });
        continue;
      }

      await supabaseAdmin.from("user_roles").insert({ user_id: authData.user.id, role: u.role });

      results.push({ email: u.email, status: "created", id: authData.user.id, password });
    }

    return new Response(JSON.stringify({
      success: true,
      warning: "Stockez ces mots de passe immédiatement — ils ne seront plus jamais affichés.",
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
