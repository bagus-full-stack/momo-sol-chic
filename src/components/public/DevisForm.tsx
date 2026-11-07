"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { submitDevis } from "@/lib/supabase-functions";
import { SERVICES_LIST } from "@/types";
import { CheckCircle, AlertCircle } from "lucide-react";

const schema = z.object({
  nom: z.string().min(2, "Nom requis"),
  telephone: z.string().min(8, "Numéro invalide"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  service: z.string().min(1, "Choisissez un service"),
  surface_m2: z.coerce.number().positive().optional(),
  disponibilite: z.string().optional(),
  message: z.string().max(1000).optional(),
  website: z.string().optional(), // honeypot
});

type FormData = z.infer<typeof schema>;

const SERVICE_OPTIONS = SERVICES_LIST.map((s) => ({ value: s, label: s }));

export default function DevisForm({ preselectedService }: { preselectedService?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { service: preselectedService ?? "" },
  });

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const s = q.get("service");
    const m2 = q.get("surface");
    if (s) setValue("service", s);
    if (m2 && Number(m2) > 0) setValue("surface_m2", Number(m2));
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    try {
      await submitDevis({
        ...data,
        email: data.email || undefined,
        surface_m2: data.surface_m2 || undefined,
      });
      setStatus("success");
      reset();
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Une erreur est survenue.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-xl font-bold text-green-800 mb-2">Demande envoyée !</h3>
        <p className="text-green-700">Notre équipe vous contactera dans les 24h.</p>
        <Button className="mt-6" onClick={() => setStatus("idle")}>
          Nouvelle demande
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Nom + Téléphone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
          <Input {...register("nom")} placeholder="Votre nom" />
          {errors.nom && <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *<input {...register("website")} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          </label>
          <Input {...register("telephone")} placeholder="+226 XX XX XX XX" type="tel" />
          {errors.telephone && <p className="mt-1 text-xs text-red-600">{errors.telephone.message}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email (optionnel)</label>
        <Input {...register("email")} placeholder="votre@email.com" type="email" />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      {/* Service */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Service souhaité *</label>
        <Select
          {...register("service")}
          aria-label="Service souhaité"
          options={SERVICE_OPTIONS}
          placeholder="Choisissez un service"
        />
        {errors.service && <p className="mt-1 text-xs text-red-600">{errors.service.message}</p>}
      </div>

      {/* Surface + Disponibilité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
          <Input {...register("surface_m2")} placeholder="ex : 50" type="number" min={1} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
          <Input {...register("disponibilite")} placeholder="ex : Semaine du 20 janvier" />
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message complémentaire</label>
        <Textarea {...register("message")} placeholder="Décrivez votre projet..." rows={4} />
      </div>

      {/* Error */}
      {status === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Envoi en cours…" : "Envoyer ma demande de devis"}
      </Button>
    </form>
  );
}
