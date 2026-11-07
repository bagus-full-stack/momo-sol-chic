interface PageHeaderProps {
  prefix?: string;
  accent: string;
  subtitle: string;
}

// En-tête commun des pages publiques : titre, mot en or, rangée de carreaux (motif de marque).
export default function PageHeader({ prefix, accent, subtitle }: PageHeaderProps) {
  return (
    <section className="bg-brand-navy py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white tracking-tight text-balance mb-4">
          {prefix} <span className="text-brand-gold">{accent}</span>
        </h1>
        <div aria-hidden="true" className="flex justify-center gap-1.5 mb-5">
          {["bg-brand-gold", "bg-brand-navy-light", "bg-white/20", "bg-brand-gold-light", "bg-brand-navy-light"].map((c, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-sm ${c}`} />
          ))}
        </div>
        <p className="text-white/80 max-w-xl mx-auto text-lg">{subtitle}</p>
      </div>
    </section>
  );
}
