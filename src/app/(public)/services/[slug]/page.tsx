import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import DevisForm from "@/components/public/DevisForm";
import type { Service } from "@/types";
import { CheckCircle, ArrowLeft } from "lucide-react";

interface Props {
  params: { slug: string };
}

const DEFAULT_SERVICES: Service[] = [
  { id: "1", slug: "carrelage-faience", name: "Carrelage-faïence", short_description: "Pose de carrelage, faïence et mosaïque.", long_description: "Spécialistes de la pose de carrelage, nous intervenons pour tous types de surfaces : sols, murs, terrasses. Nous travaillons avec les meilleures marques pour un résultat durable et esthétique.\n\nNotre équipe maîtrise toutes les techniques de pose : classique, diagonale, opus incertum. Nous assurons aussi la rénovation de carrelage existant.", icon: "🏠", price_range: "À partir de 5 000 FCFA/m²", images: [], order: 1, is_active: true, created_at: "" },
  { id: "2", slug: "peinture", name: "Peinture", short_description: "Peinture intérieure et extérieure.", long_description: "Notre équipe de peintres professionnels vous offre des finitions de qualité, que ce soit pour votre maison, appartement ou local commercial.\n\nNous utilisons des peintures de haute qualité, résistantes à la chaleur et aux intempéries, adaptées au climat burkinabè.", icon: "🎨", price_range: "À partir de 1 500 FCFA/m²", images: [], order: 2, is_active: true, created_at: "" },
  { id: "3", slug: "staff", name: "Staff, faux plafonds & placo", short_description: "Faux plafonds décoratifs et cloisons.", long_description: "Nous concevons et installons des faux plafonds en staff, plâtre ou placo pour embellir vos espaces. Nos artisans créent des moulures et décors sur mesure.", icon: "🏗️", price_range: "Sur devis", images: [], order: 3, is_active: true, created_at: "" },
  { id: "4", slug: "toiture-charpente", name: "Toiture-charpente", short_description: "Construction et rénovation de toitures.", long_description: "Sol-Chic assure la pose de couvertures en tôles, tuiles ou shingles, ainsi que la construction et réparation de charpentes en bois ou métal. Nous garantissons l'étanchéité de vos toitures.", icon: "🏡", price_range: "Sur devis", images: [], order: 4, is_active: true, created_at: "" },
  { id: "5", slug: "etancheite", name: "Étanchéité", short_description: "Imperméabilisation contre les infiltrations.", long_description: "Nos experts en étanchéité protègent vos structures contre l'humidité avec des membranes bitumineuses et des enduits spéciaux. Nous intervenons sur les terrasses, toits-terrasses et murs enterrés.", icon: "💧", price_range: "Sur devis", images: [], order: 5, is_active: true, created_at: "" },
  { id: "6", slug: "vitrerie-et-autres-finitions", name: "Vitrerie & autres finitions", short_description: "Pose de vitres et finitions haut de gamme.", long_description: "De la pose de vitres à la menuiserie aluminium, nous finalisons vos espaces avec soin. Nos finitions comprennent les garde-corps, verrières, portes et fenêtres aluminium.", icon: "🪟", price_range: "Sur devis", images: [], order: 6, is_active: true, created_at: "" },
];

export async function generateStaticParams() {
  const { data } = await supabase.from("services").select("slug");
  const dbSlugs = data?.map((s) => ({ slug: s.slug })) ?? [];
  const defaultSlugs = DEFAULT_SERVICES.map((s) => ({ slug: s.slug }));
  const all = [...dbSlugs, ...defaultSlugs];
  // deduplicate
  return Array.from(new Map(all.map((s) => [s.slug, s])).values());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService(params.slug);
  if (!service) return { title: "Service introuvable" };
  return { title: service.name, description: service.short_description };
}

async function getService(slug: string): Promise<Service | null> {
  const { data } = await supabase.from("services").select("*").eq("slug", slug).single();
  if (data) return data as Service;
  return DEFAULT_SERVICES.find((s) => s.slug === slug) ?? null;
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await getService(params.slug);
  if (!service) notFound();

  const paragraphs = service.long_description.split("\n\n").filter(Boolean);

  return (
    <>
      {/* Header */}
      <section className="bg-brand-navy py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/services" className="inline-flex items-center gap-1 text-white/60 hover:text-brand-gold text-sm mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour aux services
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{service.icon}</span>
            <div>
              <h1 className="text-4xl font-black text-white">{service.name}</h1>
              <p className="text-white/70 mt-1">{service.short_description}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            {service.images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-10">
                {service.images.slice(0, 4).map((src, i) => (
                  <div key={i} className={`relative rounded-xl overflow-hidden ${i === 0 ? "col-span-2" : ""} aspect-video`}>
                    <Image src={src} alt={`${service.name} ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="prose prose-lg max-w-none">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>
              ))}
            </div>

            {/* Avantages */}
            <div className="mt-10 rounded-xl bg-brand-light p-6">
              <h3 className="font-black text-brand-navy text-xl mb-4">Nos engagements</h3>
              <ul className="space-y-3">
                {["Devis gratuit sous 24h", "Artisans qualifiés et expérimentés", "Matériaux de qualité premium", "Délais respectés", "Garantie sur les travaux"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-brand-gold shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar devis */}
          <div>
            <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black text-brand-navy mb-1">Demander un devis</h3>
              <p className="text-sm text-gray-500 mb-6">Gratuit et sans engagement</p>
              {service.price_range && (
                <div className="mb-5 rounded-lg bg-brand-gold/10 px-4 py-2 text-sm font-semibold text-brand-navy">
                  Tarif indicatif : {service.price_range}
                </div>
              )}
              <DevisForm preselectedService={service.name} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
