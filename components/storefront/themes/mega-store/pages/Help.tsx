'use client';
import React, { useState } from 'react';
import { Search, ChevronDown, Mail, Phone, MessageCircle } from 'lucide-react';

interface FAQ {
  q: string; // Question
  a: string; // Answer string
}

export interface HelpProps {
  faqs: FAQ[]; // List of questions
  onContactSubmit: (msg: string) => void;
}

export function Help({ faqs, onContactSubmit }: HelpProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [msg, setMsg] = useState('');

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen pb-12 pt-8">
      <div className="max-w-[800px] mx-auto px-4">
         
         <div className="text-center mb-10">
           <h1 className="text-3xl font-extrabold text-[var(--shop-ink)] mb-4">ศูนย์ช่วยเหลือ</h1>
           <div className="relative max-w-md mx-auto">
             <input type="text" placeholder="พิมพ์คำถามของคุณที่นี่..." className="w-full bg-white border-2 border-[var(--shop-primary)] outline-none rounded-full py-3 px-6 pr-12 text-sm shadow-sm" />
             <button className="absolute right-2 top-1.5 bottom-1.5 bg-[var(--shop-primary)] text-white w-10 flex items-center justify-center rounded-full hover:opacity-90">
                <Search size={18} />
             </button>
           </div>
         </div>

         {/* Contacts */}
         <div className="grid grid-cols-3 gap-4 mb-10">
           <div className="bg-white p-4 rounded-xl border border-[var(--shop-border)] flex flex-col items-center text-center group cursor-pointer hover:border-[var(--shop-primary)]">
              <div className="w-12 h-12 bg-gray-50 text-[var(--shop-ink)] group-hover:text-[var(--shop-primary)] group-hover:bg-orange-50 rounded-full flex items-center justify-center mb-2 transition-colors"><MessageCircle size={24}/></div>
              <span className="font-bold text-[var(--shop-ink)] text-sm">แชท 24 ชม.</span>
           </div>
           <div className="bg-white p-4 rounded-xl border border-[var(--shop-border)] flex flex-col items-center text-center group cursor-pointer hover:border-[var(--shop-primary)]">
              <div className="w-12 h-12 bg-gray-50 text-[var(--shop-ink)] group-hover:text-[var(--shop-primary)] group-hover:bg-orange-50 rounded-full flex items-center justify-center mb-2 transition-colors"><Phone size={24}/></div>
              <span className="font-bold text-[var(--shop-ink)] text-sm">Call Center</span>
           </div>
           <div className="bg-white p-4 rounded-xl border border-[var(--shop-border)] flex flex-col items-center text-center group cursor-pointer hover:border-[var(--shop-primary)]">
              <div className="w-12 h-12 bg-gray-50 text-[var(--shop-ink)] group-hover:text-[var(--shop-primary)] group-hover:bg-orange-50 rounded-full flex items-center justify-center mb-2 transition-colors"><Mail size={24}/></div>
              <span className="font-bold text-[var(--shop-ink)] text-sm">ส่งอีเมล</span>
           </div>
         </div>

         <div className="bg-white rounded-xl border border-[var(--shop-border)] overflow-hidden shadow-sm">
           <h2 className="font-bold text-lg text-[var(--shop-ink)] p-6 border-b border-[var(--shop-border)]">คำถามที่พบบ่อย (FAQ)</h2>
           <div className="divide-y divide-[var(--shop-border)]">
             {faqs.map((faq, i) => (
               <div key={i}>
                 <button 
                   onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                   className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                 >
                   <span className="font-bold text-[var(--shop-ink)] text-sm">{faq.q}</span>
                   <ChevronDown size={18} className={`text-[var(--shop-ink-muted)] transition-transform ${activeFaq === i ? 'rotate-180' : ''}`}/>
                 </button>
                 {activeFaq === i && (
                   <div className="px-6 pb-4 text-sm text-[var(--shop-ink-muted)] leading-relaxed">
                     {faq.a}
                   </div>
                 )}
               </div>
             ))}
           </div>
         </div>

      </div>
    </div>
  );
}
