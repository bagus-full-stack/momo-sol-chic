"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { KnowledgeChunk } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { embedChunk } from "@/lib/supabase-functions";

const CATEGORIES = [
  { value: "service", label: "Service" },
  { value: "faq", label: "FAQ" },
  { value: "tarifs", label: "Tarifs" },
  { value: "delais", label: "Délais" },
  { value: "contact", label: "Contact" },
  { value: "zone", label: "Zone d'intervention" },
];

export default function KnowledgeBasePage() {
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<KnowledgeChunk["category"]>("faq");
  const [adding, setAdding] = useState(false);
  const [embedding, setEmbedding] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("knowledge_chunks").select("*").order("created_at", { ascending: false });
    setChunks(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const triggerEmbed = async (id: string) => {
    setEmbedding(id);
    try {
      const { data } = await supabase.auth.getSession();
      await embedChunk(id, data.session!.access_token);
    } catch {
      alert("Indexation échouée. Réessayez.");
    }
    setEmbedding(null);
    await load();
  };

  const add = async () => {
    if (!content.trim()) return;
    setAdding(true);
    const { data, error } = await supabase.from("knowledge_chunks").insert({ content, category }).select().single();
    if (error) alert("Ajout échoué : " + error.message);
    else {
      setContent("");
      await triggerEmbed(data.id);
    }
    setAdding(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce chunk ?")) return;
    await supabase.from("knowledge_chunks").delete().eq("id", id);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-brand-navy">Base de connaissances IA</h1>
          <p className="text-sm text-gray-500 mt-1">Ces textes alimentent l'assistant RAG.</p>
        </div>
        <span className="text-sm text-gray-500">{chunks.length} chunk(s)</span>
      </div>

      {/* Add form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6 shadow-sm">
        <h2 className="font-bold text-brand-navy mb-4">Ajouter un contenu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Exemple : Q: Quel est le délai moyen pour une pose de carrelage ?\nR: Pour une surface de 50m², comptez 2 à 3 jours ouvrés."
              rows={4}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as KnowledgeChunk["category"])}
              options={CATEGORIES}
            />
            <Button onClick={add} disabled={adding || !content.trim()} className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              {adding ? "Ajout…" : "Ajouter"}
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Après ajout, le texte est vectorisé par l'Edge Function <code>embed</code>. Date d'indexation affichée sur chaque entrée.
        </p>
      </div>

      {/* List */}
      <div className="space-y-3">
        {chunks.map((c) => (
          <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={c.indexed_at ? "success" : "warning"} className="text-xs">
                  {c.indexed_at ? "Indexé " + new Date(c.indexed_at).toLocaleDateString("fr-FR") : "En attente"}
                </Badge>
                <span className="text-xs text-gray-400 capitalize">{c.category}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{c.content}</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {(
                <button
                  onClick={() => triggerEmbed(c.id)}
                  title="Indexer / réindexer"
                  className="text-gray-400 hover:text-brand-navy"
                >
                  <RefreshCw className={`h-4 w-4 ${embedding === c.id ? "animate-spin" : ""}`} />
                </button>
              )}
              <button onClick={() => remove(c.id)} className="text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {chunks.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-10">
            Base vide. Ajoutez des contenus pour alimenter l'assistant IA.
          </p>
        )}
      </div>
    </div>
  );
}
