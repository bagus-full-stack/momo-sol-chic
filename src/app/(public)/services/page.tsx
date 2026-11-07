import type { Metadata } from "next";
import PageHeader from "@/components/public/PageHeader";
import ServiceCard from "@/components/public/ServiceCard";
import { supabase } from "@/lib/supabase";
import type { Service } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Nos Services",
  description: "Découvrez tous les services de rénovation proposés par Sol-Chic à Ouagadougou.",
};

const DEFAULT_SERVICES: Service[] = [
  { id: "1", slug: "carrelage-faience", name: "Carrelage-faïence", short_description: "Pose de carrelage, faïence et mosaïque pour sols et murs intérieurs et extérieurs.", long_description: "Spécialistes de la pose de carrelage, nous intervenons pour tous types de surfaces : sols, murs, terrasses. Nous travaillons avec les meilleures marques de carrelage et faïence pour un résultat durable et esthétique.", icon: "🏠", price_range: "À partir de 5 000 FCFA/m²", images: [], order: 1, is_active: true, created_at: "" },
  { id: "2", slug: "peinture", name: "Peinture", short_description: "Application de peinture intérieure et extérieure avec finitions impeccables.", long_description: "Notre équipe de peintres professionnels vous offre des finitions de qualité, que ce soit pour votre maison, appartement ou local commercial.", icon: "🎨", price_range: "À partir de 1 500 FCFA/m²", images: [], order: 2, is_active: true, created_at: "" },
  { id: "3", slug: "staff", name: "Staff, faux plafonds & placo", short_description: "Création de faux plafonds décoratifs, cloisons et moulures en staff.", long_description: "Nous concevons et installons des faux plafonds en staff, plâtre ou placo pour embellir vos espaces et améliorer l'isolation phonique.", icon: "🏗️", price_range: "Sur devis", images: [], order: 3, is_active: true, created_at: "" },
  { id: "4", slug: "toiture-charpente", name: "Toiture-charpente", short_description: "Construction, réfection et entretien de toitures et charpentes.", long_description: "Sol-Chic assure la pose de couvertures en tôles, tuiles ou shingles, ainsi que la construction et réparation de charpentes en bois ou métal.", icon: "🏡", price_range: "Sur devis", images: [], order: 4, is_active: true, created_at: "" },
  { id: "5", slug: "etancheite", name: "Étanchéité", short_description: "Traitement d'imperméabilisation des terrasses, toits-terrasses et sous-sols.", long_description: "Problèmes d'infiltration ? Nos experts en étanchéité protègent vos structures contre l'humidité avec des membranes bitumineuses et des enduits spéciaux.", icon: "💧", price_range: "Sur devis", images: [], order: 5, is_active: true, created_at: "" },
  { id: "6", slug: "vitrerie-et-autres-finitions", name: "Vitrerie & autres finitions", short_description: "Pose de vitres, menuiserie aluminium et finitions intérieures haut de gamme.", long_description: "De la pose de vitres à la menuiserie aluminium, en passant par les garde-corps et les verrières, nous finalisons vos espaces avec soin.", icon: "🪟", price_range: "Sur devis", images: [], order: 6, is_active: true, created_at: "" },
];

export default async function ServicesPage() {
  const { data } = await supabase.from("services").select("*").eq("is_active", true).order("order");
  const services: Service[] = (data && data.length > 0) ? data : DEFAULT_SERVICES;

  return (
    <>
      <PageHeader prefix="Nos" accent="Services" subtitle="Sol-Chic vous offre une gamme complète de services pour tous vos projets de construction et de rénovation." />

      {/* Grid */}
      <section className="py-16 bg-brand-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-black text-brand-navy mb-4">
            Vous avez un projet en tête ?
          </h2>
          <p className="text-gray-600 mb-6">Contactez-nous pour un devis gratuit et sans engagement.</p>
          <Button size="lg" asChild>
            <Link href="/devis">Demander un devis gratuit</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
