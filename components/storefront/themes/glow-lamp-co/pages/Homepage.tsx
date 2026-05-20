'use client';
import React from 'react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { ArrowRight, Lightbulb, Sun, Moon, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface HomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
  products: Product[];
  categories: Category[];
}

function ProductCard({ product, store }: { product: Product; store: HomepageProps['store'] }) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const handleAddToCart = (e: React.MouseEvent) => {
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
    <Link 
      href={`/${store.slug}/product/${product.id}`}
      className="group block rounded-2xl bg-white border border-[#e2e8f0] overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 font-[family:var(--font-prompt)] relative"
    >
      <div className="aspect-[4/3] relative bg-[#f8fafc] overflow-hidden">
        {product.compareAtPriceTHB && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm font-[family:var(--font-kanit)]">
            Sale
          </div>
        )}

        <div className="flex h-full w-full relative z-0 group-hover:scale-105 transition-transform duration-700 ease-out">
          {/* Left Side (Cold / Off) */}
          <div className="w-1/2 h-full relative overflow-hidden border-r border-black/5">
            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md z-10 font-[family:var(--font-kanit)] flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_5px_rgba(147,197,253,0.8)]"></div>
              ปิดไฟ
            </div>
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={`${product.title} off`} 
                className="absolute inset-0 w-[200%] max-w-none h-full object-cover filter grayscale-[0.2] contrast-[1.05]"
                style={{ left: 0 }}
              />
            ) : (
              <div className="absolute inset-0 w-[200%] max-w-none h-full bg-[#e2e8f0] flex items-center justify-center">
                <Moon className="w-8 h-8 text-gray-400 -translate-x-[50%]" />
              </div>
            )}
          </div>
          
          {/* Right Side (Warm / On) */}
          <div className="w-1/2 h-full relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-[#f59e0b]/90 text-[#0f172a] text-[10px] px-2 py-1 rounded shadow-sm backdrop-blur-md z-10 font-[family:var(--font-kanit)] font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0f172a] animate-pulse"></div>
              เปิดไฟ
            </div>
            {product.imageUrl ? (
              <>
                <img 
                  src={product.imageUrl} 
                  alt={`${product.title} on`} 
                  className="absolute inset-0 w-[200%] max-w-none h-full object-cover filter sepia-[0.6] brightness-[1.15] contrast-[1.1]"
                  style={{ left: '-100%' }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(245,158,11,0.25)_0%,transparent_100%)] pointer-events-none mix-blend-overlay"></div>
              </>
            ) : (
              <div className="absolute inset-0 w-[200%] max-w-none h-full bg-[#fef3c7] flex items-center justify-center" style={{ left: '-100%' }}>
                <Sun className="w-8 h-8 text-[#f59e0b] translate-x-[50%]" />
              </div>
            )}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/0 via-white/50 to-white/0"></div>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 h-[140px]">
        {product.categoryName && (
          <span className="text-xs font-medium text-[#f59e0b] uppercase tracking-wider font-[family:var(--font-kanit)]">{product.categoryName}</span>
        )}
        <h3 className="font-semibold text-base text-[#0f172a] line-clamp-2 leading-snug group-hover:text-[#f59e0b] transition-colors">{product.title}</h3>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-[#0f172a] font-[family:var(--font-kanit)]">
              ฿{product.priceTHB.toLocaleString()}
            </span>
            {product.compareAtPriceTHB && (
              <span className="text-xs text-[#64748b] line-through decoration-red-500/50">
                ฿{product.compareAtPriceTHB.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="w-10 h-10 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] flex items-center justify-center hover:bg-[#f59e0b] hover:border-[#f59e0b] hover:text-[#0f172a] transition-all shadow-sm hover:shadow-md"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}

export function GlowLampCoHomepage({ store, products, categories }: HomepageProps) {
  const featuredProducts = products.slice(0, 4);
  const otherProducts = products.slice(4);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] selection:bg-[#f59e0b] selection:text-[#0f172a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0f172a] text-[#f8fafc] pt-24 pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#f59e0b]/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 font-[family:var(--font-kanit)]">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <Lightbulb className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-white">CRI 95+ LED Technology</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                แสงที่ดี <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f59e0b] to-amber-200">
                  เริ่มที่หลอดที่ใช่
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-[#e2e8f0] font-[family:var(--font-prompt)] max-w-xl leading-relaxed font-light">
                โคมไฟตั้งโต๊ะ โคมเพดาน และโคมข้างเตียง พร้อมหลอดไฟแอลอีดี CRI 95+ ทุกชิ้น เลือกอุณหภูมิแสงได้ก่อนสั่ง
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href={`/${store.slug}/category/desk-lamps`}
                  className="bg-[#f59e0b] text-[#0f172a] px-8 py-4 rounded-full font-bold text-lg hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2"
                >
                  ดูโคมตั้งโต๊ะ <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href={`/${store.slug}/about`}
                  className="bg-transparent border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  รู้จักแสงของเรา
                </Link>
              </div>
            </div>
            
            <div className="relative hidden lg:block h-[500px] w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black/40 group">
               <div className="absolute inset-0 bg-gradient-to-tr from-[#0f172a] via-transparent to-transparent z-10 opacity-80"></div>
               <img 
                  src="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=2070&auto=format&fit=crop" 
                  alt="Elegant desk lamp shedding warm light" 
                  className="absolute inset-0 w-full h-full object-cover filter brightness-90 contrast-125 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute bottom-8 left-8 right-8 z-20 bg-[#0f172a]/40 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-12 h-12 rounded-full bg-[#f59e0b] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                      <Sun className="w-6 h-6 text-[#0f172a]" />
                    </div>
                    <div>
                      <h4 className="font-bold font-[family:var(--font-kanit)] text-lg">โคมไฟตั้งโต๊ะและโคมเพดาน</h4>
                      <p className="text-sm text-white/80 font-[family:var(--font-prompt)]">ดีไซน์ตามแสง สัมผัสความอบอุ่นได้ทันที</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col gap-1 items-end">
                     <span className="text-xs text-white/60 font-[family:var(--font-kanit)] uppercase tracking-wider">Color Temp</span>
                     <span className="text-sm font-bold text-[#f59e0b] font-[family:var(--font-kanit)]">2700K Warm White</span>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#0f172a] font-[family:var(--font-kanit)] mb-2">
                คอลเลกชันขายดี
              </h2>
              <p className="text-[#64748b] font-[family:var(--font-prompt)]">โคมไฟที่ออกแบบมาเพื่อแสงสว่างที่สมบูรณ์แบบ</p>
            </div>
            <Link href={`/${store.slug}/products`} className="hidden sm:flex items-center gap-2 text-[#0f172a] font-semibold hover:text-[#f59e0b] transition-colors font-[family:var(--font-kanit)]">
              ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} store={store} />
            ))}
          </div>
        </section>
      )}

      {/* Categories Banner */}
      <section className="py-16 bg-white border-y border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href={`/${store.slug}/category/desk-lamps`} className="bg-[#0f172a] text-white p-8 rounded-2xl flex flex-col items-start justify-between relative overflow-hidden group min-h-[250px] shadow-lg">
              <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=1964&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/50 to-transparent"></div>
              <div className="relative z-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/20">
                 <Lightbulb className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl font-bold font-[family:var(--font-kanit)] mb-2 group-hover:text-[#f59e0b] transition-colors">โคมตั้งโต๊ะ</h3>
                <span className="inline-flex items-center gap-2 text-white/80 font-medium group-hover:text-white transition-colors text-sm">
                  เลือกชม <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
            
            <Link href={`/${store.slug}/category/ceiling-lamps`} className="bg-[#0f172a] text-white p-8 rounded-2xl flex flex-col items-start justify-between relative overflow-hidden group min-h-[250px] shadow-lg">
              <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/50 to-transparent"></div>
              <div className="relative z-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/20">
                 <Sun className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl font-bold font-[family:var(--font-kanit)] mb-2 group-hover:text-[#f59e0b] transition-colors">โคมเพดาน</h3>
                <span className="inline-flex items-center gap-2 text-white/80 font-medium group-hover:text-white transition-colors text-sm">
                  เลือกชม <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            <Link href={`/${store.slug}/category/bedside-lamps`} className="bg-[#f59e0b] text-[#0f172a] p-8 rounded-2xl flex flex-col items-start justify-between relative overflow-hidden group min-h-[250px] shadow-[0_10px_30px_rgba(245,158,11,0.2)]">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10 w-12 h-12 bg-[#0f172a]/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4">
                 <Moon className="w-6 h-6 text-[#0f172a]" />
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl font-bold font-[family:var(--font-kanit)] mb-2 group-hover:text-white transition-colors">โคมข้างเตียง</h3>
                <span className="inline-flex items-center gap-2 text-[#0f172a]/80 font-bold group-hover:text-white transition-colors text-sm">
                  เลือกชม <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Other Products */}
      {otherProducts.length > 0 && (
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-[#0f172a] font-[family:var(--font-kanit)] mb-4">
                สินค้าทั้งหมดของเรา
              </h2>
              <div className="w-16 h-1.5 bg-[#f59e0b] mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherProducts.map((p) => (
              <ProductCard key={p.id} product={p} store={store} />
            ))}
          </div>
        </section>
      )}

      {/* Feature Section */}
      <section className="bg-[#0f172a] text-[#f8fafc] py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full bg-[#f59e0b]/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-[#f59e0b]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <img 
                src="https://images.unsplash.com/photo-1507676184212-d0c30a3c37ce?q=80&w=2070&auto=format&fit=crop" 
                alt="Beautiful lighting in a home" 
                className="rounded-3xl shadow-2xl border border-white/10 relative z-10"
              />
            </div>
            <div className="space-y-8 font-[family:var(--font-prompt)]">
              <h2 className="text-4xl lg:text-5xl font-bold font-[family:var(--font-kanit)] text-white leading-tight">แสงที่ปรับเปลี่ยนตาม<br/><span className="text-[#f59e0b]">ชีวิตคุณ</span></h2>
              <p className="text-lg text-[#e2e8f0] leading-relaxed">
                เราเชื่อว่าแสงไม่ได้มีไว้แค่ให้ความสว่าง แต่มันคือการสร้างบรรยากาศและเติมเต็มอารมณ์ให้กับทุกพื้นที่ โคมไฟของเรามาพร้อมหลอดไฟ LED CRI 95+ ที่ให้สีสันสมจริงเหมือนแสงธรรมชาติ
              </p>
              <ul className="space-y-6 pt-4">
                <li className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]">
                    <Sun className="w-6 h-6 text-[#f59e0b]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">เลือกอุณหภูมิสีได้</h4>
                    <p className="text-sm text-gray-400 mt-1">Warm White, Cool White, หรือ Daylight</p>
                  </div>
                </li>
                <li className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]">
                    <Lightbulb className="w-6 h-6 text-[#f59e0b]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">หลอดไฟคุณภาพสูง</h4>
                    <p className="text-sm text-gray-400 mt-1">ถนอมสายตา ไร้แสงกระพริบ (Flicker-Free)</p>
                  </div>
                </li>
              </ul>
              <div className="pt-4">
                <Link href={`/${store.slug}/about`} className="inline-flex bg-white text-[#0f172a] px-8 py-4 rounded-full font-bold hover:bg-[#e2e8f0] transition-colors shadow-lg hover:shadow-xl items-center gap-2 font-[family:var(--font-kanit)]">
                  อ่านเรื่องราวของเรา <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
