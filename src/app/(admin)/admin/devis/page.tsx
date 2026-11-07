"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Devis } from "@/types";
import { SERVICES_LIST } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, X } from "lucide-react";

const STATUTS: { value: Devis["statut"]; label: string }[] = [
  { value: "nouveau", label: "Nouveau" },
  { value: "en_cours", label: "En cours" },
  { value: "traite", label: "Traité" },
  { value: "annule", label: "Annulé" },
];

// Neutralise l'injection de formules Excel et échappe les guillemets
const csvCell = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

export default function AdminDevisPage() {
  const [rows, setRows] = useState<Devis[]>([]);
  const [selected, setSelected] = useState<Devis | null>(null);
  const [service, setService] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = async () => {
    const { data } = await supabase.from("devis").select("*").order("created_at", { ascending: false });
    setRows((data as Devis[]) ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("devis-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "devis" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!service || r.service === service) &&
          (!from || r.created_at.slice(0, 10) >= from) &&
          (!to || r.created_at.slice(0, 10) <= to)
      ),
    [rows, service, from, to]
  );

  const setStatut = async (id: string, statut: Devis["statut"]) => {
    await supabase.from("devis").update({ statut }).eq("id", id);
    setRows((r) => r.map((d) => (d.id === id ? { ...d, statut } : d)));
    setSelected((s) => (s && s.id === id ? { ...s, statut } : s));
  };

  const exportCsv = () => {
    const head = ["Date", "Nom", "Téléphone", "Email", "Service", "Surface m²", "Disponibilité", "Statut", "Message"];
    const lines = filtered.map((d) =>
      [d.created_at.slice(0, 10), d.nom, d.telephone, d.email, d.service, d.surface_m2, d.disponibilite, d.statut, d.message]
        .map(csvCell)
        .join(",")
    );
    const blob = new Blob(["﻿" + [head.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "devis.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-black text-brand-navy">Demandes de devis</h1>
        <Button onClick={exportCsv} disabled={!filtered.length}>
          <Download className="h-4 w-4 mr-1" /> Export CSV ({filtered.length})
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <select value={service} onChange={(e) => setService(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2">
          <option value="">Tous les services</option>
          {SERVICES_LIST.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" aria-label="Du" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" aria-label="Au" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Téléphone</th>
              <th className="p-3">Service</th>
              <th className="p-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(d)}>
                <td className="p-3 whitespace-nowrap">{new Date(d.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="p-3 font-medium">{d.nom}</td>
                <td className="p-3">{d.telephone}</td>
                <td className="p-3">{d.service}</td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={d.statut}
                    onChange={(e) => setStatut(d.id, e.target.value as Devis["statut"])}
                    className="rounded-md border border-gray-300 px-2 py-1"
                  >
                    {STATUTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p className="p-8 text-center text-gray-500">Aucune demande.</p>}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-brand-navy">{selected.nom}</h2>
              <button onClick={() => setSelected(null)} aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              <div><dt className="inline font-semibold">Téléphone : </dt><dd className="inline"><a href={`tel:${selected.telephone}`} className="text-brand-navy underline">{selected.telephone}</a></dd></div>
              <div><dt className="inline font-semibold">Email : </dt><dd className="inline">{selected.email ?? "—"}</dd></div>
              <div><dt className="inline font-semibold">Service : </dt><dd className="inline">{selected.service}</dd></div>
              <div><dt className="inline font-semibold">Surface : </dt><dd className="inline">{selected.surface_m2 ? `${selected.surface_m2} m²` : "—"}</dd></div>
              <div><dt className="inline font-semibold">Disponibilité : </dt><dd className="inline">{selected.disponibilite ?? "—"}</dd></div>
              <div><dt className="font-semibold">Message :</dt><dd className="whitespace-pre-wrap text-gray-700">{selected.message ?? "—"}</dd></div>
            </dl>
            <Badge className="mt-4">{STATUTS.find((s) => s.value === selected.statut)?.label}</Badge>
          </div>
        </div>
      )}
    </div>
  );
}
