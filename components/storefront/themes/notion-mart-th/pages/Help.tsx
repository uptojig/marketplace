'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, MessageCircle, ArrowRight } from 'lucide-react';
import type { HelpProps } from '@/lib/templates/types';

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

const FALLBACK_TITLES: Record<string, string> = {
  faq: 'คำถามที่พบบ่อย',
  shipping: 'การส่งมอบไฟล์',
  returns: 'การคืนเงิน',
  privacy: 'นโยบายความเป็นส่วนตัว',
  terms: 'ข้อกำหนดและเงื่อนไข',
};

const FAQ_TOC = [
  { id: 'use', label: 'การใช้งานเทมเพลต' },
  { id: 'payment', label: 'การชำระเงิน' },
  { id: 'download', label: 'การดาวน์โหลด' },
  { id: 'update', label: 'การอัปเดต' },
  { id: 'refund', label: 'การคืนเงิน' },
];

const FAQ_ITEMS: { topic: string; q: string; a: string }[] = [
  { topic: 'use', q: 'ใช้เทมเพลตยังไง?', a: 'หลังชำระเงิน คุณจะได้รับลิงก์ "Duplicate to Notion" ในอีเมล กดเข้าไปและคัดลอกเข้า workspace ของคุณได้ทันที' },
  { topic: 'use', q: 'รองรับ Notion เวอร์ชั่นไหน?', a: 'ทุกเวอร์ชั่นของ Notion (Web · Desktop · Mobile) ตั้งแต่ Notion 2.x เป็นต้นไป' },
  { topic: 'payment', q: 'มีวิธีชำระเงินอะไรบ้าง?', a: 'รองรับ PromptPay · บัตรเครดิต/เดบิต · BNPL ผ่าน AnyPay ทุกการชำระเงินมีระบบ SSL' },
  { topic: 'download', q: 'ดาวน์โหลดได้ที่ไหน?', a: 'ทันทีหลังชำระเงิน ลิงก์จะส่งทางอีเมล และคุณเข้าดูได้ตลอดจาก "คลังสินค้าดิจิทัล" ในบัญชี' },
  { topic: 'update', q: 'อัปเดตเทมเพลตใหม่ ต้องจ่ายเพิ่มไหม?', a: 'อัปเดตฟรีตลอดอายุไฟล์ เมื่อมีเวอร์ชั่นใหม่ คุณจะได้รับแจ้งทางอีเมลและเข้าดาวน์โหลดได้จากบัญชีเดิม' },
  { topic: 'refund', q: 'คืนเงินได้ไหม?', a: 'ภายใน 7 วันหลังซื้อ หากเทมเพลตไม่ตรงกับที่อธิบาย คืนเงิน 100% โดยติดต่อทีม support ผ่าน LINE OA' },
];

export function Help({ store, pageSlug }: HelpProps) {
  const slug = pageSlug ?? 'faq';
  const title = FALLBACK_TITLES[slug] ?? 'ศูนย์ช่วยเหลือ';
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return FAQ_ITEMS;
    const q = query.toLowerCase();
    return FAQ_ITEMS.filter((it) => it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q));
  }, [query]);

  const isFaq = slug === 'faq' || !pageSlug;

  return (
    <div className={`bg-white text-[#1A1A1A] min-h-screen ${FONT_BODY}`}>
      <section className="border-b border-[#E5E5E5] bg-[#F7F6F3] px-4 sm:px-8 lg:px-16 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto">
          <p className={`text-[10px] tracking-[0.16em] uppercase ${FONT_HEADING} font-medium text-[#6B6B6B] mb-3`}>ศูนย์ช่วยเหลือ · {store.name}</p>
          <h1 className={`${FONT_HEADING} font-bold text-3xl sm:text-5xl text-[#1A1A1A] leading-tight`}>📚 {title}</h1>
          {isFaq && (
            <div className="mt-5 max-w-xl">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" aria-hidden />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาคำถาม..." aria-label="ค้นหา" className="w-full pl-9 pr-3 py-2.5 rounded text-[13px] bg-white border border-[#E5E5E5] text-[#1A1A1A] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#1A1A1A]" />
              </label>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-16 py-10 sm:py-14">
        {isFaq ? (
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-8">
            <aside className="hidden lg:block lg:sticky lg:top-6 lg:self-start space-y-2 text-[12.5px]">
              <p className={`${FONT_HEADING} font-medium uppercase tracking-[0.1em] text-[#6B6B6B] text-[10px]`}>หัวข้อ</p>
              {FAQ_TOC.map((t) => (
                <a key={t.id} href={`#${t.id}`} className="block px-2 py-1 rounded text-[#1A1A1A] hover:bg-[#F7F6F3] hover:text-[#2563EB] transition-colors">{t.label}</a>
              ))}
            </aside>

            <div className="space-y-3">
              {filtered.length === 0 ? (
                <p className="text-[13px] text-[#6B6B6B] italic">ไม่พบคำถามที่ตรงกับ &ldquo;{query}&rdquo;</p>
              ) : (
                FAQ_TOC.map((topic) => {
                  const items = filtered.filter((i) => i.topic === topic.id);
                  if (items.length === 0) return null;
                  return (
                    <div key={topic.id} id={topic.id} className="space-y-2">
                      <h2 className={`${FONT_HEADING} font-bold text-lg text-[#1A1A1A] pt-3`}>{topic.label}</h2>
                      {items.map((it, idx) => (
                        <details key={`${topic.id}-${idx}`} className="group bg-white border border-[#E5E5E5] rounded-md hover:border-[#1A1A1A] transition-colors">
                          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3">
                            <span className={`${FONT_HEADING} font-semibold text-[13.5px] text-[#1A1A1A]`}>{it.q}</span>
                            <span className="text-[#2563EB] text-lg leading-none transition-transform group-open:rotate-45" aria-hidden>+</span>
                          </summary>
                          <div className="px-4 pb-4 -mt-1 text-[13px] text-[#1A1A1A] leading-relaxed">{it.a}</div>
                        </details>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <p className="text-[14px] text-[#1A1A1A] leading-relaxed italic">เนื้อหา {title} ของร้านนี้ยังไม่ได้กำหนด ผู้ดูแลสามารถเข้าไปแก้ไขในหน้าจัดการของร้านได้ทันที</p>
          </div>
        )}
      </section>

      <section className="px-4 sm:px-8 lg:px-16 pb-16">
        <div className="max-w-3xl mx-auto bg-[#F7F6F3] border border-[#E5E5E5] rounded-md p-6 text-center">
          <MessageCircle className="mx-auto h-6 w-6 text-[#2563EB] mb-2" />
          <h3 className={`${FONT_HEADING} font-bold text-lg text-[#1A1A1A]`}>ยังไม่ได้คำตอบ?</h3>
          <p className="mt-1 text-[13px] text-[#6B6B6B]">ส่งคำถามหาเรา · เราตอบทุกข้อความภายใน 24 ชม.</p>
          <Link href={`/stores/${store.slug}/contact`} className="inline-flex items-center gap-1.5 mt-4 bg-black hover:bg-[#1A1A1A] text-white text-[12.5px] font-medium px-5 py-2.5 rounded transition-colors">
            ติดต่อทีมงาน<ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
