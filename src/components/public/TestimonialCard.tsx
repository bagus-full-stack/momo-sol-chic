import { Star } from "lucide-react";
import type { Temoignage } from "@/types";

interface TestimonialCardProps {
  temoignage: Temoignage;
}

export default function TestimonialCard({ temoignage }: TestimonialCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_1px_3px_rgba(26,58,107,0.12)]">
      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < temoignage.note ? "fill-brand-gold text-brand-gold" : "text-gray-200"}`}
          />
        ))}
      </div>

      {/* Comment */}
      <p className="text-sm text-gray-700 italic mb-4">"{temoignage.commentaire}"</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-sm shrink-0">
          {temoignage.prenom[0]}
        </div>
        <div>
          <p className="font-semibold text-sm text-brand-navy">{temoignage.prenom}</p>
          <p className="text-xs text-gray-500">{temoignage.ville}</p>
        </div>
      </div>
    </div>
  );
}
