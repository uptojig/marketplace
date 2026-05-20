'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { ArrowRight, TestTube, Dna, Activity, Plus } from 'lucide-react';

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
  categories: {
    id: string;
    name: string;
  }[];
}

const SPEC_DATA = [
  { ph: '5.5 ± 0.5', active: 'Niacinamide 10%', trialId: 'CT-021' },
  { ph: '4.0 ± 0.2', active: 'L-Ascorbic Acid 15%', trialId: 'CT-014' },
  { ph: '6.0 ± 0.5', active: 'Ceramides 3%', trialId: 'CT-038' },
  { ph: '3.8 ± 0.2', active: 'AHA 8% + BHA 2%', trialId: 'CT-005' },
  { ph: '5.0 ± 0.5', active: 'Peptide Complex 5%', trialId: 'CT-042' },
  { ph: '4.5 ± 0.3', active: 'Retinol 0.3%', trialId: 'CT-019' },
];

export function CalderaSkinHomepage({ store, products, categories }: HomepageProps) {
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

  return (
    <div className="bg-[#f4f8f9] text-[#0b3d4a] min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#cdd9dc] bg-gradient-to-br from-[#f4f8f9] to-[#cdd9dc]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#0b3d4a_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#5cbac7] bg-[#9cd6df]/20 text-[#0b3d4a] font-[family:var(--font-prompt)] text-xs uppercase tracking-[0.15em] mb-8">
              <Activity className="w-4 h-4" />
              <span>Chula Cosmetics Lab</span>
            </div>
            
            <h1 className="font-[family:var(--font-kanit)] text-5xl sm:text-7xl font-medium tracking-tight mb-6 text-[#0b3d4a]">
              ผิวที่อ่านได้
            </h1>
            
            <p className="font-[family:var(--font-prompt)] text-lg sm:text-xl text-[#0b3d4a]/80 mb-10 max-w-2xl font-light leading-relaxed">
              เซรั่มและครีมที่พัฒนาร่วมกับห้องแล็บ Chula Cosmetics Lab ทุกผลิตภัณฑ์มีงานวิจัยทางคลินิกแนบ ปลอดน้ำหอม
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href={`/${store.slug}/products`}
                className="inline-flex items-center justify-center px-8 py-4 bg-[#0b3d4a] text-[#f4f8f9] font-[family:var(--font-prompt)] uppercase tracking-[0.15em] text-sm hover:bg-[#5cbac7] transition-colors duration-300"
              >
                ดูผลทดสอบทางคลินิก
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link 
                href={`/${store.slug}/about`}
                className="inline-flex items-center justify-center px-8 py-4 border border-[#0b3d4a] text-[#0b3d4a] font-[family:var(--font-prompt)] uppercase tracking-[0.15em] text-sm hover:bg-[#cdd9dc]/50 transition-colors duration-300"
              >
                Lab Protocols
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 border-b border-[#cdd9dc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-[#cdd9dc] pb-6">
            <div>
              <h2 className="font-[family:var(--font-kanit)] text-3xl font-medium text-[#0b3d4a] mb-2">
                Active Formulations
              </h2>
              <p className="font-[family:var(--font-prompt)] text-[#0b3d4a]/70 uppercase tracking-[0.12em] text-xs">
                Clinical batch data enclosed
              </p>
            </div>
            <Link 
              href={`/${store.slug}/products`}
              className="group hidden md:inline-flex items-center gap-2 font-[family:var(--font-prompt)] text-xs uppercase tracking-[0.15em] text-[#0b3d4a] hover:text-[#5cbac7] transition-colors"
            >
              View Full Index <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 6).map((product, index) => {
              const spec = SPEC_DATA[index % SPEC_DATA.length];
              return (
                <Link
                  key={product.id}
                  href={`/${store.slug}/products/${product.id}`}
                  className="group bg-white border border-[#cdd9dc] hover:border-[#5cbac7] transition-colors flex flex-col h-full relative"
                >
                  <div className="absolute top-4 left-4 z-10 bg-[#0b3d4a] text-[#f4f8f9] text-[10px] font-[family:var(--font-prompt)] uppercase tracking-[0.15em] px-2 py-1">
                    ID: {spec.trialId}
                  </div>
                  
                  <div className="aspect-square relative bg-[#f4f8f9] overflow-hidden border-b border-[#cdd9dc] p-8 flex items-center justify-center">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 mix-blend-multiply"
                      />
                    ) : (
                      <TestTube className="w-24 h-24 text-[#cdd9dc] stroke-1" />
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-2">
                      {product.categoryName && (
                        <p className="font-[family:var(--font-prompt)] text-[10px] text-[#5cbac7] uppercase tracking-[0.15em] mb-1">
                          {product.categoryName}
                        </p>
                      )}
                      <h3 className="font-[family:var(--font-kanit)] text-lg font-medium text-[#0b3d4a] line-clamp-2">
                        {product.title}
                      </h3>
                    </div>
                    
                    {/* Spec Table */}
                    <div className="mt-4 mb-6 border-t border-[#cdd9dc]/50 pt-4 space-y-2">
                      <div className="flex justify-between items-center text-[11px] font-[family:var(--font-prompt)] uppercase tracking-[0.12em] border-b border-[#cdd9dc]/30 pb-1">
                        <span className="text-[#0b3d4a]/60">Target pH</span>
                        <span className="text-[#0b3d4a] font-medium">{spec.ph}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-[family:var(--font-prompt)] uppercase tracking-[0.12em] border-b border-[#cdd9dc]/30 pb-1">
                        <span className="text-[#0b3d4a]/60">Key Active</span>
                        <span className="text-[#0b3d4a] font-medium">{spec.active}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-[family:var(--font-prompt)] font-medium text-[#0b3d4a]">
                          ฿{product.priceTHB.toLocaleString()}
                        </span>
                        {product.compareAtPriceTHB && (
                          <span className="font-[family:var(--font-prompt)] text-xs text-[#0b3d4a]/40 line-through">
                            ฿{product.compareAtPriceTHB.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="p-2 border border-[#0b3d4a] text-[#0b3d4a] hover:bg-[#0b3d4a] hover:text-[#f4f8f9] transition-colors"
                        aria-label="Add to formulations"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Lab Features */}
      <section className="py-24 bg-[#0b3d4a] text-[#f4f8f9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-[#cdd9dc]/20">
            <div className="pt-8 md:pt-0 md:pr-12">
              <Dna className="w-10 h-10 text-[#9cd6df] mb-6 mx-auto md:mx-0" />
              <h3 className="font-[family:var(--font-kanit)] text-xl font-medium mb-3">Science-Backed</h3>
              <p className="font-[family:var(--font-prompt)] text-sm text-[#f4f8f9]/70 font-light leading-relaxed">
                ทุกสูตรได้รับการทดสอบประสิทธิภาพด้วยเครื่องมือวิเคราะห์ระดับเซลล์ (In-vitro analysis) เพื่อผลลัพธ์ที่พิสูจน์ได้
              </p>
            </div>
            <div className="pt-8 md:pt-0 md:px-12">
              <TestTube className="w-10 h-10 text-[#9cd6df] mb-6 mx-auto md:mx-0" />
              <h3 className="font-[family:var(--font-kanit)] text-xl font-medium mb-3">Fragrance Free</h3>
              <p className="font-[family:var(--font-prompt)] text-sm text-[#f4f8f9]/70 font-light leading-relaxed">
                ปราศจากน้ำหอม สีสังเคราะห์ และสารก่อระคายเคือง 14 ชนิด พัฒนามาเพื่อผิวแพ้ง่าย (Dermatologically Tested)
              </p>
            </div>
            <div className="pt-8 md:pt-0 md:pl-12">
              <Activity className="w-10 h-10 text-[#9cd6df] mb-6 mx-auto md:mx-0" />
              <h3 className="font-[family:var(--font-kanit)] text-xl font-medium mb-3">Clinical Trials</h3>
              <p className="font-[family:var(--font-prompt)] text-sm text-[#f4f8f9]/70 font-light leading-relaxed">
                ทุกผลิตภัณฑ์มีรหัสทดสอบทางคลินิก (Clinical Trial ID) อ้างอิงผลลัพธ์กับอาสาสมัครในสภาพผิวที่แตกต่างกัน
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
