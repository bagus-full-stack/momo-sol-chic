// ============================================================
// Sol-Chic — Edge Function : chat (RAG + Gemini)
// ============================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PHONE = "+226 76 20 69 27";
const FALLBACK = `Je n'ai pas la réponse précise, je vous invite à appeler le ${PHONE}`;

const SYSTEM_PROMPT = `Tu es l'assistant IA de Sol-Chic, entreprise de revêtement et rénovation sols & murs à Ouagadougou, Burkina Faso.
Services : carrelage-faïence, peinture, staff, faux plafonds et placo, toiture-charpente, étanchéité, vitrerie et finitions.
Réponds en français, de façon professionnelle et chaleureuse, jamais technique sans explication. Si le client écrit en Mooré ou Dioula, réponds dans la même langue (au mieux).
Réponds UNIQUEMENT à partir du CONTEXTE fourni. S'il ne contient pas la réponse, réponds exactement : "${FALLBACK}".
Règles strictes :
- Ne donne JAMAIS de prix ferme : uniquement des fourchettes indicatives, toujours suivies de "sous réserve de visite technique".
- Ne garantis JAMAIS une date d'intervention.
- Ne demande JAMAIS de numéro de téléphone ni d'email : invite le client à utiliser le formulaire de devis du site.
- Pour un pré-devis, collecte seulement la surface (m²) et le service.
- Pour les cas complexes, propose l'appel au ${PHONE} ou WhatsApp.`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit persistant (table rate_limits, migration 007) : survit aux cold starts
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
async function checkRateLimit(key: string, max: number): Promise<boolean> {
  const { data, error } = await db.rpc("check_rate_limit", { p_key: key, p_max: max, p_window_seconds: 60 });
  if (error) {
    // shortcut: fail-open si la base est injoignable (ne pas perdre un prospect), à durcir si abus constaté
    console.error("rate limit error:", error);
    return true;
  }
  return data === true;
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        outputDimensionality: 768, // colonne vector(768)
        content: { parts: [{ text }] },
        taskType: "RETRIEVAL_QUERY",
      }),
    }
  );
  if (!res.ok) throw new Error(`Embedding error: ${res.status}`);
  const data = await res.json();
  return data.embedding.values as number[];
}

// Modèles essayés dans l'ordre : on passe au suivant dès qu'un appel échoue (modèle arrêté, quota, surcharge)
const CHAT_MODELS = [
  "gemini-flash-latest",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-pro-latest",
];

// Dernier recours : tous les modèles de génération que la clé peut réellement appeler
async function discoverModels(): Promise<string[]> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${GEMINI_API_KEY}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.models ?? [])
    .filter((m: { name: string; supportedGenerationMethods?: string[] }) =>
      m.supportedGenerationMethods?.includes("generateContent") && /^models\/gemini-/.test(m.name) && !/(image|tts|audio|live|embedding|robotics|computer)/.test(m.name))
    .map((m: { name: string }) => m.name.replace("models/", ""));
}

async function callModel(
  model: string,
  systemPrompt: string,
  messages: { role: "user" | "model"; parts: { text: string }[] }[]
): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: messages,
        generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
      }),
    }
  );
  if (!res.ok) throw new Error(`${model}: HTTP ${res.status}`);
  const text = (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`${model}: réponse vide`);
  return text;
}

async function geminiChat(
  systemPrompt: string,
  messages: { role: "user" | "model"; parts: { text: string }[] }[]
): Promise<string> {
  const tried = new Set<string>();
  const attempt = async (models: string[]) => {
    for (const m of models) {
      if (tried.has(m)) continue;
      tried.add(m);
      try {
        return await callModel(m, systemPrompt, messages);
      } catch (e) {
        console.error("modèle en échec:", (e as Error).message);
      }
    }
    return null;
  };
  const answer = (await attempt(CHAT_MODELS)) ?? (await attempt(await discoverModels()));
  if (!answer) throw new Error("Tous les modèles Gemini ont échoué");
  return answer;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!(await checkRateLimit(`chat:${ip}`, 20))) {
    return new Response(JSON.stringify({ error: "Trop de requêtes. Réessayez dans 1 minute." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { messages } = await req.json() as {
      messages: { role: "user" | "assistant"; text: string }[];
    };

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "messages requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) throw new Error("Aucun message utilisateur");

    // ── 1. Embedding de la dernière question ──────────────────
    const embedding = await getEmbedding(String(lastUserMsg.text).slice(0, 1000));

    // ── 2. Recherche sémantique dans la base de connaissances ─
    const { data: chunks } = await db.rpc("match_knowledge_chunks", {
      query_embedding: embedding,
      match_threshold: 0.4,
      match_count: 5,
    });

    const context = chunks?.map((c: { content: string }) => c.content).join("\n\n") ?? "";

    // Aucun chunk pertinent : réponse de repli imposée, sans appeler le LLM
    if (!context) {
      return new Response(JSON.stringify({ answer: FALLBACK, sources: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 3. Construction du prompt enrichi ─────────────────────
    const enrichedSystem = context
      ? `${SYSTEM_PROMPT}\n\n--- CONTEXTE RÉCUPÉRÉ ---\n${context}\n--- FIN DU CONTEXTE ---`
      : SYSTEM_PROMPT;

    // ── 4. Conversion historique au format Gemini ─────────────
    const geminiMessages = messages.slice(-10).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.text).slice(0, 1000) }],
    }));

    // ── 5. Appel Gemini ───────────────────────────────────────
    const answer = await geminiChat(enrichedSystem, geminiMessages);

    return new Response(JSON.stringify({ answer, sources: chunks?.map((c: { category: string }) => c.category) ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("chat error:", err);
    return new Response(
      JSON.stringify({ error: "Une erreur interne s'est produite. Réessayez ou appelez-nous au +226 76 20 69 27." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
