import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await supabase.from("services").select("slug").eq("is_active", true);
  const pages = ["", "services", "realisations", "devis", "contact", "faq", "calculateur"].map((p) => `${BASE}/${p ? p + "/" : ""}`);
  const services = (data ?? []).map((s) => `${BASE}/services/${s.slug}/`);
  return [...pages, ...services].map((url) => ({ url, lastModified: new Date() }));
}
