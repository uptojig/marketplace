'use client';
import React, { useState } from 'react';
import { Star, ChevronRight, Minus, Plus, Heart, Store, MessageCircle, ShieldCheck } from 'lucide-react';

interface ProductDetailInfo {
  id: string; // Product id
  name: string; // Product name
  price: number; // Current price
  originalPrice?: number; // Original price
  images: string[]; // List of image URLs
  soldCount: number; // Total sold
  rating: number; // Star rating
  reviewCount: number; // Number of reviews
}

interface StoreInfo {
  name: string; // Vendor store name
  followerCount: string; // e.g. "1.2M"
  isOfficial: boolean; // Is official Mall
}

export interface ProductDetailProps {
  product: ProductDetailInfo;
  storeConfig: StoreInfo;
  onAddToCart: () => void;
  onBuyNow: () => void;
  qty: number;
  onChangeQty: (q: number) => void;
  homeUrl: string;
  shopUrl: string;
}

export function ProductDetail({ product, storeConfig, onAddToCart, onBuyNow, qty, onChangeQty, homeUrl, shopUrl }: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(0);
  const images = product.images?.length ? product.images : [null];

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen pb-24 md:pb-8">
      
      {/* Breadcrumb - Desktop hidden mobile */}
      <div className="hidden md:flex max-w-[1200px] mx-auto px-4 py-4 text-xs text-[var(--shop-ink-muted)] items-center">
        <a href={homeUrl} className="hover:text-[var(--shop-primary)]">หน้าแรก</a>
        <ChevronRight size={14} className="mx-1" />
        <a href={shopUrl} className="hover:text-[var(--shop-primary)]">หมวดหมู่ทั้งหมด</a>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-[var(--shop-ink)] truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="max-w-[1200px] mx-auto sm:px-4">
        <div className="bg-white md:rounded-xl overflow-hidden border-b sm:border border-[var(--shop-border)] flex flex-col md:flex-row shadow-sm">
          
          {/* Gallery */}
          <div className="w-full md:w-5/12 flex-shrink-0">
             <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {images[activeImage] ? (
                  <img src={images[activeImage]} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                )}
             </div>
             <div className="hidden md:flex gap-2 p-4 overflow-x-auto hide-scrollbar">
               {images.map((img, idx) => (
                 <button 
                   key={idx} 
                   onMouseEnter={() => setActiveImage(idx)}
                   className={`w-16 h-16 rounded border-2 ${activeImage === idx ? 'border-[var(--shop-primary)]' : 'border-transparent'}`}
                 >
                    {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200"></div>}
                 </button>
               ))}
             </div>
          </div>

          {/* Info */}
          <div className="w-full md:w-7/12 p-4 md:p-6 lg:p-8 flex flex-col">
            <div className="mb-4">
              <h1 className="text-[var(--shop-ink)] text-lg md:text-xl font-bold leading-tight">
                {storeConfig.isOfficial && <span className="bg-[var(--shop-accent)] text-white text-[10px] px-1.5 py-0.5 rounded mr-2">Mall</span>}
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1 text-[var(--shop-primary)]">
                  <Star size={14} className="fill-current" />
                  <span className="font-bold border-b border-[var(--shop-primary)]">{product.rating.toFixed(1)}</span>
                </div>
                <div className="w-px h-3 bg-gray-300"></div>
                <div className="text-[var(--shop-ink-muted)]">ขายแล้ว <span className="text-[var(--shop-ink)] font-semibold">{product.soldCount}</span></div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-[var(--mega-highlight)] bg-opacity-50 p-4 border-l-4 border-[var(--shop-primary)] mb-6 -mx-4 md:mx-0">
               <div className="flex items-end gap-3 flex-wrap">
                 {product.originalPrice && (
                   <span className="text-sm text-[var(--shop-ink-muted)] line-through">฿{product.originalPrice.toLocaleString()}</span>
                 )}
                 <div className="text-[var(--shop-primary)] font-extrabold text-3xl">
                   ฿{product.price.toLocaleString()}
                 </div>
               </div>
            </div>

            {/* Quantiy */}
            <div className="flex items-center gap-6 mb-6">
              <span className="text-sm text-[var(--shop-ink-muted)] w-12">จำนวน</span>
              <div className="flex items-center border border-[var(--shop-border)] rounded overflow-hidden">
                <button onClick={() => onChangeQty(Math.max(1, qty - 1))} className="px-3 py-1.5 text-gray-500 hover:bg-gray-100"><Minus size={14}/></button>
                <input type="number" value={qty} readOnly className="w-12 text-center text-sm font-semibold border-x border-[var(--shop-border)] py-1.5 outline-none" />
                <button onClick={() => onChangeQty(qty + 1)} className="px-3 py-1.5 text-gray-500 hover:bg-gray-100"><Plus size={14}/></button>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex gap-4 mt-auto pt-6">
               <button onClick={onAddToCart} className="flex-1 bg-orange-50 text-[var(--shop-primary)] border border-[var(--shop-primary)] font-semibold py-3.5 rounded hover:bg-orange-100">
                 เพิ่มไปยังรถเข็น
               </button>
               <button onClick={onBuyNow} className="flex-1 bg-[var(--mega-gradient-btn)] text-white font-bold py-3.5 rounded hover:opacity-90">
                 ซื้อสินค้า
               </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Sticky Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--shop-border)] z-40 flex h-14">
        <div className="flex items-center text-xs text-[var(--shop-ink-muted)] px-1 divide-x divide-gray-100 h-full">
          <button className="flex flex-col items-center justify-center w-14 h-full gap-0.5 hover:bg-gray-50">
            <Store size={18} /> <span className="text-[9px]">ร้านค้า</span>
          </button>
        </div>
        <div className="flex-1 flex text-sm font-bold text-white h-full">
          <button onClick={onAddToCart} className="flex-1 bg-[var(--shop-primary)] opacity-80 h-full">เพิ่มรถเข็น</button>
          <button onClick={onBuyNow} className="flex-1 bg-[var(--shop-primary)] h-full">ซื้อเลย</button>
        </div>
      </div>
    </div>
  );
}
