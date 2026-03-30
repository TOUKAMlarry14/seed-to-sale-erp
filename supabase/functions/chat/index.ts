import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es l'assistant IA d'AgroConnect SARL, une PME de distribution agroalimentaire basée à Douala, Cameroun.

À propos d'AgroConnect:
- Fondée en 2020, AgroConnect connecte les producteurs agricoles camerounais aux points de vente urbains
- Spécialisée dans la distribution de produits frais, céréales, huiles et boissons
- Basée à Douala avec un entrepôt relais et une flotte de livraison
- Équipe de ~12 employés répartis en 5 départements : Direction, Commercial, Logistique, Finance, RH

À propos de l'ERP:
- Module 1 (Ventes) : Catalogue produits, Gestion clients, Commandes, Factures
- Module 2 (Stocks) : Inventaire temps réel, Mouvements de stock, Fournisseurs, Livraisons
- Module 3 (Finance) : Journal des transactions, Reporting financier, Trésorerie
- Module 4 (RH) : Fiches employés, Pointage présences, Gestion de la paie (CNPS 2.8%)

Règles:
- Réponds toujours en français sauf si l'utilisateur parle en anglais
- Sois concis, professionnel et utile
- Guide les utilisateurs sur l'utilisation des modules ERP
- Devise : FCFA (Franc CFA)`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
