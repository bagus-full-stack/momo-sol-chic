"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CatalogueProduit } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type FormData = Omit<CatalogueProduit, "id">;
const EMPTY: FormData = { nom: "", type: "carrelage", description: "", formats: [], image_url: null, is_active: true };
const TYPE_OPTIONS = [{ value: "carrelage", label: "Carrelage" }, { value: "peinture", label: "Peinture" }, { value: "autre", label: "Autre" }];

export default function AdminCataloguePage() {
  const [items, setItems] = useState<CatalogueProduit[]>([]);
  const [editing, setEditing] = useState<CatalogueProduit | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formatsStr, setFormatsStr] = useState("");

  const load = async () => {
    const { data } = await supabase.from("catalogue_produits").select("*").order("nom");
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setFormatsStr(""); setShowForm(true); };
  const openEdit = (p: CatalogueProduit) => {
    setEditing(p); setForm({ ...p }); setFormatsStr(p.formats.join(", ")); setShowForm(true);
  };
  const cancel = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const save = async () => {
    setSaving(true);
    const payload = { ...form, formats: formatsStr.split(",").map((f) => f.trim()).filter(Boolean) };
    if (editing) {
      await supabase.from("catalogue_produits").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("catalogue_produits").insert(payload);
    }
    await load(); cancel(); setSaving(false);
  };

  const toggleActive = async (p: CatalogueProduit) => {
    await supabase.from("catalogue_produits").update({ is_active: !p.is_active }).eq("id", p.id);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await supabase.from("catalogue_produits").delete().eq("id", id);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-brand-navy">Catalogue produits</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nouveau</Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6 shadow-sm">
          <h2 className="font-bold text-brand-navy mb-4">{editing ? "Modifier" : "Nouveau produit"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Nom *</label>
              <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Type</label>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CatalogueProduit["type"] })} options={TYPE_OPTIONS} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Formats (séparés par virgule)</label>
              <Input value={formatsStr} onChange={(e) => setFormatsStr(e.target.value)} placeholder="30x60, 60x60, 80x80" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">URL image</label>
              <Input value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
            <Button variant="ghost" onClick={cancel}>Annuler</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p.id} className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${!p.is_active ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-brand-navy text-sm">{p.nom}</p>
                <p className="text-xs text-gray-400 capitalize">{p.type}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleActive(p)} className="text-gray-400 hover:text-brand-navy">
                  {p.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-brand-navy">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(p.id)} className="text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{p.description}</p>
            {p.formats.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {p.formats.map((f) => (
                  <span key={f} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{f}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="col-span-3 text-center text-sm text-gray-500 py-10">Aucun produit dans le catalogue.</p>
        )}
      </div>
    </div>
  );
}
