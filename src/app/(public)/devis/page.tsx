import type { Metadata } from "next";
import PageHeader from "@/components/public/PageHeader";
import DevisForm from "@/components/public/DevisForm";
import { CheckCircle, Clock, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Devis gratuit",
  description: "Demandez un devis gratuit pour vos travaux de rénovation à Ouagadougou.",
};

export default function DevisPage() {
  return (
    <>
      <PageHeader prefix="Devis" accent="Gratuit" subtitle="Remplissez le formulaire ci-dessous et notre équipe vous contactera sous 24h." />

      <section className="py-16 bg-brand-light">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white p-8 shadow-[0_1px_3px_rgba(26,58,107,0.12)]">
                <h2 className="text-2xl font-black text-brand-navy mb-6">Votre demande de devis</h2>
                <DevisForm />
              </div>
            </div>

            {/* Info sidebar */}
            <div className="space-y-6">
              <div className="rounded-xl bg-brand-navy p-6 text-white">
                <h2 className="font-bold text-brand-gold mb-4">Pourquoi nous choisir ?</h2>
                <ul className="space-y-3">
                  {[
                    "Réponse sous 24h",
                    "Devis détaillé et transparent",
                    "Sans engagement",
                    "Artisans certifiés",
                    "Travaux garantis",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle className="h-4 w-4 text-brand-gold shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-[0_1px_3px_rgba(26,58,107,0.12)]">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-brand-gold" />
                  <p className="font-bold text-brand-navy">Horaires</p>
                </div>
                <p className="text-sm text-gray-600">
                  Lundi — Samedi : 7h00 — 18h00<br />
                  Dimanche : Sur rendez-vous
                </p>
              </div>

              <div className="rounded-xl bg-brand-gold p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Phone className="h-5 w-5 text-brand-navy" />
                  <p className="font-bold text-brand-navy">Appel direct</p>
                </div>
                <a
                  href="tel:+22676206927"
                  className="text-2xl font-black text-brand-navy hover:underline"
                >
                  +226 76 20 69 27
                </a>
                <p className="text-xs text-brand-navy mt-1">Disponible 7j/7</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
