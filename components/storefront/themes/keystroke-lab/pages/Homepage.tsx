'use client';

import React from 'react';
import Link from 'next/link';
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

function getFakeSpecs(product: Product) {
  const isMouse = product.title.toLowerCase().includes('mouse') || product.title.toLowerCase().includes('เมาส์');
  const isSwitch = product.title.toLowerCase().includes('switch') || product.title.toLowerCase().includes('สวิตช์');
  
  if (isMouse) {
    return [
      { label: 'เซ็นเซอร์ / SENSOR', value: 'PAW3395' },
      { label: 'อัตราการส่งข้อมูล / POLLING', value: '4000 HZ' },
      { label: 'น้ำหนัก / WEIGHT', value: '55 G' },
      { label: 'สวิตช์ / SWITCH', value: 'HUANO BLUE' },
    ];
  } else if (isSwitch) {
    return [
      { label: 'ประเภท / TYPE', value: 'TACTILE' },
      { label: 'น้ำหนักกด / ACTUATION', value: '45 GF' },
      { label: 'น้ำหนักสุดทาง / BOTTOM OUT', value: '60 GF' },
      { label: 'ระยะกด / TRAVEL', value: '3.3 MM' },
    ];
  } else {
    return [
      { label: 'ขนาด / LAYOUT', value: '75%' },
      { label: 'การติดตั้ง / MOUNT', value: 'GASKET' },
      { label: 'อัตราการส่งข้อมูล / POLLING', value: '1000 HZ' },
      { label: 'สวิตช์ / SWITCH', value: 'HOT-SWAP' },
    ];
  }
}

export function KeystrokeLabHomepage({ store, products, categories }: HomepageProps) {
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
    <div className="min-h-screen bg-[#020617] text-[#e2e8f0] selection:bg-[#22d3ee] selection:text-[#020617]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#1e293b]">
        {/* Abstract background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border border-[#22d3ee]/30 bg-[#0f172a]/50 px-3 py-1 text-sm text-[#22d3ee] backdrop-blur-md mb-8 font-[family:var(--font-prompt)] tracking-[0.12em] uppercase">
            <span className="flex h-2 w-2 rounded-full bg-[#22d3ee] mr-2 animate-pulse"></span>
            SYS.READY
          </div>
          
          <h1 className="font-[family:var(--font-prompt)] text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            เปรียบเทียบสวิตช์ก่อนซื้อ
          </h1>
          
          <p className="font-[family:var(--font-kanit)] text-lg md:text-xl text-[#94a3b8] max-w-2xl mb-10 leading-relaxed font-light">
            คีย์บอร์ดเมคคานิคอลและเมาส์ gaming เปรียบเทียบ spec ละเอียดทุกรุ่น ฟังเสียงสวิตช์ออนไลน์ก่อนซื้อ
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href={`/${store.slug}/products`}
              className="px-8 py-3 bg-[#22d3ee] text-[#020617] font-[family:var(--font-prompt)] font-bold uppercase tracking-[0.12em] hover:bg-white transition-all transform hover:scale-105"
            >
              เปรียบเทียบสวิตช์
            </Link>
          </div>
        </div>
      </section>

      {/* Products Matrix */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12 border-b border-[#1e293b] pb-4">
            <h2 className="font-[family:var(--font-prompt)] text-xl font-bold text-white uppercase tracking-[0.12em] flex items-center">
              <span className="text-[#22d3ee] mr-2">/</span> DATABASE.ALL
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link 
                key={product.id} 
                href={`/${store.slug}/products/${product.id}`}
                className="group block bg-[#0f172a] border border-[#1e293b] hover:border-[#22d3ee] transition-colors relative overflow-hidden"
              >
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#22d3ee] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#22d3ee] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#22d3ee] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#22d3ee] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-[10px] font-[family:var(--font-prompt)] text-[#64748b] tracking-[0.12em] uppercase">
                      ID: {product.id.slice(-6)}
                    </div>
                    {product.categoryName && (
                      <div className="text-[10px] font-[family:var(--font-prompt)] bg-[#1e293b] text-[#22d3ee] px-2 py-0.5 tracking-[0.12em] uppercase">
                        {product.categoryName}
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-[family:var(--font-prompt)] text-lg font-medium text-white mb-6 line-clamp-2">
                    {product.title}
                  </h3>
                  
                  {/* Spec Rack Instead of Image */}
                  <div className="flex-grow space-y-1 mb-6">
                    {getFakeSpecs(product).map((spec, i) => (
                      <div key={i} className="flex justify-between items-center py-1 border-b border-[#1e293b]/50">
                        <span className="font-[family:var(--font-prompt)] text-xs text-[#64748b] tracking-[0.12em] uppercase">
                          {spec.label}
                        </span>
                        <span className="font-[family:var(--font-prompt)] text-xs text-[#e2e8f0] tracking-[0.12em] tabular-nums uppercase">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-end justify-between mt-auto pt-4">
                    <div className="flex flex-col">
                      {product.compareAtPriceTHB && (
                        <span className="font-[family:var(--font-prompt)] text-xs text-[#64748b] line-through tracking-[0.12em] tabular-nums">
                          THB {product.compareAtPriceTHB.toLocaleString()}
                        </span>
                      )}
                      <span className="font-[family:var(--font-prompt)] text-[#22d3ee] font-bold tracking-[0.12em] tabular-nums">
                        THB {product.priceTHB.toLocaleString()}
                      </span>
                    </div>
                    
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="bg-[#1e293b] hover:bg-[#22d3ee] text-[#e2e8f0] hover:text-[#020617] p-2 transition-colors border border-[#1e293b] group-hover:border-[#22d3ee]/50"
                      aria-label="Add to cart"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories Command Line Style */}
      <section className="py-20 border-t border-[#1e293b] bg-[#020617]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="font-[family:var(--font-prompt)] text-sm text-[#64748b] mb-8">
            <span className="text-[#22d3ee]">&gt;</span> ls -l /categories
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/${store.slug}/categories/${category.slug}`}
                className="group p-4 border border-[#1e293b] hover:border-[#22d3ee] bg-[#0f172a] transition-all flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span className="font-[family:var(--font-prompt)] text-[#64748b] mr-3 group-hover:text-[#22d3ee]">d</span>
                  <span className="font-[family:var(--font-prompt)] text-[#e2e8f0] tracking-[0.12em] uppercase text-sm group-hover:text-white">
                    {category.name}
                  </span>
                </div>
                <span className="font-[family:var(--font-prompt)] text-[#64748b] group-hover:text-[#22d3ee] text-xs">
                  [DIR]
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
