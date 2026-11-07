"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Realisation } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/admin/ImageUpload";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

type FormData = Omit<Realisation, "id" | "created_at" | "services">;

const EMPTY: FormData = {
  service_id: "", title: "", description: "",
  images: [], before_image: null, after_image: null, realized_at: "",
};

export default function AdminRealisationsPage() {
  const [items, setItems] = useState<Realisation[]>([]);
  const [editing, setEditing] = useState<Realisation | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("realisations").select("*, services(name)").order("realized_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (r: Realisation) => {
    setEditing(r);
    setForm({ service_id: r.service_id, title: r.title, description: r.description, images: r.images, before_image: r.before_image, after_image: r.after_image, realized_at: r.realized_at });
    setShowForm(true);
  };
  const cancel = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const save = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from("realisations").update(form).eq("id", editing.id);
    } else {
      await supabase.from("realisations").insert(form);
    }
    await load(); cancel(); setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette réalisation ?")) return;
    await supabase.from("realisations").delete().eq("id", id);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-brand-navy">Réalisations</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nouveau</Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6 shadow-sm">
          <h2 className="font-bold text-brand-navy mb-4">{editing ? "Modifier" : "Nouvelle réalisation"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Titre *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Date réalisation</label>
              <Input type="date" value={form.realized_at} onChange={(e) => setForm({ ...form, realized_at: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Photos du projet (la 1re est la principale)</label>
              <ImageUpload bucket="realisations" multiple value={form.images} onChange={(images) => setForm({ ...form, images })} />
              <label className="text-xs font-medium text-gray-500 mb-1 mt-3 block">Image avant</label>
              <ImageUpload bucket="realisations" value={form.before_image ? [form.before_image] : []} onChange={(u) => setForm({ ...form, before_image: u[0] ?? null })} />
              <label className="text-xs font-medium text-gray-500 mb-1 mt-3 block">URL image avant</label>
              <Input value={form.before_image ?? ""} onChange={(e) => setForm({ ...form, before_image: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Image après</label>
              <ImageUpload bucket="realisations" value={form.after_image ? [form.after_image] : []} onChange={(u) => setForm({ ...form, after_image: u[0] ?? null })} />
              <label className="text-xs font-medium text-gray-500 mb-1 mt-3 block">URL image après</label>
              <Input value={form.after_image ?? ""} onChange={(e) => setForm({ ...form, after_image: e.target.value })} placeholder="https://..." />
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

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Titre</th>
              <th className="px-6 py-3 text-left">Service</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-brand-navy">{r.title}</td>
                <td className="px-6 py-3 text-gray-500">{r.services?.name ?? "—"}</td>
                <td className="px-6 py-3 text-gray-500">{r.realized_at ? formatDate(r.realized_at) : "—"}</td>
                <td className="px-6 py-3 text-right flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(r)} className="text-gray-400 hover:text-brand-navy"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(r.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="p-6 text-sm text-gray-500 text-center">Aucune réalisation.</p>}
      </div>
    </div>
  );
}
