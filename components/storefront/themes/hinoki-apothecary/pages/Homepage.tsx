'use client';

import React from 'react';
import { useCart } from '@/lib/store/cart';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface HinokiHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  products: Product[];
  categories: any[];
}

export function HinokiHomepage({ store, products, categories }: HinokiHomepageProps) {
  const add = useCart((s) => s.add);

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
  };

  const stories = [
    {
      title: "บทที่ ๑ : กลิ่นดินหลังฝนตก",
      prose: "ในบ่ายวันอาทิตย์ที่ฝนเพิ่งขาดเม็ด กลิ่นของผืนดินที่อุ้มน้ำและใบไม้ที่เปียกชื้นลอยกรุ่นขึ้นมา มันเป็นกลิ่นของความเงียบสงบ กลิ่นของการเริ่มต้นใหม่ บางครั้งเราก็แค่ต้องการพื้นที่เล็กๆ ที่ให้ความรู้สึกเหมือนได้หลบซ่อนตัวจากความวุ่นวาย",
      quote: "ฝนตกเพื่อล้างบางสิ่ง และทิ้งบางอย่างไว้เสมอ"
    },
    {
      title: "บทที่ ๒ : แสงแดดลอดผ่านทิวสน",
      prose: "ความอบอุ่นที่แทรกตัวผ่านกิ่งก้านของต้นสนยักษ์ แสงสีทองที่ทาบทับลงบนเปลือกไม้ที่แห้งกร้าน กลิ่นยางไม้ที่ระเหยขึ้นมาเมื่อต้องความร้อน เป็นความทรงจำของการเดินทางไกล ที่ปลายทางไม่ใช่จุดหมาย แต่คือความสงบในใจ",
      quote: "บางครั้งเราต้องเดินเข้าไปในป่าลึก เพื่อค้นพบตัวเองที่หายไป"
    },
    {
      title: "บทที่ ๓ : หนังสือเก่าในห้องใต้หลังคา",
      prose: "ฝุ่นจางๆ ที่ลอยฟุ้งเมื่อพลิกหน้ากระดาษที่กรอบเหลือง กลิ่นของหมึกพิมพ์และเวลาที่ถูกกักเก็บไว้ในแผ่นกระดาษ ทุกหน้าต่างมีเรื่องเล่า ทุกบรรทัดมีลมหายใจของผู้เขียนซ่อนอยู่",
      quote: "เรื่องราวบางเรื่อง ไม่ได้ถูกเขียนขึ้นเพื่อให้อ่าน แต่เพื่อให้จดจำ"
    }
  ];

  return (
    <div className="bg-[#f6efe2] min-h-screen text-[#3f2e1e] font-[family:var(--font-prompt)] selection:bg-[#a87a4b] selection:text-[#f6efe2]">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden border-b border-[#3f2e1e]/10">
        <div className="absolute inset-0 bg-[#e6d5b8]/30"></div>
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
          <span className="text-[#a87a4b] tracking-[0.3em] text-xs uppercase font-medium mb-8">Hinoki Apothecary</span>
          <h1 className="text-5xl md:text-7xl font-light text-[#3f2e1e] mb-8 leading-tight tracking-wide">
            กลิ่นไม้สน<br/>หลังฝนตก
          </h1>
          <p className="text-lg md:text-xl text-[#3f2e1e]/80 font-light max-w-xl mx-auto mb-12 leading-relaxed">
            น้ำหอมและเทียนหอมเฉพาะกลุ่ม ทุกกลิ่นออกแบบรอบเรื่องสั้น 1 เรื่อง — อ่านได้ในหน้าสินค้า เลือกซื้อตามเรื่องที่ใช่
          </p>
          <button className="border-b-2 border-[#a87a4b] text-[#3f2e1e] pb-1 hover:text-[#a87a4b] transition-colors tracking-widest text-sm uppercase">
            อ่านกลิ่นแรก
          </button>
        </div>
      </section>

      {/* Storytelling Products */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-32">
          {products.map((product, index) => {
            const isEven = index % 2 === 0;
            const story = stories[index % stories.length];
            
            return (
              <div key={product.id} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-24 items-center`}>
                
                {/* Product Image */}
                <div className="w-full lg:w-1/2">
                  <div className="aspect-[4/5] relative bg-[#e6d5b8]/50 overflow-hidden group">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 mix-blend-multiply"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#3f2e1e]/20 font-serif italic">
                        {story.title}
                      </div>
                    )}
                    <div className="absolute inset-0 border border-[#3f2e1e]/10 m-4 pointer-events-none"></div>
                  </div>
                </div>

                {/* Narrative Text */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
                  <div className="mb-4">
                    <span className="text-[#a87a4b] text-xs tracking-widest uppercase font-medium">{product.categoryName || 'น้ำหอม'}</span>
                  </div>
                  
                  <h2 className="text-3xl font-light text-[#3f2e1e] mb-8 tracking-wide">
                    {product.title}
                  </h2>
                  
                  <div className="text-[#3f2e1e]/80 mb-10 leading-loose mx-auto lg:mx-0">
                    <p className="indent-8 text-justify">{story.prose}</p>
                    <blockquote className="border-l-2 border-[#a87a4b] pl-6 my-8 text-[#a87a4b] font-light italic text-lg text-left">
                      &quot;{story.quote}&quot;
                    </blockquote>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 border-t border-[#3f2e1e]/10 pt-8 mt-4">
                    <div className="flex flex-col">
                      {product.compareAtPriceTHB && (
                        <span className="text-[#3f2e1e]/40 line-through text-sm">
                          ฿{product.compareAtPriceTHB.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xl font-light text-[#3f2e1e]">
                        ฿{product.priceTHB.toLocaleString()}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="bg-[#3f2e1e] text-[#f6efe2] px-8 py-3 text-sm tracking-widest hover:bg-[#a87a4b] transition-colors w-full sm:w-auto"
                    >
                      หยิบใส่ตะกร้า
                    </button>
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>
      </section>

      {/* Epilogue / Manifesto */}
      <section className="py-32 bg-[#3f2e1e] text-[#f6efe2] text-center border-t border-[#a87a4b]/30">
        <div className="max-w-2xl mx-auto px-6">
          <span className="text-[#a87a4b] tracking-[0.2em] text-xs uppercase mb-6 block">บทส่งท้าย</span>
          <h2 className="text-3xl font-light mb-8 leading-relaxed">
            น้ำหอมและเทียนหอม<br/>ที่เริ่มจากเรื่องเล่า
          </h2>
          <p className="text-[#e6d5b8] font-light leading-loose text-lg opacity-90 text-justify indent-8">
            เราเชื่อว่ากลิ่นไม่ใช่เพียงสิ่งที่สัมผัสได้ด้วยจมูก แต่มันคือสะพานเชื่อมโยงความทรงจำและความรู้สึก ทุกกลิ่นที่เราปรุงแต่ง ถูกร้อยเรียงมาจากตัวอักษรและเรื่องราว เพื่อให้คุณได้สวมใส่มากกว่าความหอม แต่ได้สวมใส่เรื่องราวที่คุณหลงรัก
          </p>
        </div>
      </section>

    </div>
  );
}
