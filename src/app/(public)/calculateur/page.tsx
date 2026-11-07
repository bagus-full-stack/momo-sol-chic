"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Hypothèses : carreau 60×60 cm (0,36 m²), +10 % de chutes, colle 5 kg/m² (sac 25 kg), joint 0,5 kg/m² (sac 5 kg)
function calcule(m2: number) {
  const carreaux = Math.ceil((m2 * 1.1) / 0.36);
  return { carreaux, colle: Math.ceil((m2 * 5) / 25), joints: Math.ceil((m2 * 0.5) / 5) };
}

export default function CalculateurPage() {
  const [largeur, setLargeur] = useState("");
  const [longueur, setLongueur] = useState("");
  const [direct, setDirect] = useState("");

  const l = parseFloat(largeur.replace(",", "."));
  const L = parseFloat(longueur.replace(",", "."));
  const d = parseFloat(direct.replace(",", "."));
  const m2 = d > 0 ? d : l > 0 && L > 0 ? l * L : 0;
  const r = m2 > 0 ? calcule(m2) : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-brand-navy mb-2">Calculateur de surface</h1>
      <p className="text-gray-600 mb-8">Estimez la quantité de carrelage, colle et joints (carreaux 60×60 cm, 10 % de chutes).</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <label className="text-sm">Largeur (m)<Input inputMode="decimal" value={largeur} onChange={(e) => { setLargeur(e.target.value); setDirect(""); }} /></label>
        <label className="text-sm">Longueur (m)<Input inputMode="decimal" value={longueur} onChange={(e) => { setLongueur(e.target.value); setDirect(""); }} /></label>
      </div>
      <label className="text-sm block mb-6">ou surface directe (m²)<Input inputMode="decimal" value={direct} onChange={(e) => setDirect(e.target.value)} /></label>

      {r && (
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_3px_rgba(26,58,107,0.12)] mb-6" aria-live="polite">
          <p className="font-bold text-brand-navy mb-3">Surface : {m2.toFixed(1)} m²</p>
          <ul className="space-y-1 text-gray-700">
            <li>{r.carreaux} carreaux recommandés</li>
            <li>{r.colle} sac(s) de colle (25 kg)</li>
            <li>{r.joints} sac(s) de joint (5 kg)</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">Estimation indicative, sous réserve de visite technique.</p>
        </div>
      )}

      <Button asChild disabled={!r}>
        <Link href={r ? `/devis?service=Carrelage-fa%C3%AFence&surface=${m2.toFixed(1)}` : "/devis"}>
          Demander un devis pour cette surface
        </Link>
      </Button>
    </div>
  );
}
