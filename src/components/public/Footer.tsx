import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";

const SERVICES = [
  { label: "Carrelage-faïence", slug: "carrelage-faience" },
  { label: "Peinture", slug: "peinture" },
  { label: "Staff & placo", slug: "staff" },
  { label: "Toiture-charpente", slug: "toiture-charpente" },
  { label: "Étanchéité", slug: "etancheite" },
  { label: "Vitrerie", slug: "vitrerie-et-autres-finitions" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-3">
              <span className="text-2xl font-black text-brand-gold">SOL</span>
              <span className="text-2xl font-black text-white">-CHIC</span>
            </div>
            <p className="text-sm text-white/70 mb-4">
              Votre partenaire de confiance pour tous vos travaux de rénovation et de construction à Ouagadougou.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="text-white/60 hover:text-brand-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-white/60 hover:text-brand-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-brand-gold mb-4">Nos Services</h3>
            <ul className="space-y-2">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-sm text-white/70 hover:text-brand-gold transition-colors"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens */}
          <div>
            <h3 className="font-bold text-brand-gold mb-4">Liens utiles</h3>
            <ul className="space-y-2">
              {[
                { href: "/realisations", label: "Réalisations" },
                { href: "/devis", label: "Demande de devis" },
                { href: "/faq", label: "FAQ" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/70 hover:text-brand-gold transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-brand-gold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-brand-gold" />
                Ouagadougou, Burkina Faso
              </li>
              <li>
                <a
                  href="tel:+22676206927"
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-brand-gold"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand-gold" />
                  +226 76 20 69 27
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@sol-chic.com"
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-brand-gold"
                >
                  <Mail className="h-4 w-4 shrink-0 text-brand-gold" />
                  contact@sol-chic.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Sol-Chic. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
