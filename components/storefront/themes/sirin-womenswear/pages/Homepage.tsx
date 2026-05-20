'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
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

interface SirinHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: Product[];
  categories: { id: string; name: string }[];
}

export function SirinHomepage({ store, products, categories }: SirinHomepageProps) {
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

  const featuredProducts = products.slice(0, 2);
  const latestCollection = products.slice(2, 6);

  return (
    <div className="min-h-screen bg-[#fff5f7] text-[#3f0f24]">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518002171953-a080ee817e1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Model holding flowers" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#fff5f7] via-[#fff5f7]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="max-w-xl space-y-6">
            <p className="font-[family:var(--font-prompt)] text-[#be185d] tracking-widest uppercase text-sm font-semibold">
              Spring/Summer Lookbook
            </p>
            <h1 className="font-[family:var(--font-kanit)] font-extrabold text-5xl sm:text-6xl text-[#3f0f24] leading-tight">
              เดรสที่ใส่ทำงานก็ได้ <br /> ใส่ดินเนอร์ก็ได้
            </h1>
            <p className="font-[family:var(--font-prompt)] text-lg text-[#3f0f24]/80 leading-relaxed max-w-md font-normal">
              คอลเลกชันรายเดือนของเสื้อผ้าผู้หญิงสไตล์คอนเทมโพรารี ปรับให้พอดีกับสรีระสาวเอเชีย ใช้ผ้าซับในแบบไม่บาง
            </p>
            <div className="pt-4">
              <Link 
                href="#lookbook" 
                className="inline-flex items-center space-x-2 bg-[#be185d] text-white px-8 py-4 rounded-full font-[family:var(--font-prompt)] hover:bg-[#9d124c] transition-colors shadow-lg shadow-pink-900/20"
              >
                <span>ดู Lookbook เดือนนี้</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lookbook Collection */}
      <section id="lookbook" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-[family:var(--font-kanit)] font-extrabold text-4xl text-[#3f0f24] uppercase tracking-wide">
            The May Collection
          </h2>
          <p className="font-[family:var(--font-prompt)] font-normal text-[#3f0f24]/70 max-w-2xl mx-auto">
            สัมผัสความเรียบหรูที่ซ่อนเร้นในทุกรายละเอียด กับชุดที่ออกแบบมาเพื่อเพิ่มความมั่นใจในทุกๆ วันของคุณ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {featuredProducts.length > 0 && (
            <div className="md:col-span-7 relative group cursor-pointer overflow-hidden rounded-sm">
              <Link href={`/${store.slug}/products/${featuredProducts[0].id}`} className="block relative aspect-[3/4]">
                <img 
                  src={featuredProducts[0].imageUrl || `https://images.unsplash.com/photo-1550639524-a6f58345a013?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`} 
                  alt={featuredProducts[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#be185d]/0 group-hover:bg-[#be185d]/10 transition-colors duration-500" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#3f0f24]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-[family:var(--font-prompt)] text-white/80 text-sm mb-1">{featuredProducts[0].categoryName}</p>
                      <h3 className="font-[family:var(--font-kanit)] text-white text-2xl font-semibold">{featuredProducts[0].title}</h3>
                    </div>
                    <p className="font-[family:var(--font-prompt)] text-white text-xl">฿{featuredProducts[0].priceTHB.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={(e) => handleAddToCart(featuredProducts[0], e)}
                    className="mt-6 w-full bg-white text-[#be185d] py-3 rounded-full font-[family:var(--font-prompt)] flex items-center justify-center space-x-2 hover:bg-[#fce7f3] transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>เพิ่มลงตะกร้า</span>
                  </button>
                </div>
              </Link>
            </div>
          )}

          {featuredProducts.length > 1 && (
            <div className="md:col-span-5 space-y-8">
              <div className="p-8 bg-[#fce7f3] rounded-sm text-center">
                <p className="font-[family:var(--font-prompt)] text-[#be185d] text-sm uppercase tracking-widest mb-4 font-semibold">Designer's Note</p>
                <h3 className="font-[family:var(--font-kanit)] text-2xl text-[#3f0f24] font-semibold mb-4">Timeless Elegance</h3>
                <p className="font-[family:var(--font-prompt)] font-normal text-[#3f0f24]/70 leading-relaxed">
                  เราเชื่อว่าเสื้อผ้าที่ดีต้องไม่เพียงแต่สวยงาม แต่ต้องสวมใส่สบาย และตอบโจทย์ชีวิตประจำวัน คอลเลกชันนี้เน้นโทนสีที่สุภาพ ตัดเย็บด้วยผ้าเนื้อดี ทิ้งตัวสวย
                </p>
              </div>

              <div className="relative group cursor-pointer overflow-hidden rounded-sm">
                <Link href={`/${store.slug}/products/${featuredProducts[1].id}`} className="block relative aspect-[4/5]">
                  <img 
                    src={featuredProducts[1].imageUrl || `https://images.unsplash.com/photo-1515347619362-f1df4866c1b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`} 
                    alt={featuredProducts[1].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#be185d]/0 group-hover:bg-[#be185d]/10 transition-colors duration-500" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-[#3f0f24]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="font-[family:var(--font-kanit)] text-white text-xl font-semibold">{featuredProducts[1].title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <p className="font-[family:var(--font-prompt)] text-white/90">฿{featuredProducts[1].priceTHB.toLocaleString()}</p>
                      <button 
                        onClick={(e) => handleAddToCart(featuredProducts[1], e)}
                        className="bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm transition-colors text-white"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Grid Collection */}
      {latestCollection.length > 0 && (
        <section className="py-20 bg-white border-y border-[#fce7f3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12 text-center sm:text-left">
              <div className="w-full sm:w-auto">
                <p className="font-[family:var(--font-prompt)] text-[#fb7185] text-sm uppercase tracking-widest mb-2 font-normal">New Arrivals</p>
                <h2 className="font-[family:var(--font-kanit)] font-extrabold text-3xl text-[#3f0f24]">สินค้ามาใหม่</h2>
              </div>
              <Link href={`/${store.slug}`} className="hidden sm:flex items-center space-x-2 text-[#be185d] hover:text-[#9d124c] font-[family:var(--font-prompt)] font-normal">
                <span>ดูทั้งหมด</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {latestCollection.map((product) => (
                <div key={product.id} className="group relative">
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-sm bg-[#fce7f3] relative">
                    <Link href={`/${store.slug}/products/${product.id}`}>
                      <img
                        src={product.imageUrl || `https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80`}
                        alt={product.title}
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                    
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-full bg-[#3f0f24]/90 backdrop-blur-sm text-white py-3 rounded-full text-sm font-[family:var(--font-prompt)] hover:bg-[#be185d] transition-colors shadow-lg"
                      >
                        เพิ่มลงตะกร้า
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-xs font-[family:var(--font-prompt)] font-normal text-[#fb7185] mb-1">{product.categoryName || 'Dress'}</p>
                    <h3 className="text-sm font-[family:var(--font-kanit)] text-[#3f0f24] font-semibold group-hover:text-[#be185d] transition-colors">
                      <Link href={`/${store.slug}/products/${product.id}`}>
                        {product.title}
                      </Link>
                    </h3>
                    {/* Price reveals on hover logic via CSS */}
                    <div className="mt-2 h-6 flex items-center justify-center overflow-hidden relative">
                      <p className="text-xs font-[family:var(--font-prompt)] font-normal text-[#3f0f24]/50 tracking-widest uppercase transform transition-transform duration-300 group-hover:-translate-y-full absolute w-full text-center">
                        View Details
                      </p>
                      <p className="text-sm font-[family:var(--font-prompt)] font-medium text-[#be185d] absolute transform translate-y-full transition-transform duration-300 group-hover:translate-y-0 w-full text-center">
                        ฿{product.priceTHB.toLocaleString()}
                        {product.compareAtPriceTHB && (
                          <span className="ml-2 text-xs line-through text-[#3f0f24]/40">฿{product.compareAtPriceTHB.toLocaleString()}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 sm:hidden flex justify-center">
              <Link href={`/${store.slug}`} className="flex items-center space-x-2 text-[#be185d] border border-[#be185d] px-6 py-2 rounded-full font-[family:var(--font-prompt)] font-normal">
                <span>ดูทั้งหมด</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
      
      {/* Editorial Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 space-y-6">
            <h2 className="font-[family:var(--font-kanit)] font-extrabold text-4xl text-[#3f0f24] leading-tight">
              ความมั่นใจ<br />เริ่มต้นที่ความพอดี
            </h2>
            <p className="font-[family:var(--font-prompt)] font-normal text-lg text-[#3f0f24]/70 leading-relaxed">
              เราใส่ใจในทุกสัดส่วนของสาวเอเชีย แพทเทิร์นของเราถูกออกแบบและปรับแก้หลายครั้ง เพื่อให้ได้ทรงที่สวยงาม พรางจุดบกพร่อง และเน้นจุดเด่น ให้คุณสวยและมั่นใจในทุกท่วงท่า
            </p>
            <ul className="space-y-4 font-[family:var(--font-prompt)] font-normal text-[#3f0f24]/80 mt-8">
              <li className="flex items-center space-x-3">
                <span className="h-1.5 w-1.5 bg-[#fb7185] rounded-full block"></span>
                <span>เนื้อผ้าคัดสรรพิเศษ สวมใส่สบาย ไม่ยับง่าย</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="h-1.5 w-1.5 bg-[#fb7185] rounded-full block"></span>
                <span>ซับในเต็มตัวด้วยผ้าเนื้อนุ่ม ไม่บางและไม่ร้อน</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="h-1.5 w-1.5 bg-[#fb7185] rounded-full block"></span>
                <span>การตัดเย็บประณีต ระดับเดียวกับแบรนด์ชั้นนำ</span>
              </li>
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-[#fce7f3] translate-x-6 translate-y-6 rounded-sm z-0"></div>
              <img 
                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Brand philosophy" 
                className="relative z-10 w-full h-auto object-cover rounded-sm"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
