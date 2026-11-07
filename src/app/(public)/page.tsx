import Link from "next/link";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/public/ServiceCard";
import TestimonialCard from "@/components/public/TestimonialCard";
import { supabase } from "@/lib/supabase";
import type { Service, Temoignage } from "@/types";
import { ArrowRight, CheckCircle, Star, Shield, Clock } from "lucide-react";

async function getData() {
  const [{ data: services }, { data: temoignages }] = await Promise.all([
    supabase.from("services").select("*").eq("is_active", true).order("order").limit(7),
    supabase.from("temoignages").select("*, services(name)").eq("is_published", true).limit(3),
  ]);
  return { services: (services ?? []) as Service[], temoignages: (temoignages ?? []) as Temoignage[] };
}

export default async function HomePage() {
  const { services, temoignages } = await getData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Sol-Chic",
            telephone: "+22676206927",
            description: "Carrelage, peinture, staff, faux plafonds, toiture, étanchéité et vitrerie à Ouagadougou.",
            address: { "@type": "PostalAddress", addressLocality: "Ouagadougou", addressCountry: "BF" },
          }),
        }}
      />
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-brand-navy overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0a500' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-brand-gold/20 px-4 py-1 text-sm font-semibold text-brand-gold mb-6">
              N°1 à Ouagadougou
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Vos travaux de{" "}
              <span className="text-brand-gold">rénovation</span>{" "}
              entre de bonnes mains
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-xl">
              Carrelage, peinture, toiture, étanchéité — Sol-Chic transforme vos espaces avec
              expertise et passion depuis plus de 10 ans à Ouagadougou.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/devis">Devis gratuit <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-navy" asChild>
                <Link href="/realisations">Voir nos réalisations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ATOUTS ───────────────────────────────────────────── */}
      <section className="bg-brand-gold py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-brand-navy">
            {[
              { icon: <Shield className="h-6 w-6" />, title: "Artisans certifiés", desc: "Équipes qualifiées et expérimentées" },
              { icon: <Star className="h-6 w-6" />, title: "Qualité garantie", desc: "Matériaux de premier choix" },
              { icon: <Clock className="h-6 w-6" />, title: "Délais respectés", desc: "Ponctualité et rigueur sur chaque chantier" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="shrink-0">{item.icon}</div>
                <div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-xs opacity-80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────── */}
      <section className="py-20 bg-brand-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-brand-navy mb-4">
              Nos <span className="text-brand-gold">Services</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              De la pose de carrelage à l'étanchéité, nous couvrons tous vos besoins en rénovation et construction.
            </p>
          </div>
          {services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => <ServiceCard key={s.id} service={s} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEFAULT_SERVICES.map((s) => <ServiceCard key={s.id} service={s} />)}
            </div>
          )}
          <div className="text-center mt-10">
            <Button variant="navy" size="lg" asChild>
              <Link href="/services">Tous nos services <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── POURQUOI NOUS ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-brand-navy mb-6">
                Pourquoi choisir <span className="text-brand-gold">Sol-Chic</span> ?
              </h2>
              <ul className="space-y-4">
                {[
                  "Plus de 10 ans d'expérience dans les travaux de rénovation",
                  "Devis gratuit et sans engagement sous 24h",
                  "Matériaux de haute qualité issus des meilleurs fournisseurs",
                  "Équipes professionnelles et certifiées",
                  "Respect des délais et du budget convenus",
                  "Service après-vente disponible et réactif",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="mt-8" asChild>
                <Link href="/devis">Demander un devis gratuit</Link>
              </Button>
            </div>
            <div className="rounded-2xl bg-brand-navy p-8 text-white">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "500+", label: "Chantiers réalisés" },
                  { value: "10+", label: "Années d'expérience" },
                  { value: "98%", label: "Clients satisfaits" },
                  { value: "24h", label: "Délai de réponse" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-4xl font-black text-brand-gold">{stat.value}</p>
                    <p className="text-sm text-white/70 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ──────────────────────────────────────── */}
      {temoignages.length > 0 && (
        <section className="py-20 bg-brand-light">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-brand-navy mb-3">
                Ce que disent nos <span className="text-brand-gold">clients</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {temoignages.map((t) => <TestimonialCard key={t.id} temoignage={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section className="py-20 bg-brand-gold">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-brand-navy mb-4">
            Prêt à transformer votre espace ?
          </h2>
          <p className="text-brand-navy/80 mb-8 text-lg">
            Obtenez un devis gratuit en quelques minutes. Notre équipe vous répond sous 24h.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="navy" size="lg" asChild>
              <Link href="/devis">Demander un devis</Link>
            </Button>
            <Button
              size="lg"
              className="bg-white text-brand-navy hover:bg-gray-100"
              asChild
            >
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

// Fallback static data if DB is empty
const DEFAULT_SERVICES: Service[] = [
  { id: "1", slug: "carrelage-faience", name: "Carrelage-faïence", short_description: "Pose de carrelage, faïence et mosaïque pour sols et murs.", long_description: "", icon: "🏠", price_range: "Sur devis", images: [], order: 1, is_active: true, created_at: "" },
  { id: "2", slug: "peinture", name: "Peinture", short_description: "Peinture intérieure et extérieure de qualité professionnelle.", long_description: "", icon: "🎨", price_range: "Sur devis", images: [], order: 2, is_active: true, created_at: "" },
  { id: "3", slug: "staff", name: "Staff & placo", short_description: "Faux plafonds, cloisons et décoration en staff.", long_description: "", icon: "🏗️", price_range: "Sur devis", images: [], order: 3, is_active: true, created_at: "" },
  { id: "4", slug: "toiture-charpente", name: "Toiture-charpente", short_description: "Construction et rénovation de toitures et charpentes.", long_description: "", icon: "🏡", price_range: "Sur devis", images: [], order: 4, is_active: true, created_at: "" },
  { id: "5", slug: "etancheite", name: "Étanchéité", short_description: "Traitement et protection contre les infiltrations d'eau.", long_description: "", icon: "💧", price_range: "Sur devis", images: [], order: 5, is_active: true, created_at: "" },
  { id: "6", slug: "vitrerie-et-autres-finitions", name: "Vitrerie & finitions", short_description: "Pose de vitres, aluminium et finitions haut de gamme.", long_description: "", icon: "🪟", price_range: "Sur devis", images: [], order: 6, is_active: true, created_at: "" },
];
