"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function FaqBlock({ title, items }: {
  title?: string;
  items?: Array<{ question?: string; answer?: string }>;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="px-6 py-12 max-w-3xl mx-auto">
      {title && <h3 className="text-xl font-bold text-center mb-8">{title}</h3>}
      <Accordion className="w-full">
        {items.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-sm text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-sm" style={{ color: 'var(--shop-ink-muted)' }}>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
