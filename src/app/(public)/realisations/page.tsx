import type { Metadata } from "next";
import PageHeader from "@/components/public/PageHeader";
import GalleryGrid from "@/components/public/GalleryGrid";
import { supabase } from "@/lib/supabase";
import type { Realisation } from "@/types";
import BeforeAfterSlider from "@/components/public/BeforeAfterSlider";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Réalisations",
  description: "Découvrez les chantiers réalisés par Sol-Chic à Ouagadougou.",
};

export default async function RealisationsPage() {
  const { data } = await supabase
    .from("realisations")
    .select("*, services(name, slug)")
    .order("realized_at", { ascending: false });

  const realisations: Realisation[] = data ?? [];
  const withBA = realisations.filter((r) => r.before_image && r.after_image);
  const gallery = realisations.filter((r) => r.images?.length > 0);

  return (
    <>
      <PageHeader prefix="Nos" accent="Réalisations" subtitle="Découvrez quelques-uns de nos chantiers réalisés à Ouagadougou et ses environs." />

      {/* Before / After */}
      {withBA.length > 0 && (
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-brand-navy mb-8">Avant / Après</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {withBA.map((r) => (
                <div key={r.id}>
                  <BeforeAfterSlider
                    beforeSrc={r.before_image!}
                    afterSrc={r.after_image!}
                  />
                  <div className="mt-3">
                    <p className="font-bold text-brand-navy">{r.title}</p>
                    {r.services && (
                      <span className="text-xs text-amber-700 font-semibold">{r.services.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 ? (
        <section className="py-16 bg-brand-light">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-brand-navy mb-8">Galerie photos</h2>
            <GalleryGrid items={gallery} />
          </div>
        </section>
      ) : (
        <section className="py-20 bg-brand-light">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-6xl mb-6">🏗️</p>
            <h2 className="text-2xl font-black text-brand-navy mb-3">Galerie en construction</h2>
            <p className="text-gray-600 mb-8">
              Nos réalisations seront bientôt disponibles. En attendant, contactez-nous pour en savoir plus sur nos travaux.
            </p>
            <Button asChild>
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-brand-navy">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-black text-white mb-4">Votre projet, notre prochaine réalisation ?</h2>
          <Button size="lg" asChild>
            <Link href="/devis">Demander un devis gratuit</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
