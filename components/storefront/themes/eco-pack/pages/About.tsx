import React from 'react';
import { Leaf, Recycle, Heart } from 'lucide-react';

interface StoreInfo {
  name: string; // Store name
  description?: string; // Store description
}

interface StatInfo {
  label: string; // Statistic label e.g., 'Happy Clients'
  value: string; // Statistic value e.g., '10k+'
}

interface ValueInfo {
  title: string; // Value title
  description: string; // Value description
}

interface TeamMemberInfo {
  name: string; // Member name
  role: string; // Member role
  image?: string; // Member photo
}

export interface AboutProps {
  store: StoreInfo; // Store details
  stats: StatInfo[]; // Notable metrics
  values: ValueInfo[]; // Brand core values
  teamMembers: TeamMemberInfo[]; // Authors / Team
  sustainability: string; // Mission statement
}

export function About({ store, stats, values, sustainability }: AboutProps) {
  return (
    <div className="bg-[var(--shop-bg)] min-h-screen">
      
      {/* Hero */}
      <section className="py-20 lg:py-32 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <Leaf size={48} className="text-[var(--shop-primary)] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--shop-ink)] mb-6">Packaging for a Better Planet</h1>
          <p className="text-lg text-[var(--shop-ink-muted)] leading-relaxed">
            {sustainability || "We believe that businesses shouldn't have to choose between premium presentation and environmental responsibility. Our kraft packaging is 100% recyclable, biodegradable, and built to protect your goods."}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[var(--shop-primary)] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
             {stats.map((s, i) => (
               <div key={i} className="flex flex-col">
                 <span className="text-3xl md:text-4xl font-bold mb-2">{s.value}</span>
                 <span className="text-white/80 font-medium">{s.label}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[var(--shop-ink)] text-center mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {values.map((v, i) => (
              <div key={i}>
                <div className="w-16 h-16 bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                   {i === 0 ? <Recycle className="text-[var(--shop-accent)]" size={28} /> : 
                    i === 1 ? <Heart className="text-[var(--shop-primary)]" size={28} /> : 
                    <Leaf className="text-[var(--shop-ink-muted)]" size={28} />}
                </div>
                <h3 className="text-xl font-bold text-[var(--shop-ink)] mb-3">{v.title}</h3>
                <p className="text-[var(--shop-ink-muted)] leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
