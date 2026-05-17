'use client';
import React from 'react';
import { Mail, Phone, MapPin, ChevronDown } from 'lucide-react';

interface ContactChannel {
  type: string; // Contact type e.g., 'email', 'phone'
  value: string; // Contact text e.g., 'support@ecopack.co'
}

interface FAQ {
  question: string; // Frequently asked question
  answer: string; // Answer text
}

export interface HelpProps {
  sizeGuide?: string; // Size guide content or URL
  contactChannels: ContactChannel[]; // Contact options
  faqs: FAQ[]; // FAQ array
  onSubmitContact: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function Help({ faqs, onSubmitContact }: HelpProps) {
  return (
    <div className="bg-[var(--shop-bg)] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[var(--shop-ink)] mb-4">How can we help?</h1>
          <p className="text-[var(--shop-ink-muted)]">Find answers to common questions or reach out to our team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* FAQs */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--shop-ink)] mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-lg p-5 cursor-pointer">
                  <summary className="flex justify-between items-center font-semibold text-[var(--shop-ink)] list-none outline-none">
                    {faq.question}
                    <ChevronDown size={18} className="text-[var(--shop-ink-muted)] group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-4 text-[var(--shop-ink-muted)] leading-relaxed text-sm">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-xl p-8 sticky top-24 shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--shop-ink)] mb-6">Contact Us</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-[var(--shop-ink-muted)]">
                  <Mail size={18} className="text-[var(--shop-primary)]" /> support@ecopack.co
                </div>
                <div className="flex items-center gap-3 text-[var(--shop-ink-muted)]">
                  <Phone size={18} className="text-[var(--shop-primary)]" /> 1-800-PACK-ECO
                </div>
                <div className="flex items-center gap-3 text-[var(--shop-ink-muted)]">
                  <MapPin size={18} className="text-[var(--shop-primary)]" /> 123 Green Avenue, Earth
                </div>
              </div>

              <form onSubmit={onSubmitContact} className="space-y-4">
                <input type="text" placeholder="Your Name" className="w-full border border-[var(--shop-border)] rounded-md px-4 py-3 text-sm text-[var(--shop-ink)] outline-none focus:border-[var(--shop-primary)]" required />
                <input type="email" placeholder="Email Address" className="w-full border border-[var(--shop-border)] rounded-md px-4 py-3 text-sm text-[var(--shop-ink)] outline-none focus:border-[var(--shop-primary)]" required />
                <textarea placeholder="How can we help?" rows={4} className="w-full border border-[var(--shop-border)] rounded-md px-4 py-3 text-sm text-[var(--shop-ink)] outline-none focus:border-[var(--shop-primary)] resize-none" required></textarea>
                <button type="submit" className="w-full bg-[var(--shop-ink)] text-white py-3 justify-center text-sm font-semibold rounded-md hover:bg-black transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
