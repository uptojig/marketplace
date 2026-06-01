'use client';
import React, { useState, useMemo } from 'react';
import { ArrowRight, Sparkles, Heart, Compass } from 'lucide-react';

interface HomeProduct {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  imageUrl?: string | null;
  categoryName?: string | null;
}

export interface HomepageProps {
  store: { id: string; slug: string; name: string; logoUrl?: string | null };
  products: HomeProduct[];
  categories: string[];
}

const fmtPrice = (n: number) =>
  '฿' + n.toLocaleString('th-TH', { maximumFractionDigits: 0 });

export function Homepage({ store, products, categories }: HomepageProps) {
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeCat) return products;
    return products.filter((p) => p.categoryName === activeCat);
  }, [products, activeCat]);

  const hero = products[0];
  const urls = {
    shop: `/stores/${store.slug}/category`,
    about: `/stores/${store.slug}/about`,
  };

  return (
    <div className="bg-[#FFFBEB]">
      {/* HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#C4B5FD]/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 w-80 h-80 rounded-full bg-[#F9A8D4]/40 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 right-1/3 w-60 h-60 rounded-full bg-[#FEF08A]/30 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDE9FE] text-[#6D28D9] text-[12px] font-bold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                แบบทดสอบฟรี · 12 นาที
              </span>
              <h1 className="mt-5 text-[2.25rem] sm:text-[2.75rem] lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight text-[#1E1B4B]">
                เข้าใจตัวเองและคนรอบข้าง<br />
                ใน{' '}
                <span className="bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#F472B6] bg-clip-text text-transparent">
                  16 แบบบุคลิกภาพ
                </span>
              </h1>
              <p className="mt-5 text-[16px] lg:text-[17px] leading-relaxed text-[#3F3D5C] max-w-xl">
                ค้นพบจุดแข็ง สไตล์การคิด การตัดสินใจ และเส้นทางที่เติมเต็มคุณค่าของคุณ
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={urls.shop}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#7C3AED] text-white text-[15px] font-bold hover:bg-[#6D28D9] hover:-translate-y-0.5 transition-all shadow-[0_12px_28px_-8px_rgba(124,58,237,0.5)]"
                >
                  เริ่มทดสอบเลย <ArrowRight size={16} />
                </a>
                <a
                  href={urls.about}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#1E1B4B] text-[15px] font-bold border-2 border-[#E5E7EB] hover:border-[#7C3AED] hover:text-[#6D28D9] transition-all"
                >
                  ดู 16 บุคลิกภาพ
                </a>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-[#EDE9FE]">
                <div>
                  <div className="text-[1.625rem] font-extrabold text-[#6D28D9] tracking-tight">2.4M+</div>
                  <div className="text-[12px] text-[#6B7280] mt-1">ผู้ทำแบบทดสอบ</div>
                </div>
                <div>
                  <div className="text-[1.625rem] font-extrabold text-[#6D28D9] tracking-tight">93%</div>
                  <div className="text-[12px] text-[#6B7280] mt-1">ผลแม่นยำ</div>
                </div>
                <div>
                  <div className="text-[1.625rem] font-extrabold text-[#6D28D9] tracking-tight">38</div>
                  <div className="text-[12px] text-[#6B7280] mt-1">ภาษา</div>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative">
              <svg viewBox="0 0 560 540" className="w-full h-auto">
                <defs>
                  <linearGradient id="ppbg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#F5F3FF" />
                    <stop offset="1" stopColor="#FCE7F3" />
                  </linearGradient>
                </defs>
                <rect x="40" y="40" width="480" height="460" rx="40" fill="url(#ppbg)" />

                {/* 4 personality characters */}
                <g transform="translate(110,110)">
                  <ellipse cx="60" cy="70" rx="56" ry="64" fill="#A78BFA" />
                  <circle cx="60" cy="78" r="44" fill="#C4B5FD" />
                  <circle cx="46" cy="64" r="6" fill="#1E1B4B" />
                  <circle cx="74" cy="64" r="6" fill="#1E1B4B" />
                  <path d="M50 86 Q60 96 70 86" stroke="#1E1B4B" strokeWidth="3" fill="none" strokeLinecap="round" />
                </g>
                <g transform="translate(330,80)">
                  <ellipse cx="60" cy="70" rx="54" ry="62" fill="#34D399" />
                  <circle cx="60" cy="78" r="42" fill="#6EE7B7" />
                  <path d="M40 60 Q46 54 52 60" stroke="#064E3B" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M68 60 Q74 54 80 60" stroke="#064E3B" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M48 88 Q60 100 72 88" stroke="#1E1B4B" strokeWidth="3" fill="none" strokeLinecap="round" />
                </g>
                <g transform="translate(90,320)">
                  <ellipse cx="60" cy="70" rx="56" ry="60" fill="#38BDF8" />
                  <circle cx="60" cy="76" r="42" fill="#7DD3FC" />
                  <circle cx="48" cy="68" r="5" fill="#0C4A6E" />
                  <circle cx="72" cy="68" r="5" fill="#0C4A6E" />
                  <path d="M52 86 Q60 90 68 86" stroke="#0C4A6E" strokeWidth="3" fill="none" strokeLinecap="round" />
                </g>
                <g transform="translate(330,330)">
                  <ellipse cx="60" cy="70" rx="58" ry="62" fill="#FBBF24" />
                  <circle cx="60" cy="78" r="44" fill="#FDE68A" />
                  <ellipse cx="48" cy="68" rx="5" ry="7" fill="#1E1B4B" />
                  <ellipse cx="72" cy="68" rx="5" ry="7" fill="#1E1B4B" />
                  <path d="M48 88 Q60 100 72 88" stroke="#1E1B4B" strokeWidth="3" fill="none" strokeLinecap="round" />
                </g>

                {/* Center node */}
                <circle cx="280" cy="270" r="36" fill="#fff" stroke="#A78BFA" strokeWidth="3" />
                <text x="280" y="278" textAnchor="middle" fontFamily="Inter" fontWeight="900" fontSize="16" fill="#7C3AED">YOU</text>

                {/* Connections */}
                <g opacity="0.5" stroke="#A78BFA" strokeWidth="2" strokeDasharray="4 6" fill="none">
                  <path d="M200 180 Q280 240 380 200" />
                  <path d="M200 380 Q280 320 380 380" />
                  <path d="M180 270 L380 270" />
                </g>

                {/* Pop */}
                {hero?.imageUrl && (
                  <g transform="translate(380,420)">
                    <circle r="40" fill="#fff" stroke="#F472B6" strokeWidth="3" />
                  </g>
                )}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* WHY 3 cards ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FCE7F3] text-[#BE185D] text-[12px] font-bold tracking-wide">ทำไมต้องทำ</span>
          <h2 className="mt-4 text-[1.875rem] sm:text-[2.25rem] font-extrabold tracking-tight text-[#1E1B4B] leading-tight">
            การรู้จักตัวเอง คือจุดเริ่มต้นของการเติบโต
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { Icon: Compass, color: '#7C3AED', bg: '#EDE9FE', title: 'เข้าใจตัวเอง', desc: 'รู้ว่าทำไมคุณคิดและรู้สึกแบบนั้น พร้อมจุดแข็งที่ควรพัฒนา' },
            { Icon: Heart, color: '#EC4899', bg: '#FCE7F3', title: 'สื่อสารกับคนอื่น', desc: 'เข้าใจคนรอบข้างได้ตรงจุด ลดความเข้าใจผิดที่เกิดจากความต่างของบุคลิก' },
            { Icon: Sparkles, color: '#D97706', bg: '#FEF3C7', title: 'เลือกทางที่ใช่', desc: 'หางาน วิถีชีวิต และความสัมพันธ์ที่เติมเต็มคุณค่าในใจคุณ' },
          ].map(({ Icon, color, bg, title, desc }) => (
            <div key={title} className="bg-white border border-[#F3F4F6] rounded-2xl p-7 hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(124,58,237,0.18)] transition-all">
              <div className="w-14 h-14 rounded-2xl grid place-items-center mb-5" style={{ background: bg }}>
                <Icon size={26} strokeWidth={2} color={color} />
              </div>
              <h3 className="text-[1.0625rem] font-extrabold text-[#1E1B4B]">{title}</h3>
              <p className="mt-2 text-[14.5px] text-[#6B7280] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATALOG ─────────────────────────────────────── */}
      {products.length > 0 && (
        <section className="bg-[#FFFBEB] py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#EDE9FE] text-[#6D28D9] text-[12px] font-bold tracking-wide">รายงาน Premium</span>
                <h2 className="mt-3 text-[1.875rem] font-extrabold tracking-tight text-[#1E1B4B]">เลือกแบบที่ใช่กับคุณ</h2>
              </div>
              <a href={urls.shop} className="text-[14px] font-bold text-[#6D28D9] hover:text-[#4C1D95]">ดูทั้งหมด →</a>
            </div>

            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-7 scrollbar-hide">
                <button
                  onClick={() => setActiveCat(null)}
                  className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all ${
                    activeCat === null
                      ? 'bg-[#1E1B4B] text-white'
                      : 'bg-white text-[#3F3D5C] border border-[#E5E7EB] hover:border-[#A78BFA]'
                  }`}
                >
                  ทั้งหมด
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all ${
                      activeCat === cat
                        ? 'bg-[#1E1B4B] text-white'
                        : 'bg-white text-[#3F3D5C] border border-[#E5E7EB] hover:border-[#A78BFA]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.slice(0, 8).map((p) => {
                const discount = p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB
                  ? Math.round(((p.compareAtPriceTHB - p.priceTHB) / p.compareAtPriceTHB) * 100)
                  : 0;
                return (
                  <a
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group bg-white border border-[#F3F4F6] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(124,58,237,0.18)] transition-all"
                  >
                    <div className="aspect-square bg-gradient-to-br from-[#F5F3FF] to-[#FCE7F3] relative overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center">
                          <span className="text-[2.5rem] font-extrabold text-[#A78BFA]/70">P</span>
                        </div>
                      )}
                      {discount > 0 && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#EC4899] text-white text-[11px] font-bold">−{discount}%</span>
                      )}
                    </div>
                    <div className="p-4">
                      {p.categoryName && (
                        <span className="text-[11px] font-bold tracking-wider uppercase text-[#A78BFA]">{p.categoryName}</span>
                      )}
                      <h3 className="mt-1 text-[14.5px] font-bold text-[#1E1B4B] line-clamp-2 leading-snug">{p.title}</h3>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-[15px] font-extrabold text-[#1E1B4B]">{fmtPrice(p.priceTHB)}</span>
                        {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                          <span className="text-[12px] text-[#9CA3AF] line-through">{fmtPrice(p.compareAtPriceTHB)}</span>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-[#1E1B4B] text-white px-8 sm:px-14 py-14 sm:py-16 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(400px_200px_at_100%_0%,rgba(244,114,182,0.3),transparent_60%),radial-gradient(500px_300px_at_0%_100%,rgba(124,58,237,0.4),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-[1.75rem] sm:text-[2.25rem] font-extrabold tracking-tight leading-tight">พร้อมรู้จักตัวเองให้ลึกกว่าเดิมไหม?</h2>
            <p className="mt-3 text-[15px] sm:text-[16px] text-white/70 max-w-lg mx-auto">12 นาทีต่อจากนี้ คุณจะรู้จักตัวเองในมุมที่ไม่เคยรู้มาก่อน</p>
            <div className="mt-7 inline-flex flex-wrap gap-3 justify-center">
              <a href={urls.shop} className="px-7 py-3.5 rounded-full bg-[#F472B6] text-white text-[15px] font-bold hover:bg-[#EC4899] hover:-translate-y-0.5 transition-all">
                เริ่มทดสอบฟรี
              </a>
              <a href={urls.about} className="px-7 py-3.5 rounded-full bg-transparent text-white text-[15px] font-bold border-2 border-white/30 hover:border-white transition-all">
                เกี่ยวกับเรา
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
