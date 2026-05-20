'use client';
import React, { useState } from 'react';
import { ArrowRight, Printer, Shield, Eye, ShoppingCart } from 'lucide-react';
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

export interface HomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: Product[];
  categories: string[];
}

export function Homepage({ store, products, categories }: HomepageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

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

  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter((p) => p.categoryName === selectedCategory);

  const heroProduct = products.find((p) => p.imageUrl) || products[0];

  return (
    <main className="bg-white text-black min-h-screen font-sans py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero Section - Split Screen layout */}
        <section className="border-4 border-black grid grid-cols-1 lg:grid-cols-12 rounded-none shadow-[8px_8px_0px_0px_#000000] overflow-hidden">
          
          {/* Left panel - Pure Black base */}
          <div className="lg:col-span-7 bg-black text-white p-8 sm:p-12 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-black">
            <div className="space-y-6">
              <div className="border-2 border-white px-3 py-1 w-fit text-[10px] font-bold tracking-widest uppercase font-[family:var(--font-google-sans)]">
                BRUTALIST GRAPHICS & PRINTS
              </div>
              <h1 className="font-[family:var(--font-google-sans)] font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tighter leading-none">
                BLOCK PRESS <br /> PRINT STUDIO
              </h1>
              <p className="text-sm font-medium text-gray-300 max-w-lg leading-relaxed">
                โรงพิมพ์จัดจำหน่ายงานภาพพิมพ์ โปสเตอร์ติดผนัง สไตล์สตรีท โมเดิร์น และอินดัสเทรียล อาร์ต พิมพ์สกรีนแบบจำกัดจำนวน บรรจุในท่อกระดาษหนาพิเศษ
              </p>
            </div>

            <div className="pt-8">
              <a
                href="#catalog-section"
                className="inline-flex items-center gap-2 bg-white text-black border-4 border-black px-8 py-3.5 font-bold uppercase tracking-widest text-xs transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
              >
                BROWSE ARCHIVE <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Right panel - Hero product preview */}
          <div className="lg:col-span-5 bg-[#f3f3f3] p-8 flex items-center justify-center">
            {heroProduct && (
              <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_#000000] max-w-xs w-full">
                <div className="aspect-square bg-[#e5e5e5] border-2 border-black overflow-hidden relative">
                  {heroProduct.imageUrl ? (
                    <img
                      src={heroProduct.imageUrl}
                      alt={heroProduct.title}
                      className="w-full h-full object-cover grayscale"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                      NO IMAGE AVAILABLE
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="truncate">
                    <h3 className="font-bold text-xs uppercase tracking-wider truncate">{heroProduct.title}</h3>
                    <span className="font-black text-sm">฿{heroProduct.priceTHB.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(heroProduct, e)}
                    className="p-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </section>

        {/* Value Prop Bento Block */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-4 border-black p-6 bg-white shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between">
            <div className="border-4 border-black bg-black text-white p-3 w-fit mb-4">
              <Printer size={20} />
            </div>
            <div>
              <h3 className="font-[family:var(--font-google-sans)] font-black text-sm uppercase tracking-wider">Heavyweight Art Paper</h3>
              <p className="text-xs font-medium text-gray-600 mt-2 leading-relaxed">
                ภาพพิมพ์สกรีนและโปสเตอร์ทั้งหมดใช้กระดาษอาร์ตหนา 250 แกรม ผิวด้านพิเศษ ไม่สะท้อนแสงไฟ
              </p>
            </div>
          </div>
          <div className="border-4 border-black p-6 bg-white shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between">
            <div className="border-4 border-black bg-black text-white p-3 w-fit mb-4">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-[family:var(--font-google-sans)] font-black text-sm uppercase tracking-wider">Rigid Tube Packaging</h3>
              <p className="text-xs font-medium text-gray-600 mt-2 leading-relaxed">
                จัดส่งด้วยกระบอกกระดาษแข็งความหนาพิเศษ ป้องกันมุมภาพบุบ ยับ หรือฉีกขาดระหว่างขนส่ง 100%
              </p>
            </div>
          </div>
          <div className="border-4 border-black p-6 bg-white shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between">
            <div className="border-4 border-black bg-black text-white p-3 w-fit mb-4">
              <Eye size={20} />
            </div>
            <div>
              <h3 className="font-[family:var(--font-google-sans)] font-black text-sm uppercase tracking-wider">Limited Edition Prints</h3>
              <p className="text-xs font-medium text-gray-600 mt-2 leading-relaxed">
                งานศิลปะจัดพิมพ์แบบจำกัดจำนวน ทุกภาพมีหมายเลขซีเรียลประทับเพื่อเป็นเอกลักษณ์เฉพาะตัว
              </p>
            </div>
          </div>
        </section>

        {/* Catalog Section with Category Filter Buttons */}
        <section id="catalog-section" className="space-y-6">
          
          {/* Header & Filter Row */}
          <div className="border-b-4 border-black pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="font-[family:var(--font-google-sans)] font-black text-3xl uppercase tracking-tighter">
                PRINT CATALOGUE
              </h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                Showing {filteredProducts.length} items in gallery
              </p>
            </div>
            
            {/* Category selectors as block buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 border-2 border-black text-xs font-extrabold tracking-widest uppercase transition-all shadow-[2px_2px_0px_0px_#000000] ${
                  selectedCategory === 'ALL'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                ALL
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 border-2 border-black text-xs font-extrabold tracking-widest uppercase transition-all shadow-[2px_2px_0px_0px_#000000] ${
                    selectedCategory === c
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="border-4 border-black py-16 text-center bg-gray-50 shadow-[4px_4px_0px_0px_#000000]">
              <span className="text-2xl block mb-2">⚫</span>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">No pieces found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border-4 border-black flex flex-col justify-between shadow-[4px_4px_0px_0px_#000000] rounded-none group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] transition-all"
                >
                  {/* Image container */}
                  <a href={`/stores/${store.slug}/products/${p.id}`} className="block relative aspect-[4/5] bg-gray-100 border-b-4 border-black overflow-hidden">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                        NO PREVIEW
                      </div>
                    )}
                    
                    {p.categoryName && (
                      <span className="absolute top-3 left-3 bg-black text-white border-2 border-black text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                        {p.categoryName}
                      </span>
                    )}
                  </a>

                  {/* Info block */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <a href={`/stores/${store.slug}/products/${p.id}`} className="block">
                        <h3 className="font-[family:var(--font-google-sans)] font-extrabold text-xs uppercase tracking-wider text-black line-clamp-2 leading-relaxed">
                          {p.title}
                        </h3>
                      </a>
                    </div>

                    <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between gap-2">
                      <div className="flex items-baseline">
                        <span className="font-[family:var(--font-google-sans)] font-black text-sm">
                          ฿{p.priceTHB.toLocaleString()}
                        </span>
                        {p.compareAtPriceTHB && (
                          <span className="font-[family:var(--font-google-sans)] text-[10px] text-gray-400 line-through ml-1.5">
                            ฿{p.compareAtPriceTHB.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(p, e)}
                        className="px-3 py-1.5 border-2 border-black bg-black text-white font-extrabold text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                      >
                        ADD TO BAG
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </section>

      </div>
    </main>
  );
}
