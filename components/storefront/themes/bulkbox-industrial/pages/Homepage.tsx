'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { ShoppingCart, FileText, PackageSearch, Package, TrendingDown, ChevronRight, ShieldCheck, Factory, HardHat, Cog, Truck } from 'lucide-react';

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
  categories: { id: string; name: string; slug: string }[];
}

export function BulkboxHomepage({ store, products, categories }: HomepageProps) {
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

  // Helper to generate fake MOQ tiers based on base price
  const getPricingTiers = (basePrice: number) => {
    return [
      { min: 50, price: basePrice, leadTime: '2-3 วัน' },
      { min: 500, price: Math.floor(basePrice * 0.9), leadTime: '5-7 วัน' },
      { min: 2000, price: Math.floor(basePrice * 0.82), leadTime: '14-21 วัน' },
    ];
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-[family:var(--font-prompt)] text-[#0f172a]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white relative overflow-hidden">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#0284c7]/20 border border-[#0284c7]/50 text-[#38bdf8] text-xs font-bold tracking-wider mb-8 font-[family:var(--font-kanit)]">
              <ShieldCheck className="w-4 h-4" /> B2B WHOLESALE PLATFORM
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-[family:var(--font-kanit)] leading-tight mb-6">
              ราคาขายส่งสำหรับธุรกิจ <br className="hidden md:block"/> <span className="text-[#38bdf8]">ตามจำนวนที่สั่ง</span>
            </h1>
            <p className="text-xl text-[#cbd5e1] mb-10 max-w-2xl leading-relaxed">
              อะไหล่อุตสาหกรรม สกรู ลวด น็อต และอุปกรณ์ติดตั้ง ขายส่งให้ธุรกิจ ระบบ pricing tier ตามจำนวน เริ่มขั้นต่ำ 50 ชิ้น
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-8 py-4 rounded-md font-bold font-[family:var(--font-kanit)] text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0284c7]/20">
                <FileText className="w-5 h-5" /> ขอใบเสนอราคา
              </button>
              <button className="bg-transparent border-2 border-[#cbd5e1] hover:border-white text-white px-8 py-4 rounded-md font-bold font-[family:var(--font-kanit)] text-lg transition-all flex items-center justify-center gap-2">
                <PackageSearch className="w-5 h-5" /> ดูแคตตาล็อกสินค้า
              </button>
            </div>
          </div>
        </div>
        
        {/* Abstract industrial shapes in background */}
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none hidden lg:block">
          <Cog className="w-96 h-96 -mr-24 -mb-24 animate-[spin_60s_linear_infinite]" />
        </div>
      </section>

      {/* Trust Bar */}
      <div className="border-b border-[#cbd5e1] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-medium text-[#475569]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#e0f2fe] text-[#0284c7] rounded flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <span>ราคาถูกลงตาม<br/>Volume Tier</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#e0f2fe] text-[#0284c7] rounded flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <span>ขั้นต่ำเพียง 50 ชิ้น<br/>ทดลองตลาดได้</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#e0f2fe] text-[#0284c7] rounded flex items-center justify-center shrink-0">
                <Factory className="w-5 h-5" />
              </div>
              <span>มาตรฐานโรงงาน<br/>รองรับ QC 100%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#e0f2fe] text-[#0284c7] rounded flex items-center justify-center shrink-0">
                <HardHat className="w-5 h-5" />
              </div>
              <span>มีผู้เชี่ยวชาญ<br/>ให้คำปรึกษาสเปค</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold font-[family:var(--font-kanit)] text-[#0f172a] uppercase tracking-tight">รายการสินค้าอุตสาหกรรม (Industrial Supply)</h2>
            <p className="text-[#64748b] mt-2">เลือกสินค้าเพื่อดูโครงสร้างราคาตามปริมาณ (Pricing Tiers)</p>
          </div>
          <Link href={`/stores/${store.slug}/products`} className="hidden sm:flex items-center gap-1 text-[#0284c7] font-semibold hover:text-[#0369a1] transition-colors">
            ดูรายการทั้งหมด <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* B2B Table Layout for Products */}
        <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-sm overflow-hidden">
          {products.map((product, idx) => {
            const tiers = getPricingTiers(product.priceTHB);
            
            return (
              <div key={product.id} className={`flex flex-col lg:flex-row border-b border-[#cbd5e1] last:border-0 hover:bg-[#f8fafc] transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]/50'}`}>
                {/* Product Info */}
                <div className="p-6 lg:w-1/3 flex gap-4 lg:border-r border-[#cbd5e1]">
                  <div className="w-24 h-24 bg-white border border-[#e2e8f0] rounded flex items-center justify-center shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-10 h-10 text-[#cbd5e1]" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-xs font-semibold text-[#0284c7] mb-1">{product.categoryName || 'General Industrial'}</span>
                    <Link href={`/stores/${store.slug}/products/${product.id}`} className="font-[family:var(--font-kanit)] font-bold text-lg text-[#0f172a] hover:text-[#0284c7] line-clamp-2 leading-tight">
                      {product.title}
                    </Link>
                    <span className="text-xs text-[#64748b] mt-1 font-mono">SKU: IND-{product.id.substring(0,6).toUpperCase()}</span>
                  </div>
                </div>

                {/* Pricing Tiers Table */}
                <div className="p-0 lg:w-7/12 grid grid-cols-3 divide-x divide-[#e2e8f0]">
                  {tiers.map((tier, tIdx) => (
                    <div key={tIdx} className={`p-4 flex flex-col justify-center items-center text-center ${tIdx === tiers.length - 1 ? 'bg-[#e0f2fe]/30' : ''}`}>
                      <div className="text-xs font-medium text-[#64748b] mb-1">ขั้นต่ำ (MOQ)</div>
                      <div className="font-bold text-[#0f172a] mb-2">{tier.min.toLocaleString()}+ ชิ้น</div>
                      
                      <div className="text-xs font-medium text-[#64748b] mb-1">ราคา/ชิ้น</div>
                      <div className="text-xl font-[family:var(--font-kanit)] font-bold text-[#0284c7] mb-2">฿{tier.price.toLocaleString()}</div>
                      
                      <div className="text-xs text-[#94a3b8] flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Lead Time: {tier.leadTime}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-6 lg:w-1/12 flex lg:flex-col justify-center items-center gap-3 lg:border-l border-[#cbd5e1] bg-white">
                   <button 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white p-3 rounded-md flex justify-center items-center transition-colors shadow-sm"
                    title="เพิ่มลงตะกร้า (ราคากลาง)"
                   >
                     <ShoppingCart className="w-5 h-5" />
                   </button>
                   <button 
                    className="w-full bg-white border border-[#cbd5e1] hover:border-[#0284c7] text-[#0f172a] hover:text-[#0284c7] p-3 rounded-md flex justify-center items-center transition-colors"
                    title="ขอใบเสนอราคา"
                   >
                     <FileText className="w-5 h-5" />
                   </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center sm:hidden">
          <Link href={`/stores/${store.slug}/products`} className="flex items-center gap-2 bg-white border border-[#cbd5e1] px-6 py-3 rounded text-[#0f172a] font-semibold w-full justify-center">
            ดูรายการสินค้าทั้งหมด <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </main>

      {/* Information Section */}
      <section className="bg-white border-t border-[#cbd5e1] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-8 lg:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold font-[family:var(--font-kanit)] text-[#0f172a] mb-6">รับเงื่อนไขเครดิต 30-60 วัน สำหรับลูกค้านิติบุคคล</h2>
                <p className="text-[#475569] leading-relaxed mb-8">
                  Bulkbox Industrial เข้าใจกระบวนการจัดซื้อของโรงงานอุตสาหกรรม เรามีระบบเครดิตเทอมสำหรับบริษัทที่ผ่านการประเมิน พร้อมระบบจัดส่งที่ตรงเวลา รองรับการออกใบกำกับภาษีเต็มรูปแบบ
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-[#0f172a] font-medium">
                    <div className="w-6 h-6 rounded-full bg-[#0284c7] text-white flex items-center justify-center shrink-0">1</div>
                    สมัครสมาชิกระดับนิติบุคคล
                  </li>
                  <li className="flex items-center gap-3 text-[#0f172a] font-medium">
                    <div className="w-6 h-6 rounded-full bg-[#0284c7] text-white flex items-center justify-center shrink-0">2</div>
                    ยื่นเอกสาร ภ.พ.20 และหนังสือรับรองบริษัท
                  </li>
                  <li className="flex items-center gap-3 text-[#0f172a] font-medium">
                    <div className="w-6 h-6 rounded-full bg-[#0284c7] text-white flex items-center justify-center shrink-0">3</div>
                    ทราบผลอนุมัติวงเงินภายใน 48 ชั่วโมง
                  </li>
                </ul>
                <button className="bg-[#0f172a] hover:bg-[#1e293b] text-white px-6 py-3 rounded font-bold font-[family:var(--font-kanit)] transition-colors">
                  สมัครบัญชีธุรกิจ (Corporate Account)
                </button>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-tr from-[#e2e8f0] to-white rounded-2xl border border-[#cbd5e1] flex items-center justify-center p-8 shadow-inner relative overflow-hidden">
                   {/* Abstract representation of a dashboard/document */}
                   <div className="w-full h-full bg-white rounded shadow-sm border border-[#cbd5e1] p-6 flex flex-col gap-4 relative z-10">
                      <div className="w-1/3 h-4 bg-[#e2e8f0] rounded"></div>
                      <div className="w-full h-px bg-[#f1f5f9]"></div>
                      <div className="flex justify-between items-center">
                        <div className="w-1/4 h-3 bg-[#e2e8f0] rounded"></div>
                        <div className="w-1/6 h-3 bg-[#e2e8f0] rounded"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="w-1/3 h-3 bg-[#e2e8f0] rounded"></div>
                        <div className="w-1/5 h-3 bg-[#e2e8f0] rounded"></div>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-1/4 h-3 bg-[#e2e8f0] rounded"></div>
                        <div className="w-1/4 h-3 bg-[#e2e8f0] rounded"></div>
                      </div>
                      <div className="w-full h-24 bg-[#f8fafc] rounded border border-[#e2e8f0] flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-[#0284c7] opacity-50" />
                      </div>
                      <div className="mt-auto w-1/3 h-8 bg-[#0284c7] rounded self-end"></div>
                   </div>
                   {/* Decorative elements */}
                   <div className="absolute top-10 -right-4 w-24 h-24 bg-[#0284c7] rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
                   <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#0f172a] rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
