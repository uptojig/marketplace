'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Scissors, ShieldCheck, HeartHandshake } from 'lucide-react';
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

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ReclaimLeatherHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
  products: Product[];
  categories: Category[];
}

export function ReclaimLeatherHomepage({ store, products, categories }: ReclaimLeatherHomepageProps) {
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

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f4ead8] text-[#2a1a09] selection:bg-[#c9974b] selection:text-[#f4ead8]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden border-b-[8px] border-[#5b3a1e]">
        {/* Subtle background pattern - stitching */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2a1a09 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e6d7b8] border border-[#5b3a1e] rounded-full text-[#5b3a1e] font-[family:var(--font-kanit)] text-sm font-semibold tracking-wide mb-6">
                <Scissors size={14} /> <span>Handcrafted in Bangkok</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold font-[family:var(--font-prompt)] text-[#2a1a09] leading-[1.1] mb-6 tracking-tight">
                เศษหนังจากโรงงาน <br/>
                <span className="text-[#5b3a1e] relative inline-block">
                  ที่เราเย็บมือทุกใบ
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#c9974b]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" strokeLinecap="round" strokeDasharray="4 4" />
                  </svg>
                </span>
              </h1>
              <p className="text-xl text-[#2a1a09]/80 font-[family:var(--font-kanit)] leading-relaxed mb-10 max-w-lg">
                กระเป๋าสะพายข้าง วอลเล็ต และเครื่องหนังจากเศษหนัง vegetable-tanned จากโรงงานในกรุงเทพ เย็บมือทุกใบ ใช้ทนได้ 10 ปี
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={`/stores/${store.slug}/category/bags`} className="inline-flex items-center justify-center px-8 py-4 bg-[#5b3a1e] text-[#f4ead8] font-[family:var(--font-prompt)] font-semibold text-lg hover:bg-[#2a1a09] transition-all transform hover:-translate-y-1 shadow-[4px_4px_0px_#c9974b] hover:shadow-[6px_6px_0px_#c9974b] border-2 border-[#2a1a09]">
                  ดูกระเป๋าสะพายข้าง
                </Link>
                <Link href={`/stores/${store.slug}/about`} className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-[#5b3a1e] font-[family:var(--font-prompt)] font-semibold text-lg hover:bg-[#e6d7b8] transition-colors border-2 border-[#5b3a1e]">
                  เรื่องราวของเรา
                </Link>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="aspect-[4/5] bg-[#e6d7b8] border-4 border-[#5b3a1e] p-2 rotate-3 transform hover:rotate-0 transition-transform duration-500 overflow-hidden shadow-2xl relative">
                {/* Artisan threading needle image */}
                <div className="w-full h-full bg-[#2a1a09]/10 relative group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606114421685-6101c775087a?q=80&w=1471&auto=format&fit=crop')] bg-cover bg-center mix-blend-multiply group-hover:scale-105 transition-transform duration-700"></div>
                  <div className="absolute bottom-4 left-4 right-4 bg-[#f4ead8]/90 p-4 border-2 border-[#5b3a1e] border-dashed backdrop-blur-sm">
                    <p className="font-[family:var(--font-prompt)] font-bold text-[#5b3a1e] flex items-center gap-2">
                      <HeartHandshake size={18} /> เราชุบชีวิตเศษหนัง
                    </p>
                  </div>
                </div>
              </div>
              {/* Decorative thread elements */}
              <svg className="absolute -top-12 -right-12 w-32 h-32 text-[#c9974b] opacity-80" viewBox="0 0 100 100" fill="none">
                <path d="M10,90 Q50,10 90,90" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
                <path d="M20,90 Q50,30 80,90" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
                <path d="M30,90 Q50,50 70,90" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 bg-[#5b3a1e] text-[#f4ead8] border-b-[8px] border-[#2a1a09]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border-2 border-[#c9974b]/30 bg-[#2a1a09]/20 rounded-lg">
              <Scissors className="w-12 h-12 mx-auto mb-4 text-[#c9974b]" />
              <h3 className="font-[family:var(--font-prompt)] font-bold text-xl mb-2">เย็บมือทุกฝีเข็ม</h3>
              <p className="font-[family:var(--font-kanit)] text-[#e6d7b8] text-sm">แข็งแรงกว่าเครื่องจักร ด้วยเทคนิค Saddle Stitch</p>
            </div>
            <div className="p-6 border-2 border-[#c9974b]/30 bg-[#2a1a09]/20 rounded-lg">
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-[#c9974b]" />
              <h3 className="font-[family:var(--font-prompt)] font-bold text-xl mb-2">Repair-for-life</h3>
              <p className="font-[family:var(--font-kanit)] text-[#e6d7b8] text-sm">รับประกันตลอดอายุการใช้งาน ส่งซ่อมได้เสมอ</p>
            </div>
            <div className="p-6 border-2 border-[#c9974b]/30 bg-[#2a1a09]/20 rounded-lg">
              <HeartHandshake className="w-12 h-12 mx-auto mb-4 text-[#c9974b]" />
              <h3 className="font-[family:var(--font-prompt)] font-bold text-xl mb-2">รักษ์โลก</h3>
              <p className="font-[family:var(--font-kanit)] text-[#e6d7b8] text-sm">ใช้เศษหนังคุณภาพดีจากโรงงาน ลดขยะให้เป็นศูนย์</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold font-[family:var(--font-prompt)] text-[#2a1a09] mb-3">คอลเลกชันล่าสุด</h2>
            <p className="text-lg font-[family:var(--font-kanit)] text-[#5b3a1e]">แต่ละใบมีลวดลายและสีที่เป็นเอกลักษณ์</p>
          </div>
          <Link href={`/stores/${store.slug}/products`} className="hidden md:inline-flex items-center gap-2 font-[family:var(--font-prompt)] font-bold text-[#5b3a1e] hover:text-[#c9974b] transition-colors group">
            ดูทั้งหมด <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <Link key={product.id} href={`/stores/${store.slug}/products/${product.id}`} className="group block bg-white border-2 border-[#5b3a1e] hover:-translate-y-2 transition-all duration-300 shadow-[4px_4px_0px_#e6d7b8] hover:shadow-[8px_8px_0px_#5b3a1e]">
              <div className="aspect-square bg-[#f4ead8] relative overflow-hidden border-b-2 border-[#5b3a1e]">
                {/* Repair-for-life Badge */}
                <div className="absolute top-3 right-3 z-20 bg-[#2a1a09] text-[#c9974b] text-[10px] font-bold px-2 py-1 flex items-center gap-1 font-[family:var(--font-prompt)] uppercase tracking-wider shadow-sm border border-[#c9974b]/30">
                  <ShieldCheck size={12} /> Repair-for-life
                </div>

                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#e6d7b8] text-[#5b3a1e] font-[family:var(--font-prompt)] opacity-50 relative">
                    <span className="z-10">No Image</span>
                    {/* Placeholder stitching closeup */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590874981180-2a8684d00924?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
                  </div>
                )}

                {/* Quick Add Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-[#2a1a09]/80 to-transparent flex justify-center z-10">
                  <button 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-full py-3 bg-[#c9974b] text-[#2a1a09] font-[family:var(--font-prompt)] font-bold uppercase tracking-wider hover:bg-[#f4ead8] transition-colors border-2 border-[#2a1a09] shadow-[2px_2px_0px_#2a1a09]"
                  >
                    ใส่ตะกร้า
                  </button>
                </div>
              </div>

              <div className="p-5 bg-[#f4ead8] relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PSc0Jz48cmVjdCB3aWR0aD0nNScgaGVpZ2h0PSc0JyBmaWxsPSdibGFjaycgZmlsbC1vcGFjaXR5PScwLjInLz48L3N2Zz4=')] bg-repeat-x"></div>
                <div className="text-xs font-[family:var(--font-kanit)] text-[#5b3a1e]/70 mb-2 mt-2 uppercase tracking-widest">
                  {product.categoryName || 'Leather Goods'}
                </div>
                <h3 className="font-[family:var(--font-prompt)] font-bold text-[#2a1a09] text-lg mb-2 line-clamp-1 group-hover:text-[#5b3a1e] transition-colors">
                  {product.title}
                </h3>
                <div className="flex items-end gap-3">
                  <span className="font-[family:var(--font-prompt)] font-bold text-xl text-[#5b3a1e]">
                    ฿{product.priceTHB.toLocaleString()}
                  </span>
                  {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB && (
                    <span className="font-[family:var(--font-kanit)] text-[#2a1a09]/40 line-through text-sm mb-0.5">
                      ฿{product.compareAtPriceTHB.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <Link href={`/stores/${store.slug}/products`} className="inline-flex items-center gap-2 font-[family:var(--font-prompt)] font-bold text-[#f4ead8] bg-[#5b3a1e] px-6 py-3 border-2 border-[#2a1a09] shadow-[4px_4px_0px_#c9974b]">
            ดูทั้งหมด <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-[#e6d7b8] border-y-[8px] border-[#5b3a1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f4ead8] border-4 border-[#2a1a09] shadow-[12px_12px_0px_#5b3a1e] p-8 md:p-16 relative">
            {/* Corner pins */}
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-[#2a1a09]"></div>
            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#2a1a09]"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-[#2a1a09]"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-[#2a1a09]"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-square border-2 border-[#5b3a1e] overflow-hidden hidden md:block">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1452800185063-6db5e12b8e2e?q=80&w=1412&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-125 sepia-[0.3]"></div>
                <div className="absolute inset-0 border-8 border-transparent border-dashed border-t-[#c9974b] border-l-[#c9974b] m-4 pointer-events-none opacity-50"></div>
              </div>
              
              <div>
                <h2 className="text-4xl font-bold font-[family:var(--font-prompt)] text-[#2a1a09] mb-6">
                  ทำไมต้องเป็น <br/> <span className="text-[#c9974b] underline decoration-[#5b3a1e] decoration-4 underline-offset-8">เศษหนัง</span> ?
                </h2>
                <div className="space-y-4 font-[family:var(--font-kanit)] text-[#2a1a09]/80 text-lg">
                  <p>
                    โรงงานผลิตเครื่องหนังขนาดใหญ่ มักมีเศษหนังที่เหลือจากการตัดแพทเทิร์น ซึ่งเป็นหนังคุณภาพสูง (Vegetable-Tanned) แต่อาจมีขนาดเล็กหรือมีรอยย่นตามธรรมชาติ
                  </p>
                  <p>
                    เราเชื่อว่าร่องรอยเหล่านั้นคือ 'เสน่ห์' เราจึงรับซื้อเศษหนังเหล่านั้นมาออกแบบใหม่ ตัดเย็บด้วยมือทีละชิ้นด้วยเทคนิค Saddle Stitch ซึ่งทนทานกว่าการใช้จักรเย็บ
                  </p>
                  <p className="font-semibold text-[#5b3a1e]">
                    ทุกชิ้นจึงมีเอกลักษณ์เฉพาะตัว และมีใบเดียวในโลก
                  </p>
                </div>
                <Link href={`/stores/${store.slug}/about`} className="inline-block mt-8 font-[family:var(--font-prompt)] font-bold text-[#5b3a1e] border-b-2 border-[#c9974b] pb-1 hover:text-[#2a1a09] hover:border-[#2a1a09] transition-colors">
                  อ่านเรื่องราวของเราทั้งหมด
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
