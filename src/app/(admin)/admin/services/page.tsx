"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Service } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/admin/ImageUpload";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type FormData = Omit<Service, "id" | "created_at">;

const EMPTY: FormData = {
  slug: "", name: "", short_description: "", long_description: "",
  icon: "🏠", price_range: "", images: [], order: 0, is_active: true,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("services").select("*").order("order");
    setServices(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm({ ...s }); setShowForm(true); };
  const cancel = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const save = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from("services").update(form).eq("id", editing.id);
    } else {
      await supabase.from("services").insert(form);
    }
    await load();
    cancel();
    setSaving(false);
  };

  const toggleActive = async (s: Service) => {
    await supabase.from("services").update({ is_active: !s.is_active }).eq("id", s.id);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce service ?")) return;
    await supabase.from("services").delete().eq("id", id);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-brand-navy">Services</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Nouveau
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6 shadow-sm">
          <h2 className="font-bold text-brand-navy mb-4">{editing ? "Modifier" : "Nouveau service"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Nom *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Slug *</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Photos</label>
              <ImageUpload bucket="services" multiple value={form.images} onChange={(images) => setForm({ ...form, images })} />
              <label className="text-xs font-medium text-gray-500 mb-1 mt-3 block">Icône (emoji)</label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-20" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Tarif indicatif</label>
              <Input value={form.price_range} onChange={(e) => setForm({ ...form, price_range: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Description courte</label>
              <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Description longue</label>
              <Textarea value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} rows={5} />
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
              <th className="px-6 py-3 text-left">Service</th>
              <th className="px-6 py-3 text-left">Slug</th>
              <th className="px-6 py-3 text-left">Statut</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <span className="mr-2">{s.icon}</span>
                  <span className="font-medium text-brand-navy">{s.name}</span>
                </td>
                <td className="px-6 py-3 text-gray-500 font-mono text-xs">{s.slug}</td>
                <td className="px-6 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-6 py-3 text-right flex items-center justify-end gap-2">
                  <button onClick={() => toggleActive(s)} title="Toggle actif" className="text-gray-400 hover:text-brand-navy">
                    {s.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-brand-navy">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(s.id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && (
          <p className="p-6 text-sm text-gray-500 text-center">Aucun service. Cliquez sur "Nouveau" pour commencer.</p>
        )}
      </div>
    </div>
  );
}
