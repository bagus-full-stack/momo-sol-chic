"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Briefcase, FileText, MessageSquare, BookOpen } from "lucide-react";
import Link from "next/link";

interface Stats {
  services: number;
  devis: number;
  temoignages: number;
  chunks: number;
  devisNouveaux: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ services: 0, devis: 0, temoignages: 0, chunks: 0, devisNouveaux: 0 });
  const [recentDevis, setRecentDevis] = useState<{ id: string; nom: string; service: string; created_at: string; statut: string }[]>([]);

  const [all, setAll] = useState<{ service: string; statut: string; created_at: string }[]>([]);

  useEffect(() => {
    supabase.from("devis").select("service,statut,created_at").then(({ data }) => setAll(data ?? []));
  }, []);

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i), 1);
    const key = d.toISOString().slice(0, 7);
    return { key, label: d.toLocaleDateString("fr-FR", { month: "short" }), n: all.filter((x) => x.created_at.startsWith(key)).length };
  });
  const maxN = Math.max(1, ...months.map((m) => m.n));
  const thisMonth = months[11].n;
  const countBy = (k: "service" | "statut") =>
    Object.entries(all.reduce<Record<string, number>>((acc, x) => ({ ...acc, [x[k]]: (acc[x[k]] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  const byService = countBy("service");
  const byStatut = countBy("statut");
  const conversion = all.length ? Math.round((all.filter((x) => x.statut === "traite").length / all.length) * 100) : 0;

  useEffect(() => {
    async function load() {
      const [s1, s2, s3, s4, s5, s6] = await Promise.all([
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("devis").select("id", { count: "exact", head: true }),
        supabase.from("temoignages").select("id", { count: "exact", head: true }),
        supabase.from("knowledge_chunks").select("id", { count: "exact", head: true }),
        supabase.from("devis").select("id", { count: "exact", head: true }).eq("statut", "nouveau"),
        supabase.from("devis").select("id,nom,service,created_at,statut").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        services: s1.count ?? 0,
        devis: s2.count ?? 0,
        temoignages: s3.count ?? 0,
        chunks: s4.count ?? 0,
        devisNouveaux: s5.count ?? 0,
      });
      setRecentDevis(s6.data ?? []);
    }
    load();
  }, []);

  const CARDS = [
    { label: "Services actifs", value: stats.services, icon: Briefcase, href: "/admin/services", color: "bg-brand-navy" },
    { label: "Devis reçus", value: stats.devis, icon: FileText, href: "/admin/devis", color: "bg-brand-gold", badge: stats.devisNouveaux > 0 ? `${stats.devisNouveaux} nouveaux` : null },
    { label: "Témoignages", value: stats.temoignages, icon: MessageSquare, href: "/admin/temoignages", color: "bg-green-600" },
    { label: "Chunks IA", value: stats.chunks, icon: BookOpen, href: "/admin/knowledge-base", color: "bg-purple-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-brand-navy mb-6">Tableau de bord</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CARDS.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              {card.badge && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                  {card.badge}
                </span>
              )}
            </div>
            <p className="text-3xl font-black text-brand-navy">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Statistiques */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="font-bold text-brand-navy mb-1">Devis par mois (12 derniers mois)</h2>
        <p className="text-sm text-gray-500 mb-4">
          Ce mois : {thisMonth} · Service le plus demandé : {byService[0]?.[0] ?? "—"} · Taux de conversion : {conversion} %
        </p>
        <div className="flex items-end gap-2 h-40" role="img" aria-label="Graphique des devis par mois">
          {months.map((m) => (
            <div key={m.key} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-xs text-gray-600">{m.n}</span>
              <div className="w-full rounded-t bg-brand-navy" style={{ height: `${(m.n / maxN) * 100}%`, minHeight: m.n ? 4 : 0 }} />
              <span className="text-xs text-gray-500 mt-1">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-6 mt-6 text-sm">
          <div>
            <p className="font-semibold text-brand-navy mb-2">Par service</p>
            {byService.map(([k, n]) => (<p key={k} className="flex justify-between"><span>{k}</span><span>{n}</span></p>))}
          </div>
          <div>
            <p className="font-semibold text-brand-navy mb-2">Par statut</p>
            {byStatut.map(([k, n]) => (<p key={k} className="flex justify-between"><span>{k.replace("_", " ")}</span><span>{n}</span></p>))}
          </div>
        </div>
      </div>

      {/* Recent devis */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-brand-navy">Derniers devis reçus</h2>
          <Link href="/admin/devis" className="text-sm text-brand-gold hover:underline">
            Voir tout
          </Link>
        </div>
        {recentDevis.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Client</th>
                <th className="px-6 py-3 text-left">Service</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentDevis.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-brand-navy">{d.nom}</td>
                  <td className="px-6 py-3 text-gray-600">{d.service}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(d.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      d.statut === "nouveau" ? "bg-blue-100 text-blue-700" :
                      d.statut === "en_cours" ? "bg-yellow-100 text-yellow-700" :
                      d.statut === "traite" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {d.statut.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-sm text-gray-500">Aucun devis pour le moment.</p>
        )}
      </div>
    </div>
  );
}
