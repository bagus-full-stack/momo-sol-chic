"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/calculateur", label: "Calculateur" },
  { href: "/devis", label: "Devis gratuit" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-navy shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center font-display" aria-label="Sol-Chic, accueil">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo-emblem.webp`} width={48} height={40} alt="" className="h-10 w-auto mr-2" />
            <span className="text-2xl font-extrabold text-brand-gold">SOL</span>
            <span className="text-2xl font-extrabold text-white">-CHIC</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-white/80 hover:text-brand-gold transition-colors",
                  link.href === "/devis" &&
                    "rounded-full bg-brand-gold px-4 py-1.5 text-brand-navy hover:bg-brand-gold-light hover:text-brand-navy"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Phone CTA */}
          <a
            href="tel:+22676206927"
            className="hidden md:flex items-center gap-2 text-brand-gold hover:text-brand-gold-light transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="text-sm font-semibold">+226 76 20 69 27</span>
          </a>

          {/* Mobile burger */}
          <button
            className="md:hidden text-white"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-brand-navy border-t border-white/10 px-4 pb-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-white/80 hover:text-brand-gold border-b border-white/10 last:border-0"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:+22676206927"
            className="mt-3 flex items-center gap-2 text-brand-gold"
          >
            <Phone className="h-4 w-4" />
            <span className="text-sm font-semibold">+226 76 20 69 27</span>
          </a>
        </div>
      )}
    </header>
  );
}
