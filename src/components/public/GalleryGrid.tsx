"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { Realisation } from "@/types";

export default function GalleryGrid({ items }: { items: Realisation[] }) {
  const [service, setService] = useState("");
  const [year, setYear] = useState("");
  const [open, setOpen] = useState<Realisation | null>(null);

  const services = useMemo(() => Array.from(new Set(items.map((r) => r.services?.name).filter(Boolean))) as string[], [items]);
  const years = useMemo(
    () => Array.from(new Set(items.map((r) => r.realized_at?.slice(0, 4)).filter(Boolean))).sort().reverse() as string[],
    [items]
  );
  const shown = items.filter(
    (r) => (!service || r.services?.name === service) && (!year || r.realized_at?.slice(0, 4) === year)
  );

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-8 text-sm">
        <select value={service} onChange={(e) => setService(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" aria-label="Filtrer par service">
          <option value="">Tous les services</option>
          {services.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" aria-label="Filtrer par année">
          <option value="">Toutes les années</option>
          {years.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map((r) => (
          <button key={r.id} onClick={() => setOpen(r)} className="text-left rounded-xl overflow-hidden bg-white shadow-[0_1px_3px_rgba(26,58,107,0.12)] hover:shadow-[0_10px_24px_rgba(26,58,107,0.16)] hover:-translate-y-1 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <div className="relative aspect-video">
              <Image src={r.images[0]} alt={r.title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" loading="lazy" className="object-cover" />
            </div>
            <div className="p-3">
              <p className="font-bold text-brand-navy text-sm">{r.title}</p>
              <p className="text-xs text-gray-500">
                {r.services?.name}
                {r.realized_at && ` · ${new Date(r.realized_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}`}
              </p>
            </div>
          </button>
        ))}
      </div>
      {!shown.length && <p className="text-center text-gray-500 py-10">Aucun projet pour ce filtre.</p>}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setOpen(null)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(null)}
        >
          <button className="absolute top-4 right-4 text-white" aria-label="Fermer" onClick={() => setOpen(null)}>
            <X className="h-8 w-8" />
          </button>
          <div className="relative w-full max-w-4xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={open.images[0]} alt={open.title} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
