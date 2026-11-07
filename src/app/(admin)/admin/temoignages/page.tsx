"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Temoignage } from "@/types";
import { Button } from "@/components/ui/button";
import { Star, Eye, EyeOff, Trash2 } from "lucide-react";

export default function AdminTemoignagesPage() {
  const [items, setItems] = useState<Temoignage[]>([]);

  const load = async () => {
    const { data } = await supabase.from("temoignages").select("*, services(name)").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const togglePublish = async (t: Temoignage) => {
    await supabase.from("temoignages").update({ is_published: !t.is_published }).eq("id", t.id);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return;
    await supabase.from("temoignages").delete().eq("id", id);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-brand-navy">Témoignages</h1>
        <span className="text-sm text-gray-500">{items.length} témoignage(s)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((t) => (
          <div key={t.id} className={`rounded-xl border p-5 bg-white shadow-sm ${!t.is_published ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-brand-navy">{t.prenom}</p>
                <p className="text-xs text-gray-400">{t.ville}{t.services ? ` · ${t.services.name}` : ""}</p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < t.note ? "fill-brand-gold text-brand-gold" : "text-gray-200"}`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-700 italic mb-4">"{t.commentaire}"</p>
            <div className="flex gap-2">
              <Button size="sm" variant={t.is_published ? "ghost" : "navy"} onClick={() => togglePublish(t)}>
                {t.is_published ? <><EyeOff className="h-3.5 w-3.5 mr-1" /> Masquer</> : <><Eye className="h-3.5 w-3.5 mr-1" /> Publier</>}
              </Button>
              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => remove(t.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="col-span-2 text-center text-sm text-gray-500 py-10">Aucun témoignage pour le moment.</p>
        )}
      </div>
    </div>
  );
}
