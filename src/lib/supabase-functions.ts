// ============================================================
// Sol-Chic — Wrappers Supabase Edge Functions
// ============================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function functionsUrl(name: string) {
  return `${SUPABASE_URL}/functions/v1/${name}`;
}

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

// ── Chat RAG ─────────────────────────────────────────────────
export interface ChatResponse {
  answer: string;
  sources?: string[];
}

export async function chatWithAI(
  messages: { role: "user" | "assistant"; text: string }[],
  sessionId?: string
): Promise<ChatResponse> {
  const res = await fetch(functionsUrl("chat"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ messages, sessionId }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Erreur lors de la communication avec l'IA");
  }
  return res.json();
}

// ── Devis ─────────────────────────────────────────────────────
export interface DevisPayload {
  nom: string;
  telephone: string;
  email?: string;
  service: string;
  surface_m2?: number;
  message?: string;
  disponibilite?: string;
}

export interface DevisResponse {
  success: boolean;
  id?: string;
  message?: string;
}

export async function submitDevis(
  payload: DevisPayload
): Promise<DevisResponse> {
  const res = await fetch(functionsUrl("devis"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Erreur lors de l'envoi du devis");
  }
  return res.json();
}

// ── Embed (admin) : indexe un chunk existant avec le JWT de l'admin ──
export async function embedChunk(id: string, accessToken: string): Promise<void> {
  const res = await fetch(functionsUrl("embed"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Erreur lors de l'indexation");
}
