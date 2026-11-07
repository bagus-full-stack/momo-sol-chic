import MapEmbed from "@/components/public/MapEmbed";
import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Sol-Chic pour vos travaux de rénovation à Ouagadougou.",
};

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-brand-navy py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Nous <span className="text-brand-gold">Contacter</span>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Notre équipe est disponible pour répondre à toutes vos questions.
          </p>
        </div>
      </section>

      <section className="py-16 bg-brand-light">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact cards */}
            <div className="space-y-5">
              {[
                {
                  icon: <Phone className="h-6 w-6 text-brand-gold" />,
                  title: "Téléphone",
                  content: "+226 76 20 69 27",
                  href: "tel:+22676206927",
                  note: "Disponible 7j/7",
                },
                {
                  icon: <Mail className="h-6 w-6 text-brand-gold" />,
                  title: "Email",
                  content: "contact@sol-chic.com",
                  href: "mailto:contact@sol-chic.com",
                  note: "Réponse sous 24h",
                },
                {
                  icon: <MapPin className="h-6 w-6 text-brand-gold" />,
                  title: "Adresse",
                  content: "Ouagadougou, Burkina Faso",
                  href: "https://maps.google.com/?q=Ouagadougou",
                  note: "Zone d'intervention : Grand Ouaga",
                },
                {
                  icon: <Clock className="h-6 w-6 text-brand-gold" />,
                  title: "Horaires",
                  content: "Lun – Sam : 7h00 – 18h00",
                  note: "Dimanche sur rendez-vous",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl bg-white border border-gray-200 p-5 shadow-sm"
                >
                  <div className="mt-0.5 shrink-0">{item.icon}</div>
                  <div>
                    <p className="font-bold text-brand-navy text-sm mb-1">{item.title}</p>
                    {item.href ? (
                      <a href={item.href} className="text-gray-700 hover:text-brand-gold font-medium">
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-gray-700 font-medium">{item.content}</p>
                    )}
                    {item.note && <p className="text-xs text-gray-600 mt-0.5">{item.note}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm min-h-[400px] flex flex-col">
              <MapEmbed />
              <div className="p-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 text-center">
                  Zone d'intervention : Grand Ouagadougou et environs
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-10 rounded-2xl bg-green-50 border border-green-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-green-800 text-lg">Besoin d'une réponse rapide ?</p>
              <p className="text-green-700 text-sm">Contactez-nous directement sur WhatsApp</p>
            </div>
            <a
              href="https://wa.me/22676206927?text=Bonjour%20Sol-Chic%2C%20j%27ai%20une%20question."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 transition-colors shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Ouvrir WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
