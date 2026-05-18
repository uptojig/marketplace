import React from 'react';
import { Target, Users, Zap, ShieldCheck } from 'lucide-react';

interface ValueProp {
  title: string; // Title of the value
  desc: string; // Description 
  icon: string; // Icon identifier
}

export interface AboutProps {
  storeName: string;
  story: string; // About story text
  values: ValueProp[]; // Store values
}

export function About({ storeName, story, values }: AboutProps) {
  
  return (
    <div className="bg-[var(--shop-bg)] min-h-screen pb-12 pt-8">
      <div className="max-w-[800px] mx-auto px-4">
         
         {/* Hero Banner */}
         <div className="bg-[var(--mega-gradient-btn)] rounded-2xl p-10 text-white text-center mb-10 shadow-lg relative overflow-hidden">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 relative z-10">เกี่ยวกับ {storeName}</h1>
            <p className="text-sm sm:text-base opacity-90 max-w-lg mx-auto relative z-10">{story}</p>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
         </div>

         {/* Values Grid */}
         <h2 className="text-2xl font-bold text-[var(--shop-ink)] mb-6 text-center">สิ่งที่เรายึดมั่น</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((v, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-[var(--shop-border)] shadow-sm text-center flex flex-col items-center hover:border-[var(--shop-primary)] transition-colors group">
                 <div className="w-16 h-16 bg-orange-50 text-[var(--shop-primary)] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   {v.icon === 'target' ? <Target size={28} /> : 
                    v.icon === 'users' ? <Users size={28} /> : 
                    v.icon === 'zap' ? <Zap size={28} /> : 
                    <ShieldCheck size={28} />}
                 </div>
                 <h3 className="font-bold text-[var(--shop-ink)] text-lg mb-2">{v.title}</h3>
                 <p className="text-sm text-[var(--shop-ink-muted)]">{v.desc}</p>
              </div>
            ))}
         </div>

      </div>
    </div>
  );
}
