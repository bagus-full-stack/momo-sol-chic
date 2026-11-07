import type { Metadata } from "next";
import PageHeader from "@/components/public/PageHeader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { KnowledgeChunk } from "@/types";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Questions fréquentes sur les services Sol-Chic.",
};

const DEFAULT_FAQ = [
  {
    question: "Proposez-vous des devis gratuits ?",
    answer: "Oui, tous nos devis sont entièrement gratuits et sans engagement. Remplissez notre formulaire en ligne ou appelez-nous directement.",
  },
  {
    question: "Dans quelle zone intervenez-vous ?",
    answer: "Nous intervenons principalement dans le Grand Ouagadougou et ses environs (Saaba, Tanghin-Dassouri, Komsilga, etc.).",
  },
  {
    question: "Quels types de carrelage posez-vous ?",
    answer: "Nous posons tous types de carrelage : grès cérame, faïence, mosaïque, travertin, pour les sols, murs, terrasses et piscines.",
  },
  {
    question: "Quel délai pour obtenir un devis ?",
    answer: "Après réception de votre demande, nous vous contactons sous 24h pour convenir d'un rendez-vous d'évaluation.",
  },
  {
    question: "Proposez-vous une garantie sur vos travaux ?",
    answer: "Oui, tous nos travaux sont garantis. La durée varie selon le type de prestation (de 1 à 5 ans selon les travaux).",
  },
  {
    question: "Travaillez-vous le week-end ?",
    answer: "Nous travaillons du lundi au samedi de 7h à 18h. Les dimanches sont possibles sur rendez-vous pour les urgences.",
  },
  {
    question: "Fournissez-vous les matériaux ?",
    answer: "Oui, nous pouvons fournir tous les matériaux ou travailler avec ceux que vous avez déjà achetés. Nous vous conseillons sur les meilleurs choix selon votre budget.",
  },
  {
    question: "Comment se passe le paiement ?",
    answer: "Le règlement s'effectue en plusieurs tranches : un acompte à la commande, un paiement intermédiaire et le solde à la réception des travaux.",
  },
];

export default async function FAQPage() {
  const { data } = await supabase
    .from("knowledge_chunks")
    .select("*")
    .eq("category", "faq");

  const faqFromDB: { question: string; answer: string }[] =
    data?.map((c: KnowledgeChunk) => {
      const lines = c.content.split("\n");
      return { question: lines[0] ?? "", answer: lines.slice(1).join(" ") };
    }) ?? [];

  const faq = faqFromDB.length > 0 ? faqFromDB : DEFAULT_FAQ;

  return (
    <>
      <PageHeader prefix="Questions" accent="Fréquentes" subtitle="Retrouvez les réponses aux questions les plus posées par nos clients." />

      <section className="py-16 bg-brand-light">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl bg-white shadow-[0_1px_3px_rgba(26,58,107,0.12)] overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between p-5 font-semibold text-brand-navy list-none">
                  {item.question}
                  <span className="ml-4 shrink-0 text-brand-gold group-open:rotate-45 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-xl leading-none">
                    +
                  </span>
                </summary>
                <div className="border-t border-gray-100 px-5 py-4 text-gray-700 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-brand-navy p-8 text-center text-white">
            <h2 className="text-xl font-bold mb-2">Vous n'avez pas trouvé votre réponse ?</h2>
            <p className="text-white/70 mb-6 text-sm">
              Notre assistant IA ou notre équipe peuvent vous aider directement.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">Nous contacter</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-navy" asChild>
                <Link href="/devis">Demander un devis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
