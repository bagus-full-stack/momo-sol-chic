"use client";

import { useState } from "react";

// Accordéon transitions.dev (grid-template-rows 0fr -> 1fr), un seul panneau ouvert à la fois.
export default function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="t-acc rounded-xl bg-white shadow-[0_1px_3px_rgba(26,58,107,0.12)]" data-open={isOpen}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold text-brand-navy"
              aria-expanded={isOpen}
              aria-controls={`faq-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              {item.question}
              <span className="t-acc-chevron shrink-0 text-amber-700">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 6.5L8 10.5L12 6.5" />
                </svg>
              </span>
            </button>
            <div className="t-acc-panel" id={`faq-${i}`} role="region">
              <div className="t-acc-panel-inner">
                <p className="px-5 pb-5 text-sm leading-relaxed text-gray-700">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
