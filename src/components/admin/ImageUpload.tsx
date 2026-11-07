"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

const MAX = 5 * 1024 * 1024; // 5 Mo
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// Envoie des photos dans le bucket Storage et renvoie les URLs publiques.
// Les contrôles MIME/taille sont aussi imposés côté serveur par le bucket (migration 006).
export default function ImageUpload({
  bucket,
  value,
  onChange,
  multiple = false,
}: {
  bucket: "services" | "realisations";
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setBusy(true);
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      if (!TYPES.includes(f.type) || f.size > MAX) {
        setError("Formats JPG/PNG/WebP, 5 Mo maximum.");
        continue;
      }
      const path = `${crypto.randomUUID()}.${f.type.split("/")[1]}`;
      const { error: e } = await supabase.storage.from(bucket).upload(path, f, { contentType: f.type });
      if (e) setError(e.message);
      else urls.push(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl);
    }
    onChange(multiple ? [...value, ...urls] : urls.length ? urls : value);
    setBusy(false);
  };

  return (
    <div>
      <input type="file" accept={TYPES.join(",")} multiple={multiple} disabled={busy} onChange={(e) => upload(e.target.files)} className="text-sm" />
      {busy && <p className="text-xs text-gray-500">Envoi…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((u, i) => (
          <div key={u} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-16 w-16 rounded object-cover" />
            {i === 0 && multiple && <span className="absolute bottom-0 left-0 bg-brand-gold text-[10px] px-1">Principale</span>}
            <button type="button" aria-label="Retirer" onClick={() => onChange(value.filter((x) => x !== u))} className="absolute -top-1 -right-1 rounded-full bg-red-600 text-white">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
