"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

// Carte OSM chargée au clic : évite ~1 Mo de tuiles sur connexion lente (LCP)
export default function MapEmbed() {
  const [show, setShow] = useState(false);
  if (show)
    return (
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=-1.6,12.3,-1.4,12.4&layer=mapnik"
        className="flex-1 w-full min-h-[320px]"
        style={{ border: 0 }}
        title="Carte Ouagadougou"
      />
    );
  return (
    <button
      onClick={() => setShow(true)}
      className="flex-1 min-h-[320px] w-full bg-brand-light flex flex-col items-center justify-center gap-2 text-brand-navy font-semibold"
    >
      <MapPin className="h-8 w-8" />
      Afficher la carte (Ouagadougou)
    </button>
  );
}
