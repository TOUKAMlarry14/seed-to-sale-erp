import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Verify caller is admin
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
  if (!caller) return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const { data: callerRole } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", caller.id);
  const isAdmin = callerRole?.some((r: any) => r.role === "admin" || r.role === "techadmin");
  if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    // LIST all users
    if (req.method === "GET" && action === "list") {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 500 });
      if (error) throw error;

      const { data: allRoles } = await supabaseAdmin.from("user_roles").select("*");
      const { data: allProfiles } = await supabaseAdmin.from("profiles").select("*");

      const enriched = users.map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: allProfiles?.find((p: any) => p.id === u.id)?.full_name || "",
        roles: allRoles?.filter((r: any) => r.user_id === u.id).map((r: any) => r.role) || [],
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed_at: u.email_confirmed_at,
      }));

      return new Response(JSON.stringify(enriched), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ADD role
    if (req.method === "POST" && action === "add-role") {
      const { user_id, role } = await req.json();
      const { error } = await supabaseAdmin.from("user_roles").insert({ user_id, role });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // REMOVE role
    if (req.method === "POST" && action === "remove-role") {
      const { user_id, role } = await req.json();
      const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // DELETE user
    if (req.method === "POST" && action === "delete-user") {
      const { user_id } = await req.json();
      if (user_id === caller.id) throw new Error("Cannot delete yourself");
      await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
      await supabaseAdmin.from("profiles").delete().eq("id", user_id);
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // UPDATE profile name
    if (req.method === "POST" && action === "update-profile") {
      const { user_id, full_name } = await req.json();
      const { error } = await supabaseAdmin.from("profiles").update({ full_name }).eq("id", user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
