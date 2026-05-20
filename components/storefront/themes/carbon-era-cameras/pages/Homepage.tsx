'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Camera, CheckCircle2, ShieldCheck, FileText, Download } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface HomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  products: Product[];
  categories: any[];
}

const CONDITIONS = ['Mint', 'Excellent+', 'Excellent', 'Very Good', 'Good'];

function getCondition(productId: string) {
  // Deterministic pseudo-random condition based on ID length
  const index = productId.length % CONDITIONS.length;
  return CONDITIONS[index];
}

export function CarbonEraCamerasHomepage({ store, products, categories }: HomepageProps) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: product.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: product.title,
      priceTHB: product.priceTHB,
      imageUrl: product.imageUrl || undefined,
    });
    showConfirm(product.title, store.slug);
  };

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0a0a0a] text-[#fafafa]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent opacity-90" />
          <img 
            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=2000" 
            alt="Vintage Camera" 
            className="w-full h-full object-cover grayscale opacity-50 mix-blend-overlay"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 mb-6 border border-[#27272a] text-[#a1a1aa] font-[family:var(--font-prompt)] text-xs tracking-widest uppercase">
              Est. 2024
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-[family:var(--font-kanit)] font-black uppercase tracking-tighter mb-6 leading-tight">
              กล้องที่ผ่านการ<br />ตรวจสภาพ 24 จุด
            </h1>
            <p className="text-lg md:text-xl font-[family:var(--font-prompt)] text-[#a1a1aa] mb-10 leading-relaxed font-light">
              กล้องฟิล์ม Leica, Hasselblad, Rolleiflex มือสองคัดเกรด ผ่านการตรวจสภาพ 24 จุด รับประกันชัตเตอร์ 90 วัน
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href={`/${store.slug}/category/leica`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0a0a0a] font-[family:var(--font-prompt)] font-semibold hover:bg-[#a1a1aa] transition-colors"
              >
                ดู Leica วันนี้
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="#inspection"
                className="inline-flex items-center gap-2 px-8 py-4 border border-[#27272a] text-white font-[family:var(--font-prompt)] font-semibold hover:bg-white/10 transition-colors"
              >
                ขั้นตอนการตรวจสภาพ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="border-b border-[#27272a] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex items-start gap-5">
              <CheckCircle2 className="w-8 h-8 text-[#0a0a0a] shrink-0 mt-1" />
              <div>
                <h3 className="font-[family:var(--font-kanit)] text-xl font-bold uppercase mb-2 tracking-tight">24-Point Inspection</h3>
                <p className="font-[family:var(--font-prompt)] text-[#52525b] leading-relaxed">ทุกชิ้นส่วนถูกตรวจสอบอย่างละเอียดโดยช่างผู้เชี่ยวชาญก่อนวางจำหน่าย</p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <ShieldCheck className="w-8 h-8 text-[#0a0a0a] shrink-0 mt-1" />
              <div>
                <h3 className="font-[family:var(--font-kanit)] text-xl font-bold uppercase mb-2 tracking-tight">90-Day Warranty</h3>
                <p className="font-[family:var(--font-prompt)] text-[#52525b] leading-relaxed">รับประกันระบบกลไกและชัตเตอร์ยาวนานถึง 90 วัน เพื่อความอุ่นใจ</p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <FileText className="w-8 h-8 text-[#0a0a0a] shrink-0 mt-1" />
              <div>
                <h3 className="font-[family:var(--font-kanit)] text-xl font-bold uppercase mb-2 tracking-tight">Condition Reports</h3>
                <p className="font-[family:var(--font-prompt)] text-[#52525b] leading-relaxed">มีใบรายงานสภาพการทำงานและตำหนิอย่างชัดเจน (PDF) ทุกรายการ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-[family:var(--font-kanit)] font-black uppercase tracking-tighter mb-2">
                Arrivals
              </h2>
              <p className="font-[family:var(--font-prompt)] text-[#52525b] font-light">สินค้าเข้าใหม่ล่าสุด</p>
            </div>
            <Link 
              href={`/${store.slug}/products`}
              className="hidden sm:inline-flex items-center gap-2 font-[family:var(--font-prompt)] text-sm font-semibold hover:text-[#a1a1aa] transition-colors uppercase tracking-wider"
            >
              ดูสินค้าทั้งหมด
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const condition = getCondition(product.id);
              return (
                <Link
                  key={product.id}
                  href={`/${store.slug}/products/${product.id}`}
                  className="group block bg-white border border-[#27272a] hover:border-[#0a0a0a] transition-all overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-[#f4f4f5] relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-in-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#a1a1aa]">
                        <Camera className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <span className="bg-[#0a0a0a] text-white text-[10px] font-[family:var(--font-prompt)] font-bold px-2.5 py-1 uppercase tracking-widest shadow-sm">
                        Condition: {condition}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col justify-between h-[210px]">
                    <div>
                      {product.categoryName && (
                        <p className="text-[#52525b] text-xs font-[family:var(--font-prompt)] uppercase tracking-widest mb-3">
                          {product.categoryName}
                        </p>
                      )}
                      <h3 className="font-[family:var(--font-kanit)] text-lg font-bold leading-tight text-[#0a0a0a] line-clamp-2">
                        {product.title}
                      </h3>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="font-[family:var(--font-prompt)] font-medium text-[#0a0a0a] text-lg">
                          ฿{product.priceTHB.toLocaleString()}
                        </span>
                        {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB && (
                          <span className="font-[family:var(--font-prompt)] text-sm text-[#a1a1aa] line-through">
                            ฿{product.compareAtPriceTHB.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-full py-3 bg-transparent border border-[#0a0a0a] text-[#0a0a0a] font-[family:var(--font-prompt)] text-sm font-semibold hover:bg-[#0a0a0a] hover:text-white transition-colors uppercase tracking-wider"
                      >
                        เพิ่มลงตะกร้า
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Inspection Section */}
      <section id="inspection" className="py-24 bg-[#0a0a0a] text-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-3 py-1 mb-6 border border-[#27272a] text-[#a1a1aa] font-[family:var(--font-prompt)] text-xs tracking-widest uppercase">
                Quality Control
              </span>
              <h2 className="text-3xl md:text-5xl font-[family:var(--font-kanit)] font-black uppercase tracking-tighter mb-8 leading-tight">
                The 24-Point <br/> Inspection Process
              </h2>
              <div className="space-y-8 font-[family:var(--font-prompt)] text-[#a1a1aa] font-light text-lg">
                <p>
                  กล้องทุกตัวในร้านของเราผ่านการตรวจสอบอย่างเข้มงวด 24 จุด ตั้งแต่ความเร็วชัตเตอร์ไปจนถึงสภาพเลนส์และระบบวัดแสง
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-4 text-[#fafafa]">
                    <div className="w-8 h-8 rounded-full border border-[#27272a] flex items-center justify-center shrink-0">
                      <span className="font-[family:var(--font-kanit)] text-sm font-bold">1</span>
                    </div>
                    <span>Shutter Speed Calibration Test</span>
                  </li>
                  <li className="flex items-center gap-4 text-[#fafafa]">
                    <div className="w-8 h-8 rounded-full border border-[#27272a] flex items-center justify-center shrink-0">
                      <span className="font-[family:var(--font-kanit)] text-sm font-bold">2</span>
                    </div>
                    <span>Light Meter Accuracy Check</span>
                  </li>
                  <li className="flex items-center gap-4 text-[#fafafa]">
                    <div className="w-8 h-8 rounded-full border border-[#27272a] flex items-center justify-center shrink-0">
                      <span className="font-[family:var(--font-kanit)] text-sm font-bold">3</span>
                    </div>
                    <span>Viewfinder & Rangefinder Alignment</span>
                  </li>
                  <li className="flex items-center gap-4 text-[#fafafa]">
                    <div className="w-8 h-8 rounded-full border border-[#27272a] flex items-center justify-center shrink-0">
                      <span className="font-[family:var(--font-kanit)] text-sm font-bold">4</span>
                    </div>
                    <span>Lens Elements & Fungus Inspection</span>
                  </li>
                </ul>
                <p className="pt-4 text-base">
                  เอกสารผลการตรวจสอบ (Inspection Report) สามารถดาวน์โหลดได้ในรูปแบบ PDF บนหน้ารายละเอียดของสินค้าทุกรายการ
                </p>
              </div>
            </div>
            <div className="relative aspect-square bg-[#0a0a0a] p-8 border border-[#27272a] overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1588693717521-b3b33364f9b8?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-20 grayscale group-hover:scale-105 transition-transform duration-1000"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/80 to-transparent"></div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#52525b] backdrop-blur-sm bg-[#0a0a0a]/50">
                <FileText className="w-16 h-16 text-[#fafafa] mb-6" />
                <h3 className="font-[family:var(--font-kanit)] text-2xl font-bold uppercase mb-4 tracking-tight">Sample Report</h3>
                <p className="font-[family:var(--font-prompt)] text-[#a1a1aa] text-sm mb-8 font-light">
                  ดูตัวอย่างใบรายงานสภาพกล้องของเรา
                </p>
                <button className="flex items-center gap-2 px-6 py-4 bg-white text-[#0a0a0a] font-[family:var(--font-prompt)] font-bold text-sm uppercase tracking-widest hover:bg-[#a1a1aa] transition-colors">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
