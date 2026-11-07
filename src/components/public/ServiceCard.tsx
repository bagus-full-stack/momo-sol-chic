import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group rounded-xl overflow-hidden bg-white shadow-[0_1px_3px_rgba(26,58,107,0.12)] hover:shadow-[0_10px_24px_rgba(26,58,107,0.16)] hover:-translate-y-1 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {service.images?.[0] ? (
          <Image
            src={service.images[0]}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-brand-navy to-brand-navy-light flex items-center justify-center">
            <span className="text-5xl">{service.icon}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-bold text-brand-navy text-lg leading-tight">{service.name}</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.short_description}</p>
        {service.price_range && (
          <p className="text-xs text-amber-700 font-semibold mb-3">{service.price_range}</p>
        )}
        <Link
          href={`/services/${service.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-navy hover:text-brand-gold transition-colors"
        >
          En savoir plus <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
