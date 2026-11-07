import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Sol-Chic — Travaux de rénovation à Ouagadougou",
    template: "%s | Sol-Chic",
  },
  description:
    "Sol-Chic est votre expert en carrelage, peinture, plâtrerie, toiture, étanchéité et vitrerie à Ouagadougou, Burkina Faso.",
  keywords: ["carrelage", "peinture", "toiture", "rénovation", "Ouagadougou", "Burkina Faso"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Sol-Chic",
    title: "Sol-Chic — Travaux de rénovation à Ouagadougou",
    description: "Carrelage, peinture, toiture, étanchéité et vitrerie à Ouagadougou.",
  },
  twitter: { card: "summary_large_image", title: "Sol-Chic" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src https://www.openstreetmap.org;"
        />
      </head>
      <body className={`${inter.className} ${display.variable}`}>{children}</body>
    </html>
  );
}
