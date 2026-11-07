// ============================================================
// Sol-Chic — Edge Function : devis (soumission + email)
// ============================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "contact@sol-chic.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiter par IP (20 devis/min max)
const rateLimiter = new Map<string, { count: number; reset: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(ip);
  if (!entry || now > entry.reset) {
    rateLimiter.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

async function sendNotificationEmail(devis: Record<string, unknown>) {
  if (!RESEND_API_KEY) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Sol-Chic <noreply@sol-chic.com>",
      to: [ADMIN_EMAIL],
      subject: `Nouveau devis : ${String(devis.service).replace(/[\r\n]/g, " ")} — ${String(devis.nom).replace(/[\r\n]/g, " ")}`,
      html: `
        <h2 style="color:#1a3a6b">Nouvelle demande de devis</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold">Client</td><td style="padding:8px">${esc(devis.nom)}</td></tr>
          <tr style="background:#f8f9fa"><td style="padding:8px;font-weight:bold">Téléphone</td><td style="padding:8px">${esc(devis.telephone)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${esc(devis.email) || "—"}</td></tr>
          <tr style="background:#f8f9fa"><td style="padding:8px;font-weight:bold">Service</td><td style="padding:8px">${esc(devis.service)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Surface</td><td style="padding:8px">${devis.surface_m2 ? esc(devis.surface_m2) + " m²" : "—"}</td></tr>
          <tr style="background:#f8f9fa"><td style="padding:8px;font-weight:bold">Disponibilité</td><td style="padding:8px">${esc(devis.disponibilite) || "—"}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Message</td><td style="padding:8px">${esc(devis.message) || "—"}</td></tr>
        </table>
        <p style="color:#666;margin-top:16px">Répondez rapidement pour convertir ce prospect !</p>
      `,
    }),
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: "Trop de requêtes. Veuillez patienter." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const payload = await req.json();

    // Honeypot : un bot remplit ce champ caché ; on répond succès sans rien enregistrer
    if (payload.website) {
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validation
    const surface = payload.surface_m2 == null || payload.surface_m2 === "" ? null : Number(payload.surface_m2);
    if (
      !payload.nom || !payload.telephone || !payload.service ||
      !/^[+\d][\d\s().-]{7,19}$/.test(String(payload.telephone)) ||
      (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(payload.email))) ||
      (surface !== null && (!Number.isFinite(surface) || surface <= 0 || surface > 100000))
    ) {
      return new Response(
        JSON.stringify({ error: "Champs invalides ou manquants : nom, téléphone, service." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insertion en base
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
      .from("devis")
      .insert({
        nom: String(payload.nom).slice(0, 100),
        telephone: String(payload.telephone).slice(0, 20),
        email: payload.email ? String(payload.email).slice(0, 150) : null,
        service: String(payload.service).slice(0, 100),
        surface_m2: surface,
        message: payload.message ? String(payload.message).slice(0, 1000) : null,
        disponibilite: payload.disponibilite ? String(payload.disponibilite).slice(0, 100) : null,
      })
      .select()
      .single();

    if (error) throw error;

    // Notification email (non bloquant)
    sendNotificationEmail(data).catch(console.error);

    return new Response(
      JSON.stringify({ success: true, id: data.id, message: "Votre demande a bien été envoyée." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("devis error:", err);
    return new Response(
      JSON.stringify({ error: "Erreur lors de l'enregistrement. Réessayez ou appelez-nous." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
