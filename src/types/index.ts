// ============================================================
// Sol-Chic — Types TypeScript
// ============================================================

export interface Service {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  long_description: string;
  icon: string;
  price_range: string;
  images: string[];
  order: number;
  is_active: boolean;
  created_at: string;
}

export interface Realisation {
  id: string;
  service_id: string;
  title: string;
  description: string;
  images: string[];
  before_image: string | null;
  after_image: string | null;
  realized_at: string;
  created_at: string;
  services?: { name: string; slug: string };
}

export interface Devis {
  id: string;
  nom: string;
  telephone: string;
  email: string | null;
  service: string;
  surface_m2: number | null;
  message: string | null;
  disponibilite: string | null;
  statut: "nouveau" | "en_cours" | "traite" | "annule";
  created_at: string;
}

export interface Temoignage {
  id: string;
  prenom: string;
  ville: string;
  service_id: string | null;
  note: number;
  commentaire: string;
  photo_url: string | null;
  is_published: boolean;
  created_at: string;
  services?: { name: string };
}

export interface KnowledgeChunk {
  id: string;
  content: string;
  category: "service" | "faq" | "tarifs" | "delais" | "contact" | "zone";
  service_id: string | null;
  indexed_at: string | null;
  created_at: string;
}

export interface CatalogueProduit {
  id: string;
  nom: string;
  type: "carrelage" | "peinture" | "autre";
  description: string;
  formats: string[];
  image_url: string | null;
  is_active: boolean;
}

export interface DevisFormData {
  nom: string;
  telephone: string;
  email?: string;
  service: string;
  surface_m2?: number;
  message?: string;
  disponibilite?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export const SERVICES_LIST = [
  "Carrelage-faïence",
  "Peinture",
  "Staff",
  "Faux plafonds et placo",
  "Toiture-charpente",
  "Étanchéité",
  "Vitrerie et autres finitions",
] as const;

export type ServiceName = (typeof SERVICES_LIST)[number];
