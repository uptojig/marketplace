'use client';
import React, { useState, useMemo } from 'react';
import { ArrowRight, Zap, BarChart3, Clock } from 'lucide-react';

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

  const urls = {
    shop: `/stores/${store.slug}/category`,
    about: `/stores/${store.slug}/about`,
  };

  return (
    <div className="bg-white">
      {/* HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF7ED] to-white">
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#BFDBFE]/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#FED7AA]/60 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-14 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-14 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#EFF6FF] to-[#FFEDD5] text-[12px] font-bold tracking-wide">
                <span className="relative inline-flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-[#22D3EE] opacity-75 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-[#06B6D4]" />
                </span>
                <span className="text-[#1D4ED8]">Shop More · Smile Up · SMS อันดับ 1 ของไทย</span>
              </span>
              <h1 className="mt-5 text-[2.25rem] sm:text-[2.75rem] lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight text-[#0F172A]">
                ส่ง SMS การตลาด<br />
                <span className="bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#F97316] bg-clip-text text-transparent">
                  ที่เห็นผลจริง
                </span><br />
                ใน 5 นาที
              </h1>
              <p className="mt-5 text-[16px] lg:text-[17px] leading-relaxed text-[#475569] max-w-xl">
                SMSUP+ ช่วยให้ธุรกิจ SME ส่งข้อความหาลูกค้าได้ทีละหลักหมื่นหลักแสนเบอร์ พร้อมรายงาน real-time แบบไม่ต้องเขียนโค้ด
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a href={urls.shop} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2563EB] text-white text-[15px] font-bold hover:bg-[#1D4ED8] hover:-translate-y-0.5 transition-all shadow-[0_12px_28px_-8px_rgba(37,99,235,0.5)]">
                  ทดลองฟรี 100 ข้อความ <ArrowRight size={16} />
                </a>
                <a href={urls.about} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#0F172A] text-[15px] font-bold border-2 border-[#E5E7EB] hover:border-[#F97316] hover:text-[#F97316] transition-all">
                  ดูฟีเจอร์ทั้งหมด
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-[#E5E7EB]">
                <div>
                  <div className="text-[1.625rem] font-extrabold text-[#1D4ED8] tracking-tight">3,500+</div>
                  <div className="text-[12px] text-[#64748B] mt-1">ธุรกิจไว้วางใจ</div>
                </div>
                <div>
                  <div className="text-[1.625rem] font-extrabold text-[#1D4ED8] tracking-tight">250M+</div>
                  <div className="text-[12px] text-[#64748B] mt-1">ข้อความต่อปี</div>
                </div>
                <div>
                  <div className="text-[1.625rem] font-extrabold text-[#1D4ED8] tracking-tight">99.8%</div>
                  <div className="text-[12px] text-[#64748B] mt-1">อัตราส่งสำเร็จ</div>
                </div>
              </div>
            </div>

            {/* Phone illustration */}
            <div className="relative">
              <svg viewBox="0 0 560 540" className="w-full h-auto">
                <defs>
                  <linearGradient id="smsbg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#EFF6FF" />
                    <stop offset="1" stopColor="#FFEDD5" />
                  </linearGradient>
                </defs>
                <rect x="40" y="40" width="480" height="460" rx="40" fill="url(#smsbg)" />

                {/* Floating message cards (left) */}
                <g transform="translate(80,110)">
                  <rect width="260" height="64" rx="14" fill="#fff" stroke="#BFDBFE" />
                  <circle cx="32" cy="32" r="16" fill="#2563EB" />
                  <text x="32" y="37" textAnchor="middle" fill="#fff" fontFamily="Inter" fontWeight="700" fontSize="14">S</text>
                  <rect x="60" y="20" width="120" height="10" rx="3" fill="#0F172A" />
                  <rect x="60" y="36" width="170" height="8" rx="3" fill="#CBD5E1" />
                </g>
                <g transform="translate(220,200)">
                  <rect width="260" height="64" rx="14" fill="#0F172A" />
                  <circle cx="32" cy="32" r="16" fill="#F97316" />
                  <rect x="60" y="20" width="100" height="10" rx="3" fill="#fff" />
                  <rect x="60" y="36" width="160" height="8" rx="3" fill="#64748B" />
                </g>
                <g transform="translate(80,290)">
                  <rect width="260" height="64" rx="14" fill="#fff" stroke="#FED7AA" />
                  <circle cx="32" cy="32" r="16" fill="#F97316" />
                  <rect x="60" y="20" width="140" height="10" rx="3" fill="#0F172A" />
                  <rect x="60" y="36" width="150" height="8" rx="3" fill="#CBD5E1" />
                </g>

                {/* Phone (right) */}
                <g transform="translate(330,80)">
                  <rect width="160" height="380" rx="28" fill="#0F172A" />
                  <rect x="10" y="40" width="140" height="330" rx="18" fill="#F8FAFC" />
                  <rect x="55" y="18" width="50" height="6" rx="3" fill="#1E293B" />
                  <g transform="translate(20,60)">
                    <rect width="120" height="40" rx="10" fill="#2563EB" />
                    <rect x="12" y="12" width="60" height="6" rx="2" fill="#F97316" />
                    <rect x="12" y="24" width="86" height="5" rx="2" fill="#BFDBFE" />
                  </g>
                  <g transform="translate(20,112)">
                    <rect width="120" height="40" rx="10" fill="#2563EB" />
                    <rect x="12" y="12" width="80" height="6" rx="2" fill="#F97316" />
                    <rect x="12" y="24" width="70" height="5" rx="2" fill="#BFDBFE" />
                  </g>
                  <g transform="translate(20,164)">
                    <rect width="120" height="40" rx="10" fill="#2563EB" />
                    <rect x="12" y="12" width="60" height="6" rx="2" fill="#F97316" />
                    <rect x="12" y="24" width="90" height="5" rx="2" fill="#BFDBFE" />
                  </g>
                  <g transform="translate(20,216)">
                    <rect width="120" height="40" rx="10" fill="#2563EB" />
                    <rect x="12" y="12" width="70" height="6" rx="2" fill="#F97316" />
                    <rect x="12" y="24" width="80" height="5" rx="2" fill="#BFDBFE" />
                  </g>
                  <g transform="translate(20,268)">
                    <rect width="120" height="40" rx="10" fill="#2563EB" />
                    <rect x="12" y="12" width="60" height="6" rx="2" fill="#F97316" />
                    <rect x="12" y="24" width="90" height="5" rx="2" fill="#BFDBFE" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE PILLARS ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFEDD5] text-[#C2410C] text-[12px] font-bold tracking-wide">ทำไม SMSUP+</span>
          <h2 className="mt-4 text-[1.875rem] sm:text-[2.25rem] font-extrabold tracking-tight text-[#0F172A] leading-tight">
            ทุกอย่างที่ SME ต้องการ ในแพลตฟอร์มเดียว
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { Icon: Zap, color: '#2563EB', bg: '#EFF6FF', title: 'ส่งทีละล้าน ใน 1 นาที', desc: 'gateway เชื่อมตรงโอเปอเรเตอร์ไทย ส่งเร็ว ปลอดภัย รองรับภาษาไทย 100%' },
            { Icon: BarChart3, color: '#F97316', bg: '#FFEDD5', title: 'รายงาน Real-time', desc: 'ดูสถานะส่ง อัตราเปิด คลิก แบบนาทีต่อนาที พร้อม export CSV/Excel' },
            { Icon: Clock, color: '#0F172A', bg: '#F1F5F9', title: 'ตั้งเวลาล่วงหน้า', desc: 'กำหนดเวลาส่งและ time zone เพื่อให้ลูกค้าเห็นข้อความในเวลาที่ตอบสนองดีที่สุด' },
          ].map(({ Icon, color, bg, title, desc }) => (
            <div key={title} className="bg-white border border-[#E5E7EB] rounded-2xl p-7 hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(37,99,235,0.18)] transition-all">
              <div className="w-14 h-14 rounded-2xl grid place-items-center mb-5" style={{ background: bg }}>
                <Icon size={26} strokeWidth={2} color={color} />
              </div>
              <h3 className="text-[1.0625rem] font-extrabold text-[#0F172A]">{title}</h3>
              <p className="mt-2 text-[14.5px] text-[#64748B] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATALOG ─────────────────────────────────────── */}
      {products.length > 0 && (
        <section className="bg-[#FFFBF5] py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-[12px] font-bold tracking-wide">แพ็กเกจ</span>
                <h2 className="mt-3 text-[1.875rem] font-extrabold tracking-tight text-[#0F172A]">เลือกแพ็กเกจที่เหมาะกับคุณ</h2>
              </div>
              <a href={urls.shop} className="text-[14px] font-bold text-[#1D4ED8] hover:text-[#1E3A8A]">ดูทั้งหมด →</a>
            </div>

            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-7 scrollbar-hide">
                <button
                  onClick={() => setActiveCat(null)}
                  className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all ${
                    activeCat === null
                      ? 'bg-[#0F172A] text-white'
                      : 'bg-white text-[#475569] border border-[#E5E7EB] hover:border-[#2563EB]'
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
                        ? 'bg-[#0F172A] text-white'
                        : 'bg-white text-[#475569] border border-[#E5E7EB] hover:border-[#2563EB]'
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
                    className="group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(37,99,235,0.18)] transition-all"
                  >
                    <div className="aspect-square bg-gradient-to-br from-[#EFF6FF] to-[#FFEDD5] relative overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center">
                          <span className="text-[2.5rem] font-extrabold">
                            <span className="text-[#2563EB]">S</span>
                            <span className="text-[#F97316]">+</span>
                          </span>
                        </div>
                      )}
                      {discount > 0 && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#F97316] text-white text-[11px] font-bold">−{discount}%</span>
                      )}
                    </div>
                    <div className="p-4">
                      {p.categoryName && (
                        <span className="text-[11px] font-bold tracking-wider uppercase text-[#2563EB]">{p.categoryName}</span>
                      )}
                      <h3 className="mt-1 text-[14.5px] font-bold text-[#0F172A] line-clamp-2 leading-snug">{p.title}</h3>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-[15px] font-extrabold text-[#0F172A]">{fmtPrice(p.priceTHB)}</span>
                        {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                          <span className="text-[12px] text-[#94A3B8] line-through">{fmtPrice(p.compareAtPriceTHB)}</span>
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
        <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] text-white px-8 sm:px-14 py-14 sm:py-16 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(400px_200px_at_100%_0%,rgba(249,115,22,0.3),transparent_60%),radial-gradient(500px_300px_at_0%_100%,rgba(37,99,235,0.4),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-[1.75rem] sm:text-[2.25rem] font-extrabold tracking-tight leading-tight">พร้อมเพิ่มยอดขายด้วย SMS?</h2>
            <p className="mt-3 text-[15px] sm:text-[16px] text-white/70 max-w-lg mx-auto">ลงทะเบียนวันนี้ รับเครดิตทดลอง 100 ข้อความฟรี ไม่ต้องใช้บัตรเครดิต</p>
            <div className="mt-7 inline-flex flex-wrap gap-3 justify-center">
              <a href={urls.shop} className="px-7 py-3.5 rounded-full bg-[#F97316] text-white text-[15px] font-bold hover:bg-[#EA580C] hover:-translate-y-0.5 transition-all">
                เริ่มฟรีตอนนี้
              </a>
              <a href={urls.about} className="px-7 py-3.5 rounded-full bg-transparent text-white text-[15px] font-bold border-2 border-white/30 hover:border-white transition-all">
                คุยกับทีมขาย
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
