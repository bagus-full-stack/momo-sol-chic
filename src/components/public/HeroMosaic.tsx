"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Mosaïque de carreaux (le métier de Sol-Chic) : seul moment animé de l'accueil.
const TONES = ["bg-brand-gold", "bg-brand-navy-light", "bg-white/10", "bg-white/20", "bg-brand-gold-light", "bg-white/5"];
const TILES = Array.from({ length: 24 }, (_, i) => TONES[(i * 7 + (i % 5)) % TONES.length]);

export default function HeroMosaic() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".tile", {
          opacity: 0,
          scale: 0.6,
          rotate: -6,
          duration: 0.7,
          ease: "expo.out",
          stagger: { each: 0.035, grid: [4, 6], from: "start" },
        });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} aria-hidden="true" className="hidden md:grid grid-cols-6 gap-2 w-full max-w-md ml-auto">
      {TILES.map((tone, i) => (
        <div key={i} className={`tile aspect-square rounded-md ${tone} shadow-[0_2px_6px_rgba(0,0,0,0.25)]`} />
      ))}
    </div>
  );
}
