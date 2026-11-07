import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {service.images?.[0] ? (
          <Image
            src={service.images[0]}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
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
          <span className="text-2xl">{service.icon}</span>
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
