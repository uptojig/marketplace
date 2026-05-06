"use client";

import { MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * FAQ block.
 * Light themes: bordered accordion list.
 * Cyber theme: slate cards with cyan chevron + cyber-card hover.
 *   The cyber-faq-* classes are styled in globals.css under
 *   .theme-cyber so non-cyber stores look identical to before.
 */
export function FaqBlock({
  title,
  items,
}: {
  title?: string;
  items?: Array<{ question?: string; answer?: string }>;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="px-6 py-12 max-w-3xl mx-auto">
      {title && (
        <h3 className="text-3xl md:text-4xl font-black text-center mb-8 flex items-center justify-center gap-3 cyber-gradient-text-on-cyber">
          <MessageCircle className="cyber-faq-icon size-8" />
          {title}
        </h3>
      )}
      <Accordion className="w-full cyber-faq-list space-y-3">
        {items.map((item, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="cyber-faq-item rounded-xl overflow-hidden"
          >
            <AccordionTrigger className="cyber-faq-trigger text-base text-left font-bold px-6 py-4">
              {item.question}
            </AccordionTrigger>
            <AccordionContent
              className="cyber-faq-content text-sm px-6 pb-4"
              style={{ color: "var(--shop-ink-muted)" }}
            >
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
