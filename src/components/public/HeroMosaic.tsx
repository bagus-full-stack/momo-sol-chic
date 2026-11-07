"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Vrais carreaux Sol-Chic (détourés du catalogue), empilés en éventail. Seul moment animé de l'accueil.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const SLABS = [
  { name: "decoratif", w: 534, h: 185, cls: "self-end relative z-0 md:-mb-5" },
  { name: "bois", w: 480, h: 164, cls: "hidden md:block self-start -mb-5 relative z-10" },
  { name: "pierre", w: 480, h: 175, cls: "hidden md:block self-center relative z-20" },
];

export default function HeroMosaic() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".slab", { opacity: 0, y: 28, x: (i) => (i % 2 ? -24 : 24), duration: 0.9, ease: "expo.out", stagger: 0.12 });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} aria-hidden="true" className="flex flex-col w-full max-w-sm md:max-w-lg md:ml-auto mt-2 md:mt-0">
      {SLABS.map((s) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.name}
          src={`${BASE}/tuiles/${s.name}.webp`}
          width={s.w}
          height={s.h}
          alt=""
          className={`slab w-[92%] h-auto drop-shadow-[0_14px_18px_rgba(0,0,0,0.35)] ${s.cls}`}
        />
      ))}
    </div>
  );
}
