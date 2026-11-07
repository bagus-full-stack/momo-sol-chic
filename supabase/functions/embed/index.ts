// ============================================================
// Sol-Chic — Edge Function : embed (indexation d'un chunk)
// Appelée par l'admin connecté (JWT Supabase Auth) avec { id }
// ============================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

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
        taskType: "RETRIEVAL_DOCUMENT",
      }),
    }
  );
  if (!res.ok) throw new Error(`Embedding error ${res.status}: ${await res.text()}`);
  return (await res.json()).embedding.values as number[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Seul un admin connecté (JWT utilisateur valide) peut indexer
  const token = (req.headers.get("authorization") ?? "").replace("Bearer ", "");
  const { data: auth } = await supabase.auth.getUser(token);
  if (!auth?.user) return json({ error: "Non autorisé" }, 401);

  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string") return json({ error: "id requis" }, 400);

    const { data: chunk, error: readErr } = await supabase
      .from("knowledge_chunks").select("content").eq("id", id).single();
    if (readErr || !chunk) return json({ error: "Chunk introuvable" }, 404);

    const embedding = await getEmbedding(chunk.content);
    const { error } = await supabase
      .from("knowledge_chunks")
      .update({ embedding, indexed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;

    return json({ id, success: true });
  } catch (err) {
    console.error("embed error:", err);
    return json({ error: "Erreur d'indexation" }, 500);
  }
});
